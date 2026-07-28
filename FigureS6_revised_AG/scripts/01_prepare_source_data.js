const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = path.resolve(__dirname, "..");
const inputDir = path.join(root, "inputs");
const outDir = path.join(root, "source_data");
const qcDir = path.join(root, "QC");

function splitCsv(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function readCsv(file) {
  const lines = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const header = splitCsv(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = splitCsv(line);
    return Object.fromEntries(header.map((h, i) => [h, vals[i] ?? ""]));
  });
}

function writeTsv(file, rows, cols) {
  const body = [cols.join("\t")].concat(
    rows.map((row) => cols.map((c) => row[c] ?? "").join("\t"))
  );
  fs.writeFileSync(file, body.join("\n") + "\n", "utf8");
}

function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
}

function sd(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
}

function rankAverage(xs) {
  const order = xs.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Float64Array(xs.length);
  let a = 0;
  while (a < order.length) {
    let b = a + 1;
    while (b < order.length && order[b].v === order[a].v) b++;
    const rank = (a + 1 + b) / 2;
    for (let k = a; k < b; k++) ranks[order[k].i] = rank;
    a = b;
  }
  return Array.from(ranks);
}

function pearson(x, y) {
  const mx = mean(x), my = mean(y);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < x.length; i++) {
    const a = x[i] - mx, b = y[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  return num / Math.sqrt(dx * dy);
}

async function prepareMonocle() {
  const genes = readCsv(path.join(inputDir, "S4E_monocle2_genes.csv"));
  const klf4Zero = genes.findIndex((r) => String(r.gene).toUpperCase() === "KLF4");
  if (klf4Zero < 0) throw new Error("KLF4 not found in Monocle2 gene list.");
  const klf4Col = klf4Zero + 1;
  const cells = readCsv(path.join(inputDir, "S4E_monocle2_coordinates_pseudotime.csv"));
  const counts = new Float64Array(cells.length);
  const mtx = path.join(inputDir, "S4E_monocle2_counts_cells_by_genes.mtx");
  const rl = readline.createInterface({ input: fs.createReadStream(mtx), crlfDelay: Infinity });
  let dimsSeen = false;
  for await (const line of rl) {
    if (!line || line[0] === "%") continue;
    const p = line.trim().split(/\s+/);
    if (!dimsSeen) {
      dimsSeen = true;
      if (+p[0] !== cells.length || +p[1] !== genes.length) {
        throw new Error(`Matrix dimensions ${p[0]}x${p[1]} do not match metadata.`);
      }
      continue;
    }
    const row = +p[0];
    const col = +p[1];
    if (col === klf4Col) counts[row - 1] = +p[2];
  }

  const rows = cells.map((r, i) => {
    const sf = Math.max(+r.Size_Factor || 1, 1e-8);
    const expression = Math.log1p(counts[i] / sf);
    return {
      cell_id: r.cell_id,
      Component_1: +r.Component_1,
      Component_2: +r.Component_2,
      Pseudotime: +r.Pseudotime,
      State: r.State,
      Time_category: r.Time_category,
      Time: r.Time,
      Grade: r.Grade,
      sub_labels: r.sub_labels,
      KLF4_count: counts[i],
      KLF4_log1p_normalized: expression,
    };
  });
  writeTsv(
    path.join(outDir, "FigureS6B_monocle2_KLF4_cells.tsv"),
    rows,
    [
      "cell_id", "Component_1", "Component_2", "Pseudotime", "State",
      "Time_category", "Time", "Grade", "sub_labels", "KLF4_count",
      "KLF4_log1p_normalized",
    ]
  );

  const rho = pearson(
    rankAverage(rows.map((r) => r.Pseudotime)),
    rankAverage(rows.map((r) => r.KLF4_log1p_normalized))
  );
  writeTsv(
    path.join(outDir, "FigureS6B_monocle2_KLF4_pseudotime_test.tsv"),
    [{
      analysis: "Spearman correlation",
      n_cells: rows.length,
      rho,
      inference_note: "cell-level descriptive association; cells are not independent biological replicates",
    }],
    ["analysis", "n_cells", "rho", "inference_note"]
  );

  const sorted = rows.slice().sort((a, b) => a.Pseudotime - b.Pseudotime);
  const nBins = 30;
  const trend = [];
  for (let b = 0; b < nBins; b++) {
    const lo = Math.floor((b * sorted.length) / nBins);
    const hi = Math.floor(((b + 1) * sorted.length) / nBins);
    const part = sorted.slice(lo, hi);
    const ys = part.map((r) => r.KLF4_log1p_normalized);
    trend.push({
      bin: b + 1,
      n: part.length,
      mean_pseudotime: mean(part.map((r) => r.Pseudotime)),
      mean_expression: mean(ys),
      sem_expression: sd(ys) / Math.sqrt(Math.max(1, ys.length)),
    });
  }
  writeTsv(
    path.join(outDir, "FigureS6B_monocle2_KLF4_pseudotime_trend.tsv"),
    trend,
    ["bin", "n", "mean_pseudotime", "mean_expression", "sem_expression"]
  );

  const timeOrder = ["Normal", "0-7dpi", "8-14dpi", "15-28dpi", "1-2mph"];
  const byTime = timeOrder.map((t) => {
    const vals = rows
      .filter((r) => r.Time_category === t)
      .map((r) => r.KLF4_log1p_normalized);
    return {
      Time_category: t,
      n: vals.length,
      mean_expression: mean(vals),
      sem_expression: sd(vals) / Math.sqrt(Math.max(1, vals.length)),
    };
  });
  writeTsv(
    path.join(outDir, "FigureS6B_monocle2_KLF4_observed_time.tsv"),
    byTime,
    ["Time_category", "n", "mean_expression", "sem_expression"]
  );
  return { cells: rows.length, klf4_gene_index_1based: klf4Col };
}

function prepareScenic() {
  const lines = fs
    .readFileSync(path.join(inputDir, "SCENIC_rssMat.txt"), "utf8")
    .trim()
    .split(/\r?\n/);
  const cols = lines[0].split("\t");
  const records = lines.slice(1).map((line) => {
    const p = line.split("\t");
    const row = { regulon: p[0] };
    cols.forEach((c, i) => (row[c] = +p[i + 1]));
    return row;
  });
  const fibCols = [
    "Fib_Papi", "Fib_SFRP2", "Fib_Fasci", "Fib_EN1", "Fib_Inflama",
    "Fib_Myo", "Fib_Prolif", "Fib_K14",
  ];
  const top = records
    .slice()
    .sort((a, b) => b.Fib_K14 - a.Fib_K14)
    .slice(0, 10);
  const long = [];
  for (const r of top) {
    for (const c of fibCols) {
      long.push({ regulon: r.regulon, fibroblast_state: c, RSS: r[c] });
    }
  }
  writeTsv(
    path.join(outDir, "FigureS6A_formal_SCENIC_top10_FibK14_across_fibroblasts.tsv"),
    long,
    ["regulon", "fibroblast_state", "RSS"]
  );
  return {
    formal_regulons: records.length,
    KLF4_present: records.some((r) => /^KLF4(?:\(|$)/i.test(r.regulon)),
    top10: top.map((r) => r.regulon),
  };
}

function prepareReportedGsea() {
  const rows = [
    ["Epidermis development", 0.88, "<0.001", "positive"],
    ["Keratinocyte differentiation", 0.81, "<0.05", "positive"],
    ["Epithelial cell differentiation", 0.54, "<0.001", "positive"],
    ["Skeletal system development", 0.53, "<0.01", "positive"],
    ["Renal system development", 0.56, "<0.001", "positive"],
    ["Extracellular matrix organization", -0.59, "<0.001", "negative"],
    ["Extracellular structure organization", -0.64, "<0.001", "negative"],
    ["External encapsulating structure organization", -0.64, "<0.001", "negative"],
    ["Angiogenesis", -0.69, "<0.01", "negative"],
    ["Wound healing", -0.57, "<0.01", "negative"],
  ].map(([term, ES, reported_adjusted_p, direction]) => ({
    term, ES, reported_adjusted_p, direction,
    provenance: "source-reported Figure 4/manuscript value; raw ranked list not supplied",
  }));
  writeTsv(
    path.join(outDir, "FigureS6G_source_reported_GSEA.tsv"),
    rows,
    ["term", "ES", "reported_adjusted_p", "direction", "provenance"]
  );
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(qcDir, { recursive: true });
  const monocle = await prepareMonocle();
  const scenic = prepareScenic();
  prepareReportedGsea();
  const audit = {
    generated_at: new Date().toISOString(),
    monocle2: monocle,
    scenic,
    limitations: [
      "Formal SCENIC RSS matrix contains no KLF4 regulon.",
      "KLF4 target-set AUC is a predefined-gene-set rescue analysis, not formal pySCENIC regulon AUC.",
      "RNA-seq ranked list and raw GSEA output were not found; panel G uses source-reported values.",
      "Functional-experiment raw morphology and KRT14-positive-cell tables were not found; panel F retains source artwork and source-reported statistics.",
    ],
  };
  fs.writeFileSync(
    path.join(qcDir, "FigureS6_AG_source_audit.json"),
    JSON.stringify(audit, null, 2),
    "utf8"
  );
  console.log(JSON.stringify(audit, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

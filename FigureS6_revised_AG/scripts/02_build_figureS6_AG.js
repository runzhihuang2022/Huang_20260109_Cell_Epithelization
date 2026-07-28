const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "source_data");
const inputDir = path.join(root, "inputs");
const figDir = path.join(root, "figures");
fs.mkdirSync(figDir, { recursive: true });

const W = 595;
const H = 842;
const FONT = "Arial";

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function parseTsv(file) {
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const h = lines[0].split("\t");
  return lines.slice(1).map((l) => {
    const p = l.split("\t");
    return Object.fromEntries(h.map((k, i) => [k, p[i] ?? ""]));
  });
}
function text(x, y, s, size = 8, weight = "normal", anchor = "start", fill = "#111", extra = "") {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}" ${extra}>${esc(s)}</text>`;
}
function line(x1, y1, x2, y2, stroke = "#222", sw = 0.7, extra = "") {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}
function rect(x, y, w, h, fill = "none", stroke = "none", sw = 0.5, extra = "") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}
function circle(cx, cy, r, fill, stroke = "none", sw = 0.4, extra = "") {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}
function panelLabel(x, y, label) {
  return text(x, y, label, 14, "bold");
}
function panelTitle(x, y, title, anchor = "start") {
  return text(anchor === "start" ? x + 12 : x, y, title, 10, "bold", anchor);
}
function num(v, d = 2) {
  const x = +v;
  return Number.isFinite(x) ? x.toFixed(d) : "";
}
function lerp(a, b, t) {
  return Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
}
function heatColor(t) {
  if (t <= 0.5) {
    const q = t / 0.5;
    return `rgb(${lerp(37, 247, q)},${lerp(99, 247, q)},${lerp(235, 247, q)})`;
  }
  const q = (t - 0.5) / 0.5;
  return `rgb(${lerp(247, 203, q)},${lerp(247, 24, q)},${lerp(247, 29, q)})`;
}
function viridis(t) {
  const stops = [
    [68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37],
  ];
  const z = Math.max(0, Math.min(0.9999, t)) * (stops.length - 1);
  const i = Math.floor(z);
  const q = z - i;
  return `rgb(${lerp(stops[i][0], stops[i + 1][0], q)},${lerp(stops[i][1], stops[i + 1][1], q)},${lerp(stops[i][2], stops[i + 1][2], q)})`;
}
function b64(file) {
  return fs.readFileSync(file).toString("base64");
}

function drawA() {
  const x = 18, y = 22, w = 365, h = 180;
  const rows = parseTsv(path.join(dataDir, "FigureS6A_formal_SCENIC_top10_FibK14_across_fibroblasts.tsv"));
  const regulons = [...new Set(rows.map((r) => r.regulon))];
  const states = [...new Set(rows.map((r) => r.fibroblast_state))];
  const values = rows.map((r) => +r.RSS);
  const min = Math.min(...values), max = Math.max(...values);
  const left = x + 54, top = y + 30, cellW = 31, cellH = 11.2;
  let s = panelLabel(x - 10, y + 2, "A");
  s += panelTitle(x, y + 3, "Formal SCENIC RSS across fibroblast states");
  for (let i = 0; i < regulons.length; i++) {
    s += text(left - 4, top + i * cellH + 8, regulons[i], 8, "normal", "end");
    for (let j = 0; j < states.length; j++) {
      const r = rows.find((q) => q.regulon === regulons[i] && q.fibroblast_state === states[j]);
      const t = ((+r.RSS) - min) / Math.max(1e-9, max - min);
      s += rect(left + j * cellW, top + i * cellH, cellW - 0.5, cellH - 0.5, heatColor(t));
    }
  }
  for (let j = 0; j < states.length; j++) {
    s += text(left + j * cellW + 6, top + regulons.length * cellH + 4, states[j].replace("Fib_", ""), 8, "normal", "end", "#111", `transform="rotate(-55 ${left + j * cellW + 6} ${top + regulons.length * cellH + 4})"`);
  }
  s += text(left, y + h - 8, "KLF4 regulon is absent from the supplied formal RSS matrix.", 8, "bold", "start", "#b91c1c");
  s += text(left, y + h + 3, "Top rows are ranked by Fib_K14 RSS; no KLF4-SCENIC claim is made.", 8, "normal", "start", "#555");
  return s;
}

function scaleExtent(vals, lo, hi) {
  const mn = Math.min(...vals), mx = Math.max(...vals);
  return (v) => lo + ((v - mn) / Math.max(1e-9, mx - mn)) * (hi - lo);
}

function drawB() {
  const x = 397, y = 22, w = 180, h = 180;
  const cells = parseTsv(path.join(dataDir, "FigureS6B_monocle2_KLF4_cells.tsv")).map((r) => ({
    x: +r.Component_1, y: +r.Component_2, pt: +r.Pseudotime,
    expr: +r.KLF4_log1p_normalized, time: r.Time_category,
  }));
  const trend = parseTsv(path.join(dataDir, "FigureS6B_monocle2_KLF4_pseudotime_trend.tsv")).map((r) => ({
    x: +r.mean_pseudotime, y: +r.mean_expression,
  }));
  const sx = scaleExtent(cells.map((r) => r.x), x + 8, x + 83);
  const sy = scaleExtent(cells.map((r) => r.y), y + 78, y + 25);
  const ptMin = Math.min(...cells.map((r) => r.pt)), ptMax = Math.max(...cells.map((r) => r.pt));
  const timeColor = { Normal: "#111827", "0-7dpi": "#377eb8", "8-14dpi": "#4daf4a", "15-28dpi": "#984ea3", "1-2mph": "#ff7f00" };
  let s = panelLabel(x - 10, y + 2, "B");
  s += panelTitle(x, y + 3, "Monocle2 trajectory and KLF4 trend");
  s += text(x + 45, y + 17, "Pseudotime", 8, "bold", "middle");
  s += text(x + 132, y + 17, "Observed time", 8, "bold", "middle");
  const sx2 = scaleExtent(cells.map((r) => r.x), x + 94, x + 169);
  for (let i = 0; i < cells.length; i += 5) {
    const c = cells[i];
    s += circle(sx(c.x), sy(c.y), 0.55, viridis((c.pt - ptMin) / Math.max(1e-9, ptMax - ptMin)));
    s += circle(sx2(c.x), sy(c.y), 0.55, timeColor[c.time] || "#999");
  }
  const legendItems = [["N", "Normal"], ["0-7", "0-7dpi"], ["8-14", "8-14dpi"], ["15-28", "15-28dpi"], ["1-2m", "1-2mph"]];
  legendItems.forEach((it, i) => {
    const lx = x + 94 + i * 16;
    s += circle(lx, y + 87, 1.6, timeColor[it[1]]);
    s += text(lx + 3, y + 89, it[0], 8, "normal", "start");
  });
  const tx = scaleExtent(trend.map((r) => r.x), x + 24, x + 169);
  const ty = scaleExtent(trend.map((r) => r.y), y + 164, y + 104);
  s += text(x + 5, y + 106, "KLF4", 8, "bold", "start", "#7c3aed");
  s += text(x + 5, y + 116, "log1p-normalized", 8, "normal", "start", "#555");
  s += line(x + 24, y + 164, x + 169, y + 164, "#333", 0.6);
  s += line(x + 24, y + 104, x + 24, y + 164, "#333", 0.6);
  s += `<polyline points="${trend.map((r) => `${tx(r.x)},${ty(r.y)}`).join(" ")}" fill="none" stroke="#7c3aed" stroke-width="1.5"/>`;
  for (const r of trend) s += circle(tx(r.x), ty(r.y), 1.2, "#7c3aed");
  s += text(x + 96, y + 177, "Pseudotime", 8, "normal", "middle");
  return s;
}

function drawC() {
  const x = 18, y = 220, w = 215, h = 185;
  const genes = ["GRHL3", "TP63", "TACSTD2", "COL1A1", "ACTA2", "FN1"];
  const sample = parseTsv(path.join(dataDir, "FigureS6C_KLF4_correlations_sample_level.tsv"));
  const cell = parseTsv(path.join(dataDir, "FigureS6C_KLF4_correlations_cell_level.tsv"));
  const spatial = parseTsv(path.join(dataDir, "FigureS6C_KLF4_spatial_FibK14_bin_correlations.tsv"));
  const columns = [
    { label: "Sample", get: (g) => sample.find((r) => r.gene === g) },
    { label: "Cell", get: (g) => cell.find((r) => r.gene === g) },
    { label: "19 dpb", get: (g) => spatial.find((r) => r.gene === g && r.scope === "19dpb") },
    { label: "19 dpb p1", get: (g) => spatial.find((r) => r.gene === g && r.scope === "19dpb_p1") },
  ];
  const left = x + 62, top = y + 39, cw = 34, ch = 18;
  let s = panelLabel(x - 10, y + 2, "C");
  s += panelTitle(x, y + 3, "KLF4 correlations in Fib_K14");
  for (let j = 0; j < columns.length; j++) {
    s += text(left + j * cw + cw / 2, top - 5, columns[j].label, 8, "normal", "middle");
  }
  for (let i = 0; i < genes.length; i++) {
    s += text(left - 5, top + i * ch + 12, genes[i], 8, genes[i] === "TACSTD2" ? "bold" : "normal", "end");
    for (let j = 0; j < columns.length; j++) {
      const r = columns[j].get(genes[i]);
      const rho = +r.rho;
      const q = +r.q_value;
      s += rect(left + j * cw, top + i * ch, cw - 1, ch - 1, heatColor((rho + 0.4) / 0.8), "#fff", 0.4);
      s += text(left + j * cw + cw / 2, top + i * ch + 8, num(rho, 2), 8, "normal", "middle", Math.abs(rho) > 0.22 ? "#fff" : "#111");
      if (q < 0.05) s += text(left + j * cw + cw / 2, top + i * ch + 15, "*", 8, "bold", "middle", Math.abs(rho) > 0.22 ? "#fff" : "#111");
    }
  }
  s += text(left, y + h - 17, "* BH-adjusted q < 0.05.", 8);
  s += text(left, y + h - 7, "Cell/bin columns are descriptive; sample column is primary.", 8, "normal", "start", "#555");
  return s;
}

function drawD() {
  const x = 248, y = 220, w = 329, h = 185;
  const raw = parseTsv(path.join(dataDir, "FigureS6D_OSKM_dotplot_source.tsv"));
  const groups = ["Fib_K14", "Other fibroblasts", "KC_Basal", "KC_Basal_Mig", "KC_Basal_Prolif", "KC_Spinous", "KC_Spinous_Mig", "KC_Granular"];
  const genes = ["POU5F1", "SOX2", "KLF4", "MYC"];
  const means = raw.map((r) => +r.mean_expression);
  const maxMean = Math.max(...means);
  const left = x + 105, top = y + 32, cw = 48, ch = 16;
  let s = panelLabel(x - 10, y + 2, "D");
  s += panelTitle(x, y + 3, "OSKM expression across Fib_K14 and epithelial states");
  for (let j = 0; j < genes.length; j++) s += text(left + j * cw + cw / 2, top - 7, genes[j], 8, "bold", "middle");
  for (let i = 0; i < groups.length; i++) {
    const emph = groups[i] === "Fib_K14";
    s += text(left - 7, top + i * ch + 10, groups[i], 8, emph ? "bold" : "normal", "end", emph ? "#e41a1c" : "#111");
    for (let j = 0; j < genes.length; j++) {
      const r = raw.find((q) => q.group === groups[i] && q.gene === genes[j]);
      const pct = +r.percent_expressing;
      const m = +r.mean_expression;
      s += circle(left + j * cw + cw / 2, top + i * ch + 7, 1.8 + 5.2 * Math.sqrt(pct / 100), viridis(m / maxMean), "#333", 0.35);
    }
  }
  s += text(left, y + h - 19, "Dot size: % expressing; color: mean expression", 8, "normal", "start", "#555");
  s += text(left, y + h - 7, "POU5F1/SOX2 sparse; KLF4/MYC not Fib_K14-specific.", 8, "bold", "start", "#7c2d12");
  return s;
}

function drawE() {
  const x = 18, y = 422, w = 215, h = 145;
  const img = b64(path.join(inputDir, "OSKM_spatial_featureplots.png"));
  const terr = parseTsv(path.join(dataDir, "FigureS6E_spatial_OSKM_by_territory.tsv"))
    .filter((r) => r.sample_key === "19dpb_p1");
  let s = panelLabel(x - 10, y + 2, "E");
  s += panelTitle(x, y + 3, "Spatial OSKM feature plots (19 dpb p1)");
  s += `<image href="data:image/png;base64,${img}" x="${x}" y="${y + 17}" width="${w}" height="43" preserveAspectRatio="xMidYMid meet"/>`;
  const genes = ["KLF4", "POU5F1", "SOX2", "MYC"];
  const regions = ["Un-epi", "Epi-Front", "Newly-epi"];
  const colors = { "Un-epi": "#d7191c", "Epi-Front": "#e6bf23", "Newly-epi": "#377eb8" };
  const maxVal = Math.max(...terr.map((r) => +r.mean_expression));
  const baseY = y + 128, barW = 9, gap = 4;
  for (let g = 0; g < genes.length; g++) {
    const gx = x + 18 + g * 49;
    for (let j = 0; j < regions.length; j++) {
      const r = terr.find((q) => q.gene === genes[g] && q.wound_territory === regions[j]);
      const bh = 48 * (+r.mean_expression / maxVal);
      s += rect(gx + j * (barW + gap), baseY - bh, barW, bh, colors[regions[j]], "#333", 0.3);
    }
    s += text(gx + 14, baseY + 11, genes[g], 8, "normal", "middle");
  }
  s += text(x + w / 2, y + h - 1, "Regional means; colors: Un-epi / Epi-Front / Newly-epi", 8, "normal", "middle", "#555");
  return s;
}

function drawF() {
  const x = 248, y = 422, w = 329, h = 145;
  const img = b64(path.join(inputDir, "KLF4_OE_source_400pct.png"));
  let s = panelLabel(x - 10, y + 2, "F");
  s += panelTitle(x, y + 3, "KLF4 overexpression: marker induction and morphology");
  s += `<defs><clipPath id="clipF"><rect x="${x}" y="${y + 15}" width="${w}" height="${h - 23}"/></clipPath></defs>`;
  s += `<g clip-path="url(#clipF)"><image href="data:image/png;base64,${img}" x="${x}" y="${y + 15}" width="${w}" height="${w}" preserveAspectRatio="none"/></g>`;
  s += rect(x, y + h - 14, w, 14, "#fff");
  s += text(x + 3, y + h - 4, "Source experiment: KRT14 induction and progressive reduction in length/aspect ratio.", 8, "normal", "start", "#555");
  return s;
}

function drawG() {
  const x = 18, y = 586, w = 559, h = 231;
  const rows = parseTsv(path.join(dataDir, "FigureS6G_source_reported_GSEA.tsv")).map((r) => ({ ...r, ES: +r.ES }));
  const left = x + 180, mid = x + 310, top = y + 31, ch = 17;
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.ES)));
  let s = panelLabel(x - 10, y + 2, "G");
  s += panelTitle(x, y + 3, "KLF4-OE RNA-seq: focused GSEA summary");
  s += line(mid, top - 5, mid, top + rows.length * ch, "#555", 0.8);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const yy = top + i * ch;
    s += text(left - 8, yy + 10, r.term, 8, "normal", "end");
    const bw = 125 * Math.abs(r.ES) / maxAbs;
    const bx = r.ES >= 0 ? mid : mid - bw;
    s += rect(bx, yy + 2, bw, 10, r.ES >= 0 ? "#d95f5f" : "#3b82b4");
    s += text(
      r.ES >= 0 ? bx + bw + 5 : bx + 4,
      yy + 10,
      `${r.ES > 0 ? "+" : ""}${num(r.ES, 2)} (${r.reported_adjusted_p})`,
      8,
      "bold",
      "start",
      r.ES >= 0 ? "#111" : "#fff"
    );
  }
  s += text(mid - 70, y + h - 22, "Negative enrichment", 8, "bold", "middle", "#3b82b4");
  s += text(mid + 70, y + h - 22, "Positive enrichment", 8, "bold", "middle", "#d95f5f");
  s += text(x + w / 2, y + h - 8, "Values are source-reported; raw ranked list was not supplied for independent rerunning.", 8, "normal", "middle", "#7c2d12");
  return s;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}pt" height="${H}pt" viewBox="0 0 ${W} ${H}">
${rect(0, 0, W, H, "#fff")}
${drawA()}
${drawB()}
${drawC()}
${drawD()}
${drawE()}
${drawF()}
${drawG()}
</svg>`;

const out = path.join(figDir, "FigureS6_revised_AG.svg");
fs.writeFileSync(out, svg, "utf8");
console.log(out);

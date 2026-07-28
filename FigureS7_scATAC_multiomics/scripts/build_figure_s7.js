const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "inputs");
const DATA = path.join(ROOT, "source_data");
const OUT = path.join(ROOT, "figures");
const QC = path.join(ROOT, "QC");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(QC, { recursive: true });

function esc(s) {
  return String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
}
function img64(file) {
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
}
function parseDelimited(file, sep = "\t") {
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const head = lines[0].split(sep).map((x) => x.replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(sep).map((x) => x.replace(/^"|"$/g, ""));
    return Object.fromEntries(head.map((h, i) => [h, vals[i]]));
  });
}
function parseCsv(file) {
  const text = fs.readFileSync(file, "utf8").trim();
  const rows = [];
  let row = [], cell = "", quote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') quote = !quote;
    else if (c === "," && !quote) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quote) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = rows[0];
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

const tests = parseDelimited(path.join(DATA, "FigureS7B_scATAC_FibK14_tests.tsv"));
const cross = parseDelimited(path.join(DATA, "FigureS7E_crossomics_TACSTD2_result.tsv"))[0];
const ranks = parseCsv(path.join(DATA, "FigureS7E_rank_aligned_values.csv"));
const direct = parseCsv(path.join(DATA, "FigureS7E_direct_ATAC_correlations.csv"));

const W = 2480, H = 3508;
const font = "Arial";
const black = "#111111", gray = "#666666", red = "#D62728", blue = "#2F5597", teal = "#1696A7";
let s = [];
s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="595pt" height="842pt" viewBox="0 0 ${W} ${H}">`);
s.push(`<rect width="100%" height="100%" fill="white"/>`);
s.push(`<style>
text{font-family:${font},sans-serif;fill:${black}}
.pl{font-size:54px;font-weight:700}.title{font-size:40px;font-weight:700}.lab{font-size:36px}
.small{font-size:34px}.note{font-size:34px;fill:${gray}}.axis{stroke:${black};stroke-width:3}
.box{fill:white;stroke:#B6B6B6;stroke-width:2}
</style>`);
const text = (x, y, v, cls = "lab", anchor = "start", fill = null) =>
  s.push(`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}"${fill ? ` fill="${fill}"` : ""}>${esc(v)}</text>`);
const line = (x1, y1, x2, y2, stroke = black, sw = 3, dash = "") =>
  s.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`);
const rect = (x, y, w, h, fill = "white", stroke = "#B6B6B6", r = 0) =>
  s.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`);
const image = (x, y, w, h, file) =>
  s.push(`<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" href="${img64(file)}"/>`);

// A: RNA-anchored ATAC projection
text(30, 72, "A", "pl");
text(95, 72, "RNA-anchored scATAC projection", "title");
rect(55, 95, 1505, 785);
image(70, 120, 735, 690, path.join(INPUT, "A1_UMAP_predictedGroup.png"));
image(815, 120, 730, 690, path.join(INPUT, "A2_UMAP_Klf4_gene_score.png"));
text(440, 850, "Transferred cell-state labels", "small", "middle");
text(1180, 850, "Klf4 gene score", "small", "middle");
text(55, 920, "Label transfer projection; a joint RNA–ATAC coordinate object was not present in the supplied assets.", "note");

// B: QC medians
text(1610, 72, "B", "pl");
text(1675, 72, "scATAC-seq quality control", "title");
rect(1595, 95, 830, 785);
const qvars = [
  ["TSSEnrichment", "TSS enrichment", 1],
  ["NucleosomeRatio", "Nucleosome ratio", 1],
  ["nFrags", "Fragments (×10³)", 1000],
  ["DoubletScore", "Doublet score", 1],
];
qvars.forEach((q, i) => {
  const row = tests.find((r) => r.variable === q[0]);
  const x0 = 1635 + (i % 2) * 390, y0 = 190 + Math.floor(i / 2) * 335;
  const v1 = +row.median_Fib_K14 / q[2], v2 = +row.median_other / q[2];
  const vmax = Math.max(v1, v2, 0.001) * 1.25;
  text(x0 + 165, y0 - 25, q[1], "small", "middle");
  line(x0, y0 + 225, x0 + 330, y0 + 225);
  line(x0, y0 + 15, x0, y0 + 225);
  const h1 = (v1 / vmax) * 190, h2 = (v2 / vmax) * 190;
  s.push(`<rect x="${x0 + 65}" y="${y0 + 225 - h1}" width="75" height="${h1}" fill="${red}" stroke="${black}" stroke-width="2"/>`);
  s.push(`<rect x="${x0 + 195}" y="${y0 + 225 - h2}" width="75" height="${h2}" fill="#B8B8B8" stroke="${black}" stroke-width="2"/>`);
  text(x0 + 102, y0 + 268, "Fib_K14", "note", "middle");
  text(x0 + 232, y0 + 268, "Other", "note", "middle");
  if (+row.q_value < 0.05) text(x0 + 165, y0 + 5, `q=${(+row.q_value).toPrecision(2)}`, "note", "middle");
});
text(2010, 855, "Medians; n=495 vs 6,370 fibroblasts", "note", "middle");

// C browser tracks
text(30, 1020, "C", "pl");
text(95, 1020, "Epithelial-associated chromatin accessibility", "title");
rect(55, 1040, 2370, 820);
const cfiles = [
  ["Krt14", "C1_BrowserTrack_Krt14.png"],
  ["Krt5", "C2_BrowserTrack_Krt5.png"],
  ["Tacstd2", "C3_BrowserTrack_Tacstd2.png"],
];
cfiles.forEach((c, i) => {
  const x = 75 + i * 780;
  text(x + 375, 1100, c[0], "small", "middle");
  image(x, 1120, 750, 650, path.join(INPUT, c[1]));
});
text(1240, 1825, "ArchR browser tracks; source-reported accessibility profiles, shown without inferential P values.", "note", "middle");

// D motif audit
text(30, 1980, "D", "pl");
text(95, 1980, "KLF4 motif and footprinting audit", "title");
rect(55, 2000, 815, 710);
text(110, 2100, "0", "pl", "start", red);
text(190, 2100, "KLF4 motif hits", "title");
line(105, 2145, 800, 2145, "#D8D8D8", 4);
text(110, 2240, "No valid KLF4 footprint can be computed", "lab");
text(110, 2290, "from the supplied peak annotation.", "lab");
rect(105, 2380, 710, 205, "#FBE9E7", "#B23A2B", 12);
text(135, 2450, "Not a positive result", "title", "start", "#B23A2B");
text(135, 2510, "Do not claim KLF4 motif enrichment or", "small");
text(135, 2555, "footprinting until matched motif/peak data exist.", "small");
text(110, 2660, "Input: KLF4_motif_hits_in_peakAnnotation.csv", "note");

// E multi-omics scatter
text(920, 1980, "E", "pl");
text(985, 1980, "Multi-omics integration and evidence boundary", "title");
rect(940, 2000, 1485, 710);
const px = 1010, py = 2070, pw = 780, ph = 500;
line(px, py + ph, px + pw, py + ph);
line(px, py, px, py + ph);
text(px + pw / 2, py + ph + 70, "Klf4 ATAC gene-score rank-bin mean", "small", "middle");
s.push(`<text x="${px - 75}" y="${py + ph / 2}" class="small" text-anchor="middle" transform="rotate(-90 ${px - 75} ${py + ph / 2})">TACSTD2 RNA pseudobulk mean</text>`);
const xs = ranks.map(r => +r.Klf4_ATAC_bin_mean), ys = ranks.map(r => +r.TACSTD2_RNA_sample_mean);
const xmin = Math.min(...xs), xmax = Math.max(...xs), ymin = Math.min(...ys), ymax = Math.max(...ys);
const sx = v => px + 20 + ((v - xmin) / (xmax - xmin || 1)) * (pw - 40);
const sy = v => py + ph - 20 - ((v - ymin) / (ymax - ymin || 1)) * (ph - 40);
ranks.forEach(r => {
  const fill = r.condition === "Normal skin" ? "#4C78A8" : "#E45756";
  s.push(`<circle cx="${sx(+r.Klf4_ATAC_bin_mean)}" cy="${sy(+r.TACSTD2_RNA_sample_mean)}" r="11" fill="${fill}" stroke="white" stroke-width="2"/>`);
});
const n = xs.length, mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
const slope = xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0) / xs.reduce((a,x)=>a+(x-mx)*(x-mx),0);
const intc = my - slope * mx;
line(sx(xmin), sy(slope*xmin+intc), sx(xmax), sy(slope*xmax+intc), black, 4);
text(1835, 2115, `Pearson r=${(+cross.pearson_r).toFixed(2)}`, "title");
text(1835, 2170, `P=${(+cross.pearson_p_raw).toFixed(4)}`, "lab");
text(1835, 2220, `BH q=${(+cross.bh_q_across_5_prespecified_genes).toFixed(4)}`, "lab");
text(1835, 2270, `n=${cross.n_rank_aligned_pseudobulks} rank bins`, "lab");
text(1835, 2365, "Positive state-axis concordance", "small", "start", "#1B7F4B");
text(1835, 2430, "Not donor-paired; not causal", "small", "start", "#B23A2B");
text(1835, 2510, "Direct Klf4–epithelial ATAC", "small");
text(1835, 2555, "correlations: all BH q≥0.40", "small");
text(1835, 2600, "(no cell-level association)", "small");

// Interpretation cards
const cards = [
  [55, "Supported", "#E8F3EC", "#1B7F4B",
   ["Fib_K14 marker accessibility is strongly elevated", "(Cliff’s δ=0.79; BH q=5.6×10⁻¹⁹⁰).",
    "Klf4-ATAC/TACSTD2-RNA rank-axis concordance", "is positive (r=0.53; BH q=0.018)."]],
  [865, "Not supported", "#FBE9E7", "#B23A2B",
   ["Klf4 gene score is slightly lower in predicted Fib_K14", "(δ=−0.057; BH q=0.049).",
    "No KLF4 motif hit or valid footprinting result.", "Direct Klf4–epithelial ATAC correlations are null."]],
  [1675, "Interpretation boundary", "#EEF2F7", "#34495E",
   ["Evidence supports a coordinated epithelial-like", "accessibility/expression state, but does not establish",
    "a direct KLF4 chromatin mechanism or fate conversion.", "Paired multiome or donor-matched validation is required."]],
];
cards.forEach(c => {
  rect(c[0], 2800, 750, 610, c[2], c[3], 14);
  text(c[0]+40, 2880, c[1], "title", "start", c[3]);
  c[4].forEach((t,i)=>text(c[0]+40, 2970+i*72, t, "small"));
});
s.push("</svg>");

const svg = s.join("\n");
const base = path.join(OUT, "FigureS7_revised_v01");
fs.writeFileSync(base + ".svg", svg, "utf8");

async function main() {
  await sharp(Buffer.from(svg)).png().resize(W * 2, H * 2).withMetadata({ density: 600 }).toFile(base + "_600dpi.png");
  await sharp(Buffer.from(svg)).tiff({ compression: "lzw", resolutionUnit: "inch", xres: 600, yres: 600 })
    .resize(W * 2, H * 2).toFile(base + "_600dpi.tiff");
  const result = {
    positive_results: {
      FibK14_marker_accessibility: { cliffs_delta: 0.7935546993, q: 5.585484964591446e-190 },
      Klf4_ATAC_TACSTD2_RNA_rank_axis: {
        pearson_r: +cross.pearson_r, p: +cross.pearson_p_raw,
        q: +cross.bh_q_across_5_prespecified_genes, n: +cross.n_rank_aligned_pseudobulks
      }
    },
    not_supported: {
      KLF4_motif_hits: 0,
      direct_ATAC_correlations_min_BH_q: Math.min(...direct.map(r => +r.spearman_q_bh)),
      Klf4_gene_score_in_FibK14: { cliffs_delta: -0.0567664082, q: 0.0485705987 }
    },
    scope_note: "RNA-anchored label-transfer projection, not a joint-coordinate co-embedding; rank-aligned pseudobulks are not donor-paired."
  };
  fs.writeFileSync(path.join(QC, "FigureS7_result_summary.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });

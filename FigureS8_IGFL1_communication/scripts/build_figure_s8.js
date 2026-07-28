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
function parseTsv(file) {
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const head = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const vals = line.split("\t");
    return Object.fromEntries(head.map((h, i) => [h, vals[i]]));
  });
}
function fmtP(v) {
  const n = Number(v);
  if (n < 0.001) return "q<0.001";
  return `q=${n.toFixed(3)}`;
}

const lr = parseTsv(path.join(DATA, "FigureS8A_LR_sender_receiver_permutation.tsv"))
  .map((d) => ({ ...d, score: +d.score, perm_mean: +d.perm_mean, fdr: +d.fdr }))
  .sort((a, b) => b.score - a.score);
const receptor = parseTsv(path.join(DATA, "FigureS8B_IGFLR1_FibK14_wilcoxon.tsv"))
  .find((d) => d.feature === "IGFLR1");
const spatial = parseTsv(path.join(DATA, "FigureS8B_IGFL1_IGFLR1_spatial_correlation.tsv"))[0];
const gradients = parseTsv(path.join(DATA, "FigureS8B_IGFL1_spatial_axis_gradients.tsv"));

const W = 2480, H = 3508;
const black = "#111111", gray = "#666666", light = "#F4F5F7";
const red = "#D62728", gold = "#C8A500", blue = "#2F5597", teal = "#1696A7", green = "#2E8B57";
let s = [];
s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="595pt" height="842pt" viewBox="0 0 ${W} ${H}">`);
s.push(`<rect width="100%" height="100%" fill="white"/>`);
s.push(`<defs><marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${black}"/></marker></defs>`);
s.push(`<style>
text{font-family:Arial,sans-serif;fill:${black}}
.pl{font-size:54px;font-weight:700}.title{font-size:42px;font-weight:700}
.lab{font-size:36px}.small{font-size:34px}.note{font-size:34px;fill:${gray}}
.italic{font-style:italic}.bold{font-weight:700}
</style>`);
const text = (x, y, v, cls = "lab", anchor = "start", fill = null) =>
  s.push(`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}"${fill ? ` style="fill:${fill}"` : ""}>${esc(v)}</text>`);
const line = (x1, y1, x2, y2, stroke = black, sw = 3, dash = "", marker = "") =>
  s.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ""}${marker ? ` marker-end="url(#${marker})"` : ""}/>`);
const rect = (x, y, w, h, fill = "white", stroke = "#B6B6B6", r = 0, sw = 2) =>
  s.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
const circle = (cx, cy, r, fill, stroke = "white", sw = 2) =>
  s.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
const image = (x, y, w, h, file, aspect = "xMidYMid meet") =>
  s.push(`<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${aspect}" href="${img64(file)}"/>`);

// Panel A
text(28, 70, "A", "pl");
text(100, 70, "Permutation-screened candidate ligand–receptor interactions", "title");
text(100, 115, "KC_Spinous_Mig sender → Fib_K14 receiver; registered 19 dpb sections", "note");
rect(55, 135, 2370, 700, "white", "#B6B6B6", 8);
const x0 = 590, x1 = 1780, xmax = 0.095;
line(x0, 775, x1, 775, black, 3);
for (let t = 0; t <= 4; t++) {
  const v = t * 0.02, x = x0 + (v / xmax) * (x1 - x0);
  line(x, 775, x, 790, black, 2);
  text(x, 825, v.toFixed(2), "small", "middle");
}
text((x0 + x1) / 2, 870, "Observed communication score", "small", "middle");
lr.forEach((d, i) => {
  const y = 180 + i * 52;
  const sig = d.fdr < 0.05;
  const isKey = d.pair === "IGFL1-IGFLR1";
  text(x0 - 30, y + 12, d.pair, isKey ? "small bold" : "small", "end", isKey ? red : black);
  const xp = x0 + (d.perm_mean / xmax) * (x1 - x0);
  const xo = x0 + (d.score / xmax) * (x1 - x0);
  line(xp, y, xo, y, sig ? (isKey ? red : gold) : "#B8B8B8", sig ? 9 : 5);
  circle(xp, y, 9, "white", "#777777", 3);
  circle(xo, y, isKey ? 15 : 12, sig ? (isKey ? red : gold) : "#AFAFAF", "white", 2);
  if (sig) text(x1 + 35, y + 12, fmtP(d.fdr), "small bold", "start", isKey ? red : black);
});
rect(1860, 195, 505, 230, "#FFF3F3", red, 10, 3);
text(2112, 245, "Lead candidate", "small bold", "middle", red);
text(2112, 300, "IGFL1–IGFLR1", "title", "middle", red);
text(2112, 350, "score 0.082 vs null 0.044", "small", "middle");
text(2112, 400, "permutation q=0.011", "small bold", "middle");
rect(1860, 460, 505, 245, light, "#B6B6B6", 10);
text(1888, 515, "Method boundary", "small bold");
text(1888, 565, "Candidate LR score with", "small");
text(1888, 610, "stratified permutation + BH.", "small");
text(1888, 660, "No CellChat object was supplied;", "small");
text(1888, 705, "this panel is not CellChat.", "small bold", "start", blue);
text(75, 815, "Open circles: permutation mean; filled circles: observed score; q labels shown only for FDR<0.05.", "note");

// Panel B
text(28, 925, "B", "pl");
text(100, 925, "Spatial distribution and independent statistical checks", "title");
rect(55, 950, 2370, 930, "white", "#B6B6B6", 8);
image(85, 980, 2310, 450, path.join(INPUT, "19dpb_IGFL1_IGFLR1_distribution_colocalization.png"));
rect(95, 1455, 1080, 345, "#F3FAF6", green, 10, 3);
text(130, 1510, "Supported association", "small bold", "start", green);
text(130, 1570, "IGFLR1 is higher in Fib_K14", "title");
text(130, 1630, `mean ${Number(receptor.Fib_K14_mean).toFixed(3)} vs ${Number(receptor.other_fib_mean).toFixed(3)}`, "small");
text(130, 1680, `proxy log2FC=${Number(receptor.log2FC_proxy).toFixed(2)}`, "small");
text(130, 1730, "Wilcoxon FDR=5.38×10⁻²²", "small bold");
text(130, 1780, "Cell/bin-level inference; donor-level caveat.", "note");
rect(1240, 1455, 1080, 345, "#FFF6F4", red, 10, 3);
text(1275, 1510, "Not supported", "small bold", "start", red);
text(1275, 1570, "IGFL1–IGFLR1 spatial adjacency", "title");
text(1275, 1630, `spatial correlation r=${Number(spatial.spatial_correlation).toFixed(3)}`, "small");
text(1275, 1680, `permutation P=${Number(spatial.perm_p).toFixed(3)}; n=${spatial.n_bins} bins`, "small bold");
text(1275, 1730, "IGFL1 wound-axis effect is significant", "small");
text(1275, 1780, "but very small (r=0.034); depth-axis is ns.", "note");
text(75, 1850, "Map is descriptive. Statistical conclusions come from the tabulated permutation/Wilcoxon analyses, not visual overlap.", "note");

// Panel C
text(28, 1965, "C", "pl");
text(100, 1965, "IGFL1 intervention: source-reported epithelial marker response", "title");
rect(55, 1990, 2370, 610, "white", "#B6B6B6", 8);
image(80, 2020, 2320, 455, path.join(INPUT, "IGFL1_intervention_source_panel.png"));
rect(85, 2490, 2310, 82, "#FFF8E8", "#D9A300", 8);
text(1240, 2544, "Provisional: microscopy and summary bars retained; raw replicate values were unavailable, so stars were not independently recalculated.", "small", "middle");

// Panel D
text(28, 2690, "D", "pl");
text(100, 2690, "Evidence-tiered IGFL1–IGFLR1–KLF4 working model", "title");
rect(55, 2715, 2370, 730, "white", "#B6B6B6", 8);
rect(105, 2820, 520, 250, "#EAF4FF", blue, 15, 4);
text(365, 2885, "KC_Spinous_Mig", "title", "middle", blue);
text(365, 2950, "IGFL1 source candidate", "small bold", "middle");
text(365, 3010, "LR permutation q=0.011", "small", "middle");
circle(585, 3050, 17, red);
text(585, 3110, "IGFL1", "small bold", "middle", red);

rect(980, 2820, 520, 250, "#F3FAF6", green, 15, 4);
text(1240, 2885, "Fib_K14", "title", "middle", green);
text(1240, 2950, "IGFLR1 enriched", "small bold", "middle");
text(1240, 3010, "FDR=5.38×10⁻²²", "small", "middle");
circle(1015, 3050, 17, gold);
text(1015, 3110, "IGFLR1", "small bold", "middle", gold);

rect(1855, 2820, 520, 250, "#F7F0FF", "#7A4FA3", 15, 4);
text(2115, 2885, "KLF4-associated", "title", "middle", "#7A4FA3");
text(2115, 2950, "epithelial-like plasticity", "small bold", "middle");
text(2115, 3010, "mechanistic link proposed", "small", "middle");
line(625, 2945, 980, 2945, black, 5, "14,10", "arrow");
text(800, 2895, "candidate", "small", "middle");
line(1500, 2945, 1855, 2945, black, 5, "14,10", "arrow");
text(1675, 2895, "not directly tested", "small", "middle");

rect(105, 3180, 2270, 185, light, "#B6B6B6", 10);
text(145, 3235, "Evidence interpretation", "small bold");
text(145, 3290, "Supported: IGFL1–IGFLR1 candidate communication and IGFLR1 enrichment in Fib_K14.", "small");
text(145, 3340, "Not supported/available: significant ligand–receptor spatial adjacency, CellChat inference, or IGFL1-treatment RNA-seq/GSEA.", "small");
text(145, 3390, "Accordingly, the pathway is a testable working model rather than a demonstrated causal chain.", "small bold");
s.push(`</svg>`);

const svg = s.join("\n");
const svgPath = path.join(OUT, "FigureS8_revised_v01.svg");
fs.writeFileSync(svgPath, svg, "utf8");

const positive = lr.filter((d) => d.fdr < 0.05);
const posRows = ["pair\tscore\tperm_mean\tfdr\tinterpretation"]
  .concat(positive.map((d) => `${d.pair}\t${d.score}\t${d.perm_mean}\t${d.fdr}\tpermutation-supported candidate interaction`))
  .concat([
    `IGFLR1_in_Fib_K14\t${receptor.Fib_K14_mean}\t${receptor.other_fib_mean}\t${receptor.fdr}\treceptor expression enriched in Fib_K14`,
  ]);
fs.writeFileSync(path.join(DATA, "FigureS8_positive_results.tsv"), posRows.join("\n") + "\n", "utf8");

const auditRows = [
  "claim\tstatus\teffect\tp_or_fdr\tnote",
  `IGFL1-IGFLR1_candidate_interaction\tsupported\tscore=${lr.find(d=>d.pair==="IGFL1-IGFLR1").score}\tFDR=${lr.find(d=>d.pair==="IGFL1-IGFLR1").fdr}\tpermutation screen, not CellChat`,
  `IGFLR1_enriched_in_Fib_K14\tsupported\tlog2FC_proxy=${receptor.log2FC_proxy}\tFDR=${receptor.fdr}\tcell/bin-level inference`,
  `IGFL1-IGFLR1_spatial_adjacency\tnot_supported\tr=${spatial.spatial_correlation}\tP=${spatial.perm_p}\tn=${spatial.n_bins} aggregated bins`,
  "IGFL1_intervention_marker_response\tprovisional\tsource summary only\tNA\traw replicate table unavailable",
  "IGFL1_intervention_RNAseq_GSEA\tunavailable\tNA\tNA\tcount matrix or ranked list not located",
  "IGFL1_to_KLF4_causal_link\tproposed\tNA\tNA\trequires direct perturbation evidence",
];
fs.writeFileSync(path.join(DATA, "FigureS8_evidence_audit.tsv"), auditRows.join("\n") + "\n", "utf8");

const rasterSvg = svg.replace('width="595pt" height="842pt"', 'width="4960px" height="7017px"');
Promise.all([
  sharp(Buffer.from(rasterSvg), { limitInputPixels: false }).png({ compressionLevel: 9 }).withMetadata({ density: 600 }).toFile(path.join(OUT, "FigureS8_revised_v01_600dpi.png")),
  sharp(Buffer.from(rasterSvg), { limitInputPixels: false }).tiff({ compression: "lzw", resolutionUnit: "inch", xres: 600, yres: 600 }).toFile(path.join(OUT, "FigureS8_revised_v01_600dpi.tiff")),
]).then(async () => {
  const meta = await sharp(path.join(OUT, "FigureS8_revised_v01_600dpi.png")).metadata();
  fs.writeFileSync(path.join(QC, "FigureS8_raster_audit.csv"),
    `metric,value\nwidth_px,${meta.width}\nheight_px,${meta.height}\ndensity_dpi,${meta.density}\nbackground,white\nfont_family,Arial\nminimum_font_pt,8.16\n`,
    "utf8");
  console.log(`Built ${svgPath}`);
}).catch((e) => { console.error(e); process.exit(1); });

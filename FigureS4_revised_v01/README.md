# Figure S4 — human Fib_K14 validation

This package contains the human-only part of the former Figure S3. It uses:

- `F:\多组学分析skills\人创面\pbmc_final.h5ad`
- `F:\20250325cell背靠背拒稿\20251214上皮化\20260313重新拼图\时空组学\stereoseq\combined_16samples_Harmony_Clustered_Fixed_Annotated_White.h5ad`
- the registered 11-section wound-healing subset only.

## Reproduction

Run the scripts in numeric order. The Python environment used for single-cell
panels contains Scanpy 1.11 and Scrublet 0.2.3. Monocle2 is version 2.30.1.
The spatial calculation and rendering are split because the legacy h5ad needs
anndata 0.12, whereas the stable plotting environment is separate.

```powershell
python scripts/01_recompute_doublets.py --h5ad <human_scRNA.h5ad> --outdir tables
python scripts/02_generate_human_panels.py --scrna <human_scRNA.h5ad> --package .
python scripts/02b_generate_spatial_panel.py --spatial <annotated_spatial.h5ad> --package .
python scripts/02c_render_spatial_panel.py .
Rscript scripts/03_run_monocle2.R .
python scripts/04_build_qc_and_assemble.py --scrna <human_scRNA.h5ad> --package .
```

Required Python packages are `anndata`, `scanpy`, `scrublet`, `numpy`,
`pandas`, `scipy`, `matplotlib`, `seaborn` and `PyMuPDF`. The R step requires
`monocle` 2.30.1, `Matrix`, `ggplot2` and `gridExtra`. The script contains a
scoped compatibility replacement for the removed `igraph::nei()` helper used
by Monocle2; it does not change the trajectory parameters.

Key source-data tables and all panel-level PDF/SVG/PNG files are retained.
Panel F uses within-section color normalization; do not interpret its colors as
absolute cross-section expression differences.

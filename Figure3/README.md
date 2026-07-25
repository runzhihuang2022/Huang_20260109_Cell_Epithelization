# Figure 3 / Figure S3 finalization package

This package follows the fixed Figure 3 (A-K) and Figure S3 (A-O) legends. Figure 3 is assembled as one A4 portrait page. Figure S3 is an A4 portrait **review draft** because five experimental panels still lack source evidence.

## Delivered outputs

- `outputs/vector/Figure3_final.ai`, `.svg`, `.pdf`
- `outputs/raster/Figure3_final_600dpi.png`
- `supplements/figures/FigureS3_review.ai`, `.svg`, `.pdf`
- `supplements/figures/FigureS3_review_600dpi.png`
- panel-level PDF/PNG files under `supplements/figures/panels/`
- panel and data manifests, source statistics, legend/reviewer text, and QC report

## Reproduction

1. Run `scripts/extract_experimental_panels.py` with a Python environment containing `python-pptx`.
2. Run `scripts/generate_figure_s3_computational.py` with `anndata`, `scanpy`, `numpy`, `pandas`, `scipy`, `statsmodels`, `matplotlib`, and `seaborn`.
3. Run `scripts/assemble_figure3.py` and `scripts/assemble_figure_s3.py` with Pillow and ReportLab.
4. Open the generated PDFs in Adobe Illustrator and save as `.ai`. The provided AI files were generated this way.

All assembly coordinates are in millimetres. Images are fitted with preserved aspect ratio; no panel is stretched.

## Scientific status

- Figure 3K is supported by FCS-derived machine-matched sequential gating: 10,000 total events, 1,259 PDGFRA-positive events, and 619 PDGFRA-positive/EPCAM-positive events (6.19% of all events; 49.17% of the PDGFRA-positive parent).
- The registered h5ad contains `nFeature_RNA`, `nCount_RNA`, and `mt_percent`, but no `doublet_score`. Figure S3B therefore remains partial.
- Figure S3J, K, M, N, and O are not submission-ready. Required source evidence is listed in `QC/FINAL_QC_REPORT.md`.
- Computational proximity, PAGA, and pseudotime support transcriptional association only and do not establish a fibroblast-to-keratinocyte lineage conversion.

## Statistics

Statistical stars are used only when replicate-level tests are available. Figure 3D uses Kruskal-Wallis tests with adjusted pairwise comparisons. Figure S3D uses sample-level two-sided Mann-Whitney comparisons with Benjamini-Hochberg correction. Enrichment panels use FDR-adjusted enrichment P values. No stars were added to experimental images without auditable biological replicates.

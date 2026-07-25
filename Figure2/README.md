# Figure 2 finalization package

This evidence unit contains an A4-landscape Figure 2 and an A4-portrait Figure S2 review layout, editable vector masters, 600-dpi exports, panel-level source tables, reproducible scripts, legends and QC records.

## Main deliverables

- `outputs/vector/Figure2_final.ai` and `outputs/vector/FigureS2_review.ai`: Adobe Illustrator files saved with PDF compatibility.
- `outputs/vector/*_editable.svg` and `outputs/vector/*.pdf`: exchange-format vector masters.
- `outputs/raster/*_600dpi.png` and `outputs/raster/*_600dpi.tiff`: submission/review rasters.
- `legends/Figure2_legend_locked_original.md`: verbatim supplied legend retained for provenance.
- `legends/Figure2_legend_evidence_aligned_draft.md`: figure-matched draft that reports the currently reproducible results.
- `STATISTICAL_AUDIT.md` and `TEXT_RECONCILIATION.md`: claim-to-evidence audit.

## Reproduction

Run `scripts/compute_figure2_source_data.py` first, then `scripts/build_figure2_package.py`, using the bundled Python runtime recorded in `data_manifest.csv`. The scripts regenerate source tables, derived panels and assembled outputs. The two `.ai` files are produced by opening the final PDFs in Adobe Illustrator 2024 and saving with PDF compatibility.

## Submission status

Figure 2 A-F is assembled. Figure S2 A-E is assembled from the selected 19dpb_p1 object, and Figure S2F is restored from matched S-0d and D-0d MIF controls. Figure S2G remains fixed in position but explicitly blocked pending raw biological-replicate quantification. The statistical direction of Figure S2C-E conflicts with the supplied prose and must be adjudicated before submission.

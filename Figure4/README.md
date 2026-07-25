# Figure 4 finalization package

This package is currently an evidence-safe review draft, not a submission-ready final figure.

## Rebuild

```powershell
python scripts/build_figure4_evidence_safe.py
python scripts/build_figureS4_evidence_safe.py
```

The scripts generate A4 portrait SVG, PDF, 300 dpi PNG and 600 dpi PNG/TIFF review files. Native Illustrator review files were saved from the generated PDF with PDF compatibility enabled. Experimental panels originate from the independent source AI files, not from PowerPoint screenshots.

## Current hard gates

See `QC/Figure4_evidence_audit.md`. Figure 4G and multiple Figure S4 panels cannot be finalized until the primary SCENIC, qPCR/Western, RNA-seq/GSEA and motif/footprinting sources are supplied or the corresponding legend claims are revised.

## Scientific safeguards

- The registered human Stereo-seq subset is used for the spatial context.
- The available scATAC data are rat rn7 validation data and are labeled as such.
- A predefined KLF4 target-gene proxy is not labeled as a true SCENIC regulon.
- Unsupported correlation directions and significance stars are excluded.
- Fate conversion and pluripotency are not asserted.


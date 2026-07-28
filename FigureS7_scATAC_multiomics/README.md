# Figure S7: scATAC-seq and cross-omics audit

This folder rebuilds Figure S7 from committed, figure-level source data and source-reported browser/UMAP assets.

## Rebuild

Run on Windows with Adobe Illustrator installed:

```powershell
.\scripts\run_all.ps1
```

The script creates:

- `figures/FigureS7_revised_v01_editable.ai`
- `figures/FigureS7_revised_v01.pdf`
- `figures/FigureS7_revised_v01.svg`
- `figures/FigureS7_revised_v01_600dpi.png`
- `figures/FigureS7_revised_v01_600dpi.tiff`

## Reproducibility boundary

- A is an RNA-anchored scATAC label-transfer projection, not a true joint-coordinate co-embedding.
- C uses source-reported ArchR browser tracks.
- D records a negative motif audit: zero KLF4 motif hits in the supplied peak annotation.
- E is rank-aligned state-axis integration and is not donor-paired.
- Large raw fragment and ArchR project objects are intentionally excluded from GitHub.

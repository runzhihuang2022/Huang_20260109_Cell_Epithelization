# Figure S6 A–G reproducible package

This folder rebuilds the revised Figure S6 A–G layout on an A4 portrait artboard.

## Rebuild

Run from PowerShell:

```powershell
.\scripts\run_all.ps1
```

The GitHub package commits derived source-data tables so the figure can be
rebuilt without the 303-MB Monocle2 MatrixMarket file:

```powershell
.\scripts\run_from_committed_source_data.ps1
```

`run_all.ps1` performs the raw Monocle2 KLF4 extraction and requires
`inputs/S4E_monocle2_counts_cells_by_genes.mtx`,
`inputs/S4E_monocle2_coordinates_pseudotime.csv` and
`inputs/S4E_monocle2_genes.csv`. These large/raw files are intentionally not
uploaded. Set `FIGURES6_NODE` and `FIGURES6_PYTHON` when Node.js or Python are
not on `PATH`. Adobe Illustrator is required for AI/PDF/600-dpi export.

Outputs:

- `figures/FigureS6_revised_AG_editable.ai`
- `figures/FigureS6_revised_AG.pdf`
- `figures/FigureS6_revised_AG_600dpi.png`
- `figures/FigureS6_revised_AG_600dpi.tiff`
- `figures/FigureS6_revised_AG.svg`

## Evidence boundaries

- Formal SCENIC RSS contains no KLF4 regulon.
- The predefined KLF4 target-set activity is a rescue analysis, not formal pySCENIC.
- Panel F retains source experimental artwork because raw cell-level measurements were not supplied.
- Panel G redraws source-reported GSEA values because the ranked RNA-seq list and raw GSEA output were not supplied.
- Spatial analyses use the registered human wound project subset and mask/anchor-defined territories.

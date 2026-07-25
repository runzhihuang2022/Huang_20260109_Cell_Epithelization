# Figure 4 / Figure S4 evidence audit

Date: 2026-07-22

## Frozen panel contract

The formal Figure 4 legend is treated as the panel-identity contract: A-I. The prior PowerPoint letters are not authoritative because they repeat letters and shift the experimental panels.

| Panel | Required content | Current source status | Decision |
|---|---|---|---|
| 4A | spatial high-edge/SVG candidate screen | Partial: 19 dpb wound-axis tables and spatial plots exist | Use only measured spatial and differential evidence; do not call the proxy a true SCENIC regulon |
| 4B | integrated spatial + scRNA DE + SCENIC screen of OSKM | Blocked in part: no true human SCENIC AUC/loom was found | Show OSKM spatial expression as exploratory; keep integrated-screen claim out until SCENIC source is supplied |
| 4C | KLF4 expression/regulon projection | Partial: KLF4 expression and a predefined target-gene proxy exist | Label explicitly as `KLF4 target-gene proxy`, not `SCENIC regulon activity` |
| 4D | human multiplex IF and quantification | Source AI found (`1.ai`) | Usable; retain original experimental pixels and reported replicate dots |
| 4E | KLF4-OE live imaging and morphology | Source AI found (`3.ai`) | Usable; retain original experimental pixels and source statistics |
| 4F | KRT14 induction in GFP+ cells | Source AI found (`3.ai`) | Usable; source image labels KRT5 in one version, so nomenclature must be reconciled before final legend |
| 4G | RNA-seq volcano and GSEA | No raw differential-expression/GSEA table or source code found | Do not use the PowerPoint crop; panel remains blocked pending source tables |
| 4H | scATAC accessibility + KLF4 motif | Rat rn7 scATAC UMAP/browser tracks exist; motif script produced zero KLF4 hits | Accessibility tracks can be shown as rat validation; motif enrichment/footprinting claim is blocked |
| 4I | working model | Can be drawn from supported observations | Use solid arrows only for KLF4-OE effects; upstream signal remains dotted/undefined |

## Statistical contradictions requiring manuscript correction

The live reanalysis does not support the originally drafted correlation directions.

- `KLF4-GRHL3`: rho = -0.0025, FDR = 0.7448 (not significant).
- `KLF4-TP63`: rho = 0.0189, FDR = 0.0267 (weak positive).
- `KLF4-TACSTD2`: rho = 0.0191, FDR = 0.0267 (weak positive).
- `KLF4-COL1A1`: rho = -0.0032, FDR = 0.7448 (not significant).
- `KLF4-ACTA2`: rho = 0.0373, FDR = 6.10e-6 (positive, not negative).
- `KLF4-FN1`: rho = 0.0311, FDR = 1.59e-4 (positive, not negative).

Therefore Figure S4C and the Results text must not state that all epithelial genes correlate positively while all matrix genes correlate negatively.

## Species audit

The available scATAC workflow uses `BSgenome.Rnorvegicus.UCSC.rn7` and is rat data. It must be identified as rat validation in the panel and legend; it cannot be described as human integrated scRNA/scATAC evidence.

## Missing source package

To close Figure 4 and Figure S4 without unsupported placeholders, the following are still required:

1. Human SCENIC regulon AUC/loom matrix and the exact KLF4 regulon definition.
2. KLF4-OE qPCR source values and Western blot original image/quantification.
3. RNA-seq differential-expression table, sample metadata, ranked gene list and GSEA result table.
4. Successful KLF4 motif enrichment/deviation and footprinting outputs, or a legend revision removing those claims.
5. Confirmation whether the KLF4-OE immunofluorescence endpoint is KRT14 or KRT5 in each source image.


# Figure 3 and Figure S3 final QC report

Date: 2026-07-22

## Layout and typography

- Figure 3: one A4 portrait page, 210 x 297 mm.
- Figure S3: one A4 portrait page, 210 x 297 mm.
- Panel labels: Arial Bold, 13 pt.
- Computational plot fonts were generated as Arial and scaled without distortion.
- Inter-panel gaps: 3.2 mm; no oversized total title.
- All linked images use aspect-ratio-preserving placement.

## Evidence checks passed

- Figure 3 A-K panel identities match the supplied legend.
- Figure S3 A-O panel identities are retained; missing panels are not silently dropped.
- Figure 3D statistics are linked to sample-level source tables.
- Figure 3K numbers match the FCS-derived machine-matched gating summary: P1=10,000; P2=1,259; P3=619; P3/all=6.19%; P3/P2=49.17%.
- Figure 3H-J experimental pixels were extracted from original PowerPoint image blobs; no resampling was applied before assembly.
- Figure S3A-I were regenerated from the live h5ad or source-generated spatial panels.
- Genes and mouse genotype text use biomedical italic conventions where present in the source experimental panels; cell-state names remain roman.

## Scientific cautions

1. `pbmc_final.h5ad` has no doublet-score metadata. S3B cannot yet support the manuscript sentence claiming a doublet-score analysis.
2. S3E PAGA edges are present, but the neighbor-edge enrichment audit is not significant after FDR correction; the panel reports `ns` rather than adding unsupported stars.
3. Figure 3J contains wound-only quantification. It does not support a normal-versus-wound inferential test.
4. The available FCS files do not contain a sufficiently documented biological condition/replicate mapping for S3M.
5. Figure S3J, K, N, and O source images/tables were not found in the registered assets.

## Required assets before submission

- S3B: per-cell doublet score and predicted-doublet field, plus method and threshold.
- S3J: independent VIM/KRT5 and VIM/KRT14 wound IF images with specimen IDs and scale bars.
- S3K: healthy-skin tissue IF controls for VIM/KRT5, VIM/KRT14, and PDGFRA/KRT14.
- S3M: biological-replicate table mapping normal and wound samples to double-positive percentages.
- S3N: representative clone images with clone/sample IDs and scale bars.
- S3O: replicate-level clone efficiency and marker-retention table.

## Submission status

- Figure 3: layout-complete; Figure 3J legend/statistical claim should be reconciled with the wound-only source quantification.
- Figure S3: review draft only; not submission-ready until S3B, J, K, M, N, and O evidence gaps are resolved.

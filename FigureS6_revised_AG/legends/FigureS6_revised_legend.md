# Figure S6. Reanalysis of KLF4-associated regulatory, trajectory, spatial, functional and transcriptional evidence supporting Figure 4.

**(A)** Formal SCENIC regulon-specificity score (RSS) heat map showing the ten regulons with the highest RSS in Fib_K14 across fibroblast states. KLF4 was not present as a regulon in the supplied formal SCENIC RSS matrix; therefore, this panel does not assign a SCENIC KLF4 activity score. A separately audited predefined KLF4 target-set activity analysis is provided in the source-data package and is explicitly treated as a rescue analysis rather than formal pySCENIC output.

**(B)** Monocle2 trajectory of Fib_K14, SAC_SG_Progenitor and keratinocyte states, colored by pseudotime or observed healing-time category, together with the binned KLF4 expression trend along pseudotime. The trajectory contains 14,356 cells. The cell-level KLF4–pseudotime association is descriptive because individual cells are not independent biological replicates.

**(C)** Spearman correlation heat map between KLF4 and epithelialization-associated genes (GRHL3, TP63 and TACSTD2) or stromal/scar-associated genes (COL1A1, ACTA2 and FN1) in Fib_K14. The sample-mean analysis (32 samples with at least 20 Fib_K14 cells) is the primary inferential analysis. Cell-level and spatial-bin analyses are shown as descriptive sensitivity analyses. Asterisks indicate Benjamini–Hochberg-adjusted q < 0.05 within each analysis level.

**(D)** Dot plot of POU5F1, SOX2, KLF4 and MYC expression across Fib_K14, other fibroblasts and keratinocyte states. Dot size indicates the percentage of expressing cells and color indicates mean expression.

**(E)** Spatial feature plots of OSKM factors in the registered 19 dpb p1 Stereo-seq section and regional mean expression across Un-epi, Epi-Front and Newly-epi territories. The project-restricted mask/anchor registration was used for spatial territories. POU5F1 and SOX2 were sparse; KLF4 and MYC were more broadly detected.

**(F)** Source experimental artwork showing KRT14 induction in GFP-positive fibroblast-lineage cells after KLF4 overexpression and time-resolved changes in cell length and length-to-width ratio. The underlying cell-level morphology table and raw KRT14-positive-cell quantification were not present in the supplied analysis package; the displayed statistics are therefore source-reported rather than independently recalculated here.

**(G)** Focused GSEA summary after KLF4 overexpression. Positive enrichment is shown in red and negative enrichment in blue. Enrichment scores and adjusted-P-value labels are source-reported from the current Figure 4/manuscript materials because the RNA-seq ranked gene list and raw GSEA result files were not supplied for independent rerunning.

All computational annotations use Arial, 8–14 pt. Correlation multiplicity was controlled by the Benjamini–Hochberg procedure. Cell- and bin-level associations are not interpreted as substitutes for biological-replicate-level inference. Epi-Front, epithelialization front; RSS, regulon-specificity score; OE, overexpression; OSKM, POU5F1/OCT4, SOX2, KLF4 and MYC; GSEA, gene set enrichment analysis.

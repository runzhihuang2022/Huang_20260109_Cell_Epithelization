# Figure 5 / Figure S5 scientific conflict audit

Status: **scientific approval required before final assembly**.

## Material conflicts

| Claim in supplied Results/legend | Reproducible evidence located | Consequence |
|---|---|---|
| Fib_K14–KC_Spinous_Mig co-localization is significant only at Epi-Front | Section-aware permutation table reports FDR = 1.0 in Un-epi, Epi-Front and Newly-epi for both 19dpb sections; observed NN distances are not shorter than randomized | Remove the significance claim or provide the original object/code that reproduces it |
| IGFL1 and IGFLR1 spatial overlap/adjacency is significant (P < 0.001) | Aggregated spatial correlation = -0.0562, permutation P = 0.7026 (107 bins) | Keep feature maps as descriptive; label the association non-significant |
| KC_Spinous_Mig IGFL1 rises toward the superficial epidermis | KC_Spinous_Mig surface-axis Spearman r = -0.0125, P = 0.305; wound-x r = 0.034, FDR = 0.00696 | Report the small x-axis association with effect size; remove the cell-type-specific y-axis significance claim |
| Microscopy-defined populations have shorter NN distances than randomized | No microscopy coordinate table was located. The available transcriptomic-marker proxy gives longer observed distances and FDR = 1.0 | Do not call the proxy an IF quantification; supply microscopy coordinates for Figure S5F |
| IGFL1-IGFLR1 is an enriched sender-receiver candidate | Candidate LR score = 0.0822, permutation P = 0.001996, FDR = 0.01098; ligand-positive 3.91%, receptor-positive 1.93% | Supported as a computational candidate only; not evidence of direct binding |
| IGFLR1 is higher in Fib_K14 | Fib_K14 mean = 0.05187 vs other fibroblasts 0.02528; Wilcoxon/FDR = 5.38e-22; proxy log2 fold change = 1.037 | Supported, but the observational-unit/pseudoreplication limitation must be stated |

## Legacy-code concerns

- The legacy network code raises selected interaction weights to at least 0.05 before plotting. Those edges are therefore display aids, not inferential evidence.
- The legacy regional expression bar plot applies Mann–Whitney tests to many bins from a section. Bins are not independent biological replicates; stars from this code must not be used as experiment-level inference.
- The supplied Figure 5 composite has A–H only; H is a text placeholder and panel I is absent.
- Computational panels extracted from PowerPoint are reference-only. Final computational panels must be regenerated from tables/data and exported as vector artwork.

## Required decision

Choose either:

1. Evidence-aligned revision: rewrite Figure 5A/D, Figure S5F and the corresponding Results to remove unsupported significance claims; or
2. Provenance recovery: provide the exact original analysis object, sample definition, permutation code and output that reproduce the claimed significant results.

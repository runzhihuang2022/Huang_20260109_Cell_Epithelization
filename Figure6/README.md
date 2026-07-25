# Figure 6 evidence unit

This package treats Figure 6 and Figure S6 as one evidence unit. It currently contains a review-ready A4 layout proof, not a submission-ready final figure.

## One-command rebuild

```powershell
C:\Users\ADMIN\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe run_figure6.py
```

The builder uses only `Pillow` and `reportlab`. It reads the four current embedded panel images under `inputs/current/` and writes versioned SVG, PDF, 600-dpi PNG and TIFF outputs.

## Current state

- Figure 6A-E: recovered from the original slide-7 embedded media and assembled on A4 portrait with 4 mm major gutters.
- Figure 6F: blocked because no dual-recombinase experimental source, control images, Z-stack or quantification table was found.
- Figure 6G: replaced in the review proof by an editable, evidence-strength-coded vector schematic. It deliberately distinguishes perturbation-supported links from inferred/associated links.
- Figure S6A-L: panel identities are locked to the supplied legend, but all source panels are unresolved. The package therefore contains a source-status layout blueprint only.
- Native Adobe Illustrator `.ai`: pending because Illustrator is not installed. No fake `.ai` file is included.

## Scientific boundaries

Do not combine scRNA-seq cells, spatial cells/bins/spots, animals, sections or technical replicates. Do not interpret intersectional promoter activity alone as proof of complete fibroblast-to-keratinocyte conversion, epidermal incorporation or functional necessity for wound closure.

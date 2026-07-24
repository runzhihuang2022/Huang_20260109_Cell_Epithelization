# Figure S1 revision v08

This package rebuilds the six-panel Figure S1 on one A4 portrait page.

## v08 changes

- The former clinical VIM/KRT14 immunofluorescence panel F was removed.
- The former keratinocyte spatial panel G was renumbered as panel F.
- Panel F contains five sections in one chronological row: Normal, 5 dpb, 12 dpb SPTDI, 19 dpb, and 2 mph.
- Panels E and F use the same five-column geometry, 35.6 × 6.0 mm map boxes, and a 1-mm scale bar on every spatial map.
- Panel E retains all 11 registered human Stereo-seq sections.

## One-command source rebuild

```powershell
python -m pip install -r requirements.txt
$env:FIGS1_SCRNA_H5AD = "F:\path\to\pbmc_final.h5ad"
$env:FIGS1_STEREO_ROOT = "F:\path\to\Wound_Healing_Annotation_Output_White"
$env:FIGS1_VISIUM_H5AD = "F:\path\to\Combined_Aligned_800k.h5ad"
python run_figure_s1.py
```

`run_figure_s1.py` regenerates the computational source panels. On Windows with Adobe Illustrator, run `scripts/merge_current_ai_with_ef_v08.jsx` to assemble the final editable AI/PDF/SVG and 600-dpi PNG. The TIFF is generated from the final PNG at 600 dpi.

## Registered data boundary

- Human scRNA-seq: 38 post-QC samples; cells are reported separately.
- Human Stereo-seq: exactly the registered 11 sections from the shared full source.
- Human 10x Visium: exactly 2 declared sections; spots are reported separately.

Large H5AD objects and original clinical images are not included in GitHub.


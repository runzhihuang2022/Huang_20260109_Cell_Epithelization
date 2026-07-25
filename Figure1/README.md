# Figure 1 reproducible figure unit

This package rebuilds Figure 1A-F and the assembled A4 composite for the human wound epithelialization atlas. In version 02, every bioinformatics panel is rendered from H5AD/CSV source data by code; no bioinformatics panel is cropped from PowerPoint.

## Scope

- Human scRNA-seq: 279,305 post-QC cells and 47 annotated states.
- Human Stereo-seq: exactly 11 registered sections and 387,061 cell bins.
- Figure 1F time points: Normal, 5 dpb, 12 dpb, 19 dpb, 26 dpb and 2 mph. The 6 mph and 9 mph scar-only sections are excluded.
- Figure 1F observational unit: section, not bin.

The exact sample whitelist, score parameters and genes found are recorded in `source_data/Figure1EF_score_provenance.json`.

## Rebuild

Use the `spatial-scrna-sop` environment or an environment providing Python 3.11, Scanpy, AnnData, NumPy, pandas and Pillow.

```powershell
$env:FIG1_ANNOTATED_H5AD = 'D:\path\to\combined_16samples_Harmony_Clustered_Fixed_Annotated_White.h5ad'
$env:FIGURE1_HUMAN_SCRNA_H5 = 'D:\path\to\pbmc_final.h5ad'
$env:FIGURE1_HUMAN_STEREO_ROOT = 'D:\path\to\per_section_annotated_h5ad'
$env:FIGURE1_19DPB_ANCHORS = 'D:\path\to\19dpb_p1_spatial_anchors.json'
python run_figure1.py
```

To reuse the committed small score cache and avoid reopening the 4.29 GB H5AD:

```powershell
python run_figure1.py --skip-scores
```

The full score calculation takes about one minute on the author workstation. The raw H5AD is not copied into this package.

The source generator for Figure S1A-G is archived as `scripts/source_build_figure1_supplement_qc.py`; the supplementary page assembler is `supplements/FigureS1/scripts/assemble_figure_s1.py`. These panels are generated from H5AD/CSV sources and inserted with preserved aspect ratios.

## Outputs

- Individual editable panels: `outputs/panels/Figure1[A-F]_*.svg` and `.pdf`
- A4 composite: `outputs/panels/Figure1_A4_v02.svg` and `.pdf`
- Submission proofs: `outputs/raster/*_600dpi.png` and `.tiff`
- Provenance and plot-ready values: `source_data/`
- Content and layout checks: `QC/`

Dense UMAP and spatial marks are code-rasterized inside the SVG/PDF; titles, labels, keys, axes, annotations and color bars remain vector-editable. H&E is the only main-figure content retained from an experimental raster source. A genuine PDF-compatible Illustrator file is provided in `outputs/vector/Figure1_final_editable.ai`.

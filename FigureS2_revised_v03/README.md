# Figure S2 revision v03

Reproducible code and source tables for the four-panel Figure S2 on one A4 portrait page.

## Main changes in v03

- Panel A labels `Un-epi`, `Epi-Front`, and `Newly-epi` at 30 degrees.
- Panel B compares different wound time points for each cell state and trajectory axis.
- Panel B uses the fixed 47-cell-state color registry.
- All 834 pairwise time-point tests were non-significant after Benjamini-Hochberg correction, so no `ns` labels or significance symbols are drawn.
- Panels C and D are unchanged from v02.

## Data boundary

Only the fixed 11-section human Stereo-seq registry is accepted. Panels A and B use the 10 wound sections; the registered Normal section is excluded from the wound-time trajectory. scRNA-seq cells and 10x Visium spots are not merged with Stereo-seq bins.

## Input layout

Set `FIGURES2_STEREOSEQ_ROOT` to the Stereo-seq project directory containing:

```text
pdf_output/
  mask/
  Wound_Healing_Annotation_Output_White/
```

If the variable is omitted, the script uses the manuscript project's Windows path.

## One-command rebuild

```powershell
python -m pip install -r requirements.txt
$env:FIGURES2_STEREOSEQ_ROOT = "F:\path\to\stereoseq"
python run_figure_s2.py
```

## Statistics

For each cell state and each trajectory axis, every available pair of wound time points is compared with a two-sided Mann-Whitney U test. Benjamini-Hochberg correction is applied jointly across all 834 comparisons. Full results are in `source_data/FigureS2B_timepoint_pairwise_statistics.csv`.

## Outputs

- `outputs/vector/FigureS2_revised_v03_editable.svg`
- `outputs/vector/FigureS2_revised_v03.pdf`
- `outputs/vector/FigureS2_revised_v03_editable.ai`
- `outputs/raster/FigureS2_revised_v03_600dpi.png`
- `outputs/raster/FigureS2_revised_v03_600dpi.tiff`
- `legends/FigureS2_legend_revised_v03.md`

The GitHub package includes the code, source tables, legend, and QC records. Large production files and previews are retained in the manuscript delivery directory.


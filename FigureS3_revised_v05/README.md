# Figure S3 revision v05

This package rebuilds Figure S3 on one A4 portrait page using Arial 6-14 pt.

## Panel structure

- **A:** time-resolved TOP10 Fib_K14-conditioned KC/SAC co-occurrence matrix.
- **B:** cross-cell-state co-occurrence of Fib_K14 with KC_Spinous_Mig and
  SAC_SG_Progenitor. Fib_K14 self-spatial aggregation is displayed in a
  separate axis and is not mixed with the cross-cell-state result.
- **C:** code-reproduced 26dpb_p2 source panel, preserving the original
  two-axis layout, 0-10,000 distance axis, full curve legend, original cell
  colors, and TOP10 ranking after excluding Fib_K14 self-reference.

## One-command rebuild

The repository includes the auditable source-data CSV files:

```powershell
python run_figure_s3.py
```

To recompute the source tables from the 11 registered Stereo-seq sections:

```powershell
$env:FIGS3_STEREO_ROOT = "F:\path\to\Wound_Healing_Annotation_Output_White"
python run_figure_s3.py --reanalyze
```

The rebuild exports editable SVG/PDF plus 600-dpi PNG/TIFF. On Windows with
Adobe Illustrator:

```powershell
.\scripts\export_ai_and_audit.ps1
```

## Statistics

For panel B, temporal group differences were tested at the section level using
the Kruskal-Wallis test across the six healing-time groups. The comparisons
for KC_Spinous_Mig, SAC_SG_Progenitor, and Fib_K14 self-aggregation were all
non-significant, so no P value is displayed in the panel. Exact values remain
available in `source_data/FigureS3_v05_time_group_statistics.csv`.

The distance-dependent panel C reproduces the original cumulative-radius
co-occurrence ratio display. Large H5AD objects are excluded from Git.

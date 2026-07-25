# Figure S3 revision v04

This package builds the three-panel Figure S3 supporting the Fib_K14-centered
spatial co-occurrence analysis.

## Panel structure

- **A:** time-resolved TOP10 Fib_K14-conditioned KC/SAC co-occurrence matrix.
- **B:** temporal trajectories for Fib_K14 self-co-occurrence,
  KC_Spinous_Mig and SAC_SG_Progenitor, with time-point permutation q values.
- **C:** 26 dpb_p2 distance-dependent co-occurrence curves and closest-distance
  TOP10 scores, highlighting Fib_K14 and KC_Spinous_Mig.

## Rebuild

Set the path containing the 11 registered `*_Annotated.h5ad` Stereo-seq files:

```powershell
$env:FIGS3_STEREO_ROOT = "F:\path\to\Wound_Healing_Annotation_Output_White"
python run_figure_s3.py
```

The rebuild performs 999 deterministic spatial-label permutations per section,
generates auditable source-data CSV files, and exports SVG, PDF, 600-dpi PNG and
600-dpi TIFF. On Windows with Adobe Illustrator, run:

```powershell
.\scripts\export_ai_and_audit.ps1
```

Large H5AD objects are intentionally excluded from GitHub.

## Statistical definition

- Conditioned state: `Fib_K14`.
- Fixed-radius test: 50 µm, using 0.5 µm per coordinate unit.
- Tested family: Fib_K14 self-reference plus all 16 KC/SAC states.
- Null model: 999 permutations of cell-state labels on fixed coordinates.
- Time-point P values compare the observed mean across registered sections with
  the mean permutation distribution.
- Benjamini-Hochberg correction: 17 states × 6 time points (102 tests).
- The distance curves reproduce the cumulative-radius probability-ratio
  algorithm with an exact cKDTree cumulative-pair-count implementation.


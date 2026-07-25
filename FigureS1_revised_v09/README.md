# Figure S1 revision v09

This package rebuilds the six-panel Figure S1 on one A4 portrait page.

## v09 changes

- Panels A-D are retained from the author-approved Figure S1 v08 AI.
- All spatial feature-plot boxes in panels E and F use the same physical
  dimensions: 35.6 × 8.0 mm.
- Panel E retains Number of UMI and Number of Gene maps for all 11 registered
  human Stereo-seq sections.
- Panel F retains five chronological sections: Normal, 5 dpb, 12 dpb SPTDI,
  19 dpb and 2 mph.
- Panel F highlighted keratinocyte points were reduced from 1.6 pt² to
  0.26 pt²; background points use 0.045 pt².
- Panel E and F legends are outside the spatial-map boxes and aligned to the
  lower-right of their respective panels.
- Every spatial map retains a 1-mm scale bar.

## One-command source rebuild

```powershell
python -m pip install -r requirements.txt
$env:FIGS1_STEREO_ROOT = "F:\path\to\Wound_Healing_Annotation_Output_White"
python run_figure_s1.py
```

`run_figure_s1.py` regenerates the E/F computational source panel. On Windows
with Adobe Illustrator, execute `scripts/merge_current_ai_with_ef_v09.jsx` to
merge the regenerated E/F layer with the approved A-D layer and export the
final AI/PDF/SVG/PNG composite.

The optional Illustrator merge expects the author-approved
`outputs/vector/FigureS1_revised_v08_editable.ai`. This manuscript-production
AI is not included in the public GitHub code package; the E/F computational
panel rebuild is fully runnable without it.

## Registered data boundary

- Human Stereo-seq: exactly the registered 11-section subset from the shared
  project source.
- Large H5AD objects are not included in GitHub.

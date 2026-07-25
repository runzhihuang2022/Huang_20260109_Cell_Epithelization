# Figure 5 / Figure S5 change specification

## Locked structure

- Figure 5 retains panels A–I.
- Figure S5 retains panels A–M.
- Figure 5 and Figure S5 are treated as one evidence unit; panel identities are not silently reassigned.

## Layout specification

- One A4 page per composite; Figure S5 portrait (210 × 297 mm). Figure 5 will use the orientation that preserves readable microscopy and spatial maps.
- Arial throughout; final-size text 8–14 pt. Panel letters 12–14 pt bold; headings 9–11 pt bold; labels/ticks/legends 8–9 pt.
- Gene symbols italic; cell-state labels and proteins upright. Statistical symbols and units upright.
- Similar plot types use matched widths/heights. Default inter-panel gap 3–4 mm; no oversized global title.
- White background, dark text, restrained color palette, vector computational graphics, native-resolution microscopy raster.

## Panel actions

- A–D: regenerate from auditable tables/data, with effect sizes and section-aware inference. Do not reuse PowerPoint crops.
- E: retain microscopy provisionally, normalize crop/scale/labels, and document provenance before final release.
- F–G: retain as layout placeholders only until replicate-level experimental values are supplied; rebuild graphs from those values.
- H: replace the placeholder with raw morphology images plus experiment-aware morphometry.
- I: create an editable mechanism panel only after the observed/inferred/proposed claims are approved.
- S5A–M: assemble only from the source types listed in `panel_manifest.csv`; missing analyses are not replaced by visual proxies without approval.

## Deliverables after evidence closure

- Editable AI plus SVG/PDF master.
- 600 dpi PNG/TIFF composite.
- Per-panel vector/raster exports.
- Final legends, source-data tables, scripts, one-command rebuild instructions and QC report.

# Figure 1 v02 revision QC

Date: 2026-07-22

- Figure 1A Mode 1 uses **Superficial** and **Deep**. Long morphology labels are split across two lines where needed.
- H&E morphology is labeled with the corresponding Mode spatial positions. H&E is the only retained experimental raster source.
- Figure 1B was regenerated from `pbmc_final.h5ad` using all 279,305 post-QC cells. The 47-state UMAP and key use the same established color registry.
- Figure 1C was regenerated from four registered per-section H5AD objects; axes use equal aspect and uniform 1-mm vector scale bars.
- Figure 1D was regenerated from the 19dpb_p1 H5AD plus registered spatial anchors; axes use equal aspect and consistent 2-mm/500-μm scale-bar styling.
- Figure 1E and Figure 1F remain code-generated from the registered 11-section subset.
- Spatial rotation follows the author-supplied `config_wound` registry exactly: `x = raw_x*cos(theta) - raw_y*sin(theta)` and `y = raw_x*sin(theta) + raw_y*cos(theta)`. No post-rotation y-axis inversion is applied.
- Figure 1C/1D and linked Figure S1E/S1F/S1G were re-rendered from H5AD coordinates after removing the unintended vertical mirror operation. Figure 1E's cached coordinates already used the registered orientation and the panel was re-rendered from that verified cache.
- Figure 1F uses sections—not bins—as statistical units. Two-sided Kruskal–Wallis omnibus tests are reported; all five processes are `ns`.
- The A4 assembler now nests each SVG with its native viewBox and `preserveAspectRatio="xMidYMid meet"`.
- The final SVG contains zero `preserveAspectRatio="none"` instances.
- Final PNG and TIFF dimensions are 4,961 × 7,016 pixels at approximately 600 dpi.
- Automated evidence-package validation passed with zero warnings.

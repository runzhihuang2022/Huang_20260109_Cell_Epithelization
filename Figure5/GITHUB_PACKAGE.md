# GitHub package notes

Configure and run:

```bash
export FIGURE5_STEREO_H5AD=/path/to/combined_16samples_Harmony_Clustered_Fixed.h5ad
export FIGURE5_MASK_DIR=/path/to/pdf_output/mask
export FIGURE5_METADATA=/path/to/19dpb_metadata_wound_axes.tsv.gz
python run_figure5.py
```

Only the registered `19dpb` and `19dpb_p1` sections are used for this panel.
The large H5AD, mask rasters, metadata cache, experimental images and final
submission binaries are intentionally excluded.

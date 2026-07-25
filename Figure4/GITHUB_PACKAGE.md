# GitHub package notes

One-command evidence-safe review build:

```bash
python run_figure4.py
```

This code deliberately preserves placeholders where primary evidence is
missing. Raw scRNA-seq/scATAC-seq objects, experimental images and submission
binaries are excluded. Do not remove the safeguards described in `README.md`
and the QC audit when reusing the code.

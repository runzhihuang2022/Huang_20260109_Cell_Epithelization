# Figure S5 — rat Fib_K14-like single-cell and spatial validation

This package rebuilds the animal-data component of the former Figure S3.

## Registered inputs

- Rat scRNA-seq: `F:\多组学分析skills\大鼠胚胎创面_成年大鼠创面\pbmc_final.h5ad`
- Rat spatial transcriptomics: `F:\时空组学流程分析skills\课题3+大鼠成年乳鼠胚胎+再生\data`
- Human scRNA-seq comparator: `F:\多组学分析skills\人创面\pbmc_final.h5ad`
- Human spatial comparator: the registered 11-section Figure S4 panel F.

## Critical interpretation rule

`Krt14` is absent from both the registered rat scRNA-seq and rat spatial gene
universes. Rat panels therefore use the existing annotation as a
`Fib_K14-like` state and show a prespecified measurable surrogate program
(`Pdgfra`, `Vim`, `Krt5`, `Tacstd2`). No missing Krt14 values are imputed.
Strict PDGFRA–KRT14 joint density is shown only for the human reference panel.

## Reproduction

Run in numeric order:

```powershell
python scripts/01_recompute_rat_doublets.py --h5ad <rat_scRNA.h5ad> --outdir tables
python scripts/02_generate_rat_scrna_panels.py --scrna <rat_scRNA.h5ad> --package .
python scripts/02b_export_rat_monocle_counts.py --scrna <rat_scRNA.h5ad> --package .
python scripts/02c_render_rat_paga.py .
Rscript scripts/03_run_rat_monocle2.R .
python scripts/04_build_qc_conservation_and_assemble.py `
  --rat-scrna <rat_scRNA.h5ad> `
  --rat-spatial <rat_spatial_root> `
  --human-scrna <human_scRNA.h5ad> `
  --human-f-source <FigureS4_panel_F_directory> `
  --package .
```

The Windows R build used here cannot reopen CJK paths after `normalizePath()`;
the delivered R script therefore preserves the caller-provided path. An ASCII
junction can be used when necessary.

## Statistical unit

- Scrublet: independently within each of 53 samples.
- Developmental comparison: one spatial section/sample is one replicate.
- 30 rat spatial sections: embryonic n=18, postnatal n=6, adult n=6.
- The embryonic-versus-adult Fib_K14-like fraction was directionally higher but
  not significant (two-sided Mann–Whitney P=0.626; BH q=0.626).

Panel-level PDF/SVG/600-dpi PNG files and source-data tables are retained.

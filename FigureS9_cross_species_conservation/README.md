# Figure S9: cross-species conservation support for Figure 6

This package rebuilds Figure S9 from frozen, auditable cross-species tables under
`F:\多组学分析skills`. It deliberately separates strict Fib_K14 calls from
surrogate/signature evidence and uses samples, rather than pooled cells, for
inferential comparisons when replication permits.

## Rebuild

```powershell
powershell -ExecutionPolicy Bypass -File scripts\run_all.ps1
```

The analysis environment is `xspecies-20260705`. Outputs include editable SVG,
vector PDF, 600-dpi PNG/TIFF and, when Adobe Illustrator is available, native AI.

## Scientific boundary

Panel C is a focused dataset-level embedding of the audited marker matrix. It is
not presented as a cell-level co-embedding because a frozen, cell-level integrated
object with a documented ortholog universe was not found. Rat spatial and
planarian Figure 6 signals are retained as surrogate/signature evidence rather
than strict PDGFRA+KRT14 Fib_K14 calls.

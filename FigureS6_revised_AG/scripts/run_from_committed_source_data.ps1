$ErrorActionPreference = 'Stop'
$node = if ($env:FIGURES6_NODE) { $env:FIGURES6_NODE } else { (Get-Command node -ErrorAction Stop).Source }
& $node (Join-Path $PSScriptRoot '02_build_figureS6_AG.js')
& (Join-Path $PSScriptRoot '03_export_ai_pdf_png_tiff.ps1')
& (Join-Path $PSScriptRoot '04_embed_rasters_and_reexport.ps1')
& (Join-Path $PSScriptRoot '05_validate_final_ai.ps1')

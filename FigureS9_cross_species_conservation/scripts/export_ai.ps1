$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$svg = Join-Path $root "figures\FigureS9_cross_species_conservation_v01.svg"
$ai = Join-Path $root "figures\FigureS9_cross_species_conservation_v01_editable.ai"

if (-not (Test-Path -LiteralPath $svg)) { throw "Missing SVG: $svg" }
$app = New-Object -ComObject Illustrator.Application
$doc = $app.Open($svg)
$opts = New-Object -ComObject Illustrator.IllustratorSaveOptions
$opts.PDFCompatible = $true
$doc.SaveAs($ai, $opts)
$doc.Close(2)
$app.Quit()
Write-Output $ai

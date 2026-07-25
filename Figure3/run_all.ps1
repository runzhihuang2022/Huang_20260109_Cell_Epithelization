$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = if ($env:FIGURE3_PYTHON) { $env:FIGURE3_PYTHON } else { 'python' }

& $python (Join-Path $root 'scripts\extract_experimental_panels.py')
& $python (Join-Path $root 'scripts\generate_figure_s3_computational.py')
& $python (Join-Path $root 'scripts\assemble_figure3.py')
& $python (Join-Path $root 'scripts\assemble_figure_s3.py')

Write-Host 'Figure 3 and Figure S3 PDF/SVG/PNG outputs regenerated.'
Write-Host 'Open the PDFs in Adobe Illustrator and save as AI for editable AI delivery.'

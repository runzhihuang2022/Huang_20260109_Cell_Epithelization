$ErrorActionPreference = 'Stop'
$env:NODE_PATH = 'C:\Users\ADMIN\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$node = 'C:\Users\ADMIN\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node (Join-Path $PSScriptRoot 'build_figure_s8.js')
& (Join-Path $PSScriptRoot 'export_ai_pdf.ps1')

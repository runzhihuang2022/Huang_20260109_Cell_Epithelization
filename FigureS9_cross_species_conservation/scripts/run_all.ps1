$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$conda = "D:\soft\conda\condabin\conda.bat"
& $conda run -n xspecies-20260705 python (Join-Path $PSScriptRoot "build_figure_s9.py")
if ($LASTEXITCODE -ne 0) { throw "Figure S9 build failed." }

$export = Join-Path $PSScriptRoot "export_ai.ps1"
if (Test-Path -LiteralPath $export) {
    powershell -ExecutionPolicy Bypass -File $export
}

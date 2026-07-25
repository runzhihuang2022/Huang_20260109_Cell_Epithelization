param(
    [string]$H5ad = 'F:\20250325cell背靠背拒稿\20251214上皮化\20260313重新拼图\时空组学\stereoseq\combined_16samples_Harmony_Clustered_Fixed.h5ad',
    [string]$Metadata = 'F:\20250325cell背靠背拒稿\20251214上皮化\20260422rebuttal\联系编辑\Final_Figure_Units\Figure5\source_data\19dpb_metadata_wound_axes.tsv.gz',
    [string]$MaskDir = 'F:\20250325cell背靠背拒稿\20251214上皮化\20260313重新拼图\时空组学\stereoseq\pdf_output\mask',
    [string]$Output = "$PSScriptRoot\..\outputs\panels\FibK14_19dpb_regional_expression"
)

$analysisPython = 'C:\Users\ADMIN\miniforge3\envs\spatial-scrna-sop\python.exe'
$plotPython = 'C:\Users\ADMIN\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$script = Join-Path $PSScriptRoot 'plot_19dpb_fibk14_regional_features.py'

& $analysisPython $script --mode extract --h5ad $H5ad --metadata $Metadata --mask-dir $MaskDir --output $Output
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $plotPython $script --mode plot --output $Output
exit $LASTEXITCODE


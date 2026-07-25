param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
$svgPath = Join-Path $Root "outputs\vector\FigureS3_revised_v05_editable.svg"
$aiPath = Join-Path $Root "outputs\vector\FigureS3_revised_v05_editable.ai"
$previewPath = Join-Path $Root "QC\FigureS3_revised_v05_AI_preview.png"
$auditPath = Join-Path $Root "QC\ai_editability_audit.csv"

if (-not (Test-Path -LiteralPath $svgPath)) {
    throw "Missing SVG source: $svgPath"
}

function JsPath([string]$Path) {
    return ($Path.Replace("\", "/").Replace("'", "\'"))
}

$svgJs = JsPath $svgPath
$aiJs = JsPath $aiPath
$previewJs = JsPath $previewPath
$jsx = @"
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
var src = new File('$svgJs');
var out = new File('$aiJs');
var preview = new File('$previewJs');
var doc = app.open(src);
var saveOpts = new IllustratorSaveOptions();
saveOpts.pdfCompatible = true;
saveOpts.embedICCProfile = true;
saveOpts.embedLinkedFiles = true;
doc.saveAs(out, saveOpts);
var pngOpts = new ExportOptionsPNG24();
pngOpts.antiAliasing = true;
pngOpts.artBoardClipping = true;
pngOpts.horizontalScale = 150;
pngOpts.verticalScale = 150;
pngOpts.transparency = false;
doc.exportFile(preview, ExportType.PNG24, pngOpts);
doc.close(SaveOptions.DONOTSAVECHANGES);
"@

$app = New-Object -ComObject Illustrator.Application
$null = $app.DoJavaScript($jsx)

$doc = $app.Open($aiPath)
$artboardRect = $doc.Artboards.Item(1).ArtboardRect
$row = [pscustomobject]@{
    File = [IO.Path]::GetFileName($aiPath)
    IllustratorVersion = $app.Version
    ArtboardWidthPt = [math]::Round([double]($artboardRect[2] - $artboardRect[0]), 2)
    ArtboardHeightPt = [math]::Round([math]::Abs([double]($artboardRect[3] - $artboardRect[1])), 2)
    Layers = $doc.Layers.Count
    TextFrames = $doc.TextFrames.Count
    PathItems = $doc.PathItems.Count
    CompoundPathItems = $doc.CompoundPathItems.Count
    GroupItems = $doc.GroupItems.Count
    PlacedItems = $doc.PlacedItems.Count
    RasterItems = $doc.RasterItems.Count
    PDFCompatible = $true
    Preview = [IO.Path]::GetFileName($previewPath)
    EditabilityStatus = "recommended editable"
}
$doc.Close(2)
$row | Export-Csv -LiteralPath $auditPath -NoTypeInformation -Encoding UTF8

Write-Output $row

$ErrorActionPreference = 'Stop'

$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$figureDir = Join-Path $packageRoot 'figures'
$svgPath = Join-Path $figureDir 'FigureS6_revised_AG.svg'
$aiPath = Join-Path $figureDir 'FigureS6_revised_AG_editable.ai'
$pdfPath = Join-Path $figureDir 'FigureS6_revised_AG.pdf'
$pngPath = Join-Path $figureDir 'FigureS6_revised_AG_600dpi.png'
$tifPath = Join-Path $figureDir 'FigureS6_revised_AG_600dpi.tiff'
$auditPath = Join-Path $packageRoot 'QC\FigureS6_AG_ai_audit.csv'

function Js([string]$s) {
  $b = [Text.StringBuilder]::new()
  foreach ($c in $s.ToCharArray()) {
    $n = [int][char]$c
    if ($n -eq 34) {[void]$b.Append('\"')}
    elseif ($n -eq 92) {[void]$b.Append('/')}
    elseif ($n -gt 126 -or $n -lt 32) {[void]$b.Append(('\u{0:x4}' -f $n))}
    else {[void]$b.Append($c)}
  }
  $b.ToString()
}

$jsx = @"
app.userInteractionLevel=UserInteractionLevel.DONTDISPLAYALERTS;
var doc=app.open(new File("$(Js $svgPath)"));
var ai=new IllustratorSaveOptions();
ai.pdfCompatible=true;
ai.compressed=true;
ai.embedLinkedFiles=true;
ai.fontSubsetThreshold=100.0;
doc.saveAs(new File("$(Js $aiPath)"),ai);
var pdf=new PDFSaveOptions();
pdf.preserveEditability=true;
pdf.compatibility=PDFCompatibility.ACROBAT8;
pdf.generateThumbnails=true;
pdf.optimization=true;
doc.saveAs(new File("$(Js $pdfPath)"),pdf);
var png=new ExportOptionsPNG24();
png.antiAliasing=true;
png.artBoardClipping=true;
png.transparency=false;
png.horizontalScale=833.333333;
png.verticalScale=833.333333;
doc.exportFile(new File("$(Js $pngPath)"),ExportType.PNG24,png);
var audit="metric,value\n";
audit+="textFrames,"+doc.textFrames.length+"\n";
audit+="pathItems,"+doc.pathItems.length+"\n";
audit+="placedItems,"+doc.placedItems.length+"\n";
audit+="rasterItems,"+doc.rasterItems.length+"\n";
audit+="width_pt,"+doc.width+"\n";
audit+="height_pt,"+doc.height+"\n";
var f=new File("$(Js $auditPath)");
f.encoding="UTF-8";
f.open("w");
f.write(audit);
f.close();
doc.close(SaveOptions.DONOTSAVECHANGES);
"DONE";
"@

$jsxPath = Join-Path $figureDir '_export_figureS6_AG.jsx'
[IO.File]::WriteAllText($jsxPath,$jsx,[Text.Encoding]::ASCII)
$app = New-Object -ComObject Illustrator.Application
try {
  $result = $app.DoJavaScriptFile($jsxPath)
  if ($result -ne 'DONE') { throw "Illustrator returned: $result" }
} finally {
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($app)
}

$python = if ($env:FIGURES6_PYTHON) { $env:FIGURES6_PYTHON } else { (Get-Command python -ErrorAction Stop).Source }
& $python -c "from PIL import Image; im=Image.open(r'$pngPath').convert('RGB'); im.save(r'$tifPath', compression='tiff_lzw', dpi=(600,600))"

Get-Item -LiteralPath $aiPath,$pdfPath,$pngPath,$tifPath |
  Select-Object FullName,Length,LastWriteTime

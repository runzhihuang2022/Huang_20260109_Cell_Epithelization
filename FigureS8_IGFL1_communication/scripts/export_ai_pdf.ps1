$ErrorActionPreference = 'Stop'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$figureDir = Join-Path $packageRoot 'figures'
$svgPath = Join-Path $figureDir 'FigureS8_revised_v01.svg'
$aiPath = Join-Path $figureDir 'FigureS8_revised_v01_editable.ai'
$pdfPath = Join-Path $figureDir 'FigureS8_revised_v01.pdf'
$auditPath = Join-Path $packageRoot 'QC\FigureS8_ai_audit.csv'

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
ai.pdfCompatible=true; ai.compressed=true; ai.embedLinkedFiles=true; ai.fontSubsetThreshold=100.0;
doc.saveAs(new File("$(Js $aiPath)"),ai);
var pdf=new PDFSaveOptions();
pdf.preserveEditability=true; pdf.compatibility=PDFCompatibility.ACROBAT8; pdf.generateThumbnails=true; pdf.optimization=true;
doc.saveAs(new File("$(Js $pdfPath)"),pdf);
var minSize=999,maxSize=0;
for(var i=0;i<doc.textFrames.length;i++){
  var z=doc.textFrames[i].textRange.characterAttributes.size;
  if(z<minSize)minSize=z; if(z>maxSize)maxSize=z;
}
var audit="metric,value\n";
audit+="textFrames,"+doc.textFrames.length+"\n";
audit+="pathItems,"+doc.pathItems.length+"\n";
audit+="placedItems,"+doc.placedItems.length+"\n";
audit+="rasterItems,"+doc.rasterItems.length+"\n";
audit+="min_font_pt,"+minSize+"\n";
audit+="max_font_pt,"+maxSize+"\n";
audit+="width_pt,"+doc.width+"\n";
audit+="height_pt,"+doc.height+"\n";
var f=new File("$(Js $auditPath)"); f.encoding="UTF-8"; f.open("w"); f.write(audit); f.close();
doc.close(SaveOptions.DONOTSAVECHANGES);
"DONE";
"@
$jsxPath = Join-Path $figureDir '_export_figureS8.jsx'
[IO.File]::WriteAllText($jsxPath,$jsx,[Text.Encoding]::ASCII)
$app = New-Object -ComObject Illustrator.Application
try {
  $result = $app.DoJavaScriptFile($jsxPath)
  if ($result -ne 'DONE') { throw "Illustrator returned: $result" }
} finally {
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($app)
}
Get-Item -LiteralPath $aiPath,$pdfPath | Select-Object FullName,Length,LastWriteTime
Get-Content -LiteralPath $auditPath

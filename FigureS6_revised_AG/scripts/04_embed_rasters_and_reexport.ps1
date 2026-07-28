$ErrorActionPreference = 'Stop'

$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$figureDir = Join-Path $packageRoot 'figures'
$inputDir = Join-Path $packageRoot 'inputs'
$aiPath = Join-Path $figureDir 'FigureS6_revised_AG_editable.ai'
$pdfPath = Join-Path $figureDir 'FigureS6_revised_AG.pdf'
$pngPath = Join-Path $figureDir 'FigureS6_revised_AG_600dpi.png'
$tifPath = Join-Path $figureDir 'FigureS6_revised_AG_600dpi.tiff'
$spatial = Join-Path $inputDir 'OSKM_spatial_featureplots.png'
$source = Join-Path $inputDir 'KLF4_OE_source_400pct.png'
$ifCrop = Join-Path $figureDir '_F_KRT14_IF_crop.png'
$morphCrop = Join-Path $figureDir '_F_morphology_crop.png'

$python = if ($env:FIGURES6_PYTHON) { $env:FIGURES6_PYTHON } else { (Get-Command python -ErrorAction Stop).Source }
& $python -c "from PIL import Image; im=Image.open(r'$source'); im.crop((60,190,730,950)).save(r'$ifCrop'); im.crop((820,40,2320,1120)).save(r'$morphCrop')"

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

# x, y-from-top, width, height
$jobs = @(
  @($spatial,18,439,215,43),
  @($ifCrop,248,438,91,112),
  @($morphCrop,343,438,234,112)
)
$jobsJs = ($jobs | ForEach-Object {
  '["{0}",{1},{2},{3},{4}]' -f (Js $_[0]),$_[1],$_[2],$_[3],$_[4]
}) -join ",`n"

$jsx = @"
app.userInteractionLevel=UserInteractionLevel.DONTDISPLAYALERTS;
var doc=app.open(new File("$(Js $aiPath)"));
while(doc.placedItems.length>0){doc.placedItems[0].remove();}
while(doc.rasterItems.length>0){doc.rasterItems[0].remove();}
var pageHeight=doc.height;
var jobs=[$jobsJs];
for(var i=0;i<jobs.length;i++){
  var p=doc.placedItems.add();
  p.file=new File(jobs[i][0]);
  p.width=jobs[i][3];
  p.height=jobs[i][4];
  p.left=jobs[i][1];
  p.top=pageHeight-jobs[i][2];
  p.embed();
}
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
doc.close(SaveOptions.DONOTSAVECHANGES);
"DONE";
"@

$jsxPath = Join-Path $figureDir '_embed_rasters_and_reexport.jsx'
[IO.File]::WriteAllText($jsxPath,$jsx,[Text.Encoding]::ASCII)
$app = New-Object -ComObject Illustrator.Application
try {
  $result = $app.DoJavaScriptFile($jsxPath)
  if ($result -ne 'DONE') { throw "Illustrator returned: $result" }
} finally {
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($app)
}
& $python -c "from PIL import Image; im=Image.open(r'$pngPath').convert('RGB'); im.save(r'$tifPath', compression='tiff_lzw', dpi=(600,600))"

Get-Item -LiteralPath $aiPath,$pdfPath,$pngPath,$tifPath |
  Select-Object FullName,Length,LastWriteTime

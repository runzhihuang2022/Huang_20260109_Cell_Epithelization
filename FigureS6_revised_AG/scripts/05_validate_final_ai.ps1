$ErrorActionPreference = 'Stop'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$aiPath = Join-Path $packageRoot 'figures\FigureS6_revised_AG_editable.ai'
$auditPath = Join-Path $packageRoot 'QC\FigureS6_AG_final_ai_audit.csv'

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
var doc=app.open(new File("$(Js $aiPath)"));
var minSize=999, maxSize=0;
for(var i=0;i<doc.textFrames.length;i++){
  var z=doc.textFrames[i].textRange.characterAttributes.size;
  if(z<minSize)minSize=z;
  if(z>maxSize)maxSize=z;
}
var csv="metric,value\n";
csv+="textFrames,"+doc.textFrames.length+"\n";
csv+="pathItems,"+doc.pathItems.length+"\n";
csv+="placedItems,"+doc.placedItems.length+"\n";
csv+="rasterItems,"+doc.rasterItems.length+"\n";
csv+="min_font_pt,"+minSize+"\n";
csv+="max_font_pt,"+maxSize+"\n";
csv+="width_pt,"+doc.width+"\n";
csv+="height_pt,"+doc.height+"\n";
var f=new File("$(Js $auditPath)");
f.encoding="UTF-8";
f.open("w");
f.write(csv);
f.close();
doc.close(SaveOptions.DONOTSAVECHANGES);
"DONE";
"@
$jsxPath = Join-Path $packageRoot 'figures\_validate_final_ai.jsx'
[IO.File]::WriteAllText($jsxPath,$jsx,[Text.Encoding]::ASCII)
$app = New-Object -ComObject Illustrator.Application
try {
  $result = $app.DoJavaScriptFile($jsxPath)
  if ($result -ne 'DONE') { throw "Illustrator returned: $result" }
} finally {
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($app)
}
Get-Content -LiteralPath $auditPath

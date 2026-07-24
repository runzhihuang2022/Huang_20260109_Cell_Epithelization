app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var scriptDir = File($.fileName).parent;
var root = scriptDir.parent;
var baseFile = new File(root.fsName + "/outputs/vector/FigureS1_revised_v07_editable.ai");
var lowerSvg = new File(root.fsName + "/outputs/vector/FigureS1_EF_revised_v08_editable.svg");
var outputAi = new File(root.fsName + "/outputs/vector/FigureS1_revised_v08_editable.ai");
var outputPdf = new File(root.fsName + "/outputs/vector/FigureS1_revised_v08.pdf");
var outputSvg = new File(root.fsName + "/outputs/vector/FigureS1_revised_v08_editable.svg");
var outputPng = new File(root.fsName + "/outputs/raster/FigureS1_revised_v08_600dpi.png");
var previewPng = new File(root.fsName + "/QC/FigureS1_revised_v08_Illustrator_preview.png");
var auditFile = new File(root.fsName + "/QC/FigureS1_revised_v08_ai_audit.txt");

var base = app.open(baseFile);
for (var li = base.layers.length - 1; li >= 0; li--) {
    if (base.layers[li].name.indexOf("E-G revised v07") >= 0) {
        base.layers[li].remove();
    }
}

var ab = base.artboards[0].artboardRect;
base.artboards[0].artboardRect = [ab[0], ab[1], ab[2], ab[1] - 841.8898];

var targetLayer = base.layers.add();
targetLayer.name = "Panels E-F revised v08";

var lower = app.open(lowerSvg);
var sourceItems = lower.layers[0].pageItems;
for (var j = sourceItems.length - 1; j >= 0; j--) {
    sourceItems[j].duplicate(targetLayer, ElementPlacement.PLACEATEND);
}
lower.close(SaveOptions.DONOTSAVECHANGES);

var targetLeft = 19.8423;
var targetTop = 306.0;
var importedItems = targetLayer.pageItems;
var unionLeft = 1e9;
var unionTop = -1e9;
for (var bi = 0; bi < importedItems.length; bi++) {
    try {
        var gb = importedItems[bi].geometricBounds;
        if (gb[0] < unionLeft) unionLeft = gb[0];
        if (gb[1] > unionTop) unionTop = gb[1];
    } catch (e) {}
}
var dx = targetLeft - unionLeft;
var dy = targetTop - unionTop;
for (var pi = 0; pi < importedItems.length; pi++) {
    try { importedItems[pi].translate(dx, dy); } catch (e) {}
}

var aiOptions = new IllustratorSaveOptions();
aiOptions.pdfCompatible = true;
aiOptions.embedICCProfile = true;
aiOptions.compressed = true;
base.saveAs(outputAi, aiOptions);

var pdfOptions = new PDFSaveOptions();
pdfOptions.compatibility = PDFCompatibility.ACROBAT7;
pdfOptions.preserveEditability = true;
pdfOptions.generateThumbnails = true;
base.saveAs(outputPdf, pdfOptions);
base.saveAs(outputAi, aiOptions);

var svgOptions = new ExportOptionsSVG();
svgOptions.embedRasterImages = true;
svgOptions.fontSubsetting = SVGFontSubsetting.None;
svgOptions.documentEncoding = SVGDocumentEncoding.UTF8;
base.exportFile(outputSvg, ExportType.SVG, svgOptions);

var pngOptions = new ExportOptionsPNG24();
pngOptions.antiAliasing = true;
pngOptions.transparency = false;
pngOptions.artBoardClipping = true;
pngOptions.horizontalScale = 833.3333;
pngOptions.verticalScale = 833.3333;
base.exportFile(outputPng, ExportType.PNG24, pngOptions);

var previewOptions = new ExportOptionsPNG24();
previewOptions.antiAliasing = true;
previewOptions.transparency = false;
previewOptions.artBoardClipping = true;
previewOptions.horizontalScale = 150;
previewOptions.verticalScale = 150;
base.exportFile(previewPng, ExportType.PNG24, previewOptions);

var sizes = [];
for (var k = 0; k < base.textFrames.length; k++) {
    try {
        var size = base.textFrames[k].textRange.characterAttributes.size;
        if (size > 0) sizes.push(size);
    } catch (e) {}
}
sizes.sort(function(a, b) { return a - b; });
var finalAb = base.artboards[0].artboardRect;
var report = [];
report.push("IllustratorVersion=" + app.version);
report.push("ArtboardRect=" + finalAb.join(","));
report.push("ArtboardMM=210x297");
report.push("Layers=" + base.layers.length);
report.push("TextFrames=" + base.textFrames.length);
report.push("PathItems=" + base.pathItems.length);
report.push("GroupItems=" + base.groupItems.length);
report.push("PlacedItems=" + base.placedItems.length);
report.push("RasterItems=" + base.rasterItems.length);
report.push("MinFontPt=" + (sizes.length ? sizes[0] : "NA"));
report.push("MaxFontPt=" + (sizes.length ? sizes[sizes.length - 1] : "NA"));
report.push("FormerPanelFRemoved=true");
report.push("FormerPanelGRenumberedToF=true");
report.push("PanelFLayout=single_row_five_timepoints");
report.push("PanelEAndFCommonScaleBar=1mm");
report.push("PanelEAndFCommonMapBox=35.6x6.0mm");
report.push("PDFCompatible=true");
auditFile.open("w");
auditFile.write(report.join("\n"));
auditFile.close();
base.close(SaveOptions.DONOTSAVECHANGES);
"DONE";


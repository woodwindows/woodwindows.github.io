import { MullionedWindows } from "./mullioned-windows.js";

Deno.test("shower-room", () => {
    const w = new MullionedWindows();
    // w.hingeInset = 400;

    // w.measured.width = 1065; // shower
    w.measured.width = 1650; // bedroom
    w.measured.height = 1365;
    w.measured.frameThickness = 45;
    w.measured.visibleSashThickness = 30;
    w.measured.openingWidth = 410;

    //w.materialSashThickness = 88;

    console.log("openings", w.measured.openings);

    console.log("opening-aligned", w.endMullionWidthOpeningAligned);
    console.log("glass-aligned", w.endMullionWidthGlassAligned);

    console.log("bestLeft", w.calculateOpeningLeft())
    console.log("bestWidth", w.calculateOpeningWidth());

    // OPT 1 - Center the sash on the opening
    // 45 left + 410 opening
    // so distribute left as 30 & 15
    // add the 13 to *both* sides of the opening
    // to ensure the frames are centered on the opening
    // 15 + 410 + 15 = 440

    // OPT 2 - Align the inner right edge of the sash with the opening
    // 15 + 410 + 44 + 3 = 

    // OPT 3 - Pick a size for the mullion
    // Pick any value that doesn't take you across the center line
    // Do this by picking the size of the mullion

    const measuredFrameThickness = w.measured.frameThickness;
    const measuredOpeningWidth = w.measured.openingWidth;

    const calculatedEndMullionWidth = (w.endMullionWidthOpeningAligned > 0) ? w.endMullionWidthOpeningAligned : w.endMullionWidthGlassAligned;


    //w.endMullionWidth = calculatedEndMullionWidth; //26;

    w.endMullionWidth = w.calculateOpeningLeft();

    // Centre the window on the existing opening
    // Downside is that if we are forced to cut off the left edge, we also cut off the right edge
    // const centeredCasement = 2 * (measured.frameThickness - w.workingEndMullionWidth) + measured.openingWidth;
    const centeredCasement = w.casementWidthCentered;

    // Pick a mullion width and define the new window based on that
    const preferredMullion = 52;
    const mullionDefinedCasement = Math.floor((w.measured.width - preferredMullion - (2*w.workingEndMullionWidth))/2);

    const leftObscured = (w.workingEndMullionWidth + w.gap + w.materialSashThickness) - w.measured.frameThickness;
    
    console.log("centered", centeredCasement);
    console.log("width-openingAligned", w.casementWidthOpeningAligned);
    console.log("width-glassAligned", w.casementWidthGlassAligned);
    console.log("mullionDefined", mullionDefinedCasement);
    console.log("leftObscured", leftObscured);

    // w.casementWidth = w.casementWidthOpeningAligned;
    w.casementWidth = w.calculateOpeningWidth();


    console.log(w.toString());

    console.log(w.pathLinerHorizontal);

    console.log(w.pathOpening);
    console.log(w.pathSashVertical);
    console.log(w.pathSashHorizontal);
    console.log(w.pathGlass);

    console.log(...w.measured.drawRects());
    console.log(...w.drawRects())

    console.log(w.drawX())
});
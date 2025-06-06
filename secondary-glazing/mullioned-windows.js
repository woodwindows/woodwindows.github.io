
export class ExteriorWindows {
    /**
     * The total height of the window reveal in which the secondary glazing can be placed
     * @type int */
    width = 1065;

    /**
     * The total width of the window reveal in which the secondary glazing can be placed
     * @type int */
    height = 1365;

    /**
     * The measured width of a single external window opening
     * @type int */
    openingWidth = 410;

    /**
     * The measured width of the external window frame (from the left edge of the reveal to the left edge of the first window opening)
     * @type int */
    frameThickness = 45;

    /**
     * The measured width of the visible external window sash while closed (from the left edge of the external frame to the left edge of the glass)
     * @type int */
    visibleSashThickness = 30;

    /** The position of the left side of the first opening */
    get openingLeft() {
        return this.frameThickness;
    }

    /** The position of the right side of the first opening
     * @type int */
    get openingRight() {
        return this.openingLeft + this.openingWidth;
    }

    /** The position of the left side of the first glass
     * @type int */
    get glassVisibleLeft() {
        return this.openingLeft + this.visibleSashThickness;
    }

    /** The position of the right side of the first glass
     * @type int */
    get glassVisibleRight() {
        return this.openingRight - this.visibleSashThickness;
    }

    /** The width of the glass
     * @type int */
    get glassVisibleWidth() {
        return this.glassVisibleRight - this.glassVisibleLeft;
    }

    /** The position of the left side of the first unit
     * @type int */
    get unitLeft() {
        return this.openingLeft;
    }

    /** The position of the right side of the first unit - includes half the mullion if there is one or the frame thickness otherwise.
     * @type int */
    get unitRight() {
        return this.openingRight + (this.mullionWidth/2 || this.frameThickness);
    }

    /** The number of casements in the run
     * @type int */
    get casementCount() {
        const allItems = this.width - (2 * this.openingLeft);
        const oneItem = this.openingWidth;
        return Math.max(Math.floor(allItems / oneItem), 1);
    }

    /** The number of mullions in the run
     * @type int */
    get mullionCount() {
        return Math.max(this.casementCount - 1, 0);
    }

    /** The width of the mullions (gaps between openings)
     * @type int */
    get mullionWidth() {
        if (this.mullionCount === 0) {
            return 0;
        }
        return (this.width - (2 * this.openingLeft) - (this.casementCount * this.openingWidth))/this.mullionCount;
    }

    /** The start/end position of each of the openings */
    get openings() {
        const result = [];
        let x = this.openingLeft;
        for (let i = 0; i < this.casementCount; ++i) {
            result.push([x, x + this.openingWidth]);
            x += this.openingWidth + this.mullionWidth;
        }
        return result;
    }

    *casements() {
        let x = this.openingLeft;
        for (let i = 0; i < this.casementCount; ++i) {
            const y = this.frameThickness; // We don't actually know vertical dimensions so this is an assumption
            const width = this.openingWidth;
            const height = this.height - (2 * y);
            const opening = { x, y, width, height };
            const openingToGlassOffset = this.visibleSashThickness;
            const glass = { x: opening.x + openingToGlassOffset,
                y: opening.y + openingToGlassOffset,
                width: opening.width - (2 * openingToGlassOffset),
                height: opening.height - (2 * openingToGlassOffset),
            };
            yield { opening, glass };
            x += this.openingWidth + this.mullionWidth;
        }
    }

    *drawRects() {
        yield `<rect x="${0}" y="${0}" width="${this.width}" height="${this.height}" class="run" />`;
        for (const casement of this.casements()) {
            const o = casement.opening;
            const g = casement.glass;
            yield `<rect x="${o.x}" y="${o.y}" width="${o.width}" height="${o.height}" class="opening" />`;
            yield `<rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" class="glass" />`;
        }
    }

    *drawLines() {
        for (const casement of this.casements()) {
            const o = casement.opening;
            const g = casement.glass;
            yield `<rect x="${o.x}" y="-1000" width="${o.width}" height="4000" class="opening" />`;
            yield `<rect x="${g.x}" y="-1000" width="${g.width}" height="4000" class="glass" />`;
        }
    }
}
/**
 * Defines secondary glazing for a set of casements with mullions between.
 * The secondary glazing has a liner, casements, stops, and a flyscreen.
 */
export class MullionedWindows {
    measured = new ExteriorWindows();

    /**
     * The width of the jamb - a vertical piece at the start and stop of a run of casements
     * @type int */
    jambWidth = 0;

    /**
     * The width in which one casement must fit - the opening width
     * (the number of casements and the width of the mullions is calculated from this) 
     * @type int */
    casementWidth = 550;

    /**
     * The setback from the face of the liner to the face of the sash
     * @type double */
    setback = 2;

    /**
     * The gap between the liner and the sash
     * or between the stops and the screen
     * @type double */
    gap = 3;

    /**
     * The gap between the glass and the rebate
     * @type double */
    glassGap = 3;

    /**
     * The distance between the bottom of the hinge and the bottom of the sash
     * or the distance between the top of the hinge and the top of the sash
     * If in doubt take a measurement off the existing exterior windows and use that.
     * @type double */
    hingeInset = 200;

    /**
     * The depth below the surface that the window catch handle will be mounted
     * @type double */
    handleMountingDepth = 1;

    /**
     * The thickness of the liner
     * @type double */
    materialLinerThickness = 20.5;

    /**
     * The depth of the liner
     * @type double */
    materialLinerDepth = 119;

    /**
     * The thickness of the sash frame
     * @type double */
    materialSashThickness = 44;

    /**
     * The thickness of the glass
     * @type double */
    materialGlassThickness = 4;

    /**
     * The long dimension of the stop
     * @type double */
    materialStopLong = 32;

    /**
     * The short dimension of the stop
     * @type double */
    materialStopShort = 12;

    /**
     * The long dimension of the screen
     * @type double */
    materialScreenLong = 38;

    /**
     * The short dimension of the screen
     * @type double */
    materialScreenShort = 15;

    /**
     * @type double */
    materialMouldingHeight = 9;

    /**
     * @type double */
    materialMouldingDepth = 15;

    /**
     * For our ovolo moulding, one flat is provided by leaving a gap in front of the moulding
     * @type double */
    materialMouldingGap = 4;

    /**
     * The depth of the putty used between the rebate and the glass
     * @type double */
    materialBeddingBack = 2;

    /**
     * The depth of the putty used between the glass and the moulding
     * @type double */
    materialBeddingFront = 0;

    /**
     * The distance between the bottom of the hinge and the bottom of the sash
     * or the distance between the top of the hinge and the top of the sash
     * @type double */
    materialHingeHeight = 75;

    /**
     * A blade and hook window catch is typically designed for outward opening windows.
     * For inward opening windows, the hook needs to be sunk lower so that the blade contacts the hook at the front instead of the back.
     * This is the offset necessary for an interior opening window compared to an exterior opening window to account for this.
     * @type double */
    materialHookOffset = 6;

    /** Calculates the best location for the left of the first glass */
    calculateGlassVisibleLeft() {
        const glassLeftMinimum = this.materialLinerThickness + this.gap + this.materialSashThickness;

        // The best location for the start of the glass is either the start of the external opening
        if (this.measured.openingLeft >= glassLeftMinimum) {
            return this.measured.openingLeft;
        }
        // or the start of the external glass
        if (this.measured.glassVisibleLeft >= glassLeftMinimum) {
            return this.measured.glassVisibleLeft;
        }
        // or the minimum possible
        return glassLeftMinimum;
    }

    /** Calculates the best location for the left of the first opening */
    calculateOpeningLeft() {
        // If the primary opening is less than the calculated opening, adjust it so that we don't show the secondary jamb and it's open back from outside
        return Math.min(this.calculateGlassVisibleLeft() - (this.gap + this.materialSashThickness), this.measured.openingLeft);
    }

    /** Calculates the best location for the right of the first glass */
    calculateGlassVisibleRight() {
        const glassRightMaximum = this.measured.unitRight - (this.materialSashThickness + this.gap + this.materialLinerThickness);
        // The best location for the right of the glass is the right of the external opening
        if (this.measured.openingRight <= glassRightMaximum) {
            return this.measured.openingRight;
        }
        // or the right of the external glass
        if (this.measured.glassVisibleRight <= glassRightMaximum) {
            return this.measured.glassVisibleRight;
        }
        // or the maximum possible
        return glassRightMaximum;
    }

    /** Calculates the best location for the right of the first opening */
    calculateOpeningRight() {
        // If the primary opening is greater than the calculated opening, adjust it so that we don't show the secondary mullion and it's open back from outside
        return Math.max(this.calculateGlassVisibleRight() + (this.materialSashThickness + this.gap), this.measured.openingRight);
    }

    /** Calculates the best width for the openings */
    calculateOpeningWidth() {
        return this.calculateOpeningRight() - this.calculateOpeningLeft();
    }

    /** The position of the left of the visible glass in the first casement */
    get glassVisibleLeft() {
        return this.openingLeft + this.gap + this.materialSashThickness;
    }

    /** The position of the right of the visible glass in the first casement */
    get glassVisibleRight() {
        return this.openingRight - (this.gap + this.materialSashThickness);
    }

    /** The width of the visible glass in the first casement */
    get glassVisibleWidth() {
        return this.glassVisibleRight - this.glassVisibleLeft;
    }

    /** The amount of glass from the exterior window that is outside the glass from the interior window */
    get glassLeftImpingement() {
        const impingement = this.glassVisibleLeft - this.measured.glassVisibleLeft;
        return Math.max(impingement, 0);
    }

    /** The amount of glass from the exterior window that is outside the glass from the interior window */
    get glassRightImpingement() {
        const impingement = this.measured.glassVisibleRight - this.glassVisibleRight;
        return Math.max(impingement, 0);
    }

    /** The amount of opening from the exterior window that is outside the glass from the interior window */
    get openingLeftImpingement() {
        const impingement = this.glassVisibleLeft - this.measured.openingLeft;
        return Math.max(impingement, 0);
    }

    /** The amount of opening from the exterior window that is outside the glass from the interior window */
    get openingRightImpingement() {
        const impingement = this.measured.openingRight - this.glassVisibleRight;
        return Math.max(impingement, 0);
    }

    /** The depth below the surface that the window catch hook will be mounted */
    get hookMountingDepth() {
        return this.setback /* The distance the casement sits behind the liner */
            + this.handleMountingDepth /* The distance the handle is sunk below the surface of the casement */
            + this.materialHookOffset; /* The distance the hook needs to be sunk to account for an inward opening window */
    }

    /** The distance between the bottom of the top hinge and the top of the bottom hinge */
    get hingeSeparation() {
        return this.sashHeight - (2 * (this.hingeInset + this.materialHingeHeight));
    }

    /** What the jamb width would need to be to align the left edge of the interior glass with the exterior opening */
    get jambWidthOpeningAligned() {
        return this.measured.openingLeft - (this.gap + this.materialSashThickness);
    }

    /** What the jamb width would need to be to align the left edge of the interior glass with the exterior glass */
    get jambWidthGlassAligned() {
        return this.measured.glassVisibleLeft - (this.gap + this.materialSashThickness);
    }

    /** What the casement width would need to be to align the center of the casement with the center of the exterior opening */
    get casementWidthCentered() {
        return 2 * (this.measured.frameThickness - this.workingJambWidth) + this.measured.openingWidth;
    }

    /** What the casement width would need to be to align the right of the interior glass with the right of the exterior opening */
    get casementWidthOpeningAligned() {
        // const rightInteriorGlass = this.workingJambWidth + CASEMENTWIDTH - (this.materialSashThickness + this.gap);
        return this.measured.openingRight - this.workingJambWidth + (this.materialSashThickness + this.gap);
    }

    /** What the casement width would need to be to align the right of the interior glass with the right of the exterior glass */
    get casementWidthGlassAligned() {
        // const rightInteriorGlass = this.workingJambWidth + CASEMENTWIDTH - (this.materialSashThickness + this.gap);
        return this.measured.glassVisibleRight - this.workingJambWidth + (this.materialSashThickness + this.gap);
    }

    /** Is the jamb wide enough to need a face piece? */
    get hasJambFace() {
        // jambs cannot be less than the material liner thickness
        return (this.jambWidth > this.materialLinerThickness);
    }

    /** The useful width of the jamb must be at least the material liner thickness */
    get workingJambWidth() {
        return this.hasJambFace ? this.jambWidth : this.materialLinerThickness;
    }

    get casementCount() {
        return this.measured.casementCount;
    }

    get mullionCount() {
        return this.casementCount - 1;
    }

    get mullionWidth() {
        if (this.mullionCount === 0) { return 0; }

        return ((this.measured.width - (2 * this.workingJambWidth)) - (this.casementWidth * this.casementCount)) / this.mullionCount;
    }

    /** Does the run have true mullions needing a face piece? */
    get hasMullionFace() {
        // mullions cannot be less than twice the material liner thickness
        return (this.mullionWidth > 2 * this.materialLinerThickness);
    }

    get openingWidth() {
        return this.casementWidth;
    }

    get openingHeight() {
        return this.measured.height - (2 * this.materialLinerThickness);
    }

    /** Opening area in m2 */
    get openingArea() {
        return (this.openingHeight/1000) * (this.openingWidth/1000);
    }

    get openingLeft() {
        return this.workingJambWidth;
    }

    get openingRight() {
        return this.openingLeft + this.openingWidth;
    }

    /** The start/end position of each of the openings */
    get openings() {
        const result = [];
        let x = this.openingLeft;
        for (let i = 0; i < this.casementCount; ++i) {
            result.push([x, x + this.openingWidth]);
            x += this.openingWidth + this.mullionWidth;
        }
        return result;
    }

    *casements() {
        let x = this.openingLeft;
        for (let i = 0; i < this.casementCount; ++i) {
            const y = this.materialLinerThickness;
            const width = this.openingWidth;
            const height = this.measured.height - (2 * y);
            const opening = { x, y, width, height };
            const openingToGlassOffset = this.gap + this.materialSashThickness;
            const glass = { x: opening.x + openingToGlassOffset,
                y: opening.y + openingToGlassOffset,
                width: opening.width - (2 * openingToGlassOffset),
                height: opening.height - (2 * openingToGlassOffset),
            };
            yield { opening, glass };
            x += this.openingWidth + this.mullionWidth;
        }
    }

    *drawRects() {
        yield `<rect x="${0}" y="${0}" width="${this.measured.width}" height="${this.measured.height}" class="run" />`;
        for (const casement of this.casements()) {
            const o = casement.opening;
            const g = casement.glass;
            yield `<rect x="${o.x}" y="${o.y}" width="${o.width}" height="${o.height}" class="opening" />`;
            yield `<rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" class="glass" />`;
        }
    }

    drawX() {
        const boxMargin = 100;
        const boxHeight = this.measured.height + 2 * boxMargin;
        const boxWidth = this.measured.width + 2 * boxMargin;

        // width="${boxWidth}" height="${boxHeight}" 
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-${boxMargin} -${boxMargin} ${boxWidth} ${boxHeight}" preserveAspectRatio="yes" fill="none">
<style>
    .background { fill: pink; }
    .run {
      fill: white;
      stroke: black;
      stroke-width: 1;
    }
    .opening {
      stroke: black;
    }
    .glass {
      stroke: grey;
    }

    #primary .opening {
      stroke: grey;
    }

    #primary .glass {
      stroke: gray;
    }

    #secondary .opening {
      stroke-width: 3;
    }

    #secondary .glass {
      fill: rgba(105, 103, 236, 0.75);
    }
</style>
<rect x="-1000" y="-1000" width="10000" height="10000" class="background" />
<g id="secondary">
${[...this.drawRects()].join("\n")}
</g>
<g id="primary">
${[...this.measured.drawLines()].join("\n")}
</g>
</svg>
        `;
    }

    get sashWidth() {
        return this.openingWidth - (2 * this.gap);
    }

    get sashHeight() {
        return this.openingHeight - (2 * this.gap);
    }

    get screenWidth() {
        return this.openingWidth - (2 * this.materialStopShort) - (2 * this.gap);
    }

    get screenHeight() {
        return this.openingHeight - (2 * this.materialStopShort) - (2 * this.gap);
    }

    /**
     * The horizontal stop for the casement is full width
     */
    get stopHorizontal() {
        return this.openingWidth;
    }

    /**
     * The vertical stop for the casement is partial height
     */
    get stopVertical() {
        return this.openingHeight - (2 * this.materialStopShort);
    }

    get mouldingHorizontal() {
        return this.sashWidth - (2 * this.rebateHeightRemainder);
    }

    get mouldingVertical() {
        return this.sashHeight - (2 * this.rebateHeightRemainder);
    }

    get glassWidth() {
        return this.sashWidth - (2 * this.rebateHeightRemainder) - (2 * this.glassGap);
    }

    get glassHeight() {
        return this.sashHeight - (2 * this.rebateHeightRemainder) - (2 * this.glassGap);
    }

    get glassOverlap() {
        return this.rebateHeight - this.glassGap;
    }

    get glassVisibleHeight() {
        return this.glassHeight - (2 * this.glassOverlap);
    }

    /**
     * The horizontal stop for the screen is partial width
     */
    get screenStopHorizontal() {
        return this.openingWidth - (2 * this.materialStopLong);
    }

    /**
     * The vertical stop for the screen is full height
     */
    get screenStopVertical() {
        return this.openingHeight;
    }

    get rebateHeight() {
        return this.materialMouldingHeight;
    }

    get rebateDepth() {
        return this.materialMouldingGap + this.materialMouldingDepth + this.materialBeddingFront + this.materialGlassThickness + this.materialBeddingBack;
    }

    get rebateHeightRemainder() {
        return this.materialSashThickness - this.rebateHeight;
    }

    get rebateDepthRemainder() {
        return this.materialSashThickness - this.rebateDepth;
    }

    get tenonThickness() {
        return Math.ceil(this.materialSashThickness / 3);
    }

    get tenonDimension() {
        return this.materialSashThickness - this.rebateHeight;
    }

    get depth() {
        return this.setback + this.materialSashThickness + this.materialStopLong + this.materialStopShort;
    }

    get parts() {
        const casementCount = this.casementCount;
        const openingCasementCount = this.openingCasementCount ?? casementCount;

        const count = 2 * casementCount;
        const screenedCasementCount = 2 * casementCount; // Don't use openingCasementCount here because there is no seal between secondary casements in our design

        const jambs = this.hasJambFace ? [{ count: 2, name: "jamb", dimensions: [this.materialLinerThickness, this.jambWidth, this.measured.height - this.materialLinerThickness] }] : [];
        const mullions = this.hasMullionFace ? [{ count: this.mullionCount, name: "mullion", dimensions: [this.materialLinerThickness, this.mullionWidth, this.measured.height - this.materialLinerThickness] }] : [];

        const linersVertical = (this.hasJambFace == this.hasMullionFace) ? [
            {
                count,
                name: "Liner (Vertical)",
                dimensions: [this.materialLinerThickness, this.materialLinerDepth - (this.hasMullionFace ? this.materialLinerThickness : 0), this.measured.height - this.materialLinerThickness],
                notes: (this.hasMullionFace) ? `Sized to allow the mullion & jamb faces` : ``
            },
        ] : [
            {
                count: 2,
                name: "Liner (Vertical, Jamb)",
                dimensions: [this.materialLinerThickness, this.materialLinerDepth - (this.hasJambFace ? this.materialLinerThickness : 0), this.measured.height - this.materialLinerThickness],
                notes: (this.hasJambFace) ? `Sized to allow the jamb faces` : ``
            },
            {
                count: count - 2,
                name: "Liner (Vertical, Mullion)",
                dimensions: [this.materialLinerThickness, this.materialLinerDepth - (this.hasMullionFace ? this.materialLinerThickness : 0), this.measured.height - this.materialLinerThickness],
                notes: (this.hasMullionFace) ? `Sized to allow the mullion faces` : ``
            },
        ];

        return [
            {
                count: 2,
                name: "Liner (Horizontal)",
                dimensions: [this.materialLinerThickness, this.materialLinerDepth, this.measured.width],
                notes: (this.hasJambFace || this.hasMullionFace) ? `Cut recesses for the mullion or jamb faces` : ``
            },
            ...linersVertical,
            ...jambs,
            ...mullions,
            { count, name: "Sash (Horizontal)", dimensions: [this.materialSashThickness, this.materialSashThickness, this.sashWidth] },
            { count, name: "Sash (Vertical)", dimensions: [this.materialSashThickness, this.materialSashThickness, this.sashHeight] },
            { count, name: "Moulding (Horizontal)", dimensions: [this.materialMouldingHeight, this.materialMouldingDepth, this.mouldingHorizontal] },
            { count, name: "Moulding (Vertical)", dimensions: [this.materialMouldingHeight, this.materialMouldingDepth, this.mouldingVertical] },
            { count, name: "Stop (Horizontal)", dimensions: [this.materialStopShort, this.materialStopLong, this.stopHorizontal] },
            { count, name: "Stop (Vertical)", dimensions: [this.materialStopShort, this.materialStopLong, this.stopVertical] },
            { count: screenedCasementCount, name: "Screen Stop (Horizontal)", dimensions: [this.materialStopShort, this.materialStopLong, this.screenStopHorizontal] },
            { count: screenedCasementCount, name: "Screen Stop (Vertical)", dimensions: [this.materialStopShort, this.materialStopLong, this.screenStopVertical] },
            { count: screenedCasementCount, name: "Screen (Horizontal)", dimensions: [this.materialScreenShort, this.materialScreenLong, this.screenWidth] },
            { count: screenedCasementCount, name: "Screen (Vertical)", dimensions: [this.materialScreenShort, this.materialScreenLong, this.screenHeight] },
            { count: casementCount, name: "Glass", dimensions: [this.glassWidth, this.glassHeight, this.materialGlassThickness] },
            { count, name: "Hinge" },
            { count: casementCount, name: "Fastener" },
        ];
    }

    * _plhBase() {
        for (let i = 0; i < this.casementCount; ++i) {
            yield `h -${this.openingWidth}`;
            if (i !== this.casementCount - 1) {
                yield `v -${this.materialLinerThickness / 2}`;
                yield `h -${this.materialLinerThickness}`;
                yield `v ${this.materialLinerThickness / 2}`;
                yield `h -${this.mullionWidth - (2 * this.materialLinerThickness)}`;
                yield `v -${this.materialLinerThickness / 2}`;
                yield `h -${this.materialLinerThickness}`;
                yield `v ${this.materialLinerThickness / 2}`;
            }
        }
    }

    * _pathLinerHorizontal() {
        const rightJamb = this.hasJambFace ? [
            `v ${this.materialLinerThickness}`,
            `h -${this.jambWidth - this.materialLinerThickness}`,
            `v -${this.materialLinerThickness / 2}`,
        ] : [`v ${this.materialLinerThickness / 2}`];

        const leftJamb = this.hasJambFace ? [
            `v ${this.materialLinerThickness / 2}`,
            `h -${this.jambWidth - this.materialLinerThickness}`,
            `v -${this.materialLinerThickness}`,
        ] : [`v -${this.materialLinerThickness / 2}`];

        const commands = [
            `h ${this.measured.width}`,
            ...rightJamb,
            `h -${this.materialLinerThickness}`,
            `v ${this.materialLinerThickness / 2}`,
            ...this._plhBase(),
            `v -${this.materialLinerThickness / 2}`,
            `h -${this.materialLinerThickness}`,
            ...leftJamb,
            "z",
        ];
        yield* commands;
    }

    get pathLinerHorizontal() {

        const commands = [
            "M 0 0",
            ...this._pathLinerHorizontal()
        ];
        return commands.join(" ");
    }

    * _pathSashVertical() {
        const commands = [
            `h ${this.tenonDimension}`,
            `v ${this.tenonDimension}`,
            `l ${this.rebateHeight} ${this.rebateHeight}`,
            `v ${this.sashHeight - (2 * this.materialSashThickness)}`,
            `l -${this.rebateHeight} ${this.rebateHeight}`,
            `v ${this.tenonDimension}`,
            `h -${this.tenonDimension}`,
            `v -${this.sashHeight}`,
            "z",
        ];
        yield* commands;
    }

    * _pathSashHorizontal() {
        const commands = [
            `h ${this.sashWidth}`,
            `v ${this.tenonDimension}`,
            `h -${this.tenonDimension}`,
            `l -${this.rebateHeight} ${this.rebateHeight}`,
            `h -${this.sashWidth - (2 * this.materialSashThickness)}`,
            `l -${this.rebateHeight} -${this.rebateHeight}`,
            `h -${this.tenonDimension}`,
            `v -${this.tenonDimension}`,
            "z",
        ];
        yield* commands;
    }

    get pathSashVertical() {

        const commands = [
            "M 0 0",
            ...this._pathSashVertical()
        ];
        return commands.join(" ");
    }

    get pathSashHorizontal() {

        const commands = [
            "M 0 0",
            ...this._pathSashHorizontal()
        ];
        return commands.join(" ");
    }

    * rect(width, height) {
        yield* [
            `h ${width}`,
            `v ${height}`,
            `h -${width}`,
            `v -${height}`,
        ];
    }

    get pathGlass() {

        const commands = [
            `M ${this.tenonDimension + this.glassGap} ${this.tenonDimension + this.glassGap}`,
            ...this.rect(this.glassWidth, this.glassHeight),
            "z"
        ];
        return commands.join(" ");
    }

    get pathOpening() {

        const commands = [
            `M 0 0`,
            ...this.rect(this.openingWidth, this.openingHeight),
            "z"
        ];
        return commands.join(" ");
    }

    toJSON() {
        return {
            ...this,
            hingeSeparation : this.hingeSeparation,
            hookMountingDepth: this.hookMountingDepth,
            casementCount: this.casementCount,
            mullionCount: this.mullionCount,
            mullionWidth: this.mullionWidth,
            openingWidth: this.openingWidth,
            openingHeight: this.openingHeight,
            sashWidth: this.sashWidth,
            sashHeight: this.sashHeight,
            glassWidth: this.glassWidth,
            glassHeight: this.glassHeight,
            glassOverlap: this.glassOverlap,
            glassVisibleWidth: this.glassVisibleWidth,
            glassVisibleHeight: this.glassVisibleHeight,
            stopHorizontal: this.stopHorizontal,
            stopVertical: this.stopVertical,
            screenStopHorizontal: this.screenStopHorizontal,
            screenStopVertical: this.screenStopVertical,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            rebateHeight: this.rebateHeight,
            rebateDepth: this.rebateDepth,
            rebateHeightRemainder: this.rebateHeightRemainder,
            rebateDepthRemainder: this.rebateDepthRemainder,
            tenonThickness: this.tenonThickness,
            tenonDimension: this.tenonDimension,
            depth: this.depth,

            openings: this.openings,

            parts: this.parts,

            diagnostics: this.diagnostics,
        };
    }

    toString() {
        return JSON.stringify(this, null, 2);
    }

    get diagnostics() {
        const list = [];

        if (this.openingArea < 0.33 || this.openingWidth < 450 || this.openingHeight < 450) {
            list.push(`EGRESS WARNING: The area, width, or height of each secondary glazing opening is too small for an egress window.`);
        }

        if (this.openingLeft > this.measured.openingLeft) {
            list.push(`The secondary glazing opening is inside the primary opening on the left. The jamb would be visible from the outside and would need a back which isn't in the parts list.`);
        }

        if (this.openingRight < this.measured.openingRight) {
            list.push(`The secondary glazing opening is inside the primary opening on the right. The mullion would be visible from the outside and would need a back which isn't in the parts list.`);
        }

        if (this.jambWidth < this.materialLinerThickness) {
            list.push(`The jamb width is smaller than the liner thickness (${this.jambWidth} < ${this.materialLinerThickness})`);
        }

        if (this.glassLeftImpingement > 0) {
            list.push(`${this.glassLeftImpingement} mm of glass hidden on the left`);
        }

        if (this.glassRightImpingement > 0) {
            list.push(`${this.glassRightImpingement} mm of glass hidden on the right`);
        }

        if (this.openingLeftImpingement > 0) {
            list.push(`${this.openingLeftImpingement} mm of opening hidden on the left`);
        }

        if (this.openingRightImpingement > 0) {
            list.push(`${this.openingRightImpingement} mm of opening hidden on the right`);
        }

        if (this.materialGlassThickness > 6) {
            list.push(`I hope your glass is double glazing. ${this.materialGlassThickness} mm is thick for single glazing.`);
        }

        if (this.casementWidth > this.measured.width - (2 * this.materialLinerThickness)) {
            list.push(`Casement is too wide to fit in available space`);
        }
        if (this.casementCount < 1) {
            list.push(`No casements`);
        }
        if (this.mullionWidth > this.materialLinerDepth) {
            list.push(`The mullion width is greater than the liner material. (${this.mullionWidth} > ${this.materialLinerDepth})`);
        }
        if (this.jambWidth > this.materialLinerDepth) {
            list.push(`The jamb width is greater than the liner material`);
        }
        if (this.glassGap > 5) {
            list.push(`The glass gap is large. Are you sure you want to leave ${this.glassGap} mm around the glass? 3mm is typical.`);
        }
        if (this.glassOverlap < 0) {
            list.push(`The glass is too small. The glass doesn't overlap the rebate.`);
        } else if (this.glassOverlap < 5) {
            list.push(`The glass only overlaps the rebate by ${this.glassOverlap} mm`);
        }

        if (this.materialBeddingBack < 2) {
            list.push(`Back bedding the glass helps stop rattles, keeps things watertight, and reduces stress on the glass. Consider increasing your back bedding depth.`);
        } else if (this.materialBeddingBack > 6) {
            list.push(`Consider reducing the back bedding. ${this.materialBeddingBack} mm is a lot. 2-4 mm should be enough.`);
        }

        if (this.rebateDepthRemainder < 0) {
            list.push(`Rebate depth has taken too much material from the sash. Nothing remains.`);
        } else if (this.rebateDepthRemainder < 8) {
            list.push(`Rebate depth has taken too much material from the sash. Only ${this.rebateDepthRemainder} mm remains. `);
        }

        if (this.rebateHeightRemainder < 0) {
            list.push(`Rebate height has taken too much material from the sash. Nothing remains.`);
        } else if (this.rebateHeightRemainder < 8) {
            list.push(`Rebate height has taken too much material from the sash. Only ${this.rebateHeightRemainder} mm remains.`);
        }

        const stopDifference = this.materialStopLong - this.materialStopShort;
        if (stopDifference < 6) {
            list.push(`Your stop material needs to be decently rectangular so that it can be positioned in two orientations for the window stop and the screen stop`);
        }

        if (this.depth > this.materialLinerDepth) {
            list.push(`Deeper than the liner material allows`);
        }

        if (this.materialStopLong > this.materialSashThickness + this.gap) {
            list.push(`The flyscreen stop will show`);
        } else if (this.materialStopLong > this.materialSashThickness) {
            list.push(`The flyscreen stop will probably show`);
        }

        if (this.hingeSeparation < 0) {
            list.push(`The hinges will overlap`);
        } else if (this.hingeSeparation < this.hingeInset) {
            list.push(`The hinges are too close to each other with only ${this.hingeSeparation} mm between them, but an inset of ${this.hingeInset} mm. Reduce the inset to better separate the hinges.`);
        }
        return list;
    }
}
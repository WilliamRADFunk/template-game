import { Scene } from 'three';

import { RightTopStatsText1 } from '../../../controls/text/stats/right-top-stats-text-1';
import { RightTopStatsText2 } from '../../../controls/text/stats/right-top-stats-text-2';
import { RightTopStatsText3 } from '../../../controls/text/stats/right-top-stats-text-3';
import { RightTopStatsText4 } from '../../../controls/text/stats/right-top-stats-text-4';
import { LeftTopStatsCol2Text1 } from '../../../controls/text/stats/left-top-stats-col2-text-1';
import { LeftTopStatsCol2Text2 } from '../../../controls/text/stats/left-top-stats-col2-text-2';
import { LeftTopStatsCol2Text3 } from '../../../controls/text/stats/left-top-stats-col2-text-3';
import { LeftTopStatsCol2Text4 } from '../../../controls/text/stats/left-top-stats-col2-text-4';
import { RightTopStatsCol3Text1 } from '../../../controls/text/stats/right-top-stats-col3-text-1';
import { RightTopStatsCol3Text2 } from '../../../controls/text/stats/right-top-stats-col3-text-2';
import { RightTopStatsCol3Text3 } from '../../../controls/text/stats/right-top-stats-col3-text-3';
import { RightTopStatsCol3Text4 } from '../../../controls/text/stats/right-top-stats-col3-text-4';
import { MineCountText } from '../custom-controls/mine-count-text';
import { LeftTopStatsText1 } from '../../../controls/text/stats/left-top-stats-text-1';
import { TextType } from '../../../controls/text/text-type';
import { LeftTopStatsText2 } from '../../../controls/text/stats/left-top-stats-text-2';
import { LeftTopStatsText3 } from '../../../controls/text/stats/left-top-stats-text-3';
import { LeftTopStatsText4 } from '../../../controls/text/stats/left-top-stats-text-4';
import { TextBase } from '../../../controls/text/text-base';
import { COLORS } from '../../../styles/colors';
import { PlanetSpecifications, OreTypes, OreQuantity } from '../../../models/planet-specifications';

let border: string;

/**
 * @class
 * The stats controller class - coordinates everything text in the scene.
 */
export class TextCtrl {
    /**
     * Timeout id for when mined quantity text should vanish.
     */
    private _mineTextTimeoutId: any;

    /**
     * The specifications of the planet on which these stats are based.
     */
    private _planetSpecifications: PlanetSpecifications;

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * Groups of text elements
     */
    private _textElements: { [key: string]: TextBase } = { };

    /**
     * Constructor for the TextCtrl Class.
     * @param scene ThreeJS scene to add meshes to for help screen.
     * @param planetSpecifications the specifications of the planet on which these stats are based.
     * @param windSpeed speed of the wind on the planet.
     * @param startSpeedH starting horizontal speed for lander.
     * @param startSpeedV starting vertical speed for lander.
     * @param startOxygen starting percentage of remaining oxygen for lander and crew.
     * @param startFuel starting percentage of lander's fuel
     * @param brdr dev environment brdr set in creating class.
     */
    constructor(
        scene: Scene,
        planetSpecifications: PlanetSpecifications,
        windSpeed: number,
        startSpeedH: number,
        startSpeedV: number,
        startOxygen: number,
        startFuel: number,
        brdr: string) {
        this._scene = scene;
        this._planetSpecifications = planetSpecifications;
        border = brdr;

        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        this._textElements.horizontalSpeed = new LeftTopStatsText1(
            `Horizontal Speed: ${startSpeedH}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.verticalSpeed = new LeftTopStatsText2(
            `Descent Speed: ${startSpeedV}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.oxygenLevel = new LeftTopStatsText3(
            `Oxygen Level: ${startOxygen}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.fuelLevel = new LeftTopStatsText4(
            `Fuel Level: ${startFuel}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.commonRocksDisplay = new LeftTopStatsCol2Text1(
            `Common Rock Blocks: `,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.dangerBlocksDisplay = new LeftTopStatsCol2Text2(
            `Danger/Impenetrable Blocks: `,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.waterIceFoodBlocksDisplay = new LeftTopStatsCol2Text3(
            `Water/Ice/Food Blocks: `,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.oreBlocksDisplay = new LeftTopStatsCol2Text4(
            `${OreTypes[this._planetSpecifications.ore]} Blocks: `,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.collected = new RightTopStatsCol3Text1(
            'Collected (units)',
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.crewCollected = new RightTopStatsCol3Text2(
            '0 Crew Recovered',
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.waterAndFoodCollected = new RightTopStatsCol3Text3(
            '0 Water / 0 Food',
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.oreCollected = new RightTopStatsCol3Text4(
            `0 ${OreTypes[this._planetSpecifications.ore]}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        const windSpeedText = `Wind Speed: ${
            windSpeed < 0 ? '<span class="fa fa-long-arrow-left"></span>' : ''
        } ${
            Math.abs(windSpeed).toFixed(6)
        } ${
            windSpeed > 0 ? '<span class="fa fa-long-arrow-right"></span>' : ''
        }`;
        this._textElements.windSpeed = new RightTopStatsText1(
            windSpeedText,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.gravity = new RightTopStatsText2(
            `Gravity: ${this._planetSpecifications.gravity.toFixed(5)}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.oreType = new RightTopStatsText3(
            `Ore Type: ${OreTypes[this._planetSpecifications.ore]}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.oreQuantity = new RightTopStatsText4(
            `Ore Quantity: ${OreQuantity[this._planetSpecifications.oreQuantity]}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.mineCount = new MineCountText(
            `0 x ${OreTypes[this._planetSpecifications.ore]}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);
        this._textElements.mineCount.hide();
    }

    /**
     * Checks to see if text is a given color.
     * @param name key of the text to be checked.
     * @param value color value to compare against.
     * @returns TRUE if the text is already the given color, FALSE if they don't match.
     */
    private _isColorEqual(name: string, value: string): boolean {
        return this._textElements[name].color === value;
    }

    /**
     * Checks first ivalue is above or equal to a threshold is met, and if the text isn't already the given color. Then changes the texts color.
     * @param threshold the amount to be compared against.
     * @param value the current amount to compare against the threshold.
     * @param name key of the text to be checked.
     */
    public changeColorAboveThreshold(threshold: number, value: number, name: string): void {
        if (value >= threshold && this._isColorEqual(name, COLORS.neutral)) {
            this.cycle(name, COLORS.selected);
        } else if (value < threshold && this._isColorEqual(name, COLORS.selected)) {
            this.cycle(name, COLORS.neutral);
        }
    }

    /**
     * Checks first ivalue is below a threshold is met, and if the text isn't already the given color. Then changes the texts color.
     * @param threshold the amount to be compared against.
     * @param value the current amount to compare against the threshold.
     * @param name key of the text to be checked.
     */
    public changeColorBelowThreshold(threshold: number, value: number, name: string): void {
        if (value < threshold && this._isColorEqual(name, COLORS.neutral)) {
            this.cycle(name, COLORS.selected);
        }
    }

    /**
     * Runs the cycle method for the given text property.
     * @param name key of the text to be checked.
     * @param value param to pass into the text's cycle method.
     */
    public cycle(name: string, value: string): void {
        this._textElements[name].cycle(value);
    }

    /**
     * Cycles through all the text properties in the text controller.
     */
    public cycleAll(): void {
        Object.keys(this._textElements).forEach(x => x && this._textElements[x].cycle());
    }

    /**
     * Standard cleanup method when destroying this controller.
     */
    public dispose(): void {
        Object.keys(this._textElements)
            .filter(key => !!this._textElements[key])
            .forEach(key => this._textElements[key].dispose());
    }

    /**
     * Creates a short-lived text showing amount mined.
     * @param value the text strnig to generate.
     */
    public generateMinedText(value: string): void {
        this._textElements.mineCount.update(value);
        this._textElements.mineCount.show();
        if (this._mineTextTimeoutId) {
            clearTimeout(this._mineTextTimeoutId);
            this._mineTextTimeoutId = null;
        }
        this._mineTextTimeoutId = setTimeout(() => {
            this._textElements.mineCount.hide();
        }, 1500);
    }

    /**
     * Hide all of the text content from view.
     */
    public hide(): void {
        Object.values(this._textElements).filter(x => !!x).forEach(text => {
            if (text.isVisible()) {
                text.hide();
            }
        });
    }

    /**
     * Resize all the text based on change in window size.
     * @param height of the new screen.
     * @param left point of game area from window left.
     * @param top point from top of screen the text should be.
     * @param width of the new screen.
     */
    public onWindowResize(height: number, left: number, top: number, width: number): void {
        Object.keys(this._textElements)
            .filter(key => !!this._textElements[key])
            .forEach(key => this._textElements[key].resize({ height, left, top, width }));
    }

    /**
     * Resets texts displaying amount of loot player has collected thus far.
     */
    public resetLoot(): void {
        this._textElements.crewCollected.update(`0 crew recovered`);
        this._textElements.waterAndFoodCollected.update(`0 water / 0 food`);
        this._textElements.oreCollected.update(`0 ${OreTypes[this._planetSpecifications.ore]}`);
    }

    /**
     * Shows all the text content.
     */
    public show(): void {
        Object.values(this._textElements).filter(x => !!x).forEach(text => {
            text.show();
        });
        this._textElements.mineCount.hide();
    }

    /**
     * Runs the given text property's update method.
     * @param name key of the text to be checked.
     * @param value param to pass into the text's update method.
     */
    public update(name: string, value: string): void {
        this._textElements[name].update(value);
    }
}
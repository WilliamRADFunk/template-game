import { Scene, Texture } from "three";

import { SceneType } from "../../models/scene-type";
import { LeftTopPanel } from "../../controls/panels/left-top-panel";
import { RightTopPanel } from "../../controls/panels/right-top-panel";
import { LeftTopMiddlePanel } from "../../controls/panels/left-top-middle-panel";
import { RightTopMiddlePanel } from "../../controls/panels/right-top-middle-panel";
import { LeftBottomMiddlePanel } from "../../controls/panels/left-bottom-middle-panel";
import { RightBottomMiddlePanel } from "../../controls/panels/right-bottom-middle-panel";
import { LeftBottomPanel } from "../../controls/panels/left-bottom-panel";
import { RightBottomPanel } from "../../controls/panels/right-bottom-panel";
import { LoadButton } from "../../controls/buttons/load-button";
import { BUTTON_COLORS } from "../../styles/button-colors";
import { LeftTopTitleText } from "../../controls/text/title/left-top-title-text";
import { COLORS } from "../../styles/colors";
import { TextType } from "../../controls/text/text-type";
import { ButtonBase } from "../../controls/buttons/button-base";
import { RightTopTitleText } from "../../controls/text/title/right-top-title-text";
import { LeftTopMiddleTitleText } from "../../controls/text/title/left-top-middle-title-text";
import { RightTopMiddleTitleText } from "../../controls/text/title/right-top-middle-title-text";
import { LeftBottomMiddleTitleText } from "../../controls/text/title/left-bottom-middle-title-text";
import { RightBottomMiddleTitleText } from "../../controls/text/title/right-bottom-middle-title-text";
import { LeftBottomTitleText } from "../../controls/text/title/left-bottom-title-text";
import { NextButton } from "../../controls/buttons/next-button";
import { RightBottomTitleText } from "../../controls/text/title/right-bottom-title-text";
import { TextMap } from "../../models/text-map";
import { PreviousButton } from "../../controls/buttons/previous-button";
import { LeftTopProfile } from "../../controls/profiles/left-top-profile";
import { RightTopProfile } from "../../controls/profiles/right-top-profile";
import { RightTopMiddleProfile } from "../../controls/profiles/right-top-middle-profile";
import { LeftTopMiddleProfile } from "../../controls/profiles/left-top-middle-profile";
import { LeftBottomMiddleProfile } from "../../controls/profiles/left-bottom-middle-profile";
import { RightBottomMiddleProfile } from "../../controls/profiles/right-bottom-middle-profile";
import { LeftBottomProfile } from "../../controls/profiles/left-bottom-profile";
import { RightBottomProfile } from "../../controls/profiles/right-bottom-profile";
import { LeftTopDialogueText } from "../../controls/text/dialogue/left-top-dialogue-text";
import { PlanetSpecifications, OreTypes, OreQuantity, PlanetLandColors, SkyColors, SkyTypes, PlanetLandTypes } from "../../models/planet-specifications";
import { ToggleBase } from "../../controls/buttons/toggle-base";
import { SmallToggleButton } from "../../controls/buttons/small-toggle-button";
import { FreestyleText } from "./custom-controls/freestyle-text";
import { MinusButton } from "../../controls/buttons/minus-button";
import { PlusButton } from "../../controls/buttons/plus-button";
import { FreestyleSquareButton } from "../../controls/buttons/freestyle-square-button";

// const border: string = '1px solid #FFF';
const border: string = 'none';

const buttonScale: number = 2;

/**
 * @class
 * Keeps track of all things menu related accessible only to dev.
 */
export class DevMenu {
    private _landAndMinePlanetSpec: PlanetSpecifications = {
        gravity: 0.0001,
        hasWater: true,
        isFrozen: false,
        isLife: true,
        ore: OreTypes.Gold,
        oreQuantity: OreQuantity.Average,
        peakElevation: 3,
        planetBase: PlanetLandTypes.Red,
        skyBase: SkyTypes.Blue,
        wind: 0
    };
    /**
     * List of profiles on page 1.
     */
    private _page1profiles: { [key: string]: LeftTopProfile | RightTopProfile } = {};

    /**
     * List of profiles on page 2.
     */
    private _page2profiles: { [key: string]: LeftBottomMiddleProfile | LeftTopMiddleProfile | LeftTopProfile | RightBottomMiddleProfile | RightTopMiddleProfile | RightTopProfile } = {
        leftBottomMiddleProfile: null,
        leftTopMiddleProfile: null,
        leftTopProfile: null,
        rightBottomMiddleProfile: null,
        rightTopProfile: null,
        rightTopMiddleProfile: null
    };

    /**
     * List of profiles on page 3.
     */
    private _page3profiles: { [key: string]: LeftBottomProfile | RightBottomProfile } = {
        leftBottomProfile3: null,
        rightBottomProfile3: null
    };

    /**
     * List of profiles.
     */
    private _profiles: { [key: string]: LeftTopProfile | RightTopProfile } = {
        ...this._page1profiles,
        ...this._page2profiles,
        ...this._page3profiles
    };

    /**
     * List of buttons on page 1.
     */
    private _page1buttons: { [key: string]: ButtonBase | ToggleBase } = {
        changeOreTypeButton: null,
        changeOreQuantityButton: null,
        changeSkyTypeButton: null,
        gravityMinusButton: null,
        gravityPlusButton: null,
        isFrozenButton: null,
        isLifeButton: null,
        isWaterButton: null,
        launchGameMenuButton: null,
        launchIntroSceneButton: null,
        launchLandAndMineSceneButton: null,
        launchRepairSceneButton: null,
        launchShipLayoutSceneButton: null,
        launchTravelSceneButton: null,
        launchVertexMapSceneButton: null,
        nextPageButton: null,
        peakElevationMinusButton: null,
        peakElevationPlusButton: null,
        windMinusButton: null,
        windPlusButton: null,
    };
    /**
     * List of buttons on page 2.
     */
    private _page2buttons: { [key: string]: ButtonBase } = {
        launchPlanetRaidSceneButton: null,
        nextPageButton2: null,
        previousPageButton2: null,
    };
    /**
     * List of buttons on page 3.
     */
    private _page3buttons: { [key: string]: ButtonBase } = {
        previousPageButton3: null,
    };

    /**
     * List of buttons.
     */
    private _buttons: { [key: string]: ButtonBase | ToggleBase };

    /**
     * Current page number.
     */
    private _currentPage: number = 1;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    /**
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private _scene: Scene;

    /**
     * Groups of text elements for page 1.
     */
    private _page1textElements: TextMap = {
        freestyleGravityText: null,
        freestyleGravityReadoutText: null,
        freestyleOreTypeText: null,
        freestyleOreQuantityText: null,
        freestylePeakElevationReadoutText: null,
        freestylePeakElevationText: null,
        freestyleSkyColorReadoutText: null,
        freestyleSkyColorText: null,
        freestyleWindText: null,
        freestyleWindReadoutText: null,
        leftBottomMiddleTitleText: null,
        leftBottomTitleText: null,
        leftTopMiddleTitleText: null,
        leftTopTitleText: null,
        rightBottomTitleText: null,
        rightBottomMiddleTitleText: null,
        rightTopMiddleTitleText: null,
        rightTopTitleText: null,
    };

    /**
     * Groups of text elements for page 2.
     */
    private _page2textElements: TextMap = {
        leftBottomTitleText2: null,
        leftTopDialogueText2: null,
        rightBottomTitleText2: null
    };

    /**
     * Groups of text elements for page 3.
     */
    private _page3textElements: TextMap = {
        leftBottomTitleText3: null
    };

    /**
     * Groups of text elements.
     */
    private _textElements: TextMap;

    /**
     * Groups of text texture.
     */
    private readonly _textures: { [key: string]: Texture };

    /**
     * Constructor for the Menu class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param menuFont loaded font to use for menu button text.
     * @hidden
     */
    constructor(scene: SceneType, callbacks: { [key: string]: (arg1?: any, arg2?: any) => void }, textures: { [key: string]: Texture }) {
        this._scene = scene.scene;
        this._textures = textures;

        this._listenerRef = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._listenerRef, false);

        const leftTopPanel = new LeftTopPanel(this._scene);
        const rightTopPanel = new RightTopPanel(this._scene);
        const leftTopMiddlePanel = new LeftTopMiddlePanel(this._scene);
        const rightTopMiddlePanel = new RightTopMiddlePanel(this._scene);
        const leftBottomMiddlePanel = new LeftBottomMiddlePanel(this._scene);
        const rightBottomMiddlePanel = new RightBottomMiddlePanel(this._scene);
        const leftBottomPanel = new LeftBottomPanel(this._scene);
        const rightBottomPanel = new RightBottomPanel(this._scene);

        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);
//#region Page 1
    //#region LaunchGameMenu
        this._page1textElements.leftTopTitleText = new LeftTopTitleText(
            'Game Menu',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        let onClick = () => {
            this._page1buttons.launchGameMenuButton.disable();
            callbacks.activateGameMenu();
        };

        this._page1buttons.launchGameMenuButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.1 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);
    //#endregion
    //#region LaunchIntroScene
        this._page1textElements.rightTopTitleText = new RightTopTitleText(
            'Intro',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchIntroSceneButton.disable();
            callbacks.activateIntroScene();
        };

        this._page1buttons.launchIntroSceneButton = new LoadButton(
            { left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.1 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);
    //#endregion
    //#region LaunchShipLayout
        this._page1textElements.leftTopMiddleTitleText = new LeftTopMiddleTitleText(
            'Ship Layout',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchShipLayoutSceneButton.disable();
            callbacks.activateShipLayoutScene();
        };

        this._page1buttons.launchShipLayoutSceneButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.375 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);
    //#endregion
    //#region LaunchRepairScene
        this._page1textElements.rightTopMiddleTitleText = new RightTopMiddleTitleText(
            'Repair',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchRepairSceneButton.disable();
            callbacks.activateRepairScene();
        };

        this._page1buttons.launchRepairSceneButton = new LoadButton(
            { left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.375 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);
    //#endregion
    //#region LaunchTravelScene
        this._page1textElements.leftBottomMiddleTitleText = new LeftBottomMiddleTitleText(
            'Travel',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchTravelSceneButton.disable();
            callbacks.activateTravelScene();
        };

        this._page1buttons.launchTravelSceneButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.61 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);
    //#endregion
    //#region LaunchVertexMapScene
        this._page1textElements.rightBottomMiddleTitleText = new RightBottomMiddleTitleText(
            'Vertex Map',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchVertexMapSceneButton.disable();
            callbacks.activateVertexMapScene();
        };

        this._page1buttons.launchVertexMapSceneButton = new LoadButton(
            { left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.61 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);
    //#endregion
    //#region LaunchLandAndMineScene
        this._page1textElements.leftBottomTitleText = new LeftBottomTitleText(
            'Land & Mine',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchLandAndMineSceneButton.disable();
            callbacks.activateLandAndMineScene(
                {
                    gravity: this._landAndMinePlanetSpec.gravity,
                    hasWater: (this._buttons.isWaterButton as ToggleBase).getState(),
                    isFrozen: (this._buttons.isFrozenButton as ToggleBase).getState(),
                    isLife: (this._buttons.isLifeButton as ToggleBase).getState(),
                    ore: this._landAndMinePlanetSpec.ore,
                    oreQuantity: this._landAndMinePlanetSpec.oreQuantity,
                    peakElevation: this._landAndMinePlanetSpec.peakElevation,
                    planetBase: this._landAndMinePlanetSpec.planetBase,
                    skyBase: this._landAndMinePlanetSpec.skyBase,
                    wind: this._landAndMinePlanetSpec.wind
                },
                {
                    drillLength: 5,
                    fuelBurn: 0.05,
                    horizontalCrashMargin: 0.001,
                    oxygenBurn: 0.02,
                    verticalCrashMargin: 0.01
                });
        };

        this._page1buttons.launchLandAndMineSceneButton = new LoadButton(
            { left: left + (0.145 * width), height, top: 0.785 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale * 0.75);

        this._page1textElements.rightBottomTitleText = new RightBottomTitleText(
            'Next Page',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);

        const groupLeftStart = 0.015;

        // TODO: Lander specifications buttons.

        //#region LaunchLandAndMineScene Row -1
        let rowSub1Left = groupLeftStart;
        this._page1textElements.freestylePeakElevationText = new FreestyleText(
            'peak elevation:',
            { left: left + (rowSub1Left * width), height, top: 0.835 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newPeakElevation = this._landAndMinePlanetSpec.peakElevation - 1;
            if (newPeakElevation < 1) {
                newPeakElevation = 1;
            }
            this._landAndMinePlanetSpec.peakElevation = newPeakElevation;
            this._page1textElements.freestylePeakElevationReadoutText.update(this._landAndMinePlanetSpec.peakElevation.toFixed(0));
        };

        rowSub1Left += 0.14;
        this._page1buttons.peakElevationMinusButton = new MinusButton(
            { left: left + (rowSub1Left * width), height, top: 0.835 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        rowSub1Left += 0.035;
        this._page1textElements.freestylePeakElevationReadoutText = new FreestyleText(
            this._landAndMinePlanetSpec.peakElevation.toFixed(0),
            { left: left + (rowSub1Left * width), height, top: 0.835 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newPeakElevation = this._landAndMinePlanetSpec.peakElevation + 1;
            if (newPeakElevation > 20) {
                newPeakElevation = 20;
            }
            this._landAndMinePlanetSpec.peakElevation = newPeakElevation;
            this._page1textElements.freestylePeakElevationReadoutText.update(this._landAndMinePlanetSpec.peakElevation.toFixed(0));
        };

        rowSub1Left += 0.025;
        this._page1buttons.peakElevationPlusButton = new PlusButton(
            { left: left + (rowSub1Left * width), height, top: 0.835 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 0
        let row0Left = groupLeftStart;
        this._page1textElements.freestyleSkyColorText = new FreestyleText(
            'Sky Color:',
            { left: left + (row0Left * width), height, top: 0.875 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);

        onClick = () => {
            let nextNum = this._landAndMinePlanetSpec.skyBase + 1;
            if (nextNum > Object.keys(SkyTypes).length / 2) {
                nextNum = 1;
            }
            this._landAndMinePlanetSpec.skyBase = nextNum;
            this._page1textElements.freestyleSkyColorReadoutText.update(SkyTypes[this._landAndMinePlanetSpec.skyBase]);
        };

        row0Left += 0.095;
        this._page1buttons.changeSkyTypeButton = new FreestyleSquareButton(
            { left: left + (row0Left * width), height, top: 0.875 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-globe',
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestyleSkyColorReadoutText = new FreestyleText(
            SkyTypes[this._landAndMinePlanetSpec.skyBase],
            { left: left + (row0Left * width), height, top: 0.875 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row0Left += 0.08;
        this._page1textElements.freestylePlanetLandColorText = new FreestyleText(
            'Land Color:',
            { left: left + (row0Left * width), height, top: 0.875 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);

        onClick = () => {
            let nextNum = this._landAndMinePlanetSpec.planetBase + 1;
            if (nextNum > Object.keys(PlanetLandTypes).length / 2) {
                nextNum = 1;
            }
            this._landAndMinePlanetSpec.planetBase = nextNum;
            this._page1textElements.freestylePlanetLandColorReadoutText.update(PlanetLandTypes[this._landAndMinePlanetSpec.planetBase]);
        };

        row0Left += 0.105;
        this._page1buttons.changePlanetLandTypeButton = new FreestyleSquareButton(
            { left: left + (row0Left * width), height, top: 0.875 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-globe',
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestylePlanetLandColorReadoutText = new FreestyleText(
            PlanetLandTypes[this._landAndMinePlanetSpec.planetBase],
            { left: left + (row0Left * width), height, top: 0.875 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
        //#region LaunchLandAndMineScene Row 1
        let row1Left = groupLeftStart;
        this._page1textElements.freestyleGravityText = new FreestyleText(
            'gravity:',
            { left: left + (row1Left * width), height, top: 0.915 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newGravity = this._landAndMinePlanetSpec.gravity - 0.00001;
            if (newGravity < 0.00001) {
                newGravity = 0.00001;
            }
            this._landAndMinePlanetSpec.gravity = newGravity;
            this._page1textElements.freestyleGravityReadoutText.update(this._landAndMinePlanetSpec.gravity.toFixed(5));
        };

        row1Left += 0.08;
        this._page1buttons.gravityMinusButton = new MinusButton(
            { left: left + (row1Left * width), height, top: 0.915 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestyleGravityReadoutText = new FreestyleText(
            this._landAndMinePlanetSpec.gravity.toFixed(5),
            { left: left + (row1Left * width), height, top: 0.915 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newGravity = this._landAndMinePlanetSpec.gravity + 0.00001;
            if (newGravity > 0.00019) {
                newGravity = 0.00019;
            }
            this._landAndMinePlanetSpec.gravity = newGravity;
            this._page1textElements.freestyleGravityReadoutText.update(this._landAndMinePlanetSpec.gravity.toFixed(5));
        };

        row1Left += 0.075;
        this._page1buttons.gravityPlusButton = new PlusButton(
            { left: left + (row1Left * width), height, top: 0.915 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row1Left += 0.05;
        this._page1textElements.freestyleWindText = new FreestyleText(
            'wind:',
            { left: left + (row1Left * width), height, top: 0.915 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newWind = this._landAndMinePlanetSpec.wind - 5;
            if (newWind < -95) {
                newWind = -95;
            }
            this._landAndMinePlanetSpec.wind = newWind;
            this._page1textElements.freestyleWindReadoutText.update(`${this._landAndMinePlanetSpec.wind}%`);
        };

        row1Left += 0.06;
        this._page1buttons.windMinusButton = new MinusButton(
            { left: left + (row1Left * width), height, top: 0.915 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestyleWindReadoutText = new FreestyleText(
            `${this._landAndMinePlanetSpec.wind}%`,
            { left: left + (row1Left * width), height, top: 0.915 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newWind = this._landAndMinePlanetSpec.wind + 5;
            if (newWind > 95) {
                newWind = 95;
            }
            this._landAndMinePlanetSpec.wind = newWind;
            this._page1textElements.freestyleWindReadoutText.update(`${this._landAndMinePlanetSpec.wind}%`);
        };

        row1Left += 0.045;
        this._page1buttons.windPlusButton = new PlusButton(
            { left: left + (row1Left * width), height, top: 0.915 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 2
        let row2Left = groupLeftStart;
        this._page1buttons.isWaterButton = new SmallToggleButton(
            { left: left + (row2Left * width), height, top: 0.955 * height, width },
            BUTTON_COLORS,
            'fa-tint',
            true);

        row2Left += 0.035;
        this._page1buttons.isFrozenButton = new SmallToggleButton(
            { left: left + (row2Left * width), height, top: 0.955 * height, width },
            BUTTON_COLORS,
            'fa-snowflake-o',
            true);

        row2Left += 0.035;
        this._page1buttons.isLifeButton = new SmallToggleButton(
            { left: left + (row2Left * width), height, top: 0.955 * height, width },
            BUTTON_COLORS,
            'fa-leaf',
            true);

        row2Left += 0.035;

        onClick = () => {
            let nextNum = this._landAndMinePlanetSpec.ore + 1;
            if (nextNum > Object.keys(OreTypes).length / 2) {
                nextNum = 1;
            }
            this._landAndMinePlanetSpec.ore = nextNum;
            this._page1textElements.freestyleOreTypeText.update(OreTypes[this._landAndMinePlanetSpec.ore]);
        };

        this._page1buttons.changeOreTypeButton = new FreestyleSquareButton(
            { left: left + (row2Left * width), height, top: 0.955 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-diamond',
            0.5);

        row2Left += 0.035;
        this._page1textElements.freestyleOreTypeText = new FreestyleText(
            OreTypes[this._landAndMinePlanetSpec.ore],
            { left: left + (row2Left * width), height, top: 0.955 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        onClick = () => {
            let nextNum = this._landAndMinePlanetSpec.oreQuantity + 0.75;
            if (nextNum > Object.keys(OreQuantity).length / 2) {
                nextNum = 2;
            }
            this._landAndMinePlanetSpec.oreQuantity = nextNum;
            this._page1textElements.freestyleOreQuantityText.update(OreQuantity[this._landAndMinePlanetSpec.oreQuantity]);
        };

        row2Left += 0.1;
        this._page1buttons.changeOreQuantityButton = new FreestyleSquareButton(
            { left: left + (row2Left * width), height, top: 0.955 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-plus',
            0.5);

        row2Left += 0.035;
        this._page1textElements.freestyleOreQuantityText = new FreestyleText(
            OreQuantity[this._landAndMinePlanetSpec.oreQuantity],
            { left: left + (row2Left * width), height, top: 0.955 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
    //#endregion
//#region Page1 Next
        onClick = () => {
            this._page1buttons.nextPageButton.disable();
            this._next();
            this._page1buttons.nextPageButton.enable();
        };

        this._page1buttons.nextPageButton = new NextButton(
            { left: left + width - (0.29 * width), height, top: 0.845 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
//#endregion
//#endregion

//#region Page 2
        this._page2profiles.leftBottomMiddleProfile = new LeftBottomMiddleProfile(this._scene, this._textures.engineer2);
        this._page2profiles.leftTopMiddleProfile = new LeftTopMiddleProfile(this._scene, this._textures.engineer);
        this._page2profiles.leftTopProfile = new LeftTopProfile(this._scene, this._textures.engineer2);
        this._page2profiles.rightBottomMiddleProfile = new RightBottomMiddleProfile(this._scene, this._textures.engineer2);
        this._page2profiles.rightTopMiddleProfile = new RightTopMiddleProfile(this._scene, this._textures.engineer2);
        this._page2profiles.rightTopProfile = new RightTopProfile(this._scene, this._textures.engineer);
        this._page2profiles.leftBottomMiddleProfile.hide();
        this._page2profiles.leftTopMiddleProfile.hide();
        this._page2profiles.leftTopProfile.hide();
        this._page2profiles.rightBottomMiddleProfile.hide();
        this._page2profiles.rightTopMiddleProfile.hide();
        this._page2profiles.rightTopProfile.hide();

        this._page2textElements.leftTopDialogueText2 = new LeftTopDialogueText(
            `This is the launching point for PLANET RAID scene. Click load button to launch it.`,
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.DIALOGUE);
        this._page2textElements.leftTopDialogueText2.hide();

        onClick = () => {
            this._page2buttons.launchPlanetRaidSceneButton.disable();
            callbacks.activatePlanetRaid();
        };

        this._page2buttons.launchPlanetRaidSceneButton = new LoadButton(
            { left: left + (0.29 * width), height, top: 0.20 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        this._page2buttons.launchPlanetRaidSceneButton.hide();

        this._page2textElements.leftBottomTitleText2 = new LeftBottomTitleText(
            'Previous Page',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);
        this._page2textElements.leftBottomTitleText2.hide();

        onClick = () => {
            this._page2buttons.previousPageButton2.disable();
            this._previous();
            this._page2buttons.previousPageButton2.enable();
        };

        this._page2buttons.previousPageButton2 = new PreviousButton(
            { left: left + (0.21 * width), height, top: 0.845 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        this._page2buttons.previousPageButton2.hide();

        this._page2textElements.rightBottomTitleText2 = new RightBottomTitleText(
            'Next Page',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);
        this._page2textElements.rightBottomTitleText2.hide();

        onClick = () => {
            this._page2buttons.nextPageButton2.disable();
            this._next();
            this._page2buttons.nextPageButton2.enable();
        };

        this._page2buttons.nextPageButton2 = new NextButton(
            { left: left + width - (0.29 * width), height, top: 0.845 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        this._page2buttons.nextPageButton2.hide();
//#endregion

//#region Page 3
        this._page3profiles.leftBottomProfile3 = new LeftBottomProfile(this._scene, this._textures.engineer2);
        this._page3profiles.rightBottomProfile3 = new RightBottomProfile(this._scene, this._textures.engineer);
        this._page3profiles.leftBottomProfile3.hide();
        this._page3profiles.rightBottomProfile3.hide();

        this._page3textElements.leftTopTitleText3 = new LeftTopTitleText(
            'Previous Page',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);
        this._page3textElements.leftTopTitleText3.hide();

        onClick = () => {
            this._page3buttons.previousPageButton3.disable();
            this._previous();
            this._page3buttons.previousPageButton3.enable();
        };

        this._page3buttons.previousPageButton3 = new PreviousButton(
            { left: left + (0.21 * width), height, top: 0.115 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        this._page3buttons.previousPageButton3.hide();
//#endregion

        this._textElements = {
            ...this._page1textElements,
            ...this._page2textElements,
            ...this._page3textElements
        };
        this._buttons = {
            ...this._page1buttons,
            ...this._page2buttons,
            ...this._page3buttons
        };
    }

    /**
     * Transitions to the next page in the dev menu options.
     */
    private _next(): void {
        this._currentPage++;
        if (this._currentPage === 2) {
            Object.keys(this._page1textElements).forEach(x => this._page1textElements[x] && this._page1textElements[x].hide());
            Object.keys(this._page1buttons).forEach(x => this._page1buttons[x] && this._page1buttons[x].hide());
            Object.keys(this._page1profiles).forEach(x => this._page1profiles[x] && this._page1profiles[x].hide());
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].show());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].show());
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].show());
        } else if (this._currentPage === 3) {
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].hide());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].hide());
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].hide());
            Object.keys(this._page3textElements).forEach(x => this._page3textElements[x] && this._page3textElements[x].show());
            Object.keys(this._page3buttons).forEach(x => this._page3buttons[x] && this._page3buttons[x].show());
            Object.keys(this._page3profiles).forEach(x => this._page3profiles[x] && this._page3profiles[x].show());
        }
    }

    /**
     * When the browser window changes in size, all html elements are updated in kind.
     */
    private _onWindowResize(): void {
        // Get new window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        // Update the various structured texts
        Object.keys(this._textElements).forEach(el =>this._textElements[el] && this._textElements[el].resize({ left, height, top: null, width }));

        // Update various buttons and freestyle texts.
        this._buttons.launchGameMenuButton.resize({ left: left + (0.115 * width), height, top: 0.1 * height, width });
        this._buttons.launchIntroSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.1 * height, width });

        this._buttons.launchLandAndMineSceneButton.resize({ left: left + (0.145 * width), height, top: 0.785 * height, width });
        const groupLeftStart = 0.015;
//#region LaunchLandAndMine Row -1
        let rowSub1Left = groupLeftStart;
        this._textElements.freestylePeakElevationText.resize({ left: left + (rowSub1Left * width), height, top: 0.835 * height, width });
        rowSub1Left += 0.14;
        this._buttons.peakElevationMinusButton.resize({ left: left + (rowSub1Left * width), height, top: 0.835 * height, width });
        rowSub1Left += 0.035;
        this._textElements.freestylePeakElevationReadoutText.resize({ left: left + (rowSub1Left * width), height, top: 0.835 * height, width });
        rowSub1Left += 0.025;
        this._buttons.peakElevationPlusButton.resize({ left: left + (rowSub1Left * width), height, top: 0.835 * height, width });
//#endregion
//#region LaunchLandAndMine Row 0
        let row0Left = groupLeftStart;
        this._textElements.freestyleSkyColorText.resize({ left: left + (row0Left * width), height, top: 0.875 * height, width });
        row0Left += 0.095;
        this._buttons.changeSkyTypeButton.resize({ left: left + (row0Left * width), height, top: 0.875 * height, width });
        row0Left += 0.035;
        this._textElements.freestyleSkyColorReadoutText.resize({ left: left + (row0Left * width), height, top: 0.875 * height, width });
        row0Left += 0.08;
        this._textElements.freestylePlanetLandColorText.resize({ left: left + (row0Left * width), height, top: 0.875 * height, width });
        row0Left += 0.105;
        this._buttons.changePlanetLandTypeButton.resize({ left: left + (row0Left * width), height, top: 0.875 * height, width });
        row0Left += 0.035;
        this._textElements.freestylePlanetLandColorReadoutText.resize({ left: left + (row0Left * width), height, top: 0.875 * height, width });
//#endregion
//#region LaunchLandAndMine Row 1
        let row1Left = groupLeftStart;
        this._textElements.freestyleGravityText.resize({ left: left + (row1Left * width), height, top: 0.915 * height, width });
        row1Left += 0.08;
        this._buttons.gravityMinusButton.resize({ left: left + (row1Left * width), height, top: 0.915 * height, width });
        row1Left += 0.035;
        this._textElements.freestyleGravityReadoutText.resize({ left: left + (row1Left * width), height, top: 0.915 * height, width });
        row1Left += 0.075;
        this._buttons.gravityPlusButton.resize({ left: left + (row1Left * width), height, top: 0.915 * height, width });
        row1Left += 0.05;
        this._textElements.freestyleWindText.resize({ left: left + (row1Left * width), height, top: 0.915 * height, width });
        row1Left += 0.06;
        this._buttons.windMinusButton.resize({ left: left + (row1Left * width), height, top: 0.915 * height, width });
        row1Left += 0.035;
        this._textElements.freestyleWindReadoutText.resize({ left: left + (row1Left * width), height, top: 0.915 * height, width });
        row1Left += 0.045;
        this._buttons.windPlusButton.resize({ left: left + (row1Left * width), height, top: 0.915 * height, width });
//#endregion
//#region LaunchLandAndMine Row 2
        let row2Left = groupLeftStart;
        this._buttons.isWaterButton.resize({ left: left + (row2Left * width), height, top: 0.955 * height, width });
        row2Left += 0.035;
        this._buttons.isFrozenButton.resize({ left: left + (row2Left * width), height, top: 0.955 * height, width });
        row2Left += 0.035;
        this._buttons.isLifeButton.resize({ left: left + (row2Left * width), height, top: 0.955 * height, width });
        row2Left += 0.035;
        this._buttons.changeOreTypeButton.resize({ left: left + (row2Left * width), height, top: 0.955 * height, width });
        row2Left += 0.035;
        this._textElements.freestyleOreTypeText.resize({ left: left + (row2Left * width), height, top: 0.955 * height, width });
        row2Left += 0.1;
        this._buttons.changeOreQuantityButton.resize({ left: left + (row2Left * width), height, top: 0.955 * height, width });
        row2Left += 0.035;
        this._textElements.freestyleOreQuantityText.resize({ left: left + (row2Left * width), height, top: 0.955 * height, width });
//#endregion
        this._buttons.launchPlanetRaidSceneButton.resize({ left: left + (0.29 * width), height, top: 0.20 * height, width });
        this._buttons.launchRepairSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.375 * height, width });
        this._buttons.launchShipLayoutSceneButton.resize({ left: left + (0.115 * width), height, top: 0.375 * height, width });
        this._buttons.launchTravelSceneButton.resize({ left: left + (0.115 * width), height, top: 0.61 * height, width });
        this._buttons.launchVertexMapSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.61 * height, width });
        this._buttons.nextPageButton.resize({ left: left + width - (0.29 * width), height, top: 0.845 * height, width });
        this._buttons.nextPageButton2.resize({ left: left + width - (0.29 * width), height, top: 0.845 * height, width });
        this._buttons.previousPageButton2.resize({ left: left + (0.21 * width), height, top: 0.845 * height, width });
        this._buttons.previousPageButton3.resize({ left: left + (0.21 * width), height, top: 0.115 * height, width });
    };

    /**
     * Transitions to the previous page in the dev menu options.
     */
    private _previous(): void {
        this._currentPage--;
        if (this._currentPage === 1) {
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].hide());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].hide());
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].hide());
            Object.keys(this._page1textElements).forEach(x => this._page1textElements[x] && this._page1textElements[x].show());
            Object.keys(this._page1buttons).forEach(x => this._page1buttons[x] && this._page1buttons[x].show());
            Object.keys(this._page1profiles).forEach(x => this._page1profiles[x] && this._page1profiles[x].show());
        } else if (this._currentPage === 2) {
            Object.keys(this._page3textElements).forEach(x => this._page3textElements[x] && this._page3textElements[x].hide());
            Object.keys(this._page3buttons).forEach(x => this._page3buttons[x] && this._page3buttons[x].hide());
            Object.keys(this._page3profiles).forEach(x => this._page3profiles[x] && this._page3profiles[x].hide());
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].show());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].show());
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].show());
        }
    }

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        Object.keys(this._textElements).forEach(x => this._textElements[x] && this._textElements[x].dispose());
        Object.keys(this._buttons).forEach(x => this._buttons[x] && this._buttons[x].dispose());
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * Something called once per frame on every scene.
     */
    public endCycle(): void {
        Object.keys(this._textElements).forEach(el =>
            this._textElements[el]
            && this._textElements[el].element.style.visibility === 'visible'
            && this._textElements[el].cycle());
    }

}
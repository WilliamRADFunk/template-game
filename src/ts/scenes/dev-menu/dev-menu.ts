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
import { PlanetSpecifications, OreTypes, OreQuantity, SkyTypes, PlanetLandTypes } from "../../models/planet-specifications";
import { ToggleBase } from "../../controls/buttons/toggle-base";
import { SmallToggleButton } from "../../controls/buttons/small-toggle-button";
import { FreestyleText } from "../../controls/text/freestyle-text";
import { MinusButton } from "../../controls/buttons/minus-button";
import { PlusButton } from "../../controls/buttons/plus-button";
import { FreestyleSquareButton } from "../../controls/buttons/freestyle-square-button";
import { LanderSpecifications } from "../../models/lander-specifications";
import { ProfileBase } from "../../controls/profiles/profile-base";
import { RightTopDialogueText } from "../../controls/text/dialogue/right-top-dialogue-text";
import { AncientRuinsSpecifications, RuinsBiome, WaterBiome, GroundMaterial, PlantColor, WaterColor, TreeLeafColor, TreeTrunkColor } from "../../models/ancient-ruins-specifications";

// const border: string = '1px solid #FFF';
const border: string = 'none';

const buttonScale: number = 2;

/**
 * @class
 * Keeps track of all things menu related accessible only to dev.
 */
export class DevMenu {
    /**
    * Specification of what the planet and ruins below should look like.
    */
    private _ancientRuinsSpec: AncientRuinsSpecifications = {
        biomeRuins: RuinsBiome.Cemetery,
        biomeWater: WaterBiome.River,
        groundMaterial: GroundMaterial.Dirt,
        hasClouds: true,
        plantColor: PlantColor.Green,
        plantPercentage: 0.3,
        plantSpreadability: 0.15,
        treeLeafColor: TreeLeafColor.Green,
        treePercentage: 0.02,
        treeTrunkColor: TreeTrunkColor.Grey,
        waterColor: WaterColor.Blue,
        waterPercentage: 0.025,
        waterSpreadability: 0.1
    };

    /**
    * Specification of what the planet below should look like.
    */
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
    * Specification of what the landercan and can't do.
    */
    private _landAndMineLanderSpec: LanderSpecifications = {
        drillLength: 5,
        fuelBurn: 0.05,
        horizontalCrashMargin: 0.001,
        oxygenBurn: 0.02,
        verticalCrashMargin: 0.01
    };

    /**
     * List of profiles on page 1.
     */
    private _page1profiles: { [key: string]: ProfileBase } = {};

    /**
     * List of profiles on page 2.
     */
    private _page2profiles: { [key: string]: ProfileBase } = {};

    /**
     * List of profiles on page 3.
     */
    private _page3profiles: { [key: string]: ProfileBase } = {};

    /**
     * List of buttons on page 1.
     */
    private _page1buttons: { [key: string]: ButtonBase | ToggleBase } = {};
    /**
     * List of buttons on page 2.
     */
    private _page2buttons: { [key: string]: ButtonBase | ToggleBase } = {};
    /**
     * List of buttons on page 3.
     */
    private _page3buttons: { [key: string]: ButtonBase } = {};

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
    private _page1textElements: TextMap = {};

    /**
     * Groups of text elements for page 2.
     */
    private _page2textElements: TextMap = {};

    /**
     * Groups of text elements for page 3.
     */
    private _page3textElements: TextMap = {};

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
    //#region AncientRuinsScene
        let groupLeftStart = 0.5;
        this._page1textElements.rightTopTitleText = new RightTopTitleText(
            'Ancient Ruins',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        onClick = () => {
            this._page1buttons.launchAncientRuinsSceneButton.disable();
            callbacks.activateAncientRuinsScene({
                biomeRuins: RuinsBiome.Cemetery,
                biomeWater: this._ancientRuinsSpec.biomeWater,
                groundMaterial: this._ancientRuinsSpec.groundMaterial,
                hasClouds: (this._buttons.hasCloudsButton as ToggleBase).getState(),
                plantColor: this._ancientRuinsSpec.plantColor,
                plantPercentage: this._ancientRuinsSpec.plantColor !== PlantColor.None ? 0.3 : 0,
                plantSpreadability: this._ancientRuinsSpec.plantColor !== PlantColor.None ? 0.15 : 0,
                treeLeafColor: this._ancientRuinsSpec.treeLeafColor,
                treePercentage: this._ancientRuinsSpec.treePercentage,
                treeTrunkColor: this._ancientRuinsSpec.treeTrunkColor,
                waterColor: this._ancientRuinsSpec.waterColor,
                waterPercentage: this._ancientRuinsSpec.waterColor !== WaterColor.None ? 0.025 : 0,
                waterSpreadability: this._ancientRuinsSpec.waterColor !== WaterColor.None ? 0.1 : 0
            });
        };

        this._page1buttons.launchAncientRuinsSceneButton = new LoadButton(
            { left: left + (0.54 * width), height, top: 0.20 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        //#region AncientRuinsScene Row 0
        let row0Left = groupLeftStart;
        onClick = () => {
            let nextNum = this._ancientRuinsSpec.plantColor + 1;
            if (nextNum > Object.keys(PlantColor).length / 2) {
                nextNum = 1;
            }
            this._ancientRuinsSpec.plantColor = nextNum;
            this._page1textElements.freestylePlantColorDisplayText.update(PlantColor[this._ancientRuinsSpec.plantColor]);
        };

        this._page1buttons.changePlantColorButton = new FreestyleSquareButton(
            { left: left + (row0Left * width), height, top: 0.05 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-leaf',
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestylePlantColorDisplayText = new FreestyleText(
            PlantColor[this._ancientRuinsSpec.plantColor],
            { left: left + (row0Left * width), height, top: 0.05 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row0Left += 0.1;
        onClick = () => {
            let nextNum = this._ancientRuinsSpec.waterColor + 1;
            if (nextNum > Object.keys(WaterColor).length / 2) {
                nextNum = 1;
            }
            this._ancientRuinsSpec.waterColor = nextNum;
            this._page1textElements.freestyleWaterColorDisplayText.update(WaterColor[this._ancientRuinsSpec.waterColor]);
        };

        this._page1buttons.changeWaterColorButton = new FreestyleSquareButton(
            { left: left + (row0Left * width), height, top: 0.05 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-tint',
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestyleWaterColorDisplayText = new FreestyleText(
            WaterColor[this._ancientRuinsSpec.waterColor],
            { left: left + (row0Left * width), height, top: 0.05 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
        //#region AncientRuinsScene Row 1
        let row1Left = groupLeftStart;

        onClick = () => {
            let nextNum = this._ancientRuinsSpec.groundMaterial + 1;
            if (nextNum > Object.keys(GroundMaterial).length / 2) {
                nextNum = 1;
            }
            this._ancientRuinsSpec.groundMaterial = nextNum;
            this._page1textElements.freestyleGroundMaterialDisplayText.update(GroundMaterial[this._ancientRuinsSpec.groundMaterial]);
        };

        this._page1buttons.changeGroundMaterialButton = new FreestyleSquareButton(
            { left: left + (row1Left * width), height, top: 0.085 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-first-order',
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestyleGroundMaterialDisplayText = new FreestyleText(
            GroundMaterial[this._ancientRuinsSpec.groundMaterial],
            { left: left + (row1Left * width), height, top: 0.085 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row1Left += 0.1;
        onClick = () => {
            let nextNum = this._ancientRuinsSpec.biomeWater + 1;
            if (nextNum > Object.keys(WaterBiome).length / 2) {
                nextNum = 1;
            }
            this._ancientRuinsSpec.biomeWater = nextNum;
            this._page1textElements.freestyleWaterBiomeDisplayText.update(WaterBiome[this._ancientRuinsSpec.biomeWater].replace('_', ' '));
        };

        this._page1buttons.changeWaterBiomeButton = new FreestyleSquareButton(
            { left: left + (row1Left * width), height, top: 0.085 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-stumbleupon',
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestyleWaterBiomeDisplayText = new FreestyleText(
            WaterBiome[this._ancientRuinsSpec.biomeWater].replace('_', ' '),
            { left: left + (row1Left * width), height, top: 0.085 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
        //#region AncientRuinsScene Row 2
        let row2Left = groupLeftStart;

        this._page1buttons.hasCloudsButton = new SmallToggleButton(
            { left: left + (row2Left * width), height, top: 0.12 * height, width },
            BUTTON_COLORS,
            'fa-cloud',
            true,
            1);

        row2Left += 0.035;
        this._page1buttons.hasSomethingButton = new SmallToggleButton(
            { left: left + (row2Left * width), height, top: 0.12 * height, width },
            BUTTON_COLORS,
            'fa-question',
            true);

        row2Left += 0.035;
        onClick = () => {
            let nextLeafNum = this._ancientRuinsSpec.treeLeafColor + 1;
            let nextTrunkNum = this._ancientRuinsSpec.treeTrunkColor;
            if (nextLeafNum > Object.keys(TreeLeafColor).length / 2) {
                nextLeafNum = 1;
                nextTrunkNum += 1;
                if (nextTrunkNum > Object.keys(TreeTrunkColor).length / 2) {
                    nextTrunkNum = 1;
                }
            }
            this._ancientRuinsSpec.treeLeafColor = nextLeafNum;
            this._ancientRuinsSpec.treeTrunkColor = nextTrunkNum;
            this._page1textElements.freestyleTreeColorDisplayText.update(`${TreeTrunkColor[this._ancientRuinsSpec.treeTrunkColor]}-${TreeLeafColor[this._ancientRuinsSpec.treeLeafColor]}`);
        };

        this._page1buttons.changeTreeColorButton = new FreestyleSquareButton(
            { left: left + (row2Left * width), height, top: 0.12 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-tree',
            0.5);

        row2Left += 0.035;
        this._page1textElements.freestyleTreeColorDisplayText = new FreestyleText(
            `${TreeTrunkColor[this._ancientRuinsSpec.treeTrunkColor]}-${TreeLeafColor[this._ancientRuinsSpec.treeLeafColor]}`,
            { left: left + (row2Left * width), height, top: 0.12 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
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
    //#region LaunchIntroScene
        this._page1textElements.rightBottomMiddleTitleText = new RightBottomMiddleTitleText(
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
                    drillLength: this._landAndMineLanderSpec.drillLength,
                    fuelBurn: this._landAndMineLanderSpec.fuelBurn,
                    horizontalCrashMargin: this._landAndMineLanderSpec.horizontalCrashMargin,
                    oxygenBurn: this._landAndMineLanderSpec.oxygenBurn,
                    verticalCrashMargin: this._landAndMineLanderSpec.verticalCrashMargin
                });
        };

        this._page1buttons.launchLandAndMineSceneButton = new LoadButton(
            { left: left + (0.175 * width), height, top: 0.785 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale * 0.5);

        groupLeftStart = 0.015;
        //#region LaunchLandAndMineScene Row -2
        let rowSub2Left = groupLeftStart;
        this._page1textElements.freestyleHThresholdText = new FreestyleText(
            'H Threshold',
            { left: left + (rowSub2Left * width), height, top: 0.755 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);
        rowSub2Left += 0.325;
        this._page1textElements.freestyleVThresholdText = new FreestyleText(
            'V Threshold',
            { left: left + (rowSub2Left * width), height, top: 0.755 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);
        //#endregion
        //#region LaunchLandAndMineScene Row -1
        let rowSub1Left = groupLeftStart;
        onClick = () => {
            let newHorizontalCrashMargin = this._landAndMineLanderSpec.horizontalCrashMargin - 0.001;
            if (newHorizontalCrashMargin < 0.001) {
                newHorizontalCrashMargin = 0.001;
            }
            this._landAndMineLanderSpec.horizontalCrashMargin = newHorizontalCrashMargin;
            this._page1textElements.freestyleHorizontalCrashMarginReadoutText.update(this._landAndMineLanderSpec.horizontalCrashMargin.toFixed(3));
        };

        this._page1buttons.horizontalCrashMarginMinusButton = new MinusButton(
            { left: left + (rowSub1Left * width), height, top: 0.784 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        rowSub1Left += 0.035;
        this._page1textElements.freestyleHorizontalCrashMarginReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.horizontalCrashMargin.toFixed(3),
            { left: left + (rowSub1Left * width), height, top: 0.784 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newHorizontalCrashMargin = this._landAndMineLanderSpec.horizontalCrashMargin + 0.001;
            if (newHorizontalCrashMargin > 0.009) {
                newHorizontalCrashMargin = 0.009;
            }
            this._landAndMineLanderSpec.horizontalCrashMargin = newHorizontalCrashMargin;
            this._page1textElements.freestyleHorizontalCrashMarginReadoutText.update(this._landAndMineLanderSpec.horizontalCrashMargin.toFixed(3));
        };

        rowSub1Left += 0.05;
        this._page1buttons.horizontalCrashMarginPlusButton = new PlusButton(
            { left: left + (rowSub1Left * width), height, top: 0.784 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        rowSub1Left += 0.238;
        onClick = () => {
            let newVerticalCrashMargin = this._landAndMineLanderSpec.verticalCrashMargin - 0.01;
            if (newVerticalCrashMargin < 0.01) {
                newVerticalCrashMargin = 0.01;
            }
            this._landAndMineLanderSpec.verticalCrashMargin = newVerticalCrashMargin;
            this._page1textElements.freestyleVerticalCrashMarginReadoutText.update(this._landAndMineLanderSpec.verticalCrashMargin.toFixed(2));
        };

        this._page1buttons.verticalCrashMarginMinusButton = new MinusButton(
            { left: left + (rowSub1Left * width), height, top: 0.784 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        rowSub1Left += 0.035;
        this._page1textElements.freestyleVerticalCrashMarginReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.verticalCrashMargin.toFixed(2),
            { left: left + (rowSub1Left * width), height, top: 0.784 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newVerticalCrashMargin = this._landAndMineLanderSpec.verticalCrashMargin + 0.01;
            if (newVerticalCrashMargin > 0.09) {
                newVerticalCrashMargin = 0.09;
            }
            this._landAndMineLanderSpec.verticalCrashMargin = newVerticalCrashMargin;
            this._page1textElements.freestyleVerticalCrashMarginReadoutText.update(this._landAndMineLanderSpec.verticalCrashMargin.toFixed(2));
        };

        rowSub1Left += 0.04;
        this._page1buttons.verticalCrashMarginPlusButton = new PlusButton(
            { left: left + (rowSub1Left * width), height, top: 0.784 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 0
        row0Left = groupLeftStart;
        this._page1textElements.freestyleOxygenBurnText = new FreestyleText(
            'oxygen burn:',
            { left: left + (row0Left * width), height, top: 0.82 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newOxygenBurn = this._landAndMineLanderSpec.oxygenBurn - 0.01;
            if (newOxygenBurn < 0.01) {
                newOxygenBurn = 0.01;
            }
            this._landAndMineLanderSpec.oxygenBurn = newOxygenBurn;
            this._page1textElements.freestyleOxygenBurnReadoutText.update(this._landAndMineLanderSpec.oxygenBurn.toFixed(2));
        };

        row0Left += 0.12;
        this._page1buttons.oxygenBurnMinusButton = new MinusButton(
            { left: left + (row0Left * width), height, top: 0.82 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestyleOxygenBurnReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.oxygenBurn.toFixed(2),
            { left: left + (row0Left * width), height, top: 0.82 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newOxygenBurn = this._landAndMineLanderSpec.oxygenBurn + 0.01;
            if (newOxygenBurn > 0.1) {
                newOxygenBurn = 0.1;
            }
            this._landAndMineLanderSpec.oxygenBurn = newOxygenBurn;
            this._page1textElements.freestyleOxygenBurnReadoutText.update(this._landAndMineLanderSpec.oxygenBurn.toFixed(2));
        };

        row0Left += 0.04;
        this._page1buttons.oxygenBurnPlusButton = new PlusButton(
            { left: left + (row0Left * width), height, top: 0.82 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row0Left += 0.04;
        this._page1textElements.freestyleFuelBurnText = new FreestyleText(
            'fuel burn:',
            { left: left + (row0Left * width), height, top: 0.82 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newFuelBurn = this._landAndMineLanderSpec.fuelBurn - 0.01;
            if (newFuelBurn < 0.01) {
                newFuelBurn = 0.01;
            }
            this._landAndMineLanderSpec.fuelBurn = newFuelBurn;
            this._page1textElements.freestyleFuelBurnReadoutText.update(this._landAndMineLanderSpec.fuelBurn.toFixed(2));
        };

        row0Left += 0.095;
        this._page1buttons.fuelBurnMinusButton = new MinusButton(
            { left: left + (row0Left * width), height, top: 0.82 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestyleFuelBurnReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.fuelBurn.toFixed(2),
            { left: left + (row0Left * width), height, top: 0.82 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newFuelBurn = this._landAndMineLanderSpec.fuelBurn + 0.01;
            if (newFuelBurn > 0.2) {
                newFuelBurn = 0.2;
            }
            this._landAndMineLanderSpec.fuelBurn = newFuelBurn;
            this._page1textElements.freestyleFuelBurnReadoutText.update(this._landAndMineLanderSpec.fuelBurn.toFixed(2));
        };

        row0Left += 0.0425;
        this._page1buttons.fuelBurnPlusButton = new PlusButton(
            { left: left + (row0Left * width), height, top: 0.82 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 1
        row1Left = groupLeftStart;
        this._page1textElements.freestylePeakElevationText = new FreestyleText(
            'peak elevation:',
            { left: left + (row1Left * width), height, top: 0.855 * height, width },
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

        row1Left += 0.14;
        this._page1buttons.peakElevationMinusButton = new MinusButton(
            { left: left + (row1Left * width), height, top: 0.855 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestylePeakElevationReadoutText = new FreestyleText(
            this._landAndMinePlanetSpec.peakElevation.toFixed(0),
            { left: left + (row1Left * width), height, top: 0.855 * height, width },
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

        row1Left += 0.02;
        this._page1buttons.peakElevationPlusButton = new PlusButton(
            { left: left + (row1Left * width), height, top: 0.855 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row1Left += 0.04;
        this._page1textElements.freestyleDrillLengthText = new FreestyleText(
            'drill length:',
            { left: left + (row1Left * width), height, top: 0.855 * height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newDrillLength = this._landAndMineLanderSpec.drillLength - 1;
            if (newDrillLength < 2) {
                newDrillLength = 2;
            }
            this._landAndMineLanderSpec.drillLength = newDrillLength;
            this._page1textElements.freestyleDrillLengthReadoutText.update(this._landAndMineLanderSpec.drillLength.toFixed(0));
        };

        row1Left += 0.12;
        this._page1buttons.drillLengthMinusButton = new MinusButton(
            { left: left + (row1Left * width), height, top: 0.855 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestyleDrillLengthReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.drillLength.toFixed(0),
            { left: left + (row1Left * width), height, top: 0.855 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        onClick = () => {
            let newDrillLength = this._landAndMineLanderSpec.drillLength + 1;
            if (newDrillLength > 20) {
                newDrillLength = 20;
            }
            this._landAndMineLanderSpec.drillLength = newDrillLength;
            this._page1textElements.freestyleDrillLengthReadoutText.update(this._landAndMineLanderSpec.drillLength.toFixed(0));
        };

        row1Left += 0.025;
        this._page1buttons.drillLengthPlusButton = new PlusButton(
            { left: left + (row1Left * width), height, top: 0.855 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 2
        row2Left = groupLeftStart;
        this._page1textElements.freestyleSkyColorText = new FreestyleText(
            'Sky Color:',
            { left: left + (row2Left * width), height, top: 0.89 * height, width },
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

        row2Left += 0.095;
        this._page1buttons.changeSkyTypeButton = new FreestyleSquareButton(
            { left: left + (row2Left * width), height, top: 0.89 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-globe',
            0.5);

        row2Left += 0.035;
        this._page1textElements.freestyleSkyColorReadoutText = new FreestyleText(
            SkyTypes[this._landAndMinePlanetSpec.skyBase],
            { left: left + (row2Left * width), height, top: 0.89 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row2Left += 0.08;
        this._page1textElements.freestylePlanetLandColorText = new FreestyleText(
            'Land Color:',
            { left: left + (row2Left * width), height, top: 0.89 * height, width },
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

        row2Left += 0.105;
        this._page1buttons.changePlanetLandTypeButton = new FreestyleSquareButton(
            { left: left + (row2Left * width), height, top: 0.89 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-globe',
            0.5);

        row2Left += 0.035;
        this._page1textElements.freestylePlanetLandColorReadoutText = new FreestyleText(
            PlanetLandTypes[this._landAndMinePlanetSpec.planetBase],
            { left: left + (row2Left * width), height, top: 0.89 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
        //#region LaunchLandAndMineScene Row 3
        let row3Left = groupLeftStart;
        this._page1textElements.freestyleGravityText = new FreestyleText(
            'gravity:',
            { left: left + (row3Left * width), height, top: 0.925 * height, width },
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

        row3Left += 0.08;
        this._page1buttons.gravityMinusButton = new MinusButton(
            { left: left + (row3Left * width), height, top: 0.925 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row3Left += 0.035;
        this._page1textElements.freestyleGravityReadoutText = new FreestyleText(
            this._landAndMinePlanetSpec.gravity.toFixed(5),
            { left: left + (row3Left * width), height, top: 0.925 * height, width },
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

        row3Left += 0.075;
        this._page1buttons.gravityPlusButton = new PlusButton(
            { left: left + (row3Left * width), height, top: 0.925 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row3Left += 0.05;
        this._page1textElements.freestyleWindText = new FreestyleText(
            'wind:',
            { left: left + (row3Left * width), height, top: 0.925 * height, width },
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

        row3Left += 0.06;
        this._page1buttons.windMinusButton = new MinusButton(
            { left: left + (row3Left * width), height, top: 0.925 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row3Left += 0.035;
        this._page1textElements.freestyleWindReadoutText = new FreestyleText(
            `${this._landAndMinePlanetSpec.wind}%`,
            { left: left + (row3Left * width), height, top: 0.925 * height, width },
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

        row3Left += 0.045;
        this._page1buttons.windPlusButton = new PlusButton(
            { left: left + (row3Left * width), height, top: 0.925 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 4
        let row4Left = groupLeftStart;
        this._page1buttons.isWaterButton = new SmallToggleButton(
            { left: left + (row4Left * width), height, top: 0.96 * height, width },
            BUTTON_COLORS,
            'fa-tint',
            true);

        row4Left += 0.035;
        this._page1buttons.isFrozenButton = new SmallToggleButton(
            { left: left + (row4Left * width), height, top: 0.96 * height, width },
            BUTTON_COLORS,
            'fa-snowflake-o',
            true);

        row4Left += 0.035;
        this._page1buttons.isLifeButton = new SmallToggleButton(
            { left: left + (row4Left * width), height, top: 0.96 * height, width },
            BUTTON_COLORS,
            'fa-leaf',
            true);

        row4Left += 0.035;

        onClick = () => {
            let nextNum = this._landAndMinePlanetSpec.ore + 1;
            if (nextNum > Object.keys(OreTypes).length / 2) {
                nextNum = 1;
            }
            this._landAndMinePlanetSpec.ore = nextNum;
            this._page1textElements.freestyleOreTypeText.update(OreTypes[this._landAndMinePlanetSpec.ore]);
        };

        this._page1buttons.changeOreTypeButton = new FreestyleSquareButton(
            { left: left + (row4Left * width), height, top: 0.96 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-diamond',
            0.5);

        row4Left += 0.035;
        this._page1textElements.freestyleOreTypeText = new FreestyleText(
            OreTypes[this._landAndMinePlanetSpec.ore],
            { left: left + (row4Left * width), height, top: 0.96 * height, width },
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

        row4Left += 0.1;
        this._page1buttons.changeOreQuantityButton = new FreestyleSquareButton(
            { left: left + (row4Left * width), height, top: 0.96 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-plus',
            0.5);

        row4Left += 0.035;
        this._page1textElements.freestyleOreQuantityText = new FreestyleText(
            OreQuantity[this._landAndMinePlanetSpec.oreQuantity],
            { left: left + (row4Left * width), height, top: 0.96 * height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
    //#endregion
    //#region Page1 Next
        this._page1textElements.rightBottomTitleText = new RightBottomTitleText(
            'Next Page',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);

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
        this._page2profiles.leftBottomMiddleProfile = new LeftBottomMiddleProfile(this._scene, this._textures.engineer2, false);
        this._page2profiles.leftTopMiddleProfile = new LeftTopMiddleProfile(this._scene, this._textures.miner1, false);
        this._page2profiles.leftTopProfile = new LeftTopProfile(this._scene, this._textures.engineer2, false);
        this._page2profiles.rightBottomMiddleProfile = new RightBottomMiddleProfile(this._scene, this._textures.engineer2, false);
        this._page2profiles.rightTopMiddleProfile = new RightTopMiddleProfile(this._scene, this._textures.engineer2, false);
        this._page2profiles.rightTopProfile = new RightTopProfile(this._scene, this._textures.science1, false);
        this._page2profiles.leftBottomMiddleProfile.hide();
        this._page2profiles.leftTopMiddleProfile.hide();
        this._page2profiles.leftTopProfile.hide();
        this._page2profiles.rightBottomMiddleProfile.hide();
        this._page2profiles.rightTopMiddleProfile.hide();
        this._page2profiles.rightTopProfile.hide();

    //#region PlanetRaidScene
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
    //#endregion
    //#region VertexMapScene
        this._page2textElements.rightTopDialogueText2 = new RightTopDialogueText(
            `This is the launching point for the Vertex Map scene.`,
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.DIALOGUE);
        this._page2textElements.rightTopDialogueText2.hide();

        onClick = () => {
            this._page2buttons.launchVertexMapSceneButton.disable();
            callbacks.activateVertexMapScene();
        };

        this._page2buttons.launchVertexMapSceneButton = new LoadButton(
            { left: left + (0.54 * width), height, top: 0.20 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        this._page2buttons.launchVertexMapSceneButton.hide();
    //#endregion

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
        this._page3profiles.leftBottomProfile3 = new LeftBottomProfile(this._scene, this._textures.engineer2, false);
        this._page3profiles.rightBottomProfile3 = new RightBottomProfile(this._scene, this._textures.engineer, false);
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
        this._buttons.launchAncientRuinsSceneButton.resize({ left: left + (0.54 * width), height, top: 0.20 * height, width });
        let groupLeftStart = 0.5;
//#region AncientRuinsScene Row 0
        let row0Left = groupLeftStart;
        this._page1buttons.changePlantColorButton.resize({ left: left + (row0Left * width), height, top: 0.05 * height, width });
        row0Left += 0.035;
        this._page1textElements.freestylePlantColorDisplayText.resize({ left: left + (row0Left * width), height, top: 0.05 * height, width });
        row0Left += 0.1;
        this._page1buttons.changeWaterColorButton.resize({ left: left + (row0Left * width), height, top: 0.05 * height, width });
        row0Left += 0.035;
        this._page1textElements.freestyleWaterColorDisplayText.resize({ left: left + (row0Left * width), height, top: 0.05 * height, width });
//#endregion
//#region AncientRuinsScene Row 1
        let row1Left = groupLeftStart;
        this._page1buttons.changeGroundMaterialButton.resize({ left: left + (row1Left * width), height, top: 0.085 * height, width });
        row1Left += 0.035;
        this._page1textElements.freestyleGroundMaterialDisplayText.resize({ left: left + (row1Left * width), height, top: 0.085 * height, width });
        row1Left += 0.1;
        this._page1buttons.changeWaterBiomeButton.resize({ left: left + (row1Left * width), height, top: 0.085 * height, width });
        row1Left += 0.035;
        this._page1textElements.freestyleWaterBiomeDisplayText.resize({ left: left + (row1Left * width), height, top: 0.085 * height, width });
//#endregion
//#region AncientRuinsScene Row 2
        let row2Left = groupLeftStart;
        this._page1buttons.hasCloudsButton.resize({ left: left + (row2Left * width), height, top: 0.12 * height, width });
        row2Left += 0.035;
        this._page1buttons.hasSomethingButton.resize({ left: left + (row2Left * width), height, top: 0.12 * height, width });
        row2Left += 0.035;
        this._page1buttons.changeTreeColorButton.resize({ left: left + (row2Left * width), height, top: 0.12 * height, width });
        row2Left += 0.035;
        this._page1textElements.freestyleTreeColorDisplayText.resize({ left: left + (row2Left * width), height, top: 0.12 * height, width });
//#endregion

        this._buttons.launchGameMenuButton.resize({ left: left + (0.115 * width), height, top: 0.1 * height, width });
        this._buttons.launchIntroSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.1 * height, width });

        this._buttons.launchLandAndMineSceneButton.resize({ left: left + (0.175 * width), height, top: 0.785 * height, width });
        groupLeftStart = 0.015;
//#region LaunchLandAndMineScene Row -2
        let rowSub2Left = groupLeftStart;
        this._textElements.freestyleHThresholdText.resize({ left: left + (rowSub2Left * width), height, top: 0.755 * height, width });
        rowSub2Left += 0.325;
        this._textElements.freestyleVThresholdText.resize({ left: left + (rowSub2Left * width), height, top: 0.755 * height, width });
//#endregion
//#region LaunchLandAndMine Row -1
        let rowSub1Left = groupLeftStart;
        this._buttons.horizontalCrashMarginMinusButton.resize({ left: left + (rowSub1Left * width), height, top: 0.784 * height, width });
        rowSub1Left += 0.035;
        this._textElements.freestyleHorizontalCrashMarginReadoutText.resize({ left: left + (rowSub1Left * width), height, top: 0.784 * height, width });
        rowSub1Left += 0.05;
        this._buttons.horizontalCrashMarginPlusButton.resize({ left: left + (rowSub1Left * width), height, top: 0.784 * height, width });

        rowSub1Left += 0.238;
        this._buttons.verticalCrashMarginMinusButton.resize({ left: left + (rowSub1Left * width), height, top: 0.784 * height, width });
        rowSub1Left += 0.035;
        this._textElements.freestyleVerticalCrashMarginReadoutText.resize({ left: left + (rowSub1Left * width), height, top: 0.784 * height, width });
        rowSub1Left += 0.04;
        this._buttons.verticalCrashMarginPlusButton.resize({ left: left + (rowSub1Left * width), height, top: 0.784 * height, width });
//#endregion
//#region LaunchLandAndMine Row 0
        row0Left = groupLeftStart;
        this._textElements.freestyleOxygenBurnText.resize({ left: left + (row0Left * width), height, top: 0.82 * height, width });
        row0Left += 0.12;
        this._buttons.oxygenBurnMinusButton.resize({ left: left + (row0Left * width), height, top: 0.82 * height, width });
        row0Left += 0.035;
        this._textElements.freestyleOxygenBurnReadoutText.resize({ left: left + (row0Left * width), height, top: 0.82 * height, width });
        row0Left += 0.04;
        this._buttons.oxygenBurnPlusButton.resize({ left: left + (row0Left * width), height, top: 0.82 * height, width });

        row0Left += 0.04;
        this._textElements.freestyleFuelBurnText.resize({ left: left + (row0Left * width), height, top: 0.82 * height, width });
        row0Left += 0.095;
        this._buttons.fuelBurnMinusButton.resize({ left: left + (row0Left * width), height, top: 0.82 * height, width });
        row0Left += 0.035;
        this._textElements.freestyleFuelBurnReadoutText.resize({ left: left + (row0Left * width), height, top: 0.82 * height, width });
        row0Left += 0.0425;
        this._buttons.fuelBurnPlusButton.resize({ left: left + (row0Left * width), height, top: 0.82 * height, width });
//#endregion
//#region LaunchLandAndMine Row 1
        row1Left = groupLeftStart;
        this._textElements.freestylePeakElevationText.resize({ left: left + (row1Left * width), height, top: 0.855 * height, width });
        row1Left += 0.14;
        this._buttons.peakElevationMinusButton.resize({ left: left + (row1Left * width), height, top: 0.855 * height, width });
        row1Left += 0.035;
        this._textElements.freestylePeakElevationReadoutText.resize({ left: left + (row1Left * width), height, top: 0.855 * height, width });
        row1Left += 0.02;
        this._buttons.peakElevationPlusButton.resize({ left: left + (row1Left * width), height, top: 0.855 * height, width });

        row1Left += 0.04;
        this._textElements.freestyleDrillLengthText.resize({ left: left + (row1Left * width), height, top: 0.855 * height, width });
        row1Left += 0.12;
        this._buttons.drillLengthMinusButton.resize({ left: left + (row1Left * width), height, top: 0.855 * height, width });
        row1Left += 0.035;
        this._textElements.freestyleDrillLengthReadoutText.resize({ left: left + (row1Left * width), height, top: 0.855 * height, width });
        row1Left += 0.025;
        this._buttons.drillLengthPlusButton.resize({ left: left + (row1Left * width), height, top: 0.855 * height, width });
//#endregion
//#region LaunchLandAndMine Row 2
        row2Left = groupLeftStart;
        this._textElements.freestyleSkyColorText.resize({ left: left + (row2Left * width), height, top: 0.89 * height, width });
        row2Left += 0.095;
        this._buttons.changeSkyTypeButton.resize({ left: left + (row2Left * width), height, top: 0.89 * height, width });
        row2Left += 0.035;
        this._textElements.freestyleSkyColorReadoutText.resize({ left: left + (row2Left * width), height, top: 0.89 * height, width });
        row2Left += 0.08;
        this._textElements.freestylePlanetLandColorText.resize({ left: left + (row2Left * width), height, top: 0.89 * height, width });
        row2Left += 0.105;
        this._buttons.changePlanetLandTypeButton.resize({ left: left + (row2Left * width), height, top: 0.89 * height, width });
        row2Left += 0.035;
        this._textElements.freestylePlanetLandColorReadoutText.resize({ left: left + (row2Left * width), height, top: 0.89 * height, width });
//#endregion
//#region LaunchLandAndMine Row 3
        let row3Left = groupLeftStart;
        this._textElements.freestyleGravityText.resize({ left: left + (row3Left * width), height, top: 0.925 * height, width });
        row3Left += 0.08;
        this._buttons.gravityMinusButton.resize({ left: left + (row3Left * width), height, top: 0.925 * height, width });
        row3Left += 0.035;
        this._textElements.freestyleGravityReadoutText.resize({ left: left + (row3Left * width), height, top: 0.925 * height, width });
        row3Left += 0.075;
        this._buttons.gravityPlusButton.resize({ left: left + (row3Left * width), height, top: 0.925 * height, width });
        row3Left += 0.05;
        this._textElements.freestyleWindText.resize({ left: left + (row3Left * width), height, top: 0.925 * height, width });
        row3Left += 0.06;
        this._buttons.windMinusButton.resize({ left: left + (row3Left * width), height, top: 0.925 * height, width });
        row3Left += 0.035;
        this._textElements.freestyleWindReadoutText.resize({ left: left + (row3Left * width), height, top: 0.925 * height, width });
        row3Left += 0.045;
        this._buttons.windPlusButton.resize({ left: left + (row3Left * width), height, top: 0.925 * height, width });
//#endregion
//#region LaunchLandAndMine Row 4
        let row4Left = groupLeftStart;
        this._buttons.isWaterButton.resize({ left: left + (row4Left * width), height, top: 0.96 * height, width });
        row4Left += 0.035;
        this._buttons.isFrozenButton.resize({ left: left + (row4Left * width), height, top: 0.96 * height, width });
        row4Left += 0.035;
        this._buttons.isLifeButton.resize({ left: left + (row4Left * width), height, top: 0.96 * height, width });
        row4Left += 0.035;
        this._buttons.changeOreTypeButton.resize({ left: left + (row4Left * width), height, top: 0.96 * height, width });
        row4Left += 0.035;
        this._textElements.freestyleOreTypeText.resize({ left: left + (row4Left * width), height, top: 0.96 * height, width });
        row4Left += 0.1;
        this._buttons.changeOreQuantityButton.resize({ left: left + (row4Left * width), height, top: 0.96 * height, width });
        row4Left += 0.035;
        this._textElements.freestyleOreQuantityText.resize({ left: left + (row4Left * width), height, top: 0.96 * height, width });
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
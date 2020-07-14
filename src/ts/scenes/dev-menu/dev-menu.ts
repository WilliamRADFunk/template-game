import { Scene, Texture, Mesh } from "three";

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
import {
    AncientRuinsSpecifications,
    RuinsBiome,
    WaterBiome,
    GroundMaterial,
    PlantColor,
    WaterColor,
    TreeLeafColor,
    TreeTrunkColor,
    TeamMemberDirection,
    TeamMemberStatus,
    TeamMemberAppearance,
    TeamMember } from "../../models/ancient-ruins-specifications";
import { makeMember } from "../ancient-ruins/utils/make-member";
import { findMemberValue, ShirtColor, spriteMapCols, spriteMapRows } from "../ancient-ruins/utils/crew-member-spritemap-values";
import { makeMemberMaterial } from "../ancient-ruins/utils/make-member-material";
import { MIDDLE_COL } from "../ancient-ruins/utils/grid-constants";
import { animateCrewMember } from "../ancient-ruins/utils/animate-crew-member";
import { RAD_90_DEG_LEFT } from "../ancient-ruins/utils/radians-x-degrees-left";
import { rotateCrewMember } from "../ancient-ruins/utils/rotate-crew-member";
import { OFFICER_RANK_START, ENLISTED_RANK_START, MAX_OFFICER_RANK } from "../../utils/rank-map";

// const border: string = '1px solid #FFF';
const border: string = 'none';

const buttonScale: number = 2;

/**
 * Changes crew members direction by 45 degrees clockwise to ensure all directions are still working.
 * @param teamMember crew member whose direction should be changed
 */
function cycleCrewMemberDirection(teamMember: TeamMember): void {
    let teamMemberDirectionNum = teamMember.currDirection + 1;
    if (teamMemberDirectionNum >= Object.keys(TeamMemberDirection).length / 2) {
        teamMemberDirectionNum = 0;
    }
    teamMember.currDirection = teamMemberDirectionNum;
}

/**
 * Establishes a one-plce fetch for the height of dev menu elements in the Ancient Ruins scene.
 * @param row row number on the dev menu section for the Ancient Ruins scene.
 * @param height the height of the window to multiply modifer against.
 * @returns the height to use on all elements on that row.
 */
function sizeHeightForAncientRuins(row: number, height: number): number {
    return (0.047 + (row * 0.035)) * height;
}

/**
 * Establishes a one-plce fetch for the height of dev menu elements in the Land And Mine scene.
 * @param row row number on the dev menu section for the Land And Mine scene.
 * @param height the height of the window to multiply modifer against.
 * @returns the height to use on all elements on that row.
 */
function sizeHeightForLandAndMine(row: number, height: number): number {
    switch(row) {
        case -2: {
            return 0.755 * height;
        }
        case -1: {
            return 0.784 * height;
        }
        case 0: {
            return 0.82 * height;
        }
        case 1: {
            return 0.855 * height;
        }
        case 2: {
            return 0.89 * height;
        }
        case 3: {
            return 0.925 * height;
        }
        case 4: {
            return 0.96 * height;
        }
    }
}

/**
 * @class
 * Keeps track of all things menu related accessible only to dev.
 */
export class DevMenu {
    /**
    * Specification of what the planet and ruins below should look like.
    */
    private _ancientRuinsSpec: AncientRuinsSpecifications = {
        biomeRuins: RuinsBiome.Military_Base,
        biomeWater: WaterBiome.Large_Lake,
        crew: [
            {
                animationCounter: 0,
                animationMeshes: [null, null, null],
                appearance: TeamMemberAppearance.Human_Dark_Black,
                currDirection: TeamMemberDirection.Down,
                health: 100,
                name: 'Bingo Bango',
                position: null,
                rank: 2,
                status: TeamMemberStatus.Healthy,
                tileValue: null,
                title: 'Security',
            },
            {
                animationCounter: 0,
                animationMeshes: [null, null, null],
                appearance: TeamMemberAppearance.Human_Light_Bald,
                currDirection: TeamMemberDirection.Down,
                health: 100,
                name: 'Clooge McCloogy',
                position: null,
                rank: 3,
                status: TeamMemberStatus.Healthy,
                tileValue: null,
                title: 'Security',
            },
            {
                animationCounter: 0,
                animationMeshes: [null, null, null],
                appearance: TeamMemberAppearance.Human_Light_Blond,
                currDirection: TeamMemberDirection.Down,
                health: 100,
                name: 'Feelz Good',
                position: null,
                rank: 11,
                status: TeamMemberStatus.Healthy,
                tileValue: null,
                title: 'Medical',
            },
            {
                animationCounter: 0,
                animationMeshes: [null, null, null],
                appearance: TeamMemberAppearance.Human_Light_Red,
                currDirection: TeamMemberDirection.Down,
                health: 100,
                name: 'Glock',
                position: null,
                rank: 12,
                status: TeamMemberStatus.Healthy,
                tileValue: null,
                title: 'Science',
            },
            {
                animationCounter: 0,
                animationMeshes: [null, null, null],
                appearance: TeamMemberAppearance.Human_Light_Black,
                currDirection: TeamMemberDirection.Down,
                health: 100,
                name: 'James Kirkland',
                position: null,
                rank: 14,
                status: TeamMemberStatus.Healthy,
                tileValue: null,
                title: 'Command',
            }
        ],
        groundMaterial: GroundMaterial.Dirt,
        hasAnimalLife: true,
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
     * List of buttons.
     */
    private _buttons: { [key: string]: ButtonBase | ToggleBase };

    /**
     * Current page number.
     */
    private _currentPage: number = 1;

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
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

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
     * List of counters on page 1.
     */
    private _page1counters: { [key: string]: number } = {};

    /**
     * List of counters on page 2.
     */
    private _page2counters: { [key: string]: number } = {};

    /**
     * List of counters on page 3.
     */
    private _page3counters: { [key: string]: number } = {};

    /**
     * List of countermaxes on page 1.
     */
    private _page1countermaxes: { [key: string]: number } = {};

    /**
     * List of countermaxes on page 2.
     */
    private _page2countermaxes: { [key: string]: number } = {};

    /**
     * List of countermaxes on page 3.
     */
    private _page3countermaxes: { [key: string]: number } = {};

    /**
     * Contains key-value mapping of all meshes used on page 1.
     */
    private _page1Meshes: { [key: string]: Mesh } = {};

    /**
     * Contains key-value mapping of all meshes used on page 2.
     */
    private _page2Meshes: { [key: string]: Mesh } = {};

    /**
     * Contains key-value mapping of all meshes used on page 3.
     */
    private _page3Meshes: { [key: string]: Mesh } = {};

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
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private _scene: Scene;

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
        this._page1counters.ancientRuinsCrew = 0;
        this._page1countermaxes.ancientRuinsCrew = 1439;
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
                biomeRuins: this._ancientRuinsSpec.biomeRuins,
                biomeWater: this._ancientRuinsSpec.biomeWater,
                crew: this._ancientRuinsSpec.crew,
                groundMaterial: this._ancientRuinsSpec.groundMaterial,
                hasAnimalLife: (this._buttons.hasAnimalLifeButton as ToggleBase).getState(),
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
            { left: left + (0.50 * width), height, top: 0.01 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        //#region AncientRuinsScene Row 0
        let row0Left = groupLeftStart;
        let row0height = sizeHeightForAncientRuins(0, height);
        onClick = () => {
            let nextNum = this._ancientRuinsSpec.plantColor + 1;
            if (nextNum > Object.keys(PlantColor).length / 2) {
                nextNum = 1;
            }
            this._ancientRuinsSpec.plantColor = nextNum;
            this._page1textElements.freestylePlantColorDisplayText.update(PlantColor[this._ancientRuinsSpec.plantColor]);
        };

        this._page1buttons.changePlantColorButton = new FreestyleSquareButton(
            { left: left + (row0Left * width), height, top: row0height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-leaf',
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestylePlantColorDisplayText = new FreestyleText(
            PlantColor[this._ancientRuinsSpec.plantColor],
            { left: left + (row0Left * width), height, top: row0height, width },
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
            { left: left + (row0Left * width), height, top: row0height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-tint',
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestyleWaterColorDisplayText = new FreestyleText(
            WaterColor[this._ancientRuinsSpec.waterColor],
            { left: left + (row0Left * width), height, top: row0height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row0Left += 0.12;
        onClick = () => {
            let nextNum = this._ancientRuinsSpec.biomeRuins + 1;
            if (nextNum > Object.keys(RuinsBiome).length / 2) {
                nextNum = 1;
            }
            this._ancientRuinsSpec.biomeRuins = nextNum;
            this._page1textElements.freestyleBiomeRuinsDisplayText.update(RuinsBiome[this._ancientRuinsSpec.biomeRuins]);
        };

        this._page1buttons.changeBiomeRuinsButton = new FreestyleSquareButton(
            { left: left + (row0Left * width), height, top: row0height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-institution',
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestyleBiomeRuinsDisplayText = new FreestyleText(
            RuinsBiome[this._ancientRuinsSpec.biomeRuins],
            { left: left + (row0Left * width), height, top: row0height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
        //#region AncientRuinsScene Row 1
        let row1Left = groupLeftStart;
        let row1height = sizeHeightForAncientRuins(1, height);

        onClick = () => {
            let nextNum = this._ancientRuinsSpec.groundMaterial + 1;
            if (nextNum > Object.keys(GroundMaterial).length / 2) {
                nextNum = 1;
            }
            this._ancientRuinsSpec.groundMaterial = nextNum;
            this._page1textElements.freestyleGroundMaterialDisplayText.update(GroundMaterial[this._ancientRuinsSpec.groundMaterial]);
        };

        this._page1buttons.changeGroundMaterialButton = new FreestyleSquareButton(
            { left: left + (row1Left * width), height, top: row1height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-first-order',
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestyleGroundMaterialDisplayText = new FreestyleText(
            GroundMaterial[this._ancientRuinsSpec.groundMaterial],
            { left: left + (row1Left * width), height, top: row1height, width },
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
            { left: left + (row1Left * width), height, top: row1height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-stumbleupon',
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestyleWaterBiomeDisplayText = new FreestyleText(
            WaterBiome[this._ancientRuinsSpec.biomeWater].replace('_', ' '),
            { left: left + (row1Left * width), height, top: row1height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
        //#region AncientRuinsScene Row 2
        let row2Left = groupLeftStart;
        let row2height = sizeHeightForAncientRuins(2, height);

        this._page1buttons.hasCloudsButton = new SmallToggleButton(
            { left: left + (row2Left * width), height, top: row2height, width },
            BUTTON_COLORS,
            'fa-cloud',
            true,
            1,
            this._ancientRuinsSpec.hasClouds);

        row2Left += 0.035;
        this._page1buttons.hasAnimalLifeButton = new SmallToggleButton(
            { left: left + (row2Left * width), height, top: row2height, width },
            BUTTON_COLORS,
            'fa-paw',
            true,
            1,
            this._ancientRuinsSpec.hasAnimalLife);

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
            { left: left + (row2Left * width), height, top: row2height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-tree',
            0.5);

        row2Left += 0.035;
        this._page1textElements.freestyleTreeColorDisplayText = new FreestyleText(
            `${TreeTrunkColor[this._ancientRuinsSpec.treeTrunkColor]}-${TreeLeafColor[this._ancientRuinsSpec.treeLeafColor]}`,
            { left: left + (row2Left * width), height, top: row2height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
        //#region AncientRuinsScene Row 3
        let row3Left = groupLeftStart;
        let row3height = sizeHeightForAncientRuins(3, height);

        onClick = () => {
            let nextMedOfficerAppearanceNum = this._ancientRuinsSpec.crew[2].appearance + 1;
            if (nextMedOfficerAppearanceNum >= Object.keys(TeamMemberAppearance).length / 2) {
                nextMedOfficerAppearanceNum = 0;
            }
            this._ancientRuinsSpec.crew[2].appearance = nextMedOfficerAppearanceNum;
            this._changeMedicalOfficerGraphic();
        };

        this._page1buttons.changeMedicalOfficerButton = new FreestyleSquareButton(
            { left: left + (row3Left * width), height, top: row3height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-stethoscope',
            0.5);
        this._changeMedicalOfficerGraphic();

        row3Left += 0.070;
        onClick = () => {
            let nextSciOfficerAppearanceNum = this._ancientRuinsSpec.crew[3].appearance + 1;
            if (nextSciOfficerAppearanceNum >= Object.keys(TeamMemberAppearance).length / 2) {
                nextSciOfficerAppearanceNum = 0;
            }
            this._ancientRuinsSpec.crew[3].appearance = nextSciOfficerAppearanceNum;
            this._changeScienceOfficerGraphic();
        };

        this._page1buttons.changeScienceOfficerButton = new FreestyleSquareButton(
            { left: left + (row3Left * width), height, top: row3height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-flask',
            0.5);
        this._changeScienceOfficerGraphic();

        row3Left += 0.070;
        onClick = () => {
            let nextLeaderAppearanceNum = this._ancientRuinsSpec.crew[4].appearance + 1;
            if (nextLeaderAppearanceNum >= Object.keys(TeamMemberAppearance).length / 2) {
                nextLeaderAppearanceNum = 0;
            }
            this._ancientRuinsSpec.crew[4].appearance = nextLeaderAppearanceNum;
            this._changeLeaderGraphic();
        };

        this._page1buttons.changeLeaderButton = new FreestyleSquareButton(
            { left: left + (row3Left * width), height, top: row3height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-user-secret',
            0.5);
        this._changeLeaderGraphic();

        row3Left += 0.070;
        onClick = () => {
            let nextSecurity1AppearanceNum = this._ancientRuinsSpec.crew[0].appearance + 1;
            if (nextSecurity1AppearanceNum >= Object.keys(TeamMemberAppearance).length / 2) {
                nextSecurity1AppearanceNum = 0;
            }
            this._ancientRuinsSpec.crew[0].appearance = nextSecurity1AppearanceNum;
            this._changeSecurity1Graphic();
        };

        this._page1buttons.changeSecurity1Button = new FreestyleSquareButton(
            { left: left + (row3Left * width), height, top: row3height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-shield',
            0.5);
        this._changeSecurity1Graphic();

        row3Left += 0.070;
        onClick = () => {
            let nextSecurity2AppearanceNum = this._ancientRuinsSpec.crew[1].appearance + 1;
            if (nextSecurity2AppearanceNum >= Object.keys(TeamMemberAppearance).length / 2) {
                nextSecurity2AppearanceNum = 0;
            }
            this._ancientRuinsSpec.crew[1].appearance = nextSecurity2AppearanceNum;
            this._changeSecurity2Graphic();
        };

        this._page1buttons.changeSecurity2Button = new FreestyleSquareButton(
            { left: left + (row3Left * width), height, top: row3height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-shield',
            0.5);
        this._changeSecurity2Graphic();
        //#endregion
        //#region AncientRuinsScene Row 4
        let row4Left = groupLeftStart;
        let row4height = sizeHeightForAncientRuins(4, height);

        onClick = () => {
            let nextMedOfficerRankNum = this._ancientRuinsSpec.crew[2].rank + 1;
            if (nextMedOfficerRankNum >= MAX_OFFICER_RANK) {
                nextMedOfficerRankNum = OFFICER_RANK_START;
            }
            this._ancientRuinsSpec.crew[2].rank = nextMedOfficerRankNum;
            this._page1textElements.freestyleMedicalOfficerRankDisplayText.update(`${this._ancientRuinsSpec.crew[2].rank}`);
        };

        this._page1buttons.changeMedicalOfficerRankButton = new FreestyleSquareButton(
            { left: left + (row4Left * width), height, top: row4height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-stethoscope',
            0.5);

        row4Left += 0.040;
        this._page1textElements.freestyleMedicalOfficerRankDisplayText = new FreestyleText(
            `${this._ancientRuinsSpec.crew[2].rank}`,
            { left: left + (row4Left * width), height, top: row4height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row4Left += 0.030;
        onClick = () => {
            let nextSciOfficerRankNum = this._ancientRuinsSpec.crew[3].rank + 1;
            if (nextSciOfficerRankNum >= MAX_OFFICER_RANK) {
                nextSciOfficerRankNum = OFFICER_RANK_START;
            }
            this._ancientRuinsSpec.crew[3].rank = nextSciOfficerRankNum;
            this._page1textElements.freestyleScienceOfficerRankDisplayText.update(`${this._ancientRuinsSpec.crew[3].rank}`);
        };

        this._page1buttons.changeScienceOfficerRankButton = new FreestyleSquareButton(
            { left: left + (row4Left * width), height, top: row4height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-flask',
            0.5);

        row4Left += 0.040;
        this._page1textElements.freestyleScienceOfficerRankDisplayText = new FreestyleText(
            `${this._ancientRuinsSpec.crew[3].rank}`,
            { left: left + (row4Left * width), height, top: row4height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row4Left += 0.030;
        onClick = () => {
            let nextLeadOfficerRankNum = this._ancientRuinsSpec.crew[4].rank + 1;
            if (nextLeadOfficerRankNum >= MAX_OFFICER_RANK) {
                nextLeadOfficerRankNum = OFFICER_RANK_START;
            }
            this._ancientRuinsSpec.crew[4].rank = nextLeadOfficerRankNum;
            this._page1textElements.freestyleTeamLeaderRankDisplayText.update(`${this._ancientRuinsSpec.crew[4].rank}`);
        };

        this._page1buttons.changeLeaderRankButton = new FreestyleSquareButton(
            { left: left + (row4Left * width), height, top: row4height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-user-secret',
            0.5);

        row4Left += 0.040;
        this._page1textElements.freestyleTeamLeaderRankDisplayText = new FreestyleText(
            `${this._ancientRuinsSpec.crew[4].rank}`,
            { left: left + (row4Left * width), height, top: row4height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row4Left += 0.030;
        onClick = () => {
            let nextRedShirt1RankNum = this._ancientRuinsSpec.crew[0].rank + 1;
            if (nextRedShirt1RankNum >= OFFICER_RANK_START) {
                nextRedShirt1RankNum = ENLISTED_RANK_START;
            }
            this._ancientRuinsSpec.crew[0].rank = nextRedShirt1RankNum;
            this._page1textElements.freestyleRedShirt1RankDisplayText.update(`${this._ancientRuinsSpec.crew[0].rank}`);
        };

        this._page1buttons.changeSecurity1RankButton = new FreestyleSquareButton(
            { left: left + (row4Left * width), height, top: row4height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-shield',
            0.5);

        row4Left += 0.045;
        this._page1textElements.freestyleRedShirt1RankDisplayText = new FreestyleText(
            `${this._ancientRuinsSpec.crew[0].rank}`,
            { left: left + (row4Left * width), height, top: row4height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row4Left += 0.025;
        onClick = () => {
            let nextRedShirt2RankNum = this._ancientRuinsSpec.crew[1].rank + 1;
            if (nextRedShirt2RankNum >= OFFICER_RANK_START) {
                nextRedShirt2RankNum = ENLISTED_RANK_START;
            }
            this._ancientRuinsSpec.crew[1].rank = nextRedShirt2RankNum;
            this._page1textElements.freestyleRedShirt2RankDisplayText.update(`${this._ancientRuinsSpec.crew[1].rank}`);
        };

        this._page1buttons.changeSecurity2RankButton = new FreestyleSquareButton(
            { left: left + (row4Left * width), height, top: row4height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-shield',
            0.5);

        row4Left += 0.044;
        this._page1textElements.freestyleRedShirt2RankDisplayText = new FreestyleText(
            `${this._ancientRuinsSpec.crew[1].rank}`,
            { left: left + (row4Left * width), height, top: row4height, width },
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
        let rowSub2height = sizeHeightForLandAndMine(-2, height);

        this._page1textElements.freestyleHThresholdText = new FreestyleText(
            'H Threshold',
            { left: left + (rowSub2Left * width), height, top: rowSub2height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);
        rowSub2Left += 0.325;
        this._page1textElements.freestyleVThresholdText = new FreestyleText(
            'V Threshold',
            { left: left + (rowSub2Left * width), height, top: rowSub2height, width },
            COLORS.neutral,
            'none',
            TextType.STATIC);
        //#endregion
        //#region LaunchLandAndMineScene Row -1
        let rowSub1Left = groupLeftStart;
        let rowSub1height = sizeHeightForLandAndMine(-1, height);

        onClick = () => {
            let newHorizontalCrashMargin = this._landAndMineLanderSpec.horizontalCrashMargin - 0.001;
            if (newHorizontalCrashMargin < 0.001) {
                newHorizontalCrashMargin = 0.001;
            }
            this._landAndMineLanderSpec.horizontalCrashMargin = newHorizontalCrashMargin;
            this._page1textElements.freestyleHorizontalCrashMarginReadoutText.update(this._landAndMineLanderSpec.horizontalCrashMargin.toFixed(3));
        };

        this._page1buttons.horizontalCrashMarginMinusButton = new MinusButton(
            { left: left + (rowSub1Left * width), height, top: rowSub1height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        rowSub1Left += 0.035;
        this._page1textElements.freestyleHorizontalCrashMarginReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.horizontalCrashMargin.toFixed(3),
            { left: left + (rowSub1Left * width), height, top: rowSub1height, width },
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
            { left: left + (rowSub1Left * width), height, top: rowSub1height, width },
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
            { left: left + (rowSub1Left * width), height, top: rowSub1height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        rowSub1Left += 0.035;
        this._page1textElements.freestyleVerticalCrashMarginReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.verticalCrashMargin.toFixed(2),
            { left: left + (rowSub1Left * width), height, top: rowSub1height, width },
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
            { left: left + (rowSub1Left * width), height, top: rowSub1height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 0
        row0Left = groupLeftStart;
        row0height = sizeHeightForLandAndMine(0, height);

        this._page1textElements.freestyleOxygenBurnText = new FreestyleText(
            'oxygen burn:',
            { left: left + (row0Left * width), height, top: row0height, width },
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
            { left: left + (row0Left * width), height, top: row0height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestyleOxygenBurnReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.oxygenBurn.toFixed(2),
            { left: left + (row0Left * width), height, top: row0height, width },
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
            { left: left + (row0Left * width), height, top: row0height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row0Left += 0.04;
        this._page1textElements.freestyleFuelBurnText = new FreestyleText(
            'fuel burn:',
            { left: left + (row0Left * width), height, top: row0height, width },
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
            { left: left + (row0Left * width), height, top: row0height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row0Left += 0.035;
        this._page1textElements.freestyleFuelBurnReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.fuelBurn.toFixed(2),
            { left: left + (row0Left * width), height, top: row0height, width },
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
            { left: left + (row0Left * width), height, top: row0height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 1
        row1Left = groupLeftStart;
        row1height = sizeHeightForLandAndMine(1, height);

        this._page1textElements.freestylePeakElevationText = new FreestyleText(
            'peak elevation:',
            { left: left + (row1Left * width), height, top: row1height, width },
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
            { left: left + (row1Left * width), height, top: row1height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestylePeakElevationReadoutText = new FreestyleText(
            this._landAndMinePlanetSpec.peakElevation.toFixed(0),
            { left: left + (row1Left * width), height, top: row1height, width },
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
            { left: left + (row1Left * width), height, top: row1height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row1Left += 0.04;
        this._page1textElements.freestyleDrillLengthText = new FreestyleText(
            'drill length:',
            { left: left + (row1Left * width), height, top: row1height, width },
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
            { left: left + (row1Left * width), height, top: row1height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row1Left += 0.035;
        this._page1textElements.freestyleDrillLengthReadoutText = new FreestyleText(
            this._landAndMineLanderSpec.drillLength.toFixed(0),
            { left: left + (row1Left * width), height, top: row1height, width },
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
            { left: left + (row1Left * width), height, top: row1height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 2
        row2Left = groupLeftStart;
        row2height = sizeHeightForLandAndMine(2, height);

        this._page1textElements.freestyleSkyColorText = new FreestyleText(
            'Sky Color:',
            { left: left + (row2Left * width), height, top: row2height, width },
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
            { left: left + (row2Left * width), height, top: row2height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-globe',
            0.5);

        row2Left += 0.035;
        this._page1textElements.freestyleSkyColorReadoutText = new FreestyleText(
            SkyTypes[this._landAndMinePlanetSpec.skyBase],
            { left: left + (row2Left * width), height, top: row2height, width },
            COLORS.default,
            'none',
            TextType.STATIC);

        row2Left += 0.08;
        this._page1textElements.freestylePlanetLandColorText = new FreestyleText(
            'Land Color:',
            { left: left + (row2Left * width), height, top: row2height, width },
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
            { left: left + (row2Left * width), height, top: row2height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-globe',
            0.5);

        row2Left += 0.035;
        this._page1textElements.freestylePlanetLandColorReadoutText = new FreestyleText(
            PlanetLandTypes[this._landAndMinePlanetSpec.planetBase],
            { left: left + (row2Left * width), height, top: row2height, width },
            COLORS.default,
            'none',
            TextType.STATIC);
        //#endregion
        //#region LaunchLandAndMineScene Row 3
        row3Left = groupLeftStart;
        row3height = sizeHeightForLandAndMine(3, height);

        this._page1textElements.freestyleGravityText = new FreestyleText(
            'gravity:',
            { left: left + (row3Left * width), height, top: row3height, width },
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
            { left: left + (row3Left * width), height, top: row3height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row3Left += 0.035;
        this._page1textElements.freestyleGravityReadoutText = new FreestyleText(
            this._landAndMinePlanetSpec.gravity.toFixed(5),
            { left: left + (row3Left * width), height, top: row3height, width },
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
            { left: left + (row3Left * width), height, top: row3height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row3Left += 0.05;
        this._page1textElements.freestyleWindText = new FreestyleText(
            'wind:',
            { left: left + (row3Left * width), height, top: row3height, width },
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
            { left: left + (row3Left * width), height, top: row3height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);

        row3Left += 0.035;
        this._page1textElements.freestyleWindReadoutText = new FreestyleText(
            `${this._landAndMinePlanetSpec.wind}%`,
            { left: left + (row3Left * width), height, top: row3height, width },
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
            { left: left + (row3Left * width), height, top: row3height, width },
            BUTTON_COLORS,
            onClick,
            true,
            0.5);
        //#endregion
        //#region LaunchLandAndMineScene Row 4
        row4Left = groupLeftStart;
        row4height = sizeHeightForLandAndMine(4, height);

        this._page1buttons.isWaterButton = new SmallToggleButton(
            { left: left + (row4Left * width), height, top: row4height, width },
            BUTTON_COLORS,
            'fa-tint',
            true);

        row4Left += 0.035;
        this._page1buttons.isFrozenButton = new SmallToggleButton(
            { left: left + (row4Left * width), height, top: row4height, width },
            BUTTON_COLORS,
            'fa-snowflake-o',
            true);

        row4Left += 0.035;
        this._page1buttons.isLifeButton = new SmallToggleButton(
            { left: left + (row4Left * width), height, top: row4height, width },
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
            { left: left + (row4Left * width), height, top: row4height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-diamond',
            0.5);

        row4Left += 0.035;
        this._page1textElements.freestyleOreTypeText = new FreestyleText(
            OreTypes[this._landAndMinePlanetSpec.ore],
            { left: left + (row4Left * width), height, top: row4height, width },
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
            { left: left + (row4Left * width), height, top: row4height, width },
            BUTTON_COLORS,
            onClick,
            true,
            'fa-plus',
            0.5);

        row4Left += 0.035;
        this._page1textElements.freestyleOreQuantityText = new FreestyleText(
            OreQuantity[this._landAndMinePlanetSpec.oreQuantity],
            { left: left + (row4Left * width), height, top: row4height, width },
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

    private _changeLeaderGraphic(): void {
        // Remove old graphic from dev menu, and reset animation values.
        if (this._page1Meshes.ancientRuinsLeaderOfficer0) {
            [0, 1, 2].forEach(i => {
                this._scene.remove(this._page1Meshes[`ancientRuinsLeaderOfficer${i}`]);
                this._page1Meshes[`ancientRuinsLeaderOfficer${i}`] = null;
            });
        }

        // Create the new graphic from the new value.
        const leadDictionaryValue = findMemberValue(this._ancientRuinsSpec.crew[4].appearance, ShirtColor.Yellow);
        const leadMeshes: [Mesh, Mesh, Mesh] = [null, null, null];
        [0, 1, 2].forEach(i => {
            const offCoordsX = leadDictionaryValue.spritePositionX[i];
            const offCoordsY = leadDictionaryValue.spritePositionY[i];
            const size = [spriteMapCols, spriteMapRows];
            const leadMat = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, leadMeshes, leadMat, i, 24.4, MIDDLE_COL + 5.2, -7);
            this._page1Meshes[`ancientRuinsLeaderOfficer${i}`] = leadMeshes[i];
        });
        this._ancientRuinsSpec.crew[4].animationMeshes = leadMeshes;
        this._ancientRuinsSpec.crew.forEach(cm => {
            cm.animationCounter = 0;
            [0, 1, 2].forEach(i => cm.animationMeshes[i] && cm.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, 0));
        });
    }

    private _changeMedicalOfficerGraphic(): void {
        // Remove old graphic from dev menu, and reset animation values.
        if (this._page1Meshes.ancientRuinsMedicalOfficer0) {
            [0, 1, 2].forEach(i => {
                this._scene.remove(this._page1Meshes[`ancientRuinsMedicalOfficer${i}`]);
                this._page1Meshes[`ancientRuinsMedicalOfficer${i}`] = null;
            });
        }

        // Create the new graphic from the new value.
        const medDictionaryValue = findMemberValue(this._ancientRuinsSpec.crew[2].appearance, ShirtColor.Blue);
        const medMeshes: [Mesh, Mesh, Mesh] = [null, null, null];
        [0, 1, 2].forEach(i => {
            const offCoordsX = medDictionaryValue.spritePositionX[i];
            const offCoordsY = medDictionaryValue.spritePositionY[i];
            const size = [spriteMapCols, spriteMapRows];
            const medMat = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, medMeshes, medMat, i, 24.4, MIDDLE_COL + 1, -7);
            this._page1Meshes[`ancientRuinsMedicalOfficer${i}`] = medMeshes[i];
        });
        this._ancientRuinsSpec.crew[2].animationMeshes = medMeshes;
        this._ancientRuinsSpec.crew.forEach(cm => {
            cm.animationCounter = 0;
            [0, 1, 2].forEach(i => cm.animationMeshes[i] && cm.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, 0));
        });
    }

    private _changeScienceOfficerGraphic(): void {
        // Remove old graphic from dev menu, and reset animation values.
        if (this._page1Meshes.ancientRuinsScienceOfficer0) {
            [0, 1, 2].forEach(i => {
                this._scene.remove(this._page1Meshes[`ancientRuinsScienceOfficer${i}`]);
                this._page1Meshes[`ancientRuinsScienceOfficer${i}`] = null;
            });
        }

        // Create the new graphic from the new value.
        const sciDictionaryValue = findMemberValue(this._ancientRuinsSpec.crew[3].appearance, ShirtColor.Blue);
        const sciMeshes: [Mesh, Mesh, Mesh] = [null, null, null];
        [0, 1, 2].forEach(i => {
            const offCoordsX = sciDictionaryValue.spritePositionX[i];
            const offCoordsY = sciDictionaryValue.spritePositionY[i];
            const size = [spriteMapCols, spriteMapRows];
            const sciMat = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, sciMeshes, sciMat, i, 24.4, MIDDLE_COL + 3.1, -7);
            this._page1Meshes[`ancientRuinsScienceOfficer${i}`] = sciMeshes[i];
        });
        this._ancientRuinsSpec.crew[3].animationMeshes = sciMeshes;
        this._ancientRuinsSpec.crew.forEach(cm => {
            cm.animationCounter = 0;
            [0, 1, 2].forEach(i => cm.animationMeshes[i] && cm.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, 0));
        });
    }

    private _changeSecurity1Graphic(): void {
        // Remove old graphic from dev menu, and reset animation values.
        if (this._page1Meshes.ancientRuinsSecurity1Officer0) {
            [0, 1, 2].forEach(i => {
                this._scene.remove(this._page1Meshes[`ancientRuinsSecurity1Officer${i}`]);
                this._page1Meshes[`ancientRuinsSecurity1Officer${i}`] = null;
            });
        }

        // Create the new graphic from the new value.
        const sec1DictionaryValue = findMemberValue(this._ancientRuinsSpec.crew[0].appearance, ShirtColor.Red);
        const sec1Meshes: [Mesh, Mesh, Mesh] = [null, null, null];
        [0, 1, 2].forEach(i => {
            const offCoordsX = sec1DictionaryValue.spritePositionX[i];
            const offCoordsY = sec1DictionaryValue.spritePositionY[i];
            const size = [spriteMapCols, spriteMapRows];
            const sec1Mat = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, sec1Meshes, sec1Mat, i, 24.4, MIDDLE_COL + 7.3, -7);
            this._page1Meshes[`ancientRuinsSecurity1Officer${i}`] = sec1Meshes[i];
        });
        this._ancientRuinsSpec.crew[0].animationMeshes = sec1Meshes;
        this._ancientRuinsSpec.crew.forEach(cm => {
            cm.animationCounter = 0;
            [0, 1, 2].forEach(i => cm.animationMeshes[i] && cm.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, 0));
        });
    }

    private _changeSecurity2Graphic(): void {
        // Remove old graphic from dev menu, and reset animation values.
        if (this._page1Meshes.ancientRuinsSecurity2Officer0) {
            [0, 1, 2].forEach(i => {
                this._scene.remove(this._page1Meshes[`ancientRuinsSecurity2Officer${i}`]);
                this._page1Meshes[`ancientRuinsSecurity2Officer${i}`] = null;
            });
        }

        // Create the new graphic from the new value.
        const sec2DictionaryValue = findMemberValue(this._ancientRuinsSpec.crew[1].appearance, ShirtColor.Red);
        const sec2Meshes: [Mesh, Mesh, Mesh] = [null, null, null];
        [0, 1, 2].forEach(i => {
            const offCoordsX = sec2DictionaryValue.spritePositionX[i];
            const offCoordsY = sec2DictionaryValue.spritePositionY[i];
            const size = [spriteMapCols, spriteMapRows];
            const sec2Mat = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, sec2Meshes, sec2Mat, i, 24.4, MIDDLE_COL + 9.4, -7);
            this._page1Meshes[`ancientRuinsSecurity2Officer${i}`] = sec2Meshes[i];
        });
        this._ancientRuinsSpec.crew[1].animationMeshes = sec2Meshes;
        this._ancientRuinsSpec.crew.forEach(cm => {
            cm.animationCounter = 0;
            [0, 1, 2].forEach(i => cm.animationMeshes[i] && cm.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, 0));
        });
    }

    /**
     * Transitions to the next page in the dev menu options.
     */
    private _next(): void {
        this._currentPage++;
        if (this._currentPage === 2) {
            Object.keys(this._page1buttons).forEach(x => this._page1buttons[x] && this._page1buttons[x].hide());
            Object.keys(this._page1Meshes).forEach(x => this._page1Meshes[x] && (this._page1Meshes[x].visible = false));
            Object.keys(this._page1profiles).forEach(x => this._page1profiles[x] && this._page1profiles[x].hide());
            Object.keys(this._page1textElements).forEach(x => this._page1textElements[x] && this._page1textElements[x].hide());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].show());
            Object.keys(this._page2Meshes).forEach(x => this._page2Meshes[x] && (this._page2Meshes[x].visible = true));
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].show());
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].show());
        } else if (this._currentPage === 3) {
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].hide());
            Object.keys(this._page2Meshes).forEach(x => this._page2Meshes[x] && (this._page2Meshes[x].visible = false));
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].hide());
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].hide());
            Object.keys(this._page3buttons).forEach(x => this._page3buttons[x] && this._page3buttons[x].show());
            Object.keys(this._page3Meshes).forEach(x => this._page3Meshes[x] && (this._page3Meshes[x].visible = true));
            Object.keys(this._page3profiles).forEach(x => this._page3profiles[x] && this._page3profiles[x].show());
            Object.keys(this._page3textElements).forEach(x => this._page3textElements[x] && this._page3textElements[x].show());
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

    //#region AncientRuinsScene
        this._buttons.launchAncientRuinsSceneButton.resize({ left: left + (0.50 * width), height, top: 0.01 * height, width });
        let groupLeftStart = 0.5;
        //#region AncientRuinsScene Row 0
        let row0Left = groupLeftStart;
        let row0height = sizeHeightForAncientRuins(0, height);

        this._page1buttons.changePlantColorButton.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.035;
        this._page1textElements.freestylePlantColorDisplayText.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.1;
        this._page1buttons.changeWaterColorButton.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.035;
        this._page1textElements.freestyleWaterColorDisplayText.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.12;
        this._page1buttons.changeBiomeRuinsButton.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.035;
        this._page1textElements.freestyleBiomeRuinsDisplayText.resize({ left: left + (row0Left * width), height, top: row0height, width });
        //#endregion
        //#region AncientRuinsScene Row 1
        let row1Left = groupLeftStart;
        let row1height = sizeHeightForAncientRuins(1, height);

        this._page1buttons.changeGroundMaterialButton.resize({ left: left + (row1Left * width), height, top: row1height, width });
        row1Left += 0.035;
        this._page1textElements.freestyleGroundMaterialDisplayText.resize({ left: left + (row1Left * width), height, top: row1height, width });
        row1Left += 0.1;
        this._page1buttons.changeWaterBiomeButton.resize({ left: left + (row1Left * width), height, top: row1height, width });
        row1Left += 0.035;
        this._page1textElements.freestyleWaterBiomeDisplayText.resize({ left: left + (row1Left * width), height, top: row1height, width });
        //#endregion
        //#region AncientRuinsScene Row 2
        let row2Left = groupLeftStart;
        let row2height = sizeHeightForAncientRuins(2, height);

        this._page1buttons.hasCloudsButton.resize({ left: left + (row2Left * width), height, top: row2height, width });
        row2Left += 0.035;
        this._page1buttons.hasAnimalLifeButton.resize({ left: left + (row2Left * width), height, top: row2height, width });
        row2Left += 0.035;
        this._page1buttons.changeTreeColorButton.resize({ left: left + (row2Left * width), height, top: row2height, width });
        row2Left += 0.035;
        this._page1textElements.freestyleTreeColorDisplayText.resize({ left: left + (row2Left * width), height, top: row2height, width });
        //#endregion
        //#region AncientRuinsScene Row 3
        let row3Left = groupLeftStart;
        let row3height = sizeHeightForAncientRuins(3, height);

        this._page1buttons.changeMedicalOfficerButton.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.070;
        this._page1buttons.changeScienceOfficerButton.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.070;
        this._page1buttons.changeLeaderButton.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.070;
        this._page1buttons.changeSecurity1Button.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.070;
        this._page1buttons.changeSecurity2Button.resize({ left: left + (row3Left * width), height, top: row3height, width });
        //#endregion
        //#region AncientRuinsScene Row 4
        let row4Left = groupLeftStart;
        let row4height = sizeHeightForAncientRuins(4, height);

        this._page1buttons.changeMedicalOfficerRankButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.040;
        this._page1textElements.freestyleMedicalOfficerRankDisplayText.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.030;
        this._page1buttons.changeScienceOfficerRankButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.040;
        this._page1textElements.freestyleScienceOfficerRankDisplayText.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.030;
        this._page1buttons.changeLeaderRankButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.040;
        this._page1textElements.freestyleTeamLeaderRankDisplayText.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.030;
        this._page1buttons.changeSecurity1RankButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.045;
        this._page1textElements.freestyleRedShirt1RankDisplayText.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.025;
        this._page1buttons.changeSecurity2RankButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.045;
        this._page1textElements.freestyleRedShirt2RankDisplayText.resize({ left: left + (row4Left * width), height, top: row4height, width });
        //#endregion
    //#endregion
        this._buttons.launchGameMenuButton.resize({ left: left + (0.115 * width), height, top: 0.1 * height, width });
        this._buttons.launchIntroSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.61 * height, width });
    //#region LandAndMineScene
        this._buttons.launchLandAndMineSceneButton.resize({ left: left + (0.175 * width), height, top: 0.785 * height, width });
        groupLeftStart = 0.015;
        //#region LandAndMineScene Row -2
        let rowSub2Left = groupLeftStart;
        let rowSub2height = sizeHeightForLandAndMine(-2, height);

        this._textElements.freestyleHThresholdText.resize({ left: left + (rowSub2Left * width), height, top: rowSub2height, width });
        rowSub2Left += 0.325;
        this._textElements.freestyleVThresholdText.resize({ left: left + (rowSub2Left * width), height, top: rowSub2height, width });
        //#endregion
        //#region LandAndMine Row -1
        let rowSub1Left = groupLeftStart;
        let rowSub1height = sizeHeightForLandAndMine(-1, height);

        this._buttons.horizontalCrashMarginMinusButton.resize({ left: left + (rowSub1Left * width), height, top: rowSub1height, width });
        rowSub1Left += 0.035;
        this._textElements.freestyleHorizontalCrashMarginReadoutText.resize({ left: left + (rowSub1Left * width), height, top: rowSub1height, width });
        rowSub1Left += 0.05;
        this._buttons.horizontalCrashMarginPlusButton.resize({ left: left + (rowSub1Left * width), height, top: rowSub1height, width });

        rowSub1Left += 0.238;
        this._buttons.verticalCrashMarginMinusButton.resize({ left: left + (rowSub1Left * width), height, top: rowSub1height, width });
        rowSub1Left += 0.035;
        this._textElements.freestyleVerticalCrashMarginReadoutText.resize({ left: left + (rowSub1Left * width), height, top: rowSub1height, width });
        rowSub1Left += 0.04;
        this._buttons.verticalCrashMarginPlusButton.resize({ left: left + (rowSub1Left * width), height, top: rowSub1height, width });
        //#endregion
        //#region LandAndMine Row 0
        row0Left = groupLeftStart;
        row0height = sizeHeightForLandAndMine(0, height);

        this._textElements.freestyleOxygenBurnText.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.12;
        this._buttons.oxygenBurnMinusButton.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.035;
        this._textElements.freestyleOxygenBurnReadoutText.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.04;
        this._buttons.oxygenBurnPlusButton.resize({ left: left + (row0Left * width), height, top: row0height, width });

        row0Left += 0.04;
        this._textElements.freestyleFuelBurnText.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.095;
        this._buttons.fuelBurnMinusButton.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.035;
        this._textElements.freestyleFuelBurnReadoutText.resize({ left: left + (row0Left * width), height, top: row0height, width });
        row0Left += 0.0425;
        this._buttons.fuelBurnPlusButton.resize({ left: left + (row0Left * width), height, top: row0height, width });
        //#endregion
        //#region LandAndMine Row 1
        row1Left = groupLeftStart;
        row1height = sizeHeightForLandAndMine(1, height);

        this._textElements.freestylePeakElevationText.resize({ left: left + (row1Left * width), height, top: row1height, width });
        row1Left += 0.14;
        this._buttons.peakElevationMinusButton.resize({ left: left + (row1Left * width), height, top: row1height, width });
        row1Left += 0.035;
        this._textElements.freestylePeakElevationReadoutText.resize({ left: left + (row1Left * width), height, top: row1height, width });
        row1Left += 0.02;
        this._buttons.peakElevationPlusButton.resize({ left: left + (row1Left * width), height, top: row1height, width });

        row1Left += 0.04;
        this._textElements.freestyleDrillLengthText.resize({ left: left + (row1Left * width), height, top: row1height, width });
        row1Left += 0.12;
        this._buttons.drillLengthMinusButton.resize({ left: left + (row1Left * width), height, top: row1height, width });
        row1Left += 0.035;
        this._textElements.freestyleDrillLengthReadoutText.resize({ left: left + (row1Left * width), height, top: row1height, width });
        row1Left += 0.025;
        this._buttons.drillLengthPlusButton.resize({ left: left + (row1Left * width), height, top: row1height, width });
        //#endregion
        //#region LandAndMine Row 2
        row2Left = groupLeftStart;
        row2height = sizeHeightForLandAndMine(2, height);

        this._textElements.freestyleSkyColorText.resize({ left: left + (row2Left * width), height, top: row2height, width });
        row2Left += 0.095;
        this._buttons.changeSkyTypeButton.resize({ left: left + (row2Left * width), height, top: row2height, width });
        row2Left += 0.035;
        this._textElements.freestyleSkyColorReadoutText.resize({ left: left + (row2Left * width), height, top: row2height, width });
        row2Left += 0.08;
        this._textElements.freestylePlanetLandColorText.resize({ left: left + (row2Left * width), height, top: row2height, width });
        row2Left += 0.105;
        this._buttons.changePlanetLandTypeButton.resize({ left: left + (row2Left * width), height, top: row2height, width });
        row2Left += 0.035;
        this._textElements.freestylePlanetLandColorReadoutText.resize({ left: left + (row2Left * width), height, top: row2height, width });
        //#endregion
        //#region LandAndMine Row 3
        row3Left = groupLeftStart;
        row3height = sizeHeightForLandAndMine(3, height);

        this._textElements.freestyleGravityText.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.08;
        this._buttons.gravityMinusButton.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.035;
        this._textElements.freestyleGravityReadoutText.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.075;
        this._buttons.gravityPlusButton.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.05;
        this._textElements.freestyleWindText.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.06;
        this._buttons.windMinusButton.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.035;
        this._textElements.freestyleWindReadoutText.resize({ left: left + (row3Left * width), height, top: row3height, width });
        row3Left += 0.045;
        this._buttons.windPlusButton.resize({ left: left + (row3Left * width), height, top: row3height, width });
        //#endregion
        //#region LandAndMine Row 4
        row4Left = groupLeftStart;
        row4height = sizeHeightForLandAndMine(4, height);

        this._buttons.isWaterButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.035;
        this._buttons.isFrozenButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.035;
        this._buttons.isLifeButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.035;
        this._buttons.changeOreTypeButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.035;
        this._textElements.freestyleOreTypeText.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.1;
        this._buttons.changeOreQuantityButton.resize({ left: left + (row4Left * width), height, top: row4height, width });
        row4Left += 0.035;
        this._textElements.freestyleOreQuantityText.resize({ left: left + (row4Left * width), height, top: row4height, width });
        //#endregion
    //#endregion
        this._buttons.launchPlanetRaidSceneButton.resize({ left: left + (0.29 * width), height, top: 0.20 * height, width });
        this._buttons.launchRepairSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.375 * height, width });
        this._buttons.launchShipLayoutSceneButton.resize({ left: left + (0.115 * width), height, top: 0.375 * height, width });
        this._buttons.launchTravelSceneButton.resize({ left: left + (0.115 * width), height, top: 0.61 * height, width });
        this._buttons.launchVertexMapSceneButton.resize({ left: left + (0.54 * width), height, top: 0.20 * height, width });
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
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].hide());
            Object.keys(this._page2Meshes).forEach(x => this._page2Meshes[x] && (this._page2Meshes[x].visible = false));
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].hide());
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].hide());
            Object.keys(this._page1buttons).forEach(x => this._page1buttons[x] && this._page1buttons[x].show());
            Object.keys(this._page1Meshes).forEach(x => this._page1Meshes[x] && (this._page1Meshes[x].visible = true));
            Object.keys(this._page1profiles).forEach(x => this._page1profiles[x] && this._page1profiles[x].show());
            Object.keys(this._page1textElements).forEach(x => this._page1textElements[x] && this._page1textElements[x].show());
        } else if (this._currentPage === 2) {
            Object.keys(this._page3buttons).forEach(x => this._page3buttons[x] && this._page3buttons[x].hide());
            Object.keys(this._page2Meshes).forEach(x => this._page2Meshes[x] && (this._page2Meshes[x].visible = false));
            Object.keys(this._page3profiles).forEach(x => this._page3profiles[x] && this._page3profiles[x].hide());
            Object.keys(this._page3textElements).forEach(x => this._page3textElements[x] && this._page3textElements[x].hide());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].show());
            Object.keys(this._page2Meshes).forEach(x => this._page2Meshes[x] && (this._page2Meshes[x].visible = true));
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].show());
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].show());
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
        
        if (this._currentPage === 1) {
            // Move all counters up by one and reset if they hit the ceiling
            Object.keys(this._page1counters).forEach(counter => {
                this._page1counters[counter]++;
                if (this._page1counters[counter] > this._page1countermaxes[counter]) {
                    this._page1counters[counter] = 0;
                }
            });

            [ 0, 1, 2, 3, 4 ].forEach(i => animateCrewMember(this._ancientRuinsSpec.crew[i]));

            if (this._page1counters.ancientRuinsCrew % 180 === 0) {
                [ 0, 1, 2, 3, 4 ].forEach(i => {
                    cycleCrewMemberDirection(this._ancientRuinsSpec.crew[i]);
                    this._ancientRuinsSpec.crew[i].animationCounter = 0;
                    rotateCrewMember(this._ancientRuinsSpec.crew[i]);
                });
            }
        }
    }

}
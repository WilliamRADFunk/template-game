import {
    DoubleSide,
    LinearFilter,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    Object3D,
    PlaneGeometry,
    Scene,
    Texture } from "three";

// Local utilities
import { createLander } from "../utils/create-lander";
import { createMiningTeam } from "../utils/create-mining-team";
import { MainThruster } from "../utils/main-thruster";
import { SideThruster } from "../utils/side-thruster";

// Panels
import { LeftBottomMiddlePanel } from "../../../controls/panels/left-bottom-middle-panel";
import { LeftBottomPanel } from "../../../controls/panels/left-bottom-panel";
import { LeftTopMiddlePanel } from "../../../controls/panels/left-top-middle-panel";
import { LeftTopPanel } from "../../../controls/panels/left-top-panel";
import { PanelBase } from "../../../controls/panels/panel-base";
import { RightBottomMiddlePanel } from "../../../controls/panels/right-bottom-middle-panel";
import { RightBottomPanel } from "../../../controls/panels/right-bottom-panel";
import { RightTopMiddlePanel } from "../../../controls/panels/right-top-middle-panel";
import { RightTopPanel } from "../../../controls/panels/right-top-panel";

// HTML Texts
import { FreestyleText } from "../../../controls/text/freestyle-text";
import { RightTopStatsText4 } from "../../../controls/text/stats/right-top-stats-text-4";
import { TextBase } from "../../../controls/text/text-base";
import { TextType } from "../../../controls/text/text-type";
import { LeftBottomMiddleTitleText } from "../../../controls/text/title/left-bottom-middle-title-text";
import { LeftBottomTitleText } from "../../../controls/text/title/left-bottom-title-text";
import { LeftTopMiddleTitleText } from "../../../controls/text/title/left-top-middle-title-text";
import { LeftTopTitleText } from "../../../controls/text/title/left-top-title-text";
import { RightBottomMiddleTitleText } from "../../../controls/text/title/right-bottom-middle-title-text";
import { RightBottomTitleText } from "../../../controls/text/title/right-bottom-title-text";
import { RightTopMiddleTitleText } from "../../../controls/text/title/right-top-middle-title-text";
import { RightTopTitleText } from "../../../controls/text/title/right-top-title-text";

// Buttons
import { ButtonBase } from "../../../controls/buttons/button-base";
import { MineButton } from "../../../controls/buttons/mine-button";
import { PackItUpButton } from "../../../controls/buttons/pack-it-up-button";
import { BUTTON_COLORS, BUTTON_COLORS_INVERSE } from "../../../styles/button-colors";

// Interfaces
import { Actor } from "../../../models/actor";
import { HTMLElementPosition } from "../../../models/html-element-position";
import { LanderSpecifications } from "../../../models/lander-specifications";
import { PlanetLandColors, PlanetSpecifications, OreTypeColors, SkyColors } from "../../../models/planet-specifications";

// Constants and Singletons
import { SoundinatorSingleton } from "../../../soundinator";
import { COLORS } from "../../../styles/colors";
import { colorLuminance } from "../../../utils/color-shader";
import { noOp } from "../../../utils/no-op";
import { Explosion } from "../../../weapons/explosion";
import { UnloadButton } from "../../../controls/buttons/unload-button";
import { LoadButton } from "../../../controls/buttons/load-button";
import { ProfileBase } from "../../../controls/profiles/profile-base";
import { RightBottomMiddleProfile } from "../../../controls/profiles/right-bottom-middle-profile";
import { RightBottomMiddleDialogueText } from "../../../controls/text/dialogue/right-bottom-middle-dialogue-text";
import { dialogues } from "../configs/dialogues";

/**
 * Border for dev purposes. Normally set to null.
 */
let border: string;

/**
 * Y Coordinate offset for the side thrusters in this scene.
 */
const SIDE_THRUSTER_Y_OFFSET: number = 1;

/**
 * Z Coordinate offset for the side thrusters in this scene.
 */
const SIDE_THRUSTER_Z_OFFSET: number = -0.37;

/**
 * Y Coordinate offset for the main thruster in this scene.
 */
const MAIN_THRUSTER_Y_OFFSET: number = 1;

/**
 * Y Coordinate offset for the main thruster in this scene.
 */
const MAIN_THRUSTER_Z_OFFSET: number = 0.3;

/**
 * Y Coordinate offset for the smaller main thruster in this scene.
 */
const MAIN_THRUSTER_Z_OFFSET_SMALL: number = 0.16;

/**
 * Sets the starting position of the top left lander.
 */
const HELP_LANDER_1_POSITION: [number, number, number] = [-2.25, -8, -4];

/**
 * Sets the starting position of the top right lander.
 */
const HELP_LANDER_2_POSITION: [number, number, number] = [2.75, -9, -5];

/**
 * Sets the starting position of the first bottom left lander.
 */
const HELP_LANDER_3_POSITION: [number, number, number] = [-4.675, -9, 4];

/**
 * Sets the starting position of the second bottom left lander.
 */
const HELP_LANDER_4_POSITION: [number, number, number] = [-3.14, -9, 4];

/**
 * Sets the starting position of the third bottom left lander.
 */
const HELP_LANDER_5_POSITION: [number, number, number] = [-1.625, -9, 4];

/**
 * Sets the starting position of the bottom middle left lander.
 */
const HELP_LANDER_6_POSITION: [number, number, number] = [-3.14, -8, 1.9];

/**
 * Sets the starting position of the top left main thruster.
 */
const HELP_MAIN_THRUSTER_1_POSITION: [number, number, number] = [
    HELP_LANDER_1_POSITION[0],
    HELP_LANDER_1_POSITION[1] + MAIN_THRUSTER_Y_OFFSET,
    HELP_LANDER_1_POSITION[2] + MAIN_THRUSTER_Z_OFFSET];

/**
 * Sets the starting position of the top right main thruster.
 */
const HELP_MAIN_THRUSTER_2_POSITION: [number, number, number] = [
    HELP_LANDER_2_POSITION[0],
    HELP_LANDER_2_POSITION[1] + MAIN_THRUSTER_Y_OFFSET,
    HELP_LANDER_2_POSITION[2] + MAIN_THRUSTER_Z_OFFSET
];

/**
 * Sets the starting position of the first bottom left main thruster.
 */
const HELP_MAIN_THRUSTER_3_POSITION: [number, number, number] = [
    HELP_LANDER_3_POSITION[0],
    HELP_LANDER_3_POSITION[1] + MAIN_THRUSTER_Y_OFFSET,
    HELP_LANDER_3_POSITION[2] + MAIN_THRUSTER_Z_OFFSET_SMALL
];

/**
 * Sets the starting position of the second bottom left main thruster.
 */
const HELP_MAIN_THRUSTER_4_POSITION: [number, number, number] = [
    HELP_LANDER_4_POSITION[0],
    HELP_LANDER_4_POSITION[1] + MAIN_THRUSTER_Y_OFFSET,
    HELP_LANDER_4_POSITION[2] + MAIN_THRUSTER_Z_OFFSET_SMALL
];

/**
 * Sets the starting position of the third bottom left main thruster.
 */
const HELP_MAIN_THRUSTER_5_POSITION: [number, number, number] = [
    HELP_LANDER_5_POSITION[0],
    HELP_LANDER_5_POSITION[1] + MAIN_THRUSTER_Y_OFFSET,
    HELP_LANDER_5_POSITION[2] + MAIN_THRUSTER_Z_OFFSET_SMALL
];

/**
 * Sets the starting position of the top left side thrusters.
 */
const HELP_SIDE_THRUSTER_1_POSITION: [number, number, number] = [
    HELP_LANDER_1_POSITION[0],
    HELP_LANDER_1_POSITION[1] + SIDE_THRUSTER_Y_OFFSET,
    HELP_LANDER_1_POSITION[2] + SIDE_THRUSTER_Z_OFFSET];

/**
 * Sets the starting position of the top right side thrusters.
 */
const HELP_SIDE_THRUSTER_2_POSITION: [number, number, number] = [
    HELP_LANDER_2_POSITION[0],
    HELP_LANDER_2_POSITION[1] + SIDE_THRUSTER_Y_OFFSET,
    HELP_LANDER_2_POSITION[2] + SIDE_THRUSTER_Z_OFFSET
];

/**
 * Sets the starting position of the top left lander.
 */
const DRILL_BIT_START_POSITION: [number, number, number] = [
    HELP_LANDER_1_POSITION[0] + 5,
    HELP_LANDER_1_POSITION[1] - 3,
    HELP_LANDER_1_POSITION[2] + 3];

/**
 * @class
 * The help controller class - coordinates everything on the help screen.
 */
export class HelpCtrl {
    /**
     * Container for the mining controls section's drill bit graphics.
     */
    private _drillBits: Mesh[] = [];

    /**
     * All of the actors contained in the help screen.
     */
    private _helpActors: { [key: string]: any } = {};

    /**
     * All of the buttons contained in the help screen.
     */
    private _helpButtons: { [key: string]: ButtonBase } = {};

    /**
     * All of the counters, and counter clearing threasholds.
     */
    private _helpCounters: { [key: string]: number } = {
        astroWalk: 0,
        astroWalkClear: 360,
        blockTypes: 0,
        blockTypesClear: 7310,
        landingLeaving: 0,
        landingLeavingClear: 1260,
        landingLeavingFlashOn: 1,
        landingLeavingGravity: 0.0001,
        landingLeavingVerticalSpeed: 0,
        landingThresholds: 0,
        landingThresholdsClear: 2130,
        landingThresholdsFlashOn: 1,
        landingThresholdsGravity: 0.0005,
        landingThresholdsHorizontalSpeed: 0,
        landingThresholdsVerticalSpeed: 0,
        loadUnload: 0,
        loadUnloadClear: 840,
        loadUnloadCurrPositionX: HELP_LANDER_6_POSITION[0],
        loadUnloadCurrPositionY: HELP_LANDER_6_POSITION[1] - 3,
        loadUnloadCurrPositionZ: HELP_LANDER_6_POSITION[2] + 0.3,
        mining: 0,
        miningClear: 720,
        thrust: 0,
        thrustClear: 360
    };

    /**
     * All of the meshes contained in the help screen.
     */
    private _helpMeshes: { [key: string]: Mesh | Object3D } = {};

    /**
     * All of the background panels contained in the help screen.
     */
    private _helpPanels: { [key: string]: PanelBase } = {};

    /**
     * The profile image contained in the help screen.
     */
    private _helpProfile: ProfileBase;

    /**
     * All of the terrain-based meshes contained in the help screen.
     */
    private _helpTerrainMeshes: { [key: string]: (Mesh[][] | Object3D[][]) } = {
        blockTypes: [] as Mesh[][] | Object3D[][],
        landingLeavingBasePart1: [] as Mesh[][] | Object3D[][],
        landingLeavingBasePart2: [] as Mesh[][] | Object3D[][],
        landingLeavingBasePart3: [] as Mesh[][] | Object3D[][],
        landingThresholdsGroundSpeed: [] as Mesh[][] | Object3D[][],
        loadUnload: [] as Mesh[][] | Object3D[][]
    }

    /**
     * All of the HTML text contained in the help screen.
     */
    private _helpTexts: { [key: string]: TextBase } = {};

    /**
     * All the details about the ship needed for determining speed, suffocation, and crashes.
     */
    private _landerSpecifications: LanderSpecifications;

    /**
     * All the details about the planet body needed for building the scene.
     */
    private _planetSpecifications: PlanetSpecifications;

    /**
     * All of the textures contained in the help screen.
     */
    private _textures: { [key: string]: Texture } = {};

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * Constructor for the HelpCtrl Class.
     * @param scene                 ThreeJS scene to add meshes to for help screen.
     * @param textures              textures used to make certain meshes in the help screen.
     * @param planetSpecifications  all the details about the planet body needed for building the scene.
     * @param landerSpecifications  all the details about the ship needed for determining speed, suffocation, and crashes.
     * @param brdr                  dev environment brdr set in creating class.
     */
    constructor(
        scene: Scene,
        textures: { [key: string]: Texture },
        planetSpecifications: PlanetSpecifications,
        landerSpecifications: LanderSpecifications,
        brdr: string) {
        this._scene = scene;
        this._textures = textures;
        this._planetSpecifications = planetSpecifications;
        this._landerSpecifications = landerSpecifications;
        border = brdr;
        this._buildHelpScreen();
    }


    /**
     * Coordinates the creation of all the help screen content.
     */
    private _buildHelpScreen(): void {
        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        // Help screen backdrop
        const backingGeo = new PlaneGeometry( 15, 15, 10, 10 );
        const backingMat = new MeshBasicMaterial({
            color: 0x000000,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        const backingMesh = new Mesh(backingGeo, backingMat);
        backingMesh.name = 'Help Backing Mesh';
        backingMesh.rotation.set(1.5708, 0, 0);
        this._scene.add(backingMesh);
        backingMesh.visible = false;
        this._helpMeshes.mainBackground = backingMesh;

        // Help screen panels
        this._helpPanels.rightTopPanel = new RightTopPanel(this._scene);
        this._helpPanels.rightTopPanel.hide();
        this._helpPanels.leftTopPanel = new LeftTopPanel(this._scene);
        this._helpPanels.leftTopPanel.hide();
        this._helpPanels.rightTopMiddlePanel = new RightTopMiddlePanel(this._scene);
        this._helpPanels.rightTopMiddlePanel.hide();
        this._helpPanels.leftTopMiddlePanel = new LeftTopMiddlePanel(this._scene);
        this._helpPanels.leftTopMiddlePanel.hide();
        this._helpPanels.rightBottomMiddlePanel = new RightBottomMiddlePanel(this._scene);
        this._helpPanels.rightBottomMiddlePanel.hide();
        this._helpPanels.leftBottomMiddlePanel = new LeftBottomMiddlePanel(this._scene);
        this._helpPanels.leftBottomMiddlePanel.hide();
        this._helpPanels.leftBottomPanel = new LeftBottomPanel(this._scene);
        this._helpPanels.leftBottomPanel.hide();
        this._helpPanels.rightBottomPanel = new RightBottomPanel(this._scene);
        this._helpPanels.rightBottomPanel.hide();

        const arrowGeo = new PlaneGeometry( 0.5, 0.5, 10, 10 );
        const groundGeo = new PlaneGeometry( 0.1, 0.1, 10, 10 );
        const innerWaterGeo = new PlaneGeometry( 0.05, 0.05, 10, 10 );
        const keyGeo = new PlaneGeometry( 1.1, 0.4, 10, 10 );
        const mouseGeo = new PlaneGeometry( 0.5, 0.5, 10, 10 );

        const arrowMat = new MeshBasicMaterial();
        arrowMat.map = this._textures.arrow;
        arrowMat.map.minFilter = LinearFilter;
        (arrowMat as any).shininess = 0;
        arrowMat.transparent = true;

        const keyLeftMat = new MeshBasicMaterial();
        keyLeftMat.map = this._textures.keysForLeft;
        keyLeftMat.map.minFilter = LinearFilter;
        (keyLeftMat as any).shininess = 0;
        keyLeftMat.transparent = true;

        const keyRightMat = new MeshBasicMaterial();
        keyRightMat.map = this._textures.keysForRight;
        keyRightMat.map.minFilter = LinearFilter;
        (keyRightMat as any).shininess = 0;
        keyRightMat.transparent = true;

        const keyUpMat = new MeshBasicMaterial();
        keyUpMat.map = this._textures.keysForUp;
        keyUpMat.map.minFilter = LinearFilter;
        (keyUpMat as any).shininess = 0;
        keyUpMat.transparent = true;

        const keyDownMat = new MeshBasicMaterial();
        keyDownMat.map = this._textures.keysForDown;
        keyDownMat.map.minFilter = LinearFilter;
        (keyDownMat as any).shininess = 0;
        keyDownMat.transparent = true;

        const mouseLeftMat = new MeshBasicMaterial();
        mouseLeftMat.map = this._textures.mouseLeft;
        mouseLeftMat.map.minFilter = LinearFilter;
        (mouseLeftMat as any).shininess = 0;
        mouseLeftMat.transparent = true;

        const mouseMat = new MeshBasicMaterial();
        mouseMat.map = this._textures.mouse;
        mouseMat.map.minFilter = LinearFilter;
        (mouseMat as any).shininess = 0;
        mouseMat.transparent = true;

        const commonRockMat = new MeshBasicMaterial({
            color: colorLuminance(PlanetLandColors[this._planetSpecifications.planetBase], 6 / 10),
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });

        const waterMat = new MeshBasicMaterial({
            color: 0x006FCE,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        const iceMat = new MeshBasicMaterial({
            color: 0xEEEEEE,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });

        this._buildHelpScreenLandingControls(
            arrowGeo,
            arrowMat,
            keyGeo,
            keyLeftMat,
            keyRightMat,
            keyUpMat,
            { height, left, top: null, width });

        this._buildHelpScreenThresholds(
            groundGeo,
            commonRockMat,
            { height, left, top: null, width });

        this._buildHelpScreenAstronautControls(
            arrowGeo,
            arrowMat,
            keyGeo,
            keyLeftMat,
            keyRightMat,
            { height, left, top: null, width });

        this._buildHelpScreenMiningControls(
            arrowGeo,
            arrowMat,
            keyGeo,
            mouseGeo,
            keyDownMat,
            keyUpMat,
            mouseMat,
            mouseLeftMat,
            { height, left, top: null, width });

        this._buildHelpScreenLoadUnload(
            arrowGeo,
            groundGeo,
            mouseGeo,
            arrowMat,
            commonRockMat,
            mouseMat,
            mouseLeftMat,
            { height, left, top: null, width });

        this._buildHelpScreenBlockTypes(
            iceMat,
            waterMat,
            { height, left, top: null, width });

        this._buildHelpScreenLandingLeaving(
            groundGeo,
            innerWaterGeo,
            commonRockMat,
            iceMat,
            waterMat,
            { height, left, top: null, width });

        this._buildHelpScreenControlPanel(
            { height, left, top: null, width });
    }

    /**
     * Creates everything needed for the Astronaut Controls panel.
     * @param arrowGeo the geometry used to make all the arrow meshes in this panel
     * @param arrowMat the material used to make all the arrow meshes in this panel
     * @param keyGeo the geometry used to make all the key meshes in this panel
     * @param keyLeftMat the material used to make the left keys mesh in this panel
     * @param keyRightMat the material used to make the right keys mesh in this panel
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenAstronautControls(
        arrowGeo: PlaneGeometry,
        arrowMat: MeshBasicMaterial,
        keyGeo: PlaneGeometry,
        keyLeftMat: MeshBasicMaterial,
        keyRightMat: MeshBasicMaterial,
        position: HTMLElementPosition): void {
        // Create astronaut mining team for astronaut controls
        this._helpActors.astronauts = createMiningTeam(
            {
                astronaut1: this._textures.astronaut1,
                astronaut2: this._textures.astronaut2,
                astronaut3: this._textures.astronaut3,
                astronautSuffocation1: this._textures.astronautSuffocation1,
                astronautSuffocation2: this._textures.astronautSuffocation2,
                astronautSuffocation3: this._textures.astronautSuffocation3,
                astronautSuffocation4: this._textures.astronautSuffocation4,
                astronautSuffocation5: this._textures.astronautSuffocation5
            },
            {
                miningEquipment1: this._textures.miningEquipment1,
                miningEquipment2: this._textures.miningEquipment2
            }).slice(0, 9);

        // Position the miners on the screen, make them larger, and hide them.
        this._helpActors.astronauts.filter((astro: Actor) => !!astro).forEach((astro: Actor, index: number) => {
            this._scene.add(astro.mesh);
            astro.mesh.scale.set(3, 3, 3);
            astro.mesh.visible = false;
            if (index === 1) {
                astro.mesh.position.set(HELP_LANDER_1_POSITION[0], HELP_LANDER_1_POSITION[1] - 2, HELP_LANDER_1_POSITION[2] + 3);
            } else if (index % 3 === 0) {
                astro.mesh.position.set(HELP_LANDER_1_POSITION[0] - 0.3, HELP_LANDER_1_POSITION[1] - 2, HELP_LANDER_1_POSITION[2] + 3);
            } else {
                astro.mesh.position.set(HELP_LANDER_1_POSITION[0] + 0.3, HELP_LANDER_1_POSITION[1] - 2, HELP_LANDER_1_POSITION[2] + 3);
            }
        });

        // Left Arrow graphics
        const arrowLeft = new Mesh(arrowGeo, arrowMat);
        arrowLeft.name = 'Left Arrow Astro Walk Mesh';
        arrowLeft.position.set(HELP_LANDER_1_POSITION[0] - 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3);
        arrowLeft.rotation.set(-1.5708, 0, 3.1416);
        this._scene.add(arrowLeft);
        arrowLeft.visible = false;
        this._helpMeshes.arrowLeftAstroWalk = arrowLeft;

        // Left Keys graphics
        const keyLeft = new Mesh(keyGeo, keyLeftMat);
        keyLeft.name = 'Left Keys Astro Walk Mesh';
        keyLeft.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3.6);
        keyLeft.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyLeft);
        keyLeft.visible = false;
        this._helpMeshes.keysLeftAstroWalk = keyLeft;

        // Right Arrow graphics
        const arrowRight = new Mesh(arrowGeo, arrowMat);
        arrowRight.name = 'Right Arrow Astro Walk Mesh';
        arrowRight.position.set(HELP_LANDER_1_POSITION[0] + 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3);
        arrowRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(arrowRight);
        arrowRight.visible = false;
        this._helpMeshes.arrowRightAstroWalk = arrowRight;

        // Right Keys graphics
        const keyRight = new Mesh(keyGeo, keyRightMat);
        keyRight.name = 'Right Keys Astro Walk Mesh';
        keyRight.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3.6);
        keyRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyRight);
        keyRight.visible = false;
        this._helpMeshes.keysRightAstroWalk = keyRight;

        // Astronaut Text graphics
        this._helpTexts.astronautControlsTitle = new LeftTopMiddleTitleText(
            'Astronaut Controls',
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.astronautControlsTitle.hide();
    }

    /**
     * Creates everything needed for the Block Types panel.
     * @param iceMat the material used to make all the ice meshes in this panel
     * @param waterMat the material used to make all the water meshes in this panel
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenBlockTypes(
        iceMat: MeshBasicMaterial,
        waterMat: MeshBasicMaterial,
        position: HTMLElementPosition): void {
        // Profile Image graphics
        this._helpProfile = new RightBottomMiddleProfile(this._scene, this._textures.scienceOfficerProfile1, true);
        this._helpProfile.hide();

        // Dialogue Text graphics
        this._helpTexts.blockTypesDialogue = new RightBottomMiddleDialogueText(
            dialogues['Fuel'],
            position,
            COLORS.neutral,
            border,
            TextType.DIALOGUE);
        this._helpTexts.blockTypesDialogue.hide();

        // Block Types Fuel Full Text graphics
        this._helpTexts.blockTypesFuelFull = new FreestyleText(
            '*** Fuel: 100%',
            {
                height: position.height,
                left: (position.left + (0.50 * position.width)),
                top: (0.69 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.blockTypesFuelFull.hide();

        // Block Types Fuel Danger Text graphics
        this._helpTexts.blockTypesFuelDanger = new FreestyleText(
            '*** Fuel: 20%',
            {
                height: position.height,
                left: (position.left + (0.50 * position.width)),
                top: (0.69 * position.height),
                width: position.width
            },
            COLORS.selected,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.blockTypesFuelDanger.hide();

        // Block Types Fuel Empty Text graphics
        this._helpTexts.blockTypesFuelEmpty = new FreestyleText(
            '*** Fuel: 0%',
            {
                height: position.height,
                left: (position.left + (0.50 * position.width)),
                top: (0.69 * position.height),
                width: position.width
            },
            COLORS.selected,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.blockTypesFuelEmpty.hide();

        // Block Types Oxygen Full Text graphics
        this._helpTexts.blockTypesOxygenFull = new FreestyleText(
            '*** Oxygen: 100%',
            {
                height: position.height,
                left: (position.left + (0.50 * position.width)),
                top: (0.69 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.blockTypesOxygenFull.hide();

        // Block Types Oxygen Danger Text graphics
        this._helpTexts.blockTypesOxygenDanger = new FreestyleText(
            '*** Oxygen: 20%',
            {
                height: position.height,
                left: (position.left + (0.50 * position.width)),
                top: (0.69 * position.height),
                width: position.width
            },
            COLORS.selected,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.blockTypesOxygenDanger.hide();

        // Block Types Oxygen Empty Text graphics
        this._helpTexts.blockTypesOxygenEmpty = new FreestyleText(
            '*** Oxygen: 0%',
            {
                height: position.height,
                left: (position.left + (0.50 * position.width)),
                top: (0.69 * position.height),
                width: position.width
            },
            COLORS.selected,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.blockTypesOxygenEmpty.hide();

        // Block Types Example Text graphics
        this._helpTexts.blockTypesExample = new FreestyleText(
            'Example:',
            {
                height: position.height,
                left: (position.left + (0.50 * position.width)),
                top: (0.69 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.blockTypesExample.hide();

        // Block Types Oxygen Full Text graphics
        this._helpTexts.blockTypesWindSpeed = new FreestyleText(
            '*** Wind Speed: 0.000',
            {
                height: position.height,
                left: (position.left + (0.50 * position.width)),
                top: (0.69 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.blockTypesWindSpeed.hide();

        const geo = new PlaneGeometry( 0.3, 0.3, 10, 10 );
        const innerGeo = new PlaneGeometry( 0.2, 0.2, 10, 10 );
        // Ore Block Type graphic
        const row = 35;
        const startCol = 71;

        const oreTypeMat = new MeshBasicMaterial({
            color: OreTypeColors[this._planetSpecifications.ore],
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });

        const oreBlock = new Mesh( geo, oreTypeMat );
        oreBlock.name = `${Math.random()} - demo - ore block - `;
        oreBlock.position.set(-6 + (startCol/10), -7, 6 - row/10 - 0.025);
        oreBlock.rotation.set(1.5708, 0, 0);
        oreBlock.visible = false;
        this._scene.add(oreBlock);
        this._helpTerrainMeshes.blockTypes[0] = [oreBlock];

        // Common Block Type graphics
        const commonRockMats: MeshBasicMaterial[] = [];
        for (let i = 0; i < 7; i++) {
            const commonRockMat = new MeshBasicMaterial({
                color: colorLuminance(PlanetLandColors[this._planetSpecifications.planetBase], i / 10),
                opacity: 1,
                transparent: true,
                side: DoubleSide
            });
            commonRockMats.push(commonRockMat);
        }
        this._helpTerrainMeshes.blockTypes[1] = [];

        for (let x = startCol; x < startCol + 7; x++) {
            const index = x - startCol;
            const block = new Mesh( geo, commonRockMats[index] );
            block.name = `${Math.random()} - demo - common rocks - ${index} - `;
            block.position.set(-6 + (x/10) + (0.25 * index), -7, 6 - row/10 - 0.025);
            block.rotation.set(1.5708, 0, 0);
            block.visible = false;
            this._scene.add(block);
            this._helpTerrainMeshes.blockTypes[1].push(block);
        }

        // Water & Ice Block Type graphics
        this._helpTerrainMeshes.blockTypes[2] = [];

        const waterBlock = new Mesh( geo, waterMat );
        waterBlock.name = `${Math.random()} - demo - water block - `;
        waterBlock.position.set(-6 + (startCol/10), -7, 6 - row/10 - 0.025);
        waterBlock.rotation.set(1.5708, 0, 0);
        waterBlock.visible = false;
        this._scene.add(waterBlock);
        this._helpTerrainMeshes.blockTypes[2].push(waterBlock);
        const iceBlock = new Mesh( geo, iceMat );
        iceBlock.name = `${Math.random()} - demo - ice block outer - `;
        iceBlock.position.set(-6 + ((startCol + 1)/10) + 0.25, -6.5, 6 - row/10 - 0.025);
        iceBlock.rotation.set(1.5708, 0, 0);
        iceBlock.visible = false;
        this._scene.add(iceBlock);
        this._helpTerrainMeshes.blockTypes[2].push(iceBlock);
        const frozenWater = new Mesh( innerGeo, waterMat );
        frozenWater.name = `${Math.random()} - demo - ice block inner - `;
        frozenWater.position.set(-6 + ((startCol + 1)/10) + 0.25, -7, 6 - row/10 - 0.025);
        frozenWater.rotation.set(1.5708, 0, 0);
        frozenWater.visible = false;
        this._scene.add(frozenWater);
        this._helpTerrainMeshes.blockTypes[2].push(frozenWater);

        // Plant/Food Block Type graphics
        this._helpTerrainMeshes.blockTypes[3] = [];

        const lifeMats: MeshBasicMaterial[] = [];
        const lifeMatColorBase = '008000';
        for (let i = 0; i < 5; i++) {
            const lifeMat = new MeshBasicMaterial({
                color: colorLuminance(lifeMatColorBase, i / 10),
                opacity: 1,
                transparent: true,
                side: DoubleSide
            });
            lifeMats.push(lifeMat);
        }

        for (let y = startCol; y < startCol + 5; y++) {
            const index = y - startCol;
            const block = new Mesh( geo, lifeMats[index] );
            block.name = `${Math.random()} - demo - food - ${index} - `;
            block.position.set(-6 + (y/10) + (0.25 * index), -7, 6 - row/10 - 0.025);
            block.rotation.set(1.5708, 0, 0);
            block.visible = false;
            this._scene.add(block);
            this._helpTerrainMeshes.blockTypes[3].push(block);
        }

        // Danger Block Type graphics
        this._helpTerrainMeshes.blockTypes[4] = [];

        const dangerMat = new MeshBasicMaterial({
            color: 0xFF0000,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });

        const dangerBlock = new Mesh( geo, dangerMat );
        dangerBlock.name = `${Math.random()} - demo - danger block - `;
        dangerBlock.position.set(-6 + (startCol/10), -7, 6 - row/10 - 0.025);
        dangerBlock.rotation.set(1.5708, 0, 0);
        dangerBlock.visible = false;
        this._scene.add(dangerBlock);
        this._helpTerrainMeshes.blockTypes[4].push(dangerBlock);

        // Block Types Text graphics
        this._helpTexts.blockTypesTitle = new RightBottomMiddleTitleText(
            'Blocks, Fuel, & Oxygen',
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.blockTypesTitle.hide();
    }

    /**
     * Creates everything needed for the Control Panel panel.
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenControlPanel(position: HTMLElementPosition): void {
        // Control Panel Text graphics
        this._helpTexts.controlPanelTitle = new RightBottomTitleText(
            'Control Panel',
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.controlPanelTitle.hide();
    }

    /**
     * Creates everything needed for the Landing Controls panel.
     * @param arrowGeo the geometry used to make all the arrow meshes in this panel
     * @param arrowMat the material used to make all the arrow meshes in this panel
     * @param keyGeo the geometry used to make all the key meshes in this panel
     * @param keyLeftMat the material used to make the left keys mesh in this panel
     * @param keyRightMat the material used to make the right keys mesh in this panel
     * @param keyUpMat the material used to make the up keys mesh in this panel
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenLandingControls(
        arrowGeo: PlaneGeometry,
        arrowMat: MeshBasicMaterial,
        keyGeo: PlaneGeometry,
        keyLeftMat: MeshBasicMaterial,
        keyRightMat: MeshBasicMaterial,
        keyUpMat: MeshBasicMaterial,
        position: HTMLElementPosition): void {
        // Create lander graphic
        this._helpMeshes.lander1 = createLander(this._textures.ship).mesh;
        this._helpMeshes.lander1.position.set(HELP_LANDER_1_POSITION[0], HELP_LANDER_1_POSITION[1], HELP_LANDER_1_POSITION[2]);
        this._helpMeshes.lander1.visible = false;
        this._helpMeshes.lander1.scale.set(2, 2, 2);
        this._scene.add(this._helpMeshes.lander1);
        this._helpActors.sideThrusterLeft = new SideThruster(this._scene, HELP_SIDE_THRUSTER_1_POSITION, -1, 1.5);
        this._helpActors.sideThrusterRight = new SideThruster(this._scene, HELP_SIDE_THRUSTER_1_POSITION, 1, 1.5);
        this._helpActors.mainThruster = new MainThruster(this._scene, HELP_MAIN_THRUSTER_1_POSITION, 2);

        // Right Arrow graphics
        const arrowRight = new Mesh(arrowGeo, arrowMat);
        arrowRight.name = 'Right Arrow Mesh';
        arrowRight.position.set(HELP_LANDER_1_POSITION[0] + 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2]);
        arrowRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(arrowRight);
        arrowRight.visible = false;
        this._helpMeshes.arrowRight = arrowRight;

        // Left Arrow graphics
        arrowMat.map = this._textures.arrow;
        const arrowLeft = new Mesh(arrowGeo, arrowMat);
        arrowLeft.name = 'Left Arrow Mesh';
        arrowLeft.position.set(HELP_LANDER_1_POSITION[0] - 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2]);
        arrowLeft.rotation.set(-1.5708, 0, 3.1416);
        this._scene.add(arrowLeft);
        arrowLeft.visible = false;
        this._helpMeshes.arrowLeft = arrowLeft;

        // Up Arrow graphics
        arrowMat.map = this._textures.arrow;
        const arrowUp = new Mesh(arrowGeo, arrowMat);
        arrowUp.name = 'Up Arrow Mesh';
        arrowUp.position.set(HELP_LANDER_1_POSITION[0], HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] - 1);
        arrowUp.rotation.set(-1.5708, 0, 1.5708);
        this._scene.add(arrowUp);
        arrowUp.visible = false;
        this._helpMeshes.arrowUp = arrowUp;

        // Up Keys graphics
        const keyUp = new Mesh(keyGeo, keyUpMat);
        keyUp.name = 'Up Keys Mesh';
        keyUp.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 0.8);
        keyUp.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyUp);
        keyUp.visible = false;
        this._helpMeshes.keysUp = keyUp;

        // Left Keys graphics
        const keyLeft = new Mesh(keyGeo, keyLeftMat);
        keyLeft.name = 'Left Keys Mesh';
        keyLeft.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 0.8);
        keyLeft.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyLeft);
        keyLeft.visible = false;
        this._helpMeshes.keysLeft = keyLeft;

        // Right Keys graphics
        const keyRight = new Mesh(keyGeo, keyRightMat);
        keyRight.name = 'Right Keys Mesh';
        keyRight.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 0.8);
        keyRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyRight);
        keyRight.visible = false;
        this._helpMeshes.keysRight = keyRight;

        // Lander Text graphics
        this._helpTexts.landerControlsTitle = new LeftTopTitleText(
            'Lander Controls',
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.landerControlsTitle.hide();
    }

    /**
     * Creates everything needed for the Landing & Leaving panel.
     * @param groundGeo the geometry used to make all the ground meshes in this panel
     * @param innerWaterGeo the geometry used to make all the inner water for ice meshes in this panel
     * @param commonRockMat the material used to make all the ground meshes in this panel
     * @param iceMat the material used to make all the ice meshes in this panel
     * @param waterMat the material used to make all the water meshes in this panel
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenLandingLeaving(
        groundGeo: PlaneGeometry,
        innerWaterGeo: PlaneGeometry,
        commonRockMat: MeshBasicMaterial,
        iceMat: MeshBasicMaterial,
        waterMat: MeshBasicMaterial,
        position: HTMLElementPosition): void {
        // 0: colStart
        // 1: colEnd
        // 2: rowStart
        // 3: rowEnd
        // 4: modifier
        const baseGroundBounds = [
            [ 10.75, 16.75, 3, 7, -0.75],
            [ 26, 32, 3, 7, 0],
            [ 41.25, 47.25, 3, 7, -0.25]
        ];
        baseGroundBounds.forEach(bounds => {
            for (let row = bounds[2]; row < bounds[3]; row++) {
                if (!this._helpTerrainMeshes.landingLeavingBasePart1[row]) {
                    this._helpTerrainMeshes.landingLeavingBasePart1[row] = [];
                    this._helpTerrainMeshes.landingLeavingBasePart2[row] = [];
                }
                for (let col = bounds[0]; col < bounds[1]; col++) {
                    let block = new Mesh( groundGeo, commonRockMat );
                    block.name = `Landing & Leaving - Ground - Base`;
                    block.position.set(-6 + (col/10), -7, 6 - row/10);
                    block.rotation.set(1.5708, 0, 0);
                    block.visible = false;
                    this._scene.add(block);
                    this._helpTerrainMeshes.landingLeavingBasePart1[row][col + bounds[4]] = block;
                    block = new Mesh( groundGeo, commonRockMat );
                    block.name = `Landing & Leaving - Ground - Base`;
                    block.position.set(-6 + (col/10), -7, 6 - row/10);
                    block.rotation.set(1.5708, 0, 0);
                    block.visible = false;
                    this._scene.add(block);
                    this._helpTerrainMeshes.landingLeavingBasePart2[row][col + bounds[4]] = block;
                }
            }
        });
        // 0: colStart
        // 1: modifier
        // 2, 3, 4, 5, 6, 7: place block
        const groundObstructionBounds = [
            [ 10.75, -0.75, true, false, false, false, false, true ],
            [ 26, 0, true, true, false, false, true, true ],
            [ 41.25, -0.25, true, false, true, true, true, true ]
        ];
        const obstructionRow = baseGroundBounds[0][3];
        this._helpTerrainMeshes.landingLeavingBasePart1[obstructionRow] = [];
        groundObstructionBounds.forEach(bounds => {
            for (let col = 0; col < 6; col++) {
                if (bounds[col + 2]) {
                    const block = new Mesh( groundGeo, commonRockMat );
                    block.name = `Landing & Leaving - Ground - Obstruction`;
                    block.position.set(-6 + ((Number(bounds[0]) + col)/10), -7, 6 - obstructionRow/10);
                    block.rotation.set(1.5708, 0, 0);
                    block.visible = false;
                    this._scene.add(block);
                    this._helpTerrainMeshes.landingLeavingBasePart1[obstructionRow][Number(bounds[0]) + col + Number(bounds[1])] = block;
                }
            }
        });

        const lifeMat = new MeshBasicMaterial({
            color: colorLuminance('008000', 3 / 10),
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });

        // 0: colStart
        // 1: modifier
        // 2, 3, 4, 5, 6, 7: place block
        // 8: material
        const otherObstructionBounds = [
            [ 10.75, -0.75, false, true, true, true, true, false, false, lifeMat ],
            [ 26, 0, false, true, true, true, true, false, false, waterMat ],
            [ 41.25, -0.25, false, true, true, true, true, false, true ]
        ];
        this._helpTerrainMeshes.landingLeavingBasePart2[obstructionRow] = [];
        otherObstructionBounds.forEach(bounds => {
            for (let col = 0; col < 6; col++) {
                if (!bounds[col + 2]) {
                    const block = new Mesh( groundGeo, commonRockMat );
                    block.name = `Landing & Leaving - Ground - Other`;
                    block.position.set(-6 + ((Number(bounds[0]) + col)/10), -7, 6 - obstructionRow/10);
                    block.rotation.set(1.5708, 0, 0);
                    block.visible = false;
                    this._scene.add(block);
                    this._helpTerrainMeshes.landingLeavingBasePart2[obstructionRow][Number(bounds[0]) + col + Number(bounds[1])] = block;
                } else if (!bounds[8]) {
                    const block = new Mesh( groundGeo, (bounds[9] as MeshBasicMaterial) );
                    block.name = `Landing & Leaving - Ground - Other`;
                    block.position.set(-6 + ((Number(bounds[0]) + col)/10), -7, 6 - obstructionRow/10);
                    block.rotation.set(1.5708, 0, 0);
                    block.visible = false;
                    this._scene.add(block);
                    this._helpTerrainMeshes.landingLeavingBasePart2[obstructionRow][Number(bounds[0]) + col + Number(bounds[1])] = block;
                } else {
                    const iceBlock = new Object3D();
                    // Ice border
                    let block = new Mesh( groundGeo, iceMat );
                    block.name = `Landing & Leaving - Ground - Other - ice exterior - `;
                    block.position.set(-6 + ((Number(bounds[0]) + col)/10), -6.5, 6 - obstructionRow/10);
                    block.rotation.set(1.5708, 0, 0);
                    iceBlock.add(block);
                    // Watery center
                    block = new Mesh( innerWaterGeo, waterMat );
                    block.name = `Landing & Leaving - Ground - Other - water interior - `;
                    block.position.set(-6 + ((Number(bounds[0]) + col)/10), -7, 6 - obstructionRow/10);
                    block.rotation.set(1.5708, 0, 0);
                    iceBlock.add(block);

                    // Place new ice block in mesh grid
                    this._scene.add(iceBlock);
                    iceBlock.visible = false;
                    this._helpTerrainMeshes.landingLeavingBasePart2[obstructionRow][Number(bounds[0]) + col + Number(bounds[1])] = iceBlock;
                }
            }
        });

        // Landing and Leaving Escape Line graphics
        const escapeLineMat = new MeshBasicMaterial({
            color: 0x008080,
            opacity: 0.5,
            transparent: true,
            side: DoubleSide
        });
        const escapeRow = 12;
        this._helpTerrainMeshes.landingLeavingBasePart3[escapeRow] = [];
        for (let col = 1.5; col < 56.5; col++) {
            const block = new Mesh( groundGeo, escapeLineMat );
                block.name = `Landing & Leaving - Escape - Base`;
                block.position.set(-6 + (col/10), -6.5, 6 - escapeRow/10);
                block.rotation.set(1.5708, 0, 0);
                block.visible = false;
                this._scene.add(block);
                this._helpTerrainMeshes.landingLeavingBasePart3[escapeRow][col - 0.5] = block;
        }

        // Landing & Leaving Sky graphics
        const skyMats: MeshBasicMaterial[] = [];
        for (let i = 0; i < 9; i++) {
            const skyMat = new MeshBasicMaterial({
                color: colorLuminance(SkyColors[this._planetSpecifications.skyBase], i / 10),
                opacity: 1,
                transparent: true,
                side: DoubleSide
            });
            skyMats.push(skyMat);
        }
        for (let row = 1; row < escapeRow; row++) {
            this._helpTerrainMeshes.landingLeavingBasePart3[row] = [];
            const skyMatToBeUsed = (row - 1) < 9 ? skyMats[row - 1] : skyMats[8];
            for (let col = 1.5; col < 56.5; col++) {
                const block = new Mesh( groundGeo, skyMatToBeUsed );
                    block.name = `Landing & Leaving - Sky - Base`;
                    block.position.set(-6 + (col/10), -6.5, 6 - row/10);
                    block.rotation.set(1.5708, 0, 0);
                    block.visible = false;
                    this._scene.add(block);
                    this._helpTerrainMeshes.landingLeavingBasePart3[row][col - 0.5] = block;
            }
        }

        // Landing & Leaving Lander graphics
        this._helpMeshes.lander3 = createLander(this._textures.ship).mesh;
        this._helpMeshes.lander3.position.set(HELP_LANDER_3_POSITION[0], HELP_LANDER_3_POSITION[1], HELP_LANDER_3_POSITION[2]);
        this._helpMeshes.lander3.visible = false;
        this._helpMeshes.lander3.scale.set(1, 1, 1);
        this._scene.add(this._helpMeshes.lander3);
        this._helpActors.mainThruster3 = new MainThruster(this._scene, HELP_MAIN_THRUSTER_3_POSITION, 1);

        this._helpMeshes.lander4 = createLander(this._textures.ship).mesh;
        this._helpMeshes.lander4.position.set(HELP_LANDER_4_POSITION[0], HELP_LANDER_4_POSITION[1], HELP_LANDER_4_POSITION[2]);
        this._helpMeshes.lander4.visible = false;
        this._helpMeshes.lander4.scale.set(1, 1, 1);
        this._scene.add(this._helpMeshes.lander4);
        this._helpActors.mainThruster4 = new MainThruster(this._scene, HELP_MAIN_THRUSTER_4_POSITION, 1);

        this._helpMeshes.lander5 = createLander(this._textures.ship).mesh;
        this._helpMeshes.lander5.position.set(HELP_LANDER_5_POSITION[0], HELP_LANDER_5_POSITION[1], HELP_LANDER_5_POSITION[2]);
        this._helpMeshes.lander5.visible = false;
        this._helpMeshes.lander5.scale.set(1, 1, 1);
        this._scene.add(this._helpMeshes.lander5);
        this._helpActors.mainThruster5 = new MainThruster(this._scene, HELP_MAIN_THRUSTER_5_POSITION, 1);

        // Landing & Leaving 4+ Flat Blocks Text graphics
        this._helpTexts.landingLeaving4FlatBlocks = new FreestyleText(
            '4+ flat blocks',
            {
                height: position.height,
                left: (position.left + (0.059 * position.width)),
                top: (0.9745 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.015,
            0);
        this._helpTexts.landingLeaving4FlatBlocks.hide();

        // Landing & Leaving Plant Blocks Text graphics
        this._helpTexts.landingLeavingPlantBlocks = new FreestyleText(
            'Plant blocks',
            {
                height: position.height,
                left: (position.left + (0.062 * position.width)),
                top: (0.9745 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.015,
            0);
        this._helpTexts.landingLeavingPlantBlocks.hide();

        // Landing & Leaving Left Safe Text graphics
        this._helpTexts.landingLeavingLeftSafe = new FreestyleText(
            'Safe to Land',
            {
                height: position.height,
                left: (position.left + (0.062 * position.width)),
                top: (0.78 * position.height),
                width: position.width
            },
            COLORS.highlighted,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.landingLeavingLeftSafe.hide();

        // Landing & Leaving No Gaps Text graphics
        this._helpTexts.landingLeavingNoGaps = new FreestyleText(
            'No gaps',
            {
                height: position.height,
                left: (position.left + (0.21 * position.width)),
                top: (0.9745 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.015,
            0);
        this._helpTexts.landingLeavingNoGaps.hide();

        // Landing & Leaving Water Blocks Text graphics
        this._helpTexts.landingLeavingWaterBlocks = new FreestyleText(
            'Water blocks',
            {
                height: position.height,
                left: (position.left + (0.19 * position.width)),
                top: (0.9745 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.015,
            0);
        this._helpTexts.landingLeavingWaterBlocks.hide();

        // Landing & Leaving Middle Danger Text graphics
        this._helpTexts.landingLeavingMiddleDanger = new FreestyleText(
            'Crash Risk!',
            {
                height: position.height,
                left: (position.left + (0.195 * position.width)),
                top: (0.78 * position.height),
                width: position.width
            },
            COLORS.selected,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.landingLeavingMiddleDanger.hide();

        // Landing & Leaving No Ledges Text graphics
        this._helpTexts.landingLeavingNoLedges = new FreestyleText(
            'No ledges',
            {
                height: position.height,
                left: (position.left + (0.33 * position.width)),
                top: (0.9745 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.015,
            0);
        this._helpTexts.landingLeavingNoLedges.hide();

        // Landing & Leaving Ice Blocks Text graphics
        this._helpTexts.landingLeavingIceBlocks = new FreestyleText(
            'Ice blocks',
            {
                height: position.height,
                left: (position.left + (0.33 * position.width)),
                top: (0.9745 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.015,
            0);
        this._helpTexts.landingLeavingIceBlocks.hide();

        // Landing & Leaving Right Danger Text graphics
        this._helpTexts.landingLeavingRightDanger = new FreestyleText(
            'Crash Risk!',
            {
                height: position.height,
                left: (position.left + (0.3225 * position.width)),
                top: (0.78 * position.height),
                width: position.width
            },
            COLORS.selected,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.landingLeavingRightDanger.hide();

        // Landing & Leaving Still In Game Text graphics
        this._helpTexts.landingLeavingStillInGame = new FreestyleText(
            'Still in game area',
            {
                height: position.height,
                left: (position.left + (0.020 * position.width)),
                top: (0.78 * position.height),
                width: position.width
            },
            COLORS.highlighted,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.landingLeavingStillInGame.hide();

        // Landing & Leaving Still In Game Text graphics
        this._helpTexts.landingLeavingEscapeLine = new FreestyleText(
            'Escape Line',
            {
                height: position.height,
                left: (position.left + (0.020 * position.width)),
                top: (0.87 * position.height),
                width: position.width
            },
            `#${escapeLineMat.color.getHexString()}`,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.landingLeavingEscapeLine.hide();

        // Landing & Leaving Escaped Text graphics
        this._helpTexts.landingLeavingEscaped = new FreestyleText(
            'Successful Escape!',
            {
                height: position.height,
                left: (position.left + (0.30 * position.width)),
                top: (0.78 * position.height),
                width: position.width
            },
            COLORS.highlighted,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.landingLeavingEscaped.hide();

        // Lander Text graphics
        this._helpTexts.landingLeavingTitle = new LeftBottomTitleText(
            'Landing & Leaving',
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.landingLeavingTitle.hide();
    }

    /**
     * Creates everything needed for the Load & Unload panel.
     * @param arrowGeo the geometry used to make all the arrow meshes in this panel
     * @param groundGeo the geometry used to make all the ground meshes in this panel
     * @param mouseGeo the geometry used to make all the mouse meshes in this panel
     * @param arrowMat the material used to make all the arrow meshes in this panel
     * @param commonRockMat the material used to make all the ground meshes in this panel
     * @param mouseMat the material used to make the unpressed mouse mesh in this panel
     * @param mouseLeftMat the material used to make the left mouse mesh in this panel
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenLoadUnload(
        arrowGeo: PlaneGeometry,
        groundGeo: PlaneGeometry,
        mouseGeo: PlaneGeometry,
        arrowMat: MeshBasicMaterial,
        commonRockMat: MeshBasicMaterial,
        mouseMat: MeshBasicMaterial,
        mouseLeftMat: MeshBasicMaterial,
        position: HTMLElementPosition): void {
        // Ground Meshes
        for (let row = 34; row < 38; row++) {
            this._helpTerrainMeshes.loadUnload[row] = [];
            for (let col = 1.5; col < 56.5; col++) {
                const block = new Mesh( groundGeo, commonRockMat );
                    block.name = `Landing & Leaving - Ground - Base`;
                    block.position.set(-6 + (col/10), -7, 6 - row/10);
                    block.rotation.set(1.5708, 0, 0);
                    block.visible = false;
                    this._scene.add(block);
                    this._helpTerrainMeshes.loadUnload[row][col - 0.5] = block;
            }
        }

        // Load & Unload Lander graphics
        this._helpMeshes.lander6 = createLander(this._textures.ship).mesh;
        this._helpMeshes.lander6.position.set(HELP_LANDER_6_POSITION[0], HELP_LANDER_6_POSITION[1], HELP_LANDER_6_POSITION[2]);
        this._helpMeshes.lander6.visible = false;
        this._helpMeshes.lander6.scale.set(2, 2, 2);
        this._scene.add(this._helpMeshes.lander6);

        // Create astronaut mining team for astronaut controls
        this._helpActors.astronautsLoadUnload = createMiningTeam(
            {
                astronaut1: this._textures.astronaut1,
                astronaut2: this._textures.astronaut2,
                astronaut3: this._textures.astronaut3,
                astronautSuffocation1: this._textures.astronautSuffocation1,
                astronautSuffocation2: this._textures.astronautSuffocation2,
                astronautSuffocation3: this._textures.astronautSuffocation3,
                astronautSuffocation4: this._textures.astronautSuffocation4,
                astronautSuffocation5: this._textures.astronautSuffocation5
            },
            {
                miningEquipment1: this._textures.miningEquipment1,
                miningEquipment2: this._textures.miningEquipment2
            }).slice(0, 9);

        // Position the miners on the screen, make them larger, and hide them.
        this._helpActors.astronautsLoadUnload.filter((astro: Actor) => !!astro).forEach((astro: Actor, index: number) => {
            this._scene.add(astro.mesh);
            astro.mesh.scale.set(2.5, 2.5, 2.5);
            astro.mesh.visible = false;
            if (index === 1) {
                astro.mesh.position.set(HELP_LANDER_6_POSITION[0], HELP_LANDER_6_POSITION[1] - 3, HELP_LANDER_6_POSITION[2] + 0.3);
            } else if (index % 3 === 0) {
                astro.mesh.position.set(HELP_LANDER_6_POSITION[0] - 0.3, HELP_LANDER_6_POSITION[1] - 3, HELP_LANDER_6_POSITION[2] + 0.3);
            } else {
                astro.mesh.position.set(HELP_LANDER_6_POSITION[0] + 0.3, HELP_LANDER_6_POSITION[1] - 3, HELP_LANDER_6_POSITION[2] + 0.3);
            }
        });

        // Mouse Left Button graphics
        const mouseLeft = new Mesh(mouseGeo, mouseLeftMat);
        mouseLeft.name = 'Mouse Left Mesh LoadUnload';
        mouseLeft.position.set(HELP_LANDER_6_POSITION[0] - 1.2, HELP_LANDER_6_POSITION[1] - 1, HELP_LANDER_6_POSITION[2] - 0.9);
        mouseLeft.rotation.set(-1.5708, 0, 0);
        this._scene.add(mouseLeft);
        mouseLeft.visible = false;
        this._helpMeshes.mouseLeftLoadUnload = mouseLeft;

        // Mouse Unpressed graphics
        const mouse = new Mesh(mouseGeo, mouseMat);
        mouse.name = 'Mouse Mesh LoadUnload';
        mouse.position.set(HELP_LANDER_6_POSITION[0] - 1.2, HELP_LANDER_6_POSITION[1] - 1, HELP_LANDER_6_POSITION[2] - 0.9);
        mouse.rotation.set(-1.5708, 0, 0);
        this._scene.add(mouse);
        mouse.visible = false;
        this._helpMeshes.mouseLoadUnload = mouse;

        // Left Arrow graphics
        const arrowLeft = new Mesh(arrowGeo, arrowMat);
        arrowLeft.name = 'Left Arrow Load & Unload Mesh';
        arrowLeft.position.set(HELP_LANDER_6_POSITION[0] + 1, HELP_LANDER_6_POSITION[1] - 1, HELP_LANDER_6_POSITION[2] - 1.05);
        arrowLeft.rotation.set(-1.5708, 0, 3.1416);
        this._scene.add(arrowLeft);
        arrowLeft.visible = false;
        this._helpMeshes.arrowLeftLoadUnload = arrowLeft;

        // Right Arrow graphics
        const arrowRight = new Mesh(arrowGeo, arrowMat);
        arrowRight.name = 'Right Arrow Load & Unload Mesh';
        arrowRight.position.set(HELP_LANDER_6_POSITION[0] - 1, HELP_LANDER_6_POSITION[1] - 1, HELP_LANDER_6_POSITION[2] - 1.05);
        arrowRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(arrowRight);
        arrowRight.visible = false;
        this._helpMeshes.arrowRightLoadUnload = arrowRight;

        // Unload Button graphic
        this._helpButtons.unloadButton = new UnloadButton(
            {
                height: position.height,
                left: (position.left + (0.17 * position.width)),
                top: (0.56 * position.height),
                width: position.width
            },
            BUTTON_COLORS,
            noOp,
            true,
            0.75);
        this._helpButtons.unloadButton.hide();

        // Unload Button Pressed graphic
        this._helpButtons.unloadPressedButton = new UnloadButton(
            {
                height: position.height,
                left: (position.left + (0.17 * position.width)),
                top: (0.56 * position.height),
                width: position.width
            },
            BUTTON_COLORS_INVERSE,
            noOp,
            true,
            0.75);
        this._helpButtons.unloadPressedButton.hide();

        // Load Button graphic
        this._helpButtons.loadButton = new LoadButton(
            {
                height: position.height,
                left: (position.left + (0.19 * position.width)),
                top: (0.56 * position.height),
                width: position.width
            },
            BUTTON_COLORS,
            noOp,
            true,
            0.75);
        this._helpButtons.loadButton.hide();

        // Load Button Pressed graphic
        this._helpButtons.loadPressedButton = new LoadButton(
            {
                height: position.height,
                left: (position.left + (0.19 * position.width)),
                top: (0.56 * position.height),
                width: position.width
            },
            BUTTON_COLORS_INVERSE,
            noOp,
            true,
            0.75);
        this._helpButtons.loadPressedButton.hide();

        // Mine Button graphic
        this._helpButtons.mineLoadUnloadButton = new MineButton(
            {
                height: position.height,
                left: (position.left + (0.19 * position.width)),
                top: (0.56 * position.height),
                width: position.width
            },
            BUTTON_COLORS,
            noOp,
            true,
            0.75);
        this._helpButtons.mineLoadUnloadButton.hide();

        // Load & Unload Text graphics
        this._helpTexts.loadUnloadTitle = new LeftBottomMiddleTitleText(
            'Load & Unload',
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.loadUnloadTitle.hide();
    }

    /**
     * Creates everything needed for the Mining Controls panel.
     * @param arrowGeo the geometry used to make all the arrow meshes in this panel
     * @param arrowMat the material used to make all the arrow meshes in this panel
     * @param keyGeo the geometry used to make all the key meshes in this panel
     * @param mouseGeo the geometry used to make all the mouse meshes in this panel
     * @param keyDownMat the material used to make the down keys mesh in this panel
     * @param keyUpMat the material used to make the up keys mesh in this panel
     * @param mouseMat the material used to make the unpressed mouse mesh in this panel
     * @param mouseLeftMat the material used to make the left mouse mesh in this panel
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenMiningControls(
        arrowGeo: PlaneGeometry,
        arrowMat: MeshBasicMaterial,
        keyGeo: PlaneGeometry,
        mouseGeo: PlaneGeometry,
        keyDownMat: MeshBasicMaterial,
        keyUpMat: MeshBasicMaterial,
        mouseMat: MeshBasicMaterial,
        mouseLeftMat: MeshBasicMaterial,
        position: HTMLElementPosition): void {
        // Create astronaut mining team for mining controls.
        this._helpActors.miners = createMiningTeam(
            {
                astronaut1: this._textures.astronaut1,
                astronaut2: this._textures.astronaut2,
                astronaut3: this._textures.astronaut3,
                astronautSuffocation1: this._textures.astronautSuffocation1,
                astronautSuffocation2: this._textures.astronautSuffocation2,
                astronautSuffocation3: this._textures.astronautSuffocation3,
                astronautSuffocation4: this._textures.astronautSuffocation4,
                astronautSuffocation5: this._textures.astronautSuffocation5
            },
            {
                miningEquipment1: this._textures.miningEquipment1,
                miningEquipment2: this._textures.miningEquipment2
            }).slice(0, 9);

        // Position the miners on the screen, make them larger, and hide them.
        this._helpActors.miners.filter((astro: Actor) => !!astro).forEach((astro: Actor, index: number) => {
            this._scene.add(astro.mesh);
            astro.mesh.visible = false;
            astro.mesh.scale.set(3, 3, 3);
            if (index === 1) {
                astro.mesh.position.set(HELP_LANDER_1_POSITION[0] + 5, HELP_LANDER_1_POSITION[1] - 2, HELP_LANDER_1_POSITION[2] + 3);
            } else if (index % 3 === 0) {
                astro.mesh.position.set(HELP_LANDER_1_POSITION[0] + 4.7, HELP_LANDER_1_POSITION[1] - 2, HELP_LANDER_1_POSITION[2] + 3);
            } else {
                astro.mesh.position.set(HELP_LANDER_1_POSITION[0] + 5.3, HELP_LANDER_1_POSITION[1] - 2, HELP_LANDER_1_POSITION[2] + 3);
            }
        });

        // Up Arrow graphics
        const arrowUp = new Mesh(arrowGeo, arrowMat);
        arrowUp.name = 'Up Arrow Mesh';
        arrowUp.position.set(HELP_LANDER_1_POSITION[0] + 6, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 2.75);
        arrowUp.rotation.set(-1.5708, 0, 1.5708);
        this._scene.add(arrowUp);
        arrowUp.visible = false;
        this._helpMeshes.arrowUpMining = arrowUp;

        // Down Arrow graphics
        const arrowDown = new Mesh(arrowGeo, arrowMat);
        arrowDown.name = 'Down Arrow Mesh';
        arrowDown.position.set(HELP_LANDER_1_POSITION[0] + 6, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 2.75);
        arrowDown.rotation.set(-1.5708, 0, -1.5708);
        this._scene.add(arrowDown);
        arrowDown.visible = false;
        this._helpMeshes.arrowDownMining = arrowDown;

        // Up Keys graphics
        const keyUp = new Mesh(keyGeo, keyUpMat);
        keyUp.name = 'Up Keys Mesh Mining';
        keyUp.position.set(HELP_LANDER_1_POSITION[0] + 3.35, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3.6);
        keyUp.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyUp);
        keyUp.visible = false;
        this._helpMeshes.keysUpMining = keyUp;

        // Down Keys graphics
        const keyDown = new Mesh(keyGeo, keyDownMat);
        keyDown.name = 'Down Keys Mesh Mining';
        keyDown.position.set(HELP_LANDER_1_POSITION[0] + 3.35, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3.6);
        keyDown.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyDown);
        keyDown.visible = false;
        this._helpMeshes.keysDownMining = keyDown;

        // Mouse Left Button graphics
        const mouseLeft = new Mesh(mouseGeo, mouseLeftMat);
        mouseLeft.name = 'Mouse Left Mesh Mining';
        mouseLeft.position.set(HELP_LANDER_1_POSITION[0] + 3.73, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 2.25);
        mouseLeft.rotation.set(-1.5708, 0, 0);
        this._scene.add(mouseLeft);
        mouseLeft.visible = false;
        this._helpMeshes.mouseLeftMining = mouseLeft;

        // Mouse Unpressed graphics
        const mouse = new Mesh(mouseGeo, mouseMat);
        mouse.name = 'Mouse Mesh Mining';
        mouse.position.set(HELP_LANDER_1_POSITION[0] + 3.73, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 2.25);
        mouse.rotation.set(-1.5708, 0, 0);
        this._scene.add(mouse);
        mouse.visible = false;
        this._helpMeshes.mouseMining = mouse;

        // Mining Button graphic
        this._helpButtons.mineButton = new MineButton(
            {
                height: position.height,
                left: position.left + (0.685 * position.width),
                top: position.height - (0.67 * position.height),
                width: position.width
            },
            BUTTON_COLORS,
            noOp,
            true,
            0.75);
        this._helpButtons.mineButton.hide();

        // Mining Button Pressed graphic
        this._helpButtons.minePressedButton = new MineButton(
            {
                height: position.height,
                left: position.left + (0.685 * position.width),
                top: position.height - (0.67 * position.height),
                width: position.width
            },
            BUTTON_COLORS_INVERSE,
            noOp,
            true,
            0.75);
        this._helpButtons.minePressedButton.hide();

        // PackItUp Button graphic
        this._helpButtons.packUpButton = new PackItUpButton(
            {
                height: position.height,
                left: position.left + (0.663 * position.width),
                top: position.height - (0.67 * position.height),
                width: position.width
            },
            BUTTON_COLORS,
            noOp,
            true,
            0.75);
        this._helpButtons.packUpButton.hide();

        // PackItUp Button Pressed graphic
        this._helpButtons.packUpPressedButton = new PackItUpButton(
            {
                height: position.height,
                left: position.left + (0.663 * position.width),
                top: position.height - (0.67 * position.height),
                width: position.width
            },
            BUTTON_COLORS_INVERSE,
            noOp,
            true,
            0.75);
        this._helpButtons.packUpPressedButton.hide();

        // Make drill bit
        this._makeDrillBit(DRILL_BIT_START_POSITION[0], DRILL_BIT_START_POSITION[1], DRILL_BIT_START_POSITION[2]);
        this._drillBits[0].visible = false;

        // Mining Text graphics
        this._helpTexts.miningControlsTitle = new RightTopMiddleTitleText(
            'Mining Controls',
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.miningControlsTitle.hide();
    }

    /**
     * Creates everything needed for the Landing Thresholds panel.
     * @param groundGeo the geometry used to make all the ground meshes in this panel
     * @param commonRockMat the material used to make all the ground meshes in this panel
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenThresholds(
        groundGeo: PlaneGeometry,
        commonRockMat: MeshBasicMaterial,
        position: HTMLElementPosition): void {
        // The ground for landing
        for (let row = 27; row < 31; row++) {
            this._helpTerrainMeshes.landingThresholdsGroundSpeed[row] = [];
            for (let col = -0.5; col < 59; col++) {
                const block = new Mesh( groundGeo, commonRockMat );
                block.name = `Landing Thresholds - Ground - Speed`;
                block.position.set((col/10), -7, -6 + row/10);
                block.rotation.set(1.5708, 0, 0);
                block.visible = false;
                this._scene.add(block);
                this._helpTerrainMeshes.landingThresholdsGroundSpeed[row][col + 0.5] = block;
            }
        }

        // Landing Thresholds Lander graphics
        this._helpMeshes.lander2 = createLander(this._textures.ship).mesh;
        this._helpMeshes.lander2.position.set(HELP_LANDER_2_POSITION[0], HELP_LANDER_2_POSITION[1], HELP_LANDER_2_POSITION[2]);
        this._helpMeshes.lander2.visible = false;
        this._helpMeshes.lander2.scale.set(2, 2, 2);
        this._scene.add(this._helpMeshes.lander2);
        this._helpActors.sideThruster2Left = new SideThruster(this._scene, HELP_SIDE_THRUSTER_2_POSITION, -1, 1.5);
        this._helpActors.sideThruster2Right = new SideThruster(this._scene, HELP_SIDE_THRUSTER_2_POSITION, 1, 1.5);
        this._helpActors.mainThruster2 = new MainThruster(this._scene, HELP_MAIN_THRUSTER_2_POSITION, 2);

        // Landing Thresholds Danger Text graphics
        this._helpTexts.landingThresholdDanger = new FreestyleText(
            'Crash Risk!',
            {
                height: position.height,
                left: (position.left + position.width - (0.49 * position.width)),
                top: (0.08 * position.height),
                width: position.width
            },
            COLORS.selected,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.landingThresholdDanger.hide();

        // Landing Thresholds Safe Text graphics
        this._helpTexts.landingThresholdSafe = new FreestyleText(
            'Safe to Land',
            {
                height: position.height,
                left: (position.left + position.width - (0.49 * position.width)),
                top: (0.08 * position.height),
                width: position.width
            },
            COLORS.highlighted,
            border,
            TextType.STATIC,
            0.017,
            0);
        this._helpTexts.landingThresholdSafe.hide();

        // Landing Thresholds Vertical Speed Text graphics
        this._helpTexts.landingThresholdVerticalSpeed = new FreestyleText(
            'Descent Speed: 0.000',
            {
                height: position.height,
                left: (position.left + position.width - (0.49 * position.width)),
                top: (0.06 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.015,
            0);
        this._helpTexts.landingThresholdVerticalSpeed.hide();

        // Landing Thresholds Vertical Threshold Text graphics
        this._helpTexts.landingThresholdVerticalThreshold = new RightTopStatsText4(
            `Vertical Threshold: ${this._landerSpecifications.verticalCrashMargin}&nbsp;&nbsp;&nbsp;&nbsp;`,
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.landingThresholdVerticalThreshold.hide();

        // Landing Thresholds Horizontal Speed Text graphics
        this._helpTexts.landingThresholdHorizontalSpeed = new FreestyleText(
            'Horizontal Speed: 0.0000',
            {
                height: position.height,
                left: (position.left + position.width - (0.49 * position.width)),
                top: (0.06 * position.height),
                width: position.width
            },
            COLORS.neutral,
            border,
            TextType.STATIC,
            0.015,
            0);
        this._helpTexts.landingThresholdHorizontalSpeed.hide();

        // Landing Thresholds Horizontal Threshold Text graphics
        this._helpTexts.landingThresholdHorizontalThreshold = new RightTopStatsText4(
            `Horizontal Threshold: ${this._landerSpecifications.horizontalCrashMargin}&nbsp;&nbsp;&nbsp;&nbsp;`,
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.landingThresholdHorizontalThreshold.hide();

        // Landing Thresholds Text graphics
        this._helpTexts.landingThresholdsTitle = new RightTopTitleText(
            'Landing Thresholds',
            position,
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.landingThresholdsTitle.hide();
    }

    /**
     * Calls the next frame in the animation cycle specific to upper-middle-left panel - Astronaut Controls.
     */
    private _endCycleAstronautControls(): void {
        // Astronaut walking section
        if (this._helpCounters.astroWalk > this._helpCounters.astroWalkClear) {
            this._helpCounters.astroWalk = 0;
        }

        const val = this._helpCounters.astroWalkClear / 3;
        if (this._helpCounters.astroWalk < val) {
            this._helpActors.astronauts[3].mesh.visible = false;
            this._helpActors.astronauts[5].mesh.visible = false;
            this._helpActors.astronauts[6].mesh.visible = false;
            this._helpActors.astronauts[8].mesh.visible = false;
            this._helpActors.astronauts[0].mesh.visible = true;
            this._helpActors.astronauts[2].mesh.visible = true;
        } else if (this._helpCounters.astroWalk % 10 < 5) {
            this._helpActors.astronauts[0].mesh.visible = false;
            this._helpActors.astronauts[2].mesh.visible = false;
            this._helpActors.astronauts[3].mesh.visible = false;
            this._helpActors.astronauts[5].mesh.visible = false;
            this._helpActors.astronauts[6].mesh.visible = true;
            this._helpActors.astronauts[8].mesh.visible = true;
        } else {
            this._helpActors.astronauts[0].mesh.visible = false;
            this._helpActors.astronauts[2].mesh.visible = false;
            this._helpActors.astronauts[6].mesh.visible = false;
            this._helpActors.astronauts[8].mesh.visible = false;
            this._helpActors.astronauts[3].mesh.visible = true;
            this._helpActors.astronauts[5].mesh.visible = true;
        }

        this._helpMeshes.arrowLeftAstroWalk.visible = false;
        this._helpMeshes.arrowRightAstroWalk.visible = false;
        this._helpMeshes.keysLeftAstroWalk.visible = false;
        this._helpMeshes.keysRightAstroWalk.visible = false;
        // Keep in time with lander controls
        if (this._helpCounters.astroWalk < val) {
            // No arrows, or keys to show.
        } else if (this._helpCounters.astroWalk < (val * 2)) {
            this._helpMeshes.arrowRightAstroWalk.visible = true;
            this._helpMeshes.keysRightAstroWalk.visible = true;
        } else {
            this._helpMeshes.arrowLeftAstroWalk.visible = true;
            this._helpMeshes.keysLeftAstroWalk.visible = true;
        }

        this._helpCounters.astroWalk++;
    }

    /**
     * Calls the next frame in the animation cycle specific to lower-middle-right panel - Blocks, Fuel, & Oxygen.
     */
    private _endCycleBlockTypes(): void {
        if (this._helpCounters.blockTypes > this._helpCounters.blockTypesClear) {
            this._helpCounters.blockTypes = 0;
            this._helpTexts.blockTypesDialogue.update(dialogues['Fuel'], true);
            this._helpTexts.blockTypesExample.hide();
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.000');
            this._helpTexts.blockTypesWindSpeed.hide();
            this._helpTerrainMeshes.blockTypes[0][0].visible = false;
            this._helpTerrainMeshes.blockTypes[1].forEach(block => {
                block.visible = false;
            });
            this._helpTerrainMeshes.blockTypes[2].forEach(block => {
                block.visible = false;
            });
            this._helpTerrainMeshes.blockTypes[3].forEach(block => {
                block.visible = false;
            });
            this._helpTerrainMeshes.blockTypes[4][0].visible = false;
        }

        this._helpTexts.blockTypesFuelFull.hide();
        this._helpTexts.blockTypesFuelDanger.hide();
        this._helpTexts.blockTypesFuelEmpty.hide();
        this._helpTexts.blockTypesOxygenFull.hide();
        this._helpTexts.blockTypesOxygenDanger.hide();
        this._helpTexts.blockTypesOxygenEmpty.hide();
        this._helpTexts.blockTypesExample.hide();
        this._helpTexts.blockTypesWindSpeed.hide();
        this._helpTerrainMeshes.blockTypes[0][0].visible = false;
        this._helpTerrainMeshes.blockTypes[1].forEach(block => {
            block.visible = false;
        });
        this._helpTerrainMeshes.blockTypes[2].forEach(block => {
            block.visible = false;
        });
        this._helpTerrainMeshes.blockTypes[3].forEach(block => {
            block.visible = false;
        });
        this._helpTerrainMeshes.blockTypes[4].forEach(block => {
            block.visible = false;
        });


        if (this._helpCounters.blockTypes < 420) {
            this._helpTexts.blockTypesFuelFull.show();
        } else if (this._helpCounters.blockTypes === 420) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Fuel2'], true);
        } else if (this._helpCounters.blockTypes < 750) {
            this._helpTexts.blockTypesFuelDanger.show();
        } else if (this._helpCounters.blockTypes === 750) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Fuel3'], true);
        } else if (this._helpCounters.blockTypes < 1290) {
            this._helpTexts.blockTypesFuelEmpty.show();
        } else if (this._helpCounters.blockTypes === 1290) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Oxygen'], true);
        } else if (this._helpCounters.blockTypes < 1890) {
            this._helpTexts.blockTypesOxygenFull.show();
        } else if (this._helpCounters.blockTypes === 1890) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Oxygen2'], true);
        } else if (this._helpCounters.blockTypes < 2230) {
            this._helpTexts.blockTypesOxygenDanger.show();
        } else if (this._helpCounters.blockTypes === 2230) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Oxygen3'], true);
        } else if (this._helpCounters.blockTypes < 2960) {
            this._helpTexts.blockTypesOxygenEmpty.show();
        } else if (this._helpCounters.blockTypes === 2960) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Ore'], true);
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[0][0].visible = true;
        } else if (this._helpCounters.blockTypes < 3440) {
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[0][0].visible = true;
        } else if (this._helpCounters.blockTypes === 3440) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Common'], true);
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[1].forEach(block => {
                block.visible = true;
            });
        } else if (this._helpCounters.blockTypes < 3960) {
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[1].forEach(block => {
                block.visible = true;
            });
        } else if (this._helpCounters.blockTypes === 3960) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Water'], true);
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[2].forEach(block => {
                block.visible = true;
            });
        } else if (this._helpCounters.blockTypes < 4580) {
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[2].forEach(block => {
                block.visible = true;
            });
        } else if (this._helpCounters.blockTypes === 4580) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Plant'], true);
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[3].forEach(block => {
                block.visible = true;
            });
        } else if (this._helpCounters.blockTypes < 5150) {
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[3].forEach(block => {
                block.visible = true;
            });
        } else if (this._helpCounters.blockTypes === 5150) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Danger'], true);
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[4][0].visible = true;
        } else if (this._helpCounters.blockTypes < 5570) {
            this._helpTexts.blockTypesExample.show();
            this._helpTerrainMeshes.blockTypes[4][0].visible = true;
        } else if (this._helpCounters.blockTypes === 5570) {
            this._helpTexts.blockTypesDialogue.update(dialogues['Wind'], true);
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6080) {
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes === 6080) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: <span class="fa fa-long-arrow-left"></span> 0.0002');
            this._helpTexts.blockTypesWindSpeed.show();
            this._helpTexts.blockTypesDialogue.update(dialogues['Wind2'], true);
        } else if (this._helpCounters.blockTypes < 6140) {
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6200) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.0002 <span class="fa fa-long-arrow-right"></span>');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6260) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: <span class="fa fa-long-arrow-left"></span> 0.0002');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6320) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.0002 <span class="fa fa-long-arrow-right"></span>');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6380) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: <span class="fa fa-long-arrow-left"></span> 0.0002');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6440) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.0002 <span class="fa fa-long-arrow-right"></span>');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6500) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: <span class="fa fa-long-arrow-left"></span> 0.0002');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6560) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.0002 <span class="fa fa-long-arrow-right"></span>');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6620) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: <span class="fa fa-long-arrow-left"></span> 0.0002');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes < 6680) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.0002 <span class="fa fa-long-arrow-right"></span>');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes === 6680) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.000');
            this._helpTexts.blockTypesWindSpeed.show();
            this._helpTexts.blockTypesDialogue.update(dialogues['Wind3'], true);
        } else if (this._helpCounters.blockTypes < 6680) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.0005 <span class="fa fa-long-arrow-right"></span>');
            this._helpTexts.blockTypesWindSpeed.show();
        } else if (this._helpCounters.blockTypes === 6680) {
            this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.000');
            this._helpTexts.blockTypesWindSpeed.show();
        } else {
            this._helpTexts.blockTypesWindSpeed.show();
        }

        this._helpTexts.blockTypesDialogue.cycle();

        this._helpCounters.blockTypes++;
    }

    /**
     * Calls the next frame in the animation cycle specific to upper-left panel - Lander Controls.
     */
    private _endCycleLanderControls(): void {
        if (this._helpCounters.thrust > this._helpCounters.thrustClear) {
            this._helpCounters.thrust = 0;
        }

        this._helpActors.mainThruster.endCycle(HELP_MAIN_THRUSTER_1_POSITION, false);
        this._helpActors.sideThrusterLeft.endCycle(HELP_SIDE_THRUSTER_1_POSITION, false);
        this._helpActors.sideThrusterRight.endCycle(HELP_SIDE_THRUSTER_1_POSITION, false);
        this._helpMeshes.arrowLeft.visible = false;
        this._helpMeshes.arrowRight.visible = false;
        this._helpMeshes.arrowUp.visible = false;
        this._helpMeshes.keysUp.visible = false;
        this._helpMeshes.keysLeft.visible = false;
        this._helpMeshes.keysRight.visible = false;

        const val = this._helpCounters.thrustClear / 3;
        if (this._helpCounters.thrust < val) {
            this._helpActors.mainThruster.endCycle(HELP_MAIN_THRUSTER_1_POSITION, true);
            this._helpMeshes.arrowUp.visible = true;
            this._helpMeshes.keysUp.visible = true;
        } else if (this._helpCounters.thrust < (val * 2)) {
            this._helpActors.sideThrusterLeft.endCycle(HELP_SIDE_THRUSTER_1_POSITION, true);
            this._helpMeshes.arrowRight.visible = true;
            this._helpMeshes.keysRight.visible = true;
        } else {
            this._helpActors.sideThrusterRight.endCycle(HELP_SIDE_THRUSTER_1_POSITION, true);
            this._helpMeshes.arrowLeft.visible = true;
            this._helpMeshes.keysLeft.visible = true;
        }

        this._helpCounters.thrust++;
    }

    /**
     * Calls the next frame in the animation cycle specific to bottom-left panel - Landing & Leaving.
     */
    private _endCycleLandingLeaving(): void {
        if (this._helpCounters.landingLeaving > this._helpCounters.landingLeavingClear) {
            this._helpCounters.landingLeaving = 0;
            this._helpCounters.landingLeavingVerticalSpeed = 0;

            for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart1.length; row++) {
                if (this._helpTerrainMeshes.landingLeavingBasePart1[row]) {
                    for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart1[row].length; col++) {
                        if (this._helpTerrainMeshes.landingLeavingBasePart1[row][col]) {
                            this._helpTerrainMeshes.landingLeavingBasePart1[row][col].visible = true;
                        }
                    }
                }
            }
            for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart2.length; row++) {
                if (this._helpTerrainMeshes.landingLeavingBasePart2[row]) {
                    for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart2[row].length; col++) {
                        if (this._helpTerrainMeshes.landingLeavingBasePart2[row][col]) {
                            this._helpTerrainMeshes.landingLeavingBasePart2[row][col].visible = false;
                        }
                    }
                }
            }
            for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart3.length; row++) {
                if (this._helpTerrainMeshes.landingLeavingBasePart3[row]) {
                    for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart3[row].length; col++) {
                        if (this._helpTerrainMeshes.landingLeavingBasePart3[row][col]) {
                            this._helpTerrainMeshes.landingLeavingBasePart3[row][col].visible = false;
                        }
                    }
                }
            }
            this._helpMeshes.lander3.position.set(HELP_LANDER_3_POSITION[0], HELP_LANDER_3_POSITION[1], HELP_LANDER_3_POSITION[2]);
            this._helpMeshes.lander4.position.set(HELP_LANDER_4_POSITION[0], HELP_LANDER_4_POSITION[1], HELP_LANDER_4_POSITION[2]);
            this._helpMeshes.lander5.position.set(HELP_LANDER_5_POSITION[0], HELP_LANDER_5_POSITION[1], HELP_LANDER_5_POSITION[2]);

            this._helpActors.mainThruster3.endCycle(HELP_MAIN_THRUSTER_3_POSITION, false);
            this._helpActors.mainThruster4.endCycle(HELP_MAIN_THRUSTER_4_POSITION, false);
            this._helpActors.mainThruster5.endCycle(HELP_MAIN_THRUSTER_5_POSITION, false);
        }

        this._helpTexts.landingLeaving4FlatBlocks.hide();
        this._helpTexts.landingLeavingNoGaps.hide();
        this._helpTexts.landingLeavingNoLedges.hide();
        this._helpTexts.landingLeavingPlantBlocks.hide();
        this._helpTexts.landingLeavingWaterBlocks.hide();
        this._helpTexts.landingLeavingIceBlocks.hide();
        this._helpTexts.landingLeavingLeftSafe.hide();
        this._helpTexts.landingLeavingMiddleDanger.hide();
        this._helpTexts.landingLeavingRightDanger.hide();
        this._helpTexts.landingLeavingStillInGame.hide();
        this._helpTexts.landingLeavingEscaped.hide();
        this._helpTexts.landingLeavingEscapeLine.hide();
        this._helpMeshes.lander3.visible = false;
        this._helpMeshes.lander4.visible = false;
        this._helpMeshes.lander5.visible = false;

        //#region Topography Landing Conditions
        if (this._helpCounters.landingLeaving < 30) {
            this._landingLeavingVerticalUpdate1(false);
        } else if (this._helpCounters.landingLeaving < 130) {
            this._helpCounters.landingLeavingVerticalSpeed += this._helpCounters.landingLeavingGravity;
            this._landingLeavingVerticalUpdate1(false);
        } else if (this._helpCounters.landingLeaving < 180) {
            this._helpCounters.landingLeavingVerticalSpeed += this._helpCounters.landingLeavingGravity - 0.0002;
            this._landingLeavingVerticalUpdate1(true);
        } else if (this._helpCounters.landingLeaving < 240) {
            this._helpActors.mainThruster3.endCycle(HELP_MAIN_THRUSTER_3_POSITION, false);
            this._helpActors.mainThruster4.endCycle(HELP_MAIN_THRUSTER_4_POSITION, false);
            this._helpActors.mainThruster5.endCycle(HELP_MAIN_THRUSTER_5_POSITION, false);
            this._helpMeshes.lander3.visible = true;
            this._helpMeshes.lander4.visible = true;
            this._helpMeshes.lander5.visible = true;
            this._helpTexts.landingLeaving4FlatBlocks.show();
            this._helpTexts.landingLeavingNoGaps.show();
            this._helpTexts.landingLeavingNoLedges.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();

            this._helpCounters.landingLeavingFlashOn = this._helpCounters.landingLeaving % 10 === 0
                ? Number(!this._helpCounters.landingLeavingFlashOn)
                : this._helpCounters.landingLeavingFlashOn;

            if (!!this._helpCounters.landingLeavingFlashOn) {
                this._helpTexts.landingLeavingLeftSafe.show();
                this._helpTexts.landingLeavingMiddleDanger.show();
                this._helpTexts.landingLeavingRightDanger.show();
            } else {
                this._helpTexts.landingLeavingLeftSafe.hide();
                this._helpTexts.landingLeavingMiddleDanger.hide();
                this._helpTexts.landingLeavingRightDanger.hide();
            }
        } else if (this._helpCounters.landingLeaving === 250) {
            this._helpCounters.landingLeavingVerticalSpeed = 0.006;
            this._landingLeavingVerticalUpdate1(false);
        } else if (this._helpCounters.landingLeaving < 280) {
            this._helpCounters.landingLeavingVerticalSpeed += this._helpCounters.landingLeavingGravity;
            this._landingLeavingVerticalUpdate1(false);
        } else if (this._helpCounters.landingLeaving === 280) {
            this._helpMeshes.lander3.visible = true;
            this._helpTexts.landingLeaving4FlatBlocks.show();
            this._helpTexts.landingLeavingNoGaps.show();
            this._helpTexts.landingLeavingNoLedges.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();

            let currPos = this._helpMeshes.lander4.position;
            this._helpActors.landingLeavingExplosion1 = new Explosion(
                this._scene,
                currPos.x,
                currPos.z,
                {
                    radius: 0.2,
                    renderedInert: false,
                    segments: 128,
                    y: -8
                });
            currPos = this._helpMeshes.lander5.position;
            this._helpActors.landingLeavingExplosion2 = new Explosion(
                this._scene,
                currPos.x,
                currPos.z,
                {
                    radius: 0.2,
                    renderedInert: false,
                    segments: 128,
                    y: -8
                });
        } else if (this._helpCounters.landingLeaving < 382) {
            this._helpMeshes.lander3.visible = true;
            this._helpTexts.landingLeaving4FlatBlocks.show();
            this._helpTexts.landingLeavingNoGaps.show();
            this._helpTexts.landingLeavingNoLedges.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();

            this._helpActors.landingLeavingExplosion1 && this._helpActors.landingLeavingExplosion1.endCycle();
            this._helpActors.landingLeavingExplosion2 && this._helpActors.landingLeavingExplosion2.endCycle();
        } else if (this._helpCounters.landingLeaving === 382) {
            this._helpMeshes.lander3.visible = true;
            this._helpTexts.landingLeaving4FlatBlocks.show();
            this._helpTexts.landingLeavingNoGaps.show();
            this._helpTexts.landingLeavingNoLedges.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();

            this._scene.remove(this._helpActors.landingLeavingExplosion1);
            this._helpActors.landingLeavingExplosion1 = null;
            this._scene.remove(this._helpActors.landingLeavingExplosion2);
            this._helpActors.landingLeavingExplosion2 = null;
        } else if (this._helpCounters.landingLeaving < 440) {
            this._helpMeshes.lander3.visible = true;
            this._helpTexts.landingLeaving4FlatBlocks.show();
            this._helpTexts.landingLeavingNoGaps.show();
            this._helpTexts.landingLeavingNoLedges.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();
        //#endregion
        //#region Block Type Landing Conditions
        } else if (this._helpCounters.landingLeaving === 440) {
            this._helpCounters.landingLeavingVerticalSpeed = 0;
            this._helpMeshes.lander3.position.set(HELP_LANDER_3_POSITION[0], HELP_LANDER_3_POSITION[1], HELP_LANDER_3_POSITION[2]);
            this._helpMeshes.lander4.position.set(HELP_LANDER_4_POSITION[0], HELP_LANDER_4_POSITION[1], HELP_LANDER_4_POSITION[2]);
            this._helpMeshes.lander5.position.set(HELP_LANDER_5_POSITION[0], HELP_LANDER_5_POSITION[1], HELP_LANDER_5_POSITION[2]);
            this._helpActors.mainThruster3.endCycle(HELP_MAIN_THRUSTER_3_POSITION, false);
            this._helpActors.mainThruster4.endCycle(HELP_MAIN_THRUSTER_4_POSITION, false);
            this._helpActors.mainThruster5.endCycle(HELP_MAIN_THRUSTER_5_POSITION, false);
            this._helpTexts.landingLeavingPlantBlocks.show();
            this._helpTexts.landingLeavingWaterBlocks.show();
            this._helpTexts.landingLeavingIceBlocks.show();
            for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart1.length; row++) {
                if (this._helpTerrainMeshes.landingLeavingBasePart1[row]) {
                    for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart1[row].length; col++) {
                        if (this._helpTerrainMeshes.landingLeavingBasePart1[row][col]) {
                            this._helpTerrainMeshes.landingLeavingBasePart1[row][col].visible = false;
                        }
                    }
                }
            }
            for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart2.length; row++) {
                if (this._helpTerrainMeshes.landingLeavingBasePart2[row]) {
                    for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart2[row].length; col++) {
                        if (this._helpTerrainMeshes.landingLeavingBasePart2[row][col]) {
                            this._helpTerrainMeshes.landingLeavingBasePart2[row][col].visible = true;
                        }
                    }
                }
            }
        } else if (this._helpCounters.landingLeaving < 470) {
            this._landingLeavingVerticalUpdate2(false);
        } else if (this._helpCounters.landingLeaving < 570) {
            this._helpCounters.landingLeavingVerticalSpeed += this._helpCounters.landingLeavingGravity;
            this._landingLeavingVerticalUpdate2(false);
        } else if (this._helpCounters.landingLeaving < 620) {
            this._helpCounters.landingLeavingVerticalSpeed += this._helpCounters.landingLeavingGravity - 0.0002;
            this._landingLeavingVerticalUpdate2(true);
        } else if (this._helpCounters.landingLeaving < 680) {
            this._helpActors.mainThruster3.endCycle(HELP_MAIN_THRUSTER_3_POSITION, false);
            this._helpActors.mainThruster4.endCycle(HELP_MAIN_THRUSTER_4_POSITION, false);
            this._helpActors.mainThruster5.endCycle(HELP_MAIN_THRUSTER_5_POSITION, false);
            this._helpMeshes.lander3.visible = true;
            this._helpMeshes.lander4.visible = true;
            this._helpMeshes.lander5.visible = true;
            this._helpTexts.landingLeavingPlantBlocks.show();
            this._helpTexts.landingLeavingWaterBlocks.show();
            this._helpTexts.landingLeavingIceBlocks.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();

            this._helpCounters.landingLeavingFlashOn = this._helpCounters.landingLeaving % 10 === 0
                ? Number(!this._helpCounters.landingLeavingFlashOn)
                : this._helpCounters.landingLeavingFlashOn;

            if (!!this._helpCounters.landingLeavingFlashOn) {
                this._helpTexts.landingLeavingLeftSafe.show();
                this._helpTexts.landingLeavingMiddleDanger.show();
                this._helpTexts.landingLeavingRightDanger.show();
            } else {
                this._helpTexts.landingLeavingLeftSafe.hide();
                this._helpTexts.landingLeavingMiddleDanger.hide();
                this._helpTexts.landingLeavingRightDanger.hide();
            }
        } else if (this._helpCounters.landingLeaving === 680) {
            this._helpCounters.landingLeavingVerticalSpeed = 0.006;
            this._landingLeavingVerticalUpdate2(false);
        } else if (this._helpCounters.landingLeaving < 710) {
            this._helpCounters.landingLeavingVerticalSpeed += this._helpCounters.landingLeavingGravity;
            this._landingLeavingVerticalUpdate2(false);
        } else if (this._helpCounters.landingLeaving === 710) {
            this._helpMeshes.lander3.visible = true;
            this._helpTexts.landingLeavingPlantBlocks.show();
            this._helpTexts.landingLeavingWaterBlocks.show();
            this._helpTexts.landingLeavingIceBlocks.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();

            let currPos = this._helpMeshes.lander4.position;
            this._helpActors.landingLeavingExplosion1 = new Explosion(
                this._scene,
                currPos.x,
                currPos.z,
                {
                    radius: 0.2,
                    renderedInert: false,
                    segments: 128,
                    y: -8
                });
            currPos = this._helpMeshes.lander5.position;
            this._helpActors.landingLeavingExplosion2 = new Explosion(
                this._scene,
                currPos.x,
                currPos.z,
                {
                    radius: 0.2,
                    renderedInert: false,
                    segments: 128,
                    y: -8
                });
        } else if (this._helpCounters.landingLeaving < 812) {
            this._helpMeshes.lander3.visible = true;
            this._helpTexts.landingLeavingPlantBlocks.show();
            this._helpTexts.landingLeavingWaterBlocks.show();
            this._helpTexts.landingLeavingIceBlocks.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();

            this._helpActors.landingLeavingExplosion1 && this._helpActors.landingLeavingExplosion1.endCycle();
            this._helpActors.landingLeavingExplosion2 && this._helpActors.landingLeavingExplosion2.endCycle();
        } else if (this._helpCounters.landingLeaving === 812) {
            this._helpMeshes.lander3.visible = true;
            this._helpTexts.landingLeavingPlantBlocks.show();
            this._helpTexts.landingLeavingWaterBlocks.show();
            this._helpTexts.landingLeavingIceBlocks.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();

            this._scene.remove(this._helpActors.landingLeavingExplosion1);
            this._helpActors.landingLeavingExplosion1 = null;
            this._scene.remove(this._helpActors.landingLeavingExplosion2);
            this._helpActors.landingLeavingExplosion2 = null;
        } else if (this._helpCounters.landingLeaving < 870) {
            this._helpMeshes.lander3.visible = true;
            this._helpTexts.landingLeavingPlantBlocks.show();
            this._helpTexts.landingLeavingWaterBlocks.show();
            this._helpTexts.landingLeavingIceBlocks.show();
            this._helpTexts.landingLeavingLeftSafe.show();
            this._helpTexts.landingLeavingMiddleDanger.show();
            this._helpTexts.landingLeavingRightDanger.show();
        } else if (this._helpCounters.landingLeaving === 870) {
            this._helpMeshes.lander4.position.set(HELP_LANDER_4_POSITION[0], HELP_LANDER_4_POSITION[1], HELP_LANDER_4_POSITION[2] + 2.25);
            this._helpCounters.landingLeavingVerticalSpeed = 0;
            this._helpMeshes.lander4.visible = true;
            for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart2.length; row++) {
                if (this._helpTerrainMeshes.landingLeavingBasePart2[row]) {
                    for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart2[row].length; col++) {
                        if (this._helpTerrainMeshes.landingLeavingBasePart2[row][col]) {
                            this._helpTerrainMeshes.landingLeavingBasePart2[row][col].visible = false;
                        }
                    }
                }
            }
            for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart3.length; row++) {
                if (this._helpTerrainMeshes.landingLeavingBasePart3[row]) {
                    for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart3[row].length; col++) {
                        if (this._helpTerrainMeshes.landingLeavingBasePart3[row][col]) {
                            this._helpTerrainMeshes.landingLeavingBasePart3[row][col].visible = true;
                        }
                    }
                }
            }
            this._helpTexts.landingLeavingStillInGame.show();
            this._helpTexts.landingLeavingEscapeLine.show();
        } else if (this._helpCounters.landingLeaving < 1110) {
            this._helpTexts.landingLeavingStillInGame.show();
            this._helpCounters.landingLeavingVerticalSpeed += this._helpCounters.landingLeavingGravity - 0.00015;
            this._landingLeavingVerticalUpdate3(true);
        } else if (this._helpCounters.landingLeaving < 1170) {
            this._helpMeshes.lander4.visible = true;
            this._helpCounters.landingLeavingFlashOn = this._helpCounters.landingLeaving % 10 === 0
                ? Number(!this._helpCounters.landingLeavingFlashOn)
                : this._helpCounters.landingLeavingFlashOn;

            if (!!this._helpCounters.landingLeavingFlashOn) {
                this._helpTexts.landingLeavingEscaped.show();
                this._helpTexts.landingLeavingEscapeLine.show();
            } else {
                this._helpTexts.landingLeavingEscaped.hide();
                this._helpTexts.landingLeavingEscapeLine.hide();
            }
        } else {
            this._helpTexts.landingLeavingEscaped.show();
            this._helpCounters.landingLeavingVerticalSpeed += this._helpCounters.landingLeavingGravity - 0.00015;
            this._landingLeavingVerticalUpdate3(true);
        }
        //#endregion

        this._helpCounters.landingLeaving++;
    }

    /**
     * Calls the next frame in the animation cycle specific to bottom-middle-left panel - Load & Unload.
     */
    private _endCycleLoadUnload(): void {
        if (this._helpCounters.loadUnload > this._helpCounters.loadUnloadClear) {
            this._helpCounters.loadUnload = 0;
            this._helpCounters.loadUnloadCurrPositionX = HELP_LANDER_6_POSITION[0];
            this._helpCounters.loadUnloadCurrPositionY = HELP_LANDER_6_POSITION[1] - 3;
            this._helpCounters.loadUnloadCurrPositionZ = HELP_LANDER_6_POSITION[2] + 0.3;
        }

        this._helpActors.astronautsLoadUnload.filter((astro: Actor) => !!astro).forEach((astro: Actor) => {
            astro.mesh.visible = false;
        });
        this._helpButtons.unloadButton.hide();
        this._helpButtons.loadButton.hide();
        this._helpButtons.loadPressedButton.hide();
        this._helpButtons.unloadPressedButton.hide();
        this._helpButtons.mineLoadUnloadButton.hide();
        this._helpMeshes.mouseLeftLoadUnload.visible = false;
        this._helpMeshes.mouseLoadUnload.visible = false;
        this._helpMeshes.arrowLeftLoadUnload.visible = false;
        this._helpMeshes.arrowRightLoadUnload.visible = false;

        if (this._helpCounters.loadUnload < 60) {
            this._helpButtons.unloadButton.show();
            this._helpMeshes.mouseLoadUnload.visible = true;
        } else if (this._helpCounters.loadUnload < 90) {
            this._helpButtons.unloadPressedButton.show();
            this._helpMeshes.mouseLeftLoadUnload.visible = true;
        } else if (this._helpCounters.loadUnload < 150) {
            this._helpButtons.loadButton.show();
            this._helpMeshes.mouseLoadUnload.visible = true;
            this._loadUnloadStandingAnimation();
        } else if (this._helpCounters.loadUnload < 270) {
            this._helpButtons.loadButton.show();
            this._loadUnloadWalkingAnimation(-0.01);
        } else if (this._helpCounters.loadUnload < 330) {
            this._helpMeshes.arrowRightLoadUnload.visible = true;
            this._helpButtons.mineLoadUnloadButton.show();
            this._loadUnloadStandingAnimation();
        } else if (this._helpCounters.loadUnload < 570) {
            this._helpButtons.loadButton.show();
            this._loadUnloadWalkingAnimation(0.01);
        } else if (this._helpCounters.loadUnload < 630) {
            this._helpMeshes.arrowLeftLoadUnload.visible = true;
            this._helpButtons.mineLoadUnloadButton.show();
            this._loadUnloadStandingAnimation();
        } else if (this._helpCounters.loadUnload < 750) {
            this._helpButtons.loadButton.show();
            this._loadUnloadWalkingAnimation(-0.01);
        } else if (this._helpCounters.loadUnload < 780) {
            this._helpButtons.loadButton.show();
            this._helpMeshes.mouseLoadUnload.visible = true;
            this._loadUnloadStandingAnimation();
        } else if (this._helpCounters.loadUnload < 810) {
            this._helpButtons.loadPressedButton.show();
            this._helpMeshes.mouseLeftLoadUnload.visible = true;
            this._loadUnloadStandingAnimation();
        } else if (this._helpCounters.loadUnload < 841) {
            this._helpButtons.unloadButton.show();
            this._helpMeshes.mouseLoadUnload.visible = true;
        }

        this._helpCounters.loadUnload++;
    }

    /**
     * Calls the next frame in the animation cycle specific to upper-middle-right panel - Mining Controls.
     */
    private _endCycleMiningControls(): void {
        if (this._helpCounters.mining > this._helpCounters.miningClear) {
            this._helpCounters.mining = 0;
        }

        Object.keys(this._helpButtons).forEach(key => {
            this._helpButtons[key].hide();
        });
        this._helpMeshes.keysDownMining.visible = false;
        this._helpMeshes.mouseMining.visible = false;
        this._helpMeshes.keysUpMining.visible = false;
        this._helpMeshes.mouseLeftMining.visible = false;
        this._helpMeshes.arrowDownMining.visible = false;
        this._helpMeshes.arrowUpMining.visible = false;
        this._drillBits[0].visible = false;

        if (this._helpCounters.mining < 60) {
            this._helpButtons.mineButton.show();
            this._helpMeshes.mouseMining.visible = true;
        } else if (this._helpCounters.mining < 90) {
            this._helpButtons.minePressedButton.show();
            this._helpMeshes.mouseLeftMining.visible = true;
        } else if (this._helpCounters.mining < 120) {
            this._helpButtons.mineButton.show();
            this._helpMeshes.mouseMining.visible = true;
            this._drillBits[0].visible = true;
        } else if (this._helpCounters.mining === 120) {
            this._helpMeshes.arrowDownMining.visible = true;
            this._helpMeshes.keysDownMining.visible = true;
            this._drillBits[0].visible = true;
            this._makeDrillBit(DRILL_BIT_START_POSITION[0], DRILL_BIT_START_POSITION[1], DRILL_BIT_START_POSITION[2]);
        } else if (this._helpCounters.mining < 240) {
            this._helpMeshes.arrowDownMining.visible = true;
            this._helpMeshes.keysDownMining.visible = true;
            this._drillBits[0].visible = true;
            const currPos = this._drillBits[1].position;
            this._drillBits[1].position.set(currPos.x, currPos.y, currPos.z + 0.0025);
        } else if (this._helpCounters.mining === 240) {
            this._helpMeshes.arrowDownMining.visible = true;
            this._helpMeshes.keysDownMining.visible = true;
            this._drillBits[0].visible = true;
            this._makeDrillBit(DRILL_BIT_START_POSITION[0], DRILL_BIT_START_POSITION[1], DRILL_BIT_START_POSITION[2] + 0.3);
        } else if (this._helpCounters.mining < 360) {
            this._helpMeshes.arrowDownMining.visible = true;
            this._helpMeshes.keysDownMining.visible = true;
            this._drillBits[0].visible = true;
            const currPos = this._drillBits[2].position;
            this._drillBits[2].position.set(currPos.x, currPos.y, currPos.z + 0.0025);
        } else if (this._helpCounters.mining === 360) {
            this._helpMeshes.arrowDownMining.visible = true;
            this._helpMeshes.keysDownMining.visible = true;
            this._drillBits[0].visible = true;
        } else if (this._helpCounters.mining < 480) {
            this._helpMeshes.arrowUpMining.visible = true;
            this._helpMeshes.keysUpMining.visible = true;
            this._drillBits[0].visible = true;
            const currPos = this._drillBits[2].position;
            this._drillBits[2].position.set(currPos.x, currPos.y, currPos.z - 0.0025);
        } else if (this._helpCounters.mining === 480) {
            this._helpMeshes.arrowUpMining.visible = true;
            this._helpMeshes.keysUpMining.visible = true;
            this._drillBits[0].visible = true;
            this._scene.remove(this._drillBits[2]);
            this._drillBits.pop();
        } else if (this._helpCounters.mining < 600) {
            this._helpMeshes.arrowUpMining.visible = true;
            this._helpMeshes.keysUpMining.visible = true;
            this._drillBits[0].visible = true;
            const currPos = this._drillBits[1].position;
            this._drillBits[1].position.set(currPos.x, currPos.y, currPos.z - 0.0025);
        } else if (this._helpCounters.mining === 600) {
            this._helpMeshes.arrowUpMining.visible = true;
            this._helpMeshes.keysUpMining.visible = true;
            this._drillBits[0].visible = true;
            this._scene.remove(this._drillBits[1]);
            this._drillBits.pop();
        } else if (this._helpCounters.mining < 660) {
            this._helpButtons.packUpButton.show();
            this._helpMeshes.mouseMining.visible = true;
            this._drillBits[0].visible = true;
        } else if (this._helpCounters.mining < 690) {
            this._helpButtons.packUpPressedButton.show();
            this._helpMeshes.mouseLeftMining.visible = true;
            this._drillBits[0].visible = true;
        } else {
            this._helpButtons.packUpButton.show();
            this._helpMeshes.mouseMining.visible = true;
        }

        this._helpCounters.mining++;
    }

    /**
     * Calls the next frame in the animation cycle specific to upper-right panel - Thresholds.
     */
    private _endCycleThresholds(): void {
        if (this._helpCounters.landingThresholds > this._helpCounters.landingThresholdsClear) {
            this._helpCounters.landingThresholds = 0;
        }

        this._helpTexts.landingThresholdHorizontalSpeed.hide();
        this._helpTexts.landingThresholdHorizontalThreshold.hide();
        this._helpTexts.landingThresholdDanger.hide();
        this._helpTexts.landingThresholdSafe.hide();
        this._helpTexts.landingThresholdVerticalSpeed.hide();
        this._helpTexts.landingThresholdVerticalThreshold.hide();
        this._helpActors.mainThruster2.endCycle(HELP_MAIN_THRUSTER_1_POSITION, false);
        this._helpActors.sideThruster2Left.endCycle(HELP_SIDE_THRUSTER_1_POSITION, false);
        this._helpActors.sideThruster2Right.endCycle(HELP_SIDE_THRUSTER_1_POSITION, false);
        this._helpMeshes.lander2.visible = false;

        //#region Setup
        if (this._helpCounters.landingThresholds === 0) {
            this._helpTexts.landingThresholdSafe.show();
            this._helpCounters.landingThresholdsVerticalSpeed = 0;
            this._helpTexts.landingThresholdVerticalSpeed.update('Descent Speed: 0.0000');
            this._helpMeshes.lander2.position.set(HELP_LANDER_2_POSITION[0], HELP_LANDER_2_POSITION[1], HELP_LANDER_2_POSITION[2]);
            this._helpActors.sideThruster2Left = new SideThruster(this._scene, HELP_SIDE_THRUSTER_2_POSITION, -1, 1.5);
            this._helpActors.sideThruster2Right = new SideThruster(this._scene, HELP_SIDE_THRUSTER_2_POSITION, 1, 1.5);
            this._helpActors.mainThruster2 = new MainThruster(this._scene, HELP_MAIN_THRUSTER_2_POSITION, 2);
        //#endregion
        //#region Vertical Direction Safe Landing Sequence
        } else if (this._helpCounters.landingThresholds < 55) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity;
            this._landingThresholdsVerticalUpdate(false);
        } else if (this._helpCounters.landingThresholds < 80) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity - 0.0015;
            this._landingThresholdsVerticalUpdate(true);
        } else if (this._helpCounters.landingThresholds < 95) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity;
            this._landingThresholdsVerticalUpdate(false);
        } else if (this._helpCounters.landingThresholds < 100) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity - 0.0015;
            this._landingThresholdsVerticalUpdate(true);
        } else if (this._helpCounters.landingThresholds < 110) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity;
            this._landingThresholdsVerticalUpdate(false);
        } else if (this._helpCounters.landingThresholds < 239) {
            this._helpMeshes.lander2.visible = true;
            this._helpTexts.landingThresholdVerticalSpeed.show();
            this._helpTexts.landingThresholdVerticalThreshold.show();
            this._helpCounters.landingThresholdsFlashOn = this._helpCounters.landingThresholds % 10 === 0
                ? Number(!this._helpCounters.landingThresholdsFlashOn)
                : this._helpCounters.landingThresholdsFlashOn;

            !!this._helpCounters.landingThresholdsFlashOn
                ? this._helpTexts.landingThresholdSafe.show()
                : this._helpTexts.landingThresholdSafe.hide();
        //#endregion
        //#region Vertical Direction Crash Landing Sequence
        } else if (this._helpCounters.landingThresholds === 240) {
            this._helpTexts.landingThresholdSafe.show();
            this._helpCounters.landingThresholdsVerticalSpeed = 0;
            this._helpTexts.landingThresholdVerticalSpeed.update('Descent Speed: 0.0000');
            this._helpMeshes.lander2.position.set(HELP_LANDER_2_POSITION[0], HELP_LANDER_2_POSITION[1], HELP_LANDER_2_POSITION[2]);
        } else if (this._helpCounters.landingThresholds < 270) {
            this._helpMeshes.lander2.visible = true;
            this._helpTexts.landingThresholdSafe.show();
            this._helpTexts.landingThresholdVerticalSpeed.show();
            this._helpTexts.landingThresholdVerticalThreshold.show();
        } else if (this._helpCounters.landingThresholds < 325) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity;
            this._landingThresholdsVerticalUpdate(false);
        } else if (this._helpCounters.landingThresholds < 430) {
            this._helpMeshes.lander2.visible = true;
            this._helpTexts.landingThresholdVerticalSpeed.show();
            this._helpTexts.landingThresholdVerticalThreshold.show();
            this._helpCounters.landingThresholdsFlashOn = this._helpCounters.landingThresholds % 10 === 0
                ? Number(!this._helpCounters.landingThresholdsFlashOn)
                : this._helpCounters.landingThresholdsFlashOn;

            !!this._helpCounters.landingThresholdsFlashOn
                ? this._helpTexts.landingThresholdDanger.show()
                : this._helpTexts.landingThresholdDanger.hide();
        } else if (this._helpCounters.landingThresholds < 450) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity;
            this._landingThresholdsVerticalUpdate(false);
        } else if (this._helpCounters.landingThresholds === 450) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdVerticalSpeed.show();
            this._helpTexts.landingThresholdVerticalThreshold.show();
            const currPos = this._helpMeshes.lander2.position;
            this._helpActors.landingThresholdsExplosion1 = new Explosion(
                this._scene,
                currPos.x,
                currPos.z,
                {
                    radius: 0.3,
                    renderedInert: false,
                    segments: 128,
                    y: -8
                });
        } else if (this._helpCounters.landingThresholds < 552) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdVerticalSpeed.show();
            this._helpTexts.landingThresholdVerticalThreshold.show();
            this._helpActors.landingThresholdsExplosion1 && this._helpActors.landingThresholdsExplosion1.endCycle();
        } else if (this._helpCounters.landingThresholds === 552) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdVerticalSpeed.show();
            this._helpTexts.landingThresholdVerticalThreshold.show();
            this._scene.remove(this._helpActors.landingThresholdsExplosion1);
            this._helpActors.landingThresholdsExplosion1 = null;
        } else if (this._helpCounters.landingThresholds < 610) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdVerticalSpeed.show();
            this._helpTexts.landingThresholdVerticalThreshold.show();
        //#endregion
        //#region Right Direction Safe Landing Sequence
        } else if (this._helpCounters.landingThresholds === 610) {
            this._helpMeshes.lander2.position.set(HELP_LANDER_2_POSITION[0], HELP_LANDER_2_POSITION[1], HELP_LANDER_2_POSITION[2] + 0.5);
            this._helpTexts.landingThresholdSafe.show();
            this._helpCounters.landingThresholdsHorizontalSpeed = 0;
            this._helpCounters.landingThresholdsVerticalSpeed = 0;
            this._helpTexts.landingThresholdHorizontalSpeed.update('Horizontal Speed: 0.0000');
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
        } else if (this._helpCounters.landingThresholds < 640) {
            this._landingThresholdsHorizontalUpdate(true, false);
        } else if (this._helpCounters.landingThresholds < 690) {
            this._helpCounters.landingThresholdsHorizontalSpeed += 0.0001;
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(true, false);
        } else if (this._helpCounters.landingThresholds < 720) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, false);
        } else if (this._helpCounters.landingThresholds < 750) {
            this._helpCounters.landingThresholdsHorizontalSpeed -= 0.00014;
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, true);
        } else if (this._helpCounters.landingThresholds < 780) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, false);
        } else if (this._helpCounters.landingThresholds < 880) {
            this._helpMeshes.lander2.visible = true;
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._helpCounters.landingThresholdsFlashOn = this._helpCounters.landingThresholds % 10 === 0
                ? Number(!this._helpCounters.landingThresholdsFlashOn)
                : this._helpCounters.landingThresholdsFlashOn;

            !!this._helpCounters.landingThresholdsFlashOn
                ? this._helpTexts.landingThresholdSafe.show()
                : this._helpTexts.landingThresholdSafe.hide();
        } else if (this._helpCounters.landingThresholds < 940) {
            this._helpTexts.landingThresholdSafe.show();
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._helpMeshes.lander2.visible = true;
        //#endregion
        //#region Left Direction Safe Landing Sequence
        } else if (this._helpCounters.landingThresholds === 940) {
            this._helpMeshes.lander2.position.set(HELP_LANDER_2_POSITION[0], HELP_LANDER_2_POSITION[1], HELP_LANDER_2_POSITION[2] + 0.5);
            this._helpTexts.landingThresholdSafe.show();
            this._helpCounters.landingThresholdsHorizontalSpeed = 0;
            this._helpCounters.landingThresholdsVerticalSpeed = 0;
            this._helpTexts.landingThresholdHorizontalSpeed.update('Horizontal Speed: 0.0000');
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
        } else if (this._helpCounters.landingThresholds < 970) {
            this._landingThresholdsHorizontalUpdate(false, true);
        } else if (this._helpCounters.landingThresholds < 1020) {
            this._helpCounters.landingThresholdsHorizontalSpeed -= 0.0001;
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, true);
        } else if (this._helpCounters.landingThresholds < 1050) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, false);
        } else if (this._helpCounters.landingThresholds < 1080) {
            this._helpCounters.landingThresholdsHorizontalSpeed += 0.00014;
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(true, false);
        } else if (this._helpCounters.landingThresholds < 1110) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, false);
        } else if (this._helpCounters.landingThresholds < 1210) {
            this._helpMeshes.lander2.visible = true;
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._helpCounters.landingThresholdsFlashOn = this._helpCounters.landingThresholds % 10 === 0
                ? Number(!this._helpCounters.landingThresholdsFlashOn)
                : this._helpCounters.landingThresholdsFlashOn;

            !!this._helpCounters.landingThresholdsFlashOn
                ? this._helpTexts.landingThresholdSafe.show()
                : this._helpTexts.landingThresholdSafe.hide();
        } else if (this._helpCounters.landingThresholds < 1270) {
            this._helpTexts.landingThresholdSafe.show();
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._helpMeshes.lander2.visible = true;
        //#endregion
        //#region Right Direction Crash Landing Sequence
        } else if (this._helpCounters.landingThresholds === 1270) {
            this._helpMeshes.lander2.position.set(HELP_LANDER_2_POSITION[0], HELP_LANDER_2_POSITION[1], HELP_LANDER_2_POSITION[2] + 0.5);
            this._helpTexts.landingThresholdSafe.show();
            this._helpCounters.landingThresholdsHorizontalSpeed = 0;
            this._helpCounters.landingThresholdsVerticalSpeed = 0;
            this._helpTexts.landingThresholdHorizontalSpeed.update('Horizontal Speed: 0.0000');
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
        } else if (this._helpCounters.landingThresholds < 1300) {
            this._landingThresholdsHorizontalUpdate(true, false);
        } else if (this._helpCounters.landingThresholds < 1380) {
            this._helpCounters.landingThresholdsHorizontalSpeed += 0.0001;
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(true, false);
        } else if (this._helpCounters.landingThresholds < 1410) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, false);
        } else if (this._helpCounters.landingThresholds < 1510) {
            this._helpMeshes.lander2.visible = true;
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._helpCounters.landingThresholdsFlashOn = this._helpCounters.landingThresholds % 10 === 0
                ? Number(!this._helpCounters.landingThresholdsFlashOn)
                : this._helpCounters.landingThresholdsFlashOn;

            !!this._helpCounters.landingThresholdsFlashOn
                ? this._helpTexts.landingThresholdDanger.show()
                : this._helpTexts.landingThresholdDanger.hide();
        } else if (this._helpCounters.landingThresholds < 1540) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, false);
        } else if (this._helpCounters.landingThresholds === 1540) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            const currPos = this._helpMeshes.lander2.position;
            this._helpActors.landingThresholdsExplosion1 = new Explosion(
                this._scene,
                currPos.x,
                currPos.z,
                {
                    radius: 0.3,
                    renderedInert: false,
                    segments: 128,
                    y: -8
                });
        } else if (this._helpCounters.landingThresholds < 1642) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._helpActors.landingThresholdsExplosion1 && this._helpActors.landingThresholdsExplosion1.endCycle();
        } else if (this._helpCounters.landingThresholds === 1642) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._scene.remove(this._helpActors.landingThresholdsExplosion1);
            this._helpActors.landingThresholdsExplosion1 = null;
        } else if (this._helpCounters.landingThresholds < 1700) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
        //#endregion
        //#region Left Direction Crash Landing Sequence
        } else if (this._helpCounters.landingThresholds === 1700) {
            this._helpMeshes.lander2.position.set(HELP_LANDER_2_POSITION[0], HELP_LANDER_2_POSITION[1], HELP_LANDER_2_POSITION[2] + 0.5);
            this._helpTexts.landingThresholdSafe.show();
            this._helpCounters.landingThresholdsHorizontalSpeed = 0;
            this._helpCounters.landingThresholdsVerticalSpeed = 0;
            this._helpTexts.landingThresholdHorizontalSpeed.update('Horizontal Speed: 0.0000');
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
        } else if (this._helpCounters.landingThresholds < 1730) {
            this._landingThresholdsHorizontalUpdate(false, true);
        } else if (this._helpCounters.landingThresholds < 1810) {
            this._helpCounters.landingThresholdsHorizontalSpeed -= 0.0001;
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, true);
        } else if (this._helpCounters.landingThresholds < 1840) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, false);
        } else if (this._helpCounters.landingThresholds < 1940) {
            this._helpMeshes.lander2.visible = true;
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._helpCounters.landingThresholdsFlashOn = this._helpCounters.landingThresholds % 10 === 0
                ? Number(!this._helpCounters.landingThresholdsFlashOn)
                : this._helpCounters.landingThresholdsFlashOn;

            !!this._helpCounters.landingThresholdsFlashOn
                ? this._helpTexts.landingThresholdDanger.show()
                : this._helpTexts.landingThresholdDanger.hide();
        } else if (this._helpCounters.landingThresholds < 1970) {
            this._helpCounters.landingThresholdsVerticalSpeed += this._helpCounters.landingThresholdsGravity / 6;
            this._landingThresholdsHorizontalUpdate(false, false);
        } else if (this._helpCounters.landingThresholds === 1970) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            const currPos = this._helpMeshes.lander2.position;
            this._helpActors.landingThresholdsExplosion1 = new Explosion(
                this._scene,
                currPos.x,
                currPos.z,
                {
                    radius: 0.3,
                    renderedInert: false,
                    segments: 128,
                    y: -8
                });
        } else if (this._helpCounters.landingThresholds < 2072) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._helpActors.landingThresholdsExplosion1 && this._helpActors.landingThresholdsExplosion1.endCycle();
        } else if (this._helpCounters.landingThresholds === 2072) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
            this._scene.remove(this._helpActors.landingThresholdsExplosion1);
            this._helpActors.landingThresholdsExplosion1 = null;
        } else if (this._helpCounters.landingThresholds < 2130) {
            this._helpTexts.landingThresholdDanger.show()
            this._helpTexts.landingThresholdHorizontalSpeed.show();
            this._helpTexts.landingThresholdHorizontalThreshold.show();
        //#endregion
        }

        this._helpCounters.landingThresholds++;
    }

    /**
     * Updates text and graphics during part 1 of landing & leaving section demonstration.
     * @param mainThrusterOn whether turn main thruster graphics on
     */
    private _landingLeavingVerticalUpdate1(mainThrusterOn: boolean): void {
        let currPos = this._helpMeshes.lander3.position;
        this._helpMeshes.lander3.position.set(currPos.x, currPos.y, currPos.z + this._helpCounters.landingLeavingVerticalSpeed);
        currPos = this._helpMeshes.lander3.position;
        this._helpActors.mainThruster3.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET_SMALL], mainThrusterOn);

        currPos = this._helpMeshes.lander4.position;
        this._helpMeshes.lander4.position.set(currPos.x, currPos.y, currPos.z + this._helpCounters.landingLeavingVerticalSpeed);
        currPos = this._helpMeshes.lander4.position;
        this._helpActors.mainThruster4.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET_SMALL], mainThrusterOn);

        currPos = this._helpMeshes.lander5.position;
        this._helpMeshes.lander5.position.set(currPos.x, currPos.y, currPos.z + this._helpCounters.landingLeavingVerticalSpeed);
        currPos = this._helpMeshes.lander5.position;
        this._helpActors.mainThruster5.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET_SMALL], mainThrusterOn);

        this._helpTexts.landingLeaving4FlatBlocks.show();
        this._helpTexts.landingLeavingNoGaps.show();
        this._helpTexts.landingLeavingNoLedges.show();
        this._helpTexts.landingLeavingLeftSafe.show();
        this._helpTexts.landingLeavingMiddleDanger.show();
        this._helpTexts.landingLeavingRightDanger.show();
        this._helpMeshes.lander3.visible = true;
        this._helpMeshes.lander4.visible = true;
        this._helpMeshes.lander5.visible = true;
    }

    /**
     * Updates text and graphics during part 2 of landing & leaving section demonstration.
     * @param mainThrusterOn whether turn main thruster graphics on
     */
    private _landingLeavingVerticalUpdate2(mainThrusterOn: boolean): void {
        let currPos = this._helpMeshes.lander3.position;
        this._helpMeshes.lander3.position.set(currPos.x, currPos.y, currPos.z + this._helpCounters.landingLeavingVerticalSpeed);
        currPos = this._helpMeshes.lander3.position;
        this._helpActors.mainThruster3.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET_SMALL], mainThrusterOn);

        currPos = this._helpMeshes.lander4.position;
        this._helpMeshes.lander4.position.set(currPos.x, currPos.y, currPos.z + this._helpCounters.landingLeavingVerticalSpeed);
        currPos = this._helpMeshes.lander4.position;
        this._helpActors.mainThruster4.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET_SMALL], mainThrusterOn);

        currPos = this._helpMeshes.lander5.position;
        this._helpMeshes.lander5.position.set(currPos.x, currPos.y, currPos.z + this._helpCounters.landingLeavingVerticalSpeed);
        currPos = this._helpMeshes.lander5.position;
        this._helpActors.mainThruster5.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET_SMALL], mainThrusterOn);

        this._helpTexts.landingLeavingPlantBlocks.show();
        this._helpTexts.landingLeavingWaterBlocks.show();
        this._helpTexts.landingLeavingIceBlocks.show();
        this._helpTexts.landingLeavingLeftSafe.show();
        this._helpTexts.landingLeavingMiddleDanger.show();
        this._helpTexts.landingLeavingRightDanger.show();
        this._helpMeshes.lander3.visible = true;
        this._helpMeshes.lander4.visible = true;
        this._helpMeshes.lander5.visible = true;
    }

    /**
     * Updates text and graphics during part 3 of landing & leaving section demonstration.
     * @param mainThrusterOn whether turn main thruster graphics on
     */
    private _landingLeavingVerticalUpdate3(mainThrusterOn: boolean): void {
        let currPos = this._helpMeshes.lander4.position;
        this._helpMeshes.lander4.position.set(currPos.x, currPos.y, currPos.z + this._helpCounters.landingLeavingVerticalSpeed);
        currPos = this._helpMeshes.lander4.position;
        this._helpActors.mainThruster4.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET_SMALL], mainThrusterOn);

        this._helpTexts.landingLeavingEscapeLine.show();
        this._helpMeshes.lander4.visible = true;
    }

    /**
     * Updates text and graphics during horizontal threshold section demonstration.
     * @param leftSideThrusterOn whether turn left side thruster graphics on
     * @param rightSideThrusterOn whether turn right side thruster graphics on
     */
    private _landingThresholdsHorizontalUpdate(leftSideThrusterOn: boolean, rightSideThrusterOn: boolean): void {
        this._helpTexts.landingThresholdHorizontalSpeed.update(
            `Horizontal Speed: ${this._helpCounters.landingThresholdsHorizontalSpeed.toFixed(4)}`);

        let currPos = this._helpMeshes.lander2.position;
        this._helpMeshes.lander2.position.set(
            currPos.x + this._helpCounters.landingThresholdsHorizontalSpeed,
            currPos.y,
            currPos.z + this._helpCounters.landingThresholdsVerticalSpeed);
        currPos = this._helpMeshes.lander2.position;
        this._helpActors.sideThruster2Left.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], leftSideThrusterOn);
        this._helpActors.sideThruster2Right.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], rightSideThrusterOn);
        this._helpActors.mainThruster2.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);

        if (Math.abs(this._helpCounters.landingThresholdsHorizontalSpeed) > this._landerSpecifications.horizontalCrashMargin) {
            this._helpTexts.landingThresholdDanger.show();
            this._helpTexts.landingThresholdHorizontalSpeed.cycle(COLORS.selected);
        } else {
            this._helpTexts.landingThresholdSafe.show();
            this._helpTexts.landingThresholdHorizontalSpeed.cycle(COLORS.neutral);
        }

        this._helpMeshes.lander2.visible = true;
        this._helpTexts.landingThresholdHorizontalSpeed.show();
        this._helpTexts.landingThresholdHorizontalThreshold.show();
    }

    /**
     * Updates text and graphics during vertical threshold section demonstration.
     * @param mainThrusterOn whether turn main thruster graphics on
     */
    private _landingThresholdsVerticalUpdate(mainThrusterOn: boolean): void {
        this._helpTexts.landingThresholdVerticalSpeed.update(
            `Descent Speed: ${this._helpCounters.landingThresholdsVerticalSpeed.toFixed(4)}`);

        let currPos = this._helpMeshes.lander2.position;
        this._helpMeshes.lander2.position.set(currPos.x, currPos.y, currPos.z + this._helpCounters.landingThresholdsVerticalSpeed);
        currPos = this._helpMeshes.lander2.position;
        this._helpActors.sideThruster2Left.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        this._helpActors.sideThruster2Right.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        this._helpActors.mainThruster2.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], mainThrusterOn);

        if (this._helpCounters.landingThresholdsVerticalSpeed > this._landerSpecifications.verticalCrashMargin) {
            this._helpTexts.landingThresholdDanger.show();
            this._helpTexts.landingThresholdVerticalSpeed.cycle(COLORS.selected);
        } else {
            this._helpTexts.landingThresholdSafe.show();
            this._helpTexts.landingThresholdVerticalSpeed.cycle(COLORS.neutral);
        }

        this._helpMeshes.lander2.visible = true;
        this._helpTexts.landingThresholdVerticalSpeed.show();
        this._helpTexts.landingThresholdVerticalThreshold.show();
    }

    /**
     * Runs the standing animation in the load and unload section.
     */
    private _loadUnloadStandingAnimation(): void {
        this._helpActors.astronautsLoadUnload[3].mesh.visible = false;
        this._helpActors.astronautsLoadUnload[5].mesh.visible = false;
        this._helpActors.astronautsLoadUnload[6].mesh.visible = false;
        this._helpActors.astronautsLoadUnload[8].mesh.visible = false;
        this._helpActors.astronautsLoadUnload[0].mesh.visible = true;
        this._helpActors.astronautsLoadUnload[1].mesh.visible = true;
        this._helpActors.astronautsLoadUnload[2].mesh.visible = true;
    }

    /**
     * Runs the walking animation in the load and unload section.
     * @param newXPos new x coord to be applied to mining team
     */
    private _loadUnloadWalkingAnimation(newXPos: number): void {
        // Move the team
        this._helpCounters.loadUnloadCurrPositionX += newXPos;
        this._helpActors.astronautsLoadUnload.filter((astro: Actor) => !!astro).forEach((astro: Actor, index: number) => {
            this._scene.add(astro.mesh);
            astro.mesh.scale.set(2.5, 2.5, 2.5);
            astro.mesh.visible = false;
            if (index === 1) {
                astro.mesh.position.set(
                    this._helpCounters.loadUnloadCurrPositionX,
                    this._helpCounters.loadUnloadCurrPositionY,
                    this._helpCounters.loadUnloadCurrPositionZ);
            } else if (index % 3 === 0) {
                astro.mesh.position.set(
                    this._helpCounters.loadUnloadCurrPositionX - 0.3,
                    this._helpCounters.loadUnloadCurrPositionY,
                    this._helpCounters.loadUnloadCurrPositionZ);
            } else {
                astro.mesh.position.set(
                    this._helpCounters.loadUnloadCurrPositionX + 0.3,
                    this._helpCounters.loadUnloadCurrPositionY,
                    this._helpCounters.loadUnloadCurrPositionZ);
            }
        });
        // Move the legs
        if (this._helpCounters.loadUnload % 10 < 5) {
            this._helpActors.astronautsLoadUnload[0].mesh.visible = false;
            this._helpActors.astronautsLoadUnload[2].mesh.visible = false;
            this._helpActors.astronautsLoadUnload[3].mesh.visible = false;
            this._helpActors.astronautsLoadUnload[5].mesh.visible = false;
            this._helpActors.astronautsLoadUnload[1].mesh.visible = true;
            this._helpActors.astronautsLoadUnload[6].mesh.visible = true;
            this._helpActors.astronautsLoadUnload[8].mesh.visible = true;
        } else {
            this._helpActors.astronautsLoadUnload[0].mesh.visible = false;
            this._helpActors.astronautsLoadUnload[2].mesh.visible = false;
            this._helpActors.astronautsLoadUnload[6].mesh.visible = false;
            this._helpActors.astronautsLoadUnload[8].mesh.visible = false;
            this._helpActors.astronautsLoadUnload[1].mesh.visible = true;
            this._helpActors.astronautsLoadUnload[3].mesh.visible = true;
            this._helpActors.astronautsLoadUnload[5].mesh.visible = true;
        }
    }

    /**
     * Creates a drill bit and places it at the position set by parameters.
     * @param x coordinate for the drill bit's position
     * @param y coordinate for the drill bit's position
     * @param z coordinate for the drill bit's position
     */
    private _makeDrillBit(x: number, y: number, z: number): void {
        const drillGeo = new PlaneGeometry( 0.05, 0.1, 10, 10 );
        const drillMat = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.miningDrill,
            shininess: 0,
            transparent: true
        });
        const drillMesh = new Mesh(drillGeo, drillMat);
        drillMesh.position.set(x, y - (this._drillBits.length), z);
        drillMesh.rotation.set(-1.5708, 0, 0);
        drillMesh.scale.set(3, 3, 3);
        drillMesh.name = `Mining-Drill-${this._drillBits.length}`;
        this._drillBits.push(drillMesh);
        this._scene.add(drillMesh);
    }

    /**
     * Removes anything that might stick around after Help Controller is destroyed.
     */
    public dispose(): void {
        Object.keys(this._helpTexts)
            .filter(key => !!this._helpTexts[key])
            .forEach(key => this._helpTexts[key].dispose());

        Object.keys(this._helpButtons)
            .filter(key => !!this._helpButtons[key])
            .forEach(key => this._helpButtons[key].dispose());
    }

    /**
     * Calls the next frame in the animation cycle.
     */
    public endCycle(): void {
        SoundinatorSingleton.pauseSound();

        this._endCycleLanderControls();
        this._endCycleThresholds();
        this._endCycleAstronautControls();
        this._endCycleMiningControls();
        this._endCycleLoadUnload();
        this._endCycleBlockTypes();
        this._endCycleLandingLeaving();
    }

    /**
     * Sets all help content to be hidden.
     */
    public hide(): void {
        // Shared
        this._helpMeshes.mainBackground.visible = false;
        Object.values(this._helpPanels).forEach(p => p && p.hide());

        // Lander Controls
        this._helpMeshes.lander1.visible = false;
        this._helpMeshes.arrowLeft.visible = false;
        this._helpMeshes.arrowRight.visible = false;
        this._helpMeshes.arrowUp.visible = false;
        this._helpMeshes.keysUp.visible = false;
        this._helpMeshes.keysLeft.visible = false;
        this._helpMeshes.keysRight.visible = false;
        this._helpActors.sideThrusterLeft.endCycle(HELP_SIDE_THRUSTER_1_POSITION, false);
        this._helpActors.sideThrusterRight.endCycle(HELP_SIDE_THRUSTER_1_POSITION, false);
        this._helpActors.mainThruster.endCycle(HELP_MAIN_THRUSTER_1_POSITION, false);
        this._helpTexts.landerControlsTitle.hide();

        // Landing Thresholds
        this._helpMeshes.lander2.visible = false;
        this._helpActors.sideThruster2Left.endCycle(HELP_SIDE_THRUSTER_2_POSITION, false);
        this._helpActors.sideThruster2Right.endCycle(HELP_SIDE_THRUSTER_2_POSITION, false);
        this._helpActors.mainThruster2.endCycle(HELP_MAIN_THRUSTER_2_POSITION, false);
        this._helpTexts.landingThresholdHorizontalThreshold.hide();
        this._helpTexts.landingThresholdHorizontalSpeed.hide();
        this._helpTexts.landingThresholdDanger.hide();
        this._helpTexts.landingThresholdSafe.hide();
        this._helpTexts.landingThresholdVerticalSpeed.hide();
        this._helpTexts.landingThresholdVerticalThreshold.hide();
        this._helpTexts.landingThresholdsTitle.hide();
        for (let row = 0; row < this._helpTerrainMeshes.landingThresholdsGroundSpeed.length; row++) {
            if (this._helpTerrainMeshes.landingThresholdsGroundSpeed[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.landingThresholdsGroundSpeed[row].length; col++) {
                    if (this._helpTerrainMeshes.landingThresholdsGroundSpeed[row][col]) {
                        this._helpTerrainMeshes.landingThresholdsGroundSpeed[row][col].visible = false;
                    }
                }
            }
        }
        if (this._helpActors.landingThresholdsExplosion1) {
            this._scene.remove(this._helpActors.landingThresholdsExplosion1.getMesh());
            this._helpActors.landingThresholdsExplosion1 = null;
        }

        // Astronaut Controls
        this._helpMeshes.arrowLeftAstroWalk.visible = false;
        this._helpMeshes.arrowRightAstroWalk.visible = false;
        this._helpMeshes.keysLeftAstroWalk.visible = false;
        this._helpMeshes.keysRightAstroWalk.visible = false;
        this._helpTexts.astronautControlsTitle.hide();
        this._helpActors.astronauts.filter((astro: Actor) => !!astro).forEach((astro: Actor) => {
            astro.mesh.visible = false;
        });

        // Mining Controls
        this._helpMeshes.arrowDownMining.visible = false;
        this._helpMeshes.arrowUpMining.visible = false;
        this._helpMeshes.keysDownMining.visible = false;
        this._helpActors.miners[0].mesh.visible = false;
        this._helpActors.miners[1].mesh.visible = false;
        this._helpActors.miners[2].mesh.visible = false;
        this._helpMeshes.keysUpMining.visible = false;
        this._helpMeshes.mouseMining.visible = false;
        this._helpMeshes.mouseLeftMining.visible = false;
        this._helpTexts.miningControlsTitle.hide();
        Object.keys(this._helpButtons).forEach(key => {
            this._helpButtons[key].hide();
        });
        this._drillBits.slice(1).forEach(bit => {
            this._scene.remove(bit);
        });
        this._drillBits[0].visible = false;
        this._drillBits.length = 1;

        // Load & Unload
        this._helpTexts.loadUnloadTitle.hide();
        for (let row = 0; row < this._helpTerrainMeshes.loadUnload.length; row++) {
            if (this._helpTerrainMeshes.loadUnload[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.loadUnload[row].length; col++) {
                    if (this._helpTerrainMeshes.loadUnload[row][col]) {
                        this._helpTerrainMeshes.loadUnload[row][col].visible = false;
                    }
                }
            }
        }
        this._helpMeshes.lander6.visible = false;
        this._helpActors.astronautsLoadUnload.filter((astro: Actor) => !!astro).forEach((astro: Actor) => {
            astro.mesh.visible = false;
        });
        this._helpCounters.loadUnloadCurrPositionX = HELP_LANDER_6_POSITION[0];
        this._helpCounters.loadUnloadCurrPositionY = HELP_LANDER_6_POSITION[1] - 3;
        this._helpCounters.loadUnloadCurrPositionZ = HELP_LANDER_6_POSITION[2] + 0.3;
        this._helpActors.astronautsLoadUnload.filter((astro: Actor) => !!astro).forEach((astro: Actor, index: number) => {
            this._scene.add(astro.mesh);
            astro.mesh.scale.set(2.5, 2.5, 2.5);
            astro.mesh.visible = false;
            if (index === 1) {
                astro.mesh.position.set(
                    this._helpCounters.loadUnloadCurrPositionX,
                    this._helpCounters.loadUnloadCurrPositionY,
                    this._helpCounters.loadUnloadCurrPositionZ);
            } else if (index % 3 === 0) {
                astro.mesh.position.set(
                    this._helpCounters.loadUnloadCurrPositionX - 0.3,
                    this._helpCounters.loadUnloadCurrPositionY,
                    this._helpCounters.loadUnloadCurrPositionZ);
            } else {
                astro.mesh.position.set(
                    this._helpCounters.loadUnloadCurrPositionX + 0.3,
                    this._helpCounters.loadUnloadCurrPositionY,
                    this._helpCounters.loadUnloadCurrPositionZ);
            }
        });
        this._helpButtons.unloadButton.hide();
        this._helpButtons.unloadPressedButton.hide();
        this._helpButtons.loadButton.hide();
        this._helpButtons.loadPressedButton.hide();
        this._helpButtons.mineLoadUnloadButton.hide();
        this._helpMeshes.mouseLeftLoadUnload.visible = false;
        this._helpMeshes.mouseLoadUnload.visible = false;
        this._helpMeshes.arrowLeftLoadUnload.visible = false;
        this._helpMeshes.arrowRightLoadUnload.visible = false;
        this._helpCounters.loadUnload = 0;

        // Block Types
        this._helpCounters.blockTypes = 0;
        this._helpTexts.blockTypesTitle.hide();
        this._helpProfile.hide();
        this._helpTexts.blockTypesDialogue.hide();
        this._helpTexts.blockTypesDialogue.update('', true);
        this._helpTexts.blockTypesFuelFull.hide();
        this._helpTexts.blockTypesFuelDanger.hide();
        this._helpTexts.blockTypesFuelEmpty.hide();
        this._helpTexts.blockTypesOxygenFull.hide();
        this._helpTexts.blockTypesOxygenDanger.hide();
        this._helpTexts.blockTypesOxygenEmpty.hide();
        this._helpTexts.blockTypesExample.hide();
        this._helpTexts.blockTypesWindSpeed.update('*** Wind Speed: 0.000');
        this._helpTexts.blockTypesWindSpeed.hide();
        this._helpTerrainMeshes.blockTypes[0][0].visible = false;
        this._helpTerrainMeshes.blockTypes[1].forEach(block => {
            block.visible = false;
        });
        this._helpTerrainMeshes.blockTypes[2].forEach(block => {
            block.visible = false;
        });
        this._helpTerrainMeshes.blockTypes[3].forEach(block => {
            block.visible = false;
        });
        this._helpTerrainMeshes.blockTypes[4][0].visible = false;

        // Landing & Leaving
        this._helpTexts.landingLeavingTitle.hide();
        for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart1.length; row++) {
            if (this._helpTerrainMeshes.landingLeavingBasePart1[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart1[row].length; col++) {
                    if (this._helpTerrainMeshes.landingLeavingBasePart1[row][col]) {
                        this._helpTerrainMeshes.landingLeavingBasePart1[row][col].visible = false;
                    }
                }
            }
        }
        for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart2.length; row++) {
            if (this._helpTerrainMeshes.landingLeavingBasePart2[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart2[row].length; col++) {
                    if (this._helpTerrainMeshes.landingLeavingBasePart2[row][col]) {
                        this._helpTerrainMeshes.landingLeavingBasePart2[row][col].visible = false;
                    }
                }
            }
        }
        for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart3.length; row++) {
            if (this._helpTerrainMeshes.landingLeavingBasePart3[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart3[row].length; col++) {
                    if (this._helpTerrainMeshes.landingLeavingBasePart3[row][col]) {
                        this._helpTerrainMeshes.landingLeavingBasePart3[row][col].visible = false;
                    }
                }
            }
        }

        this._helpTexts.landingLeaving4FlatBlocks.hide();
        this._helpTexts.landingLeavingNoGaps.hide();
        this._helpTexts.landingLeavingNoLedges.hide();
        this._helpTexts.landingLeavingPlantBlocks.hide();
        this._helpTexts.landingLeavingWaterBlocks.hide();
        this._helpTexts.landingLeavingIceBlocks.hide();
        this._helpTexts.landingLeavingLeftSafe.hide();
        this._helpTexts.landingLeavingMiddleDanger.hide();
        this._helpTexts.landingLeavingRightDanger.hide();
        this._helpTexts.landingLeavingStillInGame.hide();
        this._helpTexts.landingLeavingEscaped.hide();
        this._helpTexts.landingLeavingEscapeLine.hide();
        this._helpMeshes.lander3.visible = false;
        this._helpMeshes.lander4.visible = false;
        this._helpMeshes.lander5.visible = false;

        if (this._helpActors.landingLeavingExplosion1) {
            this._scene.remove(this._helpActors.landingLeavingExplosion1.getMesh());
            this._helpActors.landingLeavingExplosion1 = null;
        }
        if (this._helpActors.landingLeavingExplosion2) {
            this._scene.remove(this._helpActors.landingLeavingExplosion2.getMesh());
            this._helpActors.landingLeavingExplosion2 = null;
        }

        this._helpActors.mainThruster3.endCycle(HELP_MAIN_THRUSTER_3_POSITION, false);
        this._helpActors.mainThruster4.endCycle(HELP_MAIN_THRUSTER_4_POSITION, false);
        this._helpActors.mainThruster5.endCycle(HELP_MAIN_THRUSTER_5_POSITION, false);

        // Control Panel
        this._helpTexts.controlPanelTitle.hide();
    }

    /**
     * Resizes non-threejs content to the new window size.
     */
    public onWindowResize(height: number, left: number, top: number, width: number): void {
        Object.keys(this._helpTexts)
            .filter(key => !!this._helpTexts[key])
            .forEach(key => this._helpTexts[key].resize({ height, left, top, width }));


        this._helpTexts.landingThresholdHorizontalSpeed.resize({ height, left: (left + width - (0.49 * width)), top: (0.065 * height), width });
        this._helpTexts.landingThresholdVerticalSpeed.resize({ height, left: (left + width - (0.49 * width)), top: (0.065 * height), width });
        this._helpTexts.landingThresholdDanger.resize({ height, left: (left + width - (0.49 * width)), top: (0.08 * height), width });
        this._helpTexts.landingThresholdSafe.resize({ height, left: (left + width - (0.49 * width)), top: (0.08 * height), width });

        this._helpTexts.landingLeavingLeftSafe.resize({ height, left: (left + (0.062 * width)), top: (0.78 * height), width: width });
        this._helpTexts.landingLeavingMiddleDanger.resize({ height, left: (left + (0.195 * width)), top: (0.78 * height), width });
        this._helpTexts.landingLeavingRightDanger.resize({ height, left: (left + (0.3225 * width)), top: (0.78 * height), width });

        this._helpTexts.landingLeavingStillInGame.resize({ height, left: (left + (0.020 * width)), top: (0.78 * height), width: width });
        this._helpTexts.landingLeavingEscaped.resize({ height, left: (left + (0.30 * width)), top: (0.78 * height), width });
        this._helpTexts.landingLeavingEscapeLine.resize({ height, left: (left + (0.020 * width)), top: (0.87 * height), width });

        this._helpTexts.landingLeaving4FlatBlocks.resize({ height, left: (left + (0.059 * width)), top: (0.9745 * height), width });
        this._helpTexts.landingLeavingNoGaps.resize({ height, left: (left + (0.21 * width)), top: (0.9745 * height), width });
        this._helpTexts.landingLeavingNoLedges.resize({ height, left: (left + (0.33 * width)), top: (0.9745 * height), width });

        this._helpTexts.landingLeavingPlantBlocks.resize({ height, left: (left + (0.062 * width)), top: (0.9745 * height), width });
        this._helpTexts.landingLeavingWaterBlocks.resize({ height, left: (left + (0.19 * width)), top: (0.9745 * height), width });
        this._helpTexts.landingLeavingIceBlocks.resize({ height, left: (left + (0.33 * width)), top: (0.9745 * height), width });

        this._helpTexts.blockTypesFuelFull.resize({ height, left: (left + (0.50 * width)), top: (0.69 * height), width });
        this._helpTexts.blockTypesFuelDanger.resize({ height, left: (left + (0.50 * width)), top: (0.69 * height), width });
        this._helpTexts.blockTypesFuelEmpty.resize({ height, left: (left + (0.50 * width)), top: (0.69 * height), width });
        this._helpTexts.blockTypesOxygenFull.resize({ height, left: (left + (0.50 * width)), top: (0.69 * height), width });
        this._helpTexts.blockTypesOxygenDanger.resize({ height, left: (left + (0.50 * width)), top: (0.69 * height), width });
        this._helpTexts.blockTypesOxygenEmpty.resize({ height, left: (left + (0.50 * width)), top: (0.69 * height), width });
        this._helpTexts.blockTypesWindSpeed.resize({ height, left: (left + (0.50 * width)), top: (0.69 * height), width });
        this._helpTexts.blockTypesExample.resize({ height, left: (left + (0.50 * width)), top: (0.69 * height), width });

        this._helpButtons.mineButton.resize({ height, left: left + (0.685 * width), top: height - (0.67 * height), width });
        this._helpButtons.minePressedButton.resize({ height, left: left + (0.685 * width), top: height - (0.67 * height), width });
        this._helpButtons.packUpButton.resize({ height, left: left + (0.663 * width), top: height - (0.67 * height), width });
        this._helpButtons.packUpPressedButton.resize({ height, left: left + (0.663 * width), top: height - (0.67 * height), width });

        this._helpButtons.mineLoadUnloadButton.resize({ height, left: left + (0.19 * width), top: (0.56 * height), width });
        this._helpButtons.loadButton.resize({ height, left: left + (0.19 * width), top: (0.56 * height), width });
        this._helpButtons.loadPressedButton.resize({ height, left: left + (0.19 * width), top: (0.56 * height), width });
        this._helpButtons.unloadButton.resize({ height, left: (left + (0.17 * width)), top: (0.56 * height), width });
        this._helpButtons.unloadPressedButton.resize({ height, left: left + (0.17 * width), top: (0.56 * height), width });
    }

    /**
     * Sets all help content to visible, and to start initialized.
     */
    public show(): void {
        // Shared
        this._helpMeshes.mainBackground.visible = true;
        Object.values(this._helpPanels).forEach(p => p && p.show());

        // Lander Controls
        this._helpMeshes.lander1.visible = true;
        this._helpTexts.landerControlsTitle.show();
        this._helpCounters.thrust = 0;

        // Landing Thresholds
        this._helpMeshes.lander2.visible = true;
        this._helpTexts.landingThresholdsTitle.show();
        for (let row = 0; row < this._helpTerrainMeshes.landingThresholdsGroundSpeed.length; row++) {
            if (this._helpTerrainMeshes.landingThresholdsGroundSpeed[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.landingThresholdsGroundSpeed[row].length; col++) {
                    if (this._helpTerrainMeshes.landingThresholdsGroundSpeed[row][col]) {
                        this._helpTerrainMeshes.landingThresholdsGroundSpeed[row][col].visible = true;
                    }
                }
            }
        }
        this._helpCounters.landingThresholds = 0;

        // Astronaut Controls
        this._helpTexts.astronautControlsTitle.show();
        this._helpCounters.astroWalk = 0;
        this._helpActors.astronauts[1].mesh.visible = true;
        this._helpActors.astronauts[3].mesh.visible = true;
        this._helpActors.astronauts[5].mesh.visible = true;

        // Mining Controls
        this._helpButtons.mineButton.show();
        this._helpMeshes.mouseMining.visible = true;
        this._helpActors.miners[0].mesh.visible = true;
        this._helpActors.miners[1].mesh.visible = true;
        this._helpActors.miners[2].mesh.visible = true;
        this._helpMeshes.keysDownMining.visible = false;
        this._helpMeshes.keysUpMining.visible = false;
        this._helpMeshes.mouseMining.visible = false;
        this._helpMeshes.mouseLeftMining.visible = false;
        this._helpTexts.miningControlsTitle.show();
        this._helpCounters.mining = 0;

        // Load & Unload
        this._helpTexts.loadUnloadTitle.show();
        for (let row = 0; row < this._helpTerrainMeshes.loadUnload.length; row++) {
            if (this._helpTerrainMeshes.loadUnload[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.loadUnload[row].length; col++) {
                    if (this._helpTerrainMeshes.loadUnload[row][col]) {
                        this._helpTerrainMeshes.loadUnload[row][col].visible = true;
                    }
                }
            }
        }
        this._helpMeshes.lander6.visible = true;
        this._helpButtons.unloadButton.show();
        this._helpMeshes.mouseLoadUnload.visible = true;

        // Block Types
        this._helpTexts.blockTypesTitle.show();
        this._helpProfile.show();
        this._helpTexts.blockTypesDialogue.update(dialogues['Fuel'], true);
        this._helpTexts.blockTypesDialogue.show();
        this._helpTexts.blockTypesFuelFull.show();
        this._helpTexts.blockTypesWindSpeed.hide();

        // Landing & Leaving
        this._helpTexts.landingLeavingTitle.show();
        this._helpCounters.landingLeaving = 0;
        this._helpCounters.landingLeavingVerticalSpeed = 0;

        for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart1.length; row++) {
            if (this._helpTerrainMeshes.landingLeavingBasePart1[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart1[row].length; col++) {
                    if (this._helpTerrainMeshes.landingLeavingBasePart1[row][col]) {
                        this._helpTerrainMeshes.landingLeavingBasePart1[row][col].visible = true;
                    }
                }
            }
        }
        for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart2.length; row++) {
            if (this._helpTerrainMeshes.landingLeavingBasePart2[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart2[row].length; col++) {
                    if (this._helpTerrainMeshes.landingLeavingBasePart2[row][col]) {
                        this._helpTerrainMeshes.landingLeavingBasePart2[row][col].visible = false;
                    }
                }
            }
        }
        for (let row = 0; row < this._helpTerrainMeshes.landingLeavingBasePart3.length; row++) {
            if (this._helpTerrainMeshes.landingLeavingBasePart3[row]) {
                for (let col = 0; col < this._helpTerrainMeshes.landingLeavingBasePart3[row].length; col++) {
                    if (this._helpTerrainMeshes.landingLeavingBasePart3[row][col]) {
                        this._helpTerrainMeshes.landingLeavingBasePart3[row][col].visible = false;
                    }
                }
            }
        }

        this._helpMeshes.lander3.position.set(HELP_LANDER_3_POSITION[0], HELP_LANDER_3_POSITION[1], HELP_LANDER_3_POSITION[2]);
        this._helpMeshes.lander4.position.set(HELP_LANDER_4_POSITION[0], HELP_LANDER_4_POSITION[1], HELP_LANDER_4_POSITION[2]);
        this._helpMeshes.lander5.position.set(HELP_LANDER_5_POSITION[0], HELP_LANDER_5_POSITION[1], HELP_LANDER_5_POSITION[2]);

        this._helpActors.mainThruster3.endCycle(HELP_MAIN_THRUSTER_3_POSITION, false);
        this._helpActors.mainThruster4.endCycle(HELP_MAIN_THRUSTER_4_POSITION, false);
        this._helpActors.mainThruster5.endCycle(HELP_MAIN_THRUSTER_5_POSITION, false);

        // Control Panel
        this._helpTexts.controlPanelTitle.show();
    }
}
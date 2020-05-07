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
import { TextBase } from "../../../controls/text/text-base";
import { TextType } from "../../../controls/text/text-type";
import { LeftTopMiddleTitleText } from "../../../controls/text/title/left-top-middle-title-text";
import { LeftTopTitleText } from "../../../controls/text/title/left-top-title-text";
import { RightTopMiddleTitleText } from "../../../controls/text/title/right-top-middle-title-text";

// Buttons
import { ButtonBase } from "../../../controls/buttons/button-base";
import { MineButton } from "../../../controls/buttons/mine-button";
import { PackItUpButton } from "../../../controls/buttons/pack-it-up-button";
import { BUTTON_COLORS, BUTTON_COLORS_INVERSE } from "../../../styles/button-colors";

// Constants and Singletons
import { Actor } from "../../../models/actor";
import { SoundinatorSingleton } from "../../../soundinator";
import { COLORS } from "../../../styles/colors";
import { noOp } from "../../../utils/no-op";
import { RightTopTitleText } from "../../../controls/text/title/right-top-title-text";
import { PlanetLandColors, PlanetSpecifications } from "../../../models/planet-specifications";
import { colorLuminance } from "../../../utils/color-shader";
import { LanderSpecifications } from "../../../models/lander-specifications";
import { RightTopStatsText4 } from "../../../controls/text/stats/right-top-stats-text-4";
import { FreestyleText } from "../../../controls/text/freestyle-text";
import { Explosion } from "../../../weapons/explosion";
import { HTMLElementPosition } from "../../../models/html-element-position";

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
 * Sets the starting position of the top left lander.
 */
const HELP_LANDER_1_POSITION: [number, number, number] = [-2.25, -8, -4];

/**
 * Sets the starting position of the top right lander.
 */
const HELP_LANDER_2_POSITION: [number, number, number] = [2.75, -9, -5];

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
    private _helpActors: { [key: string]: any } = {}

    /**
     * All of the buttons contained in the help screen.
     */
    private _helpButtons: { [key: string]: ButtonBase } = {}

    /**
     * All of the counters, and counter clearing threasholds.
     */
    private _helpCounters: { [key: string]: number } = {
        astroWalk: 0,
        astroWalkClear: 360,
        landingThresholds: 0,
        landingThresholdsClear: 2130,
        landingThresholdsGravity: 0.0005,
        landingThresholdsHorizontalSpeed: 0,
        landingThresholdsVerticalSpeed: 0,
        landingThresholdsFlashOn: 1,
        mining: 0,
        miningClear: 720,
        thrust: 0,
        thrustClear: 360
    }

    /**
     * All of the meshes contained in the help screen.
     */
    private _helpMeshes: { [key: string]: Mesh | Object3D } = {}

    /**
     * All of the terrain-based meshes contained in the help screen.
     */
    private _helpTerrainMeshes: { [key: string]: (Mesh[][] | Object3D[][]) } = {
        landingThresholdsGroundSpeed: [] as Mesh[][] | Object3D[][]
    }

    /**
     * All of the HTML text contained in the help screen.
     */
    private _helpTexts: { [key: string]: TextBase } = {}

    /**
     * All of the background panels contained in the help screen.
     */
    private _helpPanels: { [key: string]: PanelBase } = {}

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
        const keyGeo = new PlaneGeometry( 1.1, 0.4, 10, 10 );

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

        this._buildHelpScreenLandingControls(arrowGeo, arrowMat, keyGeo, keyLeftMat, keyRightMat, keyUpMat, { height, left, top: null, width });
        this._buildHelpScreenThresholds({ height, left, top: null, width });
        this._buildHelpScreenAstronautControls(arrowGeo, arrowMat, keyGeo, keyLeftMat, keyRightMat, { height, left, top: null, width });
        this._buildHelpScreenMiningControls(arrowGeo, arrowMat, keyGeo, keyDownMat, keyUpMat, { height, left, top: null, width });
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
     * Creates everything needed for the Mining Controls panel.
     * @param arrowGeo the geometry used to make all the arrow meshes in this panel
     * @param arrowMat the material used to make all the arrow meshes in this panel
     * @param keyGeo the geometry used to make all the key meshes in this panel
     * @param keyDownMat the material used to make the down keys mesh in this panel
     * @param keyUpMat the material used to make the up keys mesh in this panel
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenMiningControls(
        arrowGeo: PlaneGeometry,
        arrowMat: MeshBasicMaterial,
        keyGeo: PlaneGeometry,
        keyDownMat: MeshBasicMaterial,
        keyUpMat: MeshBasicMaterial,
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
        const mouseGeo = new PlaneGeometry( 0.5, 0.5, 10, 10 );
        const mouseLeftMat = new MeshBasicMaterial();
        mouseLeftMat.map = this._textures.mouseLeft;
        mouseLeftMat.map.minFilter = LinearFilter;
        (mouseLeftMat as any).shininess = 0;
        mouseLeftMat.transparent = true;

        const mouseLeft = new Mesh(mouseGeo, mouseLeftMat);
        mouseLeft.name = 'Mouse Left Mesh Mining';
        mouseLeft.position.set(HELP_LANDER_1_POSITION[0] + 3.73, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 2.25);
        mouseLeft.rotation.set(-1.5708, 0, 0);
        this._scene.add(mouseLeft);
        mouseLeft.visible = false;
        this._helpMeshes.mouseLeftMining = mouseLeft;

        // Mouse Unpressed graphics
        const mouseMat = new MeshBasicMaterial();
        mouseMat.map = this._textures.mouse;
        mouseMat.map.minFilter = LinearFilter;
        (mouseMat as any).shininess = 0;
        mouseMat.transparent = true;

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
     * @param position initial positioning parameters from window size
     */
    private _buildHelpScreenThresholds(position: HTMLElementPosition): void {
        // The ground for landing
        const geo = new PlaneGeometry( 0.1, 0.1, 10, 10 );
        const commonRockMat = new MeshBasicMaterial({
            color: colorLuminance(PlanetLandColors[this._planetSpecifications.planetBase], 6 / 10),
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        for (let row = 27; row < 31; row++) {
            this._helpTerrainMeshes.landingThresholdsGroundSpeed[row] = [];
            for (let col = -0.5; col < 59; col++) {
                const block = new Mesh( geo, commonRockMat );
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
        this._helpCounters.thrust++;

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
     * Calls the next frame in the animation cycle specific to upper-left panel - Landing Controls.
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
        this._helpTexts.landingThresholdHorizontalSpeed.show();
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
    }

    /**
     * Resizes non-threejs content to the new window size.
     */
    public onWindowResize(height: number, left: number, top: number, width: number): void {
        Object.keys(this._helpTexts)
            .filter(key => !!this._helpTexts[key])
            .forEach(key => this._helpTexts[key].resize({ height, left, top, width }));


        this._helpTexts.landingThresholdVerticalSpeed.resize({ height, left: (left + width - (0.49 * width)), top: (0.065 * height), width });
        this._helpTexts.landingThresholdDanger.resize({ height, left: (left + width - (0.49 * width)), top: (0.08 * height), width });
        this._helpTexts.landingThresholdSafe.resize({ height, left: (left + width - (0.49 * width)), top: (0.08 * height), width });

        this._helpButtons.mineButton.resize({ left: left + (0.685 * width), height, top: height - (0.67 * height), width });
        this._helpButtons.minePressedButton.resize({ left: left + (0.685 * width), height, top: height - (0.67 * height), width });
        this._helpButtons.packUpButton.resize({ left: left + (0.663 * width), height, top: height - (0.67 * height), width });
        this._helpButtons.packUpPressedButton.resize({ left: left + (0.663 * width), height, top: height - (0.67 * height), width });
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
    }
}
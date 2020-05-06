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
import { OreTypeColors, PlanetLandColors, PlanetSpecifications } from "../../../models/planet-specifications";
import { colorLuminance } from "../../../utils/color-shader";

/**
 * Border for dev purposes. Normally set to null.
 */
let border: string;

/**
 * Sets the starting position of the top left lander.
 */
const HELP_LANDER_1_POSITION: [number, number, number] = [-2.25, -8, -4];

/**
 * Sets the starting position of the top left main thruster.
 */
const HELP_MAIN_THRUSTER_POSITION: [number, number, number] = [-2.25, -7, -3.7];

/**
 * Sets the starting position of the top left side thrusters.
 */
const HELP_SIDE_THRUSTER_POSITION: [number, number, number] = [-2.25, -7, -4.37];

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
        landingThresholdsClear: 720,
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
     * @param scene ThreeJS scene to add meshes to for help screen.
     * @param textures textures used to make certain meshes in the help screen.
     * @param brdr dev environment brdr set in creating class.
     */
    constructor(scene: Scene, textures: { [key: string]: Texture }, planetSpecifications: PlanetSpecifications, brdr: string) {
        this._scene = scene;
        this._textures = textures;
        this._planetSpecifications = planetSpecifications;
        border = brdr;
        this._buildHelpScreen();
    }


    /**
     * Coordinates the creation of all the help screen content.
     */
    private _buildHelpScreen(): void {
    //#region SHARED RESOURCES SETUP
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

//#endregion
    //#region LANDING CONTROLS SETUP
        // Create lander graphic
        this._helpMeshes.lander1 = createLander(this._textures.ship).mesh;
        this._helpMeshes.lander1.position.set(HELP_LANDER_1_POSITION[0], HELP_LANDER_1_POSITION[1], HELP_LANDER_1_POSITION[2]);
        this._helpMeshes.lander1.visible = false;
        this._helpMeshes.lander1.scale.set(2, 2, 2);
        this._scene.add(this._helpMeshes.lander1);
        this._helpActors.sideThrusterLeft = new SideThruster(this._scene, HELP_SIDE_THRUSTER_POSITION, -1, 1.5);
        this._helpActors.sideThrusterRight = new SideThruster(this._scene, HELP_SIDE_THRUSTER_POSITION, 1, 1.5);
        this._helpActors.mainThruster = new MainThruster(this._scene, HELP_MAIN_THRUSTER_POSITION, 2);

        // Right Arrow graphics
        const arrowGeo = new PlaneGeometry( 0.5, 0.5, 10, 10 );
        const arrowMat = new MeshBasicMaterial();
        arrowMat.map = this._textures.arrow;
        arrowMat.map.minFilter = LinearFilter;
        (arrowMat as any).shininess = 0;
        arrowMat.transparent = true;

        let arrowRight = new Mesh(arrowGeo, arrowMat);
        arrowRight.name = 'Right Arrow Mesh';
        arrowRight.position.set(HELP_LANDER_1_POSITION[0] + 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2]);
        arrowRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(arrowRight);
        arrowRight.visible = false;
        this._helpMeshes.arrowRight = arrowRight;

        // Left Arrow graphics
        arrowMat.map = this._textures.arrow;
        let arrowLeft = new Mesh(arrowGeo, arrowMat);
        arrowLeft.name = 'Left Arrow Mesh';
        arrowLeft.position.set(HELP_LANDER_1_POSITION[0] - 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2]);
        arrowLeft.rotation.set(-1.5708, 0, 3.1416);
        this._scene.add(arrowLeft);
        arrowLeft.visible = false;
        this._helpMeshes.arrowLeft = arrowLeft;

        // Up Arrow graphics
        arrowMat.map = this._textures.arrow;
        let arrowUp = new Mesh(arrowGeo, arrowMat);
        arrowUp.name = 'Up Arrow Mesh';
        arrowUp.position.set(HELP_LANDER_1_POSITION[0], HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] - 1);
        arrowUp.rotation.set(-1.5708, 0, 1.5708);
        this._scene.add(arrowUp);
        arrowUp.visible = false;
        this._helpMeshes.arrowUp = arrowUp;

        // Up Keys graphics
        const keyGeo = new PlaneGeometry( 1.1, 0.4, 10, 10 );
        const keyUpMat = new MeshBasicMaterial();
        keyUpMat.map = this._textures.keysForUp;
        keyUpMat.map.minFilter = LinearFilter;
        (keyUpMat as any).shininess = 0;
        keyUpMat.transparent = true;

        let keyUp = new Mesh(keyGeo, keyUpMat);
        keyUp.name = 'Up Keys Mesh';
        keyUp.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 0.8);
        keyUp.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyUp);
        keyUp.visible = false;
        this._helpMeshes.keysUp = keyUp;

        // Left Keys graphics
        const keyLeftMat = new MeshBasicMaterial();
        keyLeftMat.map = this._textures.keysForLeft;
        keyLeftMat.map.minFilter = LinearFilter;
        (keyLeftMat as any).shininess = 0;
        keyLeftMat.transparent = true;

        let keyLeft = new Mesh(keyGeo, keyLeftMat);
        keyLeft.name = 'Left Keys Mesh';
        keyLeft.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 0.8);
        keyLeft.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyLeft);
        keyLeft.visible = false;
        this._helpMeshes.keysLeft = keyLeft;

        // Right Keys graphics
        const keyRightMat = new MeshBasicMaterial();
        keyRightMat.map = this._textures.keysForRight;
        keyRightMat.map.minFilter = LinearFilter;
        (keyRightMat as any).shininess = 0;
        keyRightMat.transparent = true;

        let keyRight = new Mesh(keyGeo, keyRightMat);
        keyRight.name = 'Right Keys Mesh';
        keyRight.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 0.8);
        keyRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyRight);
        keyRight.visible = false;
        this._helpMeshes.keysRight = keyRight;

        // Lander Text graphics
        this._helpTexts.landerControlsTitle = new LeftTopTitleText(
            'Lander Controls',
            { height, left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.landerControlsTitle.hide();

//#endregion
    //#region THRESHOLDS SETUP
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
                block.position.set((col/10), -8, -6 + row/10);
                block.rotation.set(1.5708, 0, 0);
                block.visible = false;
                this._scene.add(block);
                this._helpTerrainMeshes.landingThresholdsGroundSpeed[row][col + 0.5] = block;
            }
        }

        // Landing Thresholds Text graphics
        this._helpTexts.landingThresholdsTitle = new RightTopTitleText(
            'Landing Thresholds',
            { height, left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.landingThresholdsTitle.hide();
    //#endregion
    //#region ASTRONAUT CONTROLS SETUP
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
        arrowLeft = new Mesh(arrowGeo, arrowMat);
        arrowLeft.name = 'Left Arrow Astro Walk Mesh';
        arrowLeft.position.set(HELP_LANDER_1_POSITION[0] - 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3);
        arrowLeft.rotation.set(-1.5708, 0, 3.1416);
        this._scene.add(arrowLeft);
        arrowLeft.visible = false;
        this._helpMeshes.arrowLeftAstroWalk = arrowLeft;

        // Left Keys graphics
        keyLeft = new Mesh(keyGeo, keyLeftMat);
        keyLeft.name = 'Left Keys Astro Walk Mesh';
        keyLeft.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3.6);
        keyLeft.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyLeft);
        keyLeft.visible = false;
        this._helpMeshes.keysLeftAstroWalk = keyLeft;

        // Right Arrow graphics
        arrowRight = new Mesh(arrowGeo, arrowMat);
        arrowRight.name = 'Right Arrow Astro Walk Mesh';
        arrowRight.position.set(HELP_LANDER_1_POSITION[0] + 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3);
        arrowRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(arrowRight);
        arrowRight.visible = false;
        this._helpMeshes.arrowRightAstroWalk = arrowRight;

        // Right Keys graphics
        keyRight = new Mesh(keyGeo, keyRightMat);
        keyRight.name = 'Right Keys Astro Walk Mesh';
        keyRight.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3.6);
        keyRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyRight);
        keyRight.visible = false;
        this._helpMeshes.keysRightAstroWalk = keyRight;

        // Astronaut Text graphics
        this._helpTexts.astronautControlsTitle = new LeftTopMiddleTitleText(
            'Astronaut Controls',
            { height, left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.astronautControlsTitle.hide();

//#endregion
    //#region MINING CONTROLS SETUP
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
        arrowMat.map = this._textures.arrow;
        arrowUp = new Mesh(arrowGeo, arrowMat);
        arrowUp.name = 'Up Arrow Mesh';
        arrowUp.position.set(HELP_LANDER_1_POSITION[0] + 6, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 2.75);
        arrowUp.rotation.set(-1.5708, 0, 1.5708);
        this._scene.add(arrowUp);
        arrowUp.visible = false;
        this._helpMeshes.arrowUpMining = arrowUp;

        // Down Arrow graphics
        arrowMat.map = this._textures.arrow;
        const arrowDown = new Mesh(arrowGeo, arrowMat);
        arrowDown.name = 'Down Arrow Mesh';
        arrowDown.position.set(HELP_LANDER_1_POSITION[0] + 6, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 2.75);
        arrowDown.rotation.set(-1.5708, 0, -1.5708);
        this._scene.add(arrowDown);
        arrowDown.visible = false;
        this._helpMeshes.arrowDownMining = arrowDown;

        // Up Keys graphics
        keyUp = new Mesh(keyGeo, keyUpMat);
        keyUp.name = 'Up Keys Mesh Mining';
        keyUp.position.set(HELP_LANDER_1_POSITION[0] + 3.35, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3.6);
        keyUp.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyUp);
        keyUp.visible = false;
        this._helpMeshes.keysUpMining = keyUp;

        // Down Keys graphics
        const keyDownMat = new MeshBasicMaterial();
        keyDownMat.map = this._textures.keysForDown;
        keyDownMat.map.minFilter = LinearFilter;
        (keyDownMat as any).shininess = 0;
        keyDownMat.transparent = true;

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
            { left: left + (0.685 * width), height, top: height - (0.67 * height), width },
            BUTTON_COLORS,
            noOp,
            true,
            0.75);
        this._helpButtons.mineButton.hide();

        // Mining Button Pressed graphic
        this._helpButtons.minePressedButton = new MineButton(
            { left: left + (0.685 * width), height, top: height - (0.67 * height), width },
            BUTTON_COLORS_INVERSE,
            noOp,
            true,
            0.75);
        this._helpButtons.minePressedButton.hide();

        // PackItUp Button graphic
        this._helpButtons.packUpButton = new PackItUpButton(
            { left: left + (0.663 * width), height, top: height - (0.67 * height), width },
            BUTTON_COLORS,
            noOp,
            true,
            0.75);
        this._helpButtons.packUpButton.hide();

        // PackItUp Button Pressed graphic
        this._helpButtons.packUpPressedButton = new PackItUpButton(
            { left: left + (0.663 * width), height, top: height - (0.67 * height), width },
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
            { height, left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.miningControlsTitle.hide();

    //#endregion
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

    //#region LANDER CONTROLS SECTION
        // Thruster controls section
        if (this._helpCounters.thrust > this._helpCounters.thrustClear) {
            this._helpCounters.thrust = 0;
        }

        this._helpActors.mainThruster.endCycle(HELP_MAIN_THRUSTER_POSITION, false);
        this._helpActors.sideThrusterLeft.endCycle(HELP_SIDE_THRUSTER_POSITION, false);
        this._helpActors.sideThrusterRight.endCycle(HELP_SIDE_THRUSTER_POSITION, false);
        this._helpMeshes.arrowLeft.visible = false;
        this._helpMeshes.arrowRight.visible = false;
        this._helpMeshes.arrowUp.visible = false;
        this._helpMeshes.keysUp.visible = false;
        this._helpMeshes.keysLeft.visible = false;
        this._helpMeshes.keysRight.visible = false;

        const val = this._helpCounters.thrustClear / 3;
        if (this._helpCounters.thrust < val) {
            this._helpActors.mainThruster.endCycle(HELP_MAIN_THRUSTER_POSITION, true);
            this._helpMeshes.arrowUp.visible = true;
            this._helpMeshes.keysUp.visible = true;
        } else if (this._helpCounters.thrust < (val * 2)) {
            this._helpActors.sideThrusterLeft.endCycle(HELP_SIDE_THRUSTER_POSITION, true);
            this._helpMeshes.arrowRight.visible = true;
            this._helpMeshes.keysRight.visible = true;
        } else {
            this._helpActors.sideThrusterRight.endCycle(HELP_SIDE_THRUSTER_POSITION, true);
            this._helpMeshes.arrowLeft.visible = true;
            this._helpMeshes.keysLeft.visible = true;
        }

//#endregion
    //#region THRESHOLDS SECTION

    //#endregion
    //#region ASTRONAUTS CONTROLS SECTION
        this._helpCounters.thrust++;

        // Astronaut walking section
        if (this._helpCounters.astroWalk > this._helpCounters.astroWalkClear) {
            this._helpCounters.astroWalk = 0;
        }

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

//#endregion
    //#region MINING CONTROLS SECTION
        // Mining section
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
    //#endregion
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
        this._helpActors.sideThrusterLeft.endCycle(HELP_SIDE_THRUSTER_POSITION, false);
        this._helpActors.sideThrusterRight.endCycle(HELP_SIDE_THRUSTER_POSITION, false);
        this._helpActors.mainThruster.endCycle(HELP_MAIN_THRUSTER_POSITION, false);
        this._helpTexts.landerControlsTitle.hide();

        // Landing Thresholds
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
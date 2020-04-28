import {
    DoubleSide,
    LinearFilter,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PlaneGeometry,
    Scene,
    Texture } from "three";

// Local utilities
import { createLander } from "../actors/create-lander";
import { createMiningTeam } from "../actors/create-mining-team";
import { MainThruster } from "../actors/main-thruster";
import { SideThruster } from "../actors/side-thruster";

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

// Constants and Singletons
import { Actor } from "../../../models/actor";
import { SoundinatorSingleton } from "../../../soundinator";
import { COLORS } from "../../../styles/colors";

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
 * @class
 * The help controller class - coordinates everything on the help screen.
 */
export class HelpCtrl {

    /**
     * All of the actors contained in the help screen.
     */
    private _helpActors: { [key: string]: any } = {}

    /**
     * All of the counters, and counter clearing threasholds.
     */
    private _helpCounters: { [key: string]: number } = {
        thrust: 0,
        thrustClear: 360,
        astroWalk: 0,
        astroWalkClear: 360
    }

    /**
     * All of the meshes contained in the help screen.
     */
    private _helpMeshes: { [key: string]: Mesh | Object3D } = {}

    /**
     * All of the HTML text contained in the help screen.
     */
    private _helpTexts: { [key: string]: TextBase } = {}

    /**
     * All of the background panels contained in the help screen.
     */
    private _helpPanels: { [key: string]: PanelBase } = {}

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
    constructor(scene: Scene, textures: { [key: string]: Texture }, brdr: string) {
        this._scene = scene;
        this._textures = textures;
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

        // Upper left lander graphic instructions
        this._helpMeshes.lander1 = createLander(this._textures.ship).mesh;
        this._helpMeshes.lander1.position.set(HELP_LANDER_1_POSITION[0], HELP_LANDER_1_POSITION[1], HELP_LANDER_1_POSITION[2]);
        this._helpMeshes.lander1.visible = false;
        this._helpMeshes.lander1.scale.set(2, 2, 2);
        this._scene.add(this._helpMeshes.lander1);
        this._helpActors.sideThrusterLeft = new SideThruster(this._scene, HELP_SIDE_THRUSTER_POSITION, -1, 1.5);
        this._helpActors.sideThrusterRight = new SideThruster(this._scene, HELP_SIDE_THRUSTER_POSITION, 1, 1.5);
        this._helpActors.mainThruster = new MainThruster(this._scene, HELP_MAIN_THRUSTER_POSITION, 2);

        // Upper left arrows graphic instructions
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

        arrowMat.map = this._textures.arrow;
        let arrowLeft = new Mesh(arrowGeo, arrowMat);
        arrowLeft.name = 'Left Arrow Mesh';
        arrowLeft.position.set(HELP_LANDER_1_POSITION[0] - 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2]);
        arrowLeft.rotation.set(-1.5708, 0, 3.1416);
        this._scene.add(arrowLeft);
        arrowLeft.visible = false;
        this._helpMeshes.arrowLeft = arrowLeft;

        arrowMat.map = this._textures.arrow;
        const arrowUp = new Mesh(arrowGeo, arrowMat);
        arrowUp.name = 'Up Arrow Mesh';
        arrowUp.position.set(HELP_LANDER_1_POSITION[0], HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] - 1);
        arrowUp.rotation.set(-1.5708, 0, 1.5708);
        this._scene.add(arrowUp);
        arrowUp.visible = false;
        this._helpMeshes.arrowUp = arrowUp;

        // Upper left keyboard keys graphic instructions
        const keyGeo = new PlaneGeometry( 1.1, 0.4, 10, 10 );
        const keyUpMat = new MeshBasicMaterial();
        keyUpMat.map = this._textures.keysForUp;
        keyUpMat.map.minFilter = LinearFilter;
        (keyUpMat as any).shininess = 0;
        keyUpMat.transparent = true;

        const keyUp = new Mesh(keyGeo, keyUpMat);
        keyUp.name = 'Up Keys Mesh';
        keyUp.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 0.6);
        keyUp.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyUp);
        keyUp.visible = false;
        this._helpMeshes.keysUp = keyUp;

        const keyLeftMat = new MeshBasicMaterial();
        keyLeftMat.map = this._textures.keysForLeft;
        keyLeftMat.map.minFilter = LinearFilter;
        (keyLeftMat as any).shininess = 0;
        keyLeftMat.transparent = true;

        let keyLeft = new Mesh(keyGeo, keyLeftMat);
        keyLeft.name = 'Left Keys Mesh';
        keyLeft.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 0.6);
        keyLeft.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyLeft);
        keyLeft.visible = false;
        this._helpMeshes.keysLeft = keyLeft;

        const keyRightMat = new MeshBasicMaterial();
        keyRightMat.map = this._textures.keysForRight;
        keyRightMat.map.minFilter = LinearFilter;
        (keyRightMat as any).shininess = 0;
        keyRightMat.transparent = true;

        let keyRight = new Mesh(keyGeo, keyRightMat);
        keyRight.name = 'Right Keys Mesh';
        keyRight.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 0.6);
        keyRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyRight);
        keyRight.visible = false;
        this._helpMeshes.keysRight = keyRight;

        this._helpTexts.landerControlsTitle = new LeftTopTitleText(
            'Lander Controls',
            { height, left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.landerControlsTitle.hide();

        this._helpTexts.miningControlsTitle = new RightTopMiddleTitleText(
            'Mining Controls',
            { height, left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.miningControlsTitle.hide();

        // Create astronaut mining team
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

        arrowLeft = new Mesh(arrowGeo, arrowMat);
        arrowLeft.name = 'Left Arrow Astro Walk Mesh';
        arrowLeft.position.set(HELP_LANDER_1_POSITION[0] - 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3);
        arrowLeft.rotation.set(-1.5708, 0, 3.1416);
        this._scene.add(arrowLeft);
        arrowLeft.visible = false;
        this._helpMeshes.arrowLeftAstroWalk = arrowLeft;

        keyLeft = new Mesh(keyGeo, keyLeftMat);
        keyLeft.name = 'Left Keys Astro Walk Mesh';
        keyLeft.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3.6);
        keyLeft.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyLeft);
        keyLeft.visible = false;
        this._helpMeshes.keysLeftAstroWalk = keyLeft;

        arrowRight = new Mesh(arrowGeo, arrowMat);
        arrowRight.name = 'Right Arrow Astro Walk Mesh';
        arrowRight.position.set(HELP_LANDER_1_POSITION[0] + 0.85, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3);
        arrowRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(arrowRight);
        arrowRight.visible = false;
        this._helpMeshes.arrowRightAstroWalk = arrowRight;

        keyRight = new Mesh(keyGeo, keyRightMat);
        keyRight.name = 'Right Keys Astro Walk Mesh';
        keyRight.position.set(HELP_LANDER_1_POSITION[0] - 2.5, HELP_LANDER_1_POSITION[1] - 1, HELP_LANDER_1_POSITION[2] + 3.6);
        keyRight.rotation.set(-1.5708, 0, 0);
        this._scene.add(keyRight);
        keyRight.visible = false;
        this._helpMeshes.keysRightAstroWalk = keyRight;

        this._helpTexts.astronautControlsTitle = new LeftTopMiddleTitleText(
            'Astronaut Controls',
            { height, left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);
        this._helpTexts.astronautControlsTitle.hide();
    }

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
    }

    /**
     * Sets all help content to be hidden.
     */
    public hide(): void {
        this._helpMeshes.mainBackground.visible = false;
        this._helpMeshes.lander1.visible = false;
        this._helpMeshes.arrowLeft.visible = false;
        this._helpMeshes.arrowRight.visible = false;
        this._helpMeshes.arrowUp.visible = false;
        this._helpMeshes.keysUp.visible = false;
        this._helpMeshes.keysLeft.visible = false;
        this._helpMeshes.keysRight.visible = false;
        this._helpMeshes.arrowLeftAstroWalk.visible = false;
        this._helpMeshes.arrowRightAstroWalk.visible = false;
        this._helpMeshes.keysLeftAstroWalk.visible = false;
        this._helpMeshes.keysRightAstroWalk.visible = false;
        this._helpTexts.landerControlsTitle.hide();
        this._helpTexts.miningControlsTitle.hide();
        this._helpTexts.astronautControlsTitle.hide();
        this._helpActors.astronauts.filter((astro: Actor) => !!astro).forEach((astro: Actor) => {
            astro.mesh.visible = false;
        });
        this._helpActors.sideThrusterLeft.endCycle(HELP_SIDE_THRUSTER_POSITION, false);
        this._helpActors.sideThrusterRight.endCycle(HELP_SIDE_THRUSTER_POSITION, false);
        this._helpActors.mainThruster.endCycle(HELP_MAIN_THRUSTER_POSITION, false);
        Object.values(this._helpPanels).forEach(p => p && p.hide());
    }

    /**
     * Resizes non-threejs content to the new window size.
     */
    public onWindowResize(height: number, left: number, top: number, width: number): void {
        Object.keys(this._helpTexts)
            .filter(key => !!this._helpTexts[key])
            .forEach(key => this._helpTexts[key].resize({ height, left, top, width }));
    }

    /**
     * Sets all help content to visible, and to start initialized.
     */
    public show(): void {
        this._helpMeshes.mainBackground.visible = true;
        this._helpMeshes.lander1.visible = true;
        this._helpTexts.landerControlsTitle.show();
        this._helpTexts.miningControlsTitle.show();
        this._helpTexts.astronautControlsTitle.show();
        this._helpCounters.thrust = 0;
        this._helpCounters.astroWalk = 0;
        this._helpActors.astronauts[1].mesh.visible = true;
        this._helpActors.astronauts[3].mesh.visible = true;
        this._helpActors.astronauts[5].mesh.visible = true;
        Object.values(this._helpPanels).forEach(p => p && p.show());
    }
}
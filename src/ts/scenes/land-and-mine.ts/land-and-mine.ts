import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PlaneGeometry,
    Scene,
    Texture,
    Object3D,
    OrthographicCamera,
    Vector3,
    LinearFilter} from 'three';

import { SoundinatorSingleton } from '../../soundinator';
import { Actor } from '../../models/actor';
import { SceneType } from '../../models/scene-type';
import { getIntersections } from '../../utils/get-intersections';
import { ButtonBase } from '../../controls/buttons/button-base';
import { TextBase } from '../../controls/text/text-base';
import { createLander } from './actors/create-lander';
import { PlanetSpecifications, OreTypeColors, SkyColors, PlanetLandColors, OreTypes, OreQuantity } from '../../models/planet-specifications';
import { MainThruster } from './actors/main-thruster';
import { LeftTopStatsText1 } from '../../controls/text/stats/left-top-stats-text-1';
import { COLORS } from '../../styles/colors';
import { TextType } from '../../controls/text/text-type';
import { LeftTopStatsText2 } from '../../controls/text/stats/left-top-stats-text-2';
import { LeftTopStatsText3 } from '../../controls/text/stats/left-top-stats-text-3';
import { LeftTopStatsText4 } from '../../controls/text/stats/left-top-stats-text-4';
import { SideThruster } from './actors/side-thruster';
import { Explosion } from '../../weapons/explosion';
import { colorLuminance } from '../../utils/color-shader';
import { createWindParticles } from './actors/create-wind-particles';
import { StartButton } from '../../controls/buttons/start-button';
import { BUTTON_COLORS } from '../../styles/button-colors';
import { UnloadButton } from '../../controls/buttons/unload-button';
import { createMiningTeam } from './actors/create-mining-team';
import { LoadButton } from '../../controls/buttons/load-button';
import { MineButton } from '../../controls/buttons/mine-button';
import { PackItUpButton } from '../../controls/buttons/pack-it-up-button';
import { LanderSpecifications } from '../../models/lander-specifications';
import { RightTopStatsText1 } from '../../controls/text/stats/right-top-stats-text-1';
import { RightTopStatsText2 } from '../../controls/text/stats/right-top-stats-text-2';
import { RightTopStatsText3 } from '../../controls/text/stats/right-top-stats-text-3';
import { RightTopStatsText4 } from '../../controls/text/stats/right-top-stats-text-4';
import { LeftTopStatsCol2Text1 } from '../../controls/text/stats/left-top-stats-col2-text-1';
import { LeftTopStatsCol2Text2 } from '../../controls/text/stats/left-top-stats-col2-text-2';
import { LeftTopStatsCol2Text3 } from '../../controls/text/stats/left-top-stats-col2-text-3';
import { LeftTopStatsCol2Text4 } from '../../controls/text/stats/left-top-stats-col2-text-4';
import { RightTopStatsCol3Text1 } from '../../controls/text/stats/right-top-stats-col3-text-1';
import { RightTopStatsCol3Text2 } from '../../controls/text/stats/right-top-stats-col3-text-2';
import { RightTopStatsCol3Text3 } from '../../controls/text/stats/right-top-stats-col3-text-3';
import { RightTopStatsCol3Text4 } from '../../controls/text/stats/right-top-stats-col3-text-4';
import { MineCountText } from './custom-controls/mine-count-text';
import { ControlPanel } from '../../controls/panels/control-panel';
import { RightTopPanel } from '../../controls/panels/right-top-panel';
import { LeftTopPanel } from '../../controls/panels/left-top-panel';
import { RightTopMiddlePanel } from '../../controls/panels/right-top-middle-panel';
import { LeftTopMiddlePanel } from '../../controls/panels/left-top-middle-panel';
import { RightBottomMiddlePanel } from '../../controls/panels/right-bottom-middle-panel';
import { LeftBottomMiddlePanel } from '../../controls/panels/left-bottom-middle-panel';
import { LeftBottomPanel } from '../../controls/panels/left-bottom-panel';
import { RightBottomPanel } from '../../controls/panels/right-bottom-panel';
import { PanelBase } from '../../controls/panels/panel-base';
import { LeftTopTitleText } from '../../controls/text/title/left-top-title-text';
import { RightTopMiddleTitleText } from '../../controls/text/title/right-top-middle-title-text';
import { LeftTopMiddleTitleText } from '../../controls/text/title/left-top-middle-title-text';

/*
 * Grid Values
 * 00: Empty space/sky. Null values
 * 01: Escape Zone. Contact means exit
 * 02: Escape Zone Line. Ship Bottom must be above.
 * 03: Water or ice
 * 04: Mined Block.
 * 05: Ore type
 * 06: Common Rock
 * 07: Danger square: lava, acid, explosive gas, etc.
 * 08: Life (plants mostly)
 */

// const border: string = '1px solid #FFF';
const border: string = 'none';

const HORIZONTAL_THRUST: number = 0.0001;

const SIDE_THRUSTER_Y_OFFSET: number = 5;

const SIDE_THRUSTER_Z_OFFSET: number = -0.17;

const MAIN_THRUSTER_Y_OFFSET: number = 5;

const MAIN_THRUSTER_Z_OFFSET: number = 0.16;

const VERTICAL_THRUST: number = 0.0002;

const HELP_LANDER_1_POSITION: [number, number, number] = [-2.25, -8, -4];

const HELP_MAIN_THRUSTER_POSITION: [number, number, number] = [-2.25, -7, -3.7];

const HELP_SIDE_THRUSTER_POSITION: [number, number, number] = [-2.25, -7, -4.37];

export enum LandAndMineState {
    'crashed' = 0,
    'escaped' = 1,
    'flying' = 2,
    'landed' = 3,
    'paused' = 4,
    'walkingByLander' = 5,
    'walkingAwayFromLander' = 6,
    'mining' = 7,
    'suffocating' = 8,
    'newGame' = 9,
    'tutorial' = 10
}

/**
 * @class
 * Screen dedicated to landing the lander on planetary surface to mine.
 */
export class LandAndMine {
    /**
     * List of actors in the scene.
     */
    private _actors: Actor[] = [];

    private _astronauts: Actor[] = [];

    /**
     * List of buttons
     */
    private _buttons: { [key: string]: ButtonBase } = {
        loadButton: null,
        mineButton: null,
        packUp: null,
        startButton: null,
        unloadButton: null
    };

    private _camera: OrthographicCamera;

    private _controlPanel: ControlPanel;

    private _counters: { [key: string]: number } = {
        astronautWalkingCounter: 0,
        astronautWalkingCounterClear: 10,
        suffocatingCounter: -1,
        suffocatingCounterClear: 99
    };

    private _currentFuelLevel: number = 100;

    private _currentLanderHorizontalSpeed: number = 0.01;

    private _currentLanderVerticalSpeed: number = 0.001;

    private _currentOxygenLevel: number = 100;

    private _drillBits: Mesh[] = [];

    private _explosion: Explosion = null;

    private _grid: number[][] = [];

    private _helpActors: { [key: string]: any } = {}

    private _helpCounters: { [key: string]: number } = {
        thrust: 0,
        thrustClear: 360,
        astroWalk: 0,
        astroWalkClear: 360
    }

    private _helpMeshes: { [key: string]: Mesh | Object3D } = {}

    private _helpTexts: { [key: string]: TextBase } = {}

    private _helpPanels: { [key: string]: PanelBase } = {}

    private _isDrillingDown: boolean = false;

    private _isDrillingUp: boolean = false;

    private _isLeftThrusting: boolean = false;

    private _isMiningTeamMovingLeft: boolean = false;

    private _isMiningTeamMovingRight: boolean = false;

    private _isRightThrusting: boolean = false;

    private _isVerticalThrusting: boolean = false;

    private _lander: Actor;

    private _landerSpecifications: LanderSpecifications;

    private _leftThruster: SideThruster;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    private _loot: { [key: number]: number } = {};

    private _mainThruster: MainThruster;

    private _meshGrid: Mesh[][] = [];

    private _mineCollectCount: number;

    private _mineTextTimeoutId: any;

    private _planetSpecifications: PlanetSpecifications;

    private _rightThruster: SideThruster;

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    private _state: LandAndMineState = LandAndMineState.newGame;

    private _stateStoredObjects: (ButtonBase | TextBase)[] = [];

    /**
     * Groups of text elements
     */
    private _textElements: { [key: string]: TextBase } = { };

    private _textures: { [key: string]: Texture } = {};

    private _windParticles: Mesh[] = [];

    /**
     * Constructor for the Land and Mine (Scene) class
     * @param scene                     graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param textures                  all the needed textures for land and mine.
     * @param planetSpecifications      details about the planet used to operate the scene.
     * @param landerSpecifications      details about the lander used to operate the lander module and its mining crew.
     */
    constructor(
        scene: SceneType,
        textures: { [key: string]: Texture },
        planetSpecifications: PlanetSpecifications,
        landerSpecifications: LanderSpecifications) {

        this._camera = scene.camera as OrthographicCamera;
        this._scene = scene.scene;
        this._textures = textures;
        this._planetSpecifications = planetSpecifications;
        this._landerSpecifications = landerSpecifications;
        this._loot[planetSpecifications.ore] = 0;
        this._loot[-3] = 0; // -3 is the lander itself
        this._loot[-2] = 0; // -2 is surviving crew members
        this._loot[-1] = 0; // -1 is food
        this._loot[0] = 0; // 0 is water
        this._loot[this._planetSpecifications.ore] = 0; // this._planetSpecifications.ore is ore
        this._mineCollectCount = planetSpecifications.oreQuantity * 20;

        // Choose random surface starting point.
        let startY = Math.floor((Math.random() / 2) * 100) + 20
        startY = startY <= 50 ? startY : 50;

        // Grid values
        this._buildTerrain(startY);
        this._buildSky();
        this._waterFlow();
        this._enforceMinLanding(startY);

        if (this._planetSpecifications.wind) {
            this._createWind();
        }

        // Mesh Values
        this._createEnvironmentMeshes();

        // Text, Button, and Event Listeners
        this._onInitialize(scene);
        this._listenerRef = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._listenerRef, false);

        // Create lander module
        const lander = createLander(this._textures.ship);
        this._lander = lander;
        this._actors.push(lander);
        this._scene.add(lander.mesh);
        // Create lander module thrusters
        const currPos = this._lander.mesh.position;
        this._mainThruster = new MainThruster(this._scene, [currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET]);
        this._leftThruster = new SideThruster(this._scene, [currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], -1);
        this._rightThruster = new SideThruster(this._scene, [currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], 1);
        // Create astronaut mining team
        this._astronauts = createMiningTeam(
            {
                astronaut1: textures.astronaut1,
                astronaut2: textures.astronaut2,
                astronaut3: textures.astronaut3,
                astronautSuffocation1: textures.astronautSuffocation1,
                astronautSuffocation2: textures.astronautSuffocation2,
                astronautSuffocation3: textures.astronautSuffocation3,
                astronautSuffocation4: textures.astronautSuffocation4,
                astronautSuffocation5: textures.astronautSuffocation5
            },
            {
                miningEquipment1: textures.miningEquipment1,
                miningEquipment2: textures.miningEquipment2
            });
        this._astronauts.filter(astro => !!astro).forEach(astro => {
            this._scene.add(astro.mesh);
            astro.mesh.visible = false;
        });

        this._buildHelpScreen();
    }

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

    private _buildSky(): void {
        for (let row = 120; row > 110; row--) {
            for (let col = 0; col < 121; col++) {
                this._grid[row][col] = 1;
            }
        }

        for (let col = 0; col < 121; col++) {
            this._grid[110][col] = 2;
        }

        for (let row = 109; row >= 0; row--) {
            for (let col = 0; col < 121; col++) {
                if (!this._grid[row][col]) {
                    this._grid[row][col] = 0;
                }
            }
        }
    }

    private _buildTerrain(startY: number): void {
        for (let i = 0; i < 121; i++) {
            this._grid[i] = [];
        }

        this._grid[startY][0] = 6;
        this._downPopulate(0, startY);
        let lastY = startY;
        for (let col = 1; col < 121; col++) {            const cantAscend = (lastY - startY) >= this._planetSpecifications.peakElevation;
            const cantDescend = (startY - lastY) >= this._planetSpecifications.peakElevation;
            const isWater = this._planetSpecifications.hasWater && Math.random() < 0.05;
            const isLife = this._planetSpecifications.isLife && Math.random() < 0.40;
            const elevRando = Math.floor(Math.random() * 100);
            if (!cantAscend && elevRando <= (25 + this._planetSpecifications.peakElevation)) { // Elevate
                this._grid[lastY + 1][col] = isLife ? 8 : 6;
                lastY++;
            } else if (!cantDescend && elevRando >= (76 - this._planetSpecifications.peakElevation)) { // Descend
                this._grid[lastY - 1][col] = isLife ? 8 : 6;
                lastY--;
            } else { // Level out
                this._grid[lastY][col] = isLife ? 8 : 6;
            }

            if (isWater) {
                this._grid[lastY][col] = 3;
            }
            this._downPopulate(col, lastY, isWater);
        }
    }

    private _crashedEffects(currPos: Vector3, landerCol: number, landerRow: number): void {
        this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);
        this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        this._state = LandAndMineState.crashed;
        this._explosion = new Explosion(this._scene, currPos.x, currPos.z, 0.3, false, 14);
        SoundinatorSingleton.playExplosionSmall();
        setTimeout(() => this._destroyTiles(landerCol, landerRow), 900);
    }

    private _createEnvironmentMeshes(): void {
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
        const escapeLineMat = new MeshBasicMaterial({
            color: 0x008080,
            opacity: 0.5,
            transparent: true,
            side: DoubleSide
        });
        const oreTypeMat = new MeshBasicMaterial({
            color: OreTypeColors[this._planetSpecifications.ore],
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
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

        const dangerMat = new MeshBasicMaterial({
            color: 0xFF0000,
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

        const geo = new PlaneGeometry( 0.1, 0.1, 10, 10 );

        for (let row = 0; row < this._grid.length; row++) {
            this._meshGrid[row] = [];
            for (let col = 0; col < this._grid[row].length; col++) {
                let material;
                if (!this._grid[row][col]) {
                    material = skyMats[Math.floor(row / 10) % 9];
                }
                if (this._grid[row][col] === 1) {
                    // Exit space
                    continue;
                } else if (this._grid[row][col] === 2) {
                    material = escapeLineMat;
                } else if (this._grid[row][col] === 3) {
                    material = waterMat;
                } else if (this._grid[row][col] === 4) {
                    // Mined Block
                } else if (this._grid[row][col] === 5) {
                    material = oreTypeMat;
                } else if (this._grid[row][col] === 6) {
                    material = commonRockMats[Math.floor(row / 10) % 7];
                } else if (this._grid[row][col] === 7) {
                    material = dangerMat;
                } else if (this._grid[row][col] === 8) {
                    material = lifeMats[Math.floor(row / 10) % 5];
                }

                const block = new Mesh( geo, material );
                block.name = `${Math.random()} - ground - `;
                block.position.set(-6 + (col/10), 15, 6 - row/10);
                block.rotation.set(1.5708, 0, 0);
                this._scene.add(block);
                this._meshGrid[row][col] = block;
            }
        }

        this._freezeWater(iceMat);

        // Creates the 7 shades of common rocks for demo display in top center of screen.
        for (let x = 58; x < 65; x++) {
            const index = x - 58;
            const block = new Mesh( geo, commonRockMats[index] );
            block.name = `${Math.random()} - demo - common rocks - ${index} - `;
            block.position.set(-6 + (x/10) + (0.05 * index), 15, 6 - 118/10 - 0.05);
            block.rotation.set(1.5708, 0, 0);
            this._scene.add(block);
            this._meshGrid[118][x] = block;
        }

        // Creates the 1 danger/impenetrable block for demo display in top center of screen.
        const dangerBlock = new Mesh( geo, dangerMat );
        dangerBlock.name = `${Math.random()} - demo - danger block - `;
        dangerBlock.position.set(-6 + (58/10), 15, 6 - 116/10);
        dangerBlock.rotation.set(1.5708, 0, 0);
        this._scene.add(dangerBlock);
        this._meshGrid[116][58] = dangerBlock;

        // Creates the 1 water and 1 ice block for demo display in top center of screen.
        const waterBlock = new Mesh( geo, waterMat );
        waterBlock.name = `${Math.random()} - demo - water block - `;
        waterBlock.position.set(-6 + (58/10), 15, 6 - 114/10 + 0.05);
        waterBlock.rotation.set(1.5708, 0, 0);
        this._scene.add(waterBlock);
        this._meshGrid[114][58] = waterBlock;
        const innerWaterGeo = new PlaneGeometry( 0.05, 0.05, 10, 10 );
        const iceBlock = new Mesh( geo, iceMat );
        iceBlock.name = `${Math.random()} - demo - ice block outer - `;
        iceBlock.position.set(-6 + (59/10) + 0.05, 15.5, 6 - 114/10 + 0.05);
        iceBlock.rotation.set(1.5708, 0, 0);
        this._scene.add(iceBlock);
        this._meshGrid[114][59] = iceBlock;
        const frozenWater = new Mesh( innerWaterGeo, waterMat );
        frozenWater.name = `${Math.random()} - demo - ice block inner - `;
        frozenWater.position.set(-6 + (59/10) + 0.05, 15, 6 - 114/10 + 0.05);
        frozenWater.rotation.set(1.5708, 0, 0);
        this._scene.add(frozenWater);
        this._meshGrid[114][59] = frozenWater;

        // Creates the 5 shades of plant/food blocks for demo display in top center of screen.
        for (let y = 61; y < 66; y++) {
            const index = y - 61;
            const block = new Mesh( geo, lifeMats[index] );
            block.name = `${Math.random()} - demo - food - ${index} - `;
            block.position.set(-6 + (y/10) + (0.05 * index), 15, 6 - 114/10 + 0.05);
            block.rotation.set(1.5708, 0, 0);
            this._scene.add(block);
            this._meshGrid[114][y] = block;
        }

        // Creates the 1 collectable ore block for demo display in top center of screen.
        const oreBlock = new Mesh( geo, oreTypeMat );
        oreBlock.name = `${Math.random()} - demo - ore block - `;
        oreBlock.position.set(-6 + (58/10), 15, 6 - 111/10 - 0.025);
        oreBlock.rotation.set(1.5708, 0, 0);
        this._scene.add(oreBlock);
        this._meshGrid[111][58] = oreBlock;
    }

    private _createWind(): void {
        this._windParticles = createWindParticles(this._scene, '#000000');
    }

    private _destroyTiles(col: number, row: number): void {
        const left = col !== 0 ? col - 1 : 120;
        const right = col !== 120 ? col + 1 : 0;
        const destroyedTiles = [
            [row + 3, col],
            [row + 3, left],
            [row + 3, right],
            [row + 3, left !== 0 ? left - 1 : 120],
            [row + 3, right !== 120 ? right + 1 : 0],
            [row + 3, left !== 1 ? left - 2 : 120],
            [row + 3, right !== 119 ? right + 2 : 0],
            [row + 2, col],
            [row + 2, left],
            [row + 2, right],
            [row + 2, left !== 0 ? left - 1 : 120],
            [row + 2, right !== 120 ? right + 1 : 0],
            [row + 2, left !== 1 ? left - 2 : 120],
            [row + 2, right !== 119 ? right + 2 : 0],
            [row + 2, left !== 2 ? left - 3 : 120],
            [row + 2, right !== 118 ? right + 3 : 0],
            [row + 1, col],
            [row + 1, left],
            [row + 1, right],
            [row + 1, left !== 0 ? left - 1 : 120],
            [row + 1, right !== 120 ? right + 1 : 0],
            [row + 1, left !== 1 ? left - 2 : 120],
            [row + 1, right !== 119 ? right + 2 : 0],
            [row + 1, left !== 2 ? left - 3 : 120],
            [row + 1, right !== 118 ? right + 3 : 0],
            [row + 1, left !== 3 ? left - 4 : 120],
            [row + 1, right !== 117 ? right + 4 : 0],
            [row, col],
            [row, left],
            [row, right],
            [row, left !== 0 ? left - 1 : 120],
            [row, right !== 120 ? right + 1 : 0],
            [row, left !== 1 ? left - 2 : 120],
            [row, right !== 119 ? right + 2 : 0],
            [row, left !== 2 ? left - 3 : 120],
            [row, right !== 118 ? right + 3 : 0],
            [row, left !== 3 ? left - 4 : 120],
            [row, right !== 117 ? right + 4 : 0],
            [row - 1, col],
            [row - 1, left],
            [row - 1, right],
            [row - 1, left !== 0 ? left - 1 : 120],
            [row - 1, right !== 120 ? right + 1 : 0],
            [row - 1, left !== 1 ? left - 2 : 120],
            [row - 1, right !== 119 ? right + 2 : 0],
            [row - 1, left !== 2 ? left - 3 : 120],
            [row - 1, right !== 118 ? right + 3 : 0],
            [row - 2, col],
            [row - 2, left],
            [row - 2, right],
            [row - 2, left !== 0 ? left - 1 : 120],
            [row - 2, right !== 120 ? right + 1 : 0],
            [row - 2, left !== 1 ? left - 2 : 120],
            [row - 2, right !== 119 ? right + 2 : 0],
            [row - 3, col],
            [row - 3, left],
            [row - 3, right],
            [row - 3, left !== 0 ? left - 1 : 120],
            [row - 3, right !== 120 ? right + 1 : 0],
            [row - 4, col],
            [row - 4, left],
            [row - 4, right]
        ];
        destroyedTiles.forEach(tile => {
            if (this._grid[tile[0]][tile[1]] > 2) {
                this._meshGrid[tile[0]][tile[1]] && this._scene.remove(this._meshGrid[tile[0]][tile[1]]);
                this._grid[tile[0]][tile[1]] = 0;
                this._meshGrid[tile[0]][tile[1]] = null;
            }
        });
    }

    private _disableAllButtons(): void {
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].disable());
    }

    private _enableAllButtons(): void {
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].enable());
    }

    private _downPopulate(x: number, y: number, isWater?: boolean): void {
        let waterAbove = isWater;
        for (let row = y - 1; row >= 0; row--) {
            // Prefilled water tile.
            if (this._grid[row][x]) {
                continue;
            }

            const randomTileCheck = Math.random() * 100;
            const waterTileCheck = Math.random() * 100;
            if (waterAbove && waterTileCheck < 80) {
                this._grid[row][x] = 3;
                this._sidePopulate(x - 1, row, -1);
                this._sidePopulate(x + 1, row, 1);
            } else if (randomTileCheck < 0.5) {
                this._grid[row][x] = 7;
                waterAbove = false;
            } else if (randomTileCheck < this._planetSpecifications.oreQuantity) {
                this._grid[row][x] = 5;
                waterAbove = false;
            } else {
                this._grid[row][x] = 6;
                waterAbove = false;
            }
        }
    }

    private _enforceMinLanding(startY: number): void {
        let prevY = startY;
        let count = 1;
        let hasLanding = false;
        for (let col = 1; col < 121; col++) {
            const tile = this._grid[prevY][col];
            // If current tile is water, can't be a landing.
            if (tile === 3) {
                count = 0;
                continue;
            // If current tile is empty, reset landing, and drop the row level.
            } else if (tile < 3) {
                prevY--;
                count = 0;
            // If current tile is solid and tile above is not, add to landing.
            } else if (this._grid[prevY + 1][col] < 3) {
                count++;
            } else {
                prevY++;
                count = 0;
            }
            if (count >= 4) {
                hasLanding = true;
                break;
            }
        }

        if (!hasLanding) {
            const chosenCol = Math.floor(Math.random() * 117);
            let chosenRow;
            for (let row = 109; row > 0; row--) {
                if (this._grid[row][chosenCol] >= 3) {
                    chosenRow = row;
                    break;
                }
            }
            for (let col = chosenCol; col < chosenCol + 4; col++) {
                for (let row = 109; row > chosenRow; row--) {
                    this._grid[row][col] = 0;
                }
                this._grid[chosenRow][col] = 6;
            }
        }
    }

    private _freezeWater(iceMat: MeshBasicMaterial): void {
        if (!this._planetSpecifications.isFrozen) {
            return;
        }

        const outerGeo = new PlaneGeometry( 0.1, 0.1, 10, 10 );

        const innerGeo = new PlaneGeometry( 0.05, 0.05, 10, 10 );
        const waterMat = new MeshBasicMaterial({
            color: 0x006FCE,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });

        for (let col = 0; col < 121; col++) {
            for (let row = 109; row > 0; row--) {
                if (this._grid[row][col] === 3) {
                    // Remove water block
                    this._meshGrid[row][col] && this._scene.remove(this._meshGrid[row][col]);
                    this._meshGrid[row][col] = null;

                    const iceBlock = new Object3D();
                    // Ice border
                    let block = new Mesh( outerGeo, iceMat );
                    block.name = `${Math.random()} - ground - `;
                    block.position.set(-6 + (col/10), 15.5, 6 - row/10);
                    block.rotation.set(1.5708, 0, 0);
                    iceBlock.add(block);
                    // Watery center
                    block = new Mesh( innerGeo, waterMat );
                    block.name = `${Math.random()} - ground - `;
                    block.position.set(-6 + (col/10), 15, 6 - row/10);
                    block.rotation.set(1.5708, 0, 0);
                    iceBlock.add(block);

                    // Place new ice block in mesh grid
                    this._scene.add(iceBlock);
                    this._meshGrid[row][col] = iceBlock as Mesh;
                    break;
                } else if (this._grid[row][col] > 3) {
                    break;
                }
            }
        }
    }

    /**
     * Creates all of the html elements for the first time on scene creation.
     */
    private _onInitialize(sceneType: SceneType): void {
        // DOM Events
        const container = document.getElementById('mainview');
        document.oncontextmenu = event => {
            return false;
        };
        document.onclick = event => {
            event.preventDefault();
            // Three JS object intersections.
            getIntersections(event, container, sceneType).forEach(el => {

            });
        };
        document.onmousemove = event => {

        };
        document.onkeydown = event => {
            if (this._state === LandAndMineState.flying || this._state === LandAndMineState.landed) {
                if (event.keyCode === 87 || event.keyCode === 38) {
                    this._isVerticalThrusting = true;
                    return;
                } else if (event.keyCode === 65 || event.keyCode === 37) {
                    this._isLeftThrusting = true;
                    return;
                } else if (event.keyCode === 68 || event.keyCode === 39) {
                    this._isRightThrusting = true;
                    return;
                }
            } else if (this._state === LandAndMineState.walkingByLander || this._state === LandAndMineState.walkingAwayFromLander) {
                if (event.keyCode === 65 || event.keyCode === 37) {
                    this._isMiningTeamMovingLeft = true;

                    if (!SoundinatorSingleton.isPlaying('walkingFastGravel')) {
                        SoundinatorSingleton.playWalkingFastGravel();
                    }

                    return;
                } else if (event.keyCode === 68 || event.keyCode === 39) {
                    this._isMiningTeamMovingRight = true;

                    if (!SoundinatorSingleton.isPlaying('walkingFastGravel')) {
                        SoundinatorSingleton.playWalkingFastGravel();
                    }

                    return;
                }
            } else if (this._state === LandAndMineState.mining) {
                if (event.keyCode === 87 || event.keyCode === 38) {
                    this._isDrillingUp = true;
                    return;
                } else if (event.keyCode === 83 || event.keyCode === 40) {
                    this._isDrillingDown = true;
                    return;
                }
            }
        };
        document.onkeyup = event => {
            if (this._state === LandAndMineState.flying || this._state === LandAndMineState.landed) {
                if (event.keyCode === 87 || event.keyCode === 38) {
                    this._isVerticalThrusting = false;
                    return;
                } else if (event.keyCode === 65 || event.keyCode === 37) {
                    this._isLeftThrusting = false;
                    return;
                } else if (event.keyCode === 68 || event.keyCode === 39) {
                    this._isRightThrusting = false;
                    return;
                }
            } else if (this._state === LandAndMineState.walkingByLander || this._state === LandAndMineState.walkingAwayFromLander) {
                let newPos;
                if (event.keyCode === 65 || event.keyCode === 37) {
                    SoundinatorSingleton.stopWalkingFastGravel();
                    newPos = this._getMiningTeamsPositions(true, false);
                    this._isMiningTeamMovingLeft = false;
                    this._counters.astronautWalkingCounter = 0;
                    this._astronauts[0].mesh.visible = true;
                    this._astronauts[3].mesh.visible = false;
                    this._astronauts[6].mesh.visible = false;
                    this._astronauts[2].mesh.visible = true;
                    this._astronauts[5].mesh.visible = false;
                    this._astronauts[6].mesh.visible = false;
                } else if (event.keyCode === 68 || event.keyCode === 39) {
                    SoundinatorSingleton.stopWalkingFastGravel();
                    newPos = this._getMiningTeamsPositions(false, true);
                    this._isMiningTeamMovingRight = false;
                    this._counters.astronautWalkingCounter = 0;
                    this._astronauts[0].mesh.visible = true;
                    this._astronauts[3].mesh.visible = false;
                    this._astronauts[6].mesh.visible = false;
                    this._astronauts[2].mesh.visible = true;
                    this._astronauts[5].mesh.visible = false;
                    this._astronauts[6].mesh.visible = false;
                } else { // Some unrelated key
                    return;
                }

                // Left astronaut
                this._astronauts[0].mesh.position.set(newPos.left[0], newPos.left[1], newPos.left[2]);
                this._astronauts[3].mesh.position.set(newPos.left[0], newPos.left[1], newPos.left[2]);
                this._astronauts[6].mesh.position.set(newPos.left[0], newPos.left[1], newPos.left[2]);
                // Mining Equipment
                this._astronauts[1].mesh.position.set(newPos.middle[0], newPos.middle[1], newPos.middle[2]);
                // Right astronaut
                this._astronauts[2].mesh.position.set(newPos.right[0], newPos.right[1], newPos.right[2]);
                this._astronauts[5].mesh.position.set(newPos.right[0], newPos.right[1], newPos.right[2]);
                this._astronauts[8].mesh.position.set(newPos.right[0], newPos.right[1], newPos.right[2]);

                this._camera.position.set(newPos.middle[0], this._camera.position.y, newPos.middle[2]);
                this._camera.updateProjectionMatrix();
                return;
            } else if (this._state === LandAndMineState.mining) {
                if (event.keyCode === 87 || event.keyCode === 38) {
                    this._isDrillingUp = false;
                    return;
                } else if (event.keyCode === 83 || event.keyCode === 40) {
                    this._isDrillingDown = false;
                    return;
                }
            }
        };

        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        // TODO: Tutorial for how to play the game.

        const exitHelp = (prevState: LandAndMineState) => {
            this._enableAllButtons();
            this._helpMeshes.mainBackground.visible = false;
            this._helpMeshes.lander1.visible = false;
            this._helpMeshes.arrowLeft.visible = false;
            this._helpMeshes.arrowRight.visible = false;
            this._helpMeshes.arrowUp.visible = false;
            this._helpMeshes.keysUp.visible = false;
            this._helpMeshes.keysLeft.visible = false;
            this._helpMeshes.keysRight.visible = false;
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
            this._stateStoredObjects.forEach(obj => obj && obj.show());
            this._stateStoredObjects.length = 0;
            this._state = prevState;
        };

        const exitSettings = (prevState: LandAndMineState) => {
            this._enableAllButtons();
            this._stateStoredObjects.forEach(obj => obj && obj.show());
            this._stateStoredObjects.length = 0;
            this._state = prevState;
        };

        const help = () => {
            this._disableAllButtons();
            const prevState = this._state;
            this._state = LandAndMineState.tutorial;
            this._helpMeshes.mainBackground.visible = true;
            this._helpMeshes.lander1.visible = true;
            this._helpTexts.landerControlsTitle.show();
            this._helpTexts.miningControlsTitle.show();
            this._helpTexts.astronautControlsTitle.show();
            this._helpCounters.astroWalk = 0;
            this._helpActors.astronauts[1].mesh.visible = true;
            this._helpActors.astronauts[3].mesh.visible = true;
            this._helpActors.astronauts[5].mesh.visible = true;
            Object.values(this._helpPanels).forEach(p => p && p.show());
            Object.values(this._buttons).filter(x => !!x).forEach(button => {
                if (button.isVisible()) {
                    this._stateStoredObjects.push(button);
                    button.hide();
                }
            });
            Object.values(this._textElements).filter(x => !!x).forEach(text => {
                if (text.isVisible()) {
                    this._stateStoredObjects.push(text);
                    text.hide();
                }
            });
            return prevState;
        };

        const pause = () => {
            this._disableAllButtons();
            const prevState = this._state;
            this._state = LandAndMineState.paused;
            return prevState;
        };

        const play = (prevState: LandAndMineState) => {
            this._enableAllButtons();
            this._state = prevState;
        };

        const settings = () => {
            this._disableAllButtons();
            const prevState = this._state;
            this._state = LandAndMineState.paused;
            Object.values(this._buttons).forEach(button => {
                if (button.isVisible()) {
                    this._stateStoredObjects.push(button);
                    button.hide();
                }
            });
            Object.values(this._textElements).forEach(text => {
                if (text.isVisible()) {
                    this._stateStoredObjects.push(text);
                    text.hide();
                }
            });
            return prevState;
        };

        this._controlPanel = new ControlPanel(
            { height, left: left, top: null, width },
            { exitHelp, exitSettings, help, pause, play, settings },
            true);

        this._textElements.horizontalSpeed = new LeftTopStatsText1(
            `Horizontal Speed: ${this._currentLanderHorizontalSpeed}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.verticalSpeed = new LeftTopStatsText2(
            `Descent Speed: ${this._currentLanderVerticalSpeed}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.oxygenLevel = new LeftTopStatsText3(
            `Oxygen Level: ${this._currentOxygenLevel}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.fuelLevel = new LeftTopStatsText4(
            `Fuel Level: ${this._currentFuelLevel}`,
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

        const windSpeed = this._planetSpecifications.wind ? (HORIZONTAL_THRUST * (this._planetSpecifications.wind / 10)) : 0;
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
            `${this._mineCollectCount} x ${OreTypes[this._planetSpecifications.ore]}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);
        this._textElements.mineCount.hide();

        let onClick = () => {
            if (this._state === LandAndMineState.newGame) {
                this._state = LandAndMineState.flying;
                this._buttons.startButton.hide();
                SoundinatorSingleton.playBackgroundMusicScifi01();
                if (Math.abs(this._planetSpecifications.wind) > 0) {
                    SoundinatorSingleton.playWind();
                }
            }
        };

        this._buttons.startButton = new StartButton(
            { left: left + (0.425 * width), height, top: height - (0.75 * height), width },
            BUTTON_COLORS,
            onClick,
            true,
            0.75);

        onClick = () => {
            if (this._state === LandAndMineState.landed) {
                this._state = LandAndMineState.walkingByLander;
                this._buttons.unloadButton.hide();
                this._buttons.loadButton.show();
                const landerPos = this._lander.mesh.position;
                const astroLeft = this._astronauts[0];
                const miningEquipment = this._astronauts[1];
                const astroRight = this._astronauts[2];

                const landerBottom = landerPos.z + 0.11;
                const landerRow = Math.floor((-10 * landerBottom) + 60);
                const landerCol = ((100 * landerPos.x) % 10) < 5 ? Math.floor((10 * landerPos.x) + 60) : Math.ceil((10 * landerPos.x) + 60);
                const astroLeftPos = this._meshGrid[landerRow][landerCol !== 0 ? landerCol - 1 : 120].position;
                const miningEquipmentPos = this._meshGrid[landerRow][landerCol].position;
                const astroRightPos = this._meshGrid[landerRow][landerCol !== 120 ? landerCol + 1 : 0].position;

                astroLeft.mesh.position.set(astroLeftPos.x, astroLeft.mesh.position.y, astroLeftPos.z);
                astroLeft.mesh.visible = true;
                miningEquipment.mesh.position.set(miningEquipmentPos.x, miningEquipment.mesh.position.y, miningEquipmentPos.z);
                miningEquipment.mesh.visible = true;
                astroRight.mesh.position.set(astroRightPos.x, astroRight.mesh.position.y, astroRightPos.z);
                astroRight.mesh.visible = true;

                setTimeout(() => {
                    this._camera.position.set(miningEquipmentPos.x, this._camera.position.y, miningEquipmentPos.z);
                    this._camera.zoom = 4;
                    this._camera.updateProjectionMatrix();
                    SoundinatorSingleton.playHollowClank();
                }, 100);
            }
        };

        this._buttons.unloadButton = new UnloadButton(
            { left: left + (0.425 * width), height, top: height - (0.75 * height), width },
            BUTTON_COLORS,
            onClick,
            true,
            0.75);
        this._buttons.unloadButton.hide();

        onClick = () => {
            if (this._state === LandAndMineState.walkingByLander) {
                this._state = LandAndMineState.landed;
                this._buttons.loadButton.hide();
                this._buttons.unloadButton.show();

                this._astronauts.filter(astro => !!astro).forEach(astro => {
                    astro.mesh.visible = false;
                });

                setTimeout(() => {
                    this._camera.position.set(0, this._camera.position.y, 0);
                    this._camera.zoom = 1;
                    this._camera.updateProjectionMatrix();
                    SoundinatorSingleton.playHollowClunk();
                }, 100);
            }
        };

        this._buttons.loadButton = new LoadButton(
            { left: left + (0.425 * width), height, top: height - (0.75 * height), width },
            BUTTON_COLORS,
            onClick,
            true,
            0.75);
        this._buttons.loadButton.hide();

        onClick = () => {
            if (this._state === LandAndMineState.walkingAwayFromLander) {
                this._state = LandAndMineState.mining;
                this._buttons.mineButton.hide();
                this._buttons.packUpButton.show();

                const drillGeo = new PlaneGeometry( 0.05, 0.1, 10, 10 );
                const drillMat = new MeshPhongMaterial({
                    color: '#FFFFFF',
                    map: this._textures.miningDrill,
                    shininess: 0,
                    transparent: true
                });
                const miningEquipPos = this._astronauts[1].mesh.position;
                const drillMesh = new Mesh(drillGeo, drillMat);
                drillMesh.position.set(miningEquipPos.x, miningEquipPos.y - 3, miningEquipPos.z);
                drillMesh.rotation.set(-1.5708, 0, 0);
                drillMesh.name = 'Mining-Drill-1';
                this._drillBits.push(drillMesh);
                this._scene.add(drillMesh);

                SoundinatorSingleton.playDrilling();
            }
        };

        this._buttons.mineButton = new MineButton(
            { left: left + (0.425 * width), height, top: height - (0.75 * height), width },
            BUTTON_COLORS,
            onClick,
            true,
            0.75);
        this._buttons.mineButton.hide();

        onClick = () => {
            if (this._state === LandAndMineState.mining) {
                this._state = LandAndMineState.walkingAwayFromLander;
                this._buttons.packUpButton.hide();
                this._buttons.mineButton.show();
                this._scene.remove(this._drillBits[0]);
                this._drillBits.length = 0;
                SoundinatorSingleton.stopDrilling();
            }
        };

        this._buttons.packUpButton = new PackItUpButton(
            { left: left + (0.425 * width), height, top: height - (0.75 * height), width },
            BUTTON_COLORS,
            onClick,
            true,
            0.75);
        this._buttons.packUpButton.hide();
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

        this._controlPanel.resize({ height, left: left, top: null, width });
        this._textElements.horizontalSpeed.resize({ height, left: left, top: null, width });
        this._textElements.verticalSpeed.resize({ height, left: left, top: null, width });
        this._textElements.oxygenLevel.resize({ height, left: left, top: null, width });
        this._textElements.fuelLevel.resize({ height, left: left, top: null, width });
        Object.keys(this._textElements)
            .filter(key => !!this._textElements[key])
            .forEach(key => this._textElements[key].resize({ height, left: left, top: null, width }));
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].resize({ left: left + (0.425 * width), height, top: height - (0.75 * height), width }));
        Object.keys(this._helpTexts)
            .filter(key => !!this._helpTexts[key])
            .forEach(key => this._helpTexts[key].resize({ height, left: left, top: null, width }));
    }

    private _sidePopulate(x: number, y: number, direction: number) {
        const waterTileCheck = Math.random() * 100;
        if (waterTileCheck < 80) {
            this._grid[y][x] = 3;
            if (x > 0 && x < 120) {
                this._sidePopulate(x + direction, y, direction);
            }
        }
    }

    private _waterFlow():void {
        let changeMade = false;

        // Remove weird free-standing water cliffs.
        for (let row = 109; row > 0; row--) {
            for (let col = 0; col < 121; col++) {
                if (this._grid[row][col] === 3 && !this._grid[row - 1][col]) {
                    this._grid[row][col] = 0;
                    changeMade = true;
                }
            }
        }

        // Let water flow horizontally
        for (let row = 109; row > 0; row--) {
            for (let col = 1; col < 120; col++) {
                if (this._grid[row][col] === 3 && !this._grid[row][col + 1] && this._grid[row - 1][col + 1] > 3) {
                    this._grid[row][col + 1] = 3;
                    changeMade = true;
                } else if (this._grid[row][col] === 3 && !this._grid[row][col - 1] && this._grid[row - 1][col - 1] > 3) {
                    this._grid[row][col - 1] = 3;
                    changeMade = true;
                }
            }
        }

        // Let water flow downhill
        for (let row = 109; row > 0; row--) {
            for (let col = 1; col < 120; col++) {
                if (this._grid[row][col] === 3 && !this._grid[row][col + 1] && !this._grid[row - 1][col + 1] && this._grid[row - 2][col + 1]) {
                    this._grid[row - 1][col + 1] = 3;
                    changeMade = true;
                } else if (this._grid[row][col] === 3 && !this._grid[row][col - 1] && !this._grid[row - 1][col - 1] && this._grid[row - 2][col - 1]) {
                    this._grid[row - 1][col - 1] = 3;
                    changeMade = true;
                }
            }
        }

        if (changeMade) {
            this._waterFlow();
        }
    }

    private _getMiningTeamsPositions(left: boolean, right: boolean): {
        left: [number, number, number];
        middle: [number, number, number];
        right: [number, number, number];
        teleported: [boolean, boolean, boolean]; } {
        const astroLeftPos = this._astronauts[0].mesh.position;
        const miningEquipmentPos = this._astronauts[1].mesh.position;
        const astroRightPos = this._astronauts[2].mesh.position;
        let astroLeftCol = Math.floor((10 * (astroLeftPos.x + 0.05)) + 60);
        let miningEquipmentCol = Math.floor((10 * (miningEquipmentPos.x + 0.05)) + 60);
        let astroRightCol = Math.floor((10 * (astroRightPos.x + 0.05)) + 60);
        let astroLeftRow;
        let miningEquipmentRow;
        let astroRightRow;
        const newPositions: {
            left: [number, number, number];
            middle: [number, number, number];
            right: [number, number, number];
            teleported: [boolean, boolean, boolean]; } = {
            left: [0, 0, 0],
            middle: [0, 0, 0],
            right: [0, 0, 0],
            teleported: [false, false, false]
        }

        if (left) {
            if (astroLeftCol < 0) {
                astroLeftCol = 120;
                newPositions.teleported[0] = true;
            }
            if (miningEquipmentCol < 0) {
                miningEquipmentCol = 120;
                newPositions.teleported[1] = true;
            }
            if (astroRightCol < 0) {
                astroRightCol = 120;
                newPositions.teleported[2] = true;
            }

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][astroLeftCol] >= 3) {
                    astroLeftRow = z + 1;
                    break;
                }
            }
            let newAstroPos = this._meshGrid[astroLeftRow][astroLeftCol].position;
            newPositions.left = [newAstroPos.x, astroLeftPos.y, newAstroPos.z];

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][miningEquipmentCol] >= 3) {
                    miningEquipmentRow = z + 1;
                    break;
                }
            }
            newAstroPos = this._meshGrid[miningEquipmentRow][miningEquipmentCol].position;
            newPositions.middle = [newAstroPos.x, miningEquipmentPos.y, newAstroPos.z];

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][astroRightCol] >= 3) {
                    astroRightRow = z + 1;
                    break;
                }
            }
            newAstroPos = this._meshGrid[astroRightRow][astroRightCol].position;
            newPositions.right = [newAstroPos.x, astroRightPos.y, newAstroPos.z];
        } else if (right) {
            if (astroLeftCol > 120) {
                astroLeftCol = 0;
                newPositions.teleported[0] = true;
            }
            if (miningEquipmentCol > 120) {
                miningEquipmentCol = 0;
                newPositions.teleported[1] = true;
            }
            if (astroRightCol > 120) {
                astroRightCol = 0;
                newPositions.teleported[2] = true;
            }

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][astroLeftCol] >= 3) {
                    astroLeftRow = z + 1;
                    break;
                }
            }
            let newAstroPos = this._meshGrid[astroLeftRow][astroLeftCol].position;
            newPositions.left = [newAstroPos.x, astroLeftPos.y, newAstroPos.z];

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][miningEquipmentCol] >= 3) {
                    miningEquipmentRow = z + 1;
                    break;
                }
            }
            newAstroPos = this._meshGrid[miningEquipmentRow][miningEquipmentCol].position;
            newPositions.middle = [newAstroPos.x, miningEquipmentPos.y, newAstroPos.z];

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][astroRightCol] >= 3) {
                    astroRightRow = z + 1;
                    break;
                }
            }
            newAstroPos = this._meshGrid[astroRightRow][astroRightCol].position;
            newPositions.right = [newAstroPos.x, astroRightPos.y, newAstroPos.z];
        }
        return newPositions;
    }

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        document.oncontextmenu = () => {};
        Object.keys(this._textElements)
            .filter(key => !!this._textElements[key])
            .forEach(key => this._textElements[key].dispose());
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].dispose());
        window.removeEventListener( 'resize', this._listenerRef, false);
        SoundinatorSingleton.stopAirThruster();
        SoundinatorSingleton.stopAirThruster();
        SoundinatorSingleton.stopBackgroundMusicScifi01();
        SoundinatorSingleton.stopDrilling();
        SoundinatorSingleton.stopMainThrusterSmall();
        SoundinatorSingleton.stopWalkingFastGravel();
        SoundinatorSingleton.stopWind();
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    public endCycle(): { [key: number]: number } {
        // Game externally paused from control panel. Nothing should progress.
        if (this._state === LandAndMineState.paused) {
            return;
        }
        // Game is in help mode. Play animations from help screen.
        if (this._state === LandAndMineState.tutorial) {
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

            if (this._helpCounters.astroWalk % 10 < 5) {
                this._helpActors.astronauts[3].mesh.visible = false;
                this._helpActors.astronauts[5].mesh.visible = false;
                this._helpActors.astronauts[6].mesh.visible = true;
                this._helpActors.astronauts[8].mesh.visible = true;
            } else {
                this._helpActors.astronauts[6].mesh.visible = false;
                this._helpActors.astronauts[5].mesh.visible = true;
                this._helpActors.astronauts[3].mesh.visible = true;
                this._helpActors.astronauts[8].mesh.visible = false;
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

            return;
        }
        // Game not yet started. Nothing should progress.
        if (this._state === LandAndMineState.newGame) {
            SoundinatorSingleton.stopBackgroundMusicScifi01();
            SoundinatorSingleton.stopWind();
            return;
        }

        // Wind graphics keep on going in all states except paused.
        const drag = this._planetSpecifications.wind ? (HORIZONTAL_THRUST * (Math.abs(this._planetSpecifications.wind) / 100)) : 0;
        if (this._planetSpecifications.wind > 0) {
            this._windParticles.forEach(particle => {
                const particlePos = particle.position;
                particle.position.set(particlePos.x + 0.1, particlePos.y, particlePos.z);
                if (particle.position.x > 6) {
                    particle.position.set(-6.1, particlePos.y, particlePos.z);
                }
            });
        } else if(this._planetSpecifications.wind < 0) {
            this._windParticles.forEach(particle => {
                const particlePos = particle.position;
                particle.position.set(particlePos.x - 0.1, particlePos.y, particlePos.z);
                if (particle.position.x < -6) {
                    particle.position.set(6.1, particlePos.y, particlePos.z);
                }
            });
        }

        // Player died. Nothing should progress.
        if (this._state === LandAndMineState.crashed) {
            if (!this._explosion.endCycle()) {
                return this._loot;
            }
            if (this._lander.mesh) {
                this._scene.remove(this._lander.mesh);
                this._lander.mesh = null;
                this._mainThruster.dispose();
                this._leftThruster.dispose();
                this._rightThruster.dispose();
                this._loot = {
                    '-3': 0,
                    '-2': 0,
                    '-1': 0,
                    '0': 0
                };
                this._textElements.crewCollected.update(`0 crew recovered`);
                this._textElements.waterAndFoodCollected.update(`0 water / 0 food`);
                this._textElements.oreCollected.update(`0 ${OreTypes[this._planetSpecifications.ore]}`);
            }
            return;
        }

        let currPos = this._lander.mesh.position;
        const landerBottom = currPos.z + 0.11;
        const landerRow = Math.floor((-10 * landerBottom) + 60);

        // If lander exceeds bounds, teleport them to the other side.
        if (currPos.x < -6) {
            this._lander.mesh.position.set(5.9, currPos.y, currPos.z);
        }
        if (currPos.x > 6) {
            this._lander.mesh.position.set(-5.9, currPos.y, currPos.z);
        }

        // After successfully reaching escape velocity, no more fuel or oxygen should be spent.
        if (this._state === LandAndMineState.escaped) {
            this._isLeftThrusting = false;
            this._isRightThrusting = false;
            this._isVerticalThrusting = true;

            // If moving horizontally, after reaching escaped state, taper off until 0;
            if (this._currentLanderHorizontalSpeed > 0) {
                this._currentLanderHorizontalSpeed -= 0.0005;
            } else if (this._currentLanderHorizontalSpeed < 0) {
                this._currentLanderHorizontalSpeed += 0.0005;
            }

            this._lander.mesh.position.set(currPos.x + this._currentLanderHorizontalSpeed, currPos.y, currPos.z + this._currentLanderVerticalSpeed - 0.01);
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], true);
            this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
            this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);

            if (landerRow > 120) {
                return this._loot;
            }
            return;
        }

        // If ship reaches a certain altitude they've escaped.
        if (landerRow >= 110) {
            this._state = LandAndMineState.escaped;
            this._loot[-2] = 2; // Regain crew members.
            this._loot[-3] = 1; // Regain lander.

            this._textElements.crewCollected.update(`2 crew recovered`);
            return;
        }

        if (this._state === LandAndMineState.suffocating) {
            if (this._counters.suffocatingCounter >= this._counters.suffocatingCounterClear) {
                this._loot = {
                    '-3': 1, // Regain lander on autopilot.
                    '-2': 0,
                    '-1': 0,
                    '0': 0
                };
                this._textElements.crewCollected.update(`0 crew recovered`);
                this._textElements.waterAndFoodCollected.update(`0 water / 0 food`);
                this._textElements.oreCollected.update(`0 ${OreTypes[this._planetSpecifications.ore]}`);
                this._buttons.mineButton.hide();
                this._buttons.loadButton.hide();
                this._buttons.unloadButton.hide();
                this._buttons.packUpButton.hide();
                this._state = LandAndMineState.escaped;
                setTimeout(() => {
                    this._camera.position.set(0, this._camera.position.y, 0);
                    this._camera.zoom = 1;
                    this._camera.updateProjectionMatrix();
                }, 100);
                return;
            } else {
                this._counters.suffocatingCounter++;
            }

            if (this._counters.suffocatingCounter % 20 === 0) {
                this._astronauts.filter(astro => !!astro).forEach((astro, index) => {
                    if (index !== 1) {
                        astro.mesh.visible = false;
                    }
                });
                const astroIndex = Math.floor(this._counters.suffocatingCounter / 20) + 9;
                const astroPosLeft = this._astronauts[0].mesh.position;
                const astroPosRight = this._astronauts[2].mesh.position;
                const newAstroLeft = this._astronauts[astroIndex].mesh;
                const newAstroRight = this._astronauts[astroIndex + 5].mesh;
                newAstroLeft.position.set(astroPosLeft.x, astroPosLeft.y, astroPosLeft.z);
                newAstroRight.position.set(astroPosRight.x, astroPosRight.y, astroPosRight.z);
                newAstroLeft.visible = true;
                newAstroRight.visible = true;
            }
            return;
        }

        // All other states consume oxygen still.
        if (this._currentOxygenLevel > 0) {
            this._currentOxygenLevel -= this._landerSpecifications.oxygenBurn;
            this._textElements.oxygenLevel.update(`Oxygen Level: ${Math.abs(this._currentOxygenLevel).toFixed(0)} %`);
            if (Math.abs(this._currentOxygenLevel) < 20 && this._textElements.oxygenLevel.color === COLORS.neutral) {
                this._textElements.oxygenLevel.cycle(COLORS.selected);
            }
        } else {
            if (this._state !== LandAndMineState.mining
                && this._state !== LandAndMineState.walkingAwayFromLander
                && this._state !== LandAndMineState.walkingByLander) {
                this._loot[-2] = 0;
                this._loot[-3] = 1;
                this._textElements.crewCollected.update(`0 crew recovered`);
                this._state = LandAndMineState.escaped;
            } else {
                this._state = LandAndMineState.suffocating;
                SoundinatorSingleton.stopDrilling();
                SoundinatorSingleton.stopWalkingFastGravel();
                SoundinatorSingleton.playDeathNoNoAchEhh();
            }
            this._buttons.mineButton.hide();
            this._buttons.loadButton.hide();
            this._buttons.unloadButton.hide();
            this._buttons.packUpButton.hide();
            SoundinatorSingleton.playBipBipBipBing();
            return;
        }

        // Mining team has unpacked, and is ready to drill.
        if (this._state === LandAndMineState.mining) {
            if (this._isDrillingDown) {
                const currentDrillBit = this._drillBits[this._drillBits.length - 1];
                const currDrillPos = currentDrillBit.position;
                const drillCol = Math.floor((10 * currDrillPos.x) + 60);
                const tipRowBefore = Math.floor((-10 * (currDrillPos.z + 0.05)) + 60);
                const tipDrillRowAfter = Math.floor((-10 * (currDrillPos.z + 0.051)) + 60);
                const centerRowBefore = Math.floor((-10 * currDrillPos.z) + 60);
                const centerDrillRowAfter = Math.floor((-10 * (currDrillPos.z + 0.001)) + 60);
                if (tipRowBefore !== tipDrillRowAfter) {
                    if (this._grid[tipDrillRowAfter][drillCol] !== 7) {
                        currentDrillBit.position.set(currDrillPos.x, currDrillPos.y, currDrillPos.z + 0.001);
                    } else {
                        SoundinatorSingleton.playFooPang();
                    }
                    if (this._grid[centerDrillRowAfter][drillCol] !== 4) {
                        if (this._grid[centerDrillRowAfter][drillCol] === 3) {
                            this._loot[0] += this._mineCollectCount;

                            this._textElements.mineCount.update(`${this._mineCollectCount} x Water`);
                            this._textElements.mineCount.show();
                            if (this._mineTextTimeoutId) {
                                clearTimeout(this._mineTextTimeoutId);
                                this._mineTextTimeoutId = null;
                            }
                            this._mineTextTimeoutId = setTimeout(() => {
                                this._textElements.mineCount.hide();
                            }, 1500);
                            SoundinatorSingleton.playBlip();
                        } else if (this._grid[centerDrillRowAfter][drillCol] === 5) {
                            this._loot[this._planetSpecifications.ore] += this._mineCollectCount;

                            this._textElements.mineCount.update(`${this._mineCollectCount} x ${OreTypes[this._planetSpecifications.ore]}`);
                            this._textElements.mineCount.show();
                            if (this._mineTextTimeoutId) {
                                clearTimeout(this._mineTextTimeoutId);
                                this._mineTextTimeoutId = null;
                            }
                            this._mineTextTimeoutId = setTimeout(() => {
                                this._textElements.mineCount.hide();
                            }, 1500);
                            SoundinatorSingleton.playBlip();
                        } else if (this._grid[centerDrillRowAfter][drillCol] === 8) {
                            this._loot[-1] += this._mineCollectCount;

                            this._textElements.mineCount.update(`${this._mineCollectCount} x Food`);
                            this._textElements.mineCount.show();
                            if (this._mineTextTimeoutId) {
                                clearTimeout(this._mineTextTimeoutId);
                                this._mineTextTimeoutId = null;
                            }
                            this._mineTextTimeoutId = setTimeout(() => {
                                this._textElements.mineCount.hide();
                            }, 1500);
                            SoundinatorSingleton.playBlip();
                        } else {
                            SoundinatorSingleton.playBlap();
                        }
                        this._grid[centerDrillRowAfter][drillCol] = 4;
                        const minedBlock = this._meshGrid[centerDrillRowAfter][drillCol];
                        const minedBlockPos = minedBlock.position;

                        const geo = new PlaneGeometry( 0.1, 0.1, 10, 10 );
                        const minedMat = new MeshPhongMaterial({
                            color: '#FFFFFF',
                            map: this._textures.minedSquare1,
                            shininess: 0,
                            transparent: true
                        });
                        const minedMesh = new Mesh(geo, minedMat);
                        minedMesh.position.set(currDrillPos.x, minedBlockPos.y, currDrillPos.z + 0.051);
                        minedMesh.rotation.set(-1.5708, 0, 0);
                        minedMesh.name = `Mined-Square-${Math.floor(Math.random() * 100)}`;

                        this._scene.remove(minedBlock);
                        this._scene.add(minedMesh);

                        this._textElements.waterAndFoodCollected.update(`${this._loot[0]} Water / ${this._loot[-1]} Food`);
                        this._textElements.oreCollected.update(`${this._loot[this._planetSpecifications.ore]} ${OreTypes[this._planetSpecifications.ore]}`);
                    }
                } else if (centerRowBefore !== centerDrillRowAfter) {
                    if (this._landerSpecifications.drillLength !== this._drillBits.length) {
                        this._buttons.packUpButton.hide();
                        const drillGeo = new PlaneGeometry( 0.05, 0.1, 10, 10 );
                        const drillMat = new MeshPhongMaterial({
                            color: '#FFFFFF',
                            map: this._textures.miningDrill,
                            shininess: 0,
                            transparent: true
                        });
                        const drillMesh = new Mesh(drillGeo, drillMat);
                        drillMesh.position.set(currDrillPos.x, currDrillPos.y, currDrillPos.z + 0.001);
                        drillMesh.rotation.set(-1.5708, 0, 0);
                        drillMesh.name = `Mining-Drill-${this._drillBits.length}`;
                        this._drillBits.push(drillMesh);
                        this._scene.add(drillMesh);
                    }
                } else {
                    currentDrillBit.position.set(currDrillPos.x, currDrillPos.y, currDrillPos.z + 0.001);
                }
            } else if (this._isDrillingUp) {
                const currentDrillBit = this._drillBits[this._drillBits.length - 1];
                const currDrillPos = currentDrillBit.position;
                const currDrillRowBefore = Math.floor((10 * currDrillPos.z) + 60);
                const currDrillRowAfter = Math.floor((10 * (currDrillPos.z - 0.001)) + 60);
                if (currDrillRowAfter !== currDrillRowBefore && this._drillBits.length > 1) {
                    this._scene.remove(currentDrillBit);
                    this._drillBits.pop();
                } else {
                    if (this._drillBits.length === 1) {
                        this._buttons.packUpButton.show();
                    } else {
                        currentDrillBit.position.set(currDrillPos.x, currDrillPos.y, currDrillPos.z - 0.001);
                    }
                }
            }
            return;
        }

        // Mining team should move left and right, detect proximity to ship for loading, and nothing else while in walking mode.
        if (this._state === LandAndMineState.walkingByLander || this._state === LandAndMineState.walkingAwayFromLander) {
            if (this._isMiningTeamMovingLeft) {
                this._counters.astronautWalkingCounter++;
                if (this._counters.astronautWalkingCounter > this._counters.astronautWalkingCounterClear) {
                    this._counters.astronautWalkingCounter = 0;
                }
                const positions = this._getMiningTeamsPositions(true, false);
                this._astronauts[0].mesh.position.set(
                    positions.teleported[0] ? positions.left[0] : this._astronauts[0].mesh.position.x - 0.002,
                    positions.left[1],
                    positions.left[2]);
                this._astronauts[3].mesh.position.set(
                    positions.teleported[0] ? positions.left[0] : this._astronauts[0].mesh.position.x - 0.002,
                    positions.left[1],
                    positions.left[2]);
                this._astronauts[6].mesh.position.set(
                    positions.teleported[0] ? positions.left[0] : this._astronauts[0].mesh.position.x - 0.002,
                    positions.left[1],
                    positions.left[2]);
                if (this._astronauts[0].mesh.visible) {
                    this._counters.astronautWalkingCounter = 0;
                    this._astronauts[0].mesh.visible = false;
                    this._astronauts[3].mesh.visible = true;
                } else if (this._astronauts[3].mesh.visible && this._counters.astronautWalkingCounter < 5) {
                    this._astronauts[3].mesh.visible = false;
                    this._astronauts[6].mesh.visible = true;
                } else if (this._astronauts[6].mesh.visible && this._counters.astronautWalkingCounter >= 5) {
                    this._astronauts[6].mesh.visible = false;
                    this._astronauts[3].mesh.visible = true;
                }
                this._astronauts[1].mesh.position.set(
                    positions.teleported[1] ? positions.middle[0] : this._astronauts[1].mesh.position.x - 0.002,
                    positions.middle[1],
                    positions.middle[2]);
                this._astronauts[2].mesh.position.set(
                    positions.teleported[2] ? positions.right[0] : this._astronauts[2].mesh.position.x - 0.002,
                    positions.right[1],
                    positions.right[2]);
                this._astronauts[5].mesh.position.set(
                    positions.teleported[2] ? positions.right[0] : this._astronauts[2].mesh.position.x - 0.002,
                    positions.right[1],
                    positions.right[2]);
                this._astronauts[8].mesh.position.set(
                    positions.teleported[2] ? positions.right[0] : this._astronauts[2].mesh.position.x - 0.002,
                    positions.right[1],
                    positions.right[2]);
                if (this._astronauts[2].mesh.visible) {
                    this._counters.astronautWalkingCounter = 0;
                    this._astronauts[2].mesh.visible = false;
                    this._astronauts[8].mesh.visible = true;
                } else if (this._astronauts[5].mesh.visible && this._counters.astronautWalkingCounter >= 5) {
                    this._astronauts[5].mesh.visible = false;
                    this._astronauts[8].mesh.visible = true;
                } else if (this._astronauts[8].mesh.visible && this._counters.astronautWalkingCounter < 5) {
                    this._astronauts[8].mesh.visible = false;
                    this._astronauts[5].mesh.visible = true;
                }

                this._camera.position.set(this._astronauts[1].mesh.position.x, this._camera.position.y, positions.middle[2]);
                this._camera.updateProjectionMatrix();
            } else if (this._isMiningTeamMovingRight) {
                this._counters.astronautWalkingCounter++;
                if (this._counters.astronautWalkingCounter > this._counters.astronautWalkingCounterClear) {
                    this._counters.astronautWalkingCounter = 0;
                }
                const positions = this._getMiningTeamsPositions(false, true);
                this._astronauts[0].mesh.position.set(
                    positions.teleported[0] ? positions.left[0] : this._astronauts[0].mesh.position.x + 0.002,
                    positions.left[1],
                    positions.left[2]);
                this._astronauts[3].mesh.position.set(
                    positions.teleported[0] ? positions.left[0] : this._astronauts[0].mesh.position.x + 0.002,
                    positions.left[1],
                    positions.left[2]);
                this._astronauts[6].mesh.position.set(
                    positions.teleported[0] ? positions.left[0] : this._astronauts[0].mesh.position.x + 0.002,
                    positions.left[1],
                    positions.left[2]);
                if (this._astronauts[0].mesh.visible) {
                    this._counters.astronautWalkingCounter = 0;
                    this._astronauts[0].mesh.visible = false;
                    this._astronauts[3].mesh.visible = true;
                } else if (this._astronauts[3].mesh.visible && this._counters.astronautWalkingCounter < 5) {
                    this._astronauts[3].mesh.visible = false;
                    this._astronauts[6].mesh.visible = true;
                } else if (this._astronauts[6].mesh.visible && this._counters.astronautWalkingCounter >= 5) {
                    this._astronauts[6].mesh.visible = false;
                    this._astronauts[3].mesh.visible = true;
                }
                this._astronauts[1].mesh.position.set(
                    positions.teleported[1] ? positions.middle[0] : this._astronauts[1].mesh.position.x + 0.002,
                    positions.middle[1],
                    positions.middle[2]);
                this._astronauts[2].mesh.position.set(
                    positions.teleported[2] ? positions.right[0] : this._astronauts[2].mesh.position.x + 0.002,
                    positions.right[1],
                    positions.right[2]);
                this._astronauts[5].mesh.position.set(
                    positions.teleported[2] ? positions.right[0] : this._astronauts[2].mesh.position.x + 0.002,
                    positions.right[1],
                    positions.right[2]);
                this._astronauts[8].mesh.position.set(
                    positions.teleported[2] ? positions.right[0] : this._astronauts[2].mesh.position.x + 0.002,
                    positions.right[1],
                    positions.right[2]);
                if (this._astronauts[2].mesh.visible) {
                    this._counters.astronautWalkingCounter = 0;
                    this._astronauts[2].mesh.visible = false;
                    this._astronauts[8].mesh.visible = true;
                } else if (this._astronauts[5].mesh.visible && this._counters.astronautWalkingCounter >= 5) {
                    this._astronauts[5].mesh.visible = false;
                    this._astronauts[8].mesh.visible = true;
                } else if (this._astronauts[8].mesh.visible && this._counters.astronautWalkingCounter < 5) {
                    this._astronauts[8].mesh.visible = false;
                    this._astronauts[5].mesh.visible = true;
                }

                this._camera.position.set(this._astronauts[1].mesh.position.x, this._camera.position.y, positions.middle[2]);
                this._camera.updateProjectionMatrix();
            }

            if (this._state === LandAndMineState.walkingByLander) {
                const miningEquipmentPos = this._astronauts[1].mesh.position;
                if (Math.abs(currPos.x - miningEquipmentPos.x) > 0.3) {
                    this._state = LandAndMineState.walkingAwayFromLander;
                    this._buttons.loadButton.hide();
                    this._buttons.mineButton.show();
                }
            } else if (this._state === LandAndMineState.walkingAwayFromLander) {
                const miningEquipmentPos = this._astronauts[1].mesh.position;
                if (Math.abs(currPos.x - miningEquipmentPos.x) < 0.3) {
                    this._state = LandAndMineState.walkingByLander;
                    this._buttons.mineButton.hide();
                    this._buttons.loadButton.show();
                }
            }
            return;
        }

        // If landed do nothing unless user kicks in the main thruster again.
        if (this._state === LandAndMineState.landed) {
            this._state = !this._isVerticalThrusting ? LandAndMineState.landed : LandAndMineState.flying;
            this._state === LandAndMineState.flying ? this._buttons.unloadButton.hide() : null;
            return;
        }

        // Calculate effects of horizontal thrusting and wind against the ship.
        // Left thrust on
        if (this._isLeftThrusting && this._currentFuelLevel > 0) {
            this._currentFuelLevel -= this._landerSpecifications.fuelBurn;
            let thrust = HORIZONTAL_THRUST;
            if (this._planetSpecifications.wind < 0) {
                thrust = HORIZONTAL_THRUST + drag;
            } else if (this._planetSpecifications.wind > 0) {
                thrust = HORIZONTAL_THRUST - drag;
            }
            this._currentLanderHorizontalSpeed -= thrust;
            this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], true);
        } else {
            this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        }
        // Right thrust on
        if (this._isRightThrusting && this._currentFuelLevel > 0) {
            this._currentFuelLevel -= this._landerSpecifications.fuelBurn;
            let thrust = HORIZONTAL_THRUST;
            if (this._planetSpecifications.wind < 0) {
                thrust = HORIZONTAL_THRUST - drag;
            } else if (this._planetSpecifications.wind > 0) {
                thrust = HORIZONTAL_THRUST + drag;
            }
            this._currentLanderHorizontalSpeed += thrust;
            this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], true);
        } else {
            this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        }
        // Left and Right thrust off.
        if (this._planetSpecifications.wind > 0 && !this._isLeftThrusting && !this._isRightThrusting) {
            this._currentLanderHorizontalSpeed += this._currentLanderHorizontalSpeed > drag ? 0 : HORIZONTAL_THRUST + drag;
        } else if (this._planetSpecifications.wind < 0 && !this._isLeftThrusting && !this._isRightThrusting) {
            this._currentLanderHorizontalSpeed -= this._currentLanderHorizontalSpeed < -drag ? 0 : HORIZONTAL_THRUST + drag;
        }
        // Update horizontal speed text
        let horizontalSpeedText = `Horizontal Speed: ${
            this._currentLanderHorizontalSpeed < 0 ? '<span class="fa fa-long-arrow-left"></span>' : ''
        } ${
            Math.abs(this._currentLanderHorizontalSpeed).toFixed(4)
        } ${
            this._currentLanderHorizontalSpeed > 0 ? '<span class="fa fa-long-arrow-right"></span>' : ''
        }`;

        // Calculate effects of vertical thrust.
        if (this._isVerticalThrusting && this._currentFuelLevel > 0) {
            this._currentFuelLevel -= this._landerSpecifications.fuelBurn;
            this._currentLanderVerticalSpeed -= VERTICAL_THRUST;
        }

        // Update Readout for remaining fuel
        this._textElements.fuelLevel.update(`Fuel Level: ${Math.abs(this._currentFuelLevel).toFixed(0)} %`);
        if (Math.abs(this._currentFuelLevel) < 20 && this._textElements.fuelLevel.color === COLORS.neutral) {
            this._textElements.fuelLevel.cycle(COLORS.selected);
        }

        const gridBottomRow = this._grid[landerRow];
        const gridMiddleRow = this._grid[landerRow + 1];
        const gridTopRow = this._grid[landerRow + 2];
        const landerCol = ((100 * currPos.x) % 10) < 5 ? Math.floor((10 * currPos.x) + 60) : Math.ceil((10 * currPos.x) + 60);
        const landerBottomCenter = gridBottomRow[landerCol];
        const landerBottomLeft = gridBottomRow[landerCol !== 0 ? landerCol - 1 : 120];
        const landerBottomRight = gridBottomRow[landerCol !== 120 ? landerCol + 1 : 0];
        const landerMiddleLeft = gridMiddleRow[landerCol !== 0 ? landerCol - 1 : 120];
        const landerMiddleRight = gridMiddleRow[landerCol !== 120 ? landerCol + 1 : 0];
        const landerTopLeft = gridTopRow[landerCol !== 0 ? landerCol - 1 : 120];
        const landerTopRight = gridTopRow[landerCol !== 120 ? landerCol + 1 : 0];

        // Collision detection
        if (landerRow < 100
            && landerBottomCenter < 3
            && (landerBottomLeft || landerMiddleLeft || landerTopLeft || landerBottomRight || landerMiddleRight || landerTopRight)) {
            this._crashedEffects(currPos, landerCol, landerRow);
            return;
        }

        // Check if ship is eligible for landing condition, or crashed condition
        if (landerRow < 100 && landerBottomCenter) {
            let hasCrashed = false;
            if (landerBottomLeft < 3 || landerBottomRight < 3) {
                hasCrashed = true;
            } else if (landerBottomLeft === 3 || landerBottomRight === 3) {
                hasCrashed = true;
            } else if (Math.abs(this._currentLanderHorizontalSpeed) >= this._landerSpecifications.horizontalCrashMargin
                || this._currentLanderVerticalSpeed >= this._landerSpecifications.verticalCrashMargin) {
                hasCrashed = true;
            }

            if (hasCrashed) {
                this._crashedEffects(currPos, landerCol, landerRow);
                return;
            }

            this._lander.mesh.position.set(currPos.x, currPos.y, ((landerRow - 60) / -10) - 0.21000001);
            this._currentLanderHorizontalSpeed = 0;
            this._currentLanderVerticalSpeed = 0;
            this._state = LandAndMineState.landed;
            this._buttons.unloadButton.show();
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);
            this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
            this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);

            horizontalSpeedText = `Horizontal Speed: ${Math.abs(this._currentLanderHorizontalSpeed).toFixed(4)}`;
            this._textElements.horizontalSpeed.update(horizontalSpeedText);
            if (Math.abs(this._currentLanderHorizontalSpeed) >= this._landerSpecifications.horizontalCrashMargin
                && this._textElements.horizontalSpeed.color === COLORS.neutral) {
                this._textElements.horizontalSpeed.cycle(COLORS.selected);
            } else if (Math.abs(this._currentLanderHorizontalSpeed) < this._landerSpecifications.horizontalCrashMargin
                && this._textElements.horizontalSpeed.color === COLORS.selected) {
                this._textElements.horizontalSpeed.cycle(COLORS.neutral);
            }

            this._textElements.verticalSpeed.update(`Descent Speed: ${this._currentLanderVerticalSpeed.toFixed(4)}`);
            if (this._currentLanderVerticalSpeed >= this._landerSpecifications.verticalCrashMargin
                && this._textElements.verticalSpeed.color === COLORS.neutral) {
                this._textElements.verticalSpeed.cycle(COLORS.selected);
            } else if (this._currentLanderVerticalSpeed < this._landerSpecifications.verticalCrashMargin
                && this._textElements.verticalSpeed.color === COLORS.selected) {
                this._textElements.verticalSpeed.cycle(COLORS.neutral);
            }

            return;
        }

        // Change horizontal speed text color if it exceeds safe limits or back if it is within safe bounds.
        this._textElements.horizontalSpeed.update(horizontalSpeedText);
        if (Math.abs(this._currentLanderHorizontalSpeed) >= this._landerSpecifications.horizontalCrashMargin
            && this._textElements.horizontalSpeed.color === COLORS.neutral) {
            this._textElements.horizontalSpeed.cycle(COLORS.selected);
        } else if (Math.abs(this._currentLanderHorizontalSpeed) < this._landerSpecifications.horizontalCrashMargin
            && this._textElements.horizontalSpeed.color === COLORS.selected) {
            this._textElements.horizontalSpeed.cycle(COLORS.neutral);
        }

        // Change vertical speed text color if it exceeds safe limits or back if it is within safe bounds.
        this._textElements.verticalSpeed.update(`Descent Speed: ${this._currentLanderVerticalSpeed > 0.0001
            ? this._currentLanderVerticalSpeed.toFixed(4)
            : -this._currentLanderVerticalSpeed.toFixed(4)}`);
        if (this._currentLanderVerticalSpeed >= this._landerSpecifications.verticalCrashMargin
            && this._textElements.verticalSpeed.color === COLORS.neutral) {
            this._textElements.verticalSpeed.cycle(COLORS.selected);
        } else if (this._currentLanderVerticalSpeed < this._landerSpecifications.verticalCrashMargin
            && this._textElements.verticalSpeed.color === COLORS.selected) {
            this._textElements.verticalSpeed.cycle(COLORS.neutral);
        }

        // Calculate gravity effect on ship.
        this._lander.mesh.position.set(currPos.x + this._currentLanderHorizontalSpeed, currPos.y, currPos.z + this._currentLanderVerticalSpeed);
        this._currentLanderVerticalSpeed += this._planetSpecifications.gravity;

        // Update main thruster position to match new lander position.
        currPos = this._lander.mesh.position;
        if (this._isVerticalThrusting && this._currentFuelLevel > 0) {
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], true);
        } else {
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);
        }

        // Run all texts through their cycles.
        Object.keys(this._textElements).forEach(x => x && this._textElements[x].cycle());

        return;
    }
}
import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    Texture,
    Vector3 } from 'three';

import { SOUNDS_CTRL } from '../../controls/controllers/sounds-controller';
import { Actor } from '../../models/actor';
import { SceneType } from '../../models/scene-type';
import { getIntersections } from '../../utils/get-intersections';
import { ButtonBase } from '../../controls/buttons/button-base';
import { createLander } from './utils/create-lander';
import { OreTypeColors, PlanetLandColors, PlanetSpecifications, SkyColors } from '../../models/planet-specifications';
import { MainThruster } from './utils/main-thruster';
import { SideThruster } from './utils/side-thruster';
import { Explosion } from '../../weapons/explosion';
import { colorLuminance } from '../../utils/color-shader';
import { createWindParticles } from './utils/create-wind-particles';
import { StartButton } from '../../controls/buttons/start-button';
import { BUTTON_COLORS } from '../../styles/button-colors';
import { UnloadButton } from '../../controls/buttons/unload-button';
import { LoadButton } from '../../controls/buttons/load-button';
import { MineButton } from '../../controls/buttons/mine-button';
import { PackItUpButton } from '../../controls/buttons/pack-it-up-button';
import { LanderSpecifications } from '../../models/lander-specifications';
import { ControlPanel } from '../../controls/panels/control-panel';
import { HelpCtrl } from './controllers/help-controller';
import { noOp } from '../../utils/no-op';
import { TextBase } from '../../controls/text/text-base';
import { TextCtrl } from './controllers/text-controller';
import { LootCtrl } from './controllers/loot-controller';
import { MiningCtrl } from './controllers/mining-controller';
import { SettingsCtrl } from '../../controls/controllers/settings-controllers';
import { ASSETS_CTRL } from '../../controls/controllers/assets-controller';

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

/**
 * Border value used for dev mode to see outline around text content (for positioning and sizing).
 */
// const border: string = '1px solid #FFF';
const border: string = 'none';

/**
 * The amount of horizontal speed the side thrusters can apply per frame while on.
 */
const HORIZONTAL_THRUST: number = 0.0001;

/**
 * Y Coordinate offset for the side thrusters in this scene.
 */
const SIDE_THRUSTER_Y_OFFSET: number = 5;

/**
 * Z Coordinate offset for the side thrusters in this scene.
 */
const SIDE_THRUSTER_Z_OFFSET: number = -0.17;

/**
 * Y Coordinate offset for the main thruster in this scene.
 */
const MAIN_THRUSTER_Y_OFFSET: number = 5;

/**
 * Y Coordinate offset for the main thruster in this scene.
 */
const MAIN_THRUSTER_Z_OFFSET: number = 0.16;

/**
 * The amount of upward vertical speed the main thrusters can apply per frame while on.
 */
const VERTICAL_THRUST: number = 0.0002;

/**
 * The game state mode enum for this scene.
 */
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
    'tutorial' = 10,
    'settings' = 11,
    'autopilot' = 12
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

    /**
     * Reference to the ThreeJS camera through which the scene is visible.
     */
    private _camera: OrthographicCamera;

    /**
     * Reference to the main Control Panel.
     */
    private _controlPanel: ControlPanel;

    /**
     * Counter to control operations per cycle.
     */
    private _counter: number = 0;

    /**
     * The current amount of fuel remaining.
     */
    private _currentFuelLevel: number = 100;

    /**
     * The current amount of horizontal speed. Negative values denote left directionality.
     */
    private _currentLanderHorizontalSpeed: number = 0.01;

    /**
     * The current amount of vertical speed. Negative values denote upward directionality.
     */
    private _currentLanderVerticalSpeed: number = 0.001;

    /**
     * The current amount of oxygen remaining.
     */
    private _currentOxygenLevel: number = 100;

    /**
     * MeshGrid locations of demo blocks to be hidden and revealed when entering and exiting unload mode.
     */
    private _demoBlockCoords: [number, number, number][];

    /**
     * All the meshes for demo at top of screen that con't be interacted with, rolled into one Object3D for performace.
     */
    private _demoMeshes: Object3D = new Object3D();

    /**
     * Reference to current explosion if there is one.
     */
    private _explosion: Explosion = null;

    /**
     * The grid array with values of all tiles on game map.
     */
    private _grid: number[][] = [];

    /**
     * Reference to the Help Controller.
     */
    private _helpCtrl: HelpCtrl;

    /**
     * Flag to tell when drill is moving downward.
     */
    private _isDrillingDown: boolean = false;

    /**
     * Flag to tell when drill is moving upward.
     */
    private _isDrillingUp: boolean = false;

    /**
     * Flag to tell when the left side thruster is on.
     */
    private _isLeftThrusting: boolean = false;

    /**
     * Flag to tell when the right side thruster is on.
     */
    private _isRightThrusting: boolean = false;

    /**
     * Flag to tell when the main thruster is on.
     */
    private _isVerticalThrusting: boolean = false;

    /**
     * Reference to the ship object.
     */
    private _lander: Actor;

    /**
     * All the details about the ship needed for determining speed, suffocation, and crashes.
     */
    private _landerSpecifications: LanderSpecifications;

    /**
     * Reference to the left side thruster for lander.
     */
    private _leftThruster: SideThruster;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    /**
     * Reference to the Loot Controller.
     */
    private _lootCtrl: LootCtrl;

    /**
     * Reference to the main thruster for lander.
     */
    private _mainThruster: MainThruster;

    /**
     * The mesh array with meshes of all tiles on game map.
     */
    private _positionGrid: Vector3[][] = [];

    /**
     * Quanity to assign as loot when a lootable block is mined.
     */
    private _mineCollectCount: number;

    /**
     * Reference to the Mining Controller.
     */
    private _miningCtrl: MiningCtrl;

    /**
     * All the details about the planet body needed for building the scene.
     */
    private _planetSpecifications: PlanetSpecifications;

    /**
     * Reference to the right side thruster for lander.
     */
    private _rightThruster: SideThruster;

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * Reference to this scene's settings controller.
     */
    private _settingsCtrl: SettingsCtrl;

    /**
     * Tracks current game state mode.
     */
    private _state: LandAndMineState = LandAndMineState.newGame;

    /**
     * Text and button objects that were visible before player entered help or settings mode.
     */
    private _stateStoredObjects: (ButtonBase | TextBase)[] = [];

    /**
     * All the terrain and sky meshes that con't be interacted with, rolled into one Object3D for performace.
     */
    private _staticMeshes: Object3D = new Object3D();

    /**
     * Reference to the game's Text Controller.
     */
    private _txtCtrl: TextCtrl;

    /**
     * Array of wind particles to move during endCycle
     */
    private _windParticles: Mesh[] = [];

    /**
     * Constructor for the Land and Mine (Scene) class
     * @param scene                     graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param planetSpecifications      details about the planet used to operate the scene.
     * @param landerSpecifications      details about the lander used to operate the lander module and its mining crew.
     */
    constructor(
        scene: SceneType,
        planetSpecifications: PlanetSpecifications,
        landerSpecifications: LanderSpecifications) {

        this._camera = scene.camera as OrthographicCamera;
        this._scene = scene.scene;
        this._planetSpecifications = planetSpecifications;
        this._landerSpecifications = landerSpecifications;
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
        const lander = createLander(ASSETS_CTRL.textures.lander);
        this._lander = lander;
        this._actors.push(lander);
        this._scene.add(lander.mesh);
        // Create lander module thrusters
        const currPos = this._lander.mesh.position;
        this._mainThruster = new MainThruster(this._scene, [currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET]);
        this._leftThruster = new SideThruster(this._scene, [currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], -1);
        this._rightThruster = new SideThruster(this._scene, [currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], 1);

        this._helpCtrl = new HelpCtrl(
            this._scene,
            this._planetSpecifications,
            this._landerSpecifications,
            border);
        
        this._settingsCtrl = new SettingsCtrl(
            this._scene,
            border);

        this._txtCtrl = new TextCtrl(
            this._scene,
            planetSpecifications,
            this._planetSpecifications.wind ? (HORIZONTAL_THRUST * (this._planetSpecifications.wind / 10)) : 0,
            this._currentLanderHorizontalSpeed,
            this._currentLanderVerticalSpeed,
            this._currentOxygenLevel,
            this._currentFuelLevel,
            border);

        this._lootCtrl = new LootCtrl(
            planetSpecifications.ore,
            this._txtCtrl);

        this._miningCtrl = new MiningCtrl(
            this._scene,
            this._camera,
            this._grid,
            this._positionGrid,
            this._lootCtrl,
            landerSpecifications.drillLength);
    }

    /**
     * Fills in the sky, space, and escape line values for the grid tiles.
     */
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

    /**
     * Procedurally generates the grid values for all solid planetary matter (ie. ground, water, ore).
     * @param startY vertical coordinate of the top-most, left-most groundish grid tile.
     */
    private _buildTerrain(startY: number): void {
        for (let i = 0; i < 121; i++) {
            this._grid[i] = [];
        }

        this._grid[startY][0] = 6;
        this._downPopulate(0, startY);
        let lastY = startY;
        for (let col = 1; col < 121; col++) {
            const cantAscend = (lastY - startY) >= this._planetSpecifications.peakElevation;
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

    /**
     * Performs all the functionality associated with the ship blowing up.
     */
    private _crashedEffects(currPos: Vector3, landerCol: number, landerRow: number): void {
        this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);
        this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        this._state = LandAndMineState.crashed;
        this._explosion = new Explosion(
            this._scene,
            currPos.x,
            currPos.z,
            {
                radius: 0.3,
                renderedInert: false,
                y: 14
            });
        SOUNDS_CTRL.playExplosionSmall();
        setTimeout(() => this._destroyTiles(landerCol, landerRow), 900);
    }

    /**
     * Creates all the meshes that match the values in the grid array.
     */
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
            this._positionGrid[row] = [];
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
                block.position.set(-6 + (col/10), 17, 6 - row/10);
                block.rotation.set(1.5708, 0, 0);
                this._positionGrid[row][col] = block.position;
                this._staticMeshes.add(block);
            }
        }

        this._freezeWater(iceMat);

        this._scene.add(this._staticMeshes);

        this._demoBlockCoords = [
            [ 118, 58, 65 ],
            [ 116, 58, 59 ],
            [ 114, 58, 66 ],
            [ 111, 58, 59 ]
        ];

        // Creates the 7 shades of common rocks for demo display in top center of screen.
        for (let x = 58; x < 65; x++) {
            const index = x - 58;
            const block = new Mesh( geo, commonRockMats[index] );
            block.position.set(-6 + (x/10) + (0.05 * index), 15, 6 - 118/10 - 0.05);
            block.rotation.set(1.5708, 0, 0);
            this._demoMeshes.add(block);
        }

        // Creates the 1 danger/impenetrable block for demo display in top center of screen.
        const dangerBlock = new Mesh( geo, dangerMat );
        dangerBlock.position.set(-6 + (58/10), 15, 6 - 116/10);
        dangerBlock.rotation.set(1.5708, 0, 0);
        this._demoMeshes.add(dangerBlock);

        // Creates the 1 water and 1 ice block for demo display in top center of screen.
        const waterBlock = new Mesh( geo, waterMat );
        waterBlock.position.set(-6 + (58/10), 15, 6 - 114/10 + 0.05);
        waterBlock.rotation.set(1.5708, 0, 0);
        this._demoMeshes.add(waterBlock);
        const innerWaterGeo = new PlaneGeometry( 0.05, 0.05, 10, 10 );
        const iceBlock = new Mesh( geo, iceMat );
        iceBlock.position.set(-6 + (59/10) + 0.05, 15.5, 6 - 114/10 + 0.05);
        iceBlock.rotation.set(1.5708, 0, 0);
        this._demoMeshes.add(iceBlock);
        const frozenWater = new Mesh( innerWaterGeo, waterMat );
        frozenWater.position.set(-6 + (59/10) + 0.05, 15, 6 - 114/10 + 0.05);
        frozenWater.rotation.set(1.5708, 0, 0);
        this._demoMeshes.add(frozenWater);

        // Creates the 5 shades of plant/food blocks for demo display in top center of screen.
        for (let y = 61; y < 66; y++) {
            const index = y - 61;
            const block = new Mesh( geo, lifeMats[index] );
            block.position.set(-6 + (y/10) + (0.05 * index), 15, 6 - 114/10 + 0.05);
            block.rotation.set(1.5708, 0, 0);
            this._demoMeshes.add(block);
        }

        // Creates the 1 collectable ore block for demo display in top center of screen.
        const oreBlock = new Mesh( geo, oreTypeMat );
        oreBlock.position.set(-6 + (58/10), 15, 6 - 111/10 - 0.025);
        oreBlock.rotation.set(1.5708, 0, 0);
        this._demoMeshes.add(oreBlock);

        this._scene.add(this._demoMeshes);
    }

    /**
     * Calls the wind creation utility and stuff the result into a local variable for later use.
     */
    private _createWind(): void {
        this._windParticles = createWindParticles(this._scene, '#000000');
    }

    /**
     * Systematically destroys ground tiles within range of an explosion's blast.
     * @param col grid column index where explosion originates
     * @param row grid row index where explosion originates
     */
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
        const geo = new PlaneGeometry( 0.12, 0.12, 10, 10 );
        const blackMat = new MeshBasicMaterial({
            color: 0x000000,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        destroyedTiles.forEach(tile => {
            const _row = tile[0];
            const _col = tile[1];
            if (this._grid[_row][_col] > 2) {
                this._grid[_row][_col] = 0;
                const block = new Mesh( geo, blackMat );
                block.position.set(-6 + (_col/10), 15, 6 - _row/10);
                block.rotation.set(1.5708, 0, 0);
                this._staticMeshes.add(block);
            }
        });
    }

    /**
     * Makes all existing buttons unclickable.
     */
    private _disableAllButtons(): void {
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].disable());
    }

    /**
     * Populates mesh land in a downwards fashion to create above and below ground bodies of water.
     * @param x coordinate from which to start populating sideways from
     * @param y coordinate from which to start populating sideways from
     * @param isWater if the tile belonging to the x,y coordinates is already water
     */
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

    /**
     * Makes all existing buttons clickable.
     */
    private _enableAllButtons(): void {
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].enable());
    }

    /**
     * Assesses whether at least one suitable landing spot exists, and if not, creates a space flat enough to land.
     * @param startY starting vertical coordinate when checking top ground layer
     */
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

    /**
     * Freezes water above ground if planet specification express frozen temperatures.
     * @param iceMat the ThreeJS material for ice.
     */
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
                    const iceBlock = new Object3D();
                    // Ice border
                    let block = new Mesh( outerGeo, iceMat );
                    block.position.set(-6 + (col/10), 16.5, 6 - row/10);
                    block.rotation.set(1.5708, 0, 0);
                    iceBlock.add(block);
                    // Watery center
                    block = new Mesh( innerGeo, waterMat );
                    block.position.set(-6 + (col/10), 16, 6 - row/10);
                    block.rotation.set(1.5708, 0, 0);
                    iceBlock.add(block);

                    // Place new ice block in mesh grid
                    this._staticMeshes.add(iceBlock);
                    break;
                } else if (this._grid[row][col] > 3) {
                    break;
                }
            }
        }
    }

    /**
     * Hides demo blocks at top of screen.
     */
    private _hideForEnterAstronautMode(): void {
        this._demoMeshes.visible = false;
        this._txtCtrl.zoomIn();
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
                    this._miningCtrl.startWalking(true);
                    return;
                } else if (event.keyCode === 68 || event.keyCode === 39) {
                    this._miningCtrl.startWalking(false);
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
                if (event.keyCode === 65 || event.keyCode === 37) {
                    SOUNDS_CTRL.stopWalkingFastGravel();
                    this._miningCtrl.standing(true);
                } else if (event.keyCode === 68 || event.keyCode === 39) {
                    SOUNDS_CTRL.stopWalkingFastGravel();
                    this._miningCtrl.standing(false);
                }
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

        const exitHelp = (prevState: LandAndMineState) => {
            this._demoMeshes.visible = true;
            this._staticMeshes.visible = true;
            this._lander.mesh.visible = true;
            this._enableAllButtons();
            this._helpCtrl.hide();
            this._stateStoredObjects.forEach(obj => obj && obj.show());
            this._stateStoredObjects.length = 0;
            this._txtCtrl.show();
            if (prevState === LandAndMineState.mining
                || prevState === LandAndMineState.walkingAwayFromLander
                || prevState === LandAndMineState.walkingByLander) {
                const equipmentPos = this._miningCtrl.getEquipmentPosition();
                this._camera.position.set(equipmentPos.x, this._camera.position.y, equipmentPos.z);
                this._camera.zoom = 4;
                this._camera.updateProjectionMatrix();

                this._hideForEnterAstronautMode();
            }
            this._state = prevState;
        };

        const exitSettings = (prevState: LandAndMineState) => {
            this._settingsCtrl.hide();

            this._demoMeshes.visible = true;
            this._staticMeshes.visible = true;
            this._lander.mesh.visible = true;
            this._enableAllButtons();
            this._stateStoredObjects.forEach(obj => obj && obj.show());
            this._stateStoredObjects.length = 0;
            this._showForExitAstronautMode();
            this._txtCtrl.show();
            if (prevState === LandAndMineState.mining
                || prevState === LandAndMineState.walkingAwayFromLander
                || prevState === LandAndMineState.walkingByLander) {
                const equipmentPos = this._miningCtrl.getEquipmentPosition();
                this._camera.position.set(equipmentPos.x, this._camera.position.y, equipmentPos.z);
                this._camera.zoom = 4;
                this._camera.updateProjectionMatrix();

                this._hideForEnterAstronautMode();
            }
            this._state = prevState;
        };

        const help = () => {
            this._demoMeshes.visible = false;
            this._staticMeshes.visible = false;
            this._lander.mesh.visible = false;
            this._disableAllButtons();
            const prevState = this._state;
            this._state = LandAndMineState.tutorial;
            this._helpCtrl.show();
            Object.values(this._buttons).filter(x => !!x).forEach(button => {
                if (button.isVisible()) {
                    this._stateStoredObjects.push(button);
                    button.hide();
                }
            });
            this._txtCtrl.hide();
            this._camera.position.set(0, this._camera.position.y, 0);
            this._camera.zoom = 1;
            this._camera.updateProjectionMatrix();
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
            this._settingsCtrl.show();

            this._demoMeshes.visible = false;
            this._staticMeshes.visible = false;
            this._lander.mesh.visible = false;
            this._disableAllButtons();
            const prevState = this._state;
            this._state = LandAndMineState.settings;
            Object.values(this._buttons).filter(x => !!x).forEach(button => {
                if (button.isVisible()) {
                    this._stateStoredObjects.push(button);
                    button.hide();
                }
            });
            this._hideForEnterAstronautMode();
            this._txtCtrl.hide();
            this._camera.position.set(0, this._camera.position.y, 0);
            this._camera.zoom = 1;
            this._camera.updateProjectionMatrix();
            return prevState;
        };

        this._controlPanel = new ControlPanel(
            { height, left: left, top: null, width },
            { exitHelp, exitSettings, help, pause, play, settings },
            true);



        let onClick = () => {
            if (this._state === LandAndMineState.newGame) {
                this._state = LandAndMineState.flying;
                this._buttons.startButton.hide();
                SOUNDS_CTRL.playBackgroundMusicScifi01();
                if (Math.abs(this._planetSpecifications.wind) > 0) {
                    SOUNDS_CTRL.playWind();
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

                this._miningCtrl.disembark(landerPos);
                this._hideForEnterAstronautMode();
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

                this._miningCtrl.loadMiners();
                this._showForExitAstronautMode();
                this._lootCtrl.loadLoot();
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

                this._miningCtrl.setupDrill();
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

                this._miningCtrl.packupDrill();
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
        this._settingsCtrl.onWindowResize(height, left, null, width);
        this._txtCtrl.onWindowResize(height, left, null, width);
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].resize({ left: left + (0.425 * width), height, top: height - (0.75 * height), width }));
        this._helpCtrl.onWindowResize(height, left, null, width);
    }

    /**
     * Shows demo blocks at top of screen.
     */
    private _showForExitAstronautMode(): void {
        this._demoMeshes.visible = true;
        this._txtCtrl.show();
    }

    /**
     * Populates mesh land in a sideways fashion to create above and below ground bodies of water.
     * @param x coordinate from which to start populating sideways from
     * @param y coordinate from which to start populating sideways from
     * @param direction direction sideways to populate, -1 left | +1 right
     */
    private _sidePopulate(x: number, y: number, direction: number) {
        const waterTileCheck = Math.random() * 100;
        if (waterTileCheck < 80) {
            this._grid[y][x] = 3;
            if (x > 0 && x < 120) {
                this._sidePopulate(x + direction, y, direction);
            }
        }
    }

    /**
     * Creates water and ice tiles in a way water might naturally flow.
     */
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

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        document.oncontextmenu = () => {};
        this._helpCtrl.dispose();
        this._txtCtrl.dispose();
        this._controlPanel.dispose();
        this._settingsCtrl.dispose();
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].dispose());
        window.removeEventListener( 'resize', this._listenerRef, false);
        SOUNDS_CTRL.stopAirThruster();
        SOUNDS_CTRL.stopAirThruster();
        SOUNDS_CTRL.stopBackgroundMusicScifi01();
        SOUNDS_CTRL.stopDrilling();
        SOUNDS_CTRL.stopMainThrusterSmall();
        SOUNDS_CTRL.stopWalkingFastGravel();
        SOUNDS_CTRL.stopWind();
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
            this._helpCtrl.endCycle();
            return;
        }
        // Game is in settings mode. Activate settings screen.
        if (this._state === LandAndMineState.settings) {
            this._settingsCtrl.endCycle();
            return;
        }
        // Game not yet started. Nothing should progress.
        if (this._state === LandAndMineState.newGame) {
            SOUNDS_CTRL.stopBackgroundMusicScifi01();
            SOUNDS_CTRL.stopWind();
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
                return this._lootCtrl.getLoot();
            }
            if (this._lander.mesh) {
                this._scene.remove(this._lander.mesh);
                this._lander.mesh = null;
                this._mainThruster.dispose();
                this._leftThruster.dispose();
                this._rightThruster.dispose();
                this._lootCtrl.crashTheLander();
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
        if (this._state === LandAndMineState.autopilot) {
            if (this._currentFuelLevel > 0) {
                this._isLeftThrusting = false;
                this._isRightThrusting = false;
                this._isVerticalThrusting = true;
                this._currentLanderHorizontalSpeed = 0;

                this._currentFuelLevel -= this._landerSpecifications.fuelBurn;

                // Update Readout for remaining fuel
                this._txtCtrl.update('fuelLevel', `Fuel Level: ${Math.abs(this._currentFuelLevel).toFixed(0)} %`);
                this._txtCtrl.changeColorBelowThreshold(20, Math.abs(this._currentFuelLevel), 'fuelLevel');

                this._lander.mesh.position.set(currPos.x + this._currentLanderHorizontalSpeed, currPos.y, currPos.z + this._currentLanderVerticalSpeed);
                this._currentLanderVerticalSpeed += this._planetSpecifications.gravity - VERTICAL_THRUST;
                this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], true);
                this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
                this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);

                this._txtCtrl.update('verticalSpeed', `Descent Speed: ${this._currentLanderVerticalSpeed.toFixed(4)}`);
                this._txtCtrl.changeColorAboveThreshold(this._landerSpecifications.verticalCrashMargin, this._currentLanderVerticalSpeed, 'verticalSpeed');
            } else if (this._currentLanderVerticalSpeed >= 0) {
                this._isVerticalThrusting = false;
                this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);
                this._crashedEffects(currPos, ((100 * currPos.x) % 10) < 5 ? Math.floor((10 * currPos.x) + 60) : Math.ceil((10 * currPos.x) + 60), landerRow);
                return;
            } else {
                this._currentLanderVerticalSpeed += this._planetSpecifications.gravity
                this._isVerticalThrusting = false;
                this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);
                return;
            }

            // If ship reaches a certain altitude they've escaped.
            if (landerRow >= 110) {
                this._state = LandAndMineState.escaped;
                return;
            }

            if (landerRow > 120) {
                return this._lootCtrl.getLoot();
            }
            return;
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
                return this._lootCtrl.getLoot();
            }
            return;
        }

        // If ship reaches a certain altitude they've escaped.
        if (landerRow >= 110) {
            this._state = LandAndMineState.escaped;
            this._lootCtrl.regainCrew();
            return;
        }

        if (this._state === LandAndMineState.suffocating) {
            if (this._miningCtrl.hasSuffocated()) {
                this._txtCtrl.resetLoot();
                this._buttons.mineButton.hide();
                this._buttons.loadButton.hide();
                this._buttons.unloadButton.hide();
                this._buttons.packUpButton.hide();
                this._state = LandAndMineState.autopilot;
                setTimeout(() => {
                    this._camera.position.set(0, this._camera.position.y, 0);
                    this._camera.zoom = 1;
                    this._camera.updateProjectionMatrix();

                    this._showForExitAstronautMode();
                }, 100);
                return;
            } else {
                this._miningCtrl.suffocating();
            }

            this._miningCtrl.runSuffocationSequence();
            return;
        }

        // All other states consume oxygen still.
        if (this._currentOxygenLevel > 0) {
            this._currentOxygenLevel -= this._landerSpecifications.oxygenBurn;
            this._txtCtrl.update('oxygenLevel', `Oxygen Level: ${Math.abs(this._currentOxygenLevel).toFixed(0)} %`);
            this._txtCtrl.changeColorBelowThreshold(20, Math.abs(this._currentOxygenLevel), 'oxygenLevel');
        } else {
            this._lootCtrl.loseCrew();
            if (this._state !== LandAndMineState.mining
                && this._state !== LandAndMineState.walkingAwayFromLander
                && this._state !== LandAndMineState.walkingByLander) {
                this._state = LandAndMineState.autopilot;
            } else {
                this._state = LandAndMineState.suffocating;
                SOUNDS_CTRL.stopDrilling();
                SOUNDS_CTRL.stopWalkingFastGravel();
                SOUNDS_CTRL.playDeathNoNoAchEhh();
            }
            this._buttons.mineButton.hide();
            this._buttons.loadButton.hide();
            this._buttons.unloadButton.hide();
            this._buttons.packUpButton.hide();
            SOUNDS_CTRL.playBipBipBipBing();
            return;
        }

        // Mining team has unpacked, and is ready to drill.
        if (this._state === LandAndMineState.mining) {
            if (this._isDrillingDown) {
                this._miningCtrl.drillDown(this._mineCollectCount, this._buttons.packUpButton);
            } else if (this._isDrillingUp) {
                this._miningCtrl.drillUp(this._buttons.packUpButton);
            }
            return;
        }

        // Mining team should move left and right, detect proximity to ship for loading, and nothing else while in walking mode.
        if (this._state === LandAndMineState.walkingByLander || this._state === LandAndMineState.walkingAwayFromLander) {
            this._miningCtrl.walking();

            if (this._state === LandAndMineState.walkingByLander) {
                if (Math.abs(currPos.x - this._miningCtrl.getEquipmentPosition().x) > 0.3) {
                    this._state = LandAndMineState.walkingAwayFromLander;
                    this._buttons.loadButton.hide();
                    this._buttons.mineButton.show();
                }
            } else if (this._state === LandAndMineState.walkingAwayFromLander) {
                if (Math.abs(currPos.x - this._miningCtrl.getEquipmentPosition().x) < 0.3) {
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
            this._state === LandAndMineState.flying ? this._buttons.unloadButton.hide() : noOp();
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
        this._txtCtrl.update('fuelLevel', `Fuel Level: ${Math.abs(this._currentFuelLevel).toFixed(0)} %`);
        this._txtCtrl.changeColorBelowThreshold(20, Math.abs(this._currentFuelLevel), 'fuelLevel');

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
            if (landerBottomLeft <= 3 || landerBottomRight <= 3) {
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
            this._txtCtrl.update('horizontalSpeed', horizontalSpeedText);
            this._txtCtrl.changeColorAboveThreshold(
                this._landerSpecifications.horizontalCrashMargin,
                Math.abs(this._currentLanderHorizontalSpeed),
                'horizontalSpeed');

            this._txtCtrl.update('verticalSpeed', `Descent Speed: ${this._currentLanderVerticalSpeed.toFixed(4)}`);
            this._txtCtrl.changeColorAboveThreshold(this._landerSpecifications.verticalCrashMargin, this._currentLanderVerticalSpeed, 'verticalSpeed');

            return;
        }

        // Change horizontal speed text color if it exceeds safe limits or back if it is within safe bounds.
        this._txtCtrl.update('horizontalSpeed', horizontalSpeedText);
        this._txtCtrl.changeColorAboveThreshold(
            this._landerSpecifications.horizontalCrashMargin,
            Math.abs(this._currentLanderHorizontalSpeed),
            'horizontalSpeed');

        // Change vertical speed text color if it exceeds safe limits or back if it is within safe bounds.
        this._txtCtrl.update('verticalSpeed', `Descent Speed: ${this._currentLanderVerticalSpeed > 0.0001
            ? this._currentLanderVerticalSpeed.toFixed(4)
            : -this._currentLanderVerticalSpeed.toFixed(4)}`);
        this._txtCtrl.changeColorAboveThreshold(this._landerSpecifications.verticalCrashMargin, this._currentLanderVerticalSpeed, 'verticalSpeed');

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
        this._txtCtrl.cycleAll();

        return;
    }
}
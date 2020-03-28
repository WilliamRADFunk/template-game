import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    Texture,
    Object3D,
    OrthographicCamera } from 'three';

import { SoundinatorSingleton } from '../../soundinator';
import { Actor } from '../../models/actor';
import { SceneType } from '../../models/scene-type';
import { getIntersections } from '../../utils/get-intersections';
import { ButtonBase } from '../../controls/buttons/button-base';
import { TextBase } from '../../controls/text/text-base';
import { createLander } from './actors/create-lander';
import { PlanetSpecifications, OreTypeColors, SkyColors, PlanetLandColors } from '../../models/planet-specifications';
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

/*
 * Grid Values
 * 00: Empty space/sky. Null values
 * 01: Escape Zone. Contact means exit
 * 02: Escape Zone Line. Ship Bottom must be above.
 * 03: Water or ice
 * 04: Impenetrable to drill.
 * 05: Ore type
 * 06: Common Rock
 * 07: Danger square: lava, acid, explosive gas, etc.
 * 08: Life (plants mostly)
 */

// const border: string = '1px solid #FFF';
const border: string = 'none';

const HORIZONTAL_THRUST: number = 0.0001;

const SIDE_THRUSTER_Y_OFFSET: number = 5;

const SIDE_THRUSTER_Z_OFFSET: number = 0;

const MAIN_THRUSTER_Y_OFFSET: number = 5;

const MAIN_THRUSTER_Z_OFFSET: number = 0.18;

const VERTICAL_THRUST: number = 0.0002;

export enum LandAndMineState {
    'crashed' = 0,
    'escaped' = 1,
    'flying' = 2,
    'landed' = 3,
    'paused' = 4,
    'walking' = 5
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
        startButton: null,
        unloadButton: null
    };

    private _camera: OrthographicCamera;

    private _currentFuelLevel: number = 100;

    private _currentLanderHorizontalSpeed: number = 0.01;

    private _currentLanderVerticalSpeed: number = 0.001;

    private _currentOxygenLevel: number = 100;

    private _explosion: Explosion = null;

    private _grid: number[][] = [];

    private _isLeftThrusting: boolean = false;

    private _isMiningTeamMovingLeft: boolean = false;

    private _isMiningTeamMovingRight: boolean = false;

    private _isRightThrusting: boolean = false;

    private _isVerticalThrusting: boolean = false;

    private _lander: Actor;

    private _leftThruster: SideThruster;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    private _mainThruster: MainThruster;

    private _meshGrid: Mesh[][] = [];

    private _windParticles: Mesh[] = [];

    private _planetSpecifications: PlanetSpecifications;

    private _rightThruster: SideThruster;

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    private _state: LandAndMineState = LandAndMineState.paused;

    /**
     * Groups of text elements
     */
    private _textElements: { [key: string]: TextBase } = { };

    /**
     * Constructor for the Land and Mine (Scene) class
     * @param scene                     graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param landerTexture             texture for the lander.
     * @param astronaut1Texture         texture for the astronaut.
     * @param miningEquipment1Texture   texture for the mining equipment top.
     * @param miningEquipment2Texture   texture for the mining equipment bottom.
     * @param planetSpecifications      details about the planet used to operate the scene.
     */
    constructor(
        scene: SceneType,
        landerTexture: Texture,
        astronaut1Texture: Texture,
        miningEquipment1Texture: Texture,
        miningEquipment2Texture: Texture,
        planetSpecifications: PlanetSpecifications) {
        this._camera = scene.camera as OrthographicCamera;
        this._scene = scene.scene;
        this._planetSpecifications = planetSpecifications;

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
        const lander = createLander(landerTexture);
        this._lander = lander;
        this._actors.push(lander);
        this._scene.add(lander.mesh);
        // Create lander module thrusters
        const currPos = this._lander.mesh.position;
        this._mainThruster = new MainThruster(this._scene, [currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET]);
        this._leftThruster = new SideThruster(this._scene, [currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], -1);
        this._rightThruster = new SideThruster(this._scene, [currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET]);
        // Create astronaut mining team
        this._astronauts = createMiningTeam(astronaut1Texture, miningEquipment1Texture, miningEquipment2Texture);
        this._astronauts.filter(astro => !!astro).forEach(astro => {
            this._scene.add(astro.mesh);
            astro.mesh.visible = false;
        });
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
        const impenetrableMat = new MeshBasicMaterial({
            color: 0x57595D,
            opacity: 1,
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
                    material = impenetrableMat;
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

        this._freezeWater();
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

    private _freezeWater(): void {
        if (!this._planetSpecifications.isFrozen) {
            return;
        }

        const outerGeo = new PlaneGeometry( 0.1, 0.1, 10, 10 );
        const iceMat = new MeshBasicMaterial({
            color: 0xEEEEEE,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });

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
            } else if (this._state === LandAndMineState.walking) {
                if (event.keyCode === 65 || event.keyCode === 37) {
                    this._isMiningTeamMovingLeft = true;
                    return;
                } else if (event.keyCode === 68 || event.keyCode === 39) {
                    this._isMiningTeamMovingRight = true;
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
            } else if (this._state === LandAndMineState.walking) {
                if (event.keyCode === 65 || event.keyCode === 37) {
                    this._isMiningTeamMovingLeft = false;
                    return;
                } else if (event.keyCode === 68 || event.keyCode === 39) {
                    this._isMiningTeamMovingRight = false;
                    return;
                }
            }
        };

        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        this._textElements.leftTopStatsText1 = new LeftTopStatsText1(
            `Horizontal Speed: ${this._currentLanderHorizontalSpeed}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.leftTopStatsText2 = new LeftTopStatsText2(
            `Vertical Speed: ${this._currentLanderVerticalSpeed}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.leftTopStatsText3 = new LeftTopStatsText3(
            `Oxygen Level: ${this._currentOxygenLevel}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        this._textElements.leftTopStatsText4 = new LeftTopStatsText4(
            `Fuel Level: ${this._currentFuelLevel}`,
            { height, left: left, top: null, width },
            COLORS.neutral,
            border,
            TextType.STATIC);

        let onClick = () => {
            if (this._state === LandAndMineState.paused) {
                this._state = LandAndMineState.flying;
                this._buttons.startButton.hide();
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
                this._state = LandAndMineState.walking;
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
            if (this._state === LandAndMineState.walking) {
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

        this._textElements.leftTopStatsText1.resize({ height, left: left, top: null, width });
        this._textElements.leftTopStatsText2.resize({ height, left: left, top: null, width });
        this._textElements.leftTopStatsText3.resize({ height, left: left, top: null, width });
        this._textElements.leftTopStatsText4.resize({ height, left: left, top: null, width });
        this._buttons.startButton.resize({ left: left + (0.425 * width), height, top: height - (0.75 * height), width });
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

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        Object.keys(this._textElements).forEach(x => x && this._textElements[x].dispose());
        // Object.keys(this._buttons).forEach(x => x && this._buttons[x].dispose());
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    public endCycle(): { substance: string, quantity: number }[] {
        // Game paused. Nothing should progress.
        if (this._state === LandAndMineState.paused) {
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
            this._explosion.endCycle();
            this._scene.remove(this._lander.mesh);
            this._mainThruster.dispose();
            this._leftThruster.dispose();
            this._rightThruster.dispose();
            return;
        }

        // After successfully reaching escape velocity, no more fuel or oxygen should be spent.
        const currPos = this._lander.mesh.position;
        const landerBottom = currPos.z + 0.11;
        const landerRow = Math.floor((-10 * landerBottom) + 60);
        if (this._state === LandAndMineState.escaped) {
            this._isLeftThrusting = false;
            this._isRightThrusting = false;
            this._isVerticalThrusting = true;
            this._lander.mesh.position.set(currPos.x + this._currentLanderHorizontalSpeed, currPos.y, currPos.z + this._currentLanderVerticalSpeed);
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], true);
            this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
            this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);

            if (landerRow > 120) {
                return [];
            }
            return;
        }

        // All other states consume oxygen still.
        if (this._currentOxygenLevel > 0) {
            this._currentOxygenLevel -= 0.01;
            this._textElements.leftTopStatsText3.update(`Oxygen Level: ${Math.abs(this._currentOxygenLevel).toFixed(0)} %`);
            if (Math.abs(this._currentOxygenLevel) < 20 && this._textElements.leftTopStatsText3.color === COLORS.neutral) {
                this._textElements.leftTopStatsText3.cycle(COLORS.selected);
            }
        }

        // Mining team should move left and right, detect proximity to ship for loading, and nothing else while in walking mode.
        if (this._state === LandAndMineState.walking) {
            if (this._isMiningTeamMovingLeft) {
                const astroLeftPos = this._astronauts[0].mesh.position;
                this._astronauts[0].mesh.position.set(astroLeftPos.x - 0.001, astroLeftPos.y, astroLeftPos.z);
                const miningEquipmentPos = this._astronauts[1].mesh.position;
                this._astronauts[1].mesh.position.set(miningEquipmentPos.x - 0.001, miningEquipmentPos.y, miningEquipmentPos.z);
                const astroRightPos = this._astronauts[2].mesh.position;
                this._astronauts[2].mesh.position.set(astroRightPos.x - 0.001, astroRightPos.y, astroRightPos.z);
                this._camera.position.set(miningEquipmentPos.x, this._camera.position.y, miningEquipmentPos.z);
                this._camera.updateProjectionMatrix();
            } else if (this._isMiningTeamMovingRight) {
                const astroLeftPos = this._astronauts[0].mesh.position;
                this._astronauts[0].mesh.position.set(astroLeftPos.x + 0.001, astroLeftPos.y, astroLeftPos.z);
                const miningEquipmentPos = this._astronauts[1].mesh.position;
                this._astronauts[1].mesh.position.set(miningEquipmentPos.x + 0.001, miningEquipmentPos.y, miningEquipmentPos.z);
                const astroRightPos = this._astronauts[2].mesh.position;
                this._astronauts[2].mesh.position.set(astroRightPos.x + 0.001, astroRightPos.y, astroRightPos.z);
                this._camera.position.set(miningEquipmentPos.x, this._camera.position.y, miningEquipmentPos.z);
                this._camera.updateProjectionMatrix();
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
            this._currentFuelLevel -= 0.05;
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
            this._currentFuelLevel -= 0.05;
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
            this._currentFuelLevel -= 0.05;
            this._currentLanderVerticalSpeed -= VERTICAL_THRUST;
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], true);
        } else {
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);
        }

        // Update Readout for remaining fuel
        this._textElements.leftTopStatsText4.update(`Fuel Level: ${Math.abs(this._currentFuelLevel).toFixed(0)} %`);
        if (Math.abs(this._currentFuelLevel) < 20 && this._textElements.leftTopStatsText4.color === COLORS.neutral) {
            this._textElements.leftTopStatsText4.cycle(COLORS.selected);
        }

        // If lander exceeds bounds, teleport them to the other side.
        if (currPos.x < -6) {
            this._lander.mesh.position.set(5.9, currPos.y, currPos.z);
        }
        if (currPos.x > 6) {
            this._lander.mesh.position.set(-5.9, currPos.y, currPos.z);
        }

        // If ship reaches a certain altitude they've escaped.
        if (landerRow >= 110) {
            this._state = LandAndMineState.escaped;
            return;
        }

        const gridBottomRow = this._grid[landerRow];
        const gridMiddleRow = this._grid[landerRow + 1];
        const gridTopRow = this._grid[landerRow + 2];
        const landerCol = ((100 * currPos.x) % 10) < 5 ? Math.floor((10 * currPos.x) + 60) : Math.ceil((10 * currPos.x) + 60);
        const landerBottomLeft = gridBottomRow[landerCol !== 0 ? landerCol - 1 : 120];
        const landerBottomRight = gridBottomRow[landerCol !== 120 ? landerCol + 1 : 0];
        const landerMiddleLeft = gridMiddleRow[landerCol !== 0 ? landerCol - 1 : 120];
        const landerMiddleRight = gridMiddleRow[landerCol !== 120 ? landerCol + 1 : 0];
        const landerTopLeft = gridTopRow[landerCol !== 0 ? landerCol - 1 : 120];
        const landerTopRight = gridTopRow[landerCol !== 120 ? landerCol + 1 : 0];

        // Collision detection
        if (landerRow < 100
            && gridBottomRow[landerCol] < 3
            && (landerBottomLeft || landerMiddleLeft || landerTopLeft || landerBottomRight || landerMiddleRight || landerTopRight)) {
            this._explosion = new Explosion(this._scene, currPos.x, currPos.z, 0.3, false, 14);
            this._state = LandAndMineState.crashed;
            setTimeout(() => this._destroyTiles(landerCol, landerRow), 900);
        }

        // Check if ship is eligible for landing condition, or crashed condition
        if (landerRow < 100 && gridBottomRow[landerCol] && this._state !== LandAndMineState.landed as LandAndMineState) {
            if (this._state !== LandAndMineState.crashed) {
                if (landerBottomLeft < 3 || landerBottomRight < 3) {
                    this._explosion = new Explosion(this._scene, currPos.x, currPos.z, 0.3, false, 14);
                    this._state = LandAndMineState.crashed;
                    setTimeout(() => this._destroyTiles(landerCol, landerRow), 900);
                    return;
                } else if (landerBottomLeft === 3 || landerBottomRight === 3) {
                    this._explosion = new Explosion(this._scene, currPos.x, currPos.z, 0.3, true, 14);
                    this._state = LandAndMineState.crashed;
                    setTimeout(() => this._destroyTiles(landerCol, landerRow), 900);
                    return;
                } else if (Math.abs(this._currentLanderHorizontalSpeed) >= 0.001 || this._currentLanderVerticalSpeed >= 0.01) {
                    this._explosion = new Explosion(this._scene, currPos.x, currPos.z, 0.3, false, 14);
                    this._state = LandAndMineState.crashed;
                    setTimeout(() => this._destroyTiles(landerCol, landerRow), 900);
                    return;
                }
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
            this._textElements.leftTopStatsText1.update(horizontalSpeedText);
            if (Math.abs(this._currentLanderHorizontalSpeed) >= 0.001 && this._textElements.leftTopStatsText1.color === COLORS.neutral) {
                this._textElements.leftTopStatsText1.cycle(COLORS.selected);
            } else if (Math.abs(this._currentLanderHorizontalSpeed) < 0.001 && this._textElements.leftTopStatsText1.color === COLORS.selected) {
                this._textElements.leftTopStatsText1.cycle(COLORS.neutral);
            }

            this._textElements.leftTopStatsText2.update(`Vertical Speed: ${this._currentLanderVerticalSpeed.toFixed(4)}`);
            if (this._currentLanderVerticalSpeed >= 0.01 && this._textElements.leftTopStatsText2.color === COLORS.neutral) {
                this._textElements.leftTopStatsText2.cycle(COLORS.selected);
            } else if (this._currentLanderVerticalSpeed < 0.01 && this._textElements.leftTopStatsText2.color === COLORS.selected) {
                this._textElements.leftTopStatsText2.cycle(COLORS.neutral);
            }

            return;
        }

        // Change horizontal speed text color if it exceeds safe limits or back if it is within safe bounds.
        this._textElements.leftTopStatsText1.update(horizontalSpeedText);
        if (Math.abs(this._currentLanderHorizontalSpeed) >= 0.001 && this._textElements.leftTopStatsText1.color === COLORS.neutral) {
            this._textElements.leftTopStatsText1.cycle(COLORS.selected);
        } else if (Math.abs(this._currentLanderHorizontalSpeed) < 0.001 && this._textElements.leftTopStatsText1.color === COLORS.selected) {
            this._textElements.leftTopStatsText1.cycle(COLORS.neutral);
        }

        // Change vertical speed text color if it exceeds safe limits or back if it is within safe bounds.
        this._textElements.leftTopStatsText2.update(`Vertical Speed: ${this._currentLanderVerticalSpeed > 0.0001 ? this._currentLanderVerticalSpeed.toFixed(4) : Number(0).toFixed(4)}`);
        if (this._currentLanderVerticalSpeed >= 0.01 && this._textElements.leftTopStatsText2.color === COLORS.neutral) {
            this._textElements.leftTopStatsText2.cycle(COLORS.selected);
        } else if (this._currentLanderVerticalSpeed < 0.01 && this._textElements.leftTopStatsText2.color === COLORS.selected) {
            this._textElements.leftTopStatsText2.cycle(COLORS.neutral);
        }

        // Calculate gravity effect on ship.
        this._lander.mesh.position.set(currPos.x + this._currentLanderHorizontalSpeed, currPos.y, currPos.z + this._currentLanderVerticalSpeed);
        this._currentLanderVerticalSpeed += this._planetSpecifications.gravity;

        // Run all texts through their cycles.
        Object.keys(this._textElements).forEach(x => x && this._textElements[x].cycle());

        return;
    }
}
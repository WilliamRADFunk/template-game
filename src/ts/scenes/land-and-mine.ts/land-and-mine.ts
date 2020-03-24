import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    Texture } from 'three';

import { SoundinatorSingleton } from '../../soundinator';
import { Actor } from '../../models/actor';
import { SceneType } from '../../models/scene-type';
import { getIntersections } from '../../utils/get-intersections';
import { ButtonBase } from '../../controls/buttons/button-base';
import { TextBase } from '../../controls/text/text-base';
import { createLander } from './actors/create-lander';
import { PlanetSpecifications } from '../../models/planet-specification';
import { MainThruster } from './actors/main-thruster';
import { LeftTopStatsText1 } from '../../controls/text/stats/left-top-stats-text-1';
import { COLORS } from '../../styles/colors';
import { TextType } from '../../controls/text/text-type';
import { LeftTopStatsText2 } from '../../controls/text/stats/left-top-stats-text-2';
import { LeftTopStatsText3 } from '../../controls/text/stats/left-top-stats-text-3';
import { LeftTopStatsText4 } from '../../controls/text/stats/left-top-stats-text-4';
import { SideThruster } from './actors/side-thruster';
import { Explosion } from '../../weapons/explosion';

// const border: string = '1px solid #FFF';
const border: string = 'none';

const HORIZONTAL_THRUST: number = 0.0001;

const SIDE_THRUSTER_Y_OFFSET: number = 5;

const SIDE_THRUSTER_Z_OFFSET: number = 0;

const MAIN_THRUSTER_Y_OFFSET: number = 5;

const MAIN_THRUSTER_Z_OFFSET: number = 0.18;

const VERTICAL_THRUST: number = 0.0002;

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
    private _buttons: { [key: string]: ButtonBase } = { };

    private _crashed: boolean = false;

    private _currentFuelLevel: number = 100;

    private _currentLanderHorizontalSpeed: number = 0.01;

    private _currentLanderVerticalSpeed: number = 0.001;

    private _currentOxygenLevel: number = 100;

    private _explosion: Explosion = null;

    private _grid: number[][] = [];

    private _isLeftThrusting: boolean = false;

    private _isRightThrusting: boolean = false;

    private _isVerticalThrusting: boolean = false;

    private _landed: boolean = false;

    private _lander: Actor;

    private _leftThruster: SideThruster;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    private _mainThruster: MainThruster;

    private _meshGrid: Mesh[][] = [];

    private _planetSpecifications: PlanetSpecifications;

    private _rightThruster: SideThruster;

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * Groups of text elements
     */
    private _textElements: { [key: string]: TextBase } = { };

    /**
     * Constructor for the Land and Mine (Scene) class
     * @param scene                     graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param landerTexture             texture for the lander.
     * @param landerTexture             texture for thruster fire.
     * @param planetSpecifications      details about the planet used to operate the scene.
     */
    constructor(
        scene: SceneType,
        landerTexture: Texture,
        fireTexture: Texture,
        planetSpecifications: PlanetSpecifications) {
        this._scene = scene.scene;
        this._planetSpecifications = planetSpecifications;

        /*
         * Grid Values
         * 00: Empty space/sky. Null values
         * 01: Escape Zone. Contact means exit
         * 02: Escape Zone Line. Ship Bottom must be above.
         * 03: Landing Area. Must have 3 flat squares with no obstructions. Must be connected.
         * 04: Impenetrable to drill.
         * 05: Ore type 1
         * 06: Ore type 2
         * 07: Ore type 3
         * 08: Common Rock
         * 09: Danger square: lava, acid, explosive gas, etc.
         * 10: Water or ice
         */

        const maxPeakValley = 10;
        for (let i = 0; i < 121; i++) {
            this._grid[i] = [];
        }
        let startY = Math.floor((Math.random() / 2) * 100) + 20
        startY = startY <= 50 ? startY : 50;
        console.log('startY', startY);

        this._grid[startY][0] = 8;
        this._downPopulate(0, startY);
        let lastY = startY;
        for (let col = 1; col < 121; col++) {
            const cantAscend = (lastY - startY) >= maxPeakValley;
            const cantDescend = (startY - lastY) >= maxPeakValley;
            const elevRando = Math.floor(Math.random() * 100);
            if (!cantAscend && elevRando <= (25 + maxPeakValley)) { // Elevate
                this._grid[lastY + 1][col] = 8;
                lastY++;
            } else if (!cantDescend && elevRando >= (76 - maxPeakValley)) { // Descend
                this._grid[lastY - 1][col] = 8;
                lastY--;
            } else { // Level out
                this._grid[lastY][col] = 8;
            }
            this._downPopulate(col, lastY);
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
        const oreType1Mat = new MeshBasicMaterial({
            color: 0xFFFF66,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        const oreType2Mat = new MeshBasicMaterial({
            color: 0xAAF0D1,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        const oreType3Mat = new MeshBasicMaterial({
            color: 0xFF6EFF,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        const commonRockMat = new MeshBasicMaterial({
            color: 0xB94E48,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        const dangerMat = new MeshBasicMaterial({
            color: 0xFFAA1D,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        const waterMat = new MeshBasicMaterial({
            color: 0x5DADEC,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        const geo = new PlaneGeometry( 0.1, 0.1, 10, 10 );

        for (let row = 0; row < this._grid.length; row++) {
            this._meshGrid[row] = [];
            for (let col = 0; col < this._grid[row].length; col++) {
                let material;
                if (this._grid[row][col] <= 1) {
                    // Empty space
                    continue;
                } else if (this._grid[row][col] === 2) {
                    material = escapeLineMat;
                } else if (this._grid[row][col] === 4) {
                    material = impenetrableMat;
                } else if (this._grid[row][col] === 5) {
                    material = oreType1Mat;
                } else if (this._grid[row][col] === 6) {
                    material = oreType2Mat;
                } else if (this._grid[row][col] === 7) {
                    material = oreType3Mat;
                } else if (this._grid[row][col] === 8) {
                    material = commonRockMat;
                } else if (this._grid[row][col] === 9) {
                    material = dangerMat;
                } else if (this._grid[row][col] === 10) {
                    material = waterMat;
                }

                const block = new Mesh( geo, material );
                block.name = `${Math.random()} - ground - `;
                block.position.set(-6 + (col/10), 15, 6 - row/10);
                block.rotation.set(1.5708, 0, 0);
                this._scene.add(block);
                this._meshGrid[row][col] = block;
            }
        }

        this._onInitialize();
        this._listenerRef = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._listenerRef, false);

        const lander = createLander(landerTexture);
        this._lander = lander;
        this._actors.push(lander);
        this._scene.add(lander.mesh);

        // DOM Events
        const container = document.getElementById('mainview');
        document.onclick = event => {
            event.preventDefault();
            // Three JS object intersections.
            getIntersections(event, container, scene).forEach(el => {

            });
        };
        document.onmousemove = event => {

        };
        document.onkeydown = event => {
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
        };
        document.onkeyup = event => {
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
        };
        const currPos = this._lander.mesh.position;

        this._mainThruster = new MainThruster(this._scene, [currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET]);
        this._leftThruster = new SideThruster(this._scene, [currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], -1);
        this._rightThruster = new SideThruster(this._scene, [currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET]);
    }

    private _downPopulate(x: number, y: number): void {
        for (let row = y - 1; row >= 0; row--) {
            const rando = Math.random() * 100;
            if (rando < 0.5) {
                this._grid[row][x] = 9;
            } else if (rando < 1) {
                this._grid[row][x] = 5;
            } else if (rando < 1.5) {
                this._grid[row][x] = 6;
            } else if (rando < 2) {
                this._grid[row][x] = 7;
            } else {
                this._grid[row][x] = 8;
            }
        }
    }

    /**
     * Creates all of the html elements for the first time on scene creation.
     */
    private _onInitialize(): void {
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
    };

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        // Object.keys(this._textElements).forEach(x => x && this._textElements[x].dispose());
        // Object.keys(this._buttons).forEach(x => x && this._buttons[x].dispose());
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    public endCycle(): { substance: string, quantity: number }[] {
        if (this._crashed) {
            this._explosion.endCycle();
            this._scene.remove(this._lander.mesh);
            this._mainThruster.dispose();
            this._leftThruster.dispose();
            this._rightThruster.dispose();
            return;
        }
        if (this._currentOxygenLevel > 0) {
            this._currentOxygenLevel -= 0.01;
            this._textElements.leftTopStatsText3.update(`Oxygen Level: ${Math.abs(this._currentOxygenLevel).toFixed(0)} %`);
            if (Math.abs(this._currentOxygenLevel) < 20 && this._textElements.leftTopStatsText3.color === COLORS.neutral) {
                this._textElements.leftTopStatsText3.cycle(COLORS.selected);
            }
        }

        const currPos = this._lander.mesh.position;
        if (this._isVerticalThrusting && this._currentFuelLevel > 0) {
            this._currentFuelLevel -= 0.05;
            this._currentLanderVerticalSpeed -= VERTICAL_THRUST;
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], true);
        } else {
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);
        }

        if (this._isLeftThrusting && this._currentFuelLevel > 0) {
            this._currentFuelLevel -= 0.05;
            this._currentLanderHorizontalSpeed -= HORIZONTAL_THRUST;
            this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], true);
        } else {
            this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        }

        if (this._isRightThrusting && this._currentFuelLevel > 0) {
            this._currentFuelLevel -= 0.05;
            this._currentLanderHorizontalSpeed += HORIZONTAL_THRUST;
            this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], true);
        } else {
            this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
        }

        this._textElements.leftTopStatsText4.update(`Fuel Level: ${Math.abs(this._currentFuelLevel).toFixed(0)} %`);
        if (Math.abs(this._currentFuelLevel) < 20 && this._textElements.leftTopStatsText4.color === COLORS.neutral) {
            this._textElements.leftTopStatsText4.cycle(COLORS.selected);
        }

        if (currPos.x < -6.1) {
            this._lander.mesh.position.set(6, currPos.y, currPos.z);
        }
        if (currPos.x > 6.1) {
            this._lander.mesh.position.set(-6, currPos.y, currPos.z);
        }

        const landerBottom = currPos.z + 0.15;

        const landerRow = Math.floor((-10 * landerBottom) + 60);
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

        if (!gridBottomRow[landerCol] && (landerBottomLeft || landerMiddleLeft || landerTopLeft|| landerBottomRight || landerMiddleRight || landerTopRight)) {
            console.log('Kaboom', landerBottomLeft, landerMiddleLeft, landerTopLeft|| landerBottomRight, landerMiddleRight, landerTopRight);
            this._explosion = new Explosion(this._scene, currPos.x, currPos.z, 0.3, true, 14);
            this._crashed = true;
        }

        if (gridBottomRow[landerCol] && !this._landed) {
            if (!this._crashed) {
                const meshCenter = this._meshGrid[landerRow][landerCol];
                const meshLeft = this._meshGrid[landerRow][landerCol !== 0 ? landerCol - 1 : 120];
                const meshRight = this._meshGrid[landerRow][landerCol !== 120 ? landerCol + 1 : 0];
                if (!landerBottomLeft || !landerBottomRight) {
                    console.log('Kaboom', landerBottomLeft, landerBottomRight);
                    this._explosion = new Explosion(this._scene, currPos.x, currPos.z, 0.3, true, 14);
                    this._crashed = true;
                } else if (Math.abs(this._currentLanderHorizontalSpeed) >= 0.001 || this._currentLanderVerticalSpeed >= 0.01) {
                    this._explosion = new Explosion(this._scene, currPos.x, currPos.z, 0.3, true, 14);
                    this._crashed = true;
                } else {
                    this._scene.remove(meshLeft);
                    this._scene.remove(meshRight);
                    this._scene.remove(meshCenter);
                }
            }

            this._lander.mesh.position.set(currPos.x, currPos.y, ((landerRow - 60) / -10) - 0.250000001);
            this._currentLanderHorizontalSpeed = 0;
            this._currentLanderVerticalSpeed = 0;
            this._landed = true;
            this._mainThruster.endCycle([currPos.x, currPos.y + MAIN_THRUSTER_Y_OFFSET, currPos.z + MAIN_THRUSTER_Z_OFFSET], false);
            this._leftThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);
            this._rightThruster.endCycle([currPos.x, currPos.y + SIDE_THRUSTER_Y_OFFSET, currPos.z + SIDE_THRUSTER_Z_OFFSET], false);

            this._textElements.leftTopStatsText1.update(`Horizontal Speed: ${Math.abs(this._currentLanderHorizontalSpeed).toFixed(4)}`);
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

            return null;
        }

        this._landed = false;

        this._textElements.leftTopStatsText1.update(`Horizontal Speed: ${Math.abs(this._currentLanderHorizontalSpeed).toFixed(4)}`);
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

        this._lander.mesh.position.set(currPos.x + this._currentLanderHorizontalSpeed, currPos.y, currPos.z + this._currentLanderVerticalSpeed);
        this._currentLanderVerticalSpeed += this._planetSpecifications.gravity;

        Object.keys(this._textElements).forEach(x => x && this._textElements[x].cycle());
        return null;
    }
}
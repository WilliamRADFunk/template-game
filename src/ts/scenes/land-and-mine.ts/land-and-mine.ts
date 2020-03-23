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

// const border: string = '1px solid #FFF';
const border: string = 'none';

const HORIZONTAL_THRUST: number = 0.0001;

const SIDE_THRUSTER_Y_OFFSET: number = 5;

const SIDE_THRUSTER_Z_OFFSET: number = 0;

const MAIN_THRUSTER_Y_OFFSET: number = 5;

const MAIN_THRUSTER_Z_OFFSET: number = 0.23;

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

    private _currentFuelLevel: number = 100;

    private _currentLanderHorizontalSpeed: number = 0.01;

    private _currentLanderVerticalSpeed: number = 0.001;

    private _currentOxygenLevel: number = 100;

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

        const grid: number[][] = [];
        for (let row = 0; row < 121; row++) {
            grid[row] = [];
            for (let col = 0; col < 121; col++) {
                const rando = Math.random();
                // Escape Zone
                if (row > 110) {
                    grid[row][col] = 1;
                // Escape Zone Line
                } else if (row === 110) {
                    grid[row][col] = 2;
                // Empty Sky
                } else if (60 < row && row < 110) {
                    grid[row][col] = 0;
                // Generates unbroken solid terrain (bedrock)
                } else if (row <= 10) {
                    grid[row][col] = 4;
                // High mixture of (bedrock) and dark base colors
                } else if (row <= 13) {
                    if (rando <= 0.2) { // 90% Bedrock
                        grid[row][col] = 4;
                    } else if (rando <= 0.95) { // 5% common rock
                        grid[row][col] = 8;
                    } else if (rando <= 0.99) { // 4% lava if lava (destructive, ie. acid), or empty
                        grid[row][col] = 9;
                    } else { // 1% ore type 3
                        grid[row][col] = 7;
                    }
                // High mixture of common rock and dark base colors
                } else if (row <= 20) {
                    if (rando <= 0.1) { // 20% Bedrock
                        grid[row][col] = 4;
                    } else if (rando <= 0.70) { // 50% common rock
                        grid[row][col] = 8;
                    } else if (rando <= 0.78) { // 8% lava if lava (destructive, ie. acid), or empty
                        grid[row][col] = 9;
                    } else if (rando <= 0.82) { // 4% ore type 3
                        grid[row][col] = 7;
                    } else if (rando <= 0.88) { // 6% ore type 2
                        grid[row][col] = 6;
                    } else if (rando <= 0.96) { // 8% ore type 1
                        grid[row][col] = 5;
                    } else { // 4% water (ice if cold) if water, or empty.
                        grid[row][col] = 10;
                    }
                // Spread mix of all, but high in common rock.
                } else if (row <= 40) {
                    if (rando <= 0.05) { // 5% Bedrock
                        grid[row][col] = 4;
                    } else if (rando <= 0.6) { // 30% common rock
                        grid[row][col] = 8;
                    } else if (rando <= 0.62) { // 10% lava if lava (destructive, ie. acid), or empty
                        grid[row][col] = 9;
                    } else if (rando <= 0.65) { // 8% ore type 3
                        grid[row][col] = 7;
                    } else if (rando <= 0.70) { // 12% ore type 2
                        grid[row][col] = 6;
                    } else if (rando <= 0.76) { // 15% ore type 1
                        grid[row][col] = 5;
                    } else if (rando <= 0.98) { // 10% empty
                        grid[row][col] = 0;
                    } else { // 10% water (ice if cold) if water, or empty.
                        grid[row][col] = 10;
                    }
                // Spread mix of all..
                } else if (row <= 50) {
                    if (rando <= 0.01) { // 1% Bedrock
                        grid[row][col] = 4;
                    } else if (rando <= 0.40) { // 30% common rock
                        grid[row][col] = 8;
                    } else if (rando <= 0.42) { // 10% lava if lava (destructive, ie. acid), or empty
                        grid[row][col] = 9;
                    } else if (rando <= 0.45) { // 5% ore type 3
                        grid[row][col] = 7;
                    } else if (rando <= 0.50) { // 10% ore type 2
                        grid[row][col] = 6;
                    } else if (rando <= 0.56) { // 15% ore type 1
                        grid[row][col] = 5;
                    } else if (rando <= 0.91) { // 20% empty
                        grid[row][col] = 0;
                    } else { // 9% water (ice if cold) if water, or empty.
                        grid[row][col] = 10;
                    }
                // Landing zones preferences
                } else {
                    if (rando <= 0.25) { // 1% Bedrock
                        grid[row][col] = 8;
                    } else if (rando <= 0.30) {
                        grid[row][col] = 10;
                    } else {
                        grid[row][col] = 0;
                    }
                    // Check planetary preferences
                    // If flat, make 10 landing zones
                    // If moderately flat make 7 landing zones
                    // IF mildly flat make 4
                    // If rough make 2
                    // If extreme make 1.

                    // If landing zone, must have next two spaces as landing zone,
                    // with diminishing flatness % for each next.
                    // Must clear space above, and large enough path to outside.
                }
            }
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

        const meshGrid: Mesh[][] = [];
        for (let row = 0; row < grid.length; row++) {
            meshGrid[row] = [];
            for (let col = 0; col < grid[row].length; col++) {
                let material;
                console.log('row/col', row, col, grid[row][col]);
                if (grid[row][col] <= 1) {
                    // Empty space
                    continue;
                } else if (grid[row][col] === 2) {
                    material = escapeLineMat;
                } else if (grid[row][col] === 4) {
                    material = impenetrableMat;
                } else if (grid[row][col] === 5) {
                    material = oreType1Mat;
                } else if (grid[row][col] === 6) {
                    material = oreType2Mat;
                } else if (grid[row][col] === 7) {
                    material = oreType3Mat;
                } else if (grid[row][col] === 8) {
                    material = commonRockMat;
                } else if (grid[row][col] === 9) {
                    material = dangerMat;
                } else if (grid[row][col] === 10) {
                    material = waterMat;
                }

                const block = new Mesh( geo, material );
                block.name = `${Math.random()} - ground - `;
                block.position.set(-6 + (col/10), 15, 6 - row/10);
                block.rotation.set(1.5708, 0, 0);
                this._scene.add(block);
                meshGrid[row][col] = block;
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

        if (currPos.x < -6.2) {
            this._lander.mesh.position.set(6, currPos.y, currPos.z);
        }
        if (currPos.x > 6.2) {
            this._lander.mesh.position.set(-6, currPos.y, currPos.z);
        }
        if (currPos.z >= 5.8 && !this._landed) {
            this._lander.mesh.position.set(currPos.x, currPos.y, 5.8001);
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
            if (Math.abs(this._currentLanderVerticalSpeed) >= 0.01 && this._textElements.leftTopStatsText2.color === COLORS.neutral) {
                this._textElements.leftTopStatsText2.cycle(COLORS.selected);
            } else if (Math.abs(this._currentLanderVerticalSpeed) < 0.01 && this._textElements.leftTopStatsText2.color === COLORS.selected) {
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
        if (Math.abs(this._currentLanderVerticalSpeed) >= 0.01 && this._textElements.leftTopStatsText2.color === COLORS.neutral) {
            this._textElements.leftTopStatsText2.cycle(COLORS.selected);
        } else if (Math.abs(this._currentLanderVerticalSpeed) < 0.01 && this._textElements.leftTopStatsText2.color === COLORS.selected) {
            this._textElements.leftTopStatsText2.cycle(COLORS.neutral);
        }

        this._lander.mesh.position.set(currPos.x + this._currentLanderHorizontalSpeed, currPos.y, currPos.z + this._currentLanderVerticalSpeed);
        this._currentLanderVerticalSpeed += this._planetSpecifications.gravity;

        Object.keys(this._textElements).forEach(x => x && this._textElements[x].cycle());
        return null;
    }
}
import {
    Mesh,
    MeshPhongMaterial,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    Texture,
    Vector3 } from "three";

import { Actor } from "../../../models/actor";
import { createMiningTeam } from "../utils/create-mining-team";
import { SOUNDS_CTRL } from "../../../controls/controllers/sounds-controller";
import { LootCtrl } from "./loot-controller";
import { ButtonBase } from "../../../controls/buttons/button-base";

/**
 * @class
 * The mining controller class - performs all actions and animations related to movement of miners and the mining process.
 */
export class MiningCtrl {
    /**
     * The mining team.
     */
    private _astronauts: Actor[] = [];

    /**
     * Flag to track if mining team is currently moving left.
     */
    private _isMiningTeamMovingLeft: boolean = false;

    /**
     * Flag to track if mining team is currently moving right.
     */
    private _isMiningTeamMovingRight: boolean = false;

    /**
     * Camera in the scene for zomming in and out from mining team.
     */
    private _camera: OrthographicCamera;

    /**
     * Counters used for tracking animation frames.
     */
    private _counters: { [key: string]: number } = {
        astronautWalkingCounter: 0,
        astronautWalkingCounterClear: 10,
        suffocatingCounter: -1,
        suffocatingCounterClear: 99
    };

    /**
     * Array of drill bit meshes currently on scene in order of creation and depth.
     */
    private _drillBits: Mesh[] = [];

    /**
     * Total number of squares the drill can reach when mining.
     */
    private _maxDrillLength: number;

    /**
     * The grid array with values of all tiles on game map.
     */
    private _grid: number[][] = [];

    /**
     * Reference to the Loot Controller to add or remove loot from tally.
     */
    private _lootCtrl: LootCtrl;

    /**
     * The mesh array with meshes of all tiles on game map.
     */
    private _positionGrid: Vector3[][] = [];

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * Textures needed to make ThreeJS objects.
     */
    private _textures: { [key: string]: Texture } = {};

    /**
     * Constructor for the Mining Controller class.
     * @param scene             ThreeJS scene for adding and removing object
     * @param camera            camera in the scene for zomming in and out from mining team
     * @param grid              the grid array with values of all tiles on game map
     * @param positionGrid      the Vector3 array with positions of all tiles on game map
     * @param lootCtrl          reference to the Loot Controller to add or remove loot from tally
     * @param maxDrillLength    total number of squares the drill can reach when mining
     */
    constructor(
        scene: Scene,
        camera: OrthographicCamera,
        grid: number[][],
        positionGrid: Vector3[][],
        lootCtrl: LootCtrl,
        maxDrillLength: number) {
        this._scene = scene;
        this._camera = camera;
        this._grid = grid;
        this._positionGrid = positionGrid;
        this._lootCtrl = lootCtrl;
        this._maxDrillLength = maxDrillLength;

        this._astronauts = createMiningTeam();
        this._astronauts.filter(astro => !!astro).forEach(astro => {
            this._scene.add(astro.mesh);
            astro.mesh.visible = false;
        });
    }

    /**
     * Calculates the position of each miner, and the equipment.
     * @param left is team moving left
     * @param right is team moving right
     * @returns the position values for left miner, equipment, and right miner, plus if any of them wrapped to other side of screen
     */
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
            let newAstroPos = this._positionGrid[astroLeftRow][astroLeftCol];
            newPositions.left = [newAstroPos.x, astroLeftPos.y, newAstroPos.z];

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][miningEquipmentCol] >= 3) {
                    miningEquipmentRow = z + 1;
                    break;
                }
            }
            newAstroPos = this._positionGrid[miningEquipmentRow][miningEquipmentCol];
            newPositions.middle = [newAstroPos.x, miningEquipmentPos.y, newAstroPos.z];

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][astroRightCol] >= 3) {
                    astroRightRow = z + 1;
                    break;
                }
            }
            newAstroPos = this._positionGrid[astroRightRow][astroRightCol];
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
            let newAstroPos = this._positionGrid[astroLeftRow][astroLeftCol];
            newPositions.left = [newAstroPos.x, astroLeftPos.y, newAstroPos.z];

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][miningEquipmentCol] >= 3) {
                    miningEquipmentRow = z + 1;
                    break;
                }
            }
            newAstroPos = this._positionGrid[miningEquipmentRow][miningEquipmentCol];
            newPositions.middle = [newAstroPos.x, miningEquipmentPos.y, newAstroPos.z];

            for (let z = 109; z > 0; z--) {
                if (this._grid[z][astroRightCol] >= 3) {
                    astroRightRow = z + 1;
                    break;
                }
            }
            newAstroPos = this._positionGrid[astroRightRow][astroRightCol];
            newPositions.right = [newAstroPos.x, astroRightPos.y, newAstroPos.z];
        }
        return newPositions;
    }

    /**
     * Perform all actions related to putting the miners on the screen.
     * @param landerPos position vector of the parked ship
     */
    public disembark(landerPos: Vector3): void {
        const astroLeft = this._astronauts[0];
        const miningEquipment = this._astronauts[1];
        const astroRight = this._astronauts[2];

        const landerBottom = landerPos.z + 0.11;
        const landerRow = Math.floor((-10 * landerBottom) + 60);
        const landerCol = ((100 * landerPos.x) % 10) < 5 ? Math.floor((10 * landerPos.x) + 60) : Math.ceil((10 * landerPos.x) + 60);
        const astroLeftPos = this._positionGrid[landerRow][landerCol !== 0 ? landerCol - 1 : 120];
        const miningEquipmentPos = this._positionGrid[landerRow][landerCol];
        const astroRightPos = this._positionGrid[landerRow][landerCol !== 120 ? landerCol + 1 : 0];

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
            SOUNDS_CTRL.playHollowClank();
        }, 100);
    }

    /**
     * Performs all actions involved in the drill moving downward.
     * @param value quantity value of a loot block when mined
     * @param packUpBtn reference to button that should disappear when drill is not all the way up
     */
    public drillDown(value: number, packUpBtn: ButtonBase): void {
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
                SOUNDS_CTRL.playFooPang();
            }
            if (this._grid[centerDrillRowAfter][drillCol] !== 4) {
                if (this._grid[centerDrillRowAfter][drillCol] === 3) {
                    this._lootCtrl.addTempWater(value);
                    SOUNDS_CTRL.playBlip();
                } else if (this._grid[centerDrillRowAfter][drillCol] === 5) {
                    this._lootCtrl.addTempOre(value);
                    SOUNDS_CTRL.playBlip();
                } else if (this._grid[centerDrillRowAfter][drillCol] === 8) {
                    this._lootCtrl.addTempFood(value);
                    SOUNDS_CTRL.playBlip();
                } else {
                    SOUNDS_CTRL.playBlap();
                }
                this._grid[centerDrillRowAfter][drillCol] = 4;
                const minedBlockPos = this._positionGrid[centerDrillRowAfter][drillCol];

                const geo = new PlaneGeometry( 0.105, 0.105, 10, 10 );
                const minedMat = new MeshPhongMaterial({
                    color: '#FFFFFF',
                    map: this._textures.minedSquare1,
                    shininess: 0,
                    transparent: true
                });
                const minedMesh = new Mesh(geo, minedMat);
                minedMesh.position.set(currDrillPos.x, minedBlockPos.y - 1.5, currDrillPos.z + 0.051);
                minedMesh.rotation.set(-1.5708, 0, 0);
                this._scene.add(minedMesh);
            }
        } else if (centerRowBefore !== centerDrillRowAfter) {
            if (this._maxDrillLength !== this._drillBits.length) {
                packUpBtn.hide();
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
                this._drillBits.push(drillMesh);
                this._scene.add(drillMesh);
            }
        } else {
            currentDrillBit.position.set(currDrillPos.x, currDrillPos.y, currDrillPos.z + 0.001);
        }
    }

    /**
     * Performs all actions involved in the drill moving upward.
     * @param packUpBtn reference to button that should appear when drill is all the way up
     */
    public drillUp(packUpBtn: ButtonBase): void {
        const currentDrillBit = this._drillBits[this._drillBits.length - 1];
        const currDrillPos = currentDrillBit.position;
        const currDrillRowBefore = Math.floor((-10 * currDrillPos.z) + 60);
        const currDrillRowAfter = Math.floor((-10 * (currDrillPos.z - 0.001)) + 60);
        if (currDrillRowAfter !== currDrillRowBefore && this._drillBits.length > 1) {
            this._scene.remove(currentDrillBit);
            this._drillBits.pop();
        } else {
            if (this._drillBits.length === 1) {
                packUpBtn.show();
            } else {
                currentDrillBit.position.set(currDrillPos.x, currDrillPos.y, currDrillPos.z - 0.001);
            }
        }
    }

    /**
     * Getter for current position of equipment portion of the mining team.
     * @returns position vector of the equipment portion of the mining team
     */
    public getEquipmentPosition(): Vector3 {
        return this._astronauts[1].mesh.position;
    }

    /**
     * Getter for whether or not the astronauts dies of suffocation.
     * @returns suffocation state of the astronauts, TRUE === dead | FALSE not dead
     */
    public hasSuffocated(): boolean {
        return this._counters.suffocatingCounter >= this._counters.suffocatingCounterClear;
    }

    /**
     * Perform all actions related to removing the miners on the screen.
     */
    public loadMiners(): void {
        this._astronauts.filter(astro => !!astro).forEach(astro => {
            astro.mesh.visible = false;
        });

        setTimeout(() => {
            this._camera.position.set(0, this._camera.position.y, 0);
            this._camera.zoom = 1;
            this._camera.updateProjectionMatrix();
            SOUNDS_CTRL.playHollowClunk();
        }, 100);
    }

    /**
     * Perform all actions related to removing the drill on the screen.
     */
    public packupDrill(): void {
        this._drillBits.forEach(bit => bit && this._scene.remove(bit));
        this._drillBits.length = 0;
        SOUNDS_CTRL.stopDrilling();
    }

    /**
     * Perform the endCycle iteration for astronaut suffocation animation.
     */
    public runSuffocationSequence(): void {
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
    }

    /**
     * Perform all actions related to putting the drill on the screen.
     */
    public setupDrill(): void {
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
        this._drillBits.push(drillMesh);
        this._scene.add(drillMesh);

        SOUNDS_CTRL.playDrilling();
    }

    /**
     * Perform all actions related to the astronauts halting after walking.
     * @param goingLeft TRUE was walking toward the left | FALSE was walking toward the right
     */
    public standing(goingLeft: boolean): void {
        this._counters.astronautWalkingCounter = 0;
        this._isMiningTeamMovingLeft = false;
        this._isMiningTeamMovingRight = false;

        this._astronauts[0].mesh.visible = true;
        this._astronauts[2].mesh.visible = true;
        this._astronauts[3].mesh.visible = false;
        this._astronauts[6].mesh.visible = false;
        this._astronauts[5].mesh.visible = false;
        this._astronauts[6].mesh.visible = false;

        const newPos = this._getMiningTeamsPositions(goingLeft, !goingLeft);
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
    }

    /**
     * Perform all actions related to the astronauts starting to walk.
     * @param goingLeft TRUE walking toward the left | FALSE walking toward the right
     */
    public startWalking(goingLeft: boolean): void {
        this._isMiningTeamMovingLeft = goingLeft;
        this._isMiningTeamMovingRight = !goingLeft;

        if (!SOUNDS_CTRL.isPlaying('walkingFastGravel')) {
            SOUNDS_CTRL.playWalkingFastGravel();
        }
    }

    /**
     * Perform all actions related to the astronauts dying.
     */
    public suffocating(): void {
        this._counters.suffocatingCounter++;
    }

    /**
     * Perform all actions related to the astronauts walking left or right.
     */
    public walking(): void {
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
    }
}
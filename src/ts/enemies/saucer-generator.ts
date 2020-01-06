import { Scene, Texture } from 'three';

import { Saucer } from './saucer';
import { CollisionatorSingleton } from '../collisionator';
import { ScoreHandler } from '../displays/score-handler';
import { GameLoadData } from '../models/game-load-data';
import { Drone } from '../weapons/drone';
import { SoundinatorSingleton } from '../soundinator';

const saucerStartingPositions: number[][] = [
    [-10, -3], // Left Upper
    [10, -3], // Right Upper
    [-10, 3], // Left Below
    [10, 3], // Right Below
    [-3, -10], // Up Left
    [-3, 10], // Down Left
    [3, -10], // Up Right
    [3, 10], // Down Right
];
/**
 * @class
 * Makes, Moves, and Scores the saucers and their resulting destruction.
 */
export class SaucerGenerator {
    /**
     * Current level player is on, effects max saucers and points per saucer destroyed.
     */
    private currentLevel: number = 1;
    /**
     * Player chosen level of difficulty
     */
    private difficulty: number;
    /**
     * Drone array for ease of iteration
     */
    private drones: Drone[] = [];
    /**
     * Flag to let generator know if game is not lost..
     */
    private isGameActive: boolean = true;
    /**
     * Puts some space between each drone creation.
     */
    private lastDropped: number = 180;
    /**
     * Maximum number of drones that can exist at one time.
     */
    private maxDrones: number = 1;
    /**
     * Maximum number of saucers that can exist at one time.
     */
    private maxSaucers: number = 1;
    /**
     * Saucer array for ease of iteration
     */
    private saucers: Saucer[] = [];
    /**
     * Points multiplier per saucer destroyed.
     */
    private saucerPoints: number = 50;
    /**
     * The loaded textures, used for the saucers.
     */
    private saucerTextures: Texture[];
    /**
     * Reference to the scene, used to remove projectile from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * Reference to the scorekeeper for adding points on saucer destruction.
     */
    private scoreboard: ScoreHandler;
    /**
     * Constructor for the SaucerGenerator class
     * @param scene          graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param scoreboard     reference to the scorekeeper for adding points on saucer destruction.
     * @param saucerTextures textures for the four saucers.
     * @param gld            contains level of difficulty and level chosen by player.
     * @hidden
     */
    constructor(scene: Scene, scoreboard: ScoreHandler, saucerTextures: Texture[], gld: GameLoadData) {
        this.difficulty = gld.difficulty;
        this.currentLevel = gld.level;
        this.saucerPoints = (this.difficulty + 1) * this.saucerPoints;
        this.saucerTextures = saucerTextures;
        this.scene = scene;
        this.scoreboard = scoreboard;
        this.makeSaucersFromLoad();
    }
    /**
     * At the end of each loop iteration, iterate endCycle through all saucers.
     * @param isGameActive flag to let generator know if game is not lost. If it is, don't continue accruing points.
     * @returns TRUE is all saucers are destroyed | FALSE means saucers remain.
     */
    endCycle(isGameActive: boolean): boolean {
        this.isGameActive = isGameActive;
        this.lastDropped--;
        this.handleDrones();
        return !this.handleSaucers() && !this.drones.length;
    }
    /**
     * Cycles through the drones to see if they've been destroyed,
     * if so, award points while game is still active and remove dead drones from list.
     */
    private handleDrones() {
        let tempDrones: Drone[] = [];
        for (let j = 0; j < this.drones.length; j++) {
            let drone = this.drones[j];
            if (drone && !drone.endCycle(this.isGameActive)) {
                this.drones[j] = null;
                if (this.isGameActive) {
                    this.scoreboard.addPoints((this.difficulty + 1) * this.saucerPoints / 2);
                }
            }
            drone = this.drones[j];
            if (drone) {
                tempDrones.push(drone);
            }
        }
        this.drones = tempDrones.slice();
        tempDrones = null;
    }
    /**
     * Cycles through the saucers to see if they've been destroyed,
     * if so, award points while game is still active and remove dead drones from list.
     * Also, drops drones periodically if conditions are just right.
     * @returns TRUE --> at least one saucer is alive | FALSE --> all saucers destroyed.
     */
    private handleSaucers(): boolean {
        let saucersRemain = false;
        for (let i = 0; i < this.saucers.length; i++) {
            if (this.saucers[i]) {
                if (!this.saucers[i].endCycle() && this.isGameActive) {
                    this.scoreboard.addPoints((this.difficulty + 1) * this.saucerPoints);
                }
                if (this.saucers[i].getActive() && this.isGameActive) {
                    saucersRemain = true;
                    const sPos = this.saucers[i].getCurrentPosition();
                    // When in range, saucers can launch missile drones.
                    if (this.drones.length < this.maxDrones &&
                        sPos[0] > -4 && 4 > sPos[0] &&
                        sPos[1] > -4 && 4 > sPos[1] &&
                        Math.random() < 0.01 && this.lastDropped <= 0) {
                        const drone = new Drone(this.scene, this.scoreboard, sPos[0], sPos[1], 10);
                        SoundinatorSingleton.playDrone();
                        drone.addToScene();
                        CollisionatorSingleton.add(drone);
                        this.drones.push(drone);
                        this.lastDropped = 180;
                    }
                }
            }
        }
        return saucersRemain;
    }
    /**
     * Saucer generation in one place to avoid breaking DRY.
     * @returns the created saucer to be added to list at index of choice.
     */
    private makeSaucer(): Saucer {
        const positionRand = Math.floor((Math.random() * 6) + 0);
        const isXNegative = Math.random() < 0.5 ? -1 : 1;
        const isZNegative = Math.random() < 0.5 ? -1 : 1;
        const altRand = (Math.random() * 1.8) + 0;
        let saucer;
        const saucerPos = saucerStartingPositions[positionRand];
        let saucerEnd;
        if (positionRand <= 3) {
            saucerPos[1] += isXNegative * altRand;
            saucerEnd = saucerPos.slice();
            saucerEnd[0] = -1 * saucerPos[0];
        } else {
            saucerPos[0] += isZNegative * altRand;
            saucerEnd = saucerPos.slice();
            saucerEnd[1] = -1 * saucerPos[1];
        }
        saucer = new Saucer(this.scene, this.saucerTextures, saucerPos[0], saucerPos[1], saucerEnd[0], saucerEnd[1], 20, (this.currentLevel + this.difficulty) / 2);
        saucer.addToScene();
        CollisionatorSingleton.add(saucer);
        return saucer;
    }
    /**
     * Saucer generation in one place to avoid breaking DRY, with increasing speeds because of load.
     */
    private makeSaucersFromLoad() {
        for (let i = 0; i < this.maxSaucers; i++) {
            this.saucers.push(this.makeSaucer());
        }
        for (let j = 1; j < this.currentLevel; j++) {
            this.maxSaucers += Math.floor(((this.difficulty + 1) + j) / 4);
            this.saucers.push(this.makeSaucer());
        }
        this.maxDrones = this.maxSaucers;
    }
    /**
     * Start of new level means reactivating saucers, and creating new ones.
     * @param level level number, grabbed from the LevelHandler.
     */
    refreshLevel(level: number): void {
        this.lastDropped = 180;
        this.currentLevel = level;
        // Only increment new saucers if game is still going.
        if (this.isGameActive) {
            this.maxSaucers += Math.floor(((this.difficulty + 1) + level) / 4);
            this.maxDrones = this.maxSaucers;
        }
        // Instantiates new saucers for new level
        for (let i = this.saucers.length; i < this.maxSaucers; i++) {
            this.saucers.push(this.makeSaucer());
        }
        // Reactivate the old, dead saucers
        for (let i = 0; i < this.saucers.length; i++) {
            this.saucers[i].activate();
        }
    }
}
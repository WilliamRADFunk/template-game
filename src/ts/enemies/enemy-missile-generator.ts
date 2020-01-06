import { Color, Scene } from 'three';

import { CollisionatorSingleton } from '../collisionator';
import { ScoreHandler } from '../displays/score-handler';
import { Projectile } from '../weapons/projectile';
import { GameLoadData } from '../models/game-load-data';
/**
 * @class
 * Makes, Moves, and Scores the missiles and their resulting destruction.
 */
export class EnemyMissileGenerator {
    /**
     * Keeps track of level's current color
     */
    private currentColor: Color;
    /**
     * Current level player is on, effects max missiles and points per missile destroyed.
     */
    private currentLevel: number = 1;
    /**
     * Player chosen level of difficulty
     */
    private difficulty: number;
    /**
     * Flag to let generator know if game is not lost.
     */
    private isGameActive: boolean = true;
    /**
     * Maximum number of missiles that can exist at one time.
     */
    private maxMissiles: number = 10;
    /**
     * Points multiplier per enemy missile destroyed.
     */
    private missilePoints: number = 10;
    /**
     * Keeps track of live missiles, to pass along endCycle signals, and destroy calls.
     */
    private missiles: Projectile[] = [];
    /**
     * Reference to the scene, used to remove projectile from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * Reference to the scorekeeper for adding points on enemy missile destruction.
     */
    private scoreboard: ScoreHandler;
    /**
     * Constructor for the EnemyMissileGenerator class
     * @param scene      graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param scoreboard reference to the scorekeeper for adding points on enemy missile destruction.
     * @param color      level color, grabbed from the LevelHandler.
     * @param gld        contains level of difficulty and level chosen by player.
     * @hidden
     */
    constructor(scene: Scene, scoreboard: ScoreHandler, color: Color, gld: GameLoadData) {
        this.difficulty = gld.difficulty;
        this.currentLevel = gld.level;
        this.missilePoints = (this.difficulty + 1) * this.missilePoints;
        this.scene = scene;
        this.scoreboard = scoreboard;
        this.currentColor = color;
        this.makeMissilesFromLoad();
    }
    /**
     * At the end of each loop iteration, iterate endCycle through all missiless.
     * @param isGameActive flag to let generator know if game is not lost. If it is, don't continue accruing points.
     * @param color level color, grabbed from the LevelHandler.
     * @returns TRUE is all missiles are spent | FALSE means missiles remain.
     */
    endCycle(isGameActive: boolean): boolean {
        this.isGameActive = isGameActive;
        let tempMissiles = [];
        for (let i = 0; i < this.missiles.length; i++) {
            let missile = this.missiles[i];
            if (missile && !missile.endCycle()) {
                CollisionatorSingleton.remove(this.missiles[i]);
                this.missiles[i] = null;
                if (isGameActive) {
                    this.scoreboard.addPoints((this.difficulty + 1) * this.missilePoints);
                }
            }
            missile = this.missiles[i];
            if (missile) {
                tempMissiles.push(missile);
            }
        }
        this.missiles = tempMissiles.slice();
        tempMissiles = null;
        // 0 length will result in a true value, any other length will be false;
        return !this.missiles.length;
    }
    /**
     * Missiles generation in one place to avoid breaking DRY.
     */
    private makeMissile(): void {
        const altRand = Math.random();
        const isXNegative = Math.random() < 0.5 ? -1 : 1;
        const isZNegative = Math.random() < 0.5 ? -1 : 1;
        let x, z;
        if (altRand > 0.15) {
            x = isXNegative * ((Math.random() * 12) + 8);
            z = isZNegative * ((Math.random() * 12) + 8);
        } else if (altRand > 0.075) {
            x = 1 * isXNegative;
            z = isZNegative * ((Math.random() * 12) + 8);
        } else {
            x = isXNegative * ((Math.random() * 12) + 8);
            z = 1 * isZNegative;
        }
        // d = sqrt{ (x2-x1)^2 + (y2-y1)^2 }
        const distance = Math.sqrt((x * x) + (z * z));
        // Once created, missile will fly itself, detonate itself, and rease itself. colorArray[this.currentLevel-1]
        this.missiles.push(new Projectile(
            this.scene,
            x,
            z,
            0,
            0,
            distance,
            this.currentColor || new Color(0xFF0000),
            true,
            (0.005 + ((this.currentLevel / 1000) + (this.difficulty / 1000) / 2))));
        CollisionatorSingleton.add(this.missiles[this.missiles.length - 1]);
    }
    
    /**
     * Missiles generation in one place to avoid breaking DRY, with increasing speeds because of load.
     */
    private makeMissilesFromLoad(): void {
        for (let i = this.missiles.length; i < this.maxMissiles; i++) {
            this.makeMissile();
        }
        for (let j = 1; j < this.currentLevel; j++) {
            this.maxMissiles += (this.difficulty + 1);
            this.makeMissile();
        }
    }
    /**
     * Start of new level means rebuilding missiles.
     * @param level level number, grabbed from the LevelHandler.
     * @param color level color, grabbed from the LevelHandler.
     */
    refreshLevel(level: number, color: Color): void {
        this.currentColor = color;
        this.currentLevel = level;
        // Only increment new missiles if game is still going.
        if (this.isGameActive) {
            this.maxMissiles += (this.difficulty + 1);
        }
        // Instantiates new missiles for new level
        for (let i = this.missiles.length; i < this.maxMissiles; i++) {
            this.makeMissile();
        }
    }
}
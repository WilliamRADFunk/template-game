import { Scene, Texture } from 'three';

import { Asteroid } from './asteroid';
import { CollisionatorSingleton } from '../collisionator';
import { ScoreHandler } from '../displays/score-handler';
import { GameLoadData } from '../models/game-load-data';
/**
 * @class
 * Makes, Moves, and Scores the asteroids and their resulting destruction.
 */
export class AsteroidGenerator {
    /**
     * Asteroid array for ease of iteration
     */
    private asteroids: Asteroid[] = [];
    /**
     * The loaded texture, used for the asteroids.
     */
    private aTexture: Texture;
    /**
     * Points multiplier per asteroid destroyed.
     */
    private asteroidPoints: number = 5;
    /**
     * Current level player is on, effects max asteroids and points per asteroid destroyed.
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
     * Maximum number of asteroids that can exist at one time.
     */
    private maxAsteroids: number = 10;
    /**
     * Reference to the scene, used to remove projectile from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * Reference to the scorekeeper for adding points on asteroid destruction.
     */
    private scoreboard: ScoreHandler;
    /**
     * Constructor for the AsteroidGenerator class
     * @param scene           graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param scoreboard      reference to the scorekeeper for adding points on asteroid destruction.
     * @param asteroidTexture texture for the asteroid.
     * @param gld             contains level of difficulty and level chosen by player.
     * @hidden
     */
    constructor(scene: Scene, scoreboard: ScoreHandler, asteroidTexture: Texture, gld: GameLoadData) {
        this.difficulty = gld.difficulty;
        this.currentLevel = gld.level;
        this.asteroidPoints = (this.difficulty + 1) * this.asteroidPoints;
        this.scene = scene;
        this.scoreboard = scoreboard;
        this.aTexture = asteroidTexture;
        this.makeAsteroidsFromLoad();
    }
    /**
     * At the end of each loop iteration, iterate endCycle through all asteroids.
     * @param isGameActive flag to let generator know if game is not lost. If it is, don't continue accruing points.
     * @returns TRUE is all asteroids are destroyed | FALSE means asteroids remain.
     */
    endCycle(isGameActive: boolean): boolean {
        this.isGameActive = isGameActive;
        let asteroidsRemain = false;
        for (let i = 0; i < this.asteroids.length; i++) {
            if (this.asteroids[i]) {
                if (!this.asteroids[i].endCycle() && isGameActive) {
                    this.scoreboard.addPoints((this.difficulty + 1) * this.asteroidPoints);
                }
                if (this.asteroids[i].getActive()) {
                    asteroidsRemain = true;
                }
            }
        }
        return !asteroidsRemain;
    }
    /**
     * Asteroid generation in one place to avoid breaking DRY.
     * @returns the created asteroid.
     */
    private makeAsteroid(): Asteroid {
        const altRand = Math.random();
        const isXNegative = Math.random() < 0.5 ? -1 : 1;
        const isZNegative = Math.random() < 0.5 ? -1 : 1;
        let asteroid;
        if (altRand > 0.15) {
            asteroid = new Asteroid(
                this.scene,  this.aTexture, isXNegative * ((Math.random() * 12) + 8), isZNegative * ((Math.random() * 12) + 8), this.currentLevel + this.difficulty);
        } else if (altRand > 0.075) {
            asteroid = new Asteroid(
                this.scene, this.aTexture, 1 * isXNegative, isZNegative * ((Math.random() * 12) + 8), this.currentLevel + this.difficulty);
        } else {
            asteroid = new Asteroid(
                this.scene, this.aTexture, isXNegative * ((Math.random() * 12) + 8), 1 * isZNegative, this.currentLevel + this.difficulty);
        }
        asteroid.addToScene();
        CollisionatorSingleton.add(asteroid);
        return asteroid;
    }
    /**
     * Asteroid generation in one place to avoid breaking DRY, with increasing speeds because of load.
     */
    private makeAsteroidsFromLoad(): void {
        for (let i = 0; i < this.maxAsteroids; i++) {
            this.asteroids.push(this.makeAsteroid());
        }
        for (let j = 1; j < this.currentLevel; j++) {
            this.maxAsteroids += (this.difficulty + 1);
            this.asteroids.push(this.makeAsteroid());
        }
    }
    /**
     * Start of new level means reactivating asteroids, and creating new ones.
     * @param level level number, grabbed from the LevelHandler.
     */
    refreshLevel(level: number): void {
        this.currentLevel = level;
        // Only increment new units if game is still going.
        if (this.isGameActive) {
            this.maxAsteroids += (this.difficulty + 1);
        }
        // Instantiates new asteroids for new level
        for (let i = this.asteroids.length; i < this.maxAsteroids; i++) {
            this.asteroids.push(this.makeAsteroid());
        }
        // Reactivate the old, dead asteroids
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].activate();
        }
    }
}
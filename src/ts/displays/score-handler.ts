import {
    Color,
    Font,
    Mesh,
    MeshLambertMaterial,
    Scene,
    TextGeometry} from 'three';
import { GameLoadData } from '../models/game-load-data';

export type ScoreGeometries = TextGeometry[];
export type ScoreDigits = Mesh[];
/**
 * Iterable list of x positions for each digit of the score.
 * Necessary since constantly recreating TextGeometries with each new score is very costly.
 */
const positionIndex = [ -3.5, -3.15, -2.8, -2.45, -2.1, -1.75, -1.4, -1.05, -0.7, -0.35 ];
/**
 * @class
 * Keeps track of all things score related.
 */
export class ScoreHandler {
    /**
     * Keeps track of level's current color
     */
    private currentColor: Color;
    /**
     * Keeps track of player's current score
     */
    private currentScore: number = 0;
    /**
     * Keeps track if player's points increase warrants a regenerated base.
     */
    private regenBase: boolean = false;
    /**
     * Keeps track if player's points increase warrants a regenerated satellite.
     */
    private regenSat: boolean = false;
    /**
     * Reference to the scene, used to remove text in order to change it.
     */
    private scene: Scene;
    /**
     * The loaded font, used for the scoreboard.
     */
    private scoreFont: Font;
    /**
     * Controls size and shape of the score
     */
    private scoreGeometry: TextGeometry;
    /**
     * A better way to iterate through the digit geometries.
     */
    private scoreGeometries: ScoreGeometries[] = [[], [], [], [], [], [], [], [], [], []];
    /**
     * Controls the color of the score material
     */
    private scoreMaterial: MeshLambertMaterial;
    /**
     * Controls the overall rendering of the score
     */
    private score: Mesh
    /**
     * A better way to iterate through the digit meshes.
     */
    private scores: ScoreDigits[] = [[], [], [], [], [], [], [], [], [], []];
    /**
     * Keeps track of player's score amount gained since last base regeneration.
     */
    private scoreSinceBase: number = 0;
    /**
     * Keeps track of player's score amount gained since last satellite regeneration.
     */
    private scoreSinceSatellite: number = 0;
    /**
     * Constructor for the ScoreHandler class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param color         level color, grabbed from the LevelHandler.
     * @param gameLoadData  game state to use from load data.
     * @hidden
     */
    constructor(scene: Scene, color: Color, scoreFont: Font, gameLoadData: GameLoadData) {
        this.scene = scene;
        this.scoreFont = scoreFont;
        this.currentColor = color;
        this.currentScore = gameLoadData.score;
        this.scoreSinceBase = gameLoadData.score;
        this.scoreSinceSatellite = gameLoadData.score;
        this.scoreMaterial = new MeshLambertMaterial( {color: color || 0x084E70} );
        this.createText();
    }
    /**
     * Adds points when blowing up asteroids, enemy missiles, and ufos.
     * @param points the amount of points to add to current score.
     */
    addPoints(points: number): void {
        this.currentScore += points;
        this.scoreSinceBase += points;
        this.scoreSinceSatellite += points;
        if (this.scoreSinceBase >= 50000) {
            this.scoreSinceBase -= 50000;
            this.regenBase = true;
            this.scoreSinceSatellite = 0;
        }
        if (!this.regenBase && this.scoreSinceSatellite >= 25000) {
            this.scoreSinceSatellite -= 25000;
            this.regenSat = true;
        }
        if (this.score && this.score.visible) {
            this.changeScore();
        }
    }
    /**
     * Flips only score relevent digits to visible.
     */
    private changeScore() {
        const curScore = this.currentScore.toString();
        for (let i = 0; i < positionIndex.length; i++) {
            for (let j = 0; j < positionIndex.length; j++) {
                const mesh: Mesh = this.scores[i][j];
                mesh.visible = false;
            }
        }
        for (let i = 0; i < curScore.length; i++) {
            const mesh: Mesh = this.scores[i][Number(curScore[i])];
            mesh.visible = true;
        }
    }
    /**
     * Creates the text in one place to obey the DRY rule.
     */
    private createText(): void {
        // Only remove score if it was added before.
        if (this.score) {
            this.removePreviousDigits();
        }
        // Added before or not, make a new one and add it.
        // Sadly TextGeometries must be removed and added whenever the text content changes.
        this.scoreGeometry = new TextGeometry(`Score: `,
            {
                font: this.scoreFont,
                size: 0.3,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 0.5,
                bevelSegments: 3
            });
        this.score = new Mesh( this.scoreGeometry, this.scoreMaterial );
        this.score.position.x = -5.5;
        this.score.position.y = 0.75;
        this.score.position.z = -5.4;
        this.score.rotation.x = -1.5708;
        this.scene.add(this.score);
        
        for (let i = 0; i < positionIndex.length; i++) {
            for (let j = 0; j < positionIndex.length; j++) {
                this.scoreGeometries[i][j] = new TextGeometry(`${j}`,
                    {
                        font: this.scoreFont,
                        size: 0.3,
                        height: 0.2,
                        curveSegments: 12,
                        bevelEnabled: false,
                        bevelThickness: 1,
                        bevelSize: 0.5,
                        bevelSegments: 3
                    });
                this.scores[i][j] = new Mesh( this.scoreGeometries[i][j], this.scoreMaterial );
                this.scores[i][j].position.x = positionIndex[i];
                this.scores[i][j].position.y = 0.75;
                this.scores[i][j].position.z = -5.38;
                this.scores[i][j].rotation.x = -1.5708;
                this.scores[i][j].visible = false;
                this.scene.add(this.scores[i][j]);
            }
        }
        this.changeScore();
    }
    /**
     * At the end of each loop iteration, score updates with time increase.
     * @param hide hide the score if new level, so old color isn't showing.
     */
    endCycle(hide?: boolean): void {
        if (this.score) {
            if (hide) {
                this.score.visible = false;
                for (let i = 0; i < positionIndex.length; i++) {
                    for (let j = 0; j < positionIndex.length; j++) {
                        const mesh: Mesh = this.scores[i][j];
                        mesh.visible = false;
                    }
                }
            } else if (this.score.visible) {
                this.changeScore();
            }
        }
    }
    /**
     * Passes current score value back to caller.
     * @returns the current score at time of function call.
     */
    getScore(): number {
        return this.currentScore;
    }
    /**
     * Returns regeneration bonuses if there are any and resets the flags.
     * @returns bonus object containing last known regeneration rewards.
     */
    getBonuses(): { base: boolean; sat: boolean; } {
        const bonus = { base: this.regenBase, sat: this.regenSat };
        this.regenBase = false;
        this.regenSat = false;
        return bonus;
    }
    /**
     * Only recreate the digits with the new color
     * @param color level color, grabbed from the LevelHandler
     */
    nextLevel(color: Color) {
        this.currentColor = color;
        this.scoreMaterial = new MeshLambertMaterial( {color: this.currentColor} );
        this.createText();
    }
    /**
     * Removes all previously created score text and digits to change color.
     */
    private removePreviousDigits() {
        this.scene.remove(this.score);
        for (let i = 0; i < positionIndex.length; i++) {
            for (let j = 0; j < positionIndex.length; j++) {
                this.scene.remove(this.scores[i][j]);
            }
        }
    }
}
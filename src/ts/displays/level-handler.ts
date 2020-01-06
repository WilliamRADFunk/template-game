import {
    Color,
    Font,
    Mesh,
    MeshLambertMaterial,
    Scene,
    TextGeometry,
    TextGeometryParameters } from 'three';
import { GameLoadData } from '../models/game-load-data';
import { CheckColorBrighness } from '../utils/check-color-brightness';
import { SoundinatorSingleton } from '../soundinator';

const randomColor = require('randomcolor');
/**
 * @class
 * Keeps track of all things level related.
 */
export class LevelHandler {
    /**
     * Controls the overall rendering of the banner display
     */
    private banner: Mesh;
    /**
     * Controls size and shape of the banner display
     */
    private bannerGeometry: TextGeometry;
    /**
     * Controls the color of the banner display material
     */
    private bannerMaterial: MeshLambertMaterial;
    /**
     * Keeps track of player's current level
     */
    private currentLevel: number = 1;
    /**
     * Current banner opacity, which creates the illusion of 'animation'.
     */
    private currentOpacity: number = 0.01;
    /**
     * Player chosen level of difficulty.
     */
    private difficultyLevel: number;
    /**
     * Controls the overall rendering of the difficulty display
     */
    private diffText: Mesh;
    /**
     * Controls size and shape of the difficulty display
     */
    private diffTextGeometry: TextGeometry;
    /**
     * Since most of the text on the menu has same parameters, use one variable.
     */
    private fontLowerTextParams: TextGeometryParameters;
    /**
     * Tracks which phase of the animation currently in.
     */
    private isBannerExpanding: boolean = true;
    /**
     * Prevents other things from moving if level display is animating a new level.
     */
    private isLevelAnimating: boolean = true;
    /**
     * Controls the overall rendering of the level display
     */
    private level: Mesh;
    /**
     * The loaded font, used for the level display.
     */
    private levelColor: Color;
    /**
     * The loaded font, used for the level text and banners.
     */
    private levelFont: Font;
    /**
     * Controls size and shape of the level display
     */
    private levelGeometry: TextGeometry;
    /**
     * Controls the color of the level display material
     */
    private levelMaterial: MeshLambertMaterial;
    /**
     * Reference to the scene, used to remove projectile from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * Flag to distinguish between level banner and game over banner.
     */
    private useLevelBanner: boolean = true;
    /**
     * Constructor for the LevelHandler class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param levelFont     loaded font to use for score text.
     * @param gameLoadData  game state to use from load data.
     * @hidden
     */
    constructor(scene: Scene, levelFont: Font, gameLoadData: GameLoadData) {
        this.difficultyLevel = gameLoadData.difficulty;
        this.currentLevel = gameLoadData.level;
        this.levelFont = levelFont;
        this.fontLowerTextParams = {
            font: this.levelFont,
            size: 0.3,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        }
        do {
            const colorHex = randomColor();
            if (CheckColorBrighness(colorHex)) {
                this.levelColor = new Color(colorHex);
                break;
            }
        } while(true);
        this.scene = scene;
        this.levelMaterial = new MeshLambertMaterial( {color: this.levelColor} );
        this.createText();
    }
    /**
     * Creates the text in one place to obey the DRY rule.
     */
    private createBanner(): void {
        let xPos = -1.5;
        let text = `Level: ${this.currentLevel}`;
        if (!this.useLevelBanner) {
            text = 'Game Over';
            xPos = -2.25;
            this.bannerMaterial = new MeshLambertMaterial({
                color: 0xFF0000,
                opacity: this.currentOpacity,
                transparent: true
            });
        } else {
            this.bannerMaterial = new MeshLambertMaterial({
                color: this.levelColor,
                opacity: this.currentOpacity,
                transparent: true
            });
        }
        // Added before or not, make a new one and add it.
        // Sadly TextGeometries must be removed and added whenever the text content changes.
        this.bannerGeometry = new TextGeometry(text,
            {
                font: this.levelFont,
                size: 0.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 0.5,
                bevelSegments: 3
            });
        this.banner = new Mesh( this.bannerGeometry, this.bannerMaterial );
        this.banner.position.x = xPos;
        this.banner.position.y = 0.5;
        this.banner.position.z = -2;
        this.banner.rotation.x = -1.5708;
        this.scene.add(this.banner);
    }
    /**
     * Creates the text in one place to obey the DRY rule.
     */
    private createText(): void {
        // Only remove level if it was added before.
        if (this.level) this.scene.remove(this.level);
        this.levelGeometry = new TextGeometry(`Level: ${this.currentLevel}`, this.fontLowerTextParams);
        this.level = new Mesh( this.levelGeometry, this.levelMaterial );
        this.level.position.x = -5.5;
        this.level.position.y = 0.5;
        this.level.position.z = 5.8;
        this.level.rotation.x = -1.5708;
        this.scene.add(this.level);
        // Only remove lediffTextvel if it was added before.
        if (this.diffText) this.scene.remove(this.diffText);
        let mode = 'Easy';
        let xPos = 2.75;
        if (this.difficultyLevel === 1) {
            mode = 'Normal';
            xPos = 2.3;
        } else if (this.difficultyLevel === 2) {
            mode = 'Hard';
            xPos = 2.75;
        } else if (this.difficultyLevel === 3) {
            mode = 'Hardcore';
            xPos = 1.5;
        }
        this.diffTextGeometry = new TextGeometry(`Mode: ${mode}`, this.fontLowerTextParams);
        this.diffText = new Mesh( this.diffTextGeometry, this.levelMaterial );
        this.diffText.position.set(xPos, 0.5, 5.8);
        this.diffText.rotation.x = -1.5708;
        this.scene.add(this.diffText);
    }
    /**
     * At the end of each loop iteration, level updates with time increase.
     */
    endCycle(): void {
        if (!this.level) {
            this.createText();
        }
    }
    /**
     * Lets LevelHandler know the game is over, and to use the Game Over banner.
     */
    endGame(): void {
        this.useLevelBanner = false;
        this.isLevelAnimating = true;
        SoundinatorSingleton.playGameOver();
    }
    /**
     * Returns the current level's color'.
     * @returns current color to use for the level dependent objects.
     */
    getColor(): Color {
        return this.levelColor;
    }
    /**
     * Returns the current level player is on.
     * @returns the current level player is on.
     */
    getLevel(): number {
        return this.currentLevel;
    }
    /**
     * Returns animating state of level.
     * @returns TRUE if level banner is still animating | FALSE if not.
     */
    isAnimating(): boolean {
        return this.isLevelAnimating;
    }
    /**
     * Increases currentLevel by one, and runs the new level display animation.
     */
    nextLevel(): void {
        this.currentLevel++;
        do {
            const colorHex = randomColor();
            if (CheckColorBrighness(colorHex)) {
                this.levelColor = new Color(colorHex);
                break;
            }
        } while(true);
        this.levelMaterial = new MeshLambertMaterial( {color: this.levelColor} );
        this.level.visible = false;
        this.diffText.visible = false;
        this.isLevelAnimating = true;
    }
    /**
     * Fades level banner in and out before resuming play.
     */
    runAnimationCycle(): boolean {
        // Only if loadFont is ready and banner hasn't been already created.
        if (!this.banner) this.createBanner();
        // Normal fade in and fade out movements ofr animation until done (if not infinite loop).
        if (this.isBannerExpanding) {
            if (this.currentOpacity >= 1) {
                this.isBannerExpanding = false;
                this.createText();
                return true;
            } else this.currentOpacity += 0.01;
            this.bannerMaterial.opacity = this.currentOpacity;
        } else {
            if (this.currentOpacity <= 0) {
                this.isBannerExpanding = true;
                // Game Over keeps flashing | New Level doesn't
                if (this.useLevelBanner) {
                    this.isLevelAnimating = false;
                    this.scene.remove(this.banner);
                    this.banner = null;
                }
            } else {
                this.currentOpacity -= 0.01;
                this.bannerMaterial.opacity = this.currentOpacity;
            }
        }
    }
}
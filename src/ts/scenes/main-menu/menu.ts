import {
    DoubleSide,
    Font,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PlaneGeometry,
    PointLight,
    Scene,
    TextGeometry,
    TextGeometryParameters,
    AmbientLight} from 'three';

import { HelpHandler } from '../help-screen/help-handler';
import { LoadHandler } from '../load-screen/load-handler';
import { SoundinatorSingleton } from '../../soundinator';
import { SceneType } from '../../models/scene-type';

// const backgroundColor = 0xFF0044;
const backgroundColor: number = null;

// const backgroundOpacity = 1;
const backgroundOpacity = 0;

/**
 * @class
 * Keeps track of all things menu related.
 */
export class Menu {
    /**
     * Click surface for the Easy button.
     */
    private barrierEasy: Mesh;
    /**
     * Click surface for the Hard button.
     */
    private barrierHard: Mesh;
    /**
     * Click surface for the Hardcore button.
     */
    private barrierHardcore: Mesh;
    /**
     * Click surface for the Help button.
     */
    private barrierHelp: Mesh;
    /**
     * Click surface for the Load button.
     */
    private barrierLoad: Mesh;
    /**
     * Click surface for the Normal button.
     */
    private barrierNormal: Mesh;
    /**
     * Click surface for the Off button.
     */
    private barrierOff: Mesh;
    /**
     * Click surface for the On button.
     */
    private barrierOn: Mesh;
    /**
     * Click surface for the Start button.
     */
    private barrierStart: Mesh;
    /**
     * Controls the background click surface of buttons.
     */
    private clickMaterial: MeshBasicMaterial;
    /**
     * Controls the overall rendering of the copyright display
     */
    private copyright: Mesh;
    /**
     * Controls size and shape of the copyright text
     */
    private copyrightGeometry: TextGeometry;
    /**
     * Easy, Medium, Hard, Hardcore
     */
    private difficultyLevel: number = 3; // Hardcore
    /**
     * Controls the overall rendering of the easy button display
     */
    private easy: Mesh;
    /**
     * Controls size and shape of the easy button text
     */
    private easyGeometry: TextGeometry;
    /**
     * Since most of the text on the menu has same parameters, use one variable.
     */
    private fontDifficultyBtnParams: TextGeometryParameters;
    /**
     * Controls the overall rendering of the hard button display
     */
    private hard: Mesh;
    /**
     * Controls size and shape of the hard button text
     */
    private hardGeometry: TextGeometry;
    /**
     * Controls the overall rendering of the hardcore button display
     */
    private hardcore: Mesh;
    /**
     * Controls size and shape of the hardcore button text
     */
    private hardcoreGeometry: TextGeometry;
    /**
     * Controls the overall rendering of the help button display
     */
    private help: Mesh;
    /**
     * Controls size and shape of the help button text
     */
    private helpGeometry: TextGeometry;
    /**
     * Paints the help screen.
     */
    private helpHandler: HelpHandler;
    /**
     * Standard ambient light to better see the help menu with.
     */
    private helpLight: AmbientLight;
    /**
     * Controls the overall rendering of the load button display
     */
    private load: Mesh;
    /**
     * Controls size and shape of the load button text
     */
    private loadGeometry: TextGeometry;
    /**
     * Paints the load screen.
     */
    private loadHandler: LoadHandler;
    /**
     * Controls the overall rendering of the main banner display
     */
    private mainBanner: Mesh;
    /**
     * Controls size and shape of the main banner text
     */
    private mainBannerGeometry: TextGeometry;
    /**
     * Loaded font for menu text.
     */
    private menuFont: Font;
    /**
     * Controls the color of the untouched button display material
     */
    private menuMaterial: MeshLambertMaterial;
    /**
     * Controls the color of the selected button display material
     */
    private menuSelectedMaterial: MeshLambertMaterial;
    /**
     * Keeps track of menu mode.
     * 0 --> Menu options
     * 1 --> Help screen
     * 2 --> Load screen
     */
    private mode: number = 0;
    /**
     * Controls the overall rendering of the normal button display
     */
    private normal: Mesh;
    /**
     * Controls size and shape of the normal button text
     */
    private normalGeometry: TextGeometry;
    /**
     * Controls the overall rendering of the off button display
     */
    private off: Mesh;
    /**
     * Controls size and shape of the off button text
     */
    private offGeometry: TextGeometry;
    /**
     * Controls the overall rendering of the on button display
     */
    private on: Mesh;
    /**
     * Controls size and shape of the on button text
     */
    private onGeometry: TextGeometry;
    /**
     * The distant dim light that allows the shimmer effect to happen.
     */
    private pointLight: PointLight;
    /**
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private scene: Scene;
    /**
     * Controls the light that give the text its shine.
     */
    private shimmer: PointLight;
    /**
     * Controls the overall rendering of the Sound text display
     */
    private sound: Mesh;
    /**
     * Controls the overall rendering of the start button display
     */
    private start: Mesh;
    /**
     * Controls size and shape of the start button text
     */
    private startGeometry: TextGeometry;
    /**
     * Constructor for the Menu class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param menuFont loaded font to use for menu button text.
     * @hidden
     */
    constructor(scene: SceneType, menuFont: Font) {
        this.menuFont = menuFont;
        this.scene = scene.scene;
        this.fontDifficultyBtnParams = {
            font: this.menuFont,
            size: 0.3,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };

        this.shimmer = new PointLight(0x66FF66, 2);
        this.shimmer.position.set(-20, 2, 0);
        this.scene.add(this.shimmer);

        this.pointLight = new PointLight(0x66FF66, 1);
        this.pointLight.position.set(15, 2, 0);
        this.scene.add(this.pointLight);
        
        this.menuMaterial = new MeshLambertMaterial({
            color: 0x0066FF,
            opacity: 1,
            transparent: true
        });
        this.menuSelectedMaterial = new MeshLambertMaterial({
            color: 0xFFCC00,
            opacity: 1,
            transparent: true
        });
        this.clickMaterial = new MeshBasicMaterial({
            color: backgroundColor,
            opacity: backgroundOpacity,
            transparent: true,
            side: DoubleSide
        });
        // Create the start collision layer
        const startBarrierGeometry = new PlaneGeometry( 1.5, 0.8, 0, 0 );
        this.barrierStart = new Mesh( startBarrierGeometry, this.clickMaterial );
        this.barrierStart.name = 'Start';
        this.barrierStart.position.set(0, 0, -1);
        this.barrierStart.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierStart);
        // Create the easy collision layer
        const easyBarrierGeometry = new PlaneGeometry( 1.4, 0.8, 0, 0 );
        this.barrierEasy = new Mesh( easyBarrierGeometry, this.clickMaterial );
        this.barrierEasy.name = 'Easy';
        this.barrierEasy.position.set(-3.2, 0, 0);
        this.barrierEasy.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierEasy);
        // Create the normal collision layer
        const normalBarrierGeometry = new PlaneGeometry( 1.9, 0.8, 0, 0 );
        this.barrierNormal = new Mesh( normalBarrierGeometry, this.clickMaterial );
        this.barrierNormal.name = 'Normal';
        this.barrierNormal.position.set(-1.35, 0, 0);
        this.barrierNormal.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierNormal);
        // Create the hard collision layer
        const hardBarrierGeometry = new PlaneGeometry( 1.4, 0.8, 0, 0 );
        this.barrierHard = new Mesh( hardBarrierGeometry, this.clickMaterial );
        this.barrierHard.name = 'Hard';
        this.barrierHard.position.set(0.5, 0, 0);
        this.barrierHard.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierHard);
        // Create the hardcore collision layer
        const hardcoreBarrierGeometry = new PlaneGeometry( 2.6, 0.8, 0, 0 );
        this.barrierHardcore = new Mesh( hardcoreBarrierGeometry, this.clickMaterial );
        this.barrierHardcore.name = 'Hardcore';
        this.barrierHardcore.position.set(2.7, 0, 0);
        this.barrierHardcore.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierHardcore);
        // Create the load collision layer
        const loadBarrierGeometry = new PlaneGeometry( 1.5, 0.8, 0, 0 );
        this.barrierLoad = new Mesh( loadBarrierGeometry, this.clickMaterial );
        this.barrierLoad.name = 'Load';
        this.barrierLoad.position.set(0, 0, 1);
        this.barrierLoad.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierLoad);
        // Create the help collision layer
        const helpBarrierGeometry = new PlaneGeometry( 1.5, 0.8, 0, 0 );
        this.barrierHelp = new Mesh( helpBarrierGeometry, this.clickMaterial );
        this.barrierHelp.name = 'Help';
        this.barrierHelp.position.set(0, 0, 2);
        this.barrierHelp.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierHelp);
        // Create the sound off collision layer
        const offBarrierGeometry = new PlaneGeometry( 1, 0.8, 0, 0 );
        this.barrierOff = new Mesh( offBarrierGeometry, this.clickMaterial );
        this.barrierOff.name = 'Off';
        this.barrierOff.position.set(1.2, 0, 3);
        this.barrierOff.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierOff);
        // Create the sound on collision layer
        const onBarrierGeometry = new PlaneGeometry( 0.9, 0.8, 0, 0 );
        this.barrierOn = new Mesh( onBarrierGeometry, this.clickMaterial );
        this.barrierOn.name = 'On';
        this.barrierOn.position.set(0, 0, 3);
        this.barrierOn.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierOn);
        // Main Banner button text
        this.mainBannerGeometry = new TextGeometry('Enzmann\'s Odyssey',
            {
                font: this.menuFont,
                size: 0.6,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 0.5,
                bevelSegments: 3
            });
        this.mainBanner = new Mesh( this.mainBannerGeometry, this.menuSelectedMaterial );
        this.mainBanner.position.set(-3.85, -0.5, -3);
        this.mainBanner.rotation.x = -1.5708;
        this.scene.add(this.mainBanner);
        // Copyright text
        this.copyrightGeometry = new TextGeometry('Copyright 2020 Tenacious Teal Games',
            {
                font: this.menuFont,
                size: 0.2,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 0.5,
                bevelSegments: 3
            });
        this.copyright = new Mesh( this.copyrightGeometry, this.menuMaterial );
        this.copyright.position.set(-5.8, -0.5, 5.8);
        this.copyright.rotation.x = -1.5708;
        this.scene.add(this.copyright);
        // Start button text
        this.startGeometry = new TextGeometry('Start', this.fontDifficultyBtnParams);
        this.start = new Mesh( this.startGeometry, this.menuMaterial );
        this.start.position.set(-0.6, -0.5, -0.8);
        this.start.rotation.x = -1.5708;
        this.scene.add(this.start);
        // Easy button text
        this.createDifficultyButtons(0, ((this.difficultyLevel === 0) ? this.menuSelectedMaterial : this.menuMaterial), false);
        // Normal button text
        this.createDifficultyButtons(1, ((this.difficultyLevel === 1) ? this.menuSelectedMaterial : this.menuMaterial), false);
        // Hard button text
        this.createDifficultyButtons(2, ((this.difficultyLevel === 2) ? this.menuSelectedMaterial : this.menuMaterial), false);
        // Hardcore button text
        this.createDifficultyButtons(3, ((this.difficultyLevel === 3) ? this.menuSelectedMaterial : this.menuMaterial), false);
        // Load button text
        this.loadGeometry = new TextGeometry('Load', this.fontDifficultyBtnParams);
        this.load = new Mesh( this.loadGeometry, this.menuMaterial );
        this.load.position.set(-0.5, -0.5, 1.2);
        this.load.rotation.x = -1.5708;
        this.scene.add(this.load);
        // Help button text
        this.helpGeometry = new TextGeometry('Help', this.fontDifficultyBtnParams);
        this.help = new Mesh( this.helpGeometry, this.menuMaterial );
        this.help.position.set(-0.5, -0.5, 2.2);
        this.help.rotation.x = -1.5708;
        this.scene.add(this.help);

        this.helpHandler = new HelpHandler(this.scene, this.menuFont);
        this.loadHandler = new LoadHandler(this.scene, this.menuFont);

        // Sound text
        const soundGeometry = new TextGeometry('Sound: ', this.fontDifficultyBtnParams);
        this.sound = new Mesh( soundGeometry, this.menuMaterial );
        this.sound.position.set(-2.3, -0.5, 3.2);
        this.sound.rotation.x = -1.5708;
        this.scene.add(this.sound);
        // On button text
        this.onGeometry = new TextGeometry('ON', this.fontDifficultyBtnParams);
        this.on = new Mesh(
            this.onGeometry,
            SoundinatorSingleton.getMute() ? this.menuMaterial : this.menuSelectedMaterial);
        this.on.position.set(-0.3, -0.5, 3.2);
        this.on.rotation.x = -1.5708;
        this.scene.add(this.on);
        // Off button text
        this.offGeometry = new TextGeometry('OFF', this.fontDifficultyBtnParams);
        this.off = new Mesh(
            this.offGeometry,
            SoundinatorSingleton.getMute() ? this.menuSelectedMaterial : this.menuMaterial);
        this.off.position.set(0.85, -0.5, 3.2);
        this.off.rotation.x = -1.5708;
        this.scene.add(this.off);
    }
    /**
     * Changes difficulty level, and instigates the altering of the button texts associated with that choice.
     * @param diff the selected diffulty choice (0 --> easy, 1 --> normal, 2 --> hard, 3 --> hardcore)
     */
    changeDifficulty(diff: number): void {
        if (diff === this.difficultyLevel) return;
        this.createDifficultyButtons(this.difficultyLevel, this.menuMaterial, true);
        this.difficultyLevel = diff;
        this.createDifficultyButtons(this.difficultyLevel, this.menuSelectedMaterial, true);
    }
    /**
     * Passes load char onto the loadHandler.
     * @param char player clicked on a specific char. This is that char 0-F
     */
    charEntered(char: string): void {
        this.loadHandler.charEntered(char);
    }
    /**
     * Called to (re)create difficulty menu button text
     * @param buttonIndex   the selected diffulty choice (0 --> easy, 1 --> normal, 2 --> hard, 3 --> hardcore)
     * @param material      the material (color mostly) to use in new text mesh
     * @param removeFirst   to determine if text mesh should first be removed from scene (TRUE --> remove | FALSE --> no remove)
     */
    private createDifficultyButtons(buttonIndex: number, material: MeshLambertMaterial, removeFirst: boolean): void {
        switch(buttonIndex) {
            case 0: {
                if (removeFirst) {
                    this.scene.remove(this.easy);
                }
                // Selected easy button text
                this.easyGeometry = new TextGeometry('Easy', this.fontDifficultyBtnParams);
                this.easy = new Mesh( this.easyGeometry, material );
                this.easy.position.set(-3.65, -0.5, 0.20);
                this.easy.rotation.x = -1.5708;
                this.scene.add(this.easy);
                break;
            }
            case 1: {
                if (removeFirst) {
                    this.scene.remove(this.normal);
                }
                // Selected normal button text
                this.normalGeometry = new TextGeometry('Normal', this.fontDifficultyBtnParams);
                this.normal = new Mesh( this.normalGeometry, material );
                this.normal.position.set(-2.15, -0.5, 0.20);
                this.normal.rotation.x = -1.5708;
                this.scene.add(this.normal);
                break;
            }
            case 2: {
                if (removeFirst) {
                    this.scene.remove(this.hard);
                }
                // Selected hard button text
                this.hardGeometry = new TextGeometry('Hard', this.fontDifficultyBtnParams);
                this.hard = new Mesh( this.hardGeometry, material );
                this.hard.position.set(0, -0.5, 0.20);
                this.hard.rotation.x = -1.5708;
                this.scene.add(this.hard);
                break;
            }
            case 3: {
                if (removeFirst) {
                    this.scene.remove(this.hardcore);
                }
                //  Selected hardcore button text
                this.hardcoreGeometry = new TextGeometry('Hardcore', this.fontDifficultyBtnParams);
                this.hardcore = new Mesh( this.hardcoreGeometry, material );
                this.hardcore.position.set(1.7, -0.5, 0.20);
                this.hardcore.rotation.x = -1.5708;
                this.scene.add(this.hardcore);
                break;
            }
            default: {}
        }
    }
    /**
     * Moves the point light from left to right a little every frame.
     */
    endCycle(): void {
        if (this.mode === 1) {
            this.shimmer.position.x = 0;
            this.shimmer.intensity = 0;
            this.pointLight.intensity = 0;
            if (!this.helpLight) {
                this.helpLight = new AmbientLight(0xCCCCCC);
                this.scene.add(this.helpLight);
            }
            this.helpHandler.endCycle();
        } else {
            if (this.helpLight) {
                this.scene.remove(this.helpLight);
                this.helpLight = null;
            }
            if (this.shimmer.position.x > 20) {
                this.shimmer.position.x = -20;
            }
            this.shimmer.position.x += 0.2;
        }
        this.loadHandler.endCycle();
    }
    /**
     * Retrieves the currently chosen difficulty level.
     * @returns the difficulty level currently selected in the menu.
     */
    getDifficulty(): number {
        return this.difficultyLevel;
    }
    /**
     * Gets the game load data fom load code. If load code is invalid, it returns null.
     * @returns game load data from load code or null to start from a default set.
     */
    getGameData(): null {
        return this.loadHandler.getGameData();
    }
    /**
     * Turns visibility for menu items to be unseen.
     */
    hideMenu() {
        this.shimmer.color.set(0xCCCCCC);
        this.shimmer.intensity = 3.2;
        this.shimmer.position.y = -10;
        this.start.visible = false;
        this.easy.visible = false;
        this.normal.visible = false;
        this.hard.visible = false;
        this.hardcore.visible = false;
        this.load.visible = false;
        this.help.visible = false;
        this.sound.visible = false;
        this.on.visible = false;
        this.off.visible = false;
        this.barrierEasy.visible = false;
        this.barrierHard.visible = false;
        this.barrierHardcore.visible = false;
        this.barrierHelp.visible = false;
        this.barrierLoad.visible = false;
        this.barrierNormal.visible = false;
        this.barrierOff.visible = false;
        this.barrierOn.visible = false;
        this.barrierStart.visible = false;
    }
    /**
     * Transitions to help screen.
     * Changes the help menu button text when clicked to signal to user that their click worked.
     */
    pressedHelp(): void {
        this.barrierHelp.visible = false;
        this.scene.remove(this.help);
        // Selected help button text
        this.helpGeometry = new TextGeometry('Help', this.fontDifficultyBtnParams);
        this.help = new Mesh( this.helpGeometry, this.menuSelectedMaterial );
        this.help.position.set(-0.5, -0.5, 2.2);
        this.help.rotation.x = -1.5708;
        this.scene.add(this.help);
        setTimeout(() => {
            this.mode = 1;
            this.hideMenu();
            this.helpHandler.activate();
        }, 250);
    }
    /**
     * Changes the load menu button text when clicked to signal to user that their click worked (if not hardcore difficulty).
     * @returns TRUE --> valid click, move onto load menu | FALSE --> harcore mode means load is inactive.
     */
    pressedLoad(): void {
        this.scene.remove(this.load);
        // Selected load button text
        this.loadGeometry = new TextGeometry('Load', this.fontDifficultyBtnParams);
        this.load = new Mesh( this.loadGeometry, this.menuSelectedMaterial );
        this.load.position.set(-0.5, -0.5, 1.2);
        this.load.rotation.x = -1.5708;
        this.scene.add(this.load);
        setTimeout(() => {
            this.mode = 2;
            this.hideMenu();
            this.loadHandler.activate();
        }, 250);
    }
    /**
     * Turns sound off.
     * Changes the off menu button text when clicked to signal to user that their click worked.
     */
    pressedOff(): void {
        this.scene.remove(this.off);
        this.scene.remove(this.on);
        // Selected off button text
        this.off = new Mesh( this.offGeometry, this.menuSelectedMaterial );
        this.off.position.set(0.85, -0.5, 3.2);
        this.off.rotation.x = -1.5708;
        this.scene.add(this.off);
        // Selected on button text
        this.on = new Mesh( this.onGeometry, this.menuMaterial );
        this.on.position.set(-0.3, -0.5, 3.2);
        this.on.rotation.x = -1.5708;
        this.scene.add(this.on);
        SoundinatorSingleton.playClick();
        SoundinatorSingleton.toggleMute(true);
    }
    /**
     * Turns sound on.
     * Changes the on menu button text when clicked to signal to user that their click worked.
     */
    pressedOn(): void {
        this.scene.remove(this.off);
        this.scene.remove(this.on);
        // Selected off button text
        this.off = new Mesh( this.offGeometry, this.menuMaterial );
        this.off.position.set(0.8, -0.5, 3.2);
        this.off.rotation.x = -1.5708;
        this.scene.add(this.off);
        // Selected on button text
        this.on = new Mesh( this.onGeometry, this.menuSelectedMaterial );
        this.on.position.set(-0.3, -0.5, 3.2);
        this.on.rotation.x = -1.5708;
        this.scene.add(this.on);
        SoundinatorSingleton.toggleMute(false);
        SoundinatorSingleton.playClick();
    }
    /**
     * Changes the start menu button text when clicked to signal to user that their click worked.
     * @returns difficulty level chosen before start was pressed (to be used in game difficulty checks)
     */
    pressedStart(): number {
        this.scene.remove(this.start);
        // Selected start button text
        this.startGeometry = new TextGeometry('Start', this.fontDifficultyBtnParams);
        this.start = new Mesh( this.startGeometry, this.menuSelectedMaterial );
        this.start.position.set(-0.6, -0.5, -0.8);
        this.start.rotation.x = -1.5708;
        this.scene.add(this.start);
        return this.difficultyLevel;
    }
    /**
     * Reactivates main menu options.
     */
    returnToMainMenu(): void {
        if (this.mode === 2) {
            this.scene.remove(this.load);
            // Selected load button text
            this.loadGeometry = new TextGeometry('Load', this.fontDifficultyBtnParams);
            this.load = new Mesh( this.loadGeometry, this.menuMaterial );
            this.load.position.set(-0.5, -0.5, 1.2);
            this.load.rotation.x = -1.5708;
            this.scene.add(this.load);
            this.mode = 0;
            this.showMenu();
            this.loadHandler.deactivate();
        } else if (this.mode === 1) {
            this.scene.remove(this.help);
            // Selected help button text
            this.helpGeometry = new TextGeometry('Help', this.fontDifficultyBtnParams);
            this.help = new Mesh( this.helpGeometry, this.menuMaterial );
            this.help.position.set(-0.5, -0.5, 2.2);
            this.help.rotation.x = -1.5708;
            this.scene.add(this.help);
            this.mode = 0;
            this.showMenu();
            this.helpHandler.deactivate();
        }
        this.createDifficultyButtons(0, this.menuMaterial, true);
        this.createDifficultyButtons(1, this.menuMaterial, true);
        this.createDifficultyButtons(2, this.menuMaterial, true);
        this.createDifficultyButtons(3, this.menuMaterial, true);
        
        this.createDifficultyButtons(this.difficultyLevel, this.menuSelectedMaterial, true);
    }
    /**
     * Turns visibility for menu items to be seen.
     */
    showMenu() {
        this.shimmer.color.set(0x66FF66);
        this.shimmer.intensity = 2;
        this.shimmer.position.y = 2;
        this.start.visible = true;
        this.easy.visible = true;
        this.normal.visible = true;
        this.hard.visible = true;
        this.hardcore.visible = true;
        this.load.visible = true;
        this.help.visible = true;
        this.sound.visible = true;
        this.on.visible = true;
        this.off.visible = true;
        this.barrierEasy.visible = true;
        this.barrierHard.visible = true;
        this.barrierHardcore.visible = true;
        this.barrierHelp.visible = true;
        this.barrierLoad.visible = true;
        this.barrierNormal.visible = true;
        this.barrierOff.visible = true;
        this.barrierOn.visible = true;
        this.barrierStart.visible = true;
    }
}
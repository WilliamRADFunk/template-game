import {
    Color,
    DoubleSide,
    Font,
    Geometry,
    Line,
    LineBasicMaterial,
    MeshBasicMaterial,
    Scene,
    Vector3 } from "three";
import { ControlPause } from "./control-pause";
import { ControlPlay } from "./control-play";
import { ControlHelp } from "./control-help";
import { ControlSave } from "./control-save";
import { ControlExit } from "./control-exit";
import { ControlMute } from "./control-mute";
import { ControlSound } from "./control-sound";
import { SoundinatorSingleton } from "../soundinator";
/**
 * A constant size / position modifier to shrink or expand the entire panel symmetrically from one variable.
 */
const BUTTON_SIZE = 0.4;
/**
 * @class
 * Control panel that handles all of the buttons and their states.
 */
export class ControlPanel {
    /**
     * Controls the buttons material.
     */
    private buttonMaterial: MeshBasicMaterial;
    /**
     * Controls the exit button.
     */
    private controlExit: ControlExit;
    /**
     * Controls the help button.
     */
    private controlHelp: ControlHelp;
    /**
     * Controls the mute button.
     */
    private controlMute: ControlMute;
    /**
     * Controls the pause button.
     */
    private controlPause: ControlPause;
    /**
     * Controls the play button.
     */
    private controlPlay: ControlPlay;
    /**
     * Controls the save button.
     */
    private controlSave: ControlSave;
    /**
     * Controls the sound button.
     */
    private controlSound: ControlSound;
    /**
     * Keeps track of level's current color
     */
    private currentColor: Color;
    /**
     * Player chosen difficulty level.
     */
    private difficulty: number;
    /**
     * Tracks state of game exiting.
     */
    private exit: boolean = false;
    /**
     * Tracks state of game help menu.
     */
    private help: boolean = false;
    /**
     * Tracks state of sound muting.
     */
    private mute: boolean = false;
    /**
     * Line mesh for border of entire panel.
     */
    private panelBorder: Line;
    /**
     * Controls the panel's border material.
     */
    private panelBorderMaterial: LineBasicMaterial;
    /**
     * Tracks state of game pause.
     */
    private pause: boolean = false;
    /**
     * Tracks state of game save menu.
     */
    private save: boolean = false;
    /**
     * Reference to the scene, used to remove asteroid from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * Constructor for the ControlPanel class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param x             upper left x point of control panel.
     * @param z             upper left z point of control panel.
     * @param difficulty    player chosen difficulty level.
     * @hidden
     */
    constructor(scene: Scene, x: number, z: number, difficulty: number, color: Color, font: Font) {
        this.scene = scene;
        this.difficulty = difficulty;
        this.currentColor = color;
        const clickMaterial = new MeshBasicMaterial({
            color: 0x0000FF,
            opacity: 0,
            side: DoubleSide,
            transparent: true });
        this.buttonMaterial = new MeshBasicMaterial({
            color: this.currentColor,
            opacity: 1,
            side: DoubleSide,
            transparent: true });
        //
        // Control Panel
        //
        const panelBorderGeometry = new Geometry();
        panelBorderGeometry.vertices.push(
            new Vector3(x, 0, z),
            new Vector3(x + (6.5625 * BUTTON_SIZE), 0, z),
            new Vector3(x + (6.5625 * BUTTON_SIZE), 0, z + (1.5 * BUTTON_SIZE)),
            new Vector3(x, 0, z + (1.5 * BUTTON_SIZE)),
            new Vector3(x, 0, z));
        this.panelBorderMaterial = new LineBasicMaterial({
            color: this.currentColor,
            opacity: 1,
            transparent: true });
        this.panelBorder = new Line(panelBorderGeometry, this.panelBorderMaterial);
        this.scene.add(this.panelBorder);
        //
        // Pause Button
        //
        this.controlPause = new ControlPause(
            this.scene,
            [x, z],
            BUTTON_SIZE,
            this.currentColor,
            this.buttonMaterial,
            clickMaterial);
        //
        // Play Button
        //
        this.controlPlay = new ControlPlay(
            this.scene,
            [x, z],
            BUTTON_SIZE,
            this.currentColor,
            this.buttonMaterial,
            clickMaterial);
        //
        // Help Button
        //
        this.controlHelp = new ControlHelp(
            this.scene,
            [x + (1.25 * BUTTON_SIZE), z],
            BUTTON_SIZE,
            this.currentColor,
            clickMaterial,
            font);
        //
        // Save Button
        //
        this.controlSave = new ControlSave(
            this.scene,
            [x + (2.5 * BUTTON_SIZE), 1, z],
            BUTTON_SIZE,
            this.currentColor,
            clickMaterial);
        //
        // Mute Button
        //
        this.controlMute = new ControlMute(
            this.scene,
            [x + (3.75 * BUTTON_SIZE), z],
            BUTTON_SIZE,
            this.currentColor,
            clickMaterial);
        //
        // Sound Button
        //
        this.controlSound = new ControlSound(
            this.scene,
            [x + (3.75 * BUTTON_SIZE), z],
            BUTTON_SIZE,
            this.currentColor);
        //
        // Exit Button
        //
        this.controlExit = new ControlExit(
            this.scene,
            [x + (5 * BUTTON_SIZE), 1, z],
            BUTTON_SIZE,
            this.currentColor,
            clickMaterial);
        //
        // If hardcore difficulty, play button is inaccessible.
        //
        if (difficulty === 3) {
            this.buttonMaterial.opacity = 0.5;
            this.controlPause.changeOpacity(0.5);
            this.controlPlay.changeOpacity(0.5);
            this.controlHelp.changeOpacity(0.5);
            this.controlSave.changeOpacity(0.5);
        }
        this.controlPlay.hide();
        if (SoundinatorSingleton.getMute()) {
            this.controlSound.hide();
            this.mute = true;
        } else {
            this.controlMute.hide();
            this.mute = false;
        }
    }
    /**
     * At the end of each loop iteration, control panel is told to hide or not.
     * @param hide hide the control panel if new level, so old color isn't showing.
     */
    endCycle(hide?: boolean): void {
        if (hide) {
            this.controlPause.hide();
            this.controlPlay.hide();
            this.controlHelp.hide();
            this.controlSave.hide();
            this.controlMute.hide();
            this.controlSound.hide();
            this.controlExit.hide();
            this.panelBorder.visible = false;
            return;
        }
    }
    /**
     * Turns exit on.
     */
    exitChange() {
        this.exit = true;
        if (!this.mute) {
            SoundinatorSingleton.toggleMute(true);
            SoundinatorSingleton.toggleMute(false);
        }
    }
    /**
     * Alerts control panel that help button has been clicked by user.
     * @param newState new state for isHelp.
     */
    helpChange(newState: boolean): void {
        if (this.difficulty === 3) return;
        this.resume();
        this.help = newState;
        if (this.help) {
            this.controlHelp.activate();
            this.pauseChange();
        }
    }
    /**
     * Alerts control panel that mute button has been clicked by user.
     */
    muteChange(): void {
        SoundinatorSingleton.toggleMute(!this.mute);
        SoundinatorSingleton.playClick();
        this.mute = !this.mute;
        if (this.mute) {
            this.controlSound.hide();
            this.controlMute.show();
        } else {
            this.controlSound.show();
            this.controlMute.hide();
        }
    }
    /**
     * Getter for game exit state.
     * @returns TRUE --> game is exiting | FALSE --> game is not exiting.
     */
    isExit(): boolean {
        return this.exit;
    }
    /**
     * Getter for game help state.
     * @returns TRUE --> game is in help screen | FALSE --> game is not in help screen.
     */
    isHelp(): boolean {
        if (this.difficulty < 3) {
            return this.help;
        }
        return false;
    }
    /**
     * Getter for game pause state.
     * @returns TRUE --> game is paused | FALSE --> game is not paused.
     */
    isPaused(): boolean {
        if (this.difficulty < 3) {
            return this.pause;
        }
        return false;
    }
    /**
     * Getter for game save state.
     * @returns TRUE --> game is in save screen | FALSE --> game is not in save screen.
     */
    isSave(): boolean {
        if (this.difficulty < 3) {
            return this.save;
        }
        return false;
    }
    /**
     * Only recreate the digits with the new color
     * @param color level color, grabbed from the LevelHandler
     */
    nextLevel(color: Color) {
        this.currentColor = color;
        this.panelBorderMaterial.color = this.currentColor;
        this.buttonMaterial.color = this.currentColor;
        this.controlPause.changeColor(this.currentColor);
        this.controlPause.show();
        this.controlPlay.changeColor(this.currentColor);
        this.controlHelp.changeColor(this.currentColor);
        this.controlHelp.show();
        this.controlSave.changeColor(this.currentColor);
        this.controlSave.show();
        this.controlMute.changeColor(this.currentColor);
        this.controlSound.changeColor(this.currentColor);
        if (this.mute) {
            this.controlMute.show();
        } else {
            this.controlSound.show();
        }
        this.controlExit.changeColor(this.currentColor);
        this.controlExit.show();
        this.panelBorder.visible = true;
    }
    /**
     * Alerts control panel that pause button has been clicked by user.
     */
    pauseChange(): void {
        if (this.difficulty === 3) return;
        this.pause = !this.pause;
        if (this.pause) {
            this.controlPlay.show();
            this.controlPause.hide();
            SoundinatorSingleton.pauseSound();
            return;
        }
        this.resume();
    }
    resume() {
        if (this.save) {
            this.save = !this.save;
            this.controlSave.deactivate();
        } else if (this.help) {
            this.help = !this.help;
            this.controlHelp.deactivate();
        }
        this.pause = false;
        this.controlPlay.hide();
        this.controlPause.show();
        SoundinatorSingleton.resumeSound();
    }
    /**
     * Alerts control panel that save button has been clicked by user.
     * @param newState new state for isSave.
     */
    saveChange(newState: boolean): void {
        if (this.difficulty === 3) return;
        this.resume();
        this.save = newState;
        if (this.save) {
            this.controlSave.activate();
            this.pauseChange();
        }
    }
}
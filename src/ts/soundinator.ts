import { Audio, AudioListener } from 'three';

import { Sound } from "./sound";

/**
 * @class
 * The sound effects and music system.
 */
class Soundinator {
    /**
     * Local reference to the audiolistener made during initialization.
     */
    private audioListener: AudioListener;
    /**
     * Contains the base destroyed sound.
     */
    private baseLost: Sound;
    /**
     * Contains the boom sound.
     */
    private boom: Sound;
    /**
     * Contains the boom sound.
     */
    private click: Sound;
    /**
     * Contains the drone drop sound.
     */
    private drone: Sound;
    /**
     * Contains the weapon's fire sound.
     */
    private fire: Sound;
    /**
     * Contains the game over sound.
     */
    private gameOver: Sound;
    /**
     * Tracks whether game is in silent mode or not.
     */
    private isMute: boolean = true;
    /**
     * Contains the regenerated satellite or base sound.
     */
    private regen: Sound;
    /**
     * Contains the saucer is coming sound.
     */
    private saucer: Sound;
    /**
     * Contains the shield deactivation sound.
     */
    private shieldDown: Sound;
    /**
     * Contains the shield activation sound.
     */
    private shieldUp: Sound;
    /**
     * Constructor for the Soundinator class
     * @hidden
     */
    constructor() {}
    /**
     * Attached the audiolistner when it's ready.
     * @param listener the singular audiolistener created during initialization of the game.
     */
    addListener(listener: AudioListener): void {
        this.audioListener = listener;
    }
    /**
     * Creates game sounds from the preloaded Audio objects.
     * @param sounds list of preloaded Audio objects.
     */
    addSounds(sounds: Audio[]): void {
        this.boom = new Sound(sounds[0], 0.5, 0.3, 0.1);
        this.click = new Sound(sounds[1], 0, 0.8);
        this.fire = new Sound(sounds[2], 0, 0.3);
        this.shieldDown = new Sound(sounds[3], 0, 0.7);
        this.shieldUp = new Sound(sounds[4], 0, 0.7);
        this.saucer = new Sound(sounds[5], 0, 0.2);
        this.drone = new Sound(sounds[6], 0, 0.5);
        this.regen = new Sound(sounds[7], 0, 0.3);
        this.baseLost = new Sound(sounds[8], 2.2, 0.4);
        this.gameOver = new Sound(sounds[9], 0, 0.7);
    }
    /**
     * Getter for the isMute variable (mainly for preselecting the appropriate button in menu).
     * @returns the current isMute state. TRUE --> no sound | FALSE --> there is sound
     */
    getMute(): boolean {
        return this.isMute;
    }
    /**
     * Plays the mouse click sound.
     */
    playBaseLost(): void {
        if (this.isMute) { return; }
        this.baseLost.play();
    }
    /**
     * Plays the explosion sound.
     * @param muffled inert explosions should have a shallower sound.
     */
    playBoom(muffled?: boolean): void {
        if (this.isMute) { return; }
        this.boom.play(muffled);
    }
    /**
     * Plays the mouse click sound.
     */
    playClick(): void {
        if (this.isMute) { return; }
        this.click.play();
    }
    /**
     * Plays the drone drop sound.
     */
    playDrone(): void {
        if (this.isMute) { return; }
        this.drone.play();
    }
    /**
     * Plays the weapon firing sound.
     */
    playFire(): void {
        if (this.isMute) { return; }
        this.fire.play();
    }
    /**
     * Plays the weapon firing sound.
     */
    playGameOver(): void {
        if (this.isMute) { return; }
        this.gameOver.play();
    }
    /**
     * Plays the regenerated satellite or base sound.
     */
    playRegen(): void {
        if (this.isMute) { return; }
        this.regen.play();
    }
    /**
     * Plays the saucer is coming sound.
     */
    playSaucer(): void {
        if (this.isMute) { return; }
        this.saucer.play();
    }
    /**
     * Plays the shield deactivation sound.
     */
    playShieldDown(): void {
        if (this.isMute) { return; }
        this.shieldDown.play();
    }
    /**
     * Plays the shield activation sound.
     */
    playShieldUp(): void {
        if (this.isMute) { return; }
        this.shieldUp.play();
    }
    /**
     * Pauses all the sound clips where they are.
     */
    pauseSound(): void {
        if (!this.isMute) {
            this.boom.pause();
            this.click.pause();
            this.fire.pause();
            this.shieldDown.pause();
            this.shieldUp.pause();
            this.saucer.pause();
            this.drone.pause();
            this.regen.pause();
            this.baseLost.pause();
            this.gameOver.pause();
        }
    }
    /**
     * Resumes all the sound clips that were paused.
     */
    resumeSound(): void {
        if (!this.isMute) {
            this.boom.resume();
            this.click.resume();
            this.fire.resume();
            this.shieldDown.resume();
            this.shieldUp.resume();
            this.saucer.resume();
            this.drone.resume();
            this.regen.resume();
            this.baseLost.resume();
            this.gameOver.resume();
        }
    }
    /**
     * Stops the saucer is coming sound.
     */
    stopSaucer(): void {
        if (this.isMute) { return; }
        this.saucer.stop();
    }
    /**
     * Toggles sound for the entire game.
     * @param mute TRUE --> mute the game | FALSE --> turn sound on
     */
    toggleMute(mute: boolean): void {
        this.isMute = mute;
        if (this.isMute) {
            this.boom.stop();
            this.click.stop();
            this.fire.stop();
            this.shieldDown.stop();
            this.shieldUp.stop();
            this.saucer.stop();
            this.drone.stop();
            this.regen.stop();
            this.baseLost.stop();
            this.gameOver.stop();
        }
    }
}
export const SoundinatorSingleton = new Soundinator();
import { Audio } from 'three';

export class Sound {
    /**
     * The volume to use for the sound when muffled is passed in.
     */
    private muffledVolume: number;
    /**
     * The volume to use for the sound when conditions are normal.
     */
    private normalVolume: number;
    /**
     * The offset that best suites the audio clip as many have dead space in the beginning.
     */
    private offset: number;
    /**
     * Audio clip belonging to this sound.
     */
    private sound: Audio;
    /**
     * Flag to track if this sound had been paused.
     */
    private wasPlaying: boolean = false;
    /**
     * Constructor for the Sound class
     * @param audio         audio clip belonging to this sound.
     * @param offset        the offset that best suites the audio clip as many have dead space in the beginning.
     * @param normalVolume  the offset that best suites the audio clip as many have dead space in the beginning.
     * @param muffledVolume the volume to use for the sound when muffled is passed in.
     * @hidden
     */
    constructor(audio: Audio, offset: number, normalVolume?: number, muffledVolume?: number) {
        this.sound = audio;
        this.normalVolume = normalVolume || 1;
        this.muffledVolume = muffledVolume || normalVolume;
        this.offset = offset;
    }
    /**
     * Activate the clip.
     */
    play(muffled?: boolean): void {
        this.wasPlaying = false;
        if (this.sound.isPlaying) this.sound.stop();
        this.sound.offset = this.offset;
        this.sound.setVolume(muffled ? this.muffledVolume : this.normalVolume);
        this.sound.play();
    }
    /**
     * Pauses clip if currently playing.
     */
    pause(): void {
        if (this.sound.isPlaying) {
            this.wasPlaying = true;
            this.sound.pause();
        }
    }
    /**
     * Pauses clip if currently playing.
     */
    resume(): void {
        if (this.wasPlaying) {
            this.wasPlaying = false;
            this.sound.play();
        }
    }
    /**
     * Stops the clip.
     */
    stop(): void {
        this.wasPlaying = false;
        if (!this.sound.isPlaying) return;
        this.sound.stop();
    }
}
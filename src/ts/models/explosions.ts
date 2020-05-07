export interface ExplosionOptions {
    /**
     * Starting size of the explosions, used for collision reference.
     */
    radius?: number;

    /**
     * If created as result of shield strike, it's not collidable and color is different.
     */
    renderedInert?: boolean;

    /**
     * Number of segments to use when drawing the circle. Default is 32
     */
    segments?: number;

    /**
     * Optional y value for explosion for layering ability (ie .explosion behind or over something).
     */
    y?: number;
}
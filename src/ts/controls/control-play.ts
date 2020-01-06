import {
    Color,
    Geometry,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    Scene,
    Shape,
    ShapeGeometry,
    Vector3 } from "three";

/**
 * @class
 * Play button that draws and maintains click area for play button.
 */
export class ControlPlay {
    /**
     * Mesh for the play button.
     */
    private playButton: Mesh;
    /**
     * Controls the play button's border material.
     */
    private playButtonBorderMaterial: LineBasicMaterial;
    /**
     * Constructor for the ControlPlay class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param pos           upper left [x, z] point of control panel.
     * @param size          size modifier for button.
     * @param color         color to use for button and button material.
     * @param color         color to use for button and button material.
     * @param btnMat        consistent button material used for all control panel buttons.
     * @param clkMat        consistent click material used for all control panel buttons.
     * @hidden
     */
    constructor(scene: Scene, pos: [number, number], size: number, color: Color, btnMat: MeshBasicMaterial, clkMat: MeshBasicMaterial) {
        //
        // No play button click barrier since pause already created it for this button space.
        //

        // Play button border.
        const playButtonBorderGeometry = new Geometry();
        playButtonBorderGeometry.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(size, 0, 0),
            new Vector3(size, 0, size),
            new Vector3(0, 0, size),
            new Vector3(0, 0, 0));
        this.playButtonBorderMaterial = new LineBasicMaterial({
            color: color,
            opacity: 1,
            transparent: true });
        const playButtonBorder = new Line(playButtonBorderGeometry, this.playButtonBorderMaterial);
        // Triangle of play button.
        const xPlay = (0.0625 * size);
        const yPlay = (0.375 * size);
        const playTriangle = new Shape();
        playTriangle.moveTo( xPlay, yPlay );
        playTriangle.lineTo( xPlay + (0.45 * size), yPlay - (0.375 * size) );
        playTriangle.lineTo( xPlay, yPlay - (0.75 * size) );
        playTriangle.lineTo( xPlay, yPlay );
        const playTriangleGeometry = new ShapeGeometry(playTriangle);
        const playTriangleMesh = new Mesh( playTriangleGeometry, btnMat );
        playTriangleMesh.position.set((0.25 * size), 0, (0.508333333334 * size));
        playTriangleMesh.rotation.set(-1.5708, 0, 0);
        // The melding of the complete play button.
        this.playButton = new Mesh();
        this.playButton.position.set(pos[0] + (0.25 * size), 0, pos[1] + (0.25 * size));
        this.playButton.add(playButtonBorder);
        this.playButton.add(playTriangleMesh);
        scene.add(this.playButton);
    }
    /**
     * Changes button material to match new level color.
     * @param color threeJS color value to use on button
     */
    changeColor(color: Color): void {
        this.playButtonBorderMaterial.color = color;
    }
    /**
     * Changes button opacity.
     * @param color opacity fraction to use on button material.
     */
    changeOpacity(opacity: number): void {
        this.playButtonBorderMaterial.opacity = opacity;
    }
    /**
     * Hide the play button (state related).
     * Default is to show.
     */
    hide(): void {
        this.playButton.visible = false;
    }
    /**
     * Show the play button (state related).
     * Default is to show.
     */
    show(): void {
        this.playButton.visible = true;
    }
}
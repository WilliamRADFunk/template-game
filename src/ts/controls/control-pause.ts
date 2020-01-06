import {
    Color,
    Geometry,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    Vector3 } from "three";

/**
 * @class
 * Pause button that draws and maintains click area for pause button.
 */
export class ControlPause {
    /**
     * Mesh for the pause button.
     */
    private pauseButton: Mesh;
    /**
     * Controls the pause button's border material.
     */
    private pauseButtonBorderMaterial: LineBasicMaterial;
    /**
     * Constructor for the ControlPause class
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
        // Pause button click barrier.
        const pauseBarrierGeometry = new PlaneGeometry( size, size, 0, 0 );
        const pauseBarrier = new Mesh( pauseBarrierGeometry, clkMat );
        pauseBarrier.name = 'Pause Button';
        pauseBarrier.position.set(pos[0] + (size / 2) + (0.25 * size), 1, pos[1] + (size / 2) + (0.25 * size));
        pauseBarrier.rotation.set(1.5708, 0, 0);
        scene.add(pauseBarrier);
        // Pause button border.
        const pauseButtonBorderGeometry = new Geometry();
        pauseButtonBorderGeometry.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(size, 0, 0),
            new Vector3(size, 0, size),
            new Vector3(0, 0, size),
            new Vector3(0, 0, 0));
        this.pauseButtonBorderMaterial = new LineBasicMaterial({
            color: color,
            opacity: 1,
            transparent: true });
        const pauseButtonBorder = new Line(pauseButtonBorderGeometry, this.pauseButtonBorderMaterial);
        // Left bar of pause button.
        const pauseBarGeometry = new PlaneGeometry((0.75 * size), (0.25 * size), 0, 0 );
        const pauseBar1 = new Mesh( pauseBarGeometry, btnMat );
        pauseBar1.position.set((0.25 * size), 0, (0.508333333334 * size));
        pauseBar1.rotation.set(1.5708, 0, 1.5708);
        // Right bar of pause button.
        const pauseBar2 = new Mesh( pauseBarGeometry, btnMat );
        pauseBar2.position.set((0.75 * size), 0, (0.508333333334 * size));
        pauseBar2.rotation.set(1.5708, 0, 1.5708);
        // The melding of the complete pause button.
        this.pauseButton = new Mesh();
        this.pauseButton.position.set(pos[0] + (0.25 * size), 0, pos[1] + (0.25 * size));
        this.pauseButton.add(pauseButtonBorder);
        this.pauseButton.add(pauseBar1);
        this.pauseButton.add(pauseBar2);
        scene.add(this.pauseButton);
    }
    /**
     * Changes button material to match new level color.
     * @param color threeJS color value to use on button
     */
    changeColor(color: Color): void {
        this.pauseButtonBorderMaterial.color = color;
    }
    /**
     * Changes button opacity.
     * @param color opacity fraction to use on button material.
     */
    changeOpacity(opacity: number): void {
        this.pauseButtonBorderMaterial.opacity = opacity;
    }
    /**
     * Hide the pause button (state related).
     * Default is to show.
     */
    hide(): void {
        this.pauseButton.visible = false;
    }
    /**
     * Show the pause button (state related).
     * Default is to show.
     */
    show(): void {
        this.pauseButton.visible = true;
    }
}
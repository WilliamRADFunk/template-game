import {
    Color,
    DoubleSide,
    Geometry,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    Path,
    PlaneGeometry,
    Scene,
    Shape,
    ShapeGeometry,
    Vector3 } from "three";

/**
 * @class
 * Exit button that draws and maintains click area for exit button.
 */
export class ControlExit {
    /**
     * Mesh for the exit button.
     */
    private exitButton: Mesh;
    /**
     * Material for the arrow portion of the button.
     */
    private exitArrowMaterial: MeshBasicMaterial;
    /**
     * Controls the exit button's border material.
     */
    private exitButtonBorderMaterial: LineBasicMaterial;
    /**
     * Constructor for the ControlExit class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param pos           upper left [x, z] point of control panel.
     * @param size          size modifier for button.
     * @param color         color to use for button and button material.
     * @param color         color to use for button and button material.
     * @param clkMat        consistent click material used for all control panel buttons.
     * @hidden
     */
    constructor(
        scene: Scene,
        pos: [number, number, number],
        size: number,
        color: Color,
        clkMat: MeshBasicMaterial) {
        const yPos = pos[1] || 1;
        // Exit button click barrier.
        const exitBarrierGeometry = new PlaneGeometry( size, size, 0, 0 );
        const exitBarrier = new Mesh( exitBarrierGeometry, clkMat );
        exitBarrier.name = 'Exit Button';
        exitBarrier.position.set(pos[0] + (size / 2) + (0.25 * size), yPos, pos[2] + (size / 2) + (0.25 * size));
        exitBarrier.rotation.set(1.5708, 0, 0);
        scene.add(exitBarrier);
        // Exit button border.
        const exitButtonBorderGeometry = new Geometry();
        exitButtonBorderGeometry.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(size, 0, 0),
            new Vector3(size, 0, size),
            new Vector3(0, 0, size),
            new Vector3(0, 0, 0));
        this.exitButtonBorderMaterial = new LineBasicMaterial({
            color: color,
            opacity: 1,
            transparent: true });
        const exitButtonBorder = new Line(exitButtonBorderGeometry, this.exitButtonBorderMaterial);
         // Exit button border.
         const exitButtonDoorGeometry = new Geometry();
         exitButtonDoorGeometry.vertices.push(
             new Vector3(0.05, 0, 0.05),
             new Vector3(size - 0.18, 0, 0.05),
             new Vector3(size - 0.18, 0, size - 0.05),
             new Vector3(0.05, 0, size - 0.05),
             new Vector3(0.05, 0, 0.05));
        const exitButtonDoor = new Line(exitButtonDoorGeometry, this.exitButtonBorderMaterial);
        // Triangle of play button.
        this.exitArrowMaterial = new MeshBasicMaterial({
            color: color,
            opacity: 1,
            side: DoubleSide,
            transparent: true });
        // Horizontal bar of arrow
        const arrowBarGeometry = new PlaneGeometry((0.5 * size), (0.25 * size), 0, 0 );
        const arrowBar1 = new Mesh( arrowBarGeometry, this.exitArrowMaterial );
        arrowBar1.position.set((0.45 * size), 0, (0.508333333334 * size));
        arrowBar1.rotation.set(1.5708, 0, 0);
        // Triangle of arrow.
        const xPlay = (0.0625 * size);
        const yPlay = (0.375 * size);
        const exitShape = new Shape();
        exitShape.moveTo( xPlay, yPlay );
        exitShape.lineTo( xPlay + (0.36 * size), yPlay - (0.28125 * size) );
        exitShape.lineTo( xPlay, yPlay - (0.5625 * size) );
        exitShape.lineTo( xPlay, yPlay );
        const exitShapeGeometry = new ShapeGeometry(exitShape);
        const exitArrow = new Mesh( exitShapeGeometry, this.exitArrowMaterial );
        exitArrow.position.set((0.6 * size), 0, (0.62 * size));
        exitArrow.rotation.set(-1.5708, 0, 0);
        // The melding of the complete exit button.
        this.exitButton = new Mesh();
        this.exitButton.position.set(pos[0] + (0.25 * size), yPos - 1, pos[2] + (0.25 * size));
        this.exitButton.add(exitButtonBorder);
        this.exitButton.add(exitButtonDoor);
        this.exitButton.add(arrowBar1);
        this.exitButton.add(exitArrow);
        scene.add(this.exitButton);
    }
    /**
     * Makes necessary changes to exit button when exit mode is activated.
     */
    activate(): void {
        this.changeOpacity(0.5);
    }
    /**
     * Changes button material to match new level color.
     * @param color threeJS color value to use on button
     */
    changeColor(color: Color): void {
        this.exitButtonBorderMaterial.color = color;
        this.exitArrowMaterial.color = color;
    }
    /**
     * Changes button opacity.
     * @param color opacity fraction to use on button material.
     */
    changeOpacity(opacity: number): void {
        this.exitButtonBorderMaterial.opacity = opacity;
        this.exitArrowMaterial.opacity = opacity;
    }
    /**
     * Makes necessary changes to exit button when exit mode is deactivated.
     */
    deactivate(): void {
        this.changeOpacity(1);
    }
    /**
     * Hide the exit button (state related).
     * Default is to show.
     */
    hide(): void {
        this.exitButton.visible = false;
    }
    /**
     * Show the exit button (state related).
     * Default is to show.
     */
    show(): void {
        this.exitButton.visible = true;
    }
}
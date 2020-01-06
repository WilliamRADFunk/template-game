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
 * Save button that draws and maintains click area for save button.
 */
export class ControlSave {
    /**
     * Mesh for the save button.
     */
    private saveButton: Mesh;
    /**
     * Material for the disk portion of the button.
     */
    private saveDiskMaterial: MeshBasicMaterial;
    /**
     * Controls the save button's border material.
     */
    private saveButtonBorderMaterial: LineBasicMaterial;
    /**
     * Constructor for the ControlSave class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param pos           upper left [x, z] point of control panel.
     * @param size          size modifier for button.
     * @param color         color to use for button and button material.
     * @param color         color to use for button and button material.
     * @param clkMat        consistent click material used for all control panel buttons.
     * @param moreText      Additional label text to differentiate in-game save control from any other.
     * @hidden
     */
    constructor(
        scene: Scene,
        pos: [number, number, number],
        size: number,
        color: Color,
        clkMat: MeshBasicMaterial,
        moreText?: string) {
        const yPos = pos[1] || 1;
        // Save button click barrier.
        const saveBarrierGeometry = new PlaneGeometry( size, size, 0, 0 );
        const saveBarrier = new Mesh( saveBarrierGeometry, clkMat );
        saveBarrier.name = `Save ${moreText || ''}Button`;
        saveBarrier.position.set(pos[0] + (size / 2) + (0.25 * size), yPos, pos[2] + (size / 2) + (0.25 * size));
        saveBarrier.rotation.set(1.5708, 0, 0);
        scene.add(saveBarrier);
        // Save button border.
        const saveButtonBorderGeometry = new Geometry();
        saveButtonBorderGeometry.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(size, 0, 0),
            new Vector3(size, 0, size),
            new Vector3(0, 0, size),
            new Vector3(0, 0, 0));
        this.saveButtonBorderMaterial = new LineBasicMaterial({
            color: color,
            opacity: 1,
            transparent: true });
        const saveButtonBorder = new Line(saveButtonBorderGeometry, this.saveButtonBorderMaterial);
        // Triangle of play button.
        this.saveDiskMaterial = new MeshBasicMaterial({
            color: color,
            opacity: 1,
            side: DoubleSide,
            transparent: true });
        // Starting coordinates for the disk
        const xPlay = (-0.125 * size);
        const yPlay = (0.375 * size);
        // Solid form of disk
        const saveShape = new Shape();
        saveShape.moveTo(xPlay + (0.75 * size), yPlay - (0.75 * size));
        saveShape.lineTo(xPlay + (0.75 * size), yPlay - (0.25 * size));
        saveShape.lineTo(xPlay + (0.6 * size), yPlay);
        saveShape.lineTo(xPlay, yPlay);
        saveShape.lineTo(xPlay, yPlay - (0.75 * size));
        // Ractangular hole in disk
        const holeRec = new Path();
        holeRec.moveTo(xPlay + (0.5 * size), yPlay - (0.375 * size));
        holeRec.lineTo(xPlay + (0.5 * size), yPlay - (0.075 * size));
        holeRec.lineTo(xPlay + (0.075 * size), yPlay - (0.075 * size));
        holeRec.lineTo(xPlay + (0.075 * size), yPlay - (0.375 * size));
        saveShape.holes.push(holeRec);
        // Circular hole in disk
        const holeCirc = new Path();
        holeCirc.moveTo(xPlay + (0.5 * size), yPlay - (0.55 * size));
        holeCirc.absellipse(xPlay + (0.4 * size), yPlay - (0.55 * size), (0.1 * size), (0.1 * size), 0, Math.PI * 2, true, 0);
        saveShape.holes.push(holeCirc);
        // Convert shapes into geometry
        const saveShapeGeometry = new ShapeGeometry(saveShape, 32);
        const saveDisk = new Mesh( saveShapeGeometry, this.saveDiskMaterial );
        saveDisk.position.set((0.25 * size), 0, (0.508333333334 * size));
        saveDisk.rotation.set(-1.5708, 0, 0);
        // The melding of the complete save button.
        this.saveButton = new Mesh();
        this.saveButton.position.set(pos[0] + (0.25 * size), yPos - 1, pos[2] + (0.25 * size));
        this.saveButton.add(saveButtonBorder);
        this.saveButton.add(saveDisk);
        scene.add(this.saveButton);
    }
    /**
     * Makes necessary changes to save button when save mode is activated.
     */
    activate(): void {
        this.changeOpacity(0.5);
    }
    /**
     * Changes button material to match new level color.
     * @param color threeJS color value to use on button
     */
    changeColor(color: Color): void {
        this.saveButtonBorderMaterial.color = color;
        this.saveDiskMaterial.color = color;
    }
    /**
     * Changes button opacity.
     * @param color opacity fraction to use on button material.
     */
    changeOpacity(opacity: number): void {
        this.saveButtonBorderMaterial.opacity = opacity;
        this.saveDiskMaterial.opacity = opacity;
    }
    /**
     * Makes necessary changes to save button when save mode is deactivated.
     */
    deactivate(): void {
        this.changeOpacity(1);
    }
    /**
     * Hide the save button (state related).
     * Default is to show.
     */
    hide(): void {
        this.saveButton.visible = false;
    }
    /**
     * Show the save button (state related).
     * Default is to show.
     */
    show(): void {
        this.saveButton.visible = true;
    }
}
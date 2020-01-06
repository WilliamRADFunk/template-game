import {
    Color,
    Geometry,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    Vector3, 
    Shape,
    ShapeGeometry,
    DoubleSide} from "three";

/**
 * @class
 * Sound button that draws and maintains click area for sound button.
 */
export class ControlSound {
    /**
     * Material for the speaker and lines portion of the button.
     */
    private btnMat: MeshBasicMaterial
    /**
     * Mesh for the sound button.
     */
    private soundButton: Mesh;
    /**
     * Controls the sound button's border material.
     */
    private soundButtonBorderMaterial: LineBasicMaterial;
    /**
     * Constructor for the ControlSound class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param pos           upper left [x, z] point of control panel.
     * @param size          size modifier for button.
     * @param color         color to use for button and button material.
     * @hidden
     */
    constructor(
        scene: Scene,
        pos: [number, number],
        size: number,
        color: Color) {
        //
        // No sound button click barrier since mute already created it for this button space.
        //

        // Sound button border.
        const soundButtonBorderGeometry = new Geometry();
        soundButtonBorderGeometry.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(size, 0, 0),
            new Vector3(size, 0, size),
            new Vector3(0, 0, size),
            new Vector3(0, 0, 0));
        this.soundButtonBorderMaterial = new LineBasicMaterial({
            color: color,
            opacity: 1,
            transparent: true });
        const soundButtonBorder = new Line(soundButtonBorderGeometry, this.soundButtonBorderMaterial);
        
        this.btnMat = new MeshBasicMaterial({
            color: color,
            opacity: 1,
            side: DoubleSide,
            transparent: true });

        const btnInnerSize = 0.8 * size;
        // Triangle of sound button.
        const xMute = (0.5625 * btnInnerSize);
        const yMute = (0.275 * btnInnerSize);
        const soundTriangle = new Shape();
        soundTriangle.moveTo( xMute, yMute );
        soundTriangle.lineTo( xMute - (0.45 * btnInnerSize), yMute - (0.225 * btnInnerSize) );
        soundTriangle.lineTo( xMute - (0.45 * btnInnerSize), yMute - (0.625 * btnInnerSize) );
        soundTriangle.lineTo( xMute, yMute - (0.8 * btnInnerSize) );
        soundTriangle.lineTo( xMute, yMute );
        const soundTriangleGeometry = new ShapeGeometry(soundTriangle);
        const soundTriangleMesh = new Mesh( soundTriangleGeometry, this.btnMat );
        soundTriangleMesh.position.set((0.25 * btnInnerSize), 0, (0.508333333334 * btnInnerSize));
        soundTriangleMesh.rotation.set(-1.5708, 0, 0);
        
        const soundTriangleBase = new Shape();
        soundTriangleBase.moveTo( xMute, yMute );
        soundTriangleBase.lineTo( xMute + (0.1 * btnInnerSize), yMute );
        soundTriangleBase.lineTo( xMute + (0.1 * btnInnerSize), yMute - (0.35 * btnInnerSize) );
        soundTriangleBase.lineTo( xMute, yMute - (0.35 * btnInnerSize) );
        soundTriangleBase.lineTo( xMute, yMute );
        const soundTriangleBaseGeometry = new ShapeGeometry(soundTriangleBase);
        const soundTriangleBaseMesh = new Mesh( soundTriangleBaseGeometry, this.btnMat );
        soundTriangleBaseMesh.position.set((-0.4 * btnInnerSize), 0, (0.76 * btnInnerSize));
        soundTriangleBaseMesh.rotation.set(-1.5708, 0, 0);

        const btnBar = new Mesh();
        
        const muteTriangleRow1 = new Shape();
        muteTriangleRow1.moveTo( xMute, yMute );
        muteTriangleRow1.lineTo( xMute + (0.25 * btnInnerSize), yMute );
        muteTriangleRow1.lineTo( xMute + (0.25 * btnInnerSize), yMute + (0.1 * btnInnerSize) );
        muteTriangleRow1.lineTo( xMute, yMute + (0.1 * btnInnerSize) );
        muteTriangleRow1.lineTo( xMute, yMute );
        const muteTriangleRow1Geometry = new ShapeGeometry(muteTriangleRow1);
        const muteTriangleRow1Mesh = new Mesh( muteTriangleRow1Geometry, this.btnMat );
        muteTriangleRow1Mesh.position.set((0.3 * btnInnerSize), 0, (0.8 * btnInnerSize));
        muteTriangleRow1Mesh.rotation.set(-1.5708, 0, 0);
        
        const muteTriangleRow2 = new Shape();
        muteTriangleRow2.moveTo( xMute, yMute );
        muteTriangleRow2.lineTo( xMute + (0.25 * btnInnerSize), yMute );
        muteTriangleRow2.lineTo( xMute + (0.25 * btnInnerSize), yMute + (0.1 * btnInnerSize) );
        muteTriangleRow2.lineTo( xMute, yMute + (0.1 * btnInnerSize) );
        muteTriangleRow2.lineTo( xMute, yMute );
        const muteTriangleRow2Geometry = new ShapeGeometry(muteTriangleRow2);
        const muteTriangleRow2Mesh = new Mesh( muteTriangleRow2Geometry, this.btnMat );
        muteTriangleRow2Mesh.position.set((0.3 * btnInnerSize), 0, (0.99 * btnInnerSize));
        muteTriangleRow2Mesh.rotation.set(-1.5708, 0, 0);
        
        const muteTriangleRow3 = new Shape();
        muteTriangleRow3.moveTo( xMute, yMute );
        muteTriangleRow3.lineTo( xMute + (0.25 * btnInnerSize), yMute );
        muteTriangleRow3.lineTo( xMute + (0.25 * btnInnerSize), yMute + (0.1 * btnInnerSize) );
        muteTriangleRow3.lineTo( xMute, yMute + (0.1 * btnInnerSize) );
        muteTriangleRow3.lineTo( xMute, yMute );
        const muteTriangleRow3Geometry = new ShapeGeometry(muteTriangleRow3);
        const muteTriangleRow3Mesh = new Mesh( muteTriangleRow3Geometry, this.btnMat );
        muteTriangleRow3Mesh.position.set((0.3 * btnInnerSize), 0, (1.15 * btnInnerSize));
        muteTriangleRow3Mesh.rotation.set(-1.5708, 0, 0);

        btnBar.add(muteTriangleRow1Mesh);
        btnBar.add(muteTriangleRow2Mesh);
        btnBar.add(muteTriangleRow3Mesh);
        // The melding of the complete sound button.
        this.soundButton = new Mesh();
        this.soundButton.position.set(pos[0] + (0.25 * size), 0, pos[1] + (0.25 * size));
        this.soundButton.add(soundButtonBorder);
        this.soundButton.add(soundTriangleMesh);
        this.soundButton.add(soundTriangleBaseMesh);
        this.soundButton.add(btnBar);
        scene.add(this.soundButton);
    }
    /**
     * Changes button material to match new level color.
     * @param color threeJS color value to use on button
     */
    changeColor(color: Color): void {
        this.soundButtonBorderMaterial.color = color;
        this.btnMat.color = color;
    }
    /**
     * Changes button opacity.
     * @param color opacity fraction to use on button material.
     */
    changeOpacity(opacity: number): void {
        this.soundButtonBorderMaterial.opacity = opacity;
        this.btnMat.opacity = opacity;
    }
    /**
     * Hide the sound button (state related).
     * Default is to show.
     */
    hide(): void {
        this.soundButton.visible = false;
    }
    /**
     * Show the sound button (state related).
     * Default is to show.
     */
    show(): void {
        this.soundButton.visible = true;
    }
}
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
 * Mute button that draws and maintains click area for mute button.
 */
export class ControlMute {
    /**
     * Material for the speaker and x portion of the button.
     */
    private btnMat: MeshBasicMaterial
    /**
     * Mesh for the mute button.
     */
    private muteButton: Mesh;
    /**
     * Controls the mute button's border material.
     */
    private muteButtonBorderMaterial: LineBasicMaterial;
    /**
     * Constructor for the ControlMute class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param pos           upper left [x, z] point of control panel.
     * @param size          size modifier for button.
     * @param color         color to use for button and button material.
     * @param clkMat        consistent click material used for all control panel buttons.
     * @hidden
     */
    constructor(
        scene: Scene,
        pos: [number, number],
        size: number,
        color: Color,
        clkMat: MeshBasicMaterial) {
        // Mute button click barrier.
        const muteBarrierGeometry = new PlaneGeometry( size, size, 0, 0 );
        const muteBarrier = new Mesh( muteBarrierGeometry, clkMat );
        muteBarrier.name = 'Mute Button';
        muteBarrier.position.set(pos[0] + (size / 2) + (0.25 * size), 1, pos[1] + (size / 2) + (0.25 * size));
        muteBarrier.rotation.set(1.5708, 0, 0);
        scene.add(muteBarrier);
        // Mute button border.
        const muteButtonBorderGeometry = new Geometry();
        muteButtonBorderGeometry.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(size, 0, 0),
            new Vector3(size, 0, size),
            new Vector3(0, 0, size),
            new Vector3(0, 0, 0));
        this.muteButtonBorderMaterial = new LineBasicMaterial({
            color: color,
            opacity: 1,
            transparent: true });
        const muteButtonBorder = new Line(muteButtonBorderGeometry, this.muteButtonBorderMaterial);
        
        this.btnMat = new MeshBasicMaterial({
            color: color,
            opacity: 1,
            side: DoubleSide,
            transparent: true });
        
        const btnInnerSize = 0.8 * size;
        // Triangle of mute button.
        const xMute = (0.5625 * btnInnerSize);
        const yMute = (0.275 * btnInnerSize);
        const muteTriangle = new Shape();
        muteTriangle.moveTo( xMute, yMute );
        muteTriangle.lineTo( xMute - (0.45 * btnInnerSize), yMute - (0.225 * btnInnerSize) );
        muteTriangle.lineTo( xMute - (0.45 * btnInnerSize), yMute - (0.625 * btnInnerSize) );
        muteTriangle.lineTo( xMute, yMute - (0.8 * btnInnerSize) );
        muteTriangle.lineTo( xMute, yMute );
        const muteTriangleGeometry = new ShapeGeometry(muteTriangle);
        const muteTriangleMesh = new Mesh( muteTriangleGeometry, this.btnMat );
        muteTriangleMesh.position.set((0.25 * btnInnerSize), 0, (0.508333333334 * btnInnerSize));
        muteTriangleMesh.rotation.set(-1.5708, 0, 0);
        
        const muteTriangleBase = new Shape();
        muteTriangleBase.moveTo( xMute, yMute );
        muteTriangleBase.lineTo( xMute + (0.1 * btnInnerSize), yMute );
        muteTriangleBase.lineTo( xMute + (0.1 * btnInnerSize), yMute - (0.35 * btnInnerSize) );
        muteTriangleBase.lineTo( xMute, yMute - (0.35 * btnInnerSize) );
        muteTriangleBase.lineTo( xMute, yMute );
        const muteTriangleBaseGeometry = new ShapeGeometry(muteTriangleBase);
        const muteTriangleBaseMesh = new Mesh( muteTriangleBaseGeometry, this.btnMat );
        muteTriangleBaseMesh.position.set((-0.4 * btnInnerSize), 0, (0.76 * btnInnerSize));
        muteTriangleBaseMesh.rotation.set(-1.5708, 0, 0);

        const btnX = new Mesh();
        
        const muteTriangleX1 = new Shape();
        muteTriangleX1.moveTo( xMute, yMute );
        muteTriangleX1.lineTo( xMute + (0.25 * btnInnerSize), yMute + (0.25 * btnInnerSize) );
        muteTriangleX1.lineTo( xMute + (0.25 * btnInnerSize), yMute + (0.35 * btnInnerSize) );
        muteTriangleX1.lineTo( xMute, yMute + (0.1 * btnInnerSize) );
        muteTriangleX1.lineTo( xMute, yMute );
        const muteTriangleX1Geometry = new ShapeGeometry(muteTriangleX1);
        const muteTriangleX1Mesh = new Mesh( muteTriangleX1Geometry, this.btnMat );
        muteTriangleX1Mesh.position.set((0.3 * btnInnerSize), 0, (1.01 * btnInnerSize));
        muteTriangleX1Mesh.rotation.set(-1.5708, 0, 0);
        
        const muteTriangleX2 = new Shape();
        muteTriangleX2.moveTo( xMute, yMute );
        muteTriangleX2.lineTo( xMute + (0.25 * btnInnerSize), yMute + (0.25 * btnInnerSize) );
        muteTriangleX2.lineTo( xMute + (0.35 * btnInnerSize), yMute + (0.25 * btnInnerSize) );
        muteTriangleX2.lineTo( xMute + (0.1 * btnInnerSize), yMute );
        muteTriangleX2.lineTo( xMute, yMute );
        const muteTriangleX2Geometry = new ShapeGeometry(muteTriangleX2);
        const muteTriangleX2Mesh = new Mesh( muteTriangleX2Geometry, this.btnMat );
        muteTriangleX2Mesh.position.set((1.4 * btnInnerSize), 0, (1.3 * btnInnerSize));
        muteTriangleX2Mesh.rotation.set(-1.5708, 0, 1.5708);

        btnX.add(muteTriangleX1Mesh);
        btnX.add(muteTriangleX2Mesh);
        btnX.position.z += (0.06 * btnInnerSize);
        // The melding of the complete mute button.
        this.muteButton = new Mesh();
        this.muteButton.position.set(pos[0] + (0.25 * size), 0, pos[1] + (0.25 * size));
        this.muteButton.add(muteButtonBorder);
        this.muteButton.add(muteTriangleMesh);
        this.muteButton.add(muteTriangleBaseMesh);
        this.muteButton.add(btnX);
        scene.add(this.muteButton);
    }
    /**
     * Changes button material to match new level color.
     * @param color threeJS color value to use on button
     */
    changeColor(color: Color): void {
        this.muteButtonBorderMaterial.color = color;
        this.btnMat.color = color;
    }
    /**
     * Changes button opacity.
     * @param color opacity fraction to use on button material.
     */
    changeOpacity(opacity: number): void {
        this.muteButtonBorderMaterial.opacity = opacity;
        this.btnMat.opacity = opacity;
    }
    /**
     * Hide the mute button (state related).
     * Default is to show.
     */
    hide(): void {
        this.muteButton.visible = false;
    }
    /**
     * Show the mute button (state related).
     * Default is to show.
     */
    show(): void {
        this.muteButton.visible = true;
    }
}
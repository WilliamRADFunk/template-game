import {
    Color,
    DoubleSide,
    Font,
    Geometry,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    TextGeometry,
    Vector3 } from "three";

/**
 * @class
 * Help button that draws and maintains click area for help button.
 */
export class ControlHelp {
    /**
     * Mesh for the help button.
     */
    private helpButton: Mesh;
    /**
     * Controls the help button's border material.
     */
    private helpButtonBorderMaterial: LineBasicMaterial;
    /**
     * Controls the help button's question mark material.
     */
    private questionMarkMaterial: MeshBasicMaterial;
    /**
     * Constructor for the ControlHelp class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param pos           upper left [x, z] point of control panel.
     * @param size          size modifier for button.
     * @param color         color to use for button and button material.
     * @param color         color to use for button and button material.
     * @param clkMat        consistent click material used for all control panel buttons.
     * @param font          game font to use for creating the question mark.
     * @hidden
     */
    constructor(
        scene: Scene,
        pos: [number, number],
        size: number,
        color: Color,
        clkMat: MeshBasicMaterial,
        font: Font) {
        // Help button click barrier.
        const helpBarrierGeometry = new PlaneGeometry( size, size, 0, 0 );
        const helpBarrier = new Mesh( helpBarrierGeometry, clkMat );
        helpBarrier.name = 'Help Button';
        helpBarrier.position.set(pos[0] + (size / 2) + (0.25 * size), 1, pos[1] + (size / 2) + (0.25 * size));
        helpBarrier.rotation.set(1.5708, 0, 0);
        scene.add(helpBarrier);
        // Help button border.
        const helpButtonBorderGeometry = new Geometry();
        helpButtonBorderGeometry.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(size, 0, 0),
            new Vector3(size, 0, size),
            new Vector3(0, 0, size),
            new Vector3(0, 0, 0));
        this.helpButtonBorderMaterial = new LineBasicMaterial({
            color: color,
            opacity: 1,
            transparent: true });
        const helpButtonBorder = new Line(helpButtonBorderGeometry, this.helpButtonBorderMaterial);
        // Question mark of help button.
        this.questionMarkMaterial = new MeshBasicMaterial({
            color: color,
            opacity: 1,
            side: DoubleSide,
            transparent: true });
        const questionMarkGeometry = new TextGeometry(`?`,
            {
                font: font,
                size: (0.525 * size),
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 0.5,
                bevelSegments: 3
            });
        const questionMark = new Mesh( questionMarkGeometry, this.questionMarkMaterial );
        questionMark.position.set((0.25 * size), 0, (0.875 * size));
        questionMark.rotation.x = -1.5708;
        questionMark.name = 'question';
        // The melding of the complete help button.
        this.helpButton = new Mesh();
        this.helpButton.position.set(pos[0] + (0.25 * size), 0, pos[1] + (0.25 * size));
        this.helpButton.add(helpButtonBorder);
        this.helpButton.add(questionMark);
        scene.add(this.helpButton);
    }
    /**
     * Makes necessary changes to help button when help mode is activated.
     */
    activate(): void {
        this.changeOpacity(0.5);
    }
    /**
     * Changes button material to match new level color.
     * @param color threeJS color value to use on button
     */
    changeColor(color: Color): void {
        this.helpButtonBorderMaterial.color = color;
        this.questionMarkMaterial.color = color;
    }
    /**
     * Changes button opacity.
     * @param color opacity fraction to use on button material.
     */
    changeOpacity(opacity: number): void {
        this.helpButtonBorderMaterial.opacity = opacity;
        this.questionMarkMaterial.opacity = opacity;
    }
    /**
     * Makes necessary changes to help button when help mode is deactivated.
     */
    deactivate(): void {
        this.changeOpacity(1);
    }
    /**
     * Hide the help button (state related).
     * Default is to show.
     */
    hide(): void {
        this.helpButton.visible = false;
    }
    /**
     * Show the help button (state related).
     * Default is to show.
     */
    show(): void {
        this.helpButton.visible = true;
    }
}
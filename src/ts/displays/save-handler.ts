import {
    DoubleSide,
    Font,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PlaneGeometry,
    Scene,
    TextGeometry,
    TextGeometryParameters } from "three";

/**
 * Iterable list of x positions for each digit of the save code.
 * Necessary since constantly recreating TextGeometries with each new score is very costly.
 */
const positionIndex = [ -3.2, -2.7, -2.2, -1.7, -1.2, -0.7, -0.2, 0.3, 0.8, 1.3, 1.8, 2.3, 2.8, 3.3, 3.8, 4.3 ];
/**
 * @class
 * Save code screen that handles the shimmer effect and the displaying of save code.
 */
export class SaveHandler {
    /**
     * Counter for which digit backing material to change opacity for.
     */
    private activeMaterial: number = 0;
    /**
     * Click surface for the Return button.
     */
    private barrierReturn: Mesh;
    /**
     * All the digits of the save code from left to right.
     */
    private code: Mesh[] = [];
    /**
     * All the digit backings behind the save code from left to right.
     */
    private codeBackings: Mesh[] = [];
    /**
     * All the digit backing materials behind the save code from left to right.
     */
    private codeMaterials: MeshLambertMaterial[] = [];
    /**
     * All the digits of the save code in order (0, 1, 2, 3, ..., C, D, E, F).
     */
    private digits: TextGeometry[] = [];
    /**
     * Multiplier to decrease by current number or increase, using the sign of this variable.
     */
    private opacityDirection: number = -1;
    /**
     * Controls the overall rendering of the return button display
     */
    private return: Mesh;
    /**
     * Controls size and shape of the return button text
     */
    private returnGeometry: TextGeometry;
    /**
     * The background section of the save screen.
     */
    private saveBacking: Mesh;
    /**
     * Loaded font for display text.
     */
    private saveFont: Font;
    /**
     * Controls the color of the text display material
     */
    private saveMaterial: MeshLambertMaterial;
    /**
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private scene: Scene;
    /**
     * Tracks starting coordinates off which all items are based.
     */
    private startPos: [number, number, number] = [0, 0, 0];
    /**
     * Since most of the text on the menu has same parameters, use one variable.
     */
    private textHeaderParams: TextGeometryParameters;
    /**
     * Constructor for the SaveHandler class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param saveFont loaded font to use for save display text.
     * @hidden
     */
    constructor(scene: Scene, saveFont: Font) {
        this.saveFont = saveFont;
        this.scene = scene;
        this.saveMaterial = new MeshLambertMaterial( {color: 0x33339F, opacity: 1, transparent: true} );
        
        const totalMaterial = new MeshBasicMaterial( {color: 0x000000, opacity: 1, transparent: false, side: DoubleSide} );
        const totalBackingGeometry = new PlaneGeometry( 12, 10, 0, 0 );
        this.saveBacking = new Mesh( totalBackingGeometry, totalMaterial );
        this.saveBacking.position.set(this.startPos[0], this.startPos[1] - 10.1, this.startPos[2]);
        this.saveBacking.rotation.set(1.5708, 0, 0);
        this.scene.add(this.saveBacking);
        // Create the save collision layer
        const clickMaterial = new MeshBasicMaterial( {opacity: 0, transparent: true, side: DoubleSide} );
        const returnBarrierGeometry = new PlaneGeometry( 3, 0.8, 0, 0 );
        this.barrierReturn = new Mesh( returnBarrierGeometry, clickMaterial );
        this.barrierReturn.name = 'Return Save';
        this.barrierReturn.position.set(this.startPos[0], this.startPos[1] - 11.4, this.startPos[2] + 2);
        this.barrierReturn.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierReturn);

        this.textHeaderParams = {
            font: this.saveFont,
            size: 0.5,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };
        // Creates, in order, the geometries for 0-9 and A-F for hexidecimal characters.
        for (let i = 0; i < 10; i++) {
            this.digits.push(new TextGeometry(i.toString(), this.textHeaderParams));
        }
        for (let j = 65; j < 71; j++) {
            this.digits.push(new TextGeometry(String.fromCharCode(j), this.textHeaderParams));
        }
        const codeBackingGeometry = new PlaneGeometry( 0.5, 0.8, 0, 0 );
        // Material backings 
        for (let k = 0; k < 16; k++) {
            const codeMat = new MeshLambertMaterial({color: 0xFFB6C1, opacity: 1, transparent: true, side: DoubleSide});
            const codeBack = new Mesh(codeBackingGeometry, codeMat);
            this.codeMaterials.push(codeMat);
            this.codeBackings.push(codeBack);
            codeBack.position.set(this.startPos[0] + positionIndex[k] - 0.55, this.startPos[1] - 11.4, this.startPos[2] - 1.35);
            codeBack.rotation.set(1.5708, 0, 0);
            this.scene.add(codeBack);
        }
        // Return button text
        this.returnGeometry = new TextGeometry('RESUME', this.textHeaderParams);
        this.return = new Mesh( this.returnGeometry, this.saveMaterial );
        this.return.position.set(this.startPos[0] - 1.45, this.startPos[1] - 12, this.startPos[2] + 2.35);
        this.return.rotation.x = -1.5708;
        this.scene.add(this.return);
        // Start everything in the off state.
        this.deactivate();
    }
    /**
     * Turns on all save screen related graphics
     * @param hex digits that form game state save code.
     */
    activate(code: string[]): void {
        this.barrierReturn.visible = true;
        this.return.visible = true;
        this.saveBacking.visible = true;
        this.code.filter(c => c.visible = true);
        this.codeBackings.filter(b => b.visible = true);
        this.showSaveCode(code);
    }
    /**
     * Turns off all save screen related graphics
     */
    deactivate(): void {
        this.barrierReturn.visible = false;
        this.return.visible = false;
        this.saveBacking.visible = false;
        this.codeBackings.filter(b => b.visible = false);
        if (this.code.length) this.code.filter(c => this.scene.remove(c));
    }
    /**
     * Creates the shimmer behind the save code.
     */
    endCycle(): void {
        // End of the line, start at beginning and swith opacity directions
        if (this.activeMaterial >= 16) {
            this.activeMaterial = 0;
            this.opacityDirection *= -1;
        }
        // Spreads the change out over 4 blocks with diminishing potency.
        this.codeMaterials[this.activeMaterial].opacity += (0.08 * this.opacityDirection);
        if (this.activeMaterial < 12) this.codeMaterials[this.activeMaterial + 1].opacity += (0.06 * this.opacityDirection);
        if (this.activeMaterial < 11) this.codeMaterials[this.activeMaterial + 2].opacity += (0.03 * this.opacityDirection);
        if (this.activeMaterial < 10) this.codeMaterials[this.activeMaterial + 3].opacity += (0.01 * this.opacityDirection);
        // Depending on direction and bound reached, increment block by one.
        if (this.opacityDirection < 0 && this.codeMaterials[this.activeMaterial].opacity < 0.01) {
            this.codeMaterials[this.activeMaterial].opacity = 0;
            this.activeMaterial++;
        } else if (this.opacityDirection > 0 && this.codeMaterials[this.activeMaterial].opacity > 0.99) {
            this.codeMaterials[this.activeMaterial].opacity = 1;
            this.activeMaterial++;
        }
    }
    /**
     * Paints the screen with the save code characters.
     * @param hex digits that form game state save code.
     */
    showSaveCode(code: string[]): void {
        code.forEach((c, i) => {
            const charIndex = (c.charCodeAt(0) < 58) ? Number(c) : (c.charCodeAt(0) - 55); // 0-9 : A-F
            const char = new Mesh( this.digits[charIndex], this.saveMaterial );
            char.position.set(this.startPos[0] + positionIndex[i] - 0.75, this.startPos[1] - 12.4, this.startPos[2] - 1);
            char.rotation.x = -1.5708;
            this.scene.add(char);
            this.code.push(char);
        })
    }
}
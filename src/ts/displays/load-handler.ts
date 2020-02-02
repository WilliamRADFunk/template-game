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
 * Iterable list of x positions for each digit of the load code.
 * Necessary since constantly recreating TextGeometries with each new score is very costly.
 */
const positionIndex = [ -3.2, -2.7, -2.2, -1.7, -1.2, -0.7, -0.2, 0.3, 0.8, 1.3, 1.8, 2.3, 2.8, 3.3, 3.8, 4.3 ];
/**
 * @class
 * Load code screen that handles the shimmer effect and the displaying of entering of load code.
 */
export class LoadHandler {
    /**
     * Counter for which digit backing material to change opacity for.
     */
    private activeMaterial: number = 0;
    /**
     * Click surface for the Load Code button.
     */
    private barrierLoad: Mesh;
    /**
     * Click surface for the Return button.
     */
    private barrierReturn: Mesh;
    /**
     * All the digits of the load code from left to right.
     */
    private code: Mesh[] = [];
    /**
     * All the digit backings behind the load code from left to right.
     */
    private codeBackings: Mesh[] = [];
    /**
     * All the digit backing materials behind the load code from left to right.
     */
    private codeMaterials: MeshLambertMaterial[] = [];
    /**
     * The clickable char controls player uses to enter load code.
     */
    private controls: Mesh[] = [];
    /**
     * The char controls player uses to enter load code.
     */
    private controlTexts: Mesh[] = [];
    /**
     * All the hexidecimal characters the player has entered thus far.
     */
    private currentEnteredCode: string[] = [];
    /**
     * All the digits of the load code in order (0, 1, 2, 3, ..., C, D, E, F).
     */
    private digits: TextGeometry[] = [];
    /**
     * Controls the overall rendering of the load button display
     */
    private load: Mesh;
    /**
     * The background section of the load screen.
     */
    private loadBacking: Mesh;
    /**
     * Loaded font for display text.
     */
    private loadFont: Font;
    /**
     * Controls the color of the text display material
     */
    private loadMaterial: MeshLambertMaterial;
    /**
     * Multiplier to decrease by current number or increase, using the sign of this variable.
     */
    private opacityDirection: number = 1;
    /**
     * Controls the overall rendering of the return button display
     */
    private return: Mesh;
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
     * Constructor for the LoadHandler class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param loadFont loaded font to use for load display text.
     * @hidden
     */
    constructor(scene: Scene, loadFont: Font) {
        this.loadFont = loadFont;
        this.scene = scene;
        this.loadMaterial = new MeshLambertMaterial( {color: 0x33339F, opacity: 1, transparent: true} );
        
        const totalMaterial = new MeshBasicMaterial( {color: 0x000000, opacity: 1, transparent: false, side: DoubleSide} );
        const totalBackingGeometry = new PlaneGeometry( 12, 10, 0, 0 );
        this.loadBacking = new Mesh( totalBackingGeometry, totalMaterial );
        this.loadBacking.position.set(this.startPos[0], this.startPos[1] - 10.1, this.startPos[2]);
        this.loadBacking.rotation.set(1.5708, 0, 0);
        this.scene.add(this.loadBacking);
        // Create the load collision layer
        const clickMaterial = new MeshBasicMaterial( {opacity: 0, transparent: true, side: DoubleSide} );
        const returnBarrierGeometry = new PlaneGeometry( 3, 0.8, 0, 0 );
        this.barrierReturn = new Mesh( returnBarrierGeometry, clickMaterial );
        this.barrierReturn.name = 'Return Load';
        this.barrierReturn.position.set(this.startPos[0], this.startPos[1] - 11.4, this.startPos[2] + 4);
        this.barrierReturn.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierReturn);

        const loadBarrierGeometry = new PlaneGeometry( 2, 0.8, 0, 0 );
        this.barrierLoad = new Mesh( loadBarrierGeometry, clickMaterial );
        this.barrierLoad.name = 'Load Code';
        this.barrierLoad.position.set(this.startPos[0], this.startPos[1] - 11.4, this.startPos[2] + 2);
        this.barrierLoad.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierLoad);

        this.textHeaderParams = {
            font: this.loadFont,
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
            codeMat.opacity = 0;
        }
        // Clickable backing for 0-7 controls
        for (let m = 0; m < 8; m++) {
            const controlBarrier = new Mesh( codeBackingGeometry, clickMaterial );
            controlBarrier.name = m.toString();
            controlBarrier.position.set(this.startPos[0] + positionIndex[m] + 1.5, this.startPos[1] - 11.4, this.startPos[2] - 4.35);
            controlBarrier.rotation.set(1.5708, 0, 0);
            this.scene.add(controlBarrier);
            this.controls.push(controlBarrier);

            const charGeometry = new TextGeometry(m.toString(), this.textHeaderParams);
            const char = new Mesh( charGeometry, this.loadMaterial );
            char.position.set(this.startPos[0] + positionIndex[m] + 1.3, this.startPos[1] - 12, this.startPos[2] - 4);
            char.rotation.x = -1.5708;
            this.scene.add(char);
            this.controlTexts.push(char);
        }
        // Clickable backing for 8-9 controls
        for (let n = 71; n < 73; n++) {
            const controlBarrier = new Mesh( codeBackingGeometry, clickMaterial );
            controlBarrier.name = (n - 63).toString();
            controlBarrier.position.set(this.startPos[0] + positionIndex[n - 71] + 1.5, this.startPos[1] - 11.4, this.startPos[2] - 3.35);
            controlBarrier.rotation.set(1.5708, 0, 0);
            this.scene.add(controlBarrier);
            this.controls.push(controlBarrier);

            const charGeometry = new TextGeometry((n - 63).toString(), this.textHeaderParams);
            const char = new Mesh( charGeometry, this.loadMaterial );
            char.position.set(this.startPos[0] + positionIndex[n - 71] + 1.3, this.startPos[1] - 12, this.startPos[2] - 3);
            char.rotation.x = -1.5708;
            this.scene.add(char);
            this.controlTexts.push(char);
        }
        // Clickable backing for A-F controls
        for (let p = 65; p < 71; p++) {
            const controlBarrier = new Mesh( codeBackingGeometry, clickMaterial );
            controlBarrier.name = String.fromCharCode(p);
            controlBarrier.position.set(this.startPos[0] + positionIndex[p - 63] + 1.5, this.startPos[1] - 11.4, this.startPos[2] - 3.35);
            controlBarrier.rotation.set(1.5708, 0, 0);
            this.scene.add(controlBarrier);
            this.controls.push(controlBarrier);

            const charGeometry = new TextGeometry(String.fromCharCode(p), this.textHeaderParams);
            const char = new Mesh( charGeometry, this.loadMaterial );
            char.position.set(this.startPos[0] + positionIndex[p - 63] + 1.3, this.startPos[1] - 12, this.startPos[2] - 3);
            char.rotation.x = -1.5708;
            this.scene.add(char);
            this.controlTexts.push(char);
        }
        // Return button text
        const returnGeometry = new TextGeometry('RESUME', this.textHeaderParams);
        this.return = new Mesh( returnGeometry, this.loadMaterial );
        this.return.position.set(this.startPos[0] - 1.45, this.startPos[1] - 12, this.startPos[2] + 4.35);
        this.return.rotation.x = -1.5708;
        this.scene.add(this.return);
        // Load button text
        const loadGeometry = new TextGeometry('LOAD', this.textHeaderParams);
        this.load = new Mesh( loadGeometry, this.loadMaterial );
        this.load.position.set(this.startPos[0] - 0.95, this.startPos[1] - 12, this.startPos[2] + 2.35);
        this.load.rotation.x = -1.5708;
        this.scene.add(this.load);
        // Start everything in the off state.
        this.deactivate();
    }
    /**
     * Turns on all load screen related graphics
     * @param hex digits that form game state load code.
     */
    activate(): void {
        this.barrierReturn.visible = true;
        this.barrierLoad.visible = true;
        this.return.visible = true;
        this.load.visible = true;
        this.loadBacking.visible = true;
        this.code.filter(c => c.visible = true);
        this.codeBackings.filter(b => b.visible = true);
        this.controls.filter(ctrl => ctrl.visible = true);
        this.controlTexts.filter(ctrlTxt => ctrlTxt.visible = true);
        this.showLoadCode();
    }
    /**
     * Adds player's choice of char to the list of load code chars.
     * @param char player clicked on a specific char. This is that char 0-F
     */
    charEntered(char: string): void {
        this.currentEnteredCode[this.activeMaterial] = char;
        this.showLoadCode();
        this.codeMaterials[this.activeMaterial].opacity = 0;
        this.activeMaterial++;
        // End of the line, start at beginning and swith opacity directions
        if (this.activeMaterial >= 16) {
            this.activeMaterial = 0;
            this.opacityDirection = 1;
        }
    }
    /**
     * Turns off all load screen related graphics
     */
    deactivate(): void {
        this.barrierReturn.visible = false;
        this.barrierLoad.visible = false;
        this.return.visible = false;
        this.load.visible = false;
        this.loadBacking.visible = false;
        this.codeBackings.filter(b => b.visible = false);
        this.controls.filter(ctrl => ctrl.visible = false);
        this.controlTexts.filter(ctrlTxt => ctrlTxt.visible = false);
        if (this.code.length) this.code.filter(c => this.scene.remove(c));
    }
    /**
     * Creates the shimmer behind the load code.
     */
    endCycle(): void {
        // Spreads the change out over 4 blocks with diminishing potency.
        this.codeMaterials[this.activeMaterial].opacity += (0.02 * this.opacityDirection);
        // Depending on direction and bound reached, increment block by one.
        if (this.opacityDirection < 0 && this.codeMaterials[this.activeMaterial].opacity < 0.01) {
            this.codeMaterials[this.activeMaterial].opacity = 0;
            this.opacityDirection *= -1;
        } else if (this.opacityDirection > 0 && this.codeMaterials[this.activeMaterial].opacity > 0.99) {
            this.codeMaterials[this.activeMaterial].opacity = 1;
            this.opacityDirection *= -1;
        }
    }
    /**
     * Deciphers the load code and returns it if valid, or null if not.
     * @returns valid game load data object from deciphered load code or null.
     */
    getGameData(): null {
        return null;
    }
    /**
     * Paints the screen with the load code characters.
     */
    showLoadCode(): void {
        if (this.code.length) this.code.filter(c => this.scene.remove(c));
        this.code = [];
        this.currentEnteredCode.forEach((c, i) => {
            const charIndex = (c.charCodeAt(0) < 58) ? Number(c) : (c.charCodeAt(0) - 55); // 0-9 : A-F
            const char = new Mesh( this.digits[charIndex], this.loadMaterial );
            char.position.set(this.startPos[0] + positionIndex[i] - 0.75, this.startPos[1] - 12.4, this.startPos[2] - 1);
            char.rotation.x = -1.5708;
            this.scene.add(char);
            this.code.push(char);
        });
    }
}
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
    private _activeMaterial: number = 0;

    /**
     * Click surface for the Load Code button.
     */
    private _barrierLoad: Mesh;

    /**
     * Click surface for the Return button.
     */
    private _barrierReturn: Mesh;

    /**
     * All the _digits of the load code from left to right.
     */
    private _code: Mesh[] = [];

    /**
     * All the digit backings behind the load code from left to right.
     */
    private _codeBackings: Mesh[] = [];

    /**
     * All the digit backing materials behind the load code from left to right.
     */
    private _codeMaterials: MeshLambertMaterial[] = [];

    /**
     * The clickable char controls player uses to enter load code.
     */
    private _controls: Mesh[] = [];

    /**
     * The char controls player uses to enter load code.
     */
    private _controlTexts: Mesh[] = [];

    /**
     * All the hexidecimal characters the player has entered thus far.
     */
    private _currentEnteredCode: string[] = [];

    /**
     * All the digits of the load code in order (0, 1, 2, 3, ..., C, D, E, F).
     */
    private _digits: TextGeometry[] = [];

    /**
     * Controls the overall rendering of the load button display
     */
    private _load: Mesh;

    /**
     * The background section of the load screen.
     */
    private _loadBacking: Mesh;

    /**
     * Loaded font for display text.
     */
    private _loadFont: Font;

    /**
     * Controls the color of the text display material
     */
    private _loadMaterial: MeshLambertMaterial;

    /**
     * Multiplier to decrease by current number or increase, using the sign of this variable.
     */
    private _opacityDirection: number = 1;

    /**
     * Controls the overall rendering of the return button display
     */
    private _return: Mesh;

    /**
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private _scene: Scene;

    /**
     * Tracks starting coordinates off which all items are based.
     */
    private _startPos: [number, number, number] = [0, 0, 0];

    /**
     * Since most of the text on the menu has same parameters, use one variable.
     */
    private _textHeaderParams: TextGeometryParameters;

    /**
     * Constructor for the LoadHandler class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param loadFont loaded font to use for load display text.
     * @hidden
     */
    constructor(scene: Scene, loadFont: Font) {
        this._loadFont = loadFont;
        this._scene = scene;
        this._loadMaterial = new MeshLambertMaterial( {color: 0x33339F, opacity: 1, transparent: true} );
        
        const totalMaterial = new MeshBasicMaterial( {color: 0x000000, opacity: 1, transparent: false, side: DoubleSide} );
        const totalBackingGeometry = new PlaneGeometry( 12, 10, 0, 0 );
        this._loadBacking = new Mesh( totalBackingGeometry, totalMaterial );
        this._loadBacking.position.set(this._startPos[0], this._startPos[1] - 10.1, this._startPos[2]);
        this._loadBacking.rotation.set(1.5708, 0, 0);
        this._scene.add(this._loadBacking);

        // Create the load collision layer
        const clickMaterial = new MeshBasicMaterial( {opacity: 0, transparent: true, side: DoubleSide} );
        const returnBarrierGeometry = new PlaneGeometry( 3, 0.8, 0, 0 );
        this._barrierReturn = new Mesh( returnBarrierGeometry, clickMaterial );
        this._barrierReturn.name = 'Return Load';
        this._barrierReturn.position.set(this._startPos[0], this._startPos[1] - 11.4, this._startPos[2] + 4);
        this._barrierReturn.rotation.set(1.5708, 0, 0);
        this._scene.add(this._barrierReturn);

        const loadBarrierGeometry = new PlaneGeometry( 2, 0.8, 0, 0 );
        this._barrierLoad = new Mesh( loadBarrierGeometry, clickMaterial );
        this._barrierLoad.name = 'Load Code';
        this._barrierLoad.position.set(this._startPos[0], this._startPos[1] - 11.4, this._startPos[2] + 2);
        this._barrierLoad.rotation.set(1.5708, 0, 0);
        this._scene.add(this._barrierLoad);

        this._textHeaderParams = {
            font: this._loadFont,
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
            this._digits.push(new TextGeometry(i.toString(), this._textHeaderParams));
        }
        for (let j = 65; j < 71; j++) {
            this._digits.push(new TextGeometry(String.fromCharCode(j), this._textHeaderParams));
        }

        // Material backings
        const codeBackingGeometry = new PlaneGeometry( 0.5, 0.8, 0, 0 );
        for (let k = 0; k < 16; k++) {
            const codeMat = new MeshLambertMaterial({color: 0xFFB6C1, opacity: 1, transparent: true, side: DoubleSide});
            const codeBack = new Mesh(codeBackingGeometry, codeMat);
            this._codeMaterials.push(codeMat);
            this._codeBackings.push(codeBack);
            codeBack.position.set(this._startPos[0] + positionIndex[k] - 0.55, this._startPos[1] - 11.4, this._startPos[2] - 1.35);
            codeBack.rotation.set(1.5708, 0, 0);
            this._scene.add(codeBack);
            codeMat.opacity = 0;
        }

        // Clickable backing for 0-7 _controls
        for (let m = 0; m < 8; m++) {
            const controlBarrier = new Mesh( codeBackingGeometry, clickMaterial );
            controlBarrier.name = m.toString();
            controlBarrier.position.set(this._startPos[0] + positionIndex[m] + 1.5, this._startPos[1] - 11.4, this._startPos[2] - 4.35);
            controlBarrier.rotation.set(1.5708, 0, 0);
            this._scene.add(controlBarrier);
            this._controls.push(controlBarrier);

            const charGeometry = new TextGeometry(m.toString(), this._textHeaderParams);
            const char = new Mesh( charGeometry, this._loadMaterial );
            char.position.set(this._startPos[0] + positionIndex[m] + 1.3, this._startPos[1] - 12, this._startPos[2] - 4);
            char.rotation.x = -1.5708;
            this._scene.add(char);
            this._controlTexts.push(char);
        }

        // Clickable backing for 0-9 _controls
        for (let n = 71; n < 73; n++) {
            const controlBarrier = new Mesh( codeBackingGeometry, clickMaterial );
            controlBarrier.name = (n - 63).toString();
            controlBarrier.position.set(this._startPos[0] + positionIndex[n - 71] + 1.5, this._startPos[1] - 11.4, this._startPos[2] - 3.35);
            controlBarrier.rotation.set(1.5708, 0, 0);
            this._scene.add(controlBarrier);
            this._controls.push(controlBarrier);

            const charGeometry = new TextGeometry((n - 63).toString(), this._textHeaderParams);
            const char = new Mesh( charGeometry, this._loadMaterial );
            char.position.set(this._startPos[0] + positionIndex[n - 71] + 1.3, this._startPos[1] - 12, this._startPos[2] - 3);
            char.rotation.x = -1.5708;
            this._scene.add(char);
            this._controlTexts.push(char);
        }

        // Clickable backing for A-F _controls
        for (let p = 65; p < 71; p++) {
            const controlBarrier = new Mesh( codeBackingGeometry, clickMaterial );
            controlBarrier.name = String.fromCharCode(p);
            controlBarrier.position.set(this._startPos[0] + positionIndex[p - 63] + 1.5, this._startPos[1] - 11.4, this._startPos[2] - 3.35);
            controlBarrier.rotation.set(1.5708, 0, 0);
            this._scene.add(controlBarrier);
            this._controls.push(controlBarrier);

            const charGeometry = new TextGeometry(String.fromCharCode(p), this._textHeaderParams);
            const char = new Mesh( charGeometry, this._loadMaterial );
            char.position.set(this._startPos[0] + positionIndex[p - 63] + 1.3, this._startPos[1] - 12, this._startPos[2] - 3);
            char.rotation.x = -1.5708;
            this._scene.add(char);
            this._controlTexts.push(char);
        }

        // Return button text
        const returnGeometry = new TextGeometry('RESUME', this._textHeaderParams);
        this._return = new Mesh( returnGeometry, this._loadMaterial );
        this._return.position.set(this._startPos[0] - 1.45, this._startPos[1] - 12, this._startPos[2] + 4.35);
        this._return.rotation.x = -1.5708;
        this._scene.add(this._return);

        // Load button text
        const loadGeometry = new TextGeometry('LOAD', this._textHeaderParams);
        this._load = new Mesh( loadGeometry, this._loadMaterial );
        this._load.position.set(this._startPos[0] - 0.95, this._startPos[1] - 12, this._startPos[2] + 2.35);
        this._load.rotation.x = -1.5708;
        this._scene.add(this._load);

        // Start everything in the off state.
        this.deactivate();
    }

    /**
     * Paints the screen with the load code characters.
     */
    private _showLoadCode(): void {
        if (this._code.length) this._code.filter(c => this._scene.remove(c));
        this._code = [];
        this._currentEnteredCode.forEach((c, i) => {
            const charIndex = (c.charCodeAt(0) < 58) ? Number(c) : (c.charCodeAt(0) - 55); // 0-9 : A-F
            const char = new Mesh( this._digits[charIndex], this._loadMaterial );
            char.position.set(this._startPos[0] + positionIndex[i] - 0.75, this._startPos[1] - 12.4, this._startPos[2] - 1);
            char.rotation.x = -1.5708;
            this._scene.add(char);
            this._code.push(char);
        });
    }

    /**
     * Turns on all load screen related graphics
     */
    public activate(): void {
        this._barrierReturn.visible = true;
        this._barrierLoad.visible = true;
        this._return.visible = true;
        this._load.visible = true;
        this._loadBacking.visible = true;
        this._code.filter(c => c.visible = true);
        this._codeBackings.filter(b => b.visible = true);
        this._controls.filter(ctrl => ctrl.visible = true);
        this._controlTexts.filter(ctrlTxt => ctrlTxt.visible = true);
        this._showLoadCode();
    }

    /**
     * Adds player's choice of char to the list of load code chars.
     * @param char player clicked on a specific char. This is that char 0-F
     */
    public charEntered(char: string): void {
        this._currentEnteredCode[this._activeMaterial] = char;
        this._showLoadCode();
        this._codeMaterials[this._activeMaterial].opacity = 0;
        this._activeMaterial++;

        // End of the line, start at beginning and swith opacity directions
        if (this._activeMaterial >= 16) {
            this._activeMaterial = 0;
            this._opacityDirection = 1;
        }
    }

    /**
     * Turns off all load screen related graphics
     */
    public deactivate(): void {
        this._barrierReturn.visible = false;
        this._barrierLoad.visible = false;
        this._return.visible = false;
        this._load.visible = false;
        this._loadBacking.visible = false;
        this._codeBackings.filter(b => b.visible = false);
        this._controls.filter(ctrl => ctrl.visible = false);
        this._controlTexts.filter(ctrlTxt => ctrlTxt.visible = false);
        if (this._code.length) {
            this._code.filter(c => this._scene.remove(c));
        }
    }

    /**
     * Creates the shimmer behind the load code.
     */
    public endCycle(): void {
        // Spreads the change out over 4 blocks with diminishing potency.
        this._codeMaterials[this._activeMaterial].opacity += (0.02 * this._opacityDirection);

        // Depending on direction and bound reached, increment block by one.
        if (this._opacityDirection < 0 && this._codeMaterials[this._activeMaterial].opacity < 0.01) {
            this._codeMaterials[this._activeMaterial].opacity = 0;
            this._opacityDirection *= -1;
        } else if (this._opacityDirection > 0 && this._codeMaterials[this._activeMaterial].opacity > 0.99) {
            this._codeMaterials[this._activeMaterial].opacity = 1;
            this._opacityDirection *= -1;
        }
    }

    /**
     * Deciphers the load code and returns it if valid, or null if not.
     * @returns valid game load data object from deciphered load code or null.
     */
    public getGameData(): null {
        return null;
    }
}
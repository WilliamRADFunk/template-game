import {
    DoubleSide,
    Font,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    PlaneGeometry,
    Scene,
    TextGeometry,
    TextGeometryParameters} from "three";

/**
 * @class
 * Help screen that handles all of the animated instructions on how to play.
 */
export class HelpHandler {
    /**
     * Click surface for the Return button.
     */
    private barrierReturn: Mesh;
    /**
     * Loaded font for display text.
     */
    private helpFont: Font;
    /**
     * Controls the color of the text display material
     */
    private helpMaterial: MeshLambertMaterial;
    /**
     * Controls the overall rendering of the return button display
     */
    private return: Mesh;
    /**
     * Controls size and shape of the return button text
     */
    private returnGeometry: TextGeometry;
    /**
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private scene: Scene;
    /**
     * Geometry for side help section backings
     */
    private sectionBackingGeometrySides: PlaneGeometry;
    /**
     * Geometry for middle help section backings
     */
    private sectionBackingGeometryMiddle: PlaneGeometry;
    /**
     * Geometry for side help section borders
     */
    private sectionGlowGeometrySides: PlaneGeometry;
    /**
     * Geometry for middle help section borders
     */
    private sectionGlowGeometryMiddle: PlaneGeometry;
    /**
     * Blackish background material for each help section.
     */
    private sectionMaterial: MeshBasicMaterial;
    /**
     * Bluish background border material for each help section.
     */
    private sectionMaterialGlow: MeshPhongMaterial;
    /**
     * All the background sections of the help screen.
     */
    private sections: Mesh[] = [];
    /**
     * Since most of the text on the menu has same parameters, use one variable.
     */
    private textHeaderParams: TextGeometryParameters;
    /**
     * Since most of the text on the menu has same parameters, use one variable.
     */
    private textpParams: TextGeometryParameters;
    /**
     * All the texts of the help screen.
     */
    private texts: Mesh[] = [];
    /**
     * Tracks current z baseline coordinate off which all items are based.
     */
    private zSpot: number = 0.1;
    /**
     * Constructor for the HelpHandler class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param helpFont loaded font to use for help display text.
     * @hidden
     */
    constructor(scene: Scene, helpFont: Font) {
        this.helpFont = helpFont;
        this.scene = scene;

        this.sectionMaterial = new MeshBasicMaterial( {color: 0x111111, opacity: 1, transparent: false, side: DoubleSide} );
        this.sectionMaterialGlow = new MeshPhongMaterial( {color: 0x0955FF, opacity: 0.2, transparent: true, side: DoubleSide} );
        this.sectionBackingGeometrySides = new PlaneGeometry( 3, 2.3, 0, 0 );
        this.sectionGlowGeometrySides = new PlaneGeometry( 3.2, 2.4, 0, 0 );
        this.sectionBackingGeometryMiddle = new PlaneGeometry( 4.5, 2.3, 0, 0 );
        this.sectionGlowGeometryMiddle = new PlaneGeometry( 4.7, 2.4, 0, 0 );

        const totalMaterial = new MeshBasicMaterial( {color: 0x000000, opacity: 1, transparent: false, side: DoubleSide} );
        const totalBackingGeometry = new PlaneGeometry( 12, 10.55, 0, 0 );

        const section = new Mesh( totalBackingGeometry, totalMaterial );
        section.position.set(0, -10.1, this.zSpot);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        // Create the help collision layer
        const clickMaterial = new MeshBasicMaterial( {opacity: 0, transparent: true, side: DoubleSide} );
        const returnBarrierGeometry = new PlaneGeometry( 2, 0.8, 0, 0 );
        this.barrierReturn = new Mesh( returnBarrierGeometry, clickMaterial );
        this.barrierReturn.name = 'Return Help';
        this.barrierReturn.position.set(0.1, 0, this.zSpot + 4);
        this.barrierReturn.rotation.set(1.5708, 0, 0);
        this.scene.add(this.barrierReturn);

        this.textHeaderParams = {
            font: this.helpFont,
            size: 0.199,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };
        this.textpParams = {
            font: this.helpFont,
            size: 0.13,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };
        this.helpMaterial = new MeshLambertMaterial( {color: 0x00B39F, opacity: 1, transparent: true} );
        // Long top box
        this.makeBox0();
        // 2nd row left side
        this.makeBox1();
        // 2nd row middle
        this.makeBox2();
        // 2nd row right side
        this.makeBox3();
        // 3rd row left side
        this.makeBox4();
        // 3rd row middle
        this.makeBox5();
        // 3rd row right side
        this.makeBox6();
        // 4th row left side
        this.makeBox7();
        // 3rd row right side
        this.makeBox8();
        // Return button text
        this.returnGeometry = new TextGeometry('RETURN', this.textHeaderParams);
        this.return = new Mesh( this.returnGeometry, this.helpMaterial );
        this.return.position.set(-0.6, -11, this.zSpot + 4.2);
        this.return.rotation.x = -1.5708;
        this.scene.add(this.return);

        this.deactivate();
    }
    /**
     * Turns on all help screen related graphics
     */
    activate(): void {
        this.barrierReturn.visible = true;
        this.return.visible = true;
        this.sections.filter(x => x.visible = true);
        this.texts.filter(x => x.visible = true);
    }
    /**
     * Turns off all help screen related graphics
     */
    deactivate(): void {
        this.barrierReturn.visible = false;
        this.return.visible = false;
        this.sections.filter(x => x.visible = false);
        this.texts.filter(x => x.visible = false);
    }
    /**
     * Moves the animated help items.
     */
    endCycle(): void { }
    /**
     * Builds the box and graphics for the long top section.
     */
    private makeBox0(): void {
        const sectionBackingGeometryTop = new PlaneGeometry( 11.5, 2.3, 0, 0 );
        const sectionGlowGeometryTop = new PlaneGeometry( 11.7, 2.4, 0, 0 );

        let section = new Mesh( sectionBackingGeometryTop, this.sectionMaterial );
        section.position.set(0, -11, this.zSpot - 4.1);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        section = new Mesh( sectionGlowGeometryTop, this.sectionMaterialGlow );
        section.position.set(0, -10.9, this.zSpot - 4.1);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        let textGeo = new TextGeometry('Sentence 1...', this.textHeaderParams);
        let text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(-5.65, -11.4, this.zSpot - 4.8);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);

        textGeo = new TextGeometry('Sentence 2...', this.textHeaderParams);
        text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(-1.7, -11.4, this.zSpot - 4.8);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);

        textGeo = new TextGeometry('Sentence 3...', this.textHeaderParams);
        text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(2.8, -11.4, this.zSpot - 4.8);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);
    }
    /**
     * Builds the box and graphics for the 2nd row left section.
     */
    private makeBox1(): void {
        let section = new Mesh( this.sectionBackingGeometrySides, this.sectionMaterial );
        section.position.set(-4.25, -11, this.zSpot - 1.4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        section = new Mesh( this.sectionGlowGeometrySides, this.sectionMaterialGlow );
        section.position.set(-4.25, -10.9, this.zSpot - 1.4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);
    }
    /**
     * Builds the box and graphics for the 2nd row middle section.
     */
    private makeBox2(): void {
        let section = new Mesh( this.sectionBackingGeometryMiddle, this.sectionMaterial );
        section.position.set(0, -11, this.zSpot - 1.4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        section = new Mesh( this.sectionGlowGeometryMiddle, this.sectionMaterialGlow );
        section.position.set(0, -10.9, this.zSpot - 1.4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        let textGeo = new TextGeometry('Sentence 1', this.textHeaderParams);
        let text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(-2.2, -11.4, this.zSpot - 2.2);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);

        textGeo = new TextGeometry('Sentence 2', this.textHeaderParams);
        text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(-1.2, -11.4, this.zSpot - 0.35);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);
    }
    /**
     * Builds the box and graphics for the 2nd row right section.
     */
    private makeBox3(): void {
        let section = new Mesh( this.sectionBackingGeometrySides, this.sectionMaterial );
        section.position.set(4.25, -11, this.zSpot - 1.4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        section = new Mesh( this.sectionGlowGeometrySides, this.sectionMaterialGlow );
        section.position.set(4.25, -10.9, this.zSpot - 1.4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        let textGeo = new TextGeometry('Example', this.textHeaderParams);
        let text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(3, -11.4, this.zSpot - 2.2);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);

        textGeo = new TextGeometry('Placeholder 1', this.textpParams);
        text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(3, -11.4, this.zSpot - 1);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);

        textGeo = new TextGeometry('Placeholder 2', this.textpParams);
        text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(3.2, -11.4, this.zSpot - 0.7);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);

        textGeo = new TextGeometry('Placeholder 3', this.textpParams);
        text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(3.4, -11.4, this.zSpot - 0.4);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);
    }
    /**
     * Builds the box and graphics for the 3rd row left section.
     */
    private makeBox4(): void {
        let section = new Mesh( this.sectionBackingGeometrySides, this.sectionMaterial );
        section.position.set(-4.25, -11, this.zSpot + 1.3);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        section = new Mesh( this.sectionGlowGeometrySides, this.sectionMaterialGlow );
        section.position.set(-4.25, -10.9, this.zSpot + 1.3);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        const textGeo = new TextGeometry('Placeholder', this.textHeaderParams);
        const text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(-5.55, -11.4, this.zSpot + 0.5);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);
    }
    /**
     * Builds the box and graphics for the 3rd row middle section.
     */
    private makeBox5(): void {
        const sectionBackingGeometryMiddle = new PlaneGeometry( 4.5, 3.2, 0, 0 );
        const sectionGlowGeometryMiddle = new PlaneGeometry( 4.7, 3.3, 0, 0 );

        const greenText = new MeshLambertMaterial( {color: 0x00FF00, opacity: 1, transparent: true} );
        const redText = new MeshLambertMaterial( {color: 0xFF0000, opacity: 1, transparent: true} );

        let section = new Mesh( sectionBackingGeometryMiddle, this.sectionMaterial );
        section.position.set(0, -11, this.zSpot + 1.75);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        section = new Mesh( sectionGlowGeometryMiddle, this.sectionMaterialGlow );
        section.position.set(0, -10.9, this.zSpot + 1.75);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        const textGeo = new TextGeometry('Placeholder', this.textHeaderParams);
        const text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(-2.1, -11.4, this.zSpot + 0.5);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);
    }
    /**
     * Builds the box and graphics for the 3rd row right section.
     */
    private makeBox6(): void {
        let section = new Mesh( this.sectionBackingGeometrySides, this.sectionMaterial );
        section.position.set(4.25, -11, this.zSpot + 1.3);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        section = new Mesh( this.sectionGlowGeometrySides, this.sectionMaterialGlow );
        section.position.set(4.25, -10.9, this.zSpot + 1.3);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        const textGeo = new TextGeometry('Placeholder', this.textHeaderParams);
        const text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(3, -11.4, this.zSpot + 0.5);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);
    }
    /**
     * Builds the box and graphics for the 4th row left section.
     */
    private makeBox7(): void {
        let section = new Mesh( this.sectionBackingGeometrySides, this.sectionMaterial );
        section.position.set(-4.25, -11, this.zSpot + 4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        section = new Mesh( this.sectionGlowGeometrySides, this.sectionMaterialGlow );
        section.position.set(-4.25, -10.9, this.zSpot + 4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        const textGeo = new TextGeometry('Placeholder', this.textHeaderParams);
        const text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(-5.6, -11.4, this.zSpot + 3.2);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);
    }
    /**
     * Builds the box and graphics for the 4th row right section.
     */
    private makeBox8(): void {
        let section = new Mesh( this.sectionBackingGeometrySides, this.sectionMaterial );
        section.position.set(4.25, -11, this.zSpot + 4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        section = new Mesh( this.sectionGlowGeometrySides, this.sectionMaterialGlow );
        section.position.set(4.25, -10.9, this.zSpot + 4);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);
        this.sections.push(section);

        const textGeo = new TextGeometry('Placeholder', this.textHeaderParams);
        const text = new Mesh( textGeo, this.helpMaterial );
        text.position.set(2.95, -11.4, this.zSpot + 3.2);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.texts.push(text);
    }
}
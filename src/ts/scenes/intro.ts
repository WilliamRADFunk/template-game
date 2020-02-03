import {
    CircleGeometry,
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    Scene,
    Texture, 
    PlaneGeometry,
    MeshBasicMaterial,
    DoubleSide,
    TextGeometry,
    TextGeometryParameters,
    Font,
    MeshLambertMaterial} from 'three';

import { Explosion } from '../weapons/explosion';
import { SoundinatorSingleton } from '../soundinator';

/**
 * @class
 * Slow moving debris object that is sometimes on the path towards planet.
 */
export class Intro {
    /**
     * Controls size and shape of the ship
     */
    private shipGeometry: CircleGeometry;
    /**
     * Controls the color of the ship material
     */
	private shipMaterial: MeshPhongMaterial;
    /**
     * Controls the overall rendering of the ship
     */
    private ship: Mesh;
    /**
     * Keeps track of the x,z point the ship is at currently.
     */
    private currentPoint: number[];
    /**
     * Tracks the distance traveled thus far to update the calculateNextPoint calculation.
     */
    private distanceTraveled: number;
    /**
     * Keeps track of the x,z point of ship's destination point.
     */
    private endingPoint: number[];
    /**
     * Explosion from impacted ship
     */
    private explosion: Explosion;
    /**
     * Flag to signal whether next travel point should be calculated.
     */
    private inMotion: boolean = false;
    /**
     * Loaded font for display text.
     */
    private introFont: Font;
    /**
     * Keeps track of the x,z point where ship fired from.
     */
    private originalStartingPoint: number[];
    /**
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * The speed at which the ship travels.
     */
    private speed: number = 0.002;
    /**
     * Since most of the text on the menu has same parameters, use one variable.
     */
    private textHeaderParams: TextGeometryParameters;
    /**
     * Controls the color of the text display material
     */
    private textMaterial: MeshLambertMaterial;
    /**
     * Text of the intro screen.
     */
    private text: Mesh;
    /**
     * The total distance from ship to planet.
     */
    private totalDistance: number;
    /**
     * Constructor for the Intro (Scene) class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param shipTexture   texture for the ship.
     * @param introFont     loaded font to use for help display text.
     * @param x1            origin point x of where the ship starts.
     * @param z1            origin point z of where the ship starts.
     * @hidden
     */
    constructor(scene: Scene, shipTexture: Texture, introFont: Font) {
        this.introFont = introFont;
        this.speed += (1 / 1000);
        this.originalStartingPoint = [-6.5, 0];
        this.currentPoint = [-6.5, 0];

        this.scene = scene;
		this.shipGeometry = new CircleGeometry(0.5, 16, 16);
        this.shipMaterial = new MeshPhongMaterial();
        this.shipMaterial.map = shipTexture;
        this.shipMaterial.map.minFilter = LinearFilter;
        this.shipMaterial.shininess = 0;
        this.shipMaterial.transparent = true;
        this.ship = new Mesh(this.shipGeometry, this.shipMaterial);
        this.ship.position.set(this.currentPoint[0], 0.2, this.currentPoint[1]);
        this.ship.rotation.set(-1.5708, 0, -1.5708);
        this.ship.name = 'Intro Scene';
        this.scene.add(this.ship);

        this.textHeaderParams = {
            font: this.introFont,
            size: 0.199,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };
        
        this.textMaterial = new MeshLambertMaterial( {color: 0x00B39F, opacity: 1, transparent: true} );

        this.makeText('It was the year 2219...');
    }
    /**
     * Calculates the next point in the ship's path.
     */
    private calculateNextPoint(): void {
        this.distanceTraveled += this.speed;
        // (xt, yt) = ( ( (1 − t) * x0 + t * x1 ), ( (1 − t) * y0 + t * y1) )
        const t = this.distanceTraveled / this.totalDistance;
        this.currentPoint[0] = ((1 - t) * this.originalStartingPoint[0]) + (t * this.endingPoint[0]);
        this.currentPoint[1] = ((1 - t) * this.originalStartingPoint[1]) + (t * this.endingPoint[1]);
    }
    /**
     * Creates an explosion during collision and adds it to the collildables list.
     */
    private createExplosion(): void {
        this.explosion = new Explosion(this.scene, this.ship.position.x, this.ship.position.z, 0.2, true);
        SoundinatorSingleton.playBoom(true);
    }
    /**
     * At the end of each loop iteration, move the asteroid a little.
     * @returns whether or not the asteroid is done, and its points calculated.
     */
    endCycle(): boolean {
        if (this.explosion) {
            if (!this.explosion.endCycle()) {
                this.scene.remove(this.explosion.getMesh());
                this.explosion = null;
                return false;
            }
        } else if (this.inMotion) {
            this.calculateNextPoint();
            this.ship.position.set(this.currentPoint[0], 0.2, this.currentPoint[1]);
            if (Math.abs(this.currentPoint[0] - this.endingPoint[0]) <= 0.01 && Math.abs(this.currentPoint[1] - this.endingPoint[1]) <= 0.01) {
                this.inMotion = false;
            }
        }
        return true;
    }
    
    /**
     * Builds the text and graphics for the text dialogue at top of screen.
     */
    private makeText(sentence: string): void {
        let textGeo = new TextGeometry(sentence, this.textHeaderParams);
        let text = new Mesh( textGeo, this.textMaterial );
        text.position.set(-5.65, -11.4, -5.5);
        text.rotation.x = -1.5708;
        this.scene.add(text);
        this.text = text;
    }

    public setDestination(x: number, z: number): void {
        this.endingPoint = [x, z];
        this.totalDistance = Math.sqrt(((x - this.currentPoint[0]) * (x - this.currentPoint[0])) + ((z - this.currentPoint[1]) * (z - this.currentPoint[1])));
        this.distanceTraveled = 0;
        // Calculates the first (second vertices) point.
        this.calculateNextPoint();
        this.inMotion = true;
    }
}
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
import { Entity } from '../models/entity';

/**
 * @class
 * Slow moving debris object that is sometimes on the path towards planet.
 */
export class Intro {
    /**
     * Controls the overall rendering of the earth
     */
    private earth: Entity = {
        currentPoint: [],
        distanceTraveled: 0,
        endingPoint: [],
        geometry: null,
        inMotion: false,
        material: null,
        mesh: null,
        originalStartingPoint: [],
        speed: 0.002,
        totalDistance: 0
    };
    /**
     * Controls the overall rendering of the ship
     */
    private ship: Entity = {
        currentPoint: [],
        distanceTraveled: 0,
        endingPoint: [],
        geometry: null,
        inMotion: false,
        material: null,
        mesh: null,
        originalStartingPoint: [],
        speed: 0.002,
        totalDistance: 0
    };
    /**
     * Explosion from impacted ship
     */
    private explosion: Explosion;
    /**
     * Loaded font for display text.
     */
    private introFont: Font;
    /**
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private scene: Scene;
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
     * Constructor for the Intro (Scene) class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param shipTexture   texture for the ship.
     * @param earthTexture  texture for the earth.
     * @param introFont     loaded font to use for help display text.
     * @param x1            origin point x of where the ship starts.
     * @param z1            origin point z of where the ship starts.
     * @hidden
     */
    constructor(scene: Scene, shipTexture: Texture, earthTexture: Texture, introFont: Font) {
        this.introFont = introFont;
        this.ship.speed += (1 / 1000);
        this.earth.originalStartingPoint = [-6.5, 0];
        this.earth.currentPoint = [-6.5, 0];
        this.ship.originalStartingPoint = [-5.5, 0];
        this.ship.currentPoint = [-5.5, 0];
        this.scene = scene;

		this.earth.geometry = new CircleGeometry(5, 16, 16);
        this.earth.material = new MeshPhongMaterial();
        this.earth.material.map = earthTexture;
        this.earth.material.map.minFilter = LinearFilter;
        this.earth.material.shininess = 0;
        this.earth.material.transparent = true;
        this.earth.mesh = new Mesh(this.earth.geometry, this.earth.material);
        this.earth.mesh.position.set(this.earth.currentPoint[0], 0.5, this.earth.currentPoint[1]);
        this.earth.mesh.rotation.set(-1.5708, 0, 0);
        this.earth.mesh.name = 'Intro Scene';
        this.scene.add(this.earth.mesh);

        const stationMaterial = new MeshBasicMaterial( {color: 0xFF0000, opacity: 1, transparent: false, side: DoubleSide} );
        const stationBackingGeometry = new PlaneGeometry(4, 4, 0, 0);
        const section = new Mesh( stationBackingGeometry, stationMaterial );
        section.position.set(this.ship.currentPoint[0] - 1, 0.4, this.ship.currentPoint[1]);
        section.rotation.set(1.5708, 0, 0);
        this.scene.add(section);

		this.ship.geometry = new CircleGeometry(0.5, 16, 16);
        this.ship.material = new MeshPhongMaterial();
        this.ship.material.map = shipTexture;
        this.ship.material.map.minFilter = LinearFilter;
        this.ship.material.shininess = 0;
        this.ship.material.transparent = true;
        this.ship.mesh = new Mesh(this.ship.geometry, this.ship.material);
        this.ship.mesh.position.set(this.ship.currentPoint[0] + 0.5, 0.2, this.ship.currentPoint[1]);
        this.ship.mesh.rotation.set(-1.5708, 0, -1.5708);
        this.ship.mesh.name = 'Intro Scene';
        this.scene.add(this.ship.mesh);

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
    private calculateNextPoint(entity: Entity): void {
        entity.distanceTraveled += entity.speed;
        // (xt, yt) = ( ( (1 − t) * x0 + t * x1 ), ( (1 − t) * y0 + t * y1) )
        const t = entity.distanceTraveled / entity.totalDistance;
        entity.currentPoint[0] = ((1 - t) * entity.originalStartingPoint[0]) + (t * entity.endingPoint[0]);
        entity.currentPoint[1] = ((1 - t) * entity.originalStartingPoint[1]) + (t * entity.endingPoint[1]);
    }
    /**
     * Creates an explosion during collision and adds it to the collildables list.
     */
    private createExplosion(): void {
        this.explosion = new Explosion(this.scene, this.ship.mesh.position.x, this.ship.mesh.position.z, 0.2, true);
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
        } else if (this.ship.inMotion) {
            this.calculateNextPoint(this.ship);
            this.ship.mesh.position.set(this.ship.currentPoint[0], 0.2, this.ship.currentPoint[1]);
            if (Math.abs(this.ship.currentPoint[0] - this.ship.endingPoint[0]) <= 0.01 && Math.abs(this.ship.currentPoint[1] - this.ship.endingPoint[1]) <= 0.01) {
                this.ship.inMotion = false;
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
        this.ship.originalStartingPoint[0] = this.ship.currentPoint[0];
        this.ship.originalStartingPoint[1] = this.ship.currentPoint[1];
        this.ship.endingPoint = [x, z];
        this.ship.totalDistance = Math.sqrt(((x - this.ship.currentPoint[0]) * (x - this.ship.currentPoint[0])) + ((z - this.ship.currentPoint[1]) * (z - this.ship.currentPoint[1])));
        this.ship.distanceTraveled = 0;
        // Calculates the first (second vertices) point.
        this.calculateNextPoint(this.ship);
        this.ship.inMotion = true;
    }
}
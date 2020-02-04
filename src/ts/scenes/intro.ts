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
import { Actor } from '../models/actor';
import { createActor } from '../utils/create-actor';
import { FadableText } from '../models/fadable-text';
import { Sequence } from '../models/sequence';

/**
 * @class
 * Slow moving debris object that is sometimes on the path towards planet.
 */
export class Intro {
    /**
     * List of actors in the scene.
     */
    private actors: Actor[] = [
        // 0: earth,
        // 1: station,
        // 2: ship
    ];
    /**
     * Current frame
     */
    private currentFrame: number = 0;
    /**
     * Current scene in the sequence.
     */
    private currentSequenceIndex: number = 0;
    /**
     * Explosion from impacted ship
     */
    private explosion: Explosion;
    /**
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * Tracks series of events that make up the intro scene.
     */
    private sequences: Sequence[] = [
        {
            actorEvents: [
                {
                    actorIndex: 0,
                    endPoint: [ -8.5, 0 ],
                    speed: 0.001,
                    startingFrame: 1,
                    startPoint: [ -6.5, 0 ]
                },
                {
                    actorIndex: 1,
                    endPoint: [ -6, 0 ],
                    speed: 0.002,
                    startingFrame: 60,
                    startPoint: [ -9.5, 0 ]
                },
                {
                    actorIndex: 2,
                    endPoint: [ -4.5, 0 ],
                    speed: 0.002,
                    startingFrame: 60,
                    startPoint: [ -8, 0 ]
                }
            ],
            endingFrame: 2000,
            startingFrame: 1,
            textEvents: [
                {
                    sentence: 'It was the year 2219.',
                    startingFrame: 1,
                },
                {
                    sentence: 'Humanity had spread to the stars.',
                    startingFrame: 480,
                },
                {
                    sentence: 'Civilizations rose and fell as war came and went.',
                    startingFrame: 960,
                }
            ]
        }
    ];
    /**
     * Text of the intro screen.
     */
    private text: FadableText = {
        counter: 1,
        font: null,
        geometry: null,
        headerParams: null,
        isFadeIn: true,
        isHolding: false,
        material: null,
        mesh: null,
        sentence: ''
    };
    /**
     * Constructor for the Intro (Scene) class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param shipTexture   texture for the ship.
     * @param earthTexture  texture for the earth.
     * @param introFont     loaded font to use for help display text.
     * @param x1            origin point x of where the ship starts.
     * @param z1            origin point z of where the ship starts.
     */
    constructor(scene: Scene, shipTexture: Texture, earthTexture: Texture, introFont: Font) {
        this.scene = scene;

		this.createActors(earthTexture, shipTexture, introFont);
    }
    /**
     * Calculates the next point in the ship's path.
     */
    private calculateNextPoint(actor: Actor): void {
        actor.distanceTraveled += actor.speed;
        // (xt, yt) = ( ( (1 − t) * x0 + t * x1 ), ( (1 − t) * y0 + t * y1) )
        const t = actor.distanceTraveled / actor.totalDistance;
        actor.currentPoint[0] = ((1 - t) * actor.originalStartingPoint[0]) + (t * actor.endingPoint[0]);
        actor.currentPoint[1] = ((1 - t) * actor.originalStartingPoint[1]) + (t * actor.endingPoint[1]);
    }
    /**
     * Creates items to be moved around in scene.
     */
    private createActors(earthTexture: Texture, shipTexture: Texture, introFont: Font): void {
        this.text.headerParams = {
            font: introFont,
            size: 0.199,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };

        const earth = createActor();
        earth.originalStartingPoint = [-6.5, 0];
        earth.currentPoint = [-6.5, 0];
        earth.endingPoint = [-6.5, 0];
        earth.geometry = new CircleGeometry(5, 16, 16);
        earth.material = new MeshPhongMaterial();
        earth.material.map = earthTexture;
        earth.material.map.minFilter = LinearFilter;
        (earth.material as any).shininess = 0;
        earth.material.transparent = true;
        earth.mesh = new Mesh(earth.geometry, earth.material);
        earth.mesh.position.set(earth.currentPoint[0], 2, earth.currentPoint[1]);
        earth.mesh.rotation.set(-1.5708, 0, 0);
        earth.mesh.name = 'Earth';
        this.scene.add(earth.mesh);
        this.actors[0] = earth;

        const station = createActor();
        station.originalStartingPoint = [-9.5, 0];
        station.currentPoint = [-9.5, 0];
        station.endingPoint = [-9.5, 0];
        station.speed = 0.003;
        station.material = new MeshBasicMaterial( {color: 0xFF0000, opacity: 1, transparent: false, side: DoubleSide} );
        station.geometry = new PlaneGeometry(4, 4, 1, 1);
        station.mesh = new Mesh( station.geometry, station.material );
        station.mesh.position.set(station.currentPoint[0], 1, station.currentPoint[1]);
        station.mesh.rotation.set(1.5708, 0, 0);
        earth.mesh.name = 'Station';
        this.scene.add(station.mesh);
        this.actors[1] = station;

        const ship = createActor();
        ship.originalStartingPoint = [-8, 0];
        ship.currentPoint = [-8, 0];
        ship.endingPoint = [-8, 0];
        ship.speed = 0.003;
		ship.geometry = new CircleGeometry(0.5, 16, 16);
        ship.material = new MeshPhongMaterial();
        ship.material.map = shipTexture;
        ship.material.map.minFilter = LinearFilter;
        (ship.material as any).shininess = 0;
        ship.material.transparent = true;
        ship.mesh = new Mesh(ship.geometry, ship.material);
        ship.mesh.position.set(ship.currentPoint[0], 0, ship.currentPoint[1]);
        ship.mesh.rotation.set(-1.5708, 0, -1.5708);
        ship.mesh.name = 'Enzmann';
        this.scene.add(ship.mesh);
        this.actors[2] = ship;
    }

    private setDestination(actorIndex: number, x1: number, z1: number, x2: number, z2: number): void {
        const actor = this.actors[actorIndex];
        actor.originalStartingPoint[0] = x1;
        actor.currentPoint[0] = x1;
        actor.originalStartingPoint[1] = z1;
        actor.currentPoint[1] = z1;
        actor.endingPoint = [x2, z2];
        actor.totalDistance = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((z2 - z1) * (z2 - z1)));
        actor.distanceTraveled = 0;
        // Calculates the first (second vertices) point.
        this.calculateNextPoint(actor);
        actor.inMotion = true;
    }

    /**
     * At the end of each loop iteration, move the asteroid a little.
     * @returns whether or not the asteroid is done, and its points calculated.
     */
    endCycle(): boolean {
        this.currentFrame++;
        if (this.sequences[this.currentSequenceIndex].endingFrame <= this.currentFrame) {
            this.currentSequenceIndex++;
            this.actors.forEach(actor => {
                actor.inMotion = false;
            });
        }
        if (this.currentSequenceIndex < this.sequences.length) {
            const sequence = this.sequences[this.currentSequenceIndex];
            
            sequence.actorEvents.filter(event => event.startingFrame === this.currentFrame).forEach(actorEvent => {
                this.setDestination(actorEvent.actorIndex, actorEvent.startPoint[0], actorEvent.startPoint[1], actorEvent.endPoint[0], actorEvent.endPoint[1]);
            });
            
            const textEvent = sequence.textEvents.find(event => event.startingFrame === this.currentFrame);
            if (textEvent) {
                this.text.sentence = textEvent.sentence;
                this.text.isFadeIn = true;
                this.text.isHolding = false;
                this.text.counter = 0;
            }
        } else {
            return false;
        }
        this.makeText();
        this.actors.filter(x => x.inMotion).forEach(actor => {
            this.calculateNextPoint(actor);
            actor.mesh.position.set(actor.currentPoint[0], 0.2, actor.currentPoint[1]);
            if (Math.abs(actor.currentPoint[0] - actor.endingPoint[0]) <= 0.01 && Math.abs(actor.currentPoint[1] - actor.endingPoint[1]) <= 0.01) {
                actor.inMotion = false;
            }
        });
        console.log(this.currentFrame);
        return true;
    }

    /**
     * Builds the text and graphics for the text dialogue at top of screen.
     */
    private makeText(): void {
        if (this.text.mesh) {
            this.scene.remove(this.text.mesh);
        }
        if (this.text.isFadeIn && this.text.counter > 180) {
            this.text.isFadeIn = false;
            this.text.isHolding = true;
            this.text.counter = 1;
        } else if (this.text.isHolding && this.text.counter > 120) {
            this.text.isFadeIn = false;
            this.text.isHolding = false;
            this.text.counter = 1;
        }

        if (this.text.isFadeIn) {
            this.text.material = new MeshLambertMaterial( {color: 0x00B39F, opacity: this.text.counter / 180, transparent: true} );
        } else if (this.text.isHolding) {
            // Do nothing
        } else if (this.text.counter < 181) {
            this.text.material = new MeshLambertMaterial( {color: 0x00B39F, opacity: (180 - this.text.counter) / 180, transparent: true} );
        } else {
            return;
        }

        this.text.geometry = new TextGeometry(this.text.sentence, this.text.headerParams);
        this.text.mesh = new Mesh( this.text.geometry, this.text.material );
        this.text.mesh.position.set(-5.65, -11.4, -5.5);
        this.text.mesh.rotation.x = -1.5708;
        this.scene.add(this.text.mesh);

        this.text.counter++;
    }
}
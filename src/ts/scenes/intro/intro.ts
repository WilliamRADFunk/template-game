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
    Font,
    MeshLambertMaterial,
    Object3D,
    Color,
    Geometry,
    Vector3,
    LineBasicMaterial,
    Line} from 'three';

import { SoundinatorSingleton } from '../../soundinator';
import { Actor } from '../../models/actor';
import { createActor } from '../../utils/create-actor';
import { FadableText } from '../../models/fadable-text';
import { Sequence } from '../../models/sequence';
import { ActorEvent } from '../../models/actor-event';
import { TextEvent } from "../../models/text-event";
import { SEQUENCE01 } from "./sequences/sequence-01";
import { SEQUENCE02 } from './sequences/sequence-02';
import { SEQUENCE03 } from './sequences/sequence-03';
import { SEQUENCE04 } from './sequences/sequence-04';
import { SEQUENCE05 } from './sequences/sequence-05';
import { createEarth } from './actors/create-earth';
import { createMars } from './actors/create-mars';
import { createAsteroid } from './actors/create-asteroid';
import { createEnceladus } from './actors/create-enceladus';
import { createSun } from './actors/create-sun';
import { createMercury } from './actors/create-mercury';
import { createVenus } from './actors/create-venus';
import { createTinyEarth } from './actors/create-tiny-earth';
import { createTinyMars } from './actors/create-tiny-mars';
import { createJuptier } from './actors/create-jupiter';
import { createSaturn } from './actors/create-saturn';
import { createUranus } from './actors/create-uranus';
import { createNeptune } from './actors/create-neptune';
import { createPluto } from './actors/create-pluto';
import { createErobusStation } from './actors/create-erobus-station';

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
        // 2: ship,
        // 3: mars,
        // 4: asteroid,
        // 5: enceladus,
        // 6: sun,
        // 7: mercury,
        // 8: venus,
        // 9: tiny earth,
        // 10: tiny mars,
        // 11: jupiter,
        // 12: saturn,
        // 13: uranus,
        // 14: neptune
        // 15: pluto,
        // 16: barrier station,
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
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * Tracks series of events that make up the intro scene.
     */
    private sequences: Sequence[] = [
        SEQUENCE01, // Colonize Mars
        SEQUENCE02, // Mine Asteroid Belt
        SEQUENCE03, // Colonize Enceladus
        SEQUENCE04, // Explore outer solar system
        SEQUENCE05, // Warp Drive
    ];

    private stars: Mesh[] = [];
    private starsInMotion: boolean = false;
    /**
     * Text of the intro screen.
     */
    private text: FadableText = {
        counter: 1,
        font: null,
        geometry: null,
        headerParams: null,
        holdCount: 0,
        isFadeIn: true,
        isHolding: false,
        material: null,
        mesh: null,
        sentence: ''
    };
    private warpedStars: Mesh[] = [];
    private warpedStarsInMotion: boolean = false;
    /**
     * Constructor for the Intro (Scene) class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param shipTexture   texture for the ship.
     * @param earthTexture  texture for the earth.
     * @param marsTexture   texture for the mars.
     * @param introFont     loaded font to use for help display text.
     * @param x1            origin point x of where the ship starts.
     * @param z1            origin point z of where the ship starts.
     */
    constructor(scene: Scene, shipTexture: Texture, earthTexture: Texture, marsTexture: Texture, asteroidTexture: Texture, enceladusTexture: Texture, introFont: Font) {
        this.scene = scene;
        this.createStars();
		this.createActors(earthTexture, marsTexture, asteroidTexture, enceladusTexture, shipTexture, introFont);
    }
    /**
     * Calculates the next point in the ship's path.
     */
    private calculateNextPoint(actor: Actor): void {
        actor.distanceTraveled += actor.moveSpeed;
        // (xt, yt) = ( ( (1 − t) * x0 + t * x1 ), ( (1 − t) * y0 + t * y1) )
        const t = actor.distanceTraveled / actor.totalDistance;
        actor.currentPoint[0] = ((1 - t) * actor.originalStartingPoint[0]) + (t * actor.endingPoint[0]);
        actor.currentPoint[1] = ((1 - t) * actor.originalStartingPoint[1]) + (t * actor.endingPoint[1]);
    }
    /**
     * Creates items to be moved around in scene.
     */
    private createActors(earthTexture: Texture, marsTexture: Texture, asteroidTexture: Texture, enceladusTexture: Texture, shipTexture: Texture, introFont: Font): void {
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

        const labelBackMaterial = new MeshBasicMaterial( {color: 0x111111, opacity: 1, transparent: false, side: DoubleSide} );
        const labelBackMaterialGlow = new MeshPhongMaterial( {color: 0x5555FF, opacity: 0.6, transparent: true, side: DoubleSide} );
        const labelBackGeometry = new PlaneGeometry( 4.5, 0.8, 0, 0 );
        const labelBackGlowGeometry = new PlaneGeometry( 4.7, 0.9, 0, 0 );

        const earth = createEarth(
            earthTexture,
            labelBackGlowGeometry,
            labelBackMaterialGlow,
            labelBackGeometry,
            labelBackMaterial,
            this.text.headerParams);
        this.scene.add(earth.mesh);
        this.actors.push(earth);

        const xlabelBackGlow = new Mesh( labelBackGlowGeometry, labelBackMaterialGlow );
        xlabelBackGlow.rotation.set(1.5708, 0, 0);

        const xlabelBack = new Mesh( labelBackGeometry, labelBackMaterial );
        xlabelBack.rotation.set(1.5708, 0, 0); 

        const xtextGeometry = new TextGeometry('Gemini Station: The Rim', this.text.headerParams);
        const xtextMaterial = new MeshLambertMaterial( {color: 0x00B39F, opacity: 1, transparent: true} );
        const xtextMesh = new Mesh( xtextGeometry, xtextMaterial );
        xtextMesh.rotation.x = -1.5708;

        const station = createActor();
        station.originalStartingPoint = [0, 0];
        station.currentPoint = [0, 0];
        station.endingPoint = [0, 0];
        const xmeshGroup = new Object3D();
        station.material = new MeshBasicMaterial( {color: 0xFF0000, opacity: 1, transparent: false, side: DoubleSide} );
        station.geometry = new PlaneGeometry(4, 4, 1, 1);
        station.mesh = new Mesh( station.geometry, station.material );
        station.mesh.position.set(station.currentPoint[0], 1, station.currentPoint[1]);
        station.mesh.rotation.set(1.5708, 0, 0);
        xmeshGroup.add(station.mesh);
        xlabelBackGlow.position.set(station.currentPoint[0], 0.1, station.currentPoint[1] - 5);
        xmeshGroup.add(xlabelBackGlow);
        xlabelBack.position.set(station.currentPoint[0], 0, station.currentPoint[1] - 5);
        xmeshGroup.add(xlabelBack);
        xtextMesh.position.set(station.currentPoint[0] - 2.5, -0.5, station.currentPoint[1] - 4.85);
        xmeshGroup.add(xtextMesh);
        station.mesh = xmeshGroup;
        xmeshGroup.name = 'Station';
        this.scene.add(xmeshGroup);
        xmeshGroup.position.set(-50, 2, 0);
        this.actors.push(station);

        const ship = createActor();
        ship.originalStartingPoint = [0, 0];
        ship.currentPoint = [0, 0];
        ship.endingPoint = [0, 0];
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
        ship.mesh.scale.set(0.0001, 0.0001, 0.0001);
        this.actors.push(ship);

        const mars = createMars(
            marsTexture,
            labelBackGlowGeometry,
            labelBackMaterialGlow,
            labelBackGeometry,
            labelBackMaterial,
            this.text.headerParams);
        this.scene.add(mars.mesh);
        this.actors.push(mars);

        const asteroid = createAsteroid(
            asteroidTexture,
            labelBackGlowGeometry,
            labelBackMaterialGlow,
            labelBackGeometry,
            labelBackMaterial,
            this.text.headerParams);
        this.scene.add(asteroid.mesh);
        this.actors.push(asteroid);

        const enceladus = createEnceladus(
            enceladusTexture,
            labelBackGlowGeometry,
            labelBackMaterialGlow,
            labelBackGeometry,
            labelBackMaterial,
            this.text.headerParams);
        this.scene.add(enceladus.mesh);
        this.actors.push(enceladus);

        let zIndex = 3;

        const sun = createSun(
            labelBackGlowGeometry,
            labelBackMaterialGlow,
            labelBackGeometry,
            labelBackMaterial,
            this.text.headerParams,
            zIndex);
        this.scene.add(sun.mesh);
        this.actors.push(sun);

        zIndex += 3;

        const mercury = createMercury(zIndex);
        this.scene.add(mercury.mesh);
        this.actors.push(mercury);

        zIndex += 3;

        const venus = createVenus(zIndex);
        this.scene.add(venus.mesh);
        this.actors.push(venus);

        zIndex += 3;

        const tinyEarth = createTinyEarth(zIndex);
        this.scene.add(tinyEarth.mesh);
        this.actors.push(tinyEarth);

        zIndex += 3;

        const tinyMars = createTinyMars(zIndex);
        this.scene.add(tinyMars.mesh);
        this.actors.push(tinyMars);

        zIndex += 3;

        const jupiter = createJuptier(zIndex);
        this.scene.add(jupiter.mesh);
        this.actors.push(jupiter);

        zIndex += 3;

        const saturn = createSaturn(zIndex);
        this.scene.add(saturn.mesh);
        this.actors.push(saturn);

        zIndex += 3;

        const uranus = createUranus(zIndex);
        this.scene.add(uranus.mesh);
        this.actors.push(uranus);

        zIndex += 3;

        const neptune = createNeptune(zIndex);
        this.scene.add(neptune.mesh);
        this.actors.push(neptune);

        zIndex += 3;

        const pluto = createPluto(zIndex);
        this.scene.add(pluto.mesh);
        this.actors.push(pluto);

        zIndex += 3;

        const barrierStation = createErobusStation(
            introFont,
            labelBackMaterialGlow,
            labelBackMaterial,
            zIndex);
        this.scene.add(barrierStation.mesh);
        this.actors.push(barrierStation);
    }

    private createStars(): void {
        const material = new MeshBasicMaterial( {color: 0xFFFFFF, opacity: 1, transparent: false, side: DoubleSide} );
        for (let i = 0; i < 500; i++) {
            const mag = (Math.floor(Math.random() * 3) + 1) / 100;
            const geometry = new PlaneGeometry(mag, mag, 0.01, 0.01);
            const isXNeg = Math.random() < 0.5 ? -1 : 1;
            const isZNeg = Math.random() < 0.5 ? -1 : 1;
            const xCoord = Math.random() * 7;
            const zCoord = Math.random() * 7;
            const mesh = new Mesh( geometry, material );
            mesh.position.set((isXNeg * xCoord), 5, (isZNeg * zCoord));
            mesh.rotation.set(1.5708, 0, 0);
            mesh.name = `Star-${i}`;
            this.scene.add(mesh);
            this.stars[i] = mesh;
        }

        for (let j = 0; j < this.stars.length / 2; j++) {
            const mag = Math.random() + 0.2;
            const warpedGeometry = new PlaneGeometry(mag, 0.02, 1, 1);
            const mesh = new Mesh( warpedGeometry, material );
            mesh.position.set(this.stars[j].position.x, 5, this.stars[j].position.z);
            mesh.rotation.set(1.5708, 0, 0);
            mesh.name = `Warped-Star-${j}`;
            this.scene.add(mesh);
            mesh.visible = false;
            this.warpedStars[j] = mesh;
        }
    }

    private handleActorEvents(actor: Actor): void {
        const actorEvent = actor.action;
        switch(actorEvent.type) {
            case 'Moving': {
                this.calculateNextPoint(actor);
                actor.mesh.position.set(actor.currentPoint[0], 0.2, actor.currentPoint[1]);
                if (Math.abs(actor.currentPoint[0] - actor.endingPoint[0]) <= 0.03 && Math.abs(actor.currentPoint[1] - actor.endingPoint[1]) <= 0.03) {
                    actor.mesh.position.set(actor.endingPoint[0], 0.2, actor.endingPoint[1]);
                    actor.inMotion = false;
                }
                break;
            }
            case 'Move & Rotate': {
                this.calculateNextPoint(actor);
                actor.mesh.position.set(actor.currentPoint[0], 0.2, actor.currentPoint[1]);
                this.rotate(actor);
                if (Math.abs(actor.currentPoint[0] - actor.endingPoint[0]) <= 0.03 && Math.abs(actor.currentPoint[1] - actor.endingPoint[1]) <= 0.03) {
                    actor.mesh.position.set(actor.endingPoint[0], 0.2, actor.endingPoint[1]);
                    actor.inMotion = false;
                }
                break;
            }
            case 'Grow': {
                const currentScale = actor.mesh.scale.x;
                let newScale = currentScale + (1 / actorEvent.duration);
                newScale = newScale <= 1 ? newScale : 1;
                actor.mesh.scale.set(newScale, newScale, newScale);
                break;
            }
            case 'Shrink': {
                const currentScale = actor.mesh.scale.x;
                let newScale = currentScale - (1 / actorEvent.duration);
                newScale = newScale >= 0.0001 ? newScale : 0.0001;
                actor.mesh.scale.set(newScale, newScale, newScale);
                break;
            }
            case 'Rotate': {
                this.rotate(actor);
                break;
            }
        }
    }

    private initiateActorEvents(actorEvent: ActorEvent): void {
        console.log('initiateActorEvents', actorEvent.type, this.currentFrame);
        switch(actorEvent.type) {
            case 'Moving': {
                this.setDestination(actorEvent.actorIndex, actorEvent.startPoint[0], actorEvent.startPoint[1], actorEvent.endPoint[0], actorEvent.endPoint[1], actorEvent.moveSpeed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.action = actorEvent;
                break;
            }
            case 'Move & Rotate': {
                this.setDestination(actorEvent.actorIndex, actorEvent.startPoint[0], actorEvent.startPoint[1], actorEvent.endPoint[0], actorEvent.endPoint[1], actorEvent.moveSpeed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.moveSpeed = actorEvent.moveSpeed;
                actor.rotateSpeed = actorEvent.rotateSpeed;
                actor.action = actorEvent;
                break;
            }
            case 'Grow': {
                this.setDestination(actorEvent.actorIndex, actorEvent.startPoint[0], actorEvent.startPoint[1], actorEvent.endPoint[0], actorEvent.endPoint[1], actorEvent.moveSpeed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.mesh.scale.set(0, 0, 0);
                actor.action = actorEvent;
                break;
            }
            case 'Shrink': {
                this.setDestination(actorEvent.actorIndex, actorEvent.startPoint[0], actorEvent.startPoint[1], actorEvent.endPoint[0], actorEvent.endPoint[1], actorEvent.moveSpeed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.mesh.scale.set(1, 1, 1);
                actor.action = actorEvent;
                break;
            }
            case 'Rotate': {
                const actor = this.actors[actorEvent.actorIndex];
                actor.rotateSpeed = actorEvent.rotateSpeed;
                actor.inMotion = true;
                actor.action = actorEvent;
                break;
            }
            case 'Stars Moving': {
                this.starsInMotion = true;
                break;
            }
            case 'Stars Stopping': {
                this.starsInMotion = false;
                break;
            }
            case 'Warped Stars Moving': {
                this.warpedStarsInMotion = true;
                this.warpedStars.forEach(warpedStar => {
                    warpedStar.visible = true;
                });
                break;
            }
            case 'Warped Stars Stopping': {
                this.warpedStars.forEach(warpedStar => {
                    warpedStar.visible = false;
                });
                this.warpedStarsInMotion = false;
                break;
            }
        }
        
    }

    private handleTextEvents(textEvent: TextEvent): void {
        if (textEvent) {
            this.text.sentence = textEvent.sentence;
            this.text.isFadeIn = true;
            this.text.isHolding = false;
            this.text.holdCount = textEvent.holdCount;
            this.text.counter = 0;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at bottom of screen.
     */
    private makeText(): void {
        if (this.text.mesh) {
            this.scene.remove(this.text.mesh);
        }
        if (this.text.isFadeIn && this.text.counter > 180) {
            this.text.isFadeIn = false;
            this.text.isHolding = true;
            this.text.counter = 1;
        } else if (this.text.isHolding && this.text.counter > this.text.holdCount) {
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
        this.text.mesh.position.set(-5.65, -11.4, 5.5);
        this.text.mesh.rotation.x = -1.5708;
        this.scene.add(this.text.mesh);

        this.text.counter++;
    }

    private setDestination(actorIndex: number, x1: number, z1: number, x2: number, z2: number, speed: number): void {
        const actor = this.actors[actorIndex];
        actor.moveSpeed = speed;
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
            this.currentFrame = 0;
        }
        if (this.currentSequenceIndex < this.sequences.length) {
            const sequence = this.sequences[this.currentSequenceIndex];
            
            sequence.actorEvents.filter(event => event.startingFrame === this.currentFrame).forEach(actorEvent => {
                this.initiateActorEvents(actorEvent);
            });
            
            const textEvent = sequence.textEvents.find(event => event.startingFrame === this.currentFrame);
            this.handleTextEvents(textEvent);
        } else {
            return false;
        }
        this.makeText();
        this.actors.filter(x => x.inMotion).forEach(actor => {
            this.handleActorEvents(actor)
        });
        if (this.starsInMotion) {
            const length = this.stars.length;
            this.stars.forEach((star, index) => {
                const percentile = Math.floor((index / length) * 100);
                if (percentile < 70) {
                    // Stationary
                } else if (percentile < 90) {
                    star.position.set(star.position.x - 0.001, 5, star.position.z);
                } else {
                    star.position.set(star.position.x - 0.002, 5, star.position.z);
                }
                if (star.position.x < -7) {
                    star.position.set(7, 5, star.position.z);
                }
            });
        }
        if (this.warpedStarsInMotion) {
            const length = this.warpedStars.length;
            this.warpedStars.forEach((warpedStar, index) => {
                const percentile = Math.floor((index / length) * 100);
                if (percentile < 70) {
                    // Stationary
                } else if (percentile < 90) {
                    warpedStar.position.set(warpedStar.position.x - 0.001, 5, warpedStar.position.z);
                } else {
                    warpedStar.position.set(warpedStar.position.x - 0.002, 5, warpedStar.position.z);
                }
                if (warpedStar.position.x < -7) {
                    warpedStar.position.set(7, 5, warpedStar.position.z);
                }
            });
        }
        return true;
    }
    /**
     * Spins planet at its set rate.
     */
    private rotate(actor: Actor): void {
        const twoPi = 2 * Math.PI;
        actor.currentRotation += actor.rotateSpeed;
        if (actor.currentRotation >= twoPi) {
            actor.currentRotation -= twoPi
        }
        actor.mesh.rotation.set(0, actor.currentRotation, 0);
    }
}
import {
    Mesh,
    MeshPhongMaterial,
    Scene,
    Texture,
    PlaneGeometry,
    MeshBasicMaterial,
    DoubleSide,
    TextGeometry,
    Font,
    MeshLambertMaterial } from 'three';

import { SoundinatorSingleton } from '../../soundinator';
import { Actor } from '../../models/actor';
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
import { createSolarSystem } from './actors/create-solar-system';
import { createShip1 } from './actors/create-ship-1';
import { createGeminiStation } from './actors/createGeminiStation';
import { createEntryEffect } from './actors/create-entry-effect';
import { SceneType } from '../../models/scene-type';

// let border: string = '1px solid #FFF';
let border: string = 'none';

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
        // 1: mars,
        // 2: asteroid,
        // 3: enceladus,
        // 4: sun,
        // 5: mercury,
        // 6: venus,
        // 7: tiny earth,
        // 8: tiny mars,
        // 9: jupiter,
        // 10: saturn,
        // 11: uranus,
        // 12: neptune
        // 13: pluto,
        // 14: barrier station,
        // 15: station,
        // 16: entryEffect,
        // 17: ship,
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
    private warblePositions: [number, number][] = [
        [0.01, 0.01],
        [-0.01, -0.01],
        [0.01, -0.01],
        [-0.01, 0.01],
        [0.01, 0.01],
        [-0.01, -0.01],
        [0.01, -0.01],
        [-0.01, 0.01],
        [0.01, 0.01],
        [-0.01, -0.01],
        [0.01, -0.01],
        [-0.01, 0.01],
        [0.01, 0.01],
        [-0.01, -0.01],
        [0.01, -0.01],
        [-0.01, 0.01]
    ];
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
    constructor(
        scene: SceneType,
        shipTexture: Texture,
        earthTexture: Texture,
        marsTexture: Texture,
        asteroidTexture: Texture,
        enceladusTexture: Texture,
        introFont: Font) {
        this.scene = scene.scene;

        this.onWindowResize();
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        this.createStars();
		this.createActors(
            earthTexture,
            marsTexture,
            asteroidTexture,
            enceladusTexture,
            shipTexture,
            introFont);
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
    private createActors(
        earthTexture: Texture,
        marsTexture: Texture,
        asteroidTexture: Texture,
        enceladusTexture: Texture,
        shipTexture: Texture,
        introFont: Font): void {
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

        const labelBackMaterial = new MeshBasicMaterial({
            color: 0x111111,
            opacity: 1,
            transparent: false,
            side: DoubleSide
        });
        const labelBackMaterialGlow = new MeshPhongMaterial({
            color: 0x5555FF,
            opacity: 0.6,
            transparent: true,
            side: DoubleSide
        });
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

        this.actors.push(...createSolarSystem(
            introFont,
            labelBackGlowGeometry,
            labelBackMaterialGlow,
            labelBackGeometry,
            labelBackMaterial,
            this.text.headerParams
        ).filter(x => {
            this.scene.add(x.mesh);
            return true;
        }));

        const station = createGeminiStation(
            earthTexture,
            labelBackGlowGeometry,
            labelBackMaterialGlow,
            labelBackGeometry,
            labelBackMaterial,
            this.text.headerParams);
        this.scene.add(station.mesh);
        this.actors.push(station);

        const entryEffect = createEntryEffect();
        this.scene.add(entryEffect.mesh);
        this.actors.push(entryEffect);

        const ship = createShip1(shipTexture);
        this.scene.add(ship.mesh);
        this.actors.push(ship);
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
                actor.mesh.position.set(actor.currentPoint[0], actor.mesh.position.y, actor.currentPoint[1]);
                if (Math.abs(actor.currentPoint[0] - actor.endingPoint[0]) <= 0.03 && Math.abs(actor.currentPoint[1] - actor.endingPoint[1]) <= 0.03) {
                    actor.mesh.position.set(actor.endingPoint[0], actor.mesh.position.y, actor.endingPoint[1]);
                    actor.inMotion = false;
                }
                break;
            }
            case 'Move & Rotate': {
                this.calculateNextPoint(actor);
                actor.mesh.position.set(actor.currentPoint[0], actor.mesh.position.y, actor.currentPoint[1]);
                this.rotate(actor);
                if (Math.abs(actor.currentPoint[0] - actor.endingPoint[0]) <= 0.03 && Math.abs(actor.currentPoint[1] - actor.endingPoint[1]) <= 0.03) {
                    actor.mesh.position.set(actor.endingPoint[0], actor.mesh.position.y, actor.endingPoint[1]);
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
            case 'Warble': {
                actorEvent.duration--;
                if (actorEvent.duration % 5 === 0) {
                    const newPos = actorEvent.warbleArray.shift();
                    actorEvent.warbleArray.push(newPos);
                    actor.mesh.position.set(newPos[0], actor.mesh.position.y, newPos[1]);
                }
                if (actorEvent.duration <= 0) {
                    actor.inMotion = false;
                }
                break;
            }
        }
    }

    private initiateActorEvents(actorEvent: ActorEvent): void {
        switch(actorEvent.type) {
            case 'Moving': {
                this.setDestination(
                    actorEvent.actorIndex,
                    actorEvent.startPoint[0],
                    actorEvent.startPoint[1],
                    actorEvent.endPoint[0],
                    actorEvent.endPoint[1],
                    actorEvent.moveSpeed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.action = actorEvent;
                break;
            }
            case 'Move & Rotate': {
                this.setDestination(
                    actorEvent.actorIndex,
                    actorEvent.startPoint[0],
                    actorEvent.startPoint[1],
                    actorEvent.endPoint[0],
                    actorEvent.endPoint[1],
                    actorEvent.moveSpeed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.moveSpeed = actorEvent.moveSpeed;
                actor.rotateSpeed = actorEvent.rotateSpeed;
                actor.action = actorEvent;
                break;
            }
            case 'Grow': {
                this.setDestination(
                    actorEvent.actorIndex,
                    actorEvent.startPoint[0],
                    actorEvent.startPoint[1],
                    actorEvent.endPoint[0],
                    actorEvent.endPoint[1],
                    actorEvent.moveSpeed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.mesh.scale.set(0, 0, 0);
                actor.action = actorEvent;
                break;
            }
            case 'Shrink': {
                this.setDestination(
                    actorEvent.actorIndex,
                    actorEvent.startPoint[0],
                    actorEvent.startPoint[1],
                    actorEvent.endPoint[0],
                    actorEvent.endPoint[1],
                    actorEvent.moveSpeed);
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
            case 'Warble': {
                const actor = this.actors[actorEvent.actorIndex];
                actor.inMotion = true;
                actorEvent.warbleArray = this.warblePositions.slice();
                actor.action = actorEvent;
                break;
            }
            case 'Flaming': {
                const actor = this.actors[actorEvent.actorIndex];
                actor.inMotion = true;
                actor.mesh.visible = true;
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
            this.makeText();
            this.onWindowResize();
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at bottom of screen.
     */
    private makeText(): void {
        const textElement = document.getElementById('intro-screen-sequence-labels');
        if (!textElement) {
            this.onWindowResize();
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
            this.text.element.style.opacity = (this.text.counter / 180) + '';
        } else if (this.text.isHolding) {
            // Do nothing
        } else if (this.text.counter < 181) {
            this.text.element.style.opacity = (180 - this.text.counter) / 180 + '';
        } else {
            return;
        }

        this.text.counter++;
    }

    private onWindowResize(): void {
        const textElement = document.getElementById('intro-screen-sequence-labels');
        if (textElement) {
            textElement.remove();
        }

        let WIDTH = window.innerWidth * 0.99;
        let HEIGHT = window.innerHeight * 0.99;
        if ( WIDTH < HEIGHT ) {
            HEIGHT = WIDTH;
        } else {
            WIDTH = HEIGHT;
        }
        const left = (((window.innerWidth * 0.99) - WIDTH) / 2);
        const width = WIDTH;
        const height = HEIGHT;

        this.text.element = document.createElement('div');
        this.text.element.id = 'intro-screen-sequence-labels';
        this.text.element.style.fontFamily = 'Luckiest Guy';
        this.text.element.style.color = '#FFD700';
        this.text.element.style.position = 'absolute';
        this.text.element.style.maxWidth = `${0.90 * width}px`;
        this.text.element.style.width = `${0.90 * width}px`;
        this.text.element.style.maxHeight = `${0.04 * height}px`;
        this.text.element.style.height = `${0.04 * height}px`;
        this.text.element.style.backgroundColor = 'transparent';
        this.text.element.innerHTML = this.text.sentence;
        this.text.element.style.bottom = `${(window.innerHeight * 0.99 - height) + (0.02 * height)}px`;
        this.text.element.style.left = `${left + (0.02 * width)}px`;
        this.text.element.style.overflowY = 'hidden';
        this.text.element.style.textAlign = 'left';
        this.text.element.style.fontSize = `${0.03 * width}px`;
        this.text.element.style.border = border;
        document.body.appendChild(this.text.element);
    };

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
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.getElementById('intro-screen-sequence-labels').remove();
        window.removeEventListener( 'resize', this.onWindowResize, false);
    }
}
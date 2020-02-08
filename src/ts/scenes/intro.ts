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
    Color} from 'three';

import { SoundinatorSingleton } from '../soundinator';
import { Actor } from '../models/actor';
import { createActor } from '../utils/create-actor';
import { FadableText } from '../models/fadable-text';
import { Sequence } from '../models/sequence';
import { ActorEvent } from '../models/actor-event';
import { TextEvent } from "../models/text-event";

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
        // 11: uranus,
        // 12: neptune,
        // 13: pluto,
        // 14: barrier station,
        // 15: jupiter,
        // 16: saturn
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
        // {
        //     actorEvents: [
        //         {
        //             actorIndex: 2, // Ship lifts off from Earth
        //             duration: 180,
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 1,
        //             startPoint: [ 0, 0 ],
        //             type: "Grow"
        //         },
        //         {
        //             actorIndex: -1, // Stars in motion
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 181,
        //             startPoint: [ 0, 0 ],
        //             type: "Stars Moving"
        //         },
        //         {
        //             actorIndex: 0, // Earth exits stage left
        //             endPoint: [ -15, 0 ],
        //             speed: 0.05,
        //             startingFrame: 181,
        //             startPoint: [ 0, 0 ],
        //             type: "Moving"
        //         },
        //         {
        //             actorIndex: 3, // Mars enter stage right
        //             endPoint: [ 0, 0 ],
        //             speed: 0.05,
        //             startingFrame: 181,
        //             startPoint: [ 20, 0 ],
        //             type: "Moving"
        //         },
        //         {
        //             actorIndex: -1, // Stars stop moving
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 579,
        //             startPoint: [ 0, 0 ],
        //             type: "Stars Stopping"
        //         },
        //         {
        //             actorIndex: 2, // Ship lands on Mars
        //             duration: 180,
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 600,
        //             startPoint: [ 0, 0 ],
        //             type: "Shrink"
        //         }
        //     ],
        //     endingFrame: 780,
        //     startingFrame: 1,
        //     textEvents: [
        //         {
        //             sentence: '2032: Colonization of Mars',
        //             holdCount: 420,
        //             startingFrame: 1,
        //         }
        //     ]
        // },
        // {
        //     actorEvents: [
        //         {
        //             actorIndex: 2, // Ship lifts off from Mars
        //             duration: 180,
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 1,
        //             startPoint: [ 0, 0 ],
        //             type: "Grow"
        //         },
        //         {
        //             actorIndex: -1, // Stars in motion
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 181,
        //             startPoint: [ 0, 0 ],
        //             type: "Stars Moving"
        //         },
        //         {
        //             actorIndex: 3, // Mars exits stage left
        //             endPoint: [ -15, 0 ],
        //             speed: 0.05,
        //             startingFrame: 181,
        //             startPoint: [ 0, 0 ],
        //             type: "Moving"
        //         },
        //         {
        //             actorIndex: 4, // Asteroid enter stage right
        //             endPoint: [ 0, 0 ],
        //             speed: 0.05,
        //             startingFrame: 181,
        //             startPoint: [ 20, 0 ],
        //             type: "Moving"
        //         },
        //         {
        //             actorIndex: -1, // Stars stop moving
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 579,
        //             startPoint: [ 0, 0 ],
        //             type: "Stars Stopping"
        //         },
        //         {
        //             actorIndex: 2, // Ship lands on Asteroid
        //             duration: 180,
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 600,
        //             startPoint: [ 0, 0 ],
        //             type: "Shrink"
        //         }
        //     ],
        //     endingFrame: 780,
        //     startingFrame: 1,
        //     textEvents: [
        //         {
        //             sentence: '2067: Industrial mining of asteroid belt',
        //             holdCount: 420,
        //             startingFrame: 1,
        //         }
        //     ]
        // },
        // {
        //     actorEvents: [
        //         {
        //             actorIndex: 2, // Ship lifts off from Asteroid
        //             duration: 180,
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 1,
        //             startPoint: [ 0, 0 ],
        //             type: "Grow"
        //         },
        //         {
        //             actorIndex: -1, // Stars in motion
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 181,
        //             startPoint: [ 0, 0 ],
        //             type: "Stars Moving"
        //         },
        //         {
        //             actorIndex: 4, // Asteroid exits stage left
        //             endPoint: [ -15, 0 ],
        //             speed: 0.05,
        //             startingFrame: 181,
        //             startPoint: [ 0, 0 ],
        //             type: "Moving"
        //         },
        //         {
        //             actorIndex: 5, // Enceladus enter stage right
        //             endPoint: [ 0, 0 ],
        //             speed: 0.05,
        //             startingFrame: 181,
        //             startPoint: [ 20, 0 ],
        //             type: "Moving"
        //         },
        //         {
        //             actorIndex: -1, // Stars stop moving
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 579,
        //             startPoint: [ 0, 0 ],
        //             type: "Stars Stopping"
        //         },
        //         {
        //             actorIndex: 2, // Ship lands on Enceladus
        //             duration: 180,
        //             endPoint: [ 0, 0 ],
        //             speed: 0,
        //             startingFrame: 600,
        //             startPoint: [ 0, 0 ],
        //             type: "Shrink"
        //         }
        //     ],
        //     endingFrame: 780,
        //     startingFrame: 1,
        //     textEvents: [
        //         {
        //             sentence: '2091: Submerged colony formed on Enceladus',
        //             holdCount: 420,
        //             startingFrame: 1,
        //         }
        //     ]
        // },
        {
            actorEvents: [
                {
                    actorIndex: 0, // Earth shrinks
                    duration: 10,
                    endPoint: [ 0, 0 ],
                    speed: 0.05,
                    startingFrame: 1,
                    startPoint: [ 0, 0 ],
                    type: "Shrink"
                },
                {
                    actorIndex: 3, // Mars shrinks
                    duration: 10,
                    endPoint: [ 0, 0 ],
                    speed: 0.05,
                    startingFrame: 1,
                    startPoint: [ 0, 0 ],
                    type: "Shrink"
                },
                {
                    actorIndex: 4, // Asteroid shrinks
                    duration: 10,
                    endPoint: [ 0, 0 ],
                    speed: 0.05,
                    startingFrame: 1,
                    startPoint: [ 0, 0 ],
                    type: "Shrink"
                },
                {
                    actorIndex: 5, // Enceladus shrinks
                    duration: 100,
                    endPoint: [ 0, 0 ],
                    speed: 0.05,
                    startingFrame: 1,
                    startPoint: [ 0, 0 ],
                    type: "Shrink"
                },
                {
                    actorIndex: 6, // The Sun grows
                    duration: 180,
                    endPoint: [ 0, 0 ],
                    speed: 0.05,
                    startingFrame: 10,
                    startPoint: [ 0, 0 ],
                    type: "Grow"
                },
                {
                    actorIndex: 7, // Mercury grows
                    duration: 180,
                    endPoint: [ 0, 0 ],
                    speed: 0.05,
                    startingFrame: 10,
                    startPoint: [ 0, 0 ],
                    type: "Grow"
                },
                {
                    actorIndex: 8, // Venus grows
                    duration: 180,
                    endPoint: [ 0, 0 ],
                    speed: 0.05,
                    startingFrame: 10,
                    startPoint: [ 0, 0 ],
                    type: "Grow"
                },
                {
                    actorIndex: 9, // Tiny Earth grows
                    duration: 180,
                    endPoint: [ 0, 0 ],
                    speed: 0.05,
                    startingFrame: 10,
                    startPoint: [ 0, 0 ],
                    type: "Grow"
                },
                {
                    actorIndex: 10, // Tiny Mars grows
                    duration: 180,
                    endPoint: [ 0, 0 ],
                    speed: 0.05,
                    startingFrame: 10,
                    startPoint: [ 0, 0 ],
                    type: "Grow"
                }
            ],
            endingFrame: 780,
            startingFrame: 1,
            textEvents: [
                {
                    sentence: '2110: Manned exploration of Sol System\'s outer edges',
                    holdCount: 420,
                    startingFrame: 1,
                },
                {
                    sentence: '2148: The Photon harnessed for propulsion (98% lightspeed)',
                    holdCount: 420,
                    startingFrame: 600,
                },
                {
                    sentence: '2156: Colony formed in Alpha Centauri',
                    holdCount: 420,
                    startingFrame: 2400,
                },
                {
                    sentence: '2170: First contact with alien life',
                    holdCount: 420,
                    startingFrame: 2880,
                }
            ]
        }
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
        actor.distanceTraveled += actor.speed;
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

        const sectionMaterial = new MeshBasicMaterial( {color: 0x111111, opacity: 1, transparent: false, side: DoubleSide} );
        const sectionMaterialGlow = new MeshPhongMaterial( {color: 0x5555FF, opacity: 0.6, transparent: true, side: DoubleSide} );
        const sectionBackingGeometryMiddle = new PlaneGeometry( 4.5, 0.8, 0, 0 );
        const sectionGlowGeometryMiddle = new PlaneGeometry( 4.7, 0.9, 0, 0 );

        let sectionGlow = new Mesh( sectionGlowGeometryMiddle, sectionMaterialGlow );
        sectionGlow.position.set(0, 0.1, -5);
        sectionGlow.rotation.set(1.5708, 0, 0);

        let section = new Mesh( sectionBackingGeometryMiddle, sectionMaterial );
        section.position.set(0, 0, -5);
        section.rotation.set(1.5708, 0, 0); 
        
        const textMaterial = new MeshLambertMaterial( {color: 0x00B39F, opacity: 1, transparent: true} );
        let textGeometry = new TextGeometry('Earth', this.text.headerParams);
        let textMesh = new Mesh( textGeometry, textMaterial );
        textMesh.position.set(-0.5, -0.5, -4.85);
        textMesh.rotation.x = -1.5708;

        const earth = createActor();
        earth.originalStartingPoint = [0, 0];
        earth.currentPoint = [0, 0];
        earth.endingPoint = [0, 0];
        let meshGroup = new Object3D();
        earth.geometry = new CircleGeometry(5, 16, 16);
        earth.material = new MeshPhongMaterial();
        earth.material.map = earthTexture;
        earth.material.map.minFilter = LinearFilter;
        (earth.material as any).shininess = 0;
        earth.material.transparent = true;
        earth.mesh = new Mesh(earth.geometry, earth.material);
        earth.mesh.position.set(earth.currentPoint[0], 2, earth.currentPoint[1]);
        earth.mesh.rotation.set(-1.5708, 0, 0);
        meshGroup.add(earth.mesh);
        meshGroup.add(sectionGlow);
        meshGroup.add(section);
        meshGroup.add(textMesh);
        meshGroup.name = 'Earth';
        earth.mesh = meshGroup;
        this.scene.add(meshGroup);
        this.actors.push(earth);

        sectionGlow = new Mesh( sectionGlowGeometryMiddle, sectionMaterialGlow );
        sectionGlow.rotation.set(1.5708, 0, 0);

        section = new Mesh( sectionBackingGeometryMiddle, sectionMaterial );
        section.rotation.set(1.5708, 0, 0); 

        textGeometry = new TextGeometry('Gemini Station: The Rim', this.text.headerParams);
        textMesh = new Mesh( textGeometry, textMaterial );
        textMesh.rotation.x = -1.5708;

        const station = createActor();
        station.originalStartingPoint = [0, 0];
        station.currentPoint = [0, 0];
        station.endingPoint = [0, 0];
        meshGroup = new Object3D();
        station.material = new MeshBasicMaterial( {color: 0xFF0000, opacity: 1, transparent: false, side: DoubleSide} );
        station.geometry = new PlaneGeometry(4, 4, 1, 1);
        station.mesh = new Mesh( station.geometry, station.material );
        station.mesh.position.set(station.currentPoint[0], 1, station.currentPoint[1]);
        station.mesh.rotation.set(1.5708, 0, 0);
        meshGroup.add(station.mesh);
        sectionGlow.position.set(station.currentPoint[0], 0.1, station.currentPoint[1] - 5);
        meshGroup.add(sectionGlow);
        section.position.set(station.currentPoint[0], 0, station.currentPoint[1] - 5);
        meshGroup.add(section);
        textMesh.position.set(station.currentPoint[0] - 2.5, -0.5, station.currentPoint[1] - 4.85);
        meshGroup.add(textMesh);
        station.mesh = meshGroup;
        meshGroup.name = 'Station';
        this.scene.add(meshGroup);
        meshGroup.position.set(-50, 2, 0);
        this.actors.push(station);

        const ship = createActor();
        ship.originalStartingPoint = [0, 0];
        ship.currentPoint = [0, 0];
        ship.endingPoint = [0, 0];
        meshGroup = new Object3D();
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

        sectionGlow = new Mesh( sectionGlowGeometryMiddle, sectionMaterialGlow );
        sectionGlow.rotation.set(1.5708, 0, 0);

        section = new Mesh( sectionBackingGeometryMiddle, sectionMaterial );
        section.rotation.set(1.5708, 0, 0); 

        textGeometry = new TextGeometry('Mars', this.text.headerParams);
        textMesh = new Mesh( textGeometry, textMaterial );
        textMesh.rotation.x = -1.5708;

        const mars = createActor();
        mars.originalStartingPoint = [0, 0];
        mars.currentPoint = [0, 0];
        mars.endingPoint = [0, 0];
        meshGroup = new Object3D();
        mars.geometry = new CircleGeometry(5, 16, 16);
        mars.material = new MeshPhongMaterial();
        mars.material.map = marsTexture;
        mars.material.map.minFilter = LinearFilter;
        (mars.material as any).shininess = 0;
        mars.material.transparent = true;
        mars.mesh = new Mesh(mars.geometry, mars.material);
        mars.mesh.position.set(mars.currentPoint[0], 2, mars.currentPoint[1]);
        mars.mesh.rotation.set(-1.5708, 0, 0);
        meshGroup.add(mars.mesh);
        sectionGlow.position.set(mars.currentPoint[0], 0.1, mars.currentPoint[1] - 5);
        meshGroup.add(sectionGlow);
        section.position.set(mars.currentPoint[0], 0, mars.currentPoint[1] - 5);
        meshGroup.add(section);
        textMesh.position.set(mars.currentPoint[0] - 0.5, -0.5, mars.currentPoint[1] - 4.85);
        meshGroup.add(textMesh);
        mars.mesh = meshGroup;
        meshGroup.name = 'Mars';
        this.scene.add(meshGroup);
        meshGroup.position.set(-50, 2, 0);
        this.actors.push(mars);

        sectionGlow = new Mesh( sectionGlowGeometryMiddle, sectionMaterialGlow );
        sectionGlow.rotation.set(1.5708, 0, 0);

        section = new Mesh( sectionBackingGeometryMiddle, sectionMaterial );
        section.rotation.set(1.5708, 0, 0); 

        textGeometry = new TextGeometry('Asteroid Belt', this.text.headerParams);
        textMesh = new Mesh( textGeometry, textMaterial );
        textMesh.rotation.x = -1.5708;

        const asteroid = createActor();
        asteroid.originalStartingPoint = [0, 0];
        asteroid.currentPoint = [0, 0];
        asteroid.endingPoint = [0, 0];
        meshGroup = new Object3D();
        asteroid.geometry = new CircleGeometry(5, 16, 16);
        asteroid.material = new MeshPhongMaterial();
        asteroid.material.map = asteroidTexture;
        asteroid.material.map.minFilter = LinearFilter;
        (asteroid.material as any).shininess = 0;
        asteroid.material.transparent = true;
        asteroid.mesh = new Mesh(asteroid.geometry, asteroid.material);
        asteroid.mesh.position.set(asteroid.currentPoint[0], 2, asteroid.currentPoint[1]);
        asteroid.mesh.rotation.set(-1.5708, 0, 0);
        meshGroup.add(asteroid.mesh);
        sectionGlow.position.set(asteroid.currentPoint[0], 0.1, asteroid.currentPoint[1] - 5);
        meshGroup.add(sectionGlow);
        section.position.set(asteroid.currentPoint[0], 0, asteroid.currentPoint[1] - 5);
        meshGroup.add(section);
        textMesh.position.set(asteroid.currentPoint[0] - 1, -0.5, asteroid.currentPoint[1] - 4.85);
        meshGroup.add(textMesh);
        asteroid.mesh = meshGroup;
        meshGroup.name = 'Asteroid';
        this.scene.add(meshGroup);
        meshGroup.position.set(-50, 2, 0);
        this.actors.push(asteroid);

        sectionGlow = new Mesh( sectionGlowGeometryMiddle, sectionMaterialGlow );
        sectionGlow.rotation.set(1.5708, 0, 0);

        section = new Mesh( sectionBackingGeometryMiddle, sectionMaterial );
        section.rotation.set(1.5708, 0, 0); 

        textGeometry = new TextGeometry('Enceladus', this.text.headerParams);
        textMesh = new Mesh( textGeometry, textMaterial );
        textMesh.rotation.x = -1.5708;

        const enceladus = createActor();
        enceladus.originalStartingPoint = [0, 0];
        enceladus.currentPoint = [0, 0];
        enceladus.endingPoint = [0, 0];
        meshGroup = new Object3D();
        enceladus.geometry = new CircleGeometry(5, 48, 48);
        enceladus.material = new MeshPhongMaterial();
        enceladus.material.map = enceladusTexture;
        enceladus.material.map.minFilter = LinearFilter;
        (enceladus.material as any).shininess = 0;
        enceladus.material.transparent = true;
        enceladus.mesh = new Mesh(enceladus.geometry, enceladus.material);
        enceladus.mesh.position.set(enceladus.currentPoint[0], 2, enceladus.currentPoint[1]);
        enceladus.mesh.rotation.set(-1.5708, 0, 0);
        meshGroup.add(enceladus.mesh);
        sectionGlow.position.set(enceladus.currentPoint[0], 0.1, enceladus.currentPoint[1] - 5);
        meshGroup.add(sectionGlow);
        section.position.set(enceladus.currentPoint[0], 0, enceladus.currentPoint[1] - 5);
        meshGroup.add(section);
        textMesh.position.set(enceladus.currentPoint[0] - 0.7, -0.5, enceladus.currentPoint[1] - 4.85);
        meshGroup.add(textMesh);
        enceladus.mesh = meshGroup;
        meshGroup.name = 'Enceladus';
        this.scene.add(meshGroup);
        meshGroup.position.set(-50, 2, 0);
        this.actors.push(enceladus);

        let zIndex = 0;

        const sun = createActor();
        sun.originalStartingPoint = [0, 0];
        sun.currentPoint = [0, 0];
        sun.endingPoint = [0, 0];
        meshGroup = new Object3D();
        sun.geometry = new CircleGeometry(0.5, 48, 48);
        sun.material = new MeshBasicMaterial({ color: 0xF9D71C });
        sun.mesh = new Mesh(sun.geometry, sun.material);
        sun.mesh.position.set(sun.currentPoint[0], zIndex, sun.currentPoint[1]);
        sun.mesh.rotation.set(-1.5708, 0, 0);
        sun.mesh.name = 'Sun';
        this.scene.add(sun.mesh);
        sun.mesh.scale.set(0.0001, 0.0001, 0.0001);
        this.actors.push(sun);

        const mercury = createActor();
        mercury.originalStartingPoint = [0, 0];
        mercury.currentPoint = [-0.74, 0];
        mercury.endingPoint = [0, 0];
        meshGroup = new Object3D();
        mercury.geometry = new CircleGeometry(0.05, 48, 48);
        mercury.material = new MeshBasicMaterial({ color: 0xFF88FF });
        mercury.mesh = new Mesh(mercury.geometry, mercury.material);
        mercury.mesh.position.set(mercury.currentPoint[0], zIndex + 1, mercury.currentPoint[1]);
        mercury.mesh.rotation.set(-1.5708, 0, 0);
        meshGroup.add(mercury.mesh);
        meshGroup.name = 'Mercury';
        mercury.mesh = meshGroup;

        let orbitGeometry = new CircleGeometry(0.75, 32, 32);
        let orbitMaterial = new MeshBasicMaterial({
            color: new Color(0xFFFFFF),
            opacity: 1,
            side: DoubleSide,
            transparent: true});
        let orbit = new Mesh(orbitGeometry, orbitMaterial);
        orbit.position.set(0, zIndex + 3, 0);
        orbit.rotation.set(-1.5708, 0, 0);
        meshGroup.add(orbit);
        // Inner Black Circle
        let blackGeometry = new CircleGeometry(0.73, 32, 32);
        let blackMaterial = new MeshBasicMaterial({
            color: new Color(0x000000),
            opacity: 1,
            side: DoubleSide,
            transparent: false});
        let black = new Mesh(blackGeometry, blackMaterial);
        black.position.set(0, zIndex + 2, 0);
        black.rotation.set(-1.5708, 0, 0);
        meshGroup.add(black);

        this.scene.add(meshGroup);
        meshGroup.scale.set(0.0001, 0.0001, 0.0001);
        this.actors.push(mercury);

        zIndex += 3;

        const venus = createActor();
        venus.originalStartingPoint = [0, 0];
        venus.currentPoint = [-0.99, 0];
        venus.endingPoint = [0, 0];
        meshGroup = new Object3D();
        venus.geometry = new CircleGeometry(0.05, 48, 48);
        venus.material = new MeshBasicMaterial({ color: 0x88FF88 });
        venus.mesh = new Mesh(venus.geometry, venus.material);
        venus.mesh.position.set(venus.currentPoint[0], zIndex + 1, venus.currentPoint[1]);
        venus.mesh.rotation.set(-1.5708, 0, 0);
        meshGroup.add(venus.mesh);
        meshGroup.name = 'Venus';
        venus.mesh = meshGroup;

        orbitGeometry = new CircleGeometry(1, 32, 32);
        orbitMaterial = new MeshBasicMaterial({
            color: new Color(0xFFFFFF),
            opacity: 1,
            side: DoubleSide,
            transparent: true});
        orbit = new Mesh(orbitGeometry, orbitMaterial);
        orbit.position.set(0, zIndex + 3, 0);
        orbit.rotation.set(-1.5708, 0, 0);
        meshGroup.add(orbit);
        // Inner Black Circle
        blackGeometry = new CircleGeometry(0.98, 32, 32);
        blackMaterial = new MeshBasicMaterial({
            color: new Color(0x000000),
            opacity: 1,
            side: DoubleSide,
            transparent: false});
        black = new Mesh(blackGeometry, blackMaterial);
        black.position.set(0, zIndex + 2, 0);
        black.rotation.set(-1.5708, 0, 0);
        meshGroup.add(black);

        this.scene.add(meshGroup);
        meshGroup.scale.set(0.0001, 0.0001, 0.0001);
        this.actors.push(venus);

        zIndex += 3;

        const tinyEarth = createActor();
        tinyEarth.originalStartingPoint = [0, 0];
        tinyEarth.currentPoint = [-1.24, 0];
        tinyEarth.endingPoint = [0, 0];
        meshGroup = new Object3D();
        tinyEarth.geometry = new CircleGeometry(0.05, 48, 48);
        tinyEarth.material = new MeshBasicMaterial({ color: 0x8888FF });
        tinyEarth.mesh = new Mesh(tinyEarth.geometry, tinyEarth.material);
        tinyEarth.mesh.position.set(tinyEarth.currentPoint[0], zIndex + 1, tinyEarth.currentPoint[1]);
        tinyEarth.mesh.rotation.set(-1.5708, 0, 0);
        meshGroup.add(tinyEarth.mesh);
        meshGroup.name = 'Tiny Earth';
        tinyEarth.mesh = meshGroup;

        orbitGeometry = new CircleGeometry(1.25, 32, 32);
        orbitMaterial = new MeshBasicMaterial({
            color: new Color(0xFFFFFF),
            opacity: 1,
            side: DoubleSide,
            transparent: true});
        orbit = new Mesh(orbitGeometry, orbitMaterial);
        orbit.position.set(0, zIndex + 3, 0);
        orbit.rotation.set(-1.5708, 0, 0);
        meshGroup.add(orbit);
        // Inner Black Circle
        blackGeometry = new CircleGeometry(1.23, 32, 32);
        blackMaterial = new MeshBasicMaterial({
            color: new Color(0x000000),
            opacity: 1,
            side: DoubleSide,
            transparent: false});
        black = new Mesh(blackGeometry, blackMaterial);
        black.position.set(0, zIndex + 2, 0);
        black.rotation.set(-1.5708, 0, 0);
        meshGroup.add(black);

        this.scene.add(meshGroup);
        meshGroup.scale.set(0.0001, 0.0001, 0.0001);
        this.actors.push(tinyEarth);

        zIndex += 3;

        const tinyMars = createActor();
        tinyMars.originalStartingPoint = [0, 0];
        tinyMars.currentPoint = [-1.49, 0];
        tinyMars.endingPoint = [0, 0];
        meshGroup = new Object3D();
        tinyMars.geometry = new CircleGeometry(0.05, 48, 48);
        tinyMars.material = new MeshBasicMaterial({ color: 0xFF4444 });
        tinyMars.mesh = new Mesh(tinyMars.geometry, tinyMars.material);
        tinyMars.mesh.position.set(tinyMars.currentPoint[0], zIndex + 1, tinyMars.currentPoint[1]);
        tinyMars.mesh.rotation.set(-1.5708, 0, 0);
        meshGroup.add(tinyMars.mesh);
        meshGroup.name = 'Tiny Mars';
        tinyMars.mesh = meshGroup;

        orbitGeometry = new CircleGeometry(1.50, 32, 32);
        orbitMaterial = new MeshBasicMaterial({
            color: new Color(0xFFFFFF),
            opacity: 1,
            side: DoubleSide,
            transparent: true});
        orbit = new Mesh(orbitGeometry, orbitMaterial);
        orbit.position.set(0, zIndex + 3, 0);
        orbit.rotation.set(-1.5708, 0, 0);
        meshGroup.add(orbit);
        // Inner Black Circle
        blackGeometry = new CircleGeometry(1.48, 32, 32);
        blackMaterial = new MeshBasicMaterial({
            color: new Color(0x000000),
            opacity: 1,
            side: DoubleSide,
            transparent: false});
        black = new Mesh(blackGeometry, blackMaterial);
        black.position.set(0, zIndex + 2, 0);
        black.rotation.set(-1.5708, 0, 0);
        meshGroup.add(black);

        this.scene.add(meshGroup);
        meshGroup.scale.set(0.0001, 0.0001, 0.0001);
        this.actors.push(tinyMars);

        zIndex += 3;
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

        for (let j = 0; j < this.stars.length; j++) {
            const mag = (Math.floor(Math.random() * 3) + 1) / 100;
            const warpedGeometry = new PlaneGeometry(0.5, mag, 1, 1);
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
                    console.log('handleActorEvents', actor.mesh.name, this.currentFrame);
                }
                break;
            }
            case 'Grow': {
                const currentScale = this.actors[actorEvent.actorIndex].mesh.scale.x;
                let newScale = currentScale + (1 / actorEvent.duration);
                newScale = newScale <= 1 ? newScale : 1;
                this.actors[actorEvent.actorIndex].mesh.scale.set(newScale, newScale, newScale);
                break;
            }
            case 'Shrink': {
                const currentScale = this.actors[actorEvent.actorIndex].mesh.scale.x;
                let newScale = currentScale - (1 / actorEvent.duration);
                newScale = newScale >= 0.0001 ? newScale : 0.0001;
                this.actors[actorEvent.actorIndex].mesh.scale.set(newScale, newScale, newScale);
                break;
            }
        }
    }

    private initiateActorEvents(actorEvent: ActorEvent): void {
        console.log('initiateActorEvents', actorEvent.type, this.currentFrame);
        switch(actorEvent.type) {
            case 'Moving': {
                this.setDestination(actorEvent.actorIndex, actorEvent.startPoint[0], actorEvent.startPoint[1], actorEvent.endPoint[0], actorEvent.endPoint[1], actorEvent.speed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.action = actorEvent;
                break;
            }
            case 'Grow': {
                this.setDestination(actorEvent.actorIndex, actorEvent.startPoint[0], actorEvent.startPoint[1], actorEvent.endPoint[0], actorEvent.endPoint[1], actorEvent.speed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.mesh.scale.set(0, 0, 0);
                actor.action = actorEvent;
                break;
            }
            case 'Shrink': {
                this.setDestination(actorEvent.actorIndex, actorEvent.startPoint[0], actorEvent.startPoint[1], actorEvent.endPoint[0], actorEvent.endPoint[1], actorEvent.speed);
                const actor = this.actors[actorEvent.actorIndex];
                actor.mesh.scale.set(1, 1, 1);
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
                break;
            }
            case 'Warped Stars Stopping': {
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
        actor.speed = speed;
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
}
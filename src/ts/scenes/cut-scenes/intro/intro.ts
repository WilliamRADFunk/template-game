import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PlaneGeometry,
    Scene } from 'three';

import { Actor } from '../../../models/actor';
import { SceneType } from '../../../models/scene-type';
import { getIntersections } from '../../../utils/get-intersections';
import { SOUNDS_CTRL } from '../../../controls/controllers/sounds-controller';
import { ASSETS_CTRL } from '../../../controls/controllers/assets-controller';
import { createShip1 } from '../../intro/actors/create-ship-1';
import { createShip } from '../utils/create-ship';
import { Thruster } from '../utils/thruster';

// const border: string = '1px solid #FFF';
const border: string = 'none';

const THRUSTER1_OFFSETS = [-2.355, 1, -0.33];
const THRUSTER2_OFFSETS = [-2.45, 1, 0.0075];
const THRUSTER3_OFFSETS = [-2.355, 1, 0.335];

/**
 * @class
 * Slow moving debris object that is sometimes on the path towards planet.
 */
export class Intro {
    /**
     * List of actors in the scene.
     */
    private _actors: Actor[] = [];
    /**
     * Current frame
     */
    private _currentFrame: number = 0;

    /**
     * Flag to signal the scene is no longer active. Primarily used for a click event to useful during endCycle.
     */
    private _isActive: boolean = true;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    /**
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private _scene: Scene;

    private _ship: Actor;

    /**
     * Stationary pin-pricks of light in the background.
     */
    private _stars: Mesh[] = [];

    /**
     * Moving pin-pricks of light in the background.
     */
    private _starsInMotion: boolean = false;

    private _thruster1: Thruster;
    private _thruster2: Thruster;
    private _thruster3: Thruster;

    /**
     * Positions mods to adjust objects quickly to give shaking sensation.
     */
    private _warblePositions: [number, number][] = [
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

    /**
     * Stationary stars stretched out into lines to simulate light speeds.
     */
    private _warpedStars: Mesh[] = [];

    /**
     * Stars stretched out into lines to simulate light speeds and moving from right to left.
     */
    private _warpedStarsInMotion: boolean = false;

    /**
     * Constructor for the Intro (Scene) class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     */
    constructor(scene: SceneType) {
        this._scene = scene.scene;

        document.oncontextmenu = event => {
            return false;
        };

        this._onWindowResize();
        this._listenerRef = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._listenerRef, false);

        this._createStars();
        this._createActors();
        this._ship = createShip();
        this._scene.add(this._ship.mesh);
        const shipPos = this._ship.mesh.position;
        this._thruster1 = new Thruster(this._scene, [shipPos.x + THRUSTER1_OFFSETS[0], shipPos.y + THRUSTER1_OFFSETS[1], shipPos.z + THRUSTER1_OFFSETS[2]], 0.9);
        this._thruster2 = new Thruster(this._scene, [shipPos.x + THRUSTER2_OFFSETS[0], shipPos.y + THRUSTER2_OFFSETS[1], shipPos.z + THRUSTER2_OFFSETS[2]]);
        this._thruster3 = new Thruster(this._scene, [shipPos.x + THRUSTER3_OFFSETS[0], shipPos.y + THRUSTER3_OFFSETS[1], shipPos.z + THRUSTER3_OFFSETS[2]], 0.9);
        
        // Click event listener to register user click.
        document.onclick = event => {
            event.preventDefault();
            // Detection for player clicked on pause button
            getIntersections(event, document.getElementById('mainview'), scene)
                .filter(el => el.object.name === 'Click Barrier')
                .forEach(el => {
                    SOUNDS_CTRL.playBidooo();
                    this._isActive = false;
                });
        };
    }

    /**
     * Calculates the next point in the ship's path.
     * @param actor the actor about to be moved to the next point on its trajectory.
     */
    private _calculateNextPoint(actor: Actor): void {
        actor.distanceTraveled += actor.moveSpeed;
        // (xt, yt) = ( ( (1 − t) * x0 + t * x1 ), ( (1 − t) * y0 + t * y1) )
        const t = actor.distanceTraveled / actor.totalDistance;
        actor.currentPoint[0] = ((1 - t) * actor.originalStartingPoint[0]) + (t * actor.endingPoint[0]);
        actor.currentPoint[1] = ((1 - t) * actor.originalStartingPoint[1]) + (t * actor.endingPoint[1]);
    }

    /**
     * Creates items to be moved around in scene.
     */
    private _createActors(): void {
        const headerParams = {
            font: ASSETS_CTRL.gameFont,
            size: 0.25,
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

        const ship = createShip1();
        this._scene.add(ship.mesh);
        this._actors.push(ship);
    }

    /**
     * Creates the location, size, and mesh for each of the stars in the background.
     */
    private _createStars(): void {
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
            this._scene.add(mesh);
            this._stars[i] = mesh;
        }

        for (let j = 0; j < this._stars.length / 2; j++) {
            const mag = Math.random() + 0.2;
            const warpedGeometry = new PlaneGeometry(mag, 0.02, 1, 1);
            const mesh = new Mesh( warpedGeometry, material );
            mesh.position.set(this._stars[j].position.x, 5, this._stars[j].position.z);
            mesh.rotation.set(1.5708, 0, 0);
            mesh.name = `Warped-Star-${j}`;
            this._scene.add(mesh);
            mesh.visible = false;
            this._warpedStars[j] = mesh;
        }
    }

    private _onWindowResize(): void {
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
    };

    /**
     * Spins object at its set rate.
     * @param actor portion of the into scene to rotate.
     */
    private _rotate(actor: Actor): void {
        const twoPi = 2 * Math.PI;
        actor.currentRotation += actor.rotateSpeed;
        if (actor.currentRotation >= twoPi) {
            actor.currentRotation -= twoPi
        }
        actor.mesh.rotation.set(0, actor.currentRotation, 0);
    }

    /**
     * Calculates total distance to travel between two points and calculates first step.
     * @param actorIndex index of actor in the actor array.
     * @param x1 starting x coordinate
     * @param z1 starting z coordinate
     * @param x2 destination x coordinate
     * @param z2 destination z coordinate
     * @param speed amount of space to cover per frame.
     */
    private _setDestination(actorIndex: number, x1: number, z1: number, x2: number, z2: number, speed: number): void {
        const actor = this._actors[actorIndex];
        actor.moveSpeed = speed;
        actor.originalStartingPoint[0] = x1;
        actor.currentPoint[0] = x1;
        actor.originalStartingPoint[1] = z1;
        actor.currentPoint[1] = z1;
        actor.endingPoint = [x2, z2];
        actor.totalDistance = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((z2 - z1) * (z2 - z1)));
        actor.distanceTraveled = 0;
        // Calculates the first (second vertices) point.
        this._calculateNextPoint(actor);
        actor.inMotion = true;
    }

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        document.oncontextmenu = () => {};
        document.getElementById('intro-screen-sequence-texts').remove();
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * At the end of each loop iteration, move the scene by one frame.
     * @returns whether or not the intro is done. TRUE intro is finished | FALSE it is not finished.
     */
    public endCycle(): boolean {
        // Through user action, the scene has ended.
        if (!this._isActive) {
            return true;
        }

        const shipPos = this._ship.mesh.position;
        this._thruster1.endCycle([shipPos.x + THRUSTER1_OFFSETS[0], shipPos.y + THRUSTER1_OFFSETS[1], shipPos.z + THRUSTER1_OFFSETS[2]], true);
        this._thruster2.endCycle([shipPos.x + THRUSTER2_OFFSETS[0], shipPos.y + THRUSTER2_OFFSETS[1], shipPos.z + THRUSTER2_OFFSETS[2]], true);
        this._thruster3.endCycle([shipPos.x + THRUSTER3_OFFSETS[0], shipPos.y + THRUSTER3_OFFSETS[1], shipPos.z + THRUSTER3_OFFSETS[2]], true);
    
        this._currentFrame++;
        
    }
}
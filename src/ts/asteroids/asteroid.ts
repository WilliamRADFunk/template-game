import {
    CircleGeometry,
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    Scene,
    Texture } from 'three';

import { Collidable } from '../collidable';
import { CollisionatorSingleton } from '../collisionator';
import { Explosion } from '../weapons/explosion';
import { SoundinatorSingleton } from '../soundinator';

let index: number = 0;

/**
 * @class
 * Slow moving debris object that is sometimes on the path towards planet.
 */
export class Asteroid implements Collidable {
    /**
     * Controls size and shape of the asteroid
     */
    private asteroidGeometry: CircleGeometry;
    /**
     * Controls the color of the asteroid material
     */
	private asteroidMaterial: MeshPhongMaterial;
    /**
     * Controls the overall rendering of the asteroid
     */
    private asteroid: Mesh;
    /**
     * Keeps track of the x,z point the asteroid is at currently.
     */
    private currentPoint: number[];
    /**
     * Tracks the distance traveled thus far to update the calculateNextPoint calculation.
     */
    private distanceTraveled: number;
    /**
     * Keeps track of the x,z point of asteroid's destination point.
     */
    private endingPoint: number[];
    /**
     * Explosion from impacted asteroid
     */
    private explosion: Explosion;
    /**
     * Flag to signal if asteroid has been destroyed or not.
     * True = not destroyed. False = destroyed.
     */
    private isActive: boolean = true;
    /**
     * Keeps track of the x,z point where asteroid fired from.
     */
    private originalStartingPoint: number[];
    /**
     * Reference to the scene, used to remove asteroid from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * The speed at which the asteroid travels.
     */
    private speed: number = 0.002;
    /**
     * The total distance from asteroid to planet.
     */
    private totalDistance: number;
    /**
     * Constructor for the Asteroid class
     * @param scene     graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param x1        origin point x of where the asteroid starts.
     * @param z1        origin point z of where the asteroid starts.
     * @param speedMod  speed modifier at time of saucer instantiation.
     * @hidden
     */
    constructor(scene: Scene, asteroidTexture: Texture, x1:number, z1: number, speedMod: number) {
        index++;
        this.speed += (speedMod / 1000);
        this.originalStartingPoint = [x1, z1];
        this.currentPoint = [x1, z1];
        this.endingPoint = [0, 0];
        this.totalDistance = Math.sqrt((x1 * x1) + (z1 * z1));
        this.distanceTraveled = 0;
        // Calculates the first (second vertices) point.
        this.calculateNextPoint();

        this.scene = scene;
		this.asteroidGeometry = new CircleGeometry(0.2, 16, 16);
        this.asteroidMaterial = new MeshPhongMaterial();
        this.asteroidMaterial.map = asteroidTexture;
        this.asteroidMaterial.map.minFilter = LinearFilter;
        this.asteroidMaterial.shininess = 0;
        this.asteroidMaterial.transparent = true;
        this.asteroid = new Mesh(this.asteroidGeometry, this.asteroidMaterial);
        this.asteroid.position.set(this.currentPoint[0], 0.2, this.currentPoint[1]);
        this.asteroid.rotation.set(-1.5708, 0, 0);
        this.asteroid.name = `Asteroid-${index}`;
    }
    /**
     * (Re)activates the asteroid, usually at beginning of new level.
     */
    activate(): void {
        this.isActive = true;
    }
    /**
     * Adds asteroid object to the three.js scene.
     */
    addToScene(): void {
        this.scene.add(this.asteroid);
    }
    /**
     * Calculates the next point in the asteroid's path.
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
     * @param isInert flag to let explosion know it isn't a 'real' explosion (hit shield).
     */
    private createExplosion(isInert: boolean): void {
        this.explosion = new Explosion(
            this.scene,
            this.asteroid.position.x,
            this.asteroid.position.z,
            {
                radius: 0.2,
                renderedInert: isInert
            });
        if (!isInert) {
            CollisionatorSingleton.add(this.explosion);
            SoundinatorSingleton.playExplosionLarge(false);
        } else {
            SoundinatorSingleton.playExplosionLarge(true);
        }
    }
    /**
     * At the end of each loop iteration, move the asteroid a little.
     * @returns whether or not the asteroid is done, and its points calculated.
     */
    endCycle(): boolean {
        if (this.explosion) {
            if (!this.explosion.endCycle()) {
                CollisionatorSingleton.remove(this.explosion);
                this.scene.remove(this.explosion.getMesh());
                this.explosion = null;
                return false;
            }
        } else if (this.isActive) {
            this.calculateNextPoint();
            this.asteroid.position.set(this.currentPoint[0], 0.2, this.currentPoint[1]);
        }
        return true;
    }
    /**
     * Gets the viability of the object.
     * @returns flag to signal non-destruction. True = not destroyed. False = destroyed.
     */
    getActive(): boolean {
        return this.isActive;
    }
    /**
     * Gets the current radius of the bounding box (circle) of the collidable.
     * @returns number to represent pixel distance from object center to edge of bounding box.
     */
    getCollisionRadius(): number {
        return 0.3;
    }
    /**
     * Gets the current position of the collidable object.
     * @returns the array is of length 2 with x coordinate being first, and then z coordinate.
     */
    getCurrentPosition(): number[] {
        return [this.asteroid.position.x, this.asteroid.position.z];
    }
    /**
     * Gets the name of the asteroid.
     * @returns the name of the asteroid.
     */
    getName(): string {
        return this.asteroid.name;
    }
    /**
     * Called when something collides with asteroid, which destroys it.
     * @param self         the thing to remove from collidables...and scene.
     * @param otherThing   the name of the other thing in collision (mainly for shield).
     * @returns whether or not impact means calling removeFromScene by collisionator.
     */
    impact(self: Collidable, otherThing: string): boolean {
        if (this.isActive) {
            this.isActive = false;
            this.createExplosion(!otherThing.indexOf('Shield'));
            return true;
        }
        return false;
    }
    /**
     * States it is a passive type or not. Two passive types cannot colllide with each other.
     * @returns True is passive | False is not passive
     */
    isPassive(): boolean {
        return false;
    }
    /**
     * Removes asteroid object from the 'visible' scene by sending it back to its starting location.
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     */
    removeFromScene(scene: Scene): void {
        this.asteroid.position.set(this.originalStartingPoint[0], 0.2, this.originalStartingPoint[1]);
        this.currentPoint = [this.originalStartingPoint[0], this.originalStartingPoint[1]];
        this.distanceTraveled = 0;
    }
}
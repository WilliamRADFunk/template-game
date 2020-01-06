import {
    CircleGeometry,
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    Scene,
    Texture } from 'three';
    
import { Collidable } from "../collidable";
import { Explosion } from '../weapons/explosion';
import { CollisionatorSingleton } from '../collisionator';
import { SoundinatorSingleton } from '../soundinator';

let index: number = 0;

export class Saucer implements Collidable {
    /**
     * Keeps track of the x,z point the saucer is at currently.
     */
    private currentPoint: number[];
    /**
     * Tracks the distance traveled thus far to update the calculateNextPoint calculation.
     */
    private distanceTraveled: number;
    /**
     * Keeps track of the x,z point of saucer's destination point.
     */
    private endingPoint: number[];
    /**
     * Explosion from impacted saucer
     */
    private explosion: Explosion;
    /**
     * Flag to signal if saucer has been destroyed or not.
     * True = not destroyed. False = destroyed.
     */
    private isActive: boolean = true;
    /**
     * Optional constructor param that determines if saucer is on help screen. If so, don't play sounds.
     */
    private isHelpSaucer: boolean = false;
    /**
     * Keeps track of the x,z point where saucer fired from.
     */
    private originalStartingPoint: number[];
    /**
     * Controls size and shape of the saucer
     */
    private saucerGeometry: CircleGeometry;
    /**
     * Controls the color of the saucer material
     */
	private saucerMaterial: MeshPhongMaterial;
    /**
     * Controls the overall rendering of the saucer
     */
    private saucer: Mesh;
    /**
     * Reference to the scene, used to remove saucer from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * The speed at which the saucer travels.
     */
    private speed: number = 0.008;
    /**
     * The total distance from saucer to final destination.
     */
    private totalDistance: number;
    /**
     * The wait number of iterations before loosing the saucer.
     * Prevents new level creation from saucer immediately.
     */
    private waitToFire: number = 0;
    /**
     * The distance to and from the camera that the saucer should exist...its layer.
     */
    private yPos: number;
    /**
     * Constructor for the Saucer class
     * @param scene        graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param x1           origin point x of where the saucer starts.
     * @param z1           origin point z of where the saucer starts.
     * @param x2           final point x of where the saucer starts.
     * @param z2           final point z of where the saucer starts.
     * @param dist         total distance the saucer must travel.
     * @param speedMod     speed modifier at time of saucer instantiation.
     * @param yPos         layer level for saucer to appear.
     * @param fireNow      optional choice not to wait to have saucer start moving.
     * @param isHelpScreen lets saucer know it's a help screen iteration and not to play sound effects.
     * @hidden
     */
    constructor(
        scene: Scene,
        saucerTextures: Texture[],
        x1:number,
        z1: number,
        x2: number,
        z2: number,
        dist: number,
        speedMod: number,
        yPos?: number,
        fireNow?: boolean,
        isHelpScreen?: boolean) {
        index++;
        this.yPos = yPos || 0.6;
        this.speed += (speedMod / 1000);
        this.originalStartingPoint = [x1, z1];
        this.currentPoint = [x1, z1];
        this.endingPoint = [x2, z2];
        this.totalDistance = dist;
        this.distanceTraveled = 0;
        this.isHelpSaucer = isHelpScreen;
        // Calculates the first (second vertices) point.
        this.calculateNextPoint();

        this.scene = scene;
		this.saucerGeometry = new CircleGeometry(0.2, 16, 16);
        this.saucerMaterial = new MeshPhongMaterial();
        this.saucerMaterial.map = saucerTextures[Math.floor((Math.random() * 5) +0)];
        this.saucerMaterial.map.minFilter = LinearFilter;
        this.saucerMaterial.shininess = 0;
        this.saucerMaterial.transparent = true;
        this.saucer = new Mesh(this.saucerGeometry, this.saucerMaterial);
        this.saucer.position.set(this.currentPoint[0], this.yPos, this.currentPoint[1]);
        this.saucer.rotation.set(-1.5708, 0, 0);
        this.saucer.name = `Saucer-${index}`;
        this.waitToFire = (fireNow) ? 0 : Math.floor((Math.random() * 2000) + 1);
    }
    /**
     * (Re)activates the saucer, usually at beginning of new level.
     */
    activate(): void {
        // If saucer was never destroyed (game over), let him "wait" on his own loop.
        if (!this.isActive) {
            this.waitToFire = Math.floor((Math.random() * 2000) + 1);
        }
        this.isActive = true;
    }
    /**
     * Adds saucer object to the three.js scene.
     */
    addToScene(): void {
        this.scene.add(this.saucer);
    }
    /**
     * Calculates the next point in the saucer's path.
     */
    private calculateNextPoint(): void {
        this.distanceTraveled += this.speed;
        // (xt, yt) = ( ( (1 − t) * x0 + t * x1 ), ( (1 − t) * y0 + t * y1) )
        const t = this.distanceTraveled / this.totalDistance;
        this.currentPoint[0] = ((1 - t) * this.originalStartingPoint[0]) + (t * this.endingPoint[0]);
        this.currentPoint[1] = ((1 - t) * this.originalStartingPoint[1]) + (t * this.endingPoint[1]);
        if (this.distanceTraveled >= this.totalDistance - 0.5) {
            this.currentPoint[0] = this.originalStartingPoint[0];
            this.currentPoint[1] = this.originalStartingPoint[1];
            this.distanceTraveled = 0;
            Math.floor((Math.random() * 750) + 1);
        }
    }
    /**
     * Creates an explosion during collision and adds it to the collildables list.
     * @param isInert flag to let explosion know it isn't a 'real' explosion (hit shield).
     */
    private createExplosion(isInert: boolean): void {
        this.explosion = new Explosion(this.scene, this.saucer.position.x, this.saucer.position.z, 0.4, isInert);
        if (!isInert) {
            CollisionatorSingleton.add(this.explosion);
            SoundinatorSingleton.playBoom(false);
        } else {
            SoundinatorSingleton.playBoom(true);
        }
    }
    /**
     * Call to eliminate regardless of current state.
     * Mainly used for non-game instantiations of this (ie. help screen animations).
     */
    destroy() {
        if (this.explosion) {
            CollisionatorSingleton.remove(this.explosion);
            this.scene.remove(this.explosion.getMesh());
            this.explosion = null;
        }
        CollisionatorSingleton.remove(this);
        this.scene.remove(this.saucer);
    }
    /**
     * At the end of each loop iteration, move the saucer a little.
     * @returns whether or not the saucer is done, and its points calculated.
     */
    endCycle(): boolean {
        if (this.explosion) {
            if (!this.explosion.endCycle()) {
                CollisionatorSingleton.remove(this.explosion);
                this.scene.remove(this.explosion.getMesh());
                this.explosion = null;
                return false;
            }
        }
        if (this.waitToFire) {
            this.waitToFire--;
            if (!this.waitToFire && !this.isHelpSaucer) {
                SoundinatorSingleton.playSaucer();
            }
            return true;
        }
        if (this.isActive) {
            this.calculateNextPoint();
            this.saucer.position.set(this.currentPoint[0], this.yPos, this.currentPoint[1]);
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
        return 0.2;
    }
    /**
     * Gets the current position of the collidable object.
     * @returns the array is of length 2 with x coordinate being first, and then z coordinate.
     */
    getCurrentPosition(): number[] {
        return [this.saucer.position.x, this.saucer.position.z];
    }
    /**
     * Gets the name of the saucer.
     * @returns the name of the saucer.
     */
    getName(): string {
        return this.saucer.name;
    }
    /**
     * Called when something collides with saucer, which destroys it.
     * @param self         the thing to remove from collidables...and scene.
     * @param otherThing   the name of the other thing in collision (mainly for shield).
     * @returns whether or not impact means calling removeFromScene by collisionator.
     */
    impact(self: Collidable, otherThing: string): boolean {
        if (this.isActive) {
            this.isActive = false;
            this.createExplosion(!otherThing.indexOf('Shield'));
            SoundinatorSingleton.stopSaucer();
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
     * Removes saucer object from the 'visible' scene by sending it back to its starting location.
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     */
    removeFromScene(scene: Scene): void {
        this.saucer.position.set(this.originalStartingPoint[0], this.yPos, this.originalStartingPoint[1]);
        this.currentPoint = [this.originalStartingPoint[0], this.originalStartingPoint[1]];
        this.distanceTraveled = 0;
    }
}
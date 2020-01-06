import { Mesh, MeshPhongMaterial, Scene, Color, SphereGeometry } from "three";

import { Collidable } from "../collidable";
import { Explosion } from '../weapons/explosion';
import { CollisionatorSingleton } from '../collisionator';
import { Projectile } from "./projectile";
import { CheckColorBrighness } from '../utils/check-color-brightness';
import { ScoreHandler } from "../displays/score-handler";
import { SoundinatorSingleton } from "../soundinator";

const randomColor = require('randomcolor');

let index: number = 0;

export class Drone implements Collidable {
    /**
     * Point around which drone rotates.
     */
    private centerPoint: [ number, number ];
    /**
     * Controls size and shape of the drone
     */
    private droneGeometry: SphereGeometry;
    /**
     * Controls the color of the drone material
     */
	private droneMaterial: MeshPhongMaterial;
    /**
     * Controls the overall rendering of the drone
     */
    private drone: Mesh;
    /**
     * Keeps track of the x,z point the drone is at currently.
     */
    private currentPoint: number[];
    /**
     * Keeps track of the theta angle of the drone to be used in movement mechanics.
     */
    private currentTheta: number;
    /**
     * Explosion from impacted drone
     */
    private explosion: Explosion;
    /**
     * Flag to signal if drone has been destroyed or not.
     * True = not destroyed. False = destroyed.
     */
    private isActive: boolean = true;
    /**
     * Controls how often drone can fire a new missile.
     */
    private lastFired: number = 240;
    /**
     * Keeps track of live missiles, to pass along endCycle signals, and destroy calls.
     */
    private missiles: Projectile[] = [];
    /**
     * Distance from drone to center of planet (0, 0);
     */
    private orbitRadius: number;
    /**
     * Amount of points for a destroyed drone missile.
     */
    private points: number;
    /**
     * Reference to the scene, used to remove drone from rendering cycle once destroyed.
     */
    private scene: Scene;
    /**
     * Reference to the scorekeeper for adding points on enemy missile destruction.
     */
    private scoreboard: ScoreHandler;
    /**
     * The speed at which the drone travels.
     */
    private speed: number = 0.002;
    /**
     * The distance to and from the camera that the saucer should exist...its layer.
     */
    private yPos: number;
    /**
     * Constructor for the Drone class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param scoreboard reference to score handler to add points when missiles blow.
     * @param x1         origin point x of where the drone starts.
     * @param z1         origin point z of where the drone starts.
     * @param points     points to give for destroyed missiles.
     * @param yPos       layer level for saucer to appear.
     * @hidden
     */
    constructor(
        scene: Scene,
        scoreboard: ScoreHandler,
        x1:number,
        z1: number,
        points: number,
        center?: [number, number],
        yPos?: number) {
        index++;
        this.scene = scene;
        this.currentPoint = [x1, z1];
        this.scoreboard = scoreboard;
        this.points = points;
        this.centerPoint = center || [0, 0];
        this.yPos = yPos || 0.3;
        
		this.droneGeometry = new SphereGeometry(0.1, 32, 32);
        this.droneMaterial = new MeshPhongMaterial({
            color: 0xC0C0C0,
            opacity: 0.75,
            specular: 0x505050,
            shininess: 100,
            transparent: true
        });
        const droneRingGeometry = new SphereGeometry(0.15, 32, 32);
        const droneRingMaterial = new MeshPhongMaterial({
            color: 0x0055FF,
            opacity: 0.75,
            specular: 0x505050,
            shininess: 100,
            transparent: true
        });
        const droneRing = new Mesh(droneRingGeometry, droneRingMaterial);
        droneRing.position.y = 0.5;
        droneRing.name = `Drone-Ring-${index}`;
        this.drone = new Mesh(this.droneGeometry, this.droneMaterial);
        this.drone.position.set(this.currentPoint[0], this.yPos, this.currentPoint[1]);
        this.drone.name = `Drone-${index}`;
        this.drone.add(droneRing);

        
        this.orbitRadius = this.getDistanceToTarget();
        this.currentTheta = Math.atan2(
            (this.currentPoint[1] - this.centerPoint[1]),
            (this.currentPoint[0] - this.centerPoint[0]));
    }
    /**
     * Adds drone object to the three.js scene.
     */
    addToScene(): void {
        this.scene.add(this.drone);
    }
    /**
     * Calculates the next point in the drone's path.
     */
    private calculateNextPoint() {
        this.currentTheta += this.speed;
        if (this.currentTheta >= 2 * Math.PI) this.currentTheta = 0;
        this.currentPoint[0] = this.orbitRadius * Math.cos(this.currentTheta) + this.centerPoint[0];
        this.currentPoint[1] = this.orbitRadius * Math.sin(this.currentTheta) + this.centerPoint[1];
    }
    /**
     * Creates an explosion during collision and adds it to the collildables list.
     * @param isInert flag to let explosion know it isn't a 'real' explosion (hit shield).
     */
    private createExplosion(isInert: boolean): void {
        this.explosion = new Explosion(this.scene, this.drone.position.x, this.drone.position.z, 0.2, isInert);
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
        this.missiles.filter(m => m.destroy());
        this.missiles = [];
        this.removeFromScene(this.scene);
    }
    /**
     * At the end of each loop iteration, drone moves, decides to fire, and handles missiles.
     * @param isGameActive flag to let generator know if game is not lost. If it is, don't continue accruing points.
     * @returns TRUE --> should keep going (don't remove) | FALSE --> No longer useful, remove it.
     */
    endCycle(isGameActive: boolean): boolean {
        if (this.isActive) {
            this.calculateNextPoint();
            this.drone.position.set(this.currentPoint[0], this.yPos, this.currentPoint[1]);
            const pos = this.getCurrentPosition();
            this.lastFired--;
            if (this.lastFired < 0) {
                this.lastFired = 240;
                let color;
                do {
                    const colorHex = randomColor();
                    if (CheckColorBrighness(colorHex)) {
                        color = new Color(colorHex);
                        break;
                    }
                } while(true);
                // Once created, missile will fly itself, detonate itself, and rease itself.
                const miss = new Projectile(
                    this.scene,
                    pos[0], pos[1],
                    this.centerPoint[0], this.centerPoint[1],
                    this.getDistanceToTarget(),
                    color,
                    true, 0.01, this.yPos, 1);
                this.missiles.push(miss);
                CollisionatorSingleton.add(miss);
            }
        }
        if (this.missiles.length) {
            let tempMissiles = [];
            for (let i = 0; i < this.missiles.length; i++) {
                let missile = this.missiles[i];
                if (missile && !missile.endCycle()) {
                    CollisionatorSingleton.remove(missile);
                    this.missiles[i] = null;
                    if (isGameActive) this.scoreboard.addPoints(this.points);
                }
                missile = this.missiles[i];
                if (missile) tempMissiles.push(missile);
            }
            this.missiles = tempMissiles.slice();
            tempMissiles = null;
        }
        if (this.explosion) {
            if (!this.explosion.endCycle()) {
                CollisionatorSingleton.remove(this.explosion);
                this.scene.remove(this.explosion.getMesh());
                this.explosion = null;
            }
        }
        if (!this.isActive && !this.explosion && !this.missiles.length) {
            return false;
        }
        return true;
    }
    /**
     * Gets the viability of the drone.
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
        return 0.15;
    }
    /**
     * Gets the current position of the collidable object.
     * @returns the array is of length 2 with x coordinate being first, and then z coordinate.
     */
    getCurrentPosition(): number[] {
        return [this.currentPoint[0], this.currentPoint[1]];
    }
    /**
     * Calculate distance 'as the crow flies' from drone to target.
     * @returns number of pixels from drone to target.
     */
    getDistanceToTarget(): number {
        // If satellite is closest, and it has the energy, this origin point won't need to be recalculated.
        const pos = this.getCurrentPosition();
        // d = sqrt{ (x2-x1)^2 + (y2-y1)^2 }
        const xStep = (this.centerPoint[0] - pos[0]) * (this.centerPoint[0] - pos[0]);
        const zStep = (this.centerPoint[1] - pos[1]) * (this.centerPoint[1] - pos[1]);
        return Math.sqrt(xStep + zStep);
    }
    /**
     * Gets the name of the drone.
     * @returns the name of the drone.
     */
    getName(): string {
        return this.drone.name;
    }
    /**
     * Called when something collides with drone, which destroys it.
     * @param self         the thing to remove from collidables...and scene.
     * @param otherThing   the name of the other thing in collision (mainly for shield).
     * @returns whether or not impact means calling removeFromScene by collisionator.
     */
    impact(self: Collidable, otherThing: string): boolean {
        if (this.isActive) {
            this.isActive = false;
            this.scene.remove(this.drone);
            CollisionatorSingleton.remove(self);
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
     * Removes missile object from the 'visible' scene by removing non-explosion parts from scene.
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     */
    removeFromScene(scene: Scene): void {
        this.isActive = false;
        this.scene.remove(this.drone);
        CollisionatorSingleton.remove(this);
    }
}

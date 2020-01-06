import {
    CircleGeometry,
    Color,
    CylinderGeometry,
    DoubleSide,
    Font,
    LinearFilter,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    Object3D,
    Scene,
    SphereGeometry,
    Texture,
    TextGeometry,
    Vector3 } from 'three';

import { Satellite } from './satellite';
import { Base } from './base';
import { Collidable } from '../collidable';
import { CollisionatorSingleton } from '../collisionator';
import { GameLoadData } from '../models/game-load-data';
import { SoundinatorSingleton } from '../soundinator';
/**
 * Simple type to represent status of all four populated areas. Cumulatively equals player's health.
 */
export interface PlanetStatus {
    quadrant1: boolean;
    quadrant2: boolean;
    quadrant3: boolean;
    quadrant4: boolean;
    sat1: boolean;
    sat2: boolean;
    sat3: boolean;
    sat4: boolean;
}
/**
 * @class
 * Planet that represents player's unit in the game. It dies, player loses.
 */
export class Planet implements Collidable {
    /**
     * Base that starts at 1/2 o'clock
     */
    private base1: Base;
    /**
     * Base that starts at 4/5 o'clock
     */
    private base2: Base;
    /**
     * Base that starts at 7/8 o'clock
     */
    private base3: Base;
    /**
     * Base that starts at 10/11 o'clock
     */
    private base4: Base;
    /**
     * Iterable list of the bases.
     */
    private bases: Base[];
    /**
     * Keeps track of proper rotation amount to avoid the weird quarter rotation reset cycle.
     */
    private currentRotation: number = 0;
    /**
     * Holds onto texture for dead planet until game over.
     */
    private deadPlanetTexture: Texture;
    /**
     * Semi-transparent circular plane to let user know where they can't fire.
     */
    private dmz: Mesh;
    /**
     * Controls size and shape of the planet
     */
    private funkGeometry: SphereGeometry;
    /**
     * Controls the color of the planet material
     */
	private funkMaterial: MeshPhongMaterial;
    /**
     * Controls the overall rendering of the planet
     */
    private funk: Mesh;
    /**
     * Local reference to the game font.
     */
    private gameFont: Font;
    /**
     * Load data to determine which satellites and buildings should start destroyed.
     */
    private gameLoadData: GameLoadData;
    /**
     * Flag to signal if player has been defeated or not.
     * True = not defeated. False = defeated.
     */
    private isActive: boolean = true;
    /**
     * Populated section of the planet. Once hit, false signifies inactive.
     */
    private quadrant1: boolean = true;
    /**
     * Populated section of the planet. Once hit, false signifies inactive.
     */
    private quadrant2: boolean = true;
    /**
     * Populated section of the planet. Once hit, false signifies inactive.
     */
    private quadrant3: boolean = true;
    /**
     * Populated section of the planet. Once hit, false signifies inactive.
     */
    private quadrant4: boolean = true;
    /**
     * Satellite that starts at 3 o'clock
     */
    private satellite1: Satellite;
    /**
     * Satellite that starts at 6 o'clock
     */
    private satellite2: Satellite;
    /**
     * Satellite that starts at 9 o'clock
     */
    private satellite3: Satellite;
    /**
     * Satellite that starts at 12 o'clock
     */
    private satellite4: Satellite;
    /**
     * Satellite array for ease of selection
     */
    private satellites: Satellite[] = [];
    /**
     * Starting position.
     */
    private startPosition: [number, number, number] = [0, 0, 0];
    /**
     * Constructor for the Planet class
     * @param startPosition allows creation of planet in a variable location (help screen mostly).
     * @param gameLoadData  game state to use from load data.
     * @param gameFont  game font used across game.
     * @hidden
     */
    constructor(startPosition: [number, number, number], gameLoadData: GameLoadData, gameFont: Font) {
        this.startPosition = startPosition;
        this.gameFont = gameFont;
        if (startPosition) {
            this.gameLoadData = gameLoadData;
        }
    }
    /**
     * Adds planet object to the three.js scene.
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     */
    addToScene(scene: Scene, planetTextures: Texture[], buildtexture: Texture[], specMap: Texture): void {
        this.constructPlanet(planetTextures, specMap);
        this.constructSatellites();
        this.constructBases(buildtexture, specMap);
        this.constructDMZ();
        scene.add(this.funk);
    }
    /**
     * Builds the four bases player must protect.
     * @param buildtexture textures for the buildings
     * @param specMap textures for the dead buildings
     */
    constructBases(buildtexture: Texture[], specMap: Texture) {
        // Build the planet's four populated bases, and
        // attach the alive and dead meshes to make orbit a simple thing.
        this.base1 = new Base(1, buildtexture[0], specMap, this.gameLoadData.b1);
        let meshes = this.base1.getMeshes();
        this.funk.add(meshes[0]);
        this.funk.add(meshes[1]);
        if (this.gameLoadData.b1) CollisionatorSingleton.add(this.base1);
        this.base2 = new Base(2, buildtexture[1], specMap, this.gameLoadData.b2);
        meshes = this.base2.getMeshes();
        this.funk.add(meshes[0]);
        this.funk.add(meshes[1]);
        if (this.gameLoadData.b2) CollisionatorSingleton.add(this.base2);
        this.base3 = new Base(3, buildtexture[2], specMap, this.gameLoadData.b3);
        meshes = this.base3.getMeshes();
        this.funk.add(meshes[0]);
        this.funk.add(meshes[1]);
        if (this.gameLoadData.b3) CollisionatorSingleton.add(this.base3);
        this.base4 = new Base(4, buildtexture[3], specMap, this.gameLoadData.b4);
        meshes = this.base4.getMeshes();
        this.funk.add(meshes[0]);
        this.funk.add(meshes[1]);
        if (this.gameLoadData.b4) CollisionatorSingleton.add(this.base4);
        this.bases = [this.base1, this.base2, this.base3, this.base4];
    }
    /**
     * Builds the DMX circle.
     */
    constructDMZ(helpVersion?: boolean, optionalBackingColor?: Color): Object3D {
        const dmzGeometry = new CircleGeometry(1.4, 32, 32);
        const dmzMaterial = new MeshBasicMaterial({
            color: new Color(0xFF0000),
            opacity: 0.08,
            side: DoubleSide,
            transparent: true});
        this.dmz = new Mesh(dmzGeometry, dmzMaterial);
        this.dmz.position.set(this.startPosition[0], this.startPosition[1] + 1.1, this.startPosition[2]);
        this.dmz.rotation.set(-1.5708, 0, 0);
        this.dmz.name = `DMZ`;
        // Inner Black Circle
        const blackGeometry = new CircleGeometry(1, 32, 32);
        const blackMaterial = new MeshBasicMaterial({
            color: optionalBackingColor || new Color(0x000000),
            opacity: 1,
            side: DoubleSide,
            transparent: false});
        const black = new Mesh(blackGeometry, blackMaterial);
        black.position.set(this.startPosition[0], this.startPosition[1] + 1.05, this.startPosition[2]);
        black.rotation.set(-1.5708, 0, 0);
        black.name = 'DMZ-Black';
        // Inner DMZ Circle
        const innerRedGeometry = new CircleGeometry(1, 32, 32);
        const innerRedMaterial = new MeshBasicMaterial({
            color: new Color(0xFF0000),
            opacity: 0.05,
            side: DoubleSide,
            transparent: true});
        const innerRed = new Mesh(innerRedGeometry, innerRedMaterial);
        innerRed.position.set(this.startPosition[0], this.startPosition[1] + 1, this.startPosition[2]);
        innerRed.rotation.set(-1.5708, 0, 0);
        innerRed.name = 'DMZ-Inner';
        // Creates and places the DMZ beads in a ring around can't-shoot-area.
        const dashedBarsBars = new Object3D();
        dashedBarsBars.name = 'DMZ-Barrier';
		const timeGeometry = new CylinderGeometry(0.01, 0.01, 0.001, 10, 10, false);
        const timeMaterial = new MeshBasicMaterial({color: 0xFF0000});
		for(let i = 0; i < 120; i++)
		{
			const minuteTick = new Mesh(timeGeometry, timeMaterial.clone());
			const x_coord = 1.4 * Math.cos( i * (Math.PI / 60) );
			const z_coord = 1.4 * Math.sin( i * (Math.PI / 60) );
			minuteTick.position.set((x_coord + this.startPosition[0]), this.startPosition[1] + 1.01, (z_coord + this.startPosition[2]));
			dashedBarsBars.add(minuteTick);
        }
        const DMZ = new Object3D();
        DMZ.add(dashedBarsBars);
        DMZ.add(this.dmz);
        DMZ.add(black);
        DMZ.add(innerRed);

        const textpParams = {
            font: this.gameFont,
            size: 0.11,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };
        const txtMaterial = new MeshLambertMaterial( {color: 0xFF0000, opacity: 1, transparent: true} );
        const textGeo = new TextGeometry('DMZ', textpParams);

        let text = new Mesh( textGeo, txtMaterial );
        text.rotation.set(-1.5708, 0, -2.3562);
        text.position.set(
            this.startPosition[0] + (1.325 * Math.cos(13 * (Math.PI / 60))),
            this.startPosition[1] + 0.75,
            this.startPosition[2] + (1.325 * Math.sin(13 * (Math.PI / 60))));
        DMZ.add(text);
        text = new Mesh( textGeo, txtMaterial );
        text.rotation.set(-1.5708, 0, -3.927);
        text.position.set(
            this.startPosition[0] + (1.325 * Math.cos(43 * (Math.PI / 60))),
            this.startPosition[1] + 0.75,
            this.startPosition[2] + (1.325 * Math.sin(43 * (Math.PI / 60))));
        DMZ.add(text);
        text = new Mesh( textGeo, txtMaterial );
        text.rotation.set(-1.5708, 0, -5.4978);
        text.position.set(
            this.startPosition[0] + (1.325 * Math.cos(73 * (Math.PI / 60))),
            this.startPosition[1] + 0.75,
            this.startPosition[2] + (1.325 * Math.sin(73 * (Math.PI / 60))));
        DMZ.add(text);
        text = new Mesh( textGeo, txtMaterial );
        text.rotation.set(-1.5708, 0, -7.0686);
        text.position.set(
            this.startPosition[0] + (1.325 * Math.cos(103 * (Math.PI / 60))),
            this.startPosition[1] + 0.75,
            this.startPosition[2] + (1.325 * Math.sin(103 * (Math.PI / 60))));
        DMZ.add(text);
        if (!helpVersion) {
            this.funk.add(DMZ);
        }
        return DMZ;
    }
    /**
     * Builds the player's planet.
     * @param planetTextures textures for the planet
     * @param specMap textures for the dead planet
     */
    constructPlanet(planetTextures: Texture[], specMap: Texture) {
        // The Planet: its water, landmasses, and textured elevations.
		this.funkGeometry = new SphereGeometry(0.5, 32, 32);
        this.funkMaterial = new MeshPhongMaterial();
        this.funkMaterial.map = planetTextures[0];
        this.funkMaterial.map.minFilter = LinearFilter;
		this.funkMaterial.bumpMap = planetTextures[1];
		this.funkMaterial.bumpMap.minFilter = LinearFilter;
        this.funkMaterial.bumpScale = 0.02;
        this.funkMaterial.specularMap = specMap;
		this.funkMaterial.specularMap.minFilter = LinearFilter;
		this.funkMaterial.specular  = new Color(0xFFFFFF);
        this.funkMaterial.shininess = 10;
        this.funk = new Mesh(this.funkGeometry, this.funkMaterial);
        this.funk.position.set(this.startPosition[0], this.startPosition[1], this.startPosition[2]);
        this.funk.rotation.set(0, -1.57079644, 0);
        this.funk.name = 'Planet';
        this.deadPlanetTexture = planetTextures[2];
    }
    /**
     * Builds the player's four defensive satellites.
     */
    constructSatellites() {
        // Build the planet's four defensive satellite weapons, and
        // attach the meshes to make orbit a simple thing.
        this.satellite1 = new Satellite(1, this.gameLoadData.sat1);
        this.satellites.push(this.satellite1);
        this.funk.add(this.satellite1.getMesh());
        if (this.gameLoadData.sat1) CollisionatorSingleton.add(this.satellite1);
        this.satellite2 = new Satellite(2, this.gameLoadData.sat2);
        this.satellites.push(this.satellite2);
        this.funk.add(this.satellite2.getMesh());
        if (this.gameLoadData.sat2) CollisionatorSingleton.add(this.satellite2);
        this.satellite3 = new Satellite(3, this.gameLoadData.sat3);
        this.satellites.push(this.satellite3);
        this.funk.add(this.satellite3.getMesh());
        if (this.gameLoadData.sat3) CollisionatorSingleton.add(this.satellite3);
        this.satellite4 = new Satellite(4, this.gameLoadData.sat4);
        this.satellites.push(this.satellite4);
        this.funk.add(this.satellite4.getMesh());
        if (this.gameLoadData.sat4) CollisionatorSingleton.add(this.satellite4);
    }
    /**
     * At the end of each loop iteration, satellite regains a little energy.
     */
    endCycle(bonus?: { base: boolean; sat: boolean; }): void {
        this.rotate();
        for (let i = 0; i < this.satellites.length; i++) {
            this.satellites[i].endCycle();
        }
        for (let j = 0; j < this.bases.length; j++) {
            this.bases[j].endCycle();
        }
        if (this.isActive) {
            this.quadrant1 = this.base1.getActive();
            this.quadrant2 = this.base2.getActive();
            this.quadrant3 = this.base3.getActive();
            this.quadrant4 = this.base4.getActive();
            this.isActive = this.quadrant1 || this.quadrant2 || this.quadrant3 || this.quadrant4;
            if (!this.isActive) {
                // Game over...Show dead planet.
                this.funkMaterial.map = this.deadPlanetTexture;
                this.funkMaterial.needsUpdate = true;
                // Game over...Blow 'em up!
                for (let i = 0; i < this.satellites.length; i++) {
                    this.satellites[i].impact(this.satellites[i]);
                }
            } else if (bonus) {
                // Determine if any satellites or bases should be rasied from the ashes.
                let baseRegen = bonus.base;
                let satRegen = bonus.sat;
                if (baseRegen) {
                    [this.quadrant1, this.quadrant2, this.quadrant3, this.quadrant4].some( (q, i) => {
                        if (!q) {
                            [this.base1, this.base2, this.base3, this.base4][i].regenerate();
                            baseRegen = false;
                            satRegen = false;
                            SoundinatorSingleton.playRegen();
                            return true;
                        }
                    });
                }
                if (satRegen || baseRegen) {
                    [
                        this.satellite1.getActive(),
                        this.satellite2.getActive(),
                        this.satellite3.getActive(),
                        this.satellite4.getActive()
                    ].some( (s, i) => {
                        if (!s) {
                            [this.satellite1, this.satellite2, this.satellite3, this.satellite4][i].regenerate();
                            SoundinatorSingleton.playRegen();
                            return true;
                        }
                    });
                }
            }
        }
    }
    /**
     * If it's determined that player wanted to fire a weapon, find closest charged satellite to click point,
     * and instruct it to launch the projectile.
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param point point with x,z coordinates where player click mouse on game area.
     */
    fire(scene: Scene, point: Vector3): void {
        if (this.isActive) {
            const distancesToTarget: number[] = [];
            for (let i = 0; i < 4; i++) {
                distancesToTarget.push(this.satellites[i].getDistanceToTarget(point));
            }
            const indexOfMinValue = distancesToTarget.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
            this.satellites[indexOfMinValue].fire(scene, point);
        }
    }
    /**
     * Gets the viability of the planet, which will always be true..
     * @returns flag to signal non-destruction. True = not destroyed. False = destroyed.
     */
    getActive(): boolean {
        return true;
    }
    /**
     * Gets the current radius of the bounding box (circle) of the collidable.
     * @returns number to represent pixel distance from object center to edge of bounding box.
     */
    getCollisionRadius(): number {
        return 0.4;
    }
    /**
     * Gets the current position of the planet.
     * @returns the array is of length 2 with x coordinate being first, and then z coordinate.
     */
    getCurrentPosition(): number[] {
        return [0, 0];
    }
    /**
     * Gets the name of the planet.
     * @returns the name of the planet.
     */
    getName(): string {
        return this.funk.name;
    }
    /**
     * Called when something collides with asteroid, which destroys it.
     * @param self the thing to remove from collidables...and scene.
     * @returns whether or not impact means removing item from the scene.
     */
    impact(self: Collidable): boolean {
        return false;
    }
    /**
     * Getter for recharge of planet shield rate.
     * @returns percentage of productivity the remaining quadrants can produce for shields.
     */
    getPowerRegenRate(): number {
        if (!this.isActive) return -5;
        let rate = 0;
        if (this.quadrant1) {
            rate += 0.25;
        }
        if (this.quadrant2) {
            rate += 0.25;
        }
        if (this.quadrant3) {
            rate += 0.25;
        }
        if (this.quadrant4) {
            rate += 0.25;
        }
        return rate;
    }
    /**
     * Getter for status of the planet's four populated quadrants. True = Alive | False = Dead.
     * @returns an object with the four color-coded quadrants representing life/death of that area.
     */
    getStatus(): PlanetStatus {
        return {
            quadrant1: this.quadrant1,
            quadrant2: this.quadrant2,
            quadrant3: this.quadrant3,
            quadrant4: this.quadrant4,
            sat1: this.base1.getActive(),
            sat2: this.base2.getActive(),
            sat3: this.base3.getActive(),
            sat4: this.base4.getActive(),
        };
    }
    /**
     * States it is a passive type or not. Two passive types cannot colllide with each other.
     * @returns True is passive | False is not passive
     */
    isPassive(): boolean {
        return true;
    }
    /**
     * Removes planet object from the three.js scene.
     */
    removeFromScene(scene: Scene): void {
        scene.remove(this.funk);
        CollisionatorSingleton.remove(this.base1);
        CollisionatorSingleton.remove(this.base2);
        CollisionatorSingleton.remove(this.base3);
        CollisionatorSingleton.remove(this.base4);
        CollisionatorSingleton.remove(this.satellite1);
        CollisionatorSingleton.remove(this.satellite2);
        CollisionatorSingleton.remove(this.satellite3);
        CollisionatorSingleton.remove(this.satellite4);
    }
    /**
     * Spins planet at its set rate.
     */
    private rotate(): void {
        const twoPi = 2 * Math.PI;
        this.currentRotation += 0.001;
        if (this.currentRotation >= twoPi) {
            this.currentRotation -= twoPi
        }
        this.funk.rotation.set(0, this.currentRotation, 0);
    }
}
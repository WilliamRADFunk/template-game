import {
    Face3,
    Geometry,
    Mesh,
    MeshBasicMaterial,
    Scene,
    Triangle,
    Vector3 } from 'three';

/**
 * Static index to help name one main thruster differenly than another.
 */
let index: number = 0;

const ORANGE: string = '#FF6800';
const RED: string = '#FFA000';
const YELLOW: string = '#FFFE00';
/**
 * @class
 * Creates and updates main thrusters.
 */
export class MainThruster {
    /**
     * Controls the overall rendering of the various flames.
     */

    private _flames: Mesh[] = [];
    /**
     * Reference to the scene, used to and and remove flames from rendering cycle once finished.
     */
    private _scene: Scene;

    /**
     * Orange color in the main thruster's flame.
     */
    private _orangeFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: ORANGE,
        opacity: 0.2,
        transparent: true
    });

    /**
     * Red color in the main thruster's flame.
     */
    private _redFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: RED,
        opacity: 0.5,
        transparent: true
    });

    /**
     * Yellow color in the main thruster's flame.
     */
    private _yellowFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: YELLOW,
        opacity: 0.8,
        transparent: true
    });

    /**
     * Constructor for the Thruster class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param position x, y, z coordinate for base of flames.
     * @hidden
     */
    constructor(scene: Scene, position: [number, number, number]) {
        this._scene = scene;
        this._createFlames(position);
    }

    /**
     * Instantiates the flames of the thruster.
     * @param position x, y, z coordinate for base of flames.
     */
    private _createFlames(position: [number, number, number]): void {
        index++;

        const geometry = new Geometry();
        const v1 = new Vector3(-0.1, 0, 0);
        const v2 = new Vector3(0.1, 0, 0);
        const v3 = new Vector3(0, 0, 0.3);

        const triangle = new Triangle( v1, v2, v3 );
        const normal = triangle.getNormal(new Vector3(1, 1, 1));

        // add new geometry based on the specified positions
        geometry.vertices.push(triangle.a);
        geometry.vertices.push(triangle.b);
        geometry.vertices.push(triangle.c);
        geometry.faces.push(new Face3(0, 2, 1, normal));

        const meshYellow = new Mesh(geometry, this._yellowFlameMaterial);
        meshYellow.position.set(position[0], position[1], position[2]);
        meshYellow.name = `flame-${index}`;
        this._flames.push(meshYellow);
        this._scene.add(meshYellow);
        meshYellow.visible = false;

        const meshRed = new Mesh(geometry, this._redFlameMaterial);
        meshRed.position.set(position[0], position[1], position[2]);
        meshRed.name = `flame-${index}`;
        this._flames.push(meshRed);
        this._scene.add(meshRed);
        meshRed.visible = false;

        const meshOrange = new Mesh(geometry, this._orangeFlameMaterial);
        meshOrange.position.set(position[0], position[1], position[2]);
        meshOrange.name = `flame-${index}`;
        this._flames.push(meshOrange);
        this._scene.add(meshOrange);
        meshOrange.visible = false;
    }

    public dispose():void {
        this._flames.forEach(flame => flame && this._scene.remove(flame));
        this._flames.length = 0;
    }

    /**
     * At the end of each loop iteration, rotate each flame color's opacity a little.
     * @returns boolean that means very little neither true or false will have any meaning.
     */
    public endCycle(position: [number, number, number], isBurning?: boolean): void {
        if (isBurning) {
            if (!this._flames[0].visible) {
                this._flames.forEach(flame => {
                    flame.visible = true;
                    flame.updateMatrix();
                });
            }
            this._flames.forEach(flame => {
                const currOpacity = (flame.material as MeshBasicMaterial).opacity;
                if (currOpacity <= 0.1) {
                    (flame.material as MeshBasicMaterial).opacity = 0.8;
                } else {
                    (flame.material as MeshBasicMaterial).opacity = currOpacity - 0.05;
                }
            });
        } else {
            if (this._flames[0].visible) {
                this._flames.forEach(flame => {
                    flame.visible = false;
                    flame.updateMatrix();
                });
            }
        }
        this._flames.forEach(flame => flame.position.set(position[0], position[1], position[2]));
    }
}
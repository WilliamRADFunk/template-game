import {
    Face3,
    Geometry,
    Mesh,
    MeshBasicMaterial,
    Scene,
    Triangle,
    Vector3,
    CircleGeometry} from 'three';

import { SOUNDS_CTRL } from '../../../controls/controllers/sounds-controller';

const ORANGE: string = '#FF6800';
const RED: string = '#FF0000';
const YELLOW: string = '#FFFE00';
/**
 * @class
 * Creates and updates main thrusters.
 */
export class CircularThruster {
    /**
     * Controls the overall rendering of the various flames.
     */

    private _flames: Mesh[] = [];

    /**
     * Reference to the scene, used to and and remove flames from rendering cycle once finished.
     */
    private _scene: Scene;

    /**
     * Blue color in the main thruster's flame.
     */
    private _orangeFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: ORANGE,
        opacity: 0.5,
        transparent: true
    });

    /**
     * White color in the main thruster's flame.
     */
    private _redFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: RED,
        opacity: 0.2,
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
        const geo = new CircleGeometry(0.75, 32);

        const meshYellow = new Mesh(geo, this._yellowFlameMaterial);
        meshYellow.position.set(position[0], position[1], position[2]);
        meshYellow.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshYellow);
        this._scene.add(meshYellow);
        meshYellow.visible = false;

        const meshOrange = new Mesh(geo, this._orangeFlameMaterial);
        meshOrange.position.set(position[0], position[1], position[2]);
        meshOrange.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshOrange);
        this._scene.add(meshOrange);
        meshOrange.visible = false;

        const meshRed = new Mesh(geo, this._redFlameMaterial);
        meshRed.position.set(position[0], position[1], position[2]);
        meshRed.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshRed);
        this._scene.add(meshRed);
        meshRed.visible = false;
    }

    public dispose(): void {
        this._flames.forEach(flame => flame && this._scene.remove(flame));
        this._flames.length = 0;
    }

    /**
     * At the end of each loop iteration, rotate each flame color's opacity a little.
     * @param position x, y, z coordinate for base of flames.
     * @param scaleMod amount to add or remove from scale.
     * @param isBurning whether or not the flames are visible in this frame.
     * @returns boolean that means very little neither true or false will have any meaning.
     */
    public endCycle(position: [number, number, number], scaleMod: number, isBurning?: boolean): void {
        if (isBurning) {
            if (!this._flames[0].visible) {
                this._flames.forEach(flame => {
                    const currScale = flame.scale;
                    flame.scale.set(currScale.x + scaleMod, currScale.y + scaleMod, currScale.z + scaleMod);
                    flame.visible = true;
                    flame.updateMatrix();
                    SOUNDS_CTRL.playMainThrusterSmall();
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
        } else if (this._flames[0].visible) {
            this._flames.forEach(flame => {
                flame.visible = false;
                flame.updateMatrix();
                SOUNDS_CTRL.stopMainThrusterSmall();
            });
        }
        this._flames.forEach(flame => flame.position.set(position[0], position[1], position[2]));
    }
}
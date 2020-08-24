import {
    Mesh,
    MeshBasicMaterial,
    Scene,
    CircleGeometry} from 'three';

import { SOUNDS_CTRL } from '../../../controls/controllers/sounds-controller';

const POSITION_MODS: [number, number][] = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0.05, 0.05],
    [-0.05, -0.05],
    [0.05, -0.05],
    [-0.05, 0.05],
    [-0.075, 0.05],
    [-0.05, 0.075]
];

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
        meshYellow.position.set(position[0] + POSITION_MODS[0][0], position[1], position[2] + POSITION_MODS[0][1]);
        meshYellow.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshYellow);
        this._scene.add(meshYellow);
        meshYellow.visible = false;

        const meshOrange = new Mesh(geo, this._orangeFlameMaterial);
        meshOrange.position.set(position[0] + POSITION_MODS[1][0], position[1], position[2] + POSITION_MODS[1][1]);
        meshOrange.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshOrange);
        this._scene.add(meshOrange);
        meshOrange.visible = false;

        const meshRed = new Mesh(geo, this._redFlameMaterial);
        meshRed.position.set(position[0] + POSITION_MODS[2][0], position[1], position[2] + POSITION_MODS[2][1]);
        meshRed.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshRed);
        this._scene.add(meshRed);
        meshRed.visible = false;

        const meshYellow2 = new Mesh(geo, this._yellowFlameMaterial);
        meshYellow2.position.set(position[0] + POSITION_MODS[3][0], position[1], position[2] + POSITION_MODS[3][1]);
        meshYellow2.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshYellow2);
        this._scene.add(meshYellow2);
        meshYellow2.visible = false;

        const meshOrange2 = new Mesh(geo, this._orangeFlameMaterial);
        meshOrange2.position.set(position[0] + POSITION_MODS[4][0], position[1], position[2] + POSITION_MODS[4][1]);
        meshOrange2.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshOrange2);
        this._scene.add(meshOrange2);
        meshOrange2.visible = false;

        const meshRed2 = new Mesh(geo, this._redFlameMaterial);
        meshRed2.position.set(position[0] + POSITION_MODS[5][0], position[1], position[2] + POSITION_MODS[5][1]);
        meshRed2.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshRed2);
        this._scene.add(meshRed2);
        meshRed2.visible = false;

        const meshYellow3 = new Mesh(geo, this._yellowFlameMaterial);
        meshYellow3.position.set(position[0] + POSITION_MODS[6][0], position[1], position[2] + POSITION_MODS[6][1]);
        meshYellow3.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshYellow3);
        this._scene.add(meshYellow3);
        meshYellow3.visible = false;

        const meshOrange3 = new Mesh(geo, this._orangeFlameMaterial);
        meshOrange3.position.set(position[0] + POSITION_MODS[7][0], position[1], position[2] + POSITION_MODS[7][1]);
        meshOrange3.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshOrange3);
        this._scene.add(meshOrange3);
        meshOrange3.visible = false;

        const meshRed3 = new Mesh(geo, this._redFlameMaterial);
        meshRed3.position.set(position[0] + POSITION_MODS[8][0], position[1], position[2] + POSITION_MODS[8][1]);
        meshRed3.rotation.set(-1.5708, 0, 0);
        this._flames.push(meshRed3);
        this._scene.add(meshRed3);
        meshRed3.visible = false;
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
                    flame.visible = true;
                    flame.updateMatrix();
                    SOUNDS_CTRL.playMainThrusterSmall();
                });
            }
            this._flames.forEach(flame => {
                const currScale = flame.scale;
                flame.scale.set(currScale.x + scaleMod, currScale.y + scaleMod, currScale.z + scaleMod);
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
        this._flames.forEach((flame, index) => {
            flame.position.set(position[0] + POSITION_MODS[index][0], position[1], position[2] + POSITION_MODS[index][1]);
        });
    }
}
import {
    Mesh,
    MeshBasicMaterial,
    Scene,
    PlaneGeometry,
    Object3D} from 'three';

import { SOUNDS_CTRL } from '../../../controls/controllers/sounds-controller';

const POSITION_MODS: [number, number][] = [
    [-0.35, -0.35],
    [0.35, -0.35],
    [-0.35, 0.35],
    [0.35, 0.35],
];

const WHITE: string = '#FFFFFF';
const CYAN: string = '#00FFFF';
const BLUE: string = '#0000FF';
/**
 * @class
 * Creates and updates main thrusters.
 */
export class Teleporters {
    /**
     * Controls the overall rendering of the various flames.
     */

    private _teleporters: Mesh[][] = [];

    /**
     * Reference to the scene, used to and and remove flames from rendering cycle once finished.
     */
    private _scene: Scene;

    /**
     * Blue color in the main thruster's flame.
     */
    private _whiteFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: WHITE,
        opacity: 0.5,
        transparent: true
    });

    /**
     * White color in the main thruster's flame.
     */
    private _cyanFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: CYAN,
        opacity: 0.2,
        transparent: true
    });

    /**
     * Yellow color in the main thruster's flame.
     */
    private _blueFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: BLUE,
        opacity: 0.8,
        transparent: true
    });

    /**
     * Constructor for the Thruster class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param position x, y, z coordinate for base of flames.
     * @hidden
     */
    constructor(scene: Scene, positions: [number, number, number][]) {
        this._scene = scene;
        for (let i = 0; i < positions.length; i++) {
            this._teleporters[i] = [];
        }
        positions.forEach((position, index) => this._createTeleporterEffects(position, index));
    }

    /**
     * Instantiates the flames of the thruster.
     * @param position x, y, z coordinate for base of flames.
     */
    private _createTeleporterEffects(position: [number, number, number], index: number): void {
        const geo = new PlaneGeometry(0.4, 0.1, 10, 10);

        const meshWhite = new Mesh(geo, this._whiteFlameMaterial);
        meshWhite.position.set(position[0], position[1], position[2]);
        meshWhite.rotation.set(-1.5708, 0, 0);
        this._teleporters[index].push(meshWhite);

        const meshBlue = new Mesh(geo, this._blueFlameMaterial);
        meshBlue.position.set(position[0], position[1], position[2] - 0.1);
        meshBlue.rotation.set(-1.5708, 0, 0);
        this._teleporters[index].push(meshBlue);

        const meshCyan = new Mesh(geo, this._cyanFlameMaterial);
        meshCyan.position.set(position[0], position[1], position[2] + 0.1);
        meshCyan.rotation.set(-1.5708, 0, 0);
        this._teleporters[index].push(meshCyan);

        meshWhite.visible = false;
        meshBlue.visible = false;
        meshCyan.visible = false;
        this._scene.add(meshWhite);
        this._scene.add(meshBlue);
        this._scene.add(meshCyan);
    }

    public dispose(): void {
        this._teleporters.forEach(teleporter => {
            teleporter && teleporter.forEach(teleMesh => teleMesh && this._scene.remove(teleMesh));
        });
        this._teleporters.length = 0;
    }

    /**
     * At the end of each loop iteration, rotate each flame color's opacity a little.
     * @param isVisible whether or not the teleporter effects are visible in this frame.
     * @returns boolean that means very little neither true or false will have any meaning.
     */
    public endCycle(isVisible?: boolean): void {
        if (isVisible) {
            if (!this._teleporters[0][0].visible) {
                this._teleporters.forEach(teleporter => {
                    teleporter.forEach(teleMesh => {
                        teleMesh.visible = true;
                        teleMesh.updateMatrix();
                        // SOUNDS_CTRL.playTeleporter();
                    });
                });
            }
            this._teleporters.forEach(teleporter => {
                    teleporter.forEach((teleMesh: Mesh) => {
                    const currOpacity = (teleMesh.material as MeshBasicMaterial).opacity;
                    if (currOpacity <= 0.1) {
                        (teleMesh.material as MeshBasicMaterial).opacity = 0.8;
                    } else {
                        (teleMesh.material as MeshBasicMaterial).opacity = currOpacity - 0.05;
                    }
                    teleMesh.updateMatrix();
                });
            });
            this._teleporters.forEach(teleporter => {
                teleporter.forEach((teleMesh: Mesh, index: number) => {
                    const currRot = teleMesh.rotation;
                    teleMesh.rotation.set(currRot.x, currRot.y + (index * 0.01), currRot.z);
                    teleMesh.updateMatrix();
                });
            });
        } else if (this._teleporters[0][0].visible) {
            this._teleporters.forEach(teleporter => {
                teleporter.forEach(teleMesh => {
                    teleMesh.visible = false;
                    teleMesh.updateMatrix();
                    // SOUNDS_CTRL.stopTeleporter();
                });
            });
        }
    }
}
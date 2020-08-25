import {
    Mesh,
    MeshBasicMaterial,
    Scene,
    CircleGeometry,
    Object3D} from 'three';

import { SOUNDS_CTRL } from '../../../controls/controllers/sounds-controller';

const POSITION_MODS: [number, number][] = [
    [-0.3, -0.3],
    [0.3, -0.3],
    [-0.3, 0.3],
    [0.3, 0.3],
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

    private _flames: Object3D[] = [];

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
        const geo = new CircleGeometry(0.25, 32);

        const yellowFlames = new Object3D();
        const orangeFlames = new Object3D();
        const redFlames = new Object3D();

        const meshYellow = new Mesh(geo, this._yellowFlameMaterial);
        meshYellow.position.set(position[0] + POSITION_MODS[0][0], position[1], position[2] + POSITION_MODS[0][1]);
        meshYellow.rotation.set(-1.5708, 0, 0);
        yellowFlames.add(meshYellow);

        const meshYellow2 = new Mesh(geo, this._yellowFlameMaterial);
        meshYellow2.position.set(position[0] + POSITION_MODS[1][0], position[1], position[2] + POSITION_MODS[1][1]);
        meshYellow2.rotation.set(-1.5708, 0, 0);
        yellowFlames.add(meshYellow2);

        const meshYellow3 = new Mesh(geo, this._yellowFlameMaterial);
        meshYellow3.position.set(position[0] + POSITION_MODS[2][0], position[1], position[2] + POSITION_MODS[2][1]);
        meshYellow3.rotation.set(-1.5708, 0, 0);
        yellowFlames.add(meshYellow3);

        const meshYellow4 = new Mesh(geo, this._yellowFlameMaterial);
        meshYellow4.position.set(position[0] + POSITION_MODS[3][0], position[1], position[2] + POSITION_MODS[3][1]);
        meshYellow4.rotation.set(-1.5708, 0, 0);
        yellowFlames.add(meshYellow4);

        const meshOrange = new Mesh(geo, this._yellowFlameMaterial);
        meshOrange.position.set(position[0] + POSITION_MODS[0][0], position[1], position[2] + POSITION_MODS[0][1]);
        meshOrange.rotation.set(-1.5708, 0, 0);
        orangeFlames.add(meshOrange);

        const meshOrange2 = new Mesh(geo, this._yellowFlameMaterial);
        meshOrange2.position.set(position[0] + POSITION_MODS[1][0], position[1], position[2] + POSITION_MODS[1][1]);
        meshOrange2.rotation.set(-1.5708, 0, 0);
        orangeFlames.add(meshOrange2);

        const meshOrange3 = new Mesh(geo, this._yellowFlameMaterial);
        meshOrange3.position.set(position[0] + POSITION_MODS[2][0], position[1], position[2] + POSITION_MODS[2][1]);
        meshOrange3.rotation.set(-1.5708, 0, 0);
        orangeFlames.add(meshOrange3);

        const meshOrange4 = new Mesh(geo, this._yellowFlameMaterial);
        meshOrange4.position.set(position[0] + POSITION_MODS[3][0], position[1], position[2] + POSITION_MODS[3][1]);
        meshOrange4.rotation.set(-1.5708, 0, 0);
        orangeFlames.add(meshOrange4);

        const meshRed = new Mesh(geo, this._yellowFlameMaterial);
        meshRed.position.set(position[0] + POSITION_MODS[0][0], position[1], position[2] + POSITION_MODS[0][1]);
        meshRed.rotation.set(-1.5708, 0, 0);
        redFlames.add(meshRed);

        const meshRed2 = new Mesh(geo, this._yellowFlameMaterial);
        meshRed2.position.set(position[0] + POSITION_MODS[1][0], position[1], position[2] + POSITION_MODS[1][1]);
        meshRed2.rotation.set(-1.5708, 0, 0);
        redFlames.add(meshRed2);

        const meshRed3 = new Mesh(geo, this._yellowFlameMaterial);
        meshRed3.position.set(position[0] + POSITION_MODS[2][0], position[1], position[2] + POSITION_MODS[2][1]);
        meshRed3.rotation.set(-1.5708, 0, 0);
        redFlames.add(meshRed3);

        const meshRed4 = new Mesh(geo, this._yellowFlameMaterial);
        meshRed4.position.set(position[0] + POSITION_MODS[3][0], position[1], position[2] + POSITION_MODS[3][1]);
        meshRed4.rotation.set(-1.5708, 0, 0);
        redFlames.add(meshRed4);

        this._flames.push(yellowFlames);
        this._flames.push(orangeFlames);
        this._flames.push(redFlames);
        yellowFlames.visible = false;
        orangeFlames.visible = false;
        redFlames.visible = false;
        this._scene.add(yellowFlames);
        this._scene.add(orangeFlames);
        this._scene.add(redFlames);
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
            this._flames.forEach(flameGroup => {
                flameGroup.children.forEach((flame: Mesh) => {
                    if (flame.isMesh) {
                        console.log('isMesh');
                        const currScale = flame.scale;
                        flame.scale.set(currScale.x + scaleMod, currScale.y + scaleMod, currScale.z + scaleMod);
                        const currOpacity = (flame.material as MeshBasicMaterial).opacity;
                        if (currOpacity <= 0.1) {
                            (flame.material as MeshBasicMaterial).opacity = 0.8;
                        } else {
                            (flame.material as MeshBasicMaterial).opacity = currOpacity - 0.05;
                        }
                        flame.updateMatrix();
                    }
                });
            });
        } else if (this._flames[0].visible) {
            this._flames.forEach(flame => {
                flame.visible = false;
                flame.updateMatrix();
                SOUNDS_CTRL.stopMainThrusterSmall();
            });
        }
        this._flames.forEach((flame, index) => {
            flame.position.set(0, position[1], 0);
            flame.updateMatrix();
        });
    }
}
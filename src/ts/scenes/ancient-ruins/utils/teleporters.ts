import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    NearestFilter,
    PlaneGeometry,
    RepeatWrapping,
    Scene,
    Vector2 } from 'three';

import { SOUNDS_CTRL } from '../../../controls/controllers/sounds-controller';
import { ASSETS_CTRL } from '../../../controls/controllers/assets-controller';
import { RAD_90_DEG_LEFT } from './radians-x-degrees-left';


export const spriteMapCols = 16;
export const spriteMapRows = 4;
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
        const geo = new PlaneGeometry( 0.40, 0.40, 10, 10 );
        for (let i = 0; i < 60; i++) {
            const col = i % 16;
            const row = Math.abs(Math.floor(i / 16) - 3);
            const size = [spriteMapCols, spriteMapRows];

            const material: MeshBasicMaterial = new MeshBasicMaterial({
                color: 0xFFFFFF,
                map: ASSETS_CTRL.textures.spriteMapTeleporterEffects.clone(),
                side: DoubleSide,
                transparent: true
            });

            material.map.offset = new Vector2(
                (1 / size[0]) * col,
                (1 / size[1]) * row);

            material.map.repeat = new Vector2(
                (1 / size[0]),
                (1 / size[1]));

            material.map.magFilter = NearestFilter;
            material.map.minFilter = NearestFilter;
            material.map.wrapS = RepeatWrapping;
            material.map.wrapT = RepeatWrapping;

            material.depthTest = false;
            material.map.needsUpdate = true;

            const teleporterEffect = new Mesh( geo, material.clone() );
            teleporterEffect.matrixAutoUpdate = false;
            teleporterEffect.rotation.set(RAD_90_DEG_LEFT, 0, 0);
            teleporterEffect.visible = false;
            teleporterEffect.updateMatrix();
            this._scene.add(teleporterEffect);
        }
    }

    /**
     * Handles all cleanup responsibility for instance before it's destroyed.
     */
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
import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    NearestFilter,
    PlaneGeometry,
    ClampToEdgeWrapping,
    Scene,
    Vector2 } from 'three';

import { ASSETS_CTRL } from '../../../controls/controllers/assets-controller';
import { RAD_90_DEG_LEFT } from './radians-x-degrees-left';


export const spriteMapCols = 8;
export const spriteMapRows = 8;
/**
 * @class
 * Creates and updates main thrusters.
 */
export class SpecialTile {
    /**
     * Reference to the glowing blue orb effect mesh index (aka current frame in the animation sequence).
     */
    private _currIndex: number = 0;

    /**
     * Flag to track if the frames were already set to false last iteration.
     */
    private _isOff: boolean = true;

    /**
     * Materials for the glowing blue orb effect frames.
     */
    private _materials: MeshBasicMaterial[] = [];

    /**
     * Total number of available frames/meshes in the animation sequence.
     */
    private _maxIndex: number = 59;

    /**
     * Reference to the scene, used to and and remove flames from rendering cycle once finished.
     */
    private _scene: Scene;

    /**
     * Controls the overall rendering of the various flames.
     */
    private _blueOrbs: { meshes: Mesh[]; visible: boolean; }[] = [];

    /**
     * Constructor for the Thruster class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param position x, y, z coordinate for base of flames.
     * @hidden
     */
    constructor(scene: Scene, positions: [number, number, number][]) {
        this._scene = scene;
        this._createSpecialTileEffectMaterials();
        positions.forEach((position, index) => {
            this._blueOrbs[index] = {
                meshes: [],
                visible: true,
            };
            this._blueOrbs[index].meshes = this._createSpecialTileEffects(position, index);
        });
    }

    private _createSpecialTileEffectMaterials(): void {
        for (let i = 7; i > 2; i--) {
            for (let j = 0; (j < 2 && i === 3) || (j < 5 && i > 3); j++) {
                const col = j;
                const row = i;
                const size = [spriteMapCols, spriteMapRows];

                const material: MeshBasicMaterial = new MeshBasicMaterial({
                    color: 0xFFFFFF,
                    map: ASSETS_CTRL.textures.spriteMapGlowingBlueOrb.clone(),
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
                material.map.wrapS = ClampToEdgeWrapping;
                material.map.wrapT = ClampToEdgeWrapping;

                material.depthTest = false;
                material.map.needsUpdate = true;

                this._materials.push(material);
            }
        }
        this._maxIndex = this._materials.length - 1;
    }

    /**
     * Instantiates the blue sphere.
     * @param position x, y, z coordinate for base of flames.
     */
    private _createSpecialTileEffects(position: [number, number, number], index: number): Mesh[] {
        const meshes: Mesh[] = [];
        const geo = new PlaneGeometry( 0.3, 0.3, 10, 10 );
        for (let i = 0; i < this._materials.length; i++) {
            const specialTileEffect = new Mesh( geo, this._materials[i].clone() );
            specialTileEffect.matrixAutoUpdate = false;
            specialTileEffect.position.set(position[0], position[1], position[2]);
            specialTileEffect.rotation.set(RAD_90_DEG_LEFT, 0, 0);
            specialTileEffect.visible = false;
            specialTileEffect.updateMatrix();
            meshes.push(specialTileEffect);
            this._scene.add(specialTileEffect);
        }
        return meshes;
    }

    /**
     * Handles all cleanup responsibility for instance before it's destroyed.
     */
    public dispose(): void {
        this._blueOrbs.forEach(orb => {
            orb && orb.meshes.forEach(orbMesh => orbMesh && this._scene.remove(orbMesh));
        });
        this._blueOrbs.length = 0;
    }

    /**
     * At the end of each loop iteration, rotate each flame color's opacity a little.
     * @param isVisible whether or not the special tile effects are visible in this frame.
     * @returns boolean that means very little neither true or false will have any meaning.
     */
    public endCycle(isVisible?: boolean): void {
        if (isVisible) {
            this._isOff = false;
            if (!this._currIndex || this._currIndex > this._maxIndex) {
                this._currIndex = 0;
                this._blueOrbs.forEach(blueOrb => {
                    blueOrb.meshes[this._maxIndex].visible = false;
                    blueOrb.meshes[this._maxIndex].updateMatrix();
                    blueOrb.meshes[0].visible = true;
                    blueOrb.meshes[0].updateMatrix();
                });
            } else {
                this._blueOrbs.forEach(blueOrb => {
                    blueOrb.meshes[this._currIndex - 1].visible = false;
                    blueOrb.meshes[this._currIndex - 1].updateMatrix();
                    blueOrb.meshes[this._currIndex].visible = true;
                    blueOrb.meshes[this._currIndex].updateMatrix();
                });
            }
            this._currIndex++;
        } else if (!isVisible && !this._isOff) {
            this._isOff = true;
            this._blueOrbs.forEach(blueOrb => {
                blueOrb.meshes.forEach(orbMesh => {
                    orbMesh.visible = false;
                    orbMesh.updateMatrix();
                });
            });
        }
    }
}
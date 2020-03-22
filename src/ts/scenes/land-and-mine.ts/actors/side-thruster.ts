import {
    CircleGeometry,
    DoubleSide,
    Face3,
    Geometry,
    Mesh,
    MeshBasicMaterial,
    Scene,
    Triangle,
    Vector3 } from 'three';

/**
 * Static index to help name one side thruster differenly than another.
 */
let index: number = 0;

const WHITE: string = '#FFFFFF';
const LIGHT_GREY: string = '#CCCCCC';
const DARK_GREY: string = '#333333';
/**
 * @class
 * Creates and updates side thrusters.
 */
export class SideThruster {
    /**
     * 1 === right thruster orientation, -1 == left thruster orientation.
     */
    private _invert: number;

    /**
     * Controls the overall rendering of the various plumes.
     */
    private _plumes: Mesh[] = [];

    /**
     * Controls the overall rendering of the various puffs.
     */
    private _puffs: Mesh[] = [];

    /**
     * Reference to the scene, used to and and remove plumes from rendering cycle once finished.
     */
    private _scene: Scene;

    /**
     * White color in the side thruster's plume.
     */
    private _whiteFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: WHITE,
        opacity: 0.2,
        transparent: true,
        side: DoubleSide
    });

    /**
     * Light grey color in the side thruster's plume.
     */
    private _lightGreyFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: LIGHT_GREY,
        opacity: 0.5,
        transparent: true,
        side: DoubleSide
    });

    /**
     * Dark grey color in the side thruster's plume.
     */
    private _darkGreyFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: DARK_GREY,
        opacity: 0.8,
        transparent: true,
        side: DoubleSide
    });

    /**
     * Constructor for the Thruster class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param position x, y, z coordinate for base of plumes.
     * @param invert 1 === right thruster orientation, -1 == left thruster orientation.
     * @hidden
     */
    constructor(scene: Scene, position: [number, number, number], invert?: number) {
        this._scene = scene;
        this._invert = invert || 1;
        this._createPlumes(position);
    }

    /**
     * Instantiates the plumes of the thruster.
     * @param position x, y, z coordinate for base of plumes.
     */
    private _createPlumes(position: [number, number, number]): void {
        index++;

        const geometry = new Geometry();
        const v1 = new Vector3(this._invert * 0.4, 0, this._invert * 0.04);
        const v2 = new Vector3(0, 0, 0);
        const v3 = new Vector3(this._invert * 0.4, 0, -0.04 * this._invert);

        const triangle = new Triangle( v1, v2, v3 );
        const normal = triangle.getNormal(new Vector3(0, 1, 0));

        // add new geometry based on the specified positions
        geometry.vertices.push(triangle.a);
        geometry.vertices.push(triangle.b);
        geometry.vertices.push(triangle.c);
        geometry.faces.push(new Face3(0, 2, 1, normal));

        const meshWhite = new Mesh(geometry, this._whiteFlameMaterial);
        meshWhite.position.set(position[0], position[1], position[2]);
        meshWhite.name = `white-plume-${index}`;
        this._plumes.push(meshWhite);
        this._scene.add(meshWhite);
        meshWhite.visible = false;

        const meshLightGrey = new Mesh(geometry, this._lightGreyFlameMaterial);
        meshLightGrey.position.set(position[0], position[1], position[2]);
        meshLightGrey.name = `light-grey-plume-${index}`;
        this._plumes.push(meshLightGrey);
        this._scene.add(meshLightGrey);
        meshLightGrey.visible = false;

        const meshDarkGrey = new Mesh(geometry, this._darkGreyFlameMaterial);
        meshDarkGrey.position.set(position[0], position[1], position[2]);
        meshDarkGrey.name = `dark-grey-plume-${index}`;
        this._plumes.push(meshDarkGrey);
        this._scene.add(meshDarkGrey);
        meshDarkGrey.visible = false;

        const circleGeometry = new CircleGeometry(0.05, 48, 48);

        const middlePuff = new Mesh( circleGeometry, this._whiteFlameMaterial );
        middlePuff.name = `middle-puff-${index}`;
        middlePuff.position.set(position[0] + (this._invert * 0.45), position[1], position[2]);
        middlePuff.rotation.set(1.5708, 0, 0);
        this._puffs.push(middlePuff);
        this._scene.add(middlePuff);
        middlePuff.visible = false;

        const bottomPuff = new Mesh( circleGeometry, this._whiteFlameMaterial );
        bottomPuff.name = `bottom-puff-${index}`;
        bottomPuff.position.set(position[0] + (this._invert * 0.4), position[1], position[2] + 0.05);
        bottomPuff.rotation.set(1.5708, 0, 0);
        this._puffs.push(bottomPuff);
        this._scene.add(bottomPuff);
        bottomPuff.visible = false;

        const topPuff = new Mesh( circleGeometry, this._whiteFlameMaterial );
        topPuff.name = `top-puff-${index}`;
        topPuff.position.set(position[0] + (this._invert * 0.4), position[1], position[2] - 0.05);
        topPuff.rotation.set(1.5708, 0, 0);
        this._puffs.push(topPuff);
        this._scene.add(topPuff);
        topPuff.visible = false;
    }

    /**
     * At the end of each loop iteration, rotate each plume color's opacity a little.
     * @returns boolean that means very little neither true or false will have any meaning.
     */
    endCycle(position: [number, number, number], isBurning?: boolean): void {
        if (isBurning) {
            if (!this._plumes[0].visible) {
                this._plumes.forEach(plume => {
                    plume.visible = true;
                    plume.updateMatrix();
                });
                this._puffs.forEach(puff => {
                    puff.visible = true;
                    puff.updateMatrix();
                });
            }
            this._plumes.forEach(plume => {
                const currOpacity = (plume.material as MeshBasicMaterial).opacity;
                if (currOpacity <= 0.1) {
                    (plume.material as MeshBasicMaterial).opacity = 0.8;
                } else {
                    (plume.material as MeshBasicMaterial).opacity = currOpacity - 0.05;
                }
            });
        } else {
            if (this._plumes[0].visible) {
                this._plumes.forEach(plume => {
                    plume.visible = false;
                    plume.updateMatrix();
                });
                this._puffs.forEach(puff => {
                    puff.visible = false;
                    puff.updateMatrix();
                });
            }
        }
        this._plumes.forEach(plume => plume.position.set(position[0], position[1], position[2]));
        this._puffs[0].position.set(position[0] + (this._invert * 0.45), position[1], position[2]);
        this._puffs[1].position.set(position[0] + (this._invert * 0.4), position[1], position[2] + 0.05);
        this._puffs[2].position.set(position[0] + (this._invert * 0.4), position[1], position[2] - 0.05);
    }
}
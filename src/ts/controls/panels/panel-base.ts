import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene } from "three";

/**
 * @class
 * Creates the necessary pieces for text panels.
 */
export class PanelBase {
    /**
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private _scene: Scene;

    /**
     * Constructor for the Dev Menu class
     * @param id id of the given panel.
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param innerWidth width of the internal rectangle.
     * @param outerWidth width of the outer, glowing rectangle.
     * @param height height of the outer, glowing rectangle.
     * @param x x coordinate of the center point for both rectangles.
     * @param z z coordinate of the center point for both rectangles.
     * @hidden
     */
    constructor(
        id: string,
        scene: Scene,
        innerWidth: number,
        outerWidth: number,
        height: number,
        x: number,
        z: number
    ) {
        this._scene = scene;
        let textBoxMaterial = new MeshBasicMaterial({
            color: 0xFFFFFF,
            opacity: 0.6,
            transparent: true,
            side: DoubleSide
        });

        let textBoxGeometry = new PlaneGeometry( outerWidth, height, 10, 10 );
        let barrier = new Mesh( textBoxGeometry, textBoxMaterial );
        barrier.name = `${id} - Outter Box`;
        barrier.position.set(x, 15, z);
        barrier.rotation.set(1.5708, 0, 0);
        scene.add(barrier);

        textBoxMaterial = new MeshBasicMaterial({
            color: 0x000000,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        textBoxGeometry = new PlaneGeometry( innerWidth, height - 0.2, 10, 10 );
        barrier = new Mesh( textBoxGeometry, textBoxMaterial );
        barrier.name = `${id} - Inner Box`;
        barrier.position.set(x, 10, z);
        barrier.rotation.set(1.5708, 0, 0);
        scene.add(barrier);
    }

    public dispose() {
        this._scene.remove();
    }
}
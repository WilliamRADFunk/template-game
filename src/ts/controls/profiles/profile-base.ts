import {
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Scene,
    Texture } from "three";
import { createActor } from "../../utils/create-actor";
import { Actor } from "../../models/actor";

/**
 * @class
 * Creates a profile image in the upper right box.
 */
export class ProfileBase {
    /**
     * The created profile actor/image.
     */
    private readonly _scene: Scene;

    /**
     * The created profile actor/image.
     */
    public readonly profile: Actor;

    /**
     * Constructor for the Right Top Profile class.
     * @param scene scene into which the profile should be added.
     * @param texture texture for the engineer's image.
     * @param position x, z location of the profile image.
     * @param size height and width of the profile rectangle.
     */
    constructor(
        scene: Scene,
        actor: Actor,
        texture: Texture,
        position: [number, number],
        size: { height: number; width: number }
    ) {
        this._scene = scene;
        this.profile = actor;
        this.profile.originalStartingPoint = [position[0], position[1]];
        this.profile.currentPoint = [position[0], position[1]];
        this.profile.endingPoint = [position[0], position[1]];
        this.profile.geometry = new PlaneGeometry(size.width, size.height, 96, 96);
        this.profile.material = new MeshPhongMaterial();
        this.profile.material.map = texture;
        this.profile.material.map.minFilter = LinearFilter;
        (this.profile.material as any).shininess = 0;
        this.profile.material.transparent = true;
        this.profile.mesh = new Mesh(this.profile.geometry, this.profile.material);
        this.profile.mesh.position.set(this.profile.currentPoint[0], 5, this.profile.currentPoint[1]);
        this.profile.mesh.rotation.set(-Math.PI / 2, 0, 0);
        this._scene.add(this.profile.mesh);
    }

    /**
     * Hides the profile from visibility.
     */
    public hide(): void {
        this.profile.mesh.visible = false;
    }

    /**
     * Renders the profile from visible.
     */
    public show(): void {
        this.profile.mesh.visible = true;
    }
}
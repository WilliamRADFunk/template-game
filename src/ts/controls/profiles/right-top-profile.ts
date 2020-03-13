import { Scene, Texture } from "three";
import { ProfileBase } from "./profile-base";
import { createActor } from "../../utils/create-actor";

/**
 * @class
 * Creates a profile image in the upper right box.
 */
export class RightTopProfile extends ProfileBase {
    /**
     * Constructor for the Right Top Profile class.
     * @param scene scene into which the profile should be added.
     * @param texture texture for the profile's image.
     */
    constructor(scene: Scene, texture: Texture) {
        super(scene, createActor(), texture, [4.465, -4.45], { height: 2.90, width: 2.78 });
        this.profile.mesh.name = 'Right Top Profile';
    }
}
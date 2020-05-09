import { Scene, Texture } from "three";
import { ProfileBase } from "./profile-base";
import { createActor } from "../../utils/create-actor";

/**
 * @class
 * Creates a profile image in the lower right box.
 */
export class RightBottomProfile extends ProfileBase {
    /**
     * Constructor for the Right Bottom Profile class.
     * @param scene scene into which the profile should be added.
     * @param texture texture for the profile's image.
     * @param titledVersion flag to adjust size for title.
     */
    constructor(scene: Scene, texture: Texture, titledVersion: boolean) {
        super(scene, createActor(), texture, [4.465, 4.45], { height: 2.93, width: 2.78 }, titledVersion);
        this.profile.mesh.name = 'Right Bottom Profile';
    }
}
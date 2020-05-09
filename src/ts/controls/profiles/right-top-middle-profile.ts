import { Scene, Texture } from "three";
import { ProfileBase } from "./profile-base";
import { createActor } from "../../utils/create-actor";

/**
 * @class
 * Creates a profile image in the upper right middle box.
 */
export class RightTopMiddleProfile extends ProfileBase {
    /**
     * Constructor for the Right Top Profile class.
     * @param scene scene into which the profile should be added.
     * @param texture texture for the profile's image.
     * @param titledVersion flag to adjust size for title.
     */
    constructor(scene: Scene, texture: Texture, titledVersion: boolean) {
        super(scene, createActor(), texture, [4.465, -1.4], { height: 2.43, width: 2.78 }, titledVersion);
        this.profile.mesh.name = 'Right Top Middle Profile';
    }
}
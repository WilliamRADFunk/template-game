import { Scene, Texture } from "three";
import { ProfileBase } from "./profile-base";
import { createActor } from "../../utils/create-actor";

/**
 * @class
 * Creates a profile image in the upper left box.
 */
export class LeftTopProfile extends ProfileBase{
    /**
     * Constructor for the Left Top Profile class.
     * @param scene scene into which the profile should be added.
     * @param texture texture for the profile's image.
     * @param titledVersion flag to adjust size for title.
     */
    constructor(scene: Scene, texture: Texture, titledVersion: boolean) {
        super(scene, createActor(), texture, [-4.485, -4.45], { height: 2.90, width: 2.7 }, titledVersion);
        this.profile.mesh.name = 'Left Top Profile';
    }
}
import {
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Texture } from "three";
import { createActor } from "../../../utils/create-actor";

/**
 * Creates the rectangle image of an engineer in the upper right box.
 * @param dialogueTexture texture for the engineer's image.
 */
export function createProfile(dialogueTexture: Texture) {
    const profile = createActor();
    profile.originalStartingPoint = [4.48, -4.45];
    profile.currentPoint = [4.48, -4.45];
    profile.endingPoint = [4.48, -4.45];
    profile.geometry = new PlaneGeometry(2.75, 2.91, 96, 96);
    profile.material = new MeshPhongMaterial();
    profile.material.map = dialogueTexture;
    profile.material.map.minFilter = LinearFilter;
    (profile.material as any).shininess = 0;
    profile.material.transparent = true;
    profile.mesh = new Mesh(profile.geometry, profile.material);
    profile.mesh.position.set(profile.currentPoint[0], 5, profile.currentPoint[1]);
    profile.mesh.rotation.set(-Math.PI / 2, 0, 0);
    profile.mesh.name = 'Engineer\'s Profile';
    return profile;
}
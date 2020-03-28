import {
    RepeatWrapping,
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Texture } from "three";
import { createActor } from "../../../utils/create-actor";
import { Actor } from "../../../models/actor";

/**
 * Creates the rectangle image of the lander.
 * @param astronaut1Texture texture for the lander image.
 */
export function createMiningTeam(astronaut1Texture: Texture): Actor[] {
    const astronautLeft = createActor();
    astronautLeft.originalStartingPoint = [-4, -4];
    astronautLeft.currentPoint = [-4, -4];
    astronautLeft.endingPoint = [-4, -4];
    astronautLeft.geometry = new PlaneGeometry( 0.15, 0.15, 10, 10 );
    astronautLeft.material = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronaut1Texture,
        shininess: 0,
        transparent: true
    });
    astronautLeft.mesh = new Mesh(astronautLeft.geometry, astronautLeft.material);
    astronautLeft.mesh.position.set(astronautLeft.currentPoint[0], 1, astronautLeft.currentPoint[1] + 0.02);
    astronautLeft.mesh.rotation.set(-1.5708, 0, 0);
    astronautLeft.mesh.name = 'Astronaut-Left';

    const astronautRight = createActor();
    astronautRight.originalStartingPoint = [-4, -4];
    astronautRight.currentPoint = [-4, -4];
    astronautRight.endingPoint = [-4, -4];
    astronautRight.geometry = new PlaneGeometry( 0.15, 0.15, 10, 10 );
    astronautRight.material = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronaut1Texture,
        shininess: 0,
        transparent: true
    });
    astronautRight.mesh = new Mesh(astronautRight.geometry, astronautRight.material);
    astronautRight.mesh.position.set(astronautRight.currentPoint[0], 1, astronautRight.currentPoint[1] + 0.02);
    astronautRight.mesh.rotation.set(-1.5708, 0, 0);
    astronautRight.mesh.name = 'Astronaut-Right';
    return [astronautLeft, null, astronautRight];
}
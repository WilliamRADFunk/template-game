import {
    CircleGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createNeptune(zIndex: number): Actor {
    // Planetoid
    const neptune = createActor();
    neptune.originalStartingPoint = [0, 0];
    neptune.currentPoint = [-2.49, 0];
    neptune.endingPoint = [0, 0];
    neptune.currentRotation = 3.1;
    const meshGroup = new Object3D();
    neptune.geometry = new CircleGeometry(0.05, 48, 48);
    neptune.material = new MeshBasicMaterial({ color: 0xAAFF00 });
    neptune.mesh = new Mesh(neptune.geometry, neptune.material);
    neptune.mesh.position.set(neptune.currentPoint[0], zIndex + 1, neptune.currentPoint[1]);
    neptune.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(neptune.mesh);
    meshGroup.name = 'Neptune';
    neptune.mesh = meshGroup;
    // White Orbital Ring
    const orbitGeometry = new CircleGeometry(2.5, 32, 32);
    const orbitMaterial = new MeshBasicMaterial({
        color: new Color(0xFFFFFF),
        opacity: 1,
        side: DoubleSide,
        transparent: true});
    const orbit = new Mesh(orbitGeometry, orbitMaterial);
    orbit.position.set(0, zIndex + 3, 0);
    orbit.rotation.set(-1.5708, 0, 0);
    meshGroup.add(orbit);
    // Inner Black Circle
    const blackGeometry = new CircleGeometry(2.48, 32, 32);
    const blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    meshGroup.rotation.set(0, 3.1, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return neptune;
}
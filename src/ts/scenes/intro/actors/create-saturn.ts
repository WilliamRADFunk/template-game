import {
    CircleGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createSaturn(zIndex: number): Actor {
    // Planetoid
    const saturn = createActor();
    saturn.originalStartingPoint = [0, 0];
    saturn.currentPoint = [-1.99, 0];
    saturn.endingPoint = [0, 0];
    saturn.currentRotation = -2.3;
    const meshGroup = new Object3D();
    saturn.geometry = new CircleGeometry(0.05, 48, 48);
    saturn.material = new MeshBasicMaterial({ color: 0xA0A0A0 });
    saturn.mesh = new Mesh(saturn.geometry, saturn.material);
    saturn.mesh.position.set(saturn.currentPoint[0], zIndex + 1, saturn.currentPoint[1]);
    saturn.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(saturn.mesh);
    meshGroup.name = 'Saturn';
    saturn.mesh = meshGroup;
    // White Orbital Ring
    const orbitGeometry = new CircleGeometry(2, 32, 32);
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
    const blackGeometry = new CircleGeometry(1.98, 32, 32);
    const blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    meshGroup.rotation.set(0, -2.3, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return saturn;
}
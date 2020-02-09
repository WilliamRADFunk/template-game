import {
    CircleGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createJuptier(zIndex: number): Actor {
    // Planetoid
    const jupiter = createActor();
    jupiter.originalStartingPoint = [0, 0];
    jupiter.currentPoint = [-1.74, 0];
    jupiter.endingPoint = [0, 0];
    jupiter.currentRotation = -1.5;
    const meshGroup = new Object3D();
    jupiter.geometry = new CircleGeometry(0.05, 48, 48);
    jupiter.material = new MeshBasicMaterial({ color: 0x00AAFF });
    jupiter.mesh = new Mesh(jupiter.geometry, jupiter.material);
    jupiter.mesh.position.set(jupiter.currentPoint[0], zIndex + 1, jupiter.currentPoint[1]);
    jupiter.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(jupiter.mesh);
    meshGroup.name = 'Jupiter';
    jupiter.mesh = meshGroup;
    // White Orbital Ring
    const orbitGeometry = new CircleGeometry(1.75, 32, 32);
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
    const blackGeometry = new CircleGeometry(1.73, 32, 32);
    const blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    meshGroup.rotation.set(0, -1.5, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return jupiter;
}
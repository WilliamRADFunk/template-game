import {
    CircleGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createVenus(zIndex: number): Actor {
    // Planetoid
    const venus = createActor();
    venus.originalStartingPoint = [0, 0];
    venus.currentPoint = [-0.99, 0];
    venus.endingPoint = [0, 0];
    venus.currentRotation = 0.75;
    const meshGroup = new Object3D();
    venus.geometry = new CircleGeometry(0.05, 48, 48);
    venus.material = new MeshBasicMaterial({ color: 0x88FF88 });
    venus.mesh = new Mesh(venus.geometry, venus.material);
    venus.mesh.position.set(venus.currentPoint[0], zIndex + 1, venus.currentPoint[1]);
    venus.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(venus.mesh);
    meshGroup.name = 'Venus';
    venus.mesh = meshGroup;
    // White Orbital Ring
    const orbitGeometry = new CircleGeometry(1, 32, 32);
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
    const blackGeometry = new CircleGeometry(0.98, 32, 32);
    const blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    meshGroup.rotation.set(0, 0.75, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return venus;
}
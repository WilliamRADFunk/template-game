import {
    CircleGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createMercury(zIndex: number): Actor {
    // Planetoid
    const mercury = createActor();
    mercury.originalStartingPoint = [0, 0];
    mercury.currentPoint = [-0.74, 0];
    mercury.endingPoint = [0, 0];
    mercury.currentRotation = -0.2;
    const meshGroup = new Object3D();
    mercury.geometry = new CircleGeometry(0.05, 48, 48);
    mercury.material = new MeshBasicMaterial({ color: 0xFF88FF });
    mercury.mesh = new Mesh(mercury.geometry, mercury.material);
    mercury.mesh.position.set(mercury.currentPoint[0], zIndex + 1, mercury.currentPoint[1]);
    mercury.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(mercury.mesh);
    meshGroup.name = 'Mercury';
    mercury.mesh = meshGroup;
    // White Orbital Ring
    let orbitGeometry = new CircleGeometry(0.75, 32, 32);
    let orbitMaterial = new MeshBasicMaterial({
        color: new Color(0xFFFFFF),
        opacity: 1,
        side: DoubleSide,
        transparent: true});
    let orbit = new Mesh(orbitGeometry, orbitMaterial);
    orbit.position.set(0, zIndex + 3, 0);
    orbit.rotation.set(-1.5708, 0, 0);
    meshGroup.add(orbit);
    // Inner Black Circle
    let blackGeometry = new CircleGeometry(0.73, 32, 32);
    let blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    let black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    meshGroup.rotation.set(0, -0.2, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return mercury;
}
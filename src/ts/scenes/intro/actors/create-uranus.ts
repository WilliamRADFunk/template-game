import {
    CircleGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createUranus(zIndex: number): Actor {
    // Planetoid
    const uranus = createActor();
    uranus.originalStartingPoint = [0, 0];
    uranus.currentPoint = [-2.24, 0];
    uranus.endingPoint = [0, 0];
    uranus.currentRotation = 2.3;
    const meshGroup = new Object3D();
    uranus.geometry = new CircleGeometry(0.05, 48, 48);
    uranus.material = new MeshBasicMaterial({ color: 0xAA00AA });
    uranus.mesh = new Mesh(uranus.geometry, uranus.material);
    uranus.mesh.position.set(uranus.currentPoint[0], zIndex + 1, uranus.currentPoint[1]);
    uranus.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(uranus.mesh);
    meshGroup.name = 'Uranus';
    uranus.mesh = meshGroup;
    // White Orbital Ring
    const orbitGeometry = new CircleGeometry(2.25, 32, 32);
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
    const blackGeometry = new CircleGeometry(2.23, 32, 32);
    const blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    meshGroup.rotation.set(0, 2.3, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return uranus;
}
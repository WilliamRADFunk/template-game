import {
    CircleGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createPluto(zIndex: number): Actor {
    // Planetoid
    const pluto = createActor();
    pluto.originalStartingPoint = [0, 0];
    pluto.currentPoint = [-2.74, 0];
    pluto.endingPoint = [0, 0];
    pluto.currentRotation = -2.8;
    const meshGroup = new Object3D();
    pluto.geometry = new CircleGeometry(0.05, 48, 48);
    pluto.material = new MeshBasicMaterial({ color: 0xFFFFFF });
    pluto.mesh = new Mesh(pluto.geometry, pluto.material);
    pluto.mesh.position.set(pluto.currentPoint[0], zIndex + 1, pluto.currentPoint[1]);
    pluto.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(pluto.mesh);
    meshGroup.name = 'Pluto';
    pluto.mesh = meshGroup;
    // White Orbital Ring
    const orbitGeometry = new CircleGeometry(2.75, 32, 32);
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
    const blackGeometry = new CircleGeometry(2.73, 32, 32);
    const blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    meshGroup.rotation.set(0, -2.8, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return pluto;
}
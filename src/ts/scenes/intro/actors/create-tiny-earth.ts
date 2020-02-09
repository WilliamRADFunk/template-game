import {
    CircleGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createTinyEarth(zIndex: number): Actor {
    // Planetoid
    const tinyEarth = createActor();
    tinyEarth.originalStartingPoint = [0, 0];
    tinyEarth.currentPoint = [-1.24, 0];
    tinyEarth.endingPoint = [0, 0];
    tinyEarth.currentRotation = -0.5;
    const meshGroup = new Object3D();
    tinyEarth.geometry = new CircleGeometry(0.05, 48, 48);
    tinyEarth.material = new MeshBasicMaterial({ color: 0x8888FF });
    tinyEarth.mesh = new Mesh(tinyEarth.geometry, tinyEarth.material);
    tinyEarth.mesh.position.set(tinyEarth.currentPoint[0], zIndex + 1, tinyEarth.currentPoint[1]);
    tinyEarth.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(tinyEarth.mesh);
    meshGroup.name = 'Tiny Earth';
    tinyEarth.mesh = meshGroup;
    // White Orbital Ring
    const orbitGeometry = new CircleGeometry(1.25, 32, 32);
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
    const blackGeometry = new CircleGeometry(1.23, 32, 32);
    const blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    meshGroup.rotation.set(0, -0.5, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return tinyEarth;
}
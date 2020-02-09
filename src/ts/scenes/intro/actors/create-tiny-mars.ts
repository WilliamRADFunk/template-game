import {
    CircleGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createTinyMars(zIndex: number): Actor {
    // Planetoid
    const tinyMars = createActor();
    tinyMars.originalStartingPoint = [0, 0];
    tinyMars.currentPoint = [-1.49, 0];
    tinyMars.endingPoint = [0, 0];
    tinyMars.currentRotation = 0.5;
    const meshGroup = new Object3D();
    tinyMars.geometry = new CircleGeometry(0.05, 48, 48);
    tinyMars.material = new MeshBasicMaterial({ color: 0xFF4444 });
    tinyMars.mesh = new Mesh(tinyMars.geometry, tinyMars.material);
    tinyMars.mesh.position.set(tinyMars.currentPoint[0], zIndex + 1, tinyMars.currentPoint[1]);
    tinyMars.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(tinyMars.mesh);
    meshGroup.name = 'Tiny Mars';
    tinyMars.mesh = meshGroup;
    // White Orbital Ring
    const orbitGeometry = new CircleGeometry(1.50, 32, 32);
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
    const blackGeometry = new CircleGeometry(1.48, 32, 32);
    const blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    meshGroup.rotation.set(0, 0.5, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return tinyMars;
}
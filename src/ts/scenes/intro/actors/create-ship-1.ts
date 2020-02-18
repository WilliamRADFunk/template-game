import {
    CircleGeometry,
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    Texture } from "three";

import { createActor } from "../../../utils/create-actor";

export function createShip1(shipTexture: Texture) {
    const ship = createActor();
    ship.originalStartingPoint = [0, 0];
    ship.currentPoint = [0, 0];
    ship.endingPoint = [0, 0];
    ship.geometry = new CircleGeometry(0.5, 16, 16);
    ship.material = new MeshPhongMaterial();
    ship.material.map = shipTexture;
    ship.material.map.minFilter = LinearFilter;
    (ship.material as any).shininess = 0;
    ship.material.transparent = true;
    ship.mesh = new Mesh(ship.geometry, ship.material);
    ship.mesh.position.set(ship.currentPoint[0], 0, ship.currentPoint[1]);
    ship.mesh.rotation.set(-1.5708, 0, -1.5708);
    ship.mesh.name = 'Enzmann';
    ship.mesh.scale.set(0.0001, 0.0001, 0.0001);
    return ship;
}
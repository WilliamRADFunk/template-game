import {
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Texture } from "three";

import { createActor } from "../../../utils/create-actor";

export function createShipInteriorFrame(shipTexture: Texture) {
    const ship = createActor();
    ship.originalStartingPoint = [0, 3];
    ship.currentPoint = [0, 3];
    ship.endingPoint = [0, 3];
    ship.geometry = new PlaneGeometry(12, 6, 96, 96);
    ship.material = new MeshPhongMaterial();
    ship.material.map = shipTexture;
    ship.material.map.minFilter = LinearFilter;
    (ship.material as any).shininess = 0;
    ship.material.transparent = true;
    ship.mesh = new Mesh(ship.geometry, ship.material);
    ship.mesh.position.set(ship.currentPoint[0], 20, ship.currentPoint[1]);
    ship.mesh.rotation.set(-Math.PI / 2, 0, 0);
    ship.mesh.name = 'Enzmann';
    return ship;
}
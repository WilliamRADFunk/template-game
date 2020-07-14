import {
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry } from "three";
import { createActor } from "../../../utils/create-actor";
import { ASSETS_CTRL } from "../../../controls/controllers/assets-controller";

/**
 * Creates the rectangle image of the ship.
 */
export function createShip() {
    const ship = createActor();
    ship.originalStartingPoint = [0, -0.75];
    ship.currentPoint = [0, -0.75];
    ship.endingPoint = [0, -0.75];
    ship.geometry = new PlaneGeometry(12, 6, 96, 96);
    ship.material = new MeshPhongMaterial();
    ship.material.map = ASSETS_CTRL.textures.enzmannOutside;
    ship.material.map.minFilter = LinearFilter;
    (ship.material as any).shininess = 0;
    ship.material.transparent = true;
    ship.mesh = new Mesh(ship.geometry, ship.material);
    ship.mesh.position.set(ship.currentPoint[0], 10, ship.currentPoint[1]);
    ship.mesh.rotation.set(-Math.PI / 2, 0, 0);
    ship.mesh.name = 'Enzmann';
    return ship;
}
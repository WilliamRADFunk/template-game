import { Mesh, MeshBasicMaterial, Scene } from "three";
import { GEOMETRY } from "./tile-geometry";
import { getXPos, getZPos } from "../controllers/grid-controller";
import { LayerYPos } from "./layer-y-values";
import { RAD_90_DEG_LEFT } from "./radians-x-degrees-left";

/**
 * Makes all the team member meshes for the game map.
 */
export function makeMember(
    scene: Scene,
    animationMeshArray: [Mesh, Mesh, Mesh],
    material: MeshBasicMaterial,
    index: number,
    row: number,
    col: number,
    elevation?: number
): void {
    const elev = ((elevation !== undefined && null !== elevation) ? elevation : LayerYPos.LAYER_1);
    animationMeshArray[index] = new Mesh( GEOMETRY, material );
    animationMeshArray[index].position.set(getXPos(col), elev, getZPos(row));
    animationMeshArray[index].rotation.set(RAD_90_DEG_LEFT, 0, 0);
    animationMeshArray[index].name = `team-member-${index}`;
    animationMeshArray[index].visible = index ? false : true;
    scene.add(animationMeshArray[index]);
}
import { TeamMember, TeamMemberDirection } from "../../../models/ancient-ruins-specifications";
import {
    RAD_90_DEG_LEFT,
    RAD_45_DEG_LEFT,
    RAD_135_DEG_LEFT,
    RAD_180_DEG_LEFT,
    RAD_225_DEG_LEFT,
    RAD_270_DEG_LEFT,
    RAD_315_DEG_LEFT } from "./radians-x-degrees-left";

export function rotateCrewMember(teamMember: TeamMember): void {
    const zRot = teamMember.animationMeshes[0].rotation.z;
    switch(teamMember.currDirection) {
        case TeamMemberDirection.Down: {
            zRot !== 0 && [0, 1, 2].forEach(i => teamMember.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, 0));
            break;
        }
        case TeamMemberDirection.Down_Left: {
            zRot !== RAD_45_DEG_LEFT && [0, 1, 2].forEach(i => teamMember.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, RAD_45_DEG_LEFT));
            break;
        }
        case TeamMemberDirection.Left: {
            zRot !== RAD_90_DEG_LEFT && [0, 1, 2].forEach(i => teamMember.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, RAD_90_DEG_LEFT));
            break;
        }
        case TeamMemberDirection.Up_Left: {
            zRot !== RAD_135_DEG_LEFT && [0, 1, 2].forEach(i => teamMember.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, RAD_135_DEG_LEFT));
            break;
        }
        case TeamMemberDirection.Up: {
            zRot !== RAD_180_DEG_LEFT && [0, 1, 2].forEach(i => teamMember.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, RAD_180_DEG_LEFT));
            break;
        }
        case TeamMemberDirection.Up_Right: {
            zRot !== RAD_225_DEG_LEFT && [0, 1, 2].forEach(i => teamMember.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, RAD_225_DEG_LEFT));
            break;
        }
        case TeamMemberDirection.Right: {
            zRot !== RAD_270_DEG_LEFT && [0, 1, 2].forEach(i => teamMember.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, RAD_270_DEG_LEFT));
            break;
        }
        case TeamMemberDirection.Down_Right: {
            zRot !== RAD_315_DEG_LEFT && [0, 1, 2].forEach(i => teamMember.animationMeshes[i].rotation.set(RAD_90_DEG_LEFT, 0, RAD_315_DEG_LEFT));
            break;
        }
    }
}
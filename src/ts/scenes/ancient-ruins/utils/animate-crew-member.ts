import { TeamMember } from "../../../models/ancient-ruins-specifications";

export function animateCrewMember(teamMember: TeamMember): void {
    const meshes = teamMember.animationMeshes;
    // If any of the meshes are not setup, bail out early.
    if (meshes.some(x => !x)) {
        return;
    }

    const currIndex = teamMember.animationCounter;
    // Middle Posture
    if (currIndex < 10 || (currIndex > 19 && currIndex < 30)) {
        meshes[0].visible = true;
        meshes[1].visible = false;
        meshes[2].visible = false;
    } else if (currIndex > 29) {
        meshes[0].visible = false;
        meshes[1].visible = false;
        meshes[2].visible = true;
    } else {
        meshes[0].visible = false;
        meshes[1].visible = true;
        meshes[2].visible = false;
    }
    teamMember.animationCounter++;

    if (teamMember.animationCounter > 39) {
        teamMember.animationCounter = 0;
    }
}
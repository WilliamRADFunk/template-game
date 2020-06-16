import { PlaneGeometry, Scene, Texture } from "three";

import { AncientRuinsSpecifications, TeamMember, GridDictionary } from "../../../models/ancient-ruins-specifications";

const crewGraphicDictionary: GridDictionary = {
    1: { devDescription: 'Red Shirt - Human - Light - Black Hair', gameDescription: '', spritePosition: [3, 3] },
}

const spriteMapCols = 32;
const spriteMapRows = 32;

export class TeamCtrl {
    /**
     * Specification of what the team's specs should be.
     */
    private _ancientRuinsSpec: AncientRuinsSpecifications;

    /**
     * Currently selected team member index.
     */
    private currTeamMember: number = 4;

    /**
     * Team member geometry that makes up the ground tiles.
     */
    private _geometry: PlaneGeometry = new PlaneGeometry( 0.40, 0.40, 10, 10 );

    /**
     * Medical Officer
     */
    private _medicalOfficer: TeamMember;

    /**
     * Red shirt 1
     */
    private _redShirt1: TeamMember;

    /**
     * Red shirt 2
     */
    private _redShirt2: TeamMember;

    /**
     * Science Officer
     */
    private _scienceOfficer: TeamMember;

    /**
     * Team Leader
     */
    private _teamLeader: TeamMember;

    /**
     * Team Leader
     */
    private _theTeam: TeamMember[] = [
        this._redShirt1,
        this._redShirt2,
        this._medicalOfficer,
        this._scienceOfficer,
        this._teamLeader
    ];

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    constructor(scene: Scene, ancientRuinsSpec: AncientRuinsSpecifications) {
        this._scene = scene;
        this._ancientRuinsSpec = ancientRuinsSpec;
    }

    /**
     * Handles all cleanup responsibility for controller before it's destroyed.
     */
    public dispose(): void {

    }

    /**
     * At the end of each loop iteration, check for team-specific animations.
     */
    public endCycle(): void {

    }

}
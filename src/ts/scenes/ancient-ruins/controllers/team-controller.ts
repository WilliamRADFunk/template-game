import { Scene, Texture } from "three";

import { AncientRuinsSpecifications } from "../../../models/ancient-ruins-specifications";

export interface TeamMember {
    animationTextures: [Texture, Texture, Texture];
    currDirection: TeamMemberDirection;
    currTextureIndex: number;
    health: number;
    name: string;
    position: [number, number];
    rank: string;
    status: TeamMemberStatus;
    title: string;
}

const enum TeamMemberDirection {
    'Down' = 0,
    'Down-Left' = 1,
    'Down-Right' = 2,
    'Left' = 3,
    'Right' = 4,
    'Up' = 5,
    'Up-Left' = 6,
    'Up-Right' = 7
}

const enum TeamMemberStatus {
    'Healthy' = 0,
    'Injured' = 1,
    'Ill' = 2,
    'Dead' = 3,
    'Unconscious' = 4
}

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
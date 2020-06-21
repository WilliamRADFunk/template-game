import {
    Scene,
    Texture } from "three";

import { AncientRuinsSpecifications, TeamMember } from "../../../models/ancient-ruins-specifications";
import { GridCtrl } from "./grid-controller";
import { makeMemberMaterial } from "../utils/make-member-material";
import { makeMember } from "../utils/make-member";
import { spriteMapCols, spriteMapRows, findMemberValue, ShirtColor } from "../utils/crew-member-spritemap-values";
import { MIDDLE_COL } from "../utils/grid-constants";

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
     * Reference to this scene's grid controller.
     */
    private _gridCtrl: GridCtrl;

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

    /**
     * All of the textures contained in this scene.
     */
    private _textures: { [key: string]: Texture } = {};

    constructor(scene: Scene, textures: { [key: string]: Texture }, ancientRuinsSpec: AncientRuinsSpecifications, gridCtrl: GridCtrl) {
        this._scene = scene;
        this._textures = textures;
        this._ancientRuinsSpec = ancientRuinsSpec;
        this._gridCtrl = gridCtrl;

        this._makeMembers();
    }

    /**
     * Makes all the team member meshes for the game map.
     */
    private _makeMembers(): void {
        this._redShirt1 = this._ancientRuinsSpec.crew[0];
        this._redShirt2 = this._ancientRuinsSpec.crew[1];
        this._medicalOfficer = this._ancientRuinsSpec.crew[2];
        this._scienceOfficer = this._ancientRuinsSpec.crew[3];
        this._teamLeader = this._ancientRuinsSpec.crew[4];

        const redShirt1CrewDictionaryValue = findMemberValue(this._redShirt1.appearance, ShirtColor.Red);
        [0, 1, 2].forEach((val: number) => {
            console.log('Making Red Shirt 1');
            const offCoordsX = redShirt1CrewDictionaryValue.spritePositionX[val];
            const offCoordsY = redShirt1CrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._redShirt1.animationMeshes, material, val, 2, MIDDLE_COL - 1);
        });

        const redShirt2CrewDictionaryValue = findMemberValue(this._redShirt2.appearance, ShirtColor.Red);
        [0, 1, 2].forEach((val: number) => {
            console.log('Making Red Shirt 2');
            const offCoordsX = redShirt2CrewDictionaryValue.spritePositionX[val];
            const offCoordsY = redShirt2CrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._redShirt2.animationMeshes, material, val, 2, MIDDLE_COL + 1);
        });

        const medicalOfficerCrewDictionaryValue = findMemberValue(this._medicalOfficer.appearance, ShirtColor.Blue);
        [0, 1, 2].forEach((val: number) => {
            console.log('Making Blue Shirt 1');
            const offCoordsX = medicalOfficerCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = medicalOfficerCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._medicalOfficer.animationMeshes, material, val, 1, MIDDLE_COL - 1);
        });

        const scienceOfficerCrewDictionaryValue = findMemberValue(this._scienceOfficer.appearance, ShirtColor.Blue);
        [0, 1, 2].forEach((val: number) => {
            console.log('Making Blue Shirt 2');
            const offCoordsX = scienceOfficerCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = scienceOfficerCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._scienceOfficer.animationMeshes, material, val, 1, MIDDLE_COL + 1);
        });

        const teamLeaderCrewDictionaryValue = findMemberValue(this._teamLeader.appearance, ShirtColor.Yellow);
        [0, 1, 2].forEach((val: number) => {
            console.log('Making Yellow Shirt ');
            const offCoordsX = teamLeaderCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = teamLeaderCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._teamLeader.animationMeshes, material, val, 2, MIDDLE_COL);
        });
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
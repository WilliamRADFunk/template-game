import {
    Scene,
    Texture } from "three";

import { AncientRuinsSpecifications, TeamMember, TeamMemberDirection } from "../../../models/ancient-ruins-specifications";
import { GridCtrl } from "./grid-controller";
import { makeMemberMaterial } from "../utils/make-member-material";
import { makeMember } from "../utils/make-member";
import { spriteMapCols, spriteMapRows, findMemberValue, ShirtColor } from "../utils/crew-member-spritemap-values";
import { MIDDLE_COL, MAX_ROWS, MIN_COLS, MIN_ROWS, MAX_COLS } from "../utils/grid-constants";
import { rotateCrewMember } from "../utils/rotate-crew-member";

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

    constructor(scene: Scene, textures: { [key: string]: Texture }, ancientRuinsSpec: AncientRuinsSpecifications, gridCtrl: GridCtrl, landingTileValue: number) {
        this._scene = scene;
        this._textures = textures;
        this._ancientRuinsSpec = ancientRuinsSpec;
        this._gridCtrl = gridCtrl;

        const landingTiles: number[][] = [];

        for (let row = MIN_ROWS; row <= MAX_ROWS; row++) {
            for (let col = MIN_COLS; col <= MAX_COLS; col++) {
                if (this._gridCtrl.getTileValue(row, col, 2) >= landingTileValue && this._gridCtrl.getTileValue(row, col, 2) < landingTileValue + 4) {
                    landingTiles.push([row, col]);
                }
            }
        }

        if (landingTiles.length) {
            const firstTile = landingTiles[0];
            const lowestRowVal = Math.min(...landingTiles.map(rowCol => rowCol[0]));
            const lowestColVal = Math.min(...landingTiles.map(rowCol => rowCol[1]));
            switch(this._gridCtrl.getTileValue(firstTile[0], firstTile[1], 2)) {
                // At top of screen. Point team downward.
                case landingTileValue: {
                    this._ancientRuinsSpec.crew.forEach(x => x.currDirection = TeamMemberDirection.Down);
                    this._makeMembers([
                        [lowestRowVal, lowestColVal], // Redshirt 1
                        [lowestRowVal, lowestColVal + 2], // Redshirt 2
                        [lowestRowVal + 1, lowestColVal], // Medical Officer
                        [lowestRowVal + 1, lowestColVal + 2], // Science Officer                        
                        [lowestRowVal, lowestColVal + 1], // Teamleader
                    ]);
                    break;
                }
                // At right side of screen. Point team downward.
                case (landingTileValue + 1): {
                    this._ancientRuinsSpec.crew.forEach(x => x.currDirection = TeamMemberDirection.Left);
                    this._makeMembers([
                        [lowestRowVal, lowestColVal], // Redshirt 1
                        [lowestRowVal + 2, lowestColVal], // Redshirt 2
                        [lowestRowVal, lowestColVal + 1], // Medical Officer
                        [lowestRowVal + 2, lowestColVal + 1], // Science Officer                        
                        [lowestRowVal + 1, lowestColVal], // Teamleader
                    ]);
                    break;
                }
                // At bottom of screen. Point team downward.
                case (landingTileValue + 2): {
                    this._ancientRuinsSpec.crew.forEach(x => x.currDirection = TeamMemberDirection.Up);
                    this._makeMembers([
                        [lowestRowVal + 2, lowestColVal], // Redshirt 1
                        [lowestRowVal + 2, lowestColVal + 2], // Redshirt 2
                        [lowestRowVal + 1, lowestColVal], // Medical Officer
                        [lowestRowVal + 1, lowestColVal + 2], // Science Officer                        
                        [lowestRowVal + 2, lowestColVal + 1], // Teamleader
                    ]);
                    break;
                }
                // At left side of screen. Point team downward.
                case (landingTileValue + 3): {
                    this._ancientRuinsSpec.crew.forEach(x => x.currDirection = TeamMemberDirection.Right);
                    this._makeMembers([
                        [lowestRowVal, lowestColVal + 2], // Redshirt 1
                        [lowestRowVal + 2, lowestColVal + 2], // Redshirt 2
                        [lowestRowVal, lowestColVal + 1], // Medical Officer
                        [lowestRowVal + 2, lowestColVal + 1], // Science Officer                        
                        [lowestRowVal + 1, lowestColVal + 2], // Teamleader
                    ]);
                    break;
                }
            }
            // Rotate to face correct direction.
            this._ancientRuinsSpec.crew.forEach(x => rotateCrewMember(x));
        }
    }

    /**
     * Makes all the team member meshes for the game map.
     */
    private _makeMembers(crewPosition: number[][]): void {
        this._redShirt1 = this._ancientRuinsSpec.crew[0];
        this._redShirt2 = this._ancientRuinsSpec.crew[1];
        this._medicalOfficer = this._ancientRuinsSpec.crew[2];
        this._scienceOfficer = this._ancientRuinsSpec.crew[3];
        this._teamLeader = this._ancientRuinsSpec.crew[4];

        const redShirt1CrewDictionaryValue = findMemberValue(this._redShirt1.appearance, ShirtColor.Red);
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = redShirt1CrewDictionaryValue.spritePositionX[val];
            const offCoordsY = redShirt1CrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._redShirt1.animationMeshes, material, val, crewPosition[0][0], crewPosition[0][1]);
        });

        const redShirt2CrewDictionaryValue = findMemberValue(this._redShirt2.appearance, ShirtColor.Red);
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = redShirt2CrewDictionaryValue.spritePositionX[val];
            const offCoordsY = redShirt2CrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._redShirt2.animationMeshes, material, val, crewPosition[1][0], crewPosition[1][1]);
        });

        const medicalOfficerCrewDictionaryValue = findMemberValue(this._medicalOfficer.appearance, ShirtColor.Blue);
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = medicalOfficerCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = medicalOfficerCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._medicalOfficer.animationMeshes, material, val, crewPosition[2][0], crewPosition[2][1]);
        });

        const scienceOfficerCrewDictionaryValue = findMemberValue(this._scienceOfficer.appearance, ShirtColor.Blue);
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = scienceOfficerCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = scienceOfficerCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._scienceOfficer.animationMeshes, material, val, crewPosition[3][0], crewPosition[3][1]);
        });

        const teamLeaderCrewDictionaryValue = findMemberValue(this._teamLeader.appearance, ShirtColor.Yellow);
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = teamLeaderCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = teamLeaderCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._teamLeader.animationMeshes, material, val, crewPosition[4][0], crewPosition[4][1]);
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
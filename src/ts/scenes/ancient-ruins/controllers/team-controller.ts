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
import { gridDictionary } from "../utils/tile-values";
import { formatString } from "../../../utils/format-string";
import { RankAbbreviationsMap } from "../../../utils/rank-map";
import { TileCtrl } from "./tile-controller";

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
     * Reference to this scene's tile controller.
     */
    private _tileCtrl: TileCtrl;

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * All of the textures contained in this scene.
     */
    private _textures: { [key: string]: Texture } = {};

    constructor(scene: Scene, textures: { [key: string]: Texture }, ancientRuinsSpec: AncientRuinsSpecifications, gridCtrl: GridCtrl, tileCtrl: TileCtrl) {
        this._scene = scene;
        this._textures = textures;
        this._ancientRuinsSpec = ancientRuinsSpec;
        this._gridCtrl = gridCtrl;
        this._tileCtrl = tileCtrl;
        const landingTileValue = this._tileCtrl.getLandingZoneValue();

        const landingTiles: number[][] = [];

        for (let row = MIN_ROWS; row <= MAX_ROWS; row++) {
            for (let col = MIN_COLS; col <= MAX_COLS; col++) {
                if (this._gridCtrl.getTileValue(row, col, 0) >= landingTileValue) {
                    landingTiles.push([row, col]);
                }
            }
        }

        if (landingTiles.length) {
            const firstTile = landingTiles[0];
            const lowestRowVal = Math.min(...landingTiles.map(rowCol => rowCol[0]));
            const lowestColVal = Math.min(...landingTiles.map(rowCol => rowCol[1]));
            switch(this._gridCtrl.getTileValue(firstTile[0], firstTile[1], 0)) {
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
            this._redShirt1.position = [crewPosition[0][0], crewPosition[0][1]];

            // Updates grid with team member value
            const tileVal = this._gridCtrl.updateCrewInGrid(this._redShirt1.position[0], this._redShirt1.position[1], 0);
            gridDictionary[tileVal].gameDescription = formatString(
                gridDictionary[tileVal].gameDescription,
                `(${RankAbbreviationsMap[this._redShirt1.rank]})`,
                this._redShirt1.name);
        });

        const redShirt2CrewDictionaryValue = findMemberValue(this._redShirt2.appearance, ShirtColor.Red);
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = redShirt2CrewDictionaryValue.spritePositionX[val];
            const offCoordsY = redShirt2CrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._redShirt2.animationMeshes, material, val, crewPosition[1][0], crewPosition[1][1]);
            this._redShirt2.position = [crewPosition[1][0], crewPosition[1][1]];

            // Updates grid with team member value
            const tileVal = this._gridCtrl.updateCrewInGrid(this._redShirt2.position[0], this._redShirt2.position[1], 1);
            gridDictionary[tileVal].gameDescription = formatString(
                gridDictionary[tileVal].gameDescription,
                `(${RankAbbreviationsMap[this._redShirt2.rank]})`,
                this._redShirt2.name);
        });

        const medicalOfficerCrewDictionaryValue = findMemberValue(this._medicalOfficer.appearance, ShirtColor.Blue);
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = medicalOfficerCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = medicalOfficerCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._medicalOfficer.animationMeshes, material, val, crewPosition[2][0], crewPosition[2][1]);
            this._medicalOfficer.position = [crewPosition[2][0], crewPosition[2][1]];

            // Updates grid with team member value
            const tileVal = this._gridCtrl.updateCrewInGrid(this._medicalOfficer.position[0], this._medicalOfficer.position[1], 2);
            gridDictionary[tileVal].gameDescription = formatString(
                gridDictionary[tileVal].gameDescription,
                `(${RankAbbreviationsMap[this._medicalOfficer.rank]})`,
                this._medicalOfficer.name);
        });

        const scienceOfficerCrewDictionaryValue = findMemberValue(this._scienceOfficer.appearance, ShirtColor.Blue);
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = scienceOfficerCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = scienceOfficerCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._scienceOfficer.animationMeshes, material, val, crewPosition[3][0], crewPosition[3][1]);
            this._scienceOfficer.position = [crewPosition[3][0], crewPosition[3][1]];

            // Updates grid with team member value
            const tileVal = this._gridCtrl.updateCrewInGrid(this._scienceOfficer.position[0], this._scienceOfficer.position[1], 3);
            gridDictionary[tileVal].gameDescription = formatString(
                gridDictionary[tileVal].gameDescription,
                `(${RankAbbreviationsMap[this._scienceOfficer.rank]})`,
                this._scienceOfficer.name);
        });

        const teamLeaderCrewDictionaryValue = findMemberValue(this._teamLeader.appearance, ShirtColor.Yellow);
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = teamLeaderCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = teamLeaderCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = makeMemberMaterial(this._textures, offCoordsX, offCoordsY, size);
            makeMember(this._scene, this._teamLeader.animationMeshes, material, val, crewPosition[4][0], crewPosition[4][1]);
            this._teamLeader.position = [crewPosition[4][0], crewPosition[4][1]];

            // Updates grid with team member value
            const tileVal = this._gridCtrl.updateCrewInGrid(this._teamLeader.position[0], this._teamLeader.position[1], 4);
            gridDictionary[tileVal].gameDescription = formatString(
                gridDictionary[tileVal].gameDescription,
                `(${RankAbbreviationsMap[this._teamLeader.rank]})`,
                this._teamLeader.name);
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

    /**
     * Uses the row/col combo to find crew member, and switch them to active.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     */
    public selectCrewMember(row: number, col: number): void {
        const clickedCrewMember = this._ancientRuinsSpec.crew.findIndex((c: TeamMember) => c.position[0] === row && c.position[1] === col);
        this.currTeamMember = clickedCrewMember > -1 ? clickedCrewMember : this.currTeamMember;

        // TODO: eliminate when mini game is complete
        const tileVal = this._ancientRuinsSpec.crew[this.currTeamMember].tileValue;
        const rank = this._ancientRuinsSpec.crew[this.currTeamMember].rank;
        const name = this._ancientRuinsSpec.crew[this.currTeamMember].name;
        console.log('[Active]', formatString(gridDictionary[tileVal].gameDescription, `(${RankAbbreviationsMap[rank]})`, name));
    }

}
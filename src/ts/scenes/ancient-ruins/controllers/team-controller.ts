import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    NearestFilter,
    PlaneGeometry,
    RepeatWrapping,
    Scene,
    Texture,
    Vector2 } from "three";

import {
    AncientRuinsSpecifications,
    CrewDictionary,
    CrewDictionaryValue,
    TeamMember } from "../../../models/ancient-ruins-specifications";
import { GridCtrl, getXPos, getZPos } from "./grid-controller";

const crewGraphicDictionary: CrewDictionary = {
    0: { devDescription: 'Red Shirt - Human - Light - Black Hair', spritePositionX: [3, 4, 5], spritePositionY: [7, 7, 7] },
    1: { devDescription: 'Red Shirt - Human - Light - Bald Hair', spritePositionX: [3, 4, 5], spritePositionY: [6, 6, 6] },
    2: { devDescription: 'Red Shirt - Human - Light - Brown Hair', spritePositionX: [3, 4, 5], spritePositionY: [5, 5, 5] },
    3: { devDescription: 'Red Shirt - Human - Light - Red Hair', spritePositionX: [3, 4, 5], spritePositionY: [4, 4, 4] },
    4: { devDescription: 'Red Shirt - Human - Light - Blond Hair', spritePositionX: [3, 4, 5], spritePositionY: [3, 3, 3] },
    5: { devDescription: 'Red Shirt - Human - Dark - Black Hair', spritePositionX: [3, 4, 5], spritePositionY: [2, 2, 2] },

    6: { devDescription: 'Blue Shirt - Human - Light - Black Hair', spritePositionX: [0, 1, 2], spritePositionY: [7, 7, 7] },
    7: { devDescription: 'Blue Shirt - Human - Light - Bald Hair', spritePositionX: [0, 1, 2], spritePositionY: [6, 6, 6] },
    8: { devDescription: 'Blue Shirt - Human - Light - Brown Hair', spritePositionX: [0, 1, 2], spritePositionY: [5, 5, 5] },
    9: { devDescription: 'Blue Shirt - Human - Light - Red Hair', spritePositionX: [0, 1, 2], spritePositionY: [4, 4, 4] },
    10: { devDescription: 'Blue Shirt - Human - Light - Blond Hair', spritePositionX: [0, 1, 2], spritePositionY: [3, 3, 3] },
    11: { devDescription: 'Blue Shirt - Human - Dark - Black Hair', spritePositionX: [0, 1, 2], spritePositionY: [2, 2, 2] },

    12: { devDescription: 'Yellow Shirt - Human - Light - Black Hair', spritePositionX: [0, 1, 2], spritePositionY: [1, 1, 1] },
    13: { devDescription: 'Yellow Shirt - Human - Light - Bald Hair', spritePositionX: [0, 1, 2], spritePositionY: [0, 0, 0] },
    14: { devDescription: 'Yellow Shirt - Human - Light - Brown Hair', spritePositionX: [3, 4, 5], spritePositionY: [1, 1, 1] },
    15: { devDescription: 'Yellow Shirt - Human - Light - Red Hair', spritePositionX: [3, 4, 5], spritePositionY: [0, 0, 0] },
    16: { devDescription: 'Yellow Shirt - Human - Light - Blond Hair', spritePositionX: [6, 6, 6], spritePositionY: [7, 6, 5] },
    17: { devDescription: 'Yellow Shirt - Human - Dark - Black Hair', spritePositionX: [6, 6, 6], spritePositionY: [4, 3, 2] },
}

const layerYPos = 13;
const rad90DegLeft = -1.5708;
const spriteMapCols = 8;
const spriteMapRows = 8;
const totalRedShirtTextures = 6;
const totalBlueShirtTextures = 6;
const totalYellowShirtTextures = 6;

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
     * Makes a team member material for the game map.
     */
    private _makeMaterial(offCoordsX: number, offCoordsY: number, size: number[]): MeshBasicMaterial {
        const material: MeshBasicMaterial = new MeshBasicMaterial({
            color: 0xFFFFFF,
            map: this._textures.spriteMapAncientRuinsCrew.clone(),
            side: DoubleSide,
            transparent: true
        });

        material.map.offset = new Vector2(
            (1 / size[0]) * offCoordsX,
            (1 / size[1]) * offCoordsY);

        material.map.repeat = new Vector2(
            (1 / size[0]),
            (1 / size[1]));

        material.map.magFilter = NearestFilter;
        material.map.minFilter = NearestFilter;
        material.map.wrapS = RepeatWrapping;
        material.map.wrapT = RepeatWrapping;

        material.depthTest = false;
        material.map.needsUpdate = true;

        return material;
    }

    /**
     * Makes all the team member meshes for the game map.
     */
    private _makeMember(animationMeshArray: [Mesh, Mesh, Mesh], material: MeshBasicMaterial, index: number, row: number, col: number): void {
        animationMeshArray[index] = new Mesh( this._geometry, material );
        animationMeshArray[index].position.set(getXPos(col), layerYPos, getZPos(row));
        animationMeshArray[index].rotation.set(rad90DegLeft, 0, 0);
        animationMeshArray[index].name = `red-shirt-1-${index}`;
        animationMeshArray[index].visible = index ? false : true;
        this._scene.add(animationMeshArray[index]);
    }

    /**
     * Makes all the team member meshes for the game map.
     */
    private _makeMembers(): void {
        const middleCol = Math.floor(this._gridCtrl.getMaxCols() / 2);
        this._redShirt1 = this._ancientRuinsSpec.crew[0];
        this._redShirt2 = this._ancientRuinsSpec.crew[1];
        this._medicalOfficer = this._ancientRuinsSpec.crew[2];
        this._scienceOfficer = this._ancientRuinsSpec.crew[3];
        this._teamLeader = this._ancientRuinsSpec.crew[4];

        const redShirt1CrewDictionaryValue: CrewDictionaryValue = Object
            .entries(crewGraphicDictionary)
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) < totalRedShirtTextures)
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) === this._redShirt1.appearance)
            .map(entry => entry[1])[0];

        [0, 1, 2].forEach((val: number) => {
            console.log('Making Red Shirt 1');
            const offCoordsX = redShirt1CrewDictionaryValue.spritePositionX[val];
            const offCoordsY = redShirt1CrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = this._makeMaterial(offCoordsX, offCoordsY, size);
            this._makeMember(this._redShirt1.animationMeshes, material, val, 2, middleCol - 1);
        });

        const redShirt2CrewDictionaryValue: CrewDictionaryValue = Object
            .entries(crewGraphicDictionary)
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) < totalRedShirtTextures)
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) === this._redShirt2.appearance)
            .map(entry => entry[1])[0];

        [0, 1, 2].forEach((val: number) => {
            console.log('Making Red Shirt 2');
            const offCoordsX = redShirt2CrewDictionaryValue.spritePositionX[val];
            const offCoordsY = redShirt2CrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = this._makeMaterial(offCoordsX, offCoordsY, size);
            this._makeMember(this._redShirt2.animationMeshes, material, val, 2, middleCol + 1);
        });

        const medicalOfficerCrewDictionaryValue: CrewDictionaryValue = Object
            .entries(crewGraphicDictionary)
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) >= totalRedShirtTextures && Number(entry[0]) < (totalRedShirtTextures + totalBlueShirtTextures))
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) === this._medicalOfficer.appearance + totalRedShirtTextures)
            .map(entry => entry[1])[0];

        [0, 1, 2].forEach((val: number) => {
            console.log('Making Blue Shirt 1');
            const offCoordsX = medicalOfficerCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = medicalOfficerCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = this._makeMaterial(offCoordsX, offCoordsY, size);
            this._makeMember(this._medicalOfficer.animationMeshes, material, val, 1, middleCol - 1);
        });

        const scienceOfficerCrewDictionaryValue: CrewDictionaryValue = Object
            .entries(crewGraphicDictionary)
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) >= totalRedShirtTextures && Number(entry[0]) < (totalRedShirtTextures + totalBlueShirtTextures))
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) === this._scienceOfficer.appearance + totalRedShirtTextures)
            .map(entry => entry[1])[0];

        [0, 1, 2].forEach((val: number) => {
            console.log('Making Blue Shirt 2');
            const offCoordsX = scienceOfficerCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = scienceOfficerCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = this._makeMaterial(offCoordsX, offCoordsY, size);
            this._makeMember(this._scienceOfficer.animationMeshes, material, val, 1, middleCol + 1);
        });

        const teamLeaderCrewDictionaryValue: CrewDictionaryValue = Object
            .entries(crewGraphicDictionary)
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) >= (totalRedShirtTextures + totalBlueShirtTextures))
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) === this._teamLeader.appearance + (totalRedShirtTextures + totalBlueShirtTextures))
            .map(entry => entry[1])[0];

        [0, 1, 2].forEach((val: number) => {
            console.log('Making Yellow Shirt ');
            const offCoordsX = teamLeaderCrewDictionaryValue.spritePositionX[val];
            const offCoordsY = teamLeaderCrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = this._makeMaterial(offCoordsX, offCoordsY, size);
            this._makeMember(this._teamLeader.animationMeshes, material, val, 2, middleCol);
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
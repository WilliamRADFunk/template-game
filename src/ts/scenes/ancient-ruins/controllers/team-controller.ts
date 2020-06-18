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

    /**
     * All of the textures contained in this scene.
     */
    private _textures: { [key: string]: Texture } = {};

    constructor(scene: Scene, textures: { [key: string]: Texture }, ancientRuinsSpec: AncientRuinsSpecifications) {
        this._scene = scene;
        this._textures = textures;
        this._ancientRuinsSpec = ancientRuinsSpec;

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
    private _makeMembers(): void {
        this._redShirt1 = this._ancientRuinsSpec.crew[0];
        this._redShirt2 = this._ancientRuinsSpec.crew[1];
        this._medicalOfficer = this._ancientRuinsSpec.crew[2];
        this._scienceOfficer = this._ancientRuinsSpec.crew[3];
        this._teamLeader = this._ancientRuinsSpec.crew[4];

        const redShirt1CrewDictionaryValue: CrewDictionaryValue = Object
            .entries(crewGraphicDictionary)
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) < 6)
            .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) === this._redShirt1.appearance)
            .map(entry => entry[1])[0];
        
        [0, 1, 2].forEach((val: number) => {
            const offCoordsX = redShirt1CrewDictionaryValue.spritePositionX[val];
            const offCoordsY = redShirt1CrewDictionaryValue.spritePositionY[val];
            const size = [spriteMapCols, spriteMapRows];
            const material = this._makeMaterial(offCoordsX, offCoordsY, size);

            this._redShirt1.animationTextures[val] = new Mesh( this._geometry, material );
            this._redShirt1.animationTextures[val].position.set(1, layerYPos, 1)
            this._redShirt1.animationTextures[val].rotation.set(rad90DegLeft, 0, 0);
            this._redShirt1.animationTextures[val].name = `red-shirt-1-${val}`;
            this._redShirt1.animationTextures[val].visible = val ? false : true;
            this._scene.add(this._redShirt1.animationTextures[val]);
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
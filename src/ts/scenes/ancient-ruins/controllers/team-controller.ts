import { PlaneGeometry, Scene, Texture, MeshBasicMaterial, NearestFilter, RepeatWrapping, DoubleSide, Vector2 } from "three";

import { AncientRuinsSpecifications, CrewDictionary, TeamMember, CrewDictionaryValue } from "../../../models/ancient-ruins-specifications";

const crewGraphicDictionary: CrewDictionary = {
    1: { devDescription: 'Red Shirt - Human - Light - Black Hair', spritePositionX: [3, 4, 5], spritePositionY: [7, 7, 7] },
    2: { devDescription: 'Red Shirt - Human - Light - Bald Hair', spritePositionX: [3, 4, 5], spritePositionY: [6, 6, 6] },
    3: { devDescription: 'Red Shirt - Human - Light - Brown Hair', spritePositionX: [3, 4, 5], spritePositionY: [5, 5, 5] },
    4: { devDescription: 'Red Shirt - Human - Light - Red Hair', spritePositionX: [3, 4, 5], spritePositionY: [4, 4, 4] },
    5: { devDescription: 'Red Shirt - Human - Light - Blond Hair', spritePositionX: [3, 4, 5], spritePositionY: [3, 3, 3] },
    6: { devDescription: 'Red Shirt - Human - Dark - Black Hair', spritePositionX: [3, 4, 5], spritePositionY: [2, 2, 2] },

    7: { devDescription: 'Blue Shirt - Human - Light - Black Hair', spritePositionX: [0, 1, 2], spritePositionY: [7, 7, 7] },
    8: { devDescription: 'Blue Shirt - Human - Light - Bald Hair', spritePositionX: [0, 1, 2], spritePositionY: [6, 6, 6] },
    9: { devDescription: 'Blue Shirt - Human - Light - Brown Hair', spritePositionX: [0, 1, 2], spritePositionY: [5, 5, 5] },
    10: { devDescription: 'Blue Shirt - Human - Light - Red Hair', spritePositionX: [0, 1, 2], spritePositionY: [4, 4, 4] },
    11: { devDescription: 'Blue Shirt - Human - Light - Blond Hair', spritePositionX: [0, 1, 2], spritePositionY: [3, 3, 3] },
    12: { devDescription: 'Blue Shirt - Human - Dark - Black Hair', spritePositionX: [0, 1, 2], spritePositionY: [2, 2, 2] },

    13: { devDescription: 'Yellow Shirt - Human - Light - Black Hair', spritePositionX: [0, 1, 2], spritePositionY: [1, 1, 1] },
    14: { devDescription: 'Yellow Shirt - Human - Light - Bald Hair', spritePositionX: [0, 1, 2], spritePositionY: [0, 0, 0] },
    15: { devDescription: 'Yellow Shirt - Human - Light - Brown Hair', spritePositionX: [3, 4, 5], spritePositionY: [1, 1, 1] },
    16: { devDescription: 'Yellow Shirt - Human - Light - Red Hair', spritePositionX: [3, 4, 5], spritePositionY: [0, 0, 0] },
    17: { devDescription: 'Yellow Shirt - Human - Light - Blond Hair', spritePositionX: [6, 6, 6], spritePositionY: [7, 6, 5] },
    18: { devDescription: 'Yellow Shirt - Human - Dark - Black Hair', spritePositionX: [6, 6, 6], spritePositionY: [4, 3, 2] },
}

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
    }

    /**
     * Makes all the tile materials for the game map.
     */
    private _makeMaterials(): void {
        Object.entries(crewGraphicDictionary)
            .filter((entry: [string, CrewDictionaryValue]) => entry[0])
            .forEach((entry: [string, CrewDictionaryValue]) => {
                const offCoordsX = entry[1].spritePositionX;
                const offCoordsY = entry[1].spritePositionY;
                const size = this._tileCtrl.getGridDicCustomSize(key) || [spriteMapCols, spriteMapRows];

                if (offCoords[0] >= 0 && offCoords[1] >= 0) {
                    const material: MeshBasicMaterial = new MeshBasicMaterial({
                        color: 0xFFFFFF,
                        map: this._textures.spriteMapAncientRuins.clone(),
                        side: DoubleSide,
                        transparent: true
                    });

                    material.map.offset = new Vector2(
                        (1 / size[0]) * offCoords[0],
                        (1 / size[1]) * offCoords[1]);

                    material.map.repeat = new Vector2(
                        (1 / size[0]),
                        (1 / size[1]));

                    material.map.magFilter = NearestFilter;
                    material.map.minFilter = NearestFilter;
                    material.map.wrapS = RepeatWrapping;
                    material.map.wrapT = RepeatWrapping;

                    material.depthTest = false;
                    material.map.needsUpdate = true;

                    this._materialsMap[key] = material;
                }
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
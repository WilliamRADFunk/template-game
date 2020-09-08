import { Mesh } from "three";

export interface CrewDictionaryValue {
    devDescription: string;
    spritePositionX: [number, number, number];
    spritePositionY: [number, number, number];
}

export interface CrewDictionary {
    [key: number]: CrewDictionaryValue
}

export interface GridDictionaryValue {
    blocker?: boolean;
    customSize?: [number, number];
    devDescription: string;
    gameDescription: string;
    hasVariation?: boolean;
    spritePosition: [number, number];
    xPosMod?: number;
    xScaleMod?: number;
    zPosMod?: number;
    zScaleMod?: number;
}

export interface GridDictionary {
    [key: number]: GridDictionaryValue
}

export enum GroundMaterial {
    'Dirt' = 1,
    'Gravel' = 2,
    'Sand' = 3
}

export enum PlantColor {
    'Green' = 1,
    'Yellow' = 2,
    'Purple' = 3,
    'None' = 4
}

export enum TreeLeafColor {
    'Grey' = 1,
    'Red' = 2,
    'Purple' = 3,
    'Yellow' = 4,
    'Blue' = 5,
    'Brown' = 6,
    'Green' = 7,
    'None' = 8
}

export enum TreeTrunkColor {
    'Grey' = 1,
    'Yellow' = 2,
    'Purple' = 3,
    'Red' = 4,
    'Blue' = 5,
    'Brown' = 6,
    'None' = 7
}

export enum RuinsBiome {
    'Monastery' = 1,
    'Village' = 2,
    'Town' = 3,
    'City' = 4,
    'Military_Base' = 5,
    'Library' = 6,
    'Cemetery' = 7
}

/**
 * Essential information that each crew member must have to fascilitate the functioning in the game.
 */
export interface TeamMember {
    /**
     * Tracks position in walking animation sequence to know which animation to switch to next frame.
     */
    animationCounter: number;

    /**
     * The three meshes to flip through to simulate a walking animation.
     */
    animationMeshes: [Mesh, Mesh, Mesh];

    /**
     * Appearance here determines which of many graphics to use for crew member's avatar.
     */
    appearance: TeamMemberAppearance;

    /**
     * Current direction crew member should be facing.
     */
    currDirection: TeamMemberDirection;

    /**
     * Amount of energy left in crew member's life support.
     */
    energy: number;

    /**
     * Tiles in order that make up the crew member's path to travel.
     * Row, Column coordinates for each tile.
     */
    path: [number, number][];

    /**
     * Amount of remaining health for that crew member.
     * Zero means death.
     */
    health: number;

    /**
     * Flag to signal walking animation should be active.
     */
    isMoving?: boolean;

    /**
     * Flag to signal walking animation sound isPlaying.
     */
    isMovingSound?: boolean;

    /**
     * Crew member's name. ie. John Doe.
     */
    name: string;

    /**
     * Row, Column tile position of the crew member. 
     */
    position: [number, number];

    /**
     * Crew member's rank. An over-simplification of their abilities in the field.
     */
    rank: number;

    /**
     * Aside from health, status communicates other affects such as unconscious, injured, poisoned, etc.
     */
    status: TeamMemberStatus;

    /**
     * Value to place on tile's level layer when crew member is occupying it.
     */
    tileValue: number;

    /**
     * If crew member has a title such as Doctor, or Professor, it goes here.
     */
    title: string;
}

export enum TeamMemberAppearance {
    'Human_Light_Black' = 0,
    'Human_Light_Bald' = 1,
    'Human_Light_Brown' = 2,
    'Human_Light_Red' = 3,
    'Human_Light_Blond' = 4,
    'Human_Dark_Black' = 5
}

export enum TeamMemberDirection {
    'Down' = 0,
    'Down_Left' = 1,
    'Left' = 2,
    'Up_Left' = 3,
    'Up' = 4,
    'Up_Right' = 5,
    'Right' = 6,
    'Down_Right' = 7,
}

export enum TeamMemberStatus {
    'Healthy' = 0,
    'Injured' = 1,
    'Ill' = 2,
    'Dead' = 3,
    'Unconscious' = 4
}

export enum WaterBiome {
    'Large_Lake' = 1,
    'Beach' = 2,
    'River' = 3,
    'Creek' = 4,
    'Small_Lakes' = 5
}

export enum WaterColor {
    'Blue' = 1,
    'Green' = 2,
    'Purple' = 3,
    'None' = 4
}

export interface AncientRuinsSpecifications {
    biomeRuins: RuinsBiome;
    biomeWater: WaterBiome;
    crew: TeamMember[];
    groundMaterial: GroundMaterial;
    hasAnimalLife?: boolean;
    hasClouds: boolean;
    plantColor: PlantColor;
    plantPercentage: number;
    plantSpreadability: number;
    treeLeafColor: TreeLeafColor;
    treePercentage: number;
    treeTrunkColor: TreeTrunkColor;
    waterColor: WaterColor;
    waterPercentage: number;
    waterSpreadability: number;
}
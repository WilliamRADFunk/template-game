export enum OreQuantity {
    'Sparse' = 2,
    'Low' = 2.75,
    'Average' = 3.5,
    'High' = 4.25,
    'Plentiful' = 5,
}

export enum OreTypes {
    'Iron' = 1,
    'Gold' = 2,
    'Copper' = 3,
    'Deuterium' = 4,
    'Aluminum' = 5
}

export const OreTypeColors = [
    '',
    '#676767',
    '#FFFF66',
    '#B87333',
    '#C90596',
    '#D6D6D6'
];

export const PlanetLandColors = [
    '#000000',
    '#21abcd',
    '#006a4e',
    '#6e7f80',
    '#5d36fa',
    '#b94e48',
    '#ffbf00'
]

export enum PlanetLandTypes {
    'Blue' = 1,
    'Green' = 2,
    'Grey' = 3,
    'Purple' = 4,
    'Red' = 5,
    'Yellow' = 6
}

export const SkyColors = [
    '#000000',
    '#0081ce',
    '#4cb785',
    '#54626f',
    '#d891ef',
    '#c32148',
    '#f0dc82'
];

export enum SkyTypes {
    'Blue' = 1,
    'Green' = 2,
    'Grey' = 3,
    'Purple' = 4,
    'Red' = 5,
    'Yellow' = 6
}

export interface PlanetSpecifications {
    gravity: number;
    hasWater: boolean;
    isFrozen: boolean;
    isLife: boolean;
    ore: OreTypes;
    oreQuantity: OreQuantity;
    peakElevation: number;
    planetBase: PlanetLandTypes;
    skyBase: SkyTypes;
    wind: number;
}
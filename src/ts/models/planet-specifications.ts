export enum OreQuantity {
    "Plentiful" = 5,
    "High" = 4.25,
    "Average" = 3.5,
    "Low" = 2.75,
    "Sparse" = 2
}

export enum OreTypes {
    "Iron" = 0,
    "Gold" = 1,
    "Copper" = 2,
    "Deuterium" = 3,
    "Aluminum" = 4
}

export const OreTypeColors = [
    "#676767",
    "#FFFF66",
    "#B87333",
    "#C90596",
    "#D6D6D6"
];

export interface PlanetSpecifications {
    gravity: number;
    hasWater: boolean;
    isFrozen: boolean;
    isLife: boolean;
    ore: OreTypes;
    oreQuantity: OreQuantity;
    peakElevation: number;
    planetBase: string;
    skyBase: string;
    wind: number;
}
import { CrewDictionary, CrewDictionaryValue, TeamMemberAppearance } from "../../../models/ancient-ruins-specifications";

export const crewGraphicDictionary: CrewDictionary = {
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
};

export const spriteMapCols = 8;

export const spriteMapRows = 8;

export const totalRedShirtTextures = 6;

export const totalBlueShirtTextures = 6;

export const totalYellowShirtTextures = 6;

export enum ShirtColor {
    'Blue' = 0,
    'Red' = 1,
    'Yellow' = 2
}

function findBlueShirtValue(appearanceValue: TeamMemberAppearance): CrewDictionaryValue {
    return Object
        .entries(crewGraphicDictionary)
        .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) >= totalRedShirtTextures && Number(entry[0]) < (totalRedShirtTextures + totalBlueShirtTextures))
        .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) === appearanceValue + totalRedShirtTextures)
        .map(entry => entry[1])[0];
}

function findRedShirtValue(appearanceValue: TeamMemberAppearance): CrewDictionaryValue {
    return Object
        .entries(crewGraphicDictionary)
        .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) < totalRedShirtTextures)
        .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) === appearanceValue)
        .map(entry => entry[1])[0];
}

function findYellowShirtValue(appearanceValue: TeamMemberAppearance): CrewDictionaryValue {
    return Object
        .entries(crewGraphicDictionary)
        .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) >= (totalRedShirtTextures + totalBlueShirtTextures))
        .filter((entry: [string, CrewDictionaryValue]) => Number(entry[0]) === appearanceValue + (totalRedShirtTextures + totalBlueShirtTextures))
        .map(entry => entry[1])[0];
}

export function findMemberValue(appearanceValue: TeamMemberAppearance, shirtColor: ShirtColor): CrewDictionaryValue {
    switch(shirtColor) {
        case ShirtColor.Blue: {
            return findBlueShirtValue(appearanceValue);
        }
        case ShirtColor.Red: {
            return findRedShirtValue(appearanceValue);
        }
        case ShirtColor.Yellow: {
            return findYellowShirtValue(appearanceValue);
        }
    }
}

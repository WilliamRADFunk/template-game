import {
    FrontSide,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PlaneGeometry,
    Scene,
    Texture,
    Vector2,
    NearestFilter,
    RepeatWrapping} from "three";
import { AncientRuinsSpecifications, WaterBiome, RuinsBiome, PlantColor, WaterColor } from "../../../models/ancient-ruins-specifications";

interface GridDictionary {
    [key: number]: {
        blocker?: boolean;
        devDescription: string;
        gameDescription: string;
        hasVariation?: boolean;
        spritePosition: [number, number];
        xPosMod?: number;
        xScaleMod?: number;
        zPosMod?: number;
        zScaleMod?: number;
    }
}

const groundGrassBase = 202;
const groundGrassEnd = groundGrassBase + 20;
const waterBase = 1200;
const waterEnd = 1999;
const bridgeBase = 2000;
const bridgeEnd = 2999;

// Lookup table for grass tiles when assigning edge graphics.
const grassLookupTable: { [key: string]: number } = {
    '0000': groundGrassBase,
    '1000': groundGrassBase + 2,
    '1100': groundGrassBase + 3,
    '0100': groundGrassBase + 4,
    '0110': groundGrassBase + 5,
    '0010': groundGrassBase + 6,
    '0011': groundGrassBase + 7,
    '0001': groundGrassBase + 8,
    '1001': groundGrassBase + 9,
    '1101': groundGrassBase + 10,
    '1110': groundGrassBase + 11,
    '0111': groundGrassBase + 12,
    '1011': groundGrassBase + 13,
    '1010': groundGrassBase + 14,
    '0101': groundGrassBase + 15,
    'sparse': groundGrassBase + 16,
    'mixed': groundGrassBase + 18,
    '1111': groundGrassBase + 20
};

// Lookup table for water tiles when assigning edge graphics.
const waterLookupTable: { [key: string]: number } = {
    '0000-0000': waterBase,
    '1000-0000': waterBase + 1,
    '1000-1000': waterBase + 1,
    '1000-0001': waterBase + 1,
    '1000-1001': waterBase + 1,
    '1100-0000': waterBase + 2,
    '1100-1000': waterBase + 2,
    '1100-0100': waterBase + 2,
    '1100-0001': waterBase + 2,
    '1100-1001': waterBase + 2,
    '1100-0101': waterBase + 2,
    '1100-1101': waterBase + 2,
    '1100-1100': waterBase + 2,
    '0100-0000': waterBase + 3,
    '0100-1000': waterBase + 3,
    '0100-0100': waterBase + 3,
    '0100-1100': waterBase + 3,
    '0110-0000': waterBase + 4,
    '0110-0100': waterBase + 4,
    '0110-1000': waterBase + 4,
    '0110-0010': waterBase + 4,
    '0110-1100': waterBase + 4,
    '0110-0110': waterBase + 4,
    '0110-1010': waterBase + 4,
    '0110-1110': waterBase + 4,
    '0010-0000': waterBase + 5,
    '0010-0100': waterBase + 5,
    '0010-0010': waterBase + 5,
    '0010-0110': waterBase + 5,
    '0011-0000': waterBase + 6,
    '0011-0010': waterBase + 6,
    '0011-0100': waterBase + 6,
    '0011-0001': waterBase + 6,
    '0011-0110': waterBase + 6,
    '0011-0011': waterBase + 6,
    '0011-0101': waterBase + 6,
    '0011-0111': waterBase + 6,
    '0001-0000': waterBase + 7,
    '0001-0010': waterBase + 7,
    '0001-0001': waterBase + 7,
    '0001-0011': waterBase + 7,
    '1001-0000': waterBase + 8,
    '1001-0001': waterBase + 8,
    '1001-1000': waterBase + 8,
    '1001-0010': waterBase + 8,
    '1001-1010': waterBase + 8,
    '1001-0011': waterBase + 8,
    '1001-1001': waterBase + 8,
    '1001-1011': waterBase + 8,
    '0000-0001': waterBase + 9,
    '0000-1000': waterBase + 10,
    '0000-0100': waterBase + 11,
    '0000-0010': waterBase + 12,
    '0000-0101': waterBase + 13,
    '0000-1010': waterBase + 14,
    '1111-1111': waterBase + 15,
    '1111-0111': waterBase + 15,
    '1111-1011': waterBase + 15,
    '1111-1101': waterBase + 15,
    '1111-1110': waterBase + 15,
    '1111-1100': waterBase + 15,
    '1111-0110': waterBase + 15,
    '1111-0011': waterBase + 15,
    '1111-1001': waterBase + 15,
    '1111-1000': waterBase + 15,
    '1111-0100': waterBase + 15,
    '1111-0010': waterBase + 15,
    '1111-0001': waterBase + 15,
    '1111-0000': waterBase + 15,
    '1111-1010': waterBase + 15,
    '1111-0101': waterBase + 15,
    '0001-0100': waterBase + 16,
    '0001-0111': waterBase + 16,
    '0001-0101': waterBase + 16,
    '0001-0110': waterBase + 16,
    '0100-0010': waterBase + 17,
    '0100-1110': waterBase + 17,
    '0100-1010': waterBase + 17,
    '0100-0110': waterBase + 17,
    '0001-1000': waterBase + 18,
    '0001-1011': waterBase + 18,
    '0001-1001': waterBase + 18,
    '0001-1010': waterBase + 18,
    '0100-0001': waterBase + 19,
    '0100-1101': waterBase + 19,
    '0100-0101': waterBase + 19,
    '0100-1001': waterBase + 19,
    '0010-0001': waterBase + 20,
    '0010-0111': waterBase + 20,
    '0010-0011': waterBase + 20,
    '0010-0101': waterBase + 20,
    '0010-1000': waterBase + 21,
    '0010-1110': waterBase + 21,
    '0010-1010': waterBase + 21,
    '0010-1100': waterBase + 21,
    '1000-0010': waterBase + 22,
    '1000-1011': waterBase + 22,
    '1000-0011': waterBase + 22,
    '1000-1010': waterBase + 22,
    '1000-0100': waterBase + 23,
    '1000-1101': waterBase + 23,
    '1000-0101': waterBase + 23,
    '1000-1100': waterBase + 23
};

const fiftyFifty = () => Math.random() < 0.5;
const rad90DegLeft = -1.5708;

const maxCols = 29;
const maxRows = 29;
const minCols = 0;
const minRows = 0;
const middleCol = Math.ceil((maxCols - minCols) / 2);
const middleRow = Math.ceil((maxRows - minRows) / 2);
const layer1YPos = 0;
const layer2YPos = -2;

const getXPos = function(col: number): number {
    return -5.8 + (col/2.5);
};
const getZPos = function(row: number): number {
    return 5.8 - (row/2.5);
};

const spriteMapCols = 32;
const spriteMapRows = 32;
const gridDictionary: GridDictionary = {
    // Ground & Grass
    2: { devDescription: 'Green Grass (whole tile) - Version 1', gameDescription: 'Lush green grass', spritePosition: [1, 1], hasVariation: true },
    3: { devDescription: 'Green Grass (whole tile) - Version 2', gameDescription: 'Lush green grass', spritePosition: [3, 3] },
    4: { devDescription: 'Green Grass (Dirt at top)', gameDescription: 'Lush green grass with dirt framing its northern edge', spritePosition: [1, 2] },
    5: { devDescription: 'Green Grass (Dirt at top & right)', gameDescription: 'Lush green grass with dirt framing its northern and eastern edges', spritePosition: [2, 2] },
    6: { devDescription: 'Green Grass (Dirt at right)', gameDescription: 'Lush green grass with dirt framing its eastern edge', spritePosition: [2, 1] },
    7: { devDescription: 'Green Grass (Dirt at right & bottom)', gameDescription: 'Lush green grass with dirt framing its southern and eastern edges', spritePosition: [2, 0] },
    8: { devDescription: 'Green Grass (Dirt at bottom)', gameDescription: 'Lush green grass with dirt framing its southern edge', spritePosition: [1, 0] },
    9: { devDescription: 'Green Grass (Dirt at bottom & left)', gameDescription: 'Lush green grass with dirt framing its southern and western edges', spritePosition: [0, 0] },
    10: { devDescription: 'Green Grass (Dirt at left)', gameDescription: 'Lush green grass with dirt framing its western edge', spritePosition: [0, 1] },
    11: { devDescription: 'Green Grass (Dirt at left & top)', gameDescription: 'Lush green grass with dirt framing its northern and western edges', spritePosition: [0, 2] },
    12: { devDescription: 'Green Grass (Dirt at left & top & right)', gameDescription: 'Lush green grass with dirt framing its northern, eastern and western edges', spritePosition: [3, 2] },
    13: { devDescription: 'Green Grass (Dirt at top & right & bottom)', gameDescription: 'Lush green grass with dirt framing its northern, southern and western edges', spritePosition: [2, 3] },
    14: { devDescription: 'Green Grass (Dirt at right & bottom & left)', gameDescription: 'Lush green grass with dirt framing its southern, eastern and western edges', spritePosition: [3, 0] },
    15: { devDescription: 'Green Grass (Dirt at bottom & left & top)', gameDescription: 'Lush green grass with dirt framing its northern, southern and eastern edges', spritePosition: [0, 3] },
    16: { devDescription: 'Green Grass (Dirt at top & bottom)', gameDescription: 'Lush green grass with dirt framing its northern and southern edges', spritePosition: [1, 3] },
    17: { devDescription: 'Green Grass (Dirt at left & right)', gameDescription: 'Lush green grass with dirt framing its eastern and western edges', spritePosition: [3, 1] },
    18: { devDescription: 'Green Grass (Dirt at sides only) - Version 1', gameDescription: 'Sparse green grass with dirt framing all of its edges', spritePosition: [4, 2] },
    19: { devDescription: 'Green Grass (Dirt at sides only) - Version 2', gameDescription: 'Sparse green grass with dirt framing all of its edges', spritePosition: [5, 2] },
    20: { devDescription: 'Green Grass (Dirt at corners only) - Version 1', gameDescription: 'Green grass mixed with patches of dirt', spritePosition: [4, 1], hasVariation: true },
    21: { devDescription: 'Green Grass (Dirt at corners only) - Version 2', gameDescription: 'Green grass mixed with patches of dirt', spritePosition: [5, 1] },
    22: { devDescription: 'Green Grass (Dirt all around)', gameDescription: 'Lush green grass with dirt framing all of its edges', spritePosition: [4, 3] },
    23: { devDescription: 'Brown Dirt (whole tile) - Version 1', gameDescription: 'Ordinary dirt', spritePosition: [4, 0], hasVariation: true },
    24: { devDescription: 'Brown Dirt (whole tile) - Version 2', gameDescription: 'Ordinary dirt', spritePosition: [5, 0] },

    102: { devDescription: 'Green Grass (whole tile) - Version 1', gameDescription: 'Lush green grass', spritePosition: [7, 1], hasVariation: true },
    103: { devDescription: 'Green Grass (whole tile) - Version 2', gameDescription: 'Lush green grass', spritePosition: [9, 3] },
    104: { devDescription: 'Green Grass (Sand at top)', gameDescription: 'Lush green grass with sand framing its northern edge', spritePosition: [7, 2] },
    105: { devDescription: 'Green Grass (Sand at top & right)', gameDescription: 'Lush green grass with sand framing its northern and eastern edges', spritePosition: [8, 2] },
    106: { devDescription: 'Green Grass (Sand at right)', gameDescription: 'Lush green grass with sand framing its eastern edge', spritePosition: [8, 1] },
    107: { devDescription: 'Green Grass (Sand at right & bottom)', gameDescription: 'Lush green grass with sand framing its southern and eastern edges', spritePosition: [8, 0] },
    108: { devDescription: 'Green Grass (Sand at bottom)', gameDescription: 'Lush green grass with sand framing its southern edge', spritePosition: [7, 0] },
    109: { devDescription: 'Green Grass (Sand at bottom & left)', gameDescription: 'Lush green grass with sand framing its southern and western edges', spritePosition: [6, 0] },
    110: { devDescription: 'Green Grass (Sand at left)', gameDescription: 'Lush green grass with sand framing its western edge', spritePosition: [6, 1] },
    111: { devDescription: 'Green Grass (Sand at left & top)', gameDescription: 'Lush green grass with sand framing its northern and western edges', spritePosition: [6, 2] },
    112: { devDescription: 'Green Grass (Sand at left & top & right)', gameDescription: 'Lush green grass with sand framing its northern, eastern and western edges', spritePosition: [9, 2] },
    113: { devDescription: 'Green Grass (Sand at top & right & bottom)', gameDescription: 'Lush green grass with sand framing its northern, southern and western edges', spritePosition: [8, 3] },
    114: { devDescription: 'Green Grass (Sand at right & bottom & left)', gameDescription: 'Lush green grass with sand framing its southern, eastern and western edges', spritePosition: [9, 0] },
    115: { devDescription: 'Green Grass (Sand at bottom & left & top)', gameDescription: 'Lush green grass with sand framing its northern, southern and eastern edges', spritePosition: [6, 3] },
    116: { devDescription: 'Green Grass (Sand at top & bottom)', gameDescription: 'Lush green grass with sand framing its northern and southern edges', spritePosition: [7, 3] },
    117: { devDescription: 'Green Grass (Sand at left & right)', gameDescription: 'Lush green grass with sand framing its eastern and western edges', spritePosition: [9, 1] },
    118: { devDescription: 'Green Grass (Sand at sides only) - Version 1', gameDescription: 'Sparse green grass with sand framing all of its edges', spritePosition: [10, 2] },
    119: { devDescription: 'Green Grass (Sand at sides only) - Version 2', gameDescription: 'Sparse green grass with sand framing all of its edges', spritePosition: [11, 2] },
    120: { devDescription: 'Green Grass (Sand at corners only) - Version 1', gameDescription: 'Green grass mixed with patches of sand', spritePosition: [10, 1], hasVariation: true },
    121: { devDescription: 'Green Grass (Sand at corners only) - Version 2', gameDescription: 'Green grass mixed with patches of sand', spritePosition: [11, 1] },
    122: { devDescription: 'Green Grass (Sand all around)', gameDescription: 'Lush green grass with sand framing all of its edges', spritePosition: [10, 3] },
    123: { devDescription: 'White Sand (whole tile) - Version 1', gameDescription: 'Ordinary sand', spritePosition: [10, 0], hasVariation: true },
    124: { devDescription: 'White Sand (whole tile) - Version 2', gameDescription: 'Ordinary sand', spritePosition: [11, 0] },

    202: { devDescription: 'Green Grass (whole tile) - Version 1', gameDescription: 'Lush green grass', spritePosition: [13, 1], hasVariation: true },
    203: { devDescription: 'Green Grass (whole tile) - Version 2', gameDescription: 'Lush green grass', spritePosition: [15, 3] },
    204: { devDescription: 'Green Grass (Gravel at top)', gameDescription: 'Lush green grass with gravel framing its northern edge', spritePosition: [13, 2] },
    205: { devDescription: 'Green Grass (Gravel at top & right)', gameDescription: 'Lush green grass with gravel framing its northern and eastern edges', spritePosition: [14, 2] },
    206: { devDescription: 'Green Grass (Gravel at right)', gameDescription: 'Lush green grass with gravel framing its eastern edge', spritePosition: [14, 1] },
    207: { devDescription: 'Green Grass (Gravel at right & bottom)', gameDescription: 'Lush green grass with gravel framing its southern and eastern edges', spritePosition: [14, 0] },
    208: { devDescription: 'Green Grass (Gravel at bottom)', gameDescription: 'Lush green grass with gravel framing its southern edge', spritePosition: [13, 0] },
    209: { devDescription: 'Green Grass (Gravel at bottom & left)', gameDescription: 'Lush green grass with gravel framing its southern and western edges', spritePosition: [12, 0] },
    210: { devDescription: 'Green Grass (Gravel at left)', gameDescription: 'Lush green grass with gravel framing its western edge', spritePosition: [12, 1] },
    211: { devDescription: 'Green Grass (Gravel at left & top)', gameDescription: 'Lush green grass with gravel framing its northern and western edges', spritePosition: [12, 2] },
    212: { devDescription: 'Green Grass (Gravel at left & top & right)', gameDescription: 'Lush green grass with gravel framing its northern, eastern and western edges', spritePosition: [15, 2] },
    213: { devDescription: 'Green Grass (Gravel at top & right & bottom)', gameDescription: 'Lush green grass with gravel framing its northern, southern and western edges', spritePosition: [14, 3] },
    214: { devDescription: 'Green Grass (Gravel at right & bottom & left)', gameDescription: 'Lush green grass with gravel framing its southern, eastern and western edges', spritePosition: [15, 0] },
    215: { devDescription: 'Green Grass (Gravel at bottom & left & top)', gameDescription: 'Lush green grass with gravel framing its northern, southern and eastern edges', spritePosition: [12, 3] },
    216: { devDescription: 'Green Grass (Gravel at top & bottom)', gameDescription: 'Lush green grass with gravel framing its northern and southern edges', spritePosition: [13, 3] },
    217: { devDescription: 'Green Grass (Gravel at left & right)', gameDescription: 'Lush green grass with gravel framing its eastern and western edges', spritePosition: [15, 1] },
    218: { devDescription: 'Green Grass (Gravel at sides only) - Version 1', gameDescription: 'Sparse green grass with gravel framing all of its edges', spritePosition: [16, 2] },
    219: { devDescription: 'Green Grass (Gravel at sides only) - Version 2', gameDescription: 'Sparse green grass with gravel framing all of its edges', spritePosition: [17, 2] },
    220: { devDescription: 'Green Grass (Gravel at corners only) - Version 1', gameDescription: 'Green grass mixed with patches of gravel', spritePosition: [16, 1], hasVariation: true },
    221: { devDescription: 'Green Grass (Gravel at corners only) - Version 2', gameDescription: 'Green grass mixed with patches of gravel', spritePosition: [17, 1] },
    222: { devDescription: 'Green Grass (Gravel all around)', gameDescription: 'Lush green grass with gravel framing all of its edges', spritePosition: [16, 3] },
    223: { devDescription: 'White Gravel (whole tile) - Version 1', gameDescription: 'Ordinary gravel', spritePosition: [16, 0], hasVariation: true },
    224: { devDescription: 'White Gravel (whole tile) - Version 2', gameDescription: 'Ordinary gravel', spritePosition: [17, 0] },

    // Water
    1000: { devDescription: 'Blue Water (whole tile)', gameDescription: 'Blue water', spritePosition: [1, 5] },
    1001: { devDescription: 'Blue Water (Dirt at top)', gameDescription: 'Blue water with dirt framing its northern edge', spritePosition: [1, 6] },
    1002: { devDescription: 'Blue Water (Dirt at top & right)', gameDescription: 'Blue water with dirt framing its northern and eastern edges', spritePosition: [2, 6] },
    1003: { devDescription: 'Blue Water (Dirt at right)', gameDescription: 'Blue water with dirt framing its eastern edge', spritePosition: [2, 5] },
    1004: { devDescription: 'Blue Water (Dirt at right & bottom)', gameDescription: 'Blue water with dirt framing its southern and eastern edges', spritePosition: [2, 4] },
    1005: { devDescription: 'Blue Water (Dirt at bottom)', gameDescription: 'Blue water with dirt framing its southern edge', spritePosition: [1, 4] },
    1006: { devDescription: 'Blue Water (Dirt at bottom & left)', gameDescription: 'Blue water with dirt framing its southern and western edges', spritePosition: [0, 4] },
    1007: { devDescription: 'Blue Water (Dirt at left)', gameDescription: 'Blue water with dirt framing its western edge', spritePosition: [0, 5] },
    1008: { devDescription: 'Blue Water (Dirt at left & top)', gameDescription: 'Blue water with dirt framing its northern and western edges', spritePosition: [0, 6] },
    1009: { devDescription: 'Blue Water (Dirt at upper-left)', gameDescription: 'Blue water with dirt at its northwestern corner', spritePosition: [3, 4] },
    1010: { devDescription: 'Blue Water (Dirt at upper-right)', gameDescription: 'Blue water with dirt at its northeastern corner', spritePosition: [4, 4] },
    1011: { devDescription: 'Blue Water (Dirt at lower-left)', gameDescription: 'Blue water with dirt at its southwestern corner', spritePosition: [4, 5] },
    1012: { devDescription: 'Blue Water (Dirt at lower-right)', gameDescription: 'Blue water with dirt at its southeastern corner', spritePosition: [3, 5] },
    1013: { devDescription: 'Blue Water (Dirt at upper-left & lower-right)', gameDescription: 'Blue water with dirt at its northwestern & southeastern corners', spritePosition: [4, 6] },
    1014: { devDescription: 'Blue Water (Dirt at upper-right & lower-left)', gameDescription: 'Blue water with dirt at its northeastern & southwestern corners', spritePosition: [3, 6] },
    1015: { devDescription: 'Blue Water (Dirt at top & bottom, left & right)', gameDescription: 'Blue water with dirt framing all of its edges', spritePosition: [0, 7] },
    1016: { devDescription: 'Blue Water (Dirt at left & lower-right)', gameDescription: 'Blue water with dirt at its western edge and southeastern', spritePosition: [1, 7] },
    1017: { devDescription: 'Blue Water (Dirt at right & lower-left)', gameDescription: 'Blue water with dirt at its eastern edge and southwestern', spritePosition: [2, 7] },
    1018: { devDescription: 'Blue Water (Dirt at left & upper-right)', gameDescription: 'Blue water with dirt at its western edge and northeastern', spritePosition: [3, 7] },
    1019: { devDescription: 'Blue Water (Dirt at right & upper-left)', gameDescription: 'Blue water with dirt at its eastern edge and northwestern', spritePosition: [4, 7] },
    1020: { devDescription: 'Blue Water (Dirt at bottom & upper-left)', gameDescription: 'Blue water with dirt at its southern edge and northwestern', spritePosition: [0, 8] },
    1021: { devDescription: 'Blue Water (Dirt at bottom & upper-right)', gameDescription: 'Blue water with dirt at its southern edge and northeastern', spritePosition: [1, 8] },
    1022: { devDescription: 'Blue Water (Dirt at top & lower-left)', gameDescription: 'Blue water with dirt at its northern edge and southwestern', spritePosition: [2, 8] },
    1023: { devDescription: 'Blue Water (Dirt at top & lower-right)', gameDescription: 'Blue water with dirt at its northern edge and southeastern', spritePosition: [3, 8] },
    1024: { devDescription: 'Brown Boulder in Blue Water - Version 1', gameDescription: 'A massive brown boulder breaches the surface of the deep blue waters', spritePosition: [5, 4], blocker: true },
    1025: { devDescription: 'Brown Boulder in Blue Water - Version 2', gameDescription: 'A massive brown boulder breaches the surface of the deep blue waters', spritePosition: [5, 5], blocker: true },
    1026: { devDescription: 'Brown Boulder in Blue Water - Version 3', gameDescription: 'A massive brown boulder breaches the surface of the deep blue waters', spritePosition: [5, 6], blocker: true },
    1027: { devDescription: 'Grey Boulder in Blue Water - Version 1', gameDescription: 'A massive grey boulder breaches the surface of the deep blue waters', spritePosition: [5, 7], blocker: true },
    1028: { devDescription: 'Grey Boulder in Blue Water - Version 2', gameDescription: 'A massive grey boulder breaches the surface of the deep blue waters', spritePosition: [5, 8], blocker: true },
    1029: { devDescription: 'Grey Boulder in Blue Water - Version 3', gameDescription: 'A massive grey boulder breaches the surface of the deep blue waters', spritePosition: [4, 8], blocker: true },
    1030: { devDescription: 'Invisible barrier marking water too deep to cross', gameDescription: 'Blue water too deep to traverse on foot', spritePosition: [-1, -1], blocker: true },

    1100: { devDescription: 'Blue Water (whole tile)', gameDescription: 'Blue water', spritePosition: [7, 5] },
    1101: { devDescription: 'Blue Water (Sand at top)', gameDescription: 'Blue water with sand framing its northern edge', spritePosition: [7, 6] },
    1102: { devDescription: 'Blue Water (Sand at top & right)', gameDescription: 'Blue water with sand framing its northern and eastern edges', spritePosition: [8, 6] },
    1103: { devDescription: 'Blue Water (Sand at right)', gameDescription: 'Blue water with sand framing its eastern edge', spritePosition: [8, 5] },
    1104: { devDescription: 'Blue Water (Sand at right & bottom)', gameDescription: 'Blue water with sand framing its southern and eastern edges', spritePosition: [8, 4] },
    1105: { devDescription: 'Blue Water (Sand at bottom)', gameDescription: 'Blue water with sand framing its southern edge', spritePosition: [7, 4] },
    1106: { devDescription: 'Blue Water (Sand at bottom & left)', gameDescription: 'Blue water with sand framing its southern and western edges', spritePosition: [6, 4] },
    1107: { devDescription: 'Blue Water (Sand at left)', gameDescription: 'Blue water with sand framing its western edge', spritePosition: [6, 5] },
    1108: { devDescription: 'Blue Water (Sand at left & top)', gameDescription: 'Blue water with sand framing its northern and western edges', spritePosition: [6, 6] },
    1109: { devDescription: 'Blue Water (Sand at upper-left)', gameDescription: 'Blue water with sand at its northwestern corner', spritePosition: [9, 4] },
    1110: { devDescription: 'Blue Water (Sand at upper-right)', gameDescription: 'Blue water with sand at its northeastern corner', spritePosition: [10, 4] },
    1111: { devDescription: 'Blue Water (Sand at lower-left)', gameDescription: 'Blue water with sand at its southwestern corner', spritePosition: [10, 5] },
    1112: { devDescription: 'Blue Water (Sand at lower-right)', gameDescription: 'Blue water with sand at its southeastern corner', spritePosition: [9, 5] },
    1113: { devDescription: 'Blue Water (Sand at upper-left & lower-right)', gameDescription: 'Blue water with sand at its northwestern & southeastern corners', spritePosition: [10, 6] },
    1114: { devDescription: 'Blue Water (Sand at upper-right & lower-left)', gameDescription: 'Blue water with sand at its northeastern & southwestern corners', spritePosition: [9, 6] },
    1115: { devDescription: 'Blue Water (Sand at top & bottom, left & right)', gameDescription: 'Blue water with sand framing all of its edges', spritePosition: [6, 7] },
    1116: { devDescription: 'Blue Water (Sand at left & lower-right)', gameDescription: 'Blue water with sand at its western edge and southeastern', spritePosition: [7, 7] },
    1117: { devDescription: 'Blue Water (Sand at right & lower-left)', gameDescription: 'Blue water with sand at its eastern edge and southwestern', spritePosition: [8, 7] },
    1118: { devDescription: 'Blue Water (Sand at left & upper-right)', gameDescription: 'Blue water with sand at its western edge and northeastern', spritePosition: [9, 7] },
    1119: { devDescription: 'Blue Water (Sand at right & upper-left)', gameDescription: 'Blue water with sand at its eastern edge and northwestern', spritePosition: [10, 7] },
    1120: { devDescription: 'Blue Water (Sand at bottom & upper-left)', gameDescription: 'Blue water with sand at its southern edge and northwestern', spritePosition: [6, 8] },
    1121: { devDescription: 'Blue Water (Sand at bottom & upper-right)', gameDescription: 'Blue water with sand at its southern edge and northeastern', spritePosition: [7, 8] },
    1122: { devDescription: 'Blue Water (Sand at top & lower-left)', gameDescription: 'Blue water with sand at its northern edge and southwestern', spritePosition: [8, 8] },
    1123: { devDescription: 'Blue Water (Sand at top & lower-right)', gameDescription: 'Blue water with sand at its northern edge and southeastern', spritePosition: [9, 8] },
    1124: { devDescription: 'Beige Boulder in Blue Water - Version 1', gameDescription: 'A massive beige boulder breaches the surface of the deep blue waters', spritePosition: [11, 4], blocker: true },
    1125: { devDescription: 'Beige Boulder in Blue Water - Version 2', gameDescription: 'A massive beige boulder breaches the surface of the deep blue waters', spritePosition: [11, 5], blocker: true },
    1126: { devDescription: 'Beige Boulder in Blue Water - Version 3', gameDescription: 'A massive beige boulder breaches the surface of the deep blue waters', spritePosition: [11, 6], blocker: true },
    1127: { devDescription: 'Grey Boulder in Blue Water - Version 1', gameDescription: 'A massive grey boulder breaches the surface of the deep blue waters', spritePosition: [11, 7], blocker: true },
    1128: { devDescription: 'Grey Boulder in Blue Water - Version 2', gameDescription: 'A massive grey boulder breaches the surface of the deep blue waters', spritePosition: [11, 8], blocker: true },
    1129: { devDescription: 'Grey Boulder in Blue Water - Version 3', gameDescription: 'A massive grey boulder breaches the surface of the deep blue waters', spritePosition: [10, 8], blocker: true },
    1130: { devDescription: 'Invisible barrier marking water too deep to cross', gameDescription: 'Blue water too deep to traverse on foot', spritePosition: [-1, -1], blocker: true },

    1200: { devDescription: 'Blue Water (whole tile)', gameDescription: 'Blue water', spritePosition: [13, 5] },
    1201: { devDescription: 'Blue Water (Gravel at top)', gameDescription: 'Blue water with gravel framing its northern edge', spritePosition: [13, 6] },
    1202: { devDescription: 'Blue Water (Gravel at top & right)', gameDescription: 'Blue water with gravel framing its northern and eastern edges', spritePosition: [14, 6] },
    1203: { devDescription: 'Blue Water (Gravel at right)', gameDescription: 'Blue water with gravel framing its eastern edge', spritePosition: [14, 5] },
    1204: { devDescription: 'Blue Water (Gravel at right & bottom)', gameDescription: 'Blue water with gravel framing its southern and eastern edges', spritePosition: [14, 4] },
    1205: { devDescription: 'Blue Water (Gravel at bottom)', gameDescription: 'Blue water with gravel framing its southern edge', spritePosition: [13, 4] },
    1206: { devDescription: 'Blue Water (Gravel at bottom & left)', gameDescription: 'Blue water with gravel framing its southern and western edges', spritePosition: [12, 4] },
    1207: { devDescription: 'Blue Water (Gravel at left)', gameDescription: 'Blue water with gravel framing its western edge', spritePosition: [12, 5] },
    1208: { devDescription: 'Blue Water (Gravel at left & top)', gameDescription: 'Blue water with gravel framing its northern and western edges', spritePosition: [12, 6] },
    1209: { devDescription: 'Blue Water (Gravel at upper-left)', gameDescription: 'Blue water with gravel at its northwestern corner', spritePosition: [15, 4] },
    1210: { devDescription: 'Blue Water (Gravel at upper-right)', gameDescription: 'Blue water with gravel at its northeastern corner', spritePosition: [16, 4] },
    1211: { devDescription: 'Blue Water (Gravel at lower-left)', gameDescription: 'Blue water with gravel at its southwestern corner', spritePosition: [16, 5] },
    1212: { devDescription: 'Blue Water (Gravel at lower-right)', gameDescription: 'Blue water with gravel at its southeastern corner', spritePosition: [15, 5] },
    1213: { devDescription: 'Blue Water (Gravel at upper-left & lower-right)', gameDescription: 'Blue water with gravel at its northwestern & southeastern corners', spritePosition: [16, 6] },
    1214: { devDescription: 'Blue Water (Gravel at upper-right & lower-left)', gameDescription: 'Blue water with gravel at its northeastern & southwestern corners', spritePosition: [15, 6] },
    1215: { devDescription: 'Blue Water (Gravel at top & bottom, left & right)', gameDescription: 'Blue water with gravel framing all of its edges', spritePosition: [12, 7] },
    1216: { devDescription: 'Blue Water (Gravel at left & lower-right)', gameDescription: 'Blue water with gravel at its western edge and southeastern', spritePosition: [13, 7] },
    1217: { devDescription: 'Blue Water (Gravel at right & lower-left)', gameDescription: 'Blue water with gravel at its eastern edge and southwestern', spritePosition: [14, 7] },
    1218: { devDescription: 'Blue Water (Gravel at left & upper-right)', gameDescription: 'Blue water with gravel at its western edge and northeastern', spritePosition: [15, 7] },
    1219: { devDescription: 'Blue Water (Gravel at right & upper-left)', gameDescription: 'Blue water with gravel at its eastern edge and northwestern', spritePosition: [16, 7] },
    1220: { devDescription: 'Blue Water (Gravel at bottom & upper-left)', gameDescription: 'Blue water with gravel at its southern edge and northwestern', spritePosition: [12, 8] },
    1221: { devDescription: 'Blue Water (Gravel at bottom & upper-right)', gameDescription: 'Blue water with gravel at its southern edge and northeastern', spritePosition: [13, 8] },
    1222: { devDescription: 'Blue Water (Gravel at top & lower-left)', gameDescription: 'Blue water with gravel at its northern edge and southwestern', spritePosition: [14, 8] },
    1223: { devDescription: 'Blue Water (Gravel at top & lower-right)', gameDescription: 'Blue water with gravel at its northern edge and southeastern', spritePosition: [15, 8] },
    1224: { devDescription: 'Red Boulder in Blue Water - Version 1', gameDescription: 'A massive red boulder breaches the surface of the deep blue waters', spritePosition: [17, 4], blocker: true },
    1225: { devDescription: 'Red Boulder in Blue Water - Version 2', gameDescription: 'A massive red boulder breaches the surface of the deep blue waters', spritePosition: [17, 5], blocker: true },
    1226: { devDescription: 'Red Boulder in Blue Water - Version 3', gameDescription: 'A massive red boulder breaches the surface of the deep blue waters', spritePosition: [17, 6], blocker: true },
    1227: { devDescription: 'Burgundy Boulder in Blue Water - Version 1', gameDescription: 'A massive burgundy boulder breaches the surface of the deep blue waters', spritePosition: [17, 7], blocker: true },
    1228: { devDescription: 'Burgundy Boulder in Blue Water - Version 2', gameDescription: 'A massive burgundy boulder breaches the surface of the deep blue waters', spritePosition: [17, 8], blocker: true },
    1229: { devDescription: 'Burgundy Boulder in Blue Water - Version 3', gameDescription: 'A massive burgundy boulder breaches the surface of the deep blue waters', spritePosition: [16, 8], blocker: true },
    1230: { devDescription: 'Invisible barrier marking water too deep to cross', gameDescription: 'Blue water too deep to traverse on foot', spritePosition: [-1, -1], blocker: true },

    // Bridges & Piers
    2000: { devDescription: 'Bridge Start Horizontal (Wood)', gameDescription: 'Wooden ramp rising from west to east onto a bridge', spritePosition: [0, 12], xPosMod: -0.01, xScaleMod: 0.1 },
    2001: { devDescription: 'Bridge End Horizontal (Wood)', gameDescription: 'Wooden ramp rising from east to west onto a bridge', spritePosition: [0, 10], xPosMod: 0.01, xScaleMod: 0.1 },
    2002: { devDescription: 'Bridge Bottom Intact Horizontal (Wood)', gameDescription: 'An intact edge of a wooden bridge', spritePosition: [1, 9] },
    2003: { devDescription: 'Bridge Bottom Damaged Horizontal (Wood)', gameDescription: 'A damaged edge of a wooden bridge', spritePosition: [2, 9] },
    2004: { devDescription: 'Bridge Bottom Destroyed Horizontal (Wood)', gameDescription: 'The destroyed, impassable edge of a wooden bridge', spritePosition: [3, 9], blocker: true },
    2005: { devDescription: 'Bridge Middle Intact Horizontal (Wood)', gameDescription: 'An intact section of a wooden bridge', spritePosition: [1, 10] },
    2006: { devDescription: 'Bridge Middle Damaged Horizontal (Wood)', gameDescription: 'A damaged section of a wooden bridge', spritePosition: [2, 10] },
    2007: { devDescription: 'Bridge Middle Destroyed Horizontal (Wood)', gameDescription: 'The destroyed, impassable section of a wooden bridge', spritePosition: [3, 10], blocker: true },
    2008: { devDescription: 'Bridge Top Intact Horizontal (Wood)', gameDescription: 'An intact edge of a wooden bridge', spritePosition: [1, 11] },
    2009: { devDescription: 'Bridge Top Damaged Horizontal (Wood)', gameDescription: 'A damaged edge of a wooden bridge', spritePosition: [2, 11] },
    2010: { devDescription: 'Bridge Top Destroyed Horizontal (Wood)', gameDescription: 'The destroyed, impassable edge of a wooden bridge', spritePosition: [3, 11], blocker: true },
    2011: { devDescription: 'Bridge Start Vertical (Wood)', gameDescription: 'Wooden ramp rising from north to south onto a bridge', spritePosition: [0, 11], zPosMod: 0.01, zScaleMod: 0.1 },
    2012: { devDescription: 'Bridge End Vertical (Wood)', gameDescription: 'Wooden ramp rising from south to north onto a bridge', spritePosition: [0, 9], zPosMod: -0.01, zScaleMod: 0.1 },
    2013: { devDescription: 'Bridge Right Intact Vertical (Wood)', gameDescription: 'An intact edge of a wooden bridge', spritePosition: [3, 12] },
    2014: { devDescription: 'Bridge Right Damaged Vertical (Wood)', gameDescription: 'A damaged edge of a wooden bridge', spritePosition: [3, 13] },
    2015: { devDescription: 'Bridge Right Destroyed Vertical (Wood)', gameDescription: 'The destroyed, impassable edge of a wooden bridge', spritePosition: [3, 14], blocker: true },
    2016: { devDescription: 'Bridge Middle Intact Vertical (Wood)', gameDescription: 'An intact section of a wooden bridge', spritePosition: [2, 12] },
    2017: { devDescription: 'Bridge Middle Damaged Vertical (Wood)', gameDescription: 'A damaged section of a wooden bridge', spritePosition: [2, 13] },
    2018: { devDescription: 'Bridge Middle Destroyed Vertical (Wood)', gameDescription: 'The destroyed, impassable section of a wooden bridge', spritePosition: [2, 14], blocker: true },
    2019: { devDescription: 'Bridge Left Intact Vertical (Wood)', gameDescription: 'An intact edge of a wooden bridge', spritePosition: [1, 12] },
    2020: { devDescription: 'Bridge Left Damaged Vertical (Wood)', gameDescription: 'A damaged edge of a wooden bridge', spritePosition: [1, 13] },
    2021: { devDescription: 'Bridge Left Destroyed Vertical (Wood)', gameDescription: 'The destroyed, impassable edge of a wooden bridge', spritePosition: [1, 14], blocker: true },
    2022: { devDescription: 'Pier - Ends on right (Wood)', gameDescription: 'Eastern edge of a disintegrating pier', spritePosition: [0, 15], blocker: true },
    2023: { devDescription: 'Pier - Open both sides (Wood)', gameDescription: 'Section of a disintegrating pier', spritePosition: [1, 15], blocker: true },
    2024: { devDescription: 'Pier - Ends on left (Wood)', gameDescription: 'Weastern edge of a disintegrating pier', spritePosition: [2, 15], blocker: true },
}

export class GridCtrl {
    /**
     * Specification of what the planet and ruins below should look like.
     */
    private _ancientRuinsSpec: AncientRuinsSpecifications;

    /**
     * Tile geometry that makes up the ground tiles.
     */
    private _geometry: PlaneGeometry = new PlaneGeometry( 0.40, 0.40, 10, 10 );

    /**
     * The grid array with values of all tiles on game map.
     * [row][col][elevation]
     * [elevation] 0    Special designation tiles. Treasure, Traps, Etc.
     * [elevation] 1    Ground tile on which a player might stand and interact. Also triggers events.
     * [elevation] 2    Obstruction tile. Might be a person, boulder, wall, or tree trunk. Can interact with mouse clicks, but can't move into space.
     * [elevation] 3    Overhead tile such as low ceiling of building. Can move "under" and must turn semi-transparent.
     * [elevation] 4    High overhead tile like tree canopy or high ceiling. Can move "under" and must turn semi-trnsparent.
     * Light:           Negative values mirror the positive values as the same content, but dark. Astroteam can counter when in range.
     * Type:            [row][col][elevation] gives "type" of tile
     */
    private _grid: number[][][] = [];

    /**
     * Dictionary of materials already made for use in building out the game's tile map.
     */
    private _materialsMap: { [key: number]: MeshBasicMaterial } = {};

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * All of the textures contained in this scene.
     */
    private _textures: { [key: string]: Texture } = {};

    constructor(scene: Scene, textures: { [key: string]: Texture }, ancientRuinsSpec: any) {
        this._scene = scene;
        this._textures = textures;
        this._ancientRuinsSpec = ancientRuinsSpec;

        // All meshes added here first to be added as single mesh to the scene.
        const megaMesh = new Object3D();

        this._makeMaterials();

        this._makeGrass();

        this._makeWater();

        // Shapes water to smooth its edges against dirt and grass tiles.
        this._modifyWatersForEdges();

        // Shapes grass to smooth its edges against dirt and water tiles.
        this._modifyGrassesForEdges();

        this._makeStructures();

        this._dropBouldersInWater();

        this._createGroundMeshes(megaMesh);

        this._createTraverseLevelMeshes(megaMesh);

        this._scene.add(megaMesh);
    }

    /**
     * Checks a given tile for grass, and adds 10% chance to spread.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @returns additional spread percentage for grass
     */
    private _checkGrassSpread(row: number, col: number): number {
        // If non-zero, then it's a grass tile, thus increasing grass spread another 15%
        return (this._isInBounds(row, col) && this._grid[row][col][1] === 1) ? this._ancientRuinsSpec.plantSpreadability : 0;
    }

    /**
     * Checks a given tile for water, and adds 10% chance to spread.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @returns additional spread percentage for water
     */
    private _checkWaterSpread(row: number, col: number): number {
        // If non-zero, then it's a water tile, thus increasing water spread another 10%
        return (this._isInBounds(row, col) && this._grid[row][col][1] === waterBase) ? this._ancientRuinsSpec.waterSpreadability : 0;
    }

    /**
     * Uses the tile grid to make meshes that match tile values.
     * @param megaMesh all meshes added here first to be added as single mesh to the scene
     */
    private _createGroundMeshes(megaMesh: Object3D): void {
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][1]) {
                    let material: MeshBasicMaterial = this._materialsMap[this._grid[row][col][1]];

                    // console.log(row, col, this._grid[row][col][1], gridDictionary[this._grid[row][col][1]].devDescription, gridDictionary[this._grid[row][col][1]].spritePosition, material);

                    // If material type has a second variation, randomize between the two.
                    if (gridDictionary[this._grid[row][col][1]].hasVariation && fiftyFifty()) {
                        material = this._materialsMap[this._grid[row][col][1] + 1];
                    }

                    const tile = new Mesh( this._geometry, material );
                    tile.position.set(getXPos(col), layer1YPos, getZPos(row))
                    tile.rotation.set(rad90DegLeft, 0, 0);
                    megaMesh.add(tile);
                }
            }
        }
    }

    /**
     * Uses the tile grid to make meshes that match tile values.
     * @param megaMesh all meshes added here first to be added as single mesh to the scene
     */
    private _createTraverseLevelMeshes(megaMesh: Object3D): void {
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][2] && this._materialsMap[this._grid[row][col][2]]) {
                    const posX = getXPos(col) + (gridDictionary[this._grid[row][col][2]].xPosMod || 0);
                    const posZ = getZPos(row) + (gridDictionary[this._grid[row][col][2]].zPosMod || 0);
                    const scaleX = 1 + (gridDictionary[this._grid[row][col][2]].xScaleMod || 0);
                    const scaleZ = 1 + (gridDictionary[this._grid[row][col][2]].zScaleMod || 0);

                    let material: MeshBasicMaterial = this._materialsMap[this._grid[row][col][2]];

                    // If material type has a second variation, randomize between the two.
                    if (gridDictionary[this._grid[row][col][2]].hasVariation && fiftyFifty()) {
                        material = this._materialsMap[this._grid[row][col][2] + 1];
                    }

                    const tile = new Mesh( this._geometry, material );
                    tile.scale.set(scaleX, 1, scaleZ);
                    tile.position.set(posX, layer2YPos, posZ)
                    tile.rotation.set(rad90DegLeft, 0, 0);
                    tile.updateMatrix();
                    megaMesh.add(tile);
                }
            }
        }
    }

    /**
     * Randomly drops boulders in the deep waters, and sets them to obstructed.
     */
    private _dropBouldersInWater(): void {
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][1] === waterBase && !this._grid[row][col][2]) {
                    this._grid[row][col][2] = waterBase + 30; // Water is too deep to cross.
                    if (Math.random() < 0.06) {
                        // Adds one of 6 boulder in water variations.
                        this._grid[row][col][2] = waterBase + 24 + Math.floor(Math.random() * 5);
                    }
                }
            }
        }
    }

    /**
     * Checks out of bound scenarios for the tile grid.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @returns TRUE is in grid range | FALSE not in grid range
     */
    private _isInBounds(row: number, col: number): boolean {
        // Check out of bounds.
        if (row < minRows || row > maxRows) {
            return false;
        } else if (col < minCols || col > maxCols) {
            return false;
        }
        return true;
    }

    /**
     * Makes water tiles specific to an oceanside look and feel
     */
    private _makeBeaches(): void {
        const min = 8;
        const max = 12;
        switch(Math.floor(Math.random() * 3)) {
            case 0: { // top
                for (let col = minCols; col < maxCols + 1; col += 3) {
                    const fillAmount = Math.floor(Math.random() * (max - min + 1)) + min;
                    for (let row = maxRows; row > maxRows - fillAmount; row--) {
                        this._grid[row][col][1] = waterBase;
                        this._isInBounds(row, col + 1) && (this._grid[row][col + 1][1] = waterBase);
                        this._isInBounds(row, col + 2) && (this._grid[row][col + 2][1] = waterBase);
                    }
                }
                break;
            }
            case 1: { // left
                for (let row = minRows; row < maxRows + 1; row += 3) {
                    const fillAmount = Math.floor(Math.random() * (max - min + 1)) + min;
                    for (let col = minCols; col < fillAmount; col++) {
                        this._grid[row][col][1] = waterBase;
                        this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = waterBase);
                        this._isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = waterBase);
                    }
                }
                break;
            }
            case 2: { // right
                for (let row = minRows; row < maxRows + 1; row += 3) {
                    const fillAmount = Math.floor(Math.random() * (max - min + 1)) + min;
                    for (let col = maxCols; col > maxCols - fillAmount; col--) {
                        this._grid[row][col][1] = waterBase;
                        this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = waterBase);
                        this._isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = waterBase);
                    }
                }
                break;
            }
        }
    }

    /**
     * Makes an ancient cemetery on the map.
     */
    private _makeCemetery(): void {
        // TODO: Scatter tombstones, and funeral plots all about. Have at least on mausoleum styled structure somewhere.
        // Must make sure any interactable cemetery tiles are not on flooded tiles.
    }

    /**
     * Makes an ancient city on the map.
     */
    private _makeCity(): void {
        // TODO: Cover upper 2/3rds of the map with buildings, roads, lighting, vehicles.
        // Optionally choose to do nothing, add craters, or other signs of how the city was destroyed.
    }

    /**
     * Makes water tiles specific to a narrow creek.
     */
    private _makeCreek(): void {
        const flowsHorizontally = fiftyFifty();
        const startRow = Math.floor(Math.random() * ((maxRows - 9) - (minRows + 10) + 1)) + (minRows + 10);
        const startCol = startRow;

        if (flowsHorizontally) {
            const flowsUp = startRow < middleRow;
            let lastRow = startRow;
            if (flowsUp) {
                for (let col = minCols; col < maxCols + 1; col += 2) {
                    // Small chance to flow back down
                    if (Math.random() < 0.1 && lastRow > minRows + 1) {
                        lastRow--;
                    // Remaining 50/50 to flow up or stay level.
                    } else if (fiftyFifty() && lastRow < maxRows - 1) {
                        lastRow++;
                    }
                    this._grid[lastRow][col][1] = waterBase;
                    this._grid[lastRow + 1][col][1] = waterBase;
                    this._isInBounds(lastRow, col + 1) && (this._grid[lastRow][col + 1][1] = waterBase);
                    this._isInBounds(lastRow + 1, col + 1) && (this._grid[lastRow + 1][col + 1][1] = waterBase);
                }
            } else {
                for (let col = minCols; col < maxCols + 1; col += 2) {
                    // Small chance to flow back up
                    if (Math.random() < 0.1 && lastRow < maxRows - 1) {
                        lastRow++;
                    // Remaining 50/50 to flow down or stay level.
                    } else if (fiftyFifty() && lastRow > minRows + 1) {
                        lastRow--;
                    }
                    this._grid[lastRow][col][1] = waterBase;
                    this._grid[lastRow + 1][col][1] = waterBase;
                    this._isInBounds(lastRow, col + 1) && (this._grid[lastRow][col + 1][1] = waterBase);
                    this._isInBounds(lastRow + 1, col + 1) && (this._grid[lastRow + 1][col + 1][1] = waterBase);
                }
            }
        } else {
            const flowsRight = startCol < middleCol;
            let lastCol = startCol;
            if (flowsRight) {
                for (let row = minRows; row < maxRows + 1; row += 2) {
                    // Small chance to flow back left
                    if (Math.random() < 0.1 && lastCol > minCols + 1) {
                        lastCol--;
                    // Remaining 50/50 to flow right or stay level.
                    } else if (fiftyFifty() && lastCol < maxCols - 1) {
                        lastCol++;
                    }
                    this._grid[row][lastCol][1] = waterBase;
                    this._grid[row][lastCol + 1][1] = waterBase;
                    this._isInBounds(row + 1, lastCol) && (this._grid[row + 1][lastCol][1] = waterBase);
                    this._isInBounds(row + 1, lastCol + 1) && (this._grid[row + 1][lastCol + 1][1] = waterBase);
                }
            } else {
                for (let row = minRows; row < maxRows + 1; row += 2) {
                    // Small chance to flow back right
                    if (Math.random() < 0.1 && lastCol < maxCols - 1) {
                        lastCol++;
                    // Remaining 50/50 to flow left or stay level.
                    } else if (fiftyFifty() && lastCol > minCols + 1) {
                        lastCol--;
                    }
                    this._grid[row][lastCol][1] = waterBase;
                    this._grid[row][lastCol + 1][1] = waterBase;
                    this._isInBounds(row + 1, lastCol) && (this._grid[row + 1][lastCol][1] = waterBase);
                    this._isInBounds(row + 1, lastCol + 1) && (this._grid[row + 1][lastCol + 1][1] = waterBase);
                }
            }
        }
    }

    /**
     * Sets up the grid with grass values.
     */
    private _makeGrass(): void {
        // If no plants on planet, don't spawn grass.
        if (this._ancientRuinsSpec.plantColor !== PlantColor.None) {
            for (let row = minRows; row < maxRows + 1; row++) {
                this._grid[row] = [];
                for (let col = minCols; col < maxCols + 1; col++) {
                    this._grid[row][col] = [];
                    this._grid[row][col][1] = groundGrassBase + 21;
                    this._grid[row][col][0] = 0;
                    this._grid[row][col][2] = 0;
                    this._grid[row][col][3] = 0;
                    this._grid[row][col][4] = 0;
                }
            }
            return;
        }

        // Seed the grass
        for (let row = minRows; row < maxRows + 1; row++) {
            this._grid[row] = [];
            for (let col = minCols; col < maxCols + 1; col++) {
                this._grid[row][col] = [];
                if (Math.random() < this._ancientRuinsSpec.plantPercentage) {
                    this._grid[row][col][1] = 1;
                } else {
                    this._grid[row][col][1] = groundGrassBase + 21;
                }
                this._grid[row][col][0] = 0;
                this._grid[row][col][2] = 0;
                this._grid[row][col][3] = 0;
                this._grid[row][col][4] = 0;
            }
        }

        // Organically let the grass spread
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][1] !== 1) {
                    const hasGrassPercentage = 0.01
                        + this._checkGrassSpread(row + 1, col - 1)
                        + this._checkGrassSpread(row, col - 1)
                        + this._checkGrassSpread(row - 1, col - 1)
                        + this._checkGrassSpread(row + 1, col)
                        + this._checkGrassSpread(row - 1, col)
                        + this._checkGrassSpread(row + 1, col + 1)
                        + this._checkGrassSpread(row, col + 1)
                        + this._checkGrassSpread(row - 1, col + 1)
                    this._grid[row][col][1] = (Math.random() < hasGrassPercentage) ? 1 : groundGrassBase + 21;
                }
            }
        }
    }

    /**
     * Makes water tiles specific to large, centrally-located lake.
     */
    private _makeLargeLake(): void {
        const max = 11;
        const min = 7;
        const centerRow = Math.floor(Math.random() * 3) + middleRow;
        const centerCol = Math.floor(Math.random() * 3) + middleCol;

        for (let row = centerRow; row < maxRows - 3; row += 3) {
            const leftRadius = Math.floor(Math.random() * (max - min + 1)) + min;
            const rightRadius = Math.floor(Math.random() * (max - min + 1)) + min;
            for (let col = centerCol; col > centerCol - leftRadius; col--) {
                this._grid[row][col][1] = waterBase;
                this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = waterBase);
                this._isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = waterBase);
            }
            for (let col = centerCol; col < centerCol + rightRadius; col++) {
                this._grid[row][col][1] = waterBase;
                this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = waterBase);
                this._isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = waterBase);
            }
        }
        for (let row = centerRow; row > minRows + 4; row -= 3) {
            const leftRadius = Math.floor(Math.random() * (max - min + 1)) + min;
            const rightRadius = Math.floor(Math.random() * (max - min + 1)) + min;
            for (let col = centerCol; col > centerCol - leftRadius; col--) {
                this._grid[row][col][1] = waterBase;
                this._isInBounds(row - 1, col) && (this._grid[row - 1][col][1] = waterBase);
                this._isInBounds(row - 2, col) && (this._grid[row - 2][col][1] = waterBase);
            }
            for (let col = centerCol; col < centerCol + rightRadius; col++) {
                this._grid[row][col][1] = waterBase;
                this._isInBounds(row - 1, col) && (this._grid[row - 1][col][1] = waterBase);
                this._isInBounds(row - 2, col) && (this._grid[row - 2][col][1] = waterBase);
            }
        }

    }

    /**
     * Makes ancient library.
     */
    private _makeLibrary(): void {
        // TODO: either a cluster of small connected buildings, or one large building. Rows of shelves for scrolls, books, or pictures.
        // Depending on tech level could actually be a server farm for digital data storage.
    }

    /**
     * Makes all the tile materials for the game map.
     */
    private _makeMaterials(): void {
        Object.keys(gridDictionary).forEach(key => {
            const offCoords = gridDictionary[Number(key)].spritePosition;

            if (offCoords[0] >= 0 && offCoords[1] >= 0) {
                const material: MeshBasicMaterial = new MeshBasicMaterial({
                    color: 0xFFFFFF,
                    map: this._textures.spriteMapAncientRuins.clone(),
                    side: FrontSide,
                    transparent: true
                });

                material.map.offset = new Vector2(
                    (1 / spriteMapCols) * offCoords[0],
                    (1 / spriteMapRows) * offCoords[1]);

                material.map.repeat = new Vector2(
                    (1 / spriteMapCols),
                    (1 / spriteMapRows));

                material.map.magFilter = NearestFilter;
                material.map.minFilter = NearestFilter;
                material.map.wrapS = RepeatWrapping;
                material.map.wrapT = RepeatWrapping;

                material.depthTest = false;
                material.map.needsUpdate = true;

                this._materialsMap[Number(key)] = material;
            }
        });
    }

    /**
     * Makes an ancient military base somewhereon the map.
     */
    private _makeMilitaryBase(): void {
        // TODO: centrally located with large hangers, concrete bunkers, missile silos, etc.
    }

    /**
     * Makes an ancient monastery somewhere roughly in the center of the map.
     */
    private _makeMonastery(): void {
        // TODO: Randomly places a large religious structure somewhere in center of map.
        // If in water biome like large lake, must make sure a bridge reaches an entrance.
    }

    /**
     * Makes water tiles specific to a long map-spanning river.
     */
    private _makeRiver(): void {
        const flowsHorizontally = fiftyFifty();
        const startRow = Math.floor(Math.random() * ((maxRows - 9) - (minRows + 10) + 1)) + (minRows + 10);
        const startCol = startRow;
        const maxPathShift = 2;
        const minPathShift = 0;
        const maxThickness = 4;
        const minThickness = 2;

        if (flowsHorizontally) {
            let prevRow = startRow;
            for (let col = minCols; col < maxRows + 1; col += 3) {
                const upOrDown = startRow < middleRow;
                const amount = Math.floor(Math.random() * (maxPathShift - minPathShift + 1)) + minPathShift;
                prevRow = upOrDown ? prevRow + amount : prevRow - amount;

                const thickness = Math.floor(Math.random() * (maxThickness - minThickness + 1)) + minThickness;
                for (let t = 0; t <= thickness; t++) {
                    this._isInBounds(prevRow + t, col) && (this._grid[prevRow + t][col][1] = waterBase);
                    this._isInBounds(prevRow + t, col + 1) && (this._grid[prevRow + t][col + 1][1] = waterBase);
                    this._isInBounds(prevRow + t, col + 2) && (this._grid[prevRow + t][col + 2][1] = waterBase);
                    this._isInBounds(prevRow - t, col) && (this._grid[prevRow - t][col][1] = waterBase);
                    this._isInBounds(prevRow - t, col + 1) && (this._grid[prevRow - t][col + 1][1] = waterBase);
                    this._isInBounds(prevRow - t, col + 2) && (this._grid[prevRow - t][col + 2][1] = waterBase);
                }
            }
        } else {
            let prevCol = startCol;
            for (let row = minRows; row < maxRows + 1; row += 3) {
                const leftOrRight = startCol > middleCol;
                const amount = Math.floor(Math.random() * (maxPathShift - minPathShift + 1)) + minPathShift;
                prevCol = leftOrRight ? prevCol - amount : prevCol + amount;

                const thickness = Math.floor(Math.random() * (maxThickness - minThickness + 1)) + minThickness;
                for (let t = 0; t <= thickness; t++) {
                    this._isInBounds(row, prevCol + t) && (this._grid[row][prevCol + t][1] = waterBase);
                    this._isInBounds(row + 1, prevCol + t) && (this._grid[row + 1][prevCol + t][1] = waterBase);
                    this._isInBounds(row + 2, prevCol + t) && (this._grid[row + 2][prevCol + t][1] = waterBase);
                    this._isInBounds(row, prevCol - t) && (this._grid[row][prevCol - t][1] = waterBase);
                    this._isInBounds(row + 1, prevCol - t) && (this._grid[row + 1][prevCol - t][1] = waterBase);
                    this._isInBounds(row + 2, prevCol - t) && (this._grid[row + 2][prevCol - t][1] = waterBase);
                }
            }
        }

        // Vertical Bridge
        if (flowsHorizontally) {
            let randomCol;
            let bottomRow;
            let topRow;
            while(true) {
                randomCol = Math.floor(Math.random() * ((maxCols - 2) - (minCols + 2) + 1)) + (minCols + 2);
                for (let i = minRows; i < maxRows + 1; i++) {
                    if (this._grid[i][randomCol][1] === waterBase) {
                        bottomRow = i;
                        break;
                    }
                }
                for (let j = bottomRow; j < maxRows + 1; j++) {
                    if (this._grid[j][randomCol][1] === waterBase) {
                        topRow = j;
                    } else {
                        break;
                    }
                }
                // Ensures the randomly selected point along the river has land on both sides.
                if (bottomRow !== minRows && topRow !== maxRows) {
                    break;
                }
            }
            let leftCol = randomCol;
            let currCol = randomCol;
            while (this._isInBounds(bottomRow, currCol - 1)
                && this._grid[bottomRow][currCol - 1][1] === waterBase
                && this._isInBounds(bottomRow - 1, currCol - 1)
                && this._grid[bottomRow - 1][currCol - 1][1] !== waterBase
                && this._isInBounds(topRow + 1, currCol - 1)
                && this._grid[topRow + 1][currCol - 1][1] !== waterBase) {
                leftCol = currCol - 1;
                currCol = leftCol;
            }
            const cols = [leftCol, leftCol + 1, leftCol + 2];
            for (let row = bottomRow; row <= topRow; row++) {
                if (row !== bottomRow && row !== topRow) { // Everything in the middle
                    this._grid[row][cols[0]][2] = (Math.random() < 0.25) ? (bridgeBase + 20) : (Math.random() < 0.25) ? (bridgeBase + 21) : (bridgeBase + 19);
                    this._grid[row][cols[1]][2] = (Math.random() < 0.25) ? (bridgeBase + 17) : (Math.random() < 0.25) ? (bridgeBase + 18) : (bridgeBase + 16);
                    this._grid[row][cols[2]][2] = (Math.random() < 0.25) ? (bridgeBase + 14) : (Math.random() < 0.25) ? (bridgeBase + 15) : (bridgeBase + 13);
                    // If all 3 are destroyed in a line, pick one by modding current row and decide whether to make it merely damaged, or whole.
                    if (this._grid[row][cols[0]][2] === (bridgeBase + 15) && this._grid[row][cols[1]][2] === (bridgeBase + 18) && this._grid[row][cols[1]][2] === (bridgeBase + 21)) {
                        this._grid[row][cols[row % 3]][2] = (Math.random() < 0.25) ? ((bridgeBase + 14) + (row % 3) * 3) : ((bridgeBase + 13) + (row % 3) * 3);
                    }
                } else if (row !== bottomRow) { // Start
                    this._grid[row][cols[0]][2] = bridgeBase + 11;
                    this._grid[row][cols[1]][2] = bridgeBase + 11;
                    this._grid[row][cols[2]][2] = bridgeBase + 11;
                } else { // End
                    this._grid[row][cols[0]][2] = bridgeBase + 12;
                    this._grid[row][cols[1]][2] = bridgeBase + 12;
                    this._grid[row][cols[2]][2] = bridgeBase + 12;
                }
            }
        // Horizontal Bridge
        } else {
            let randomRow;
            let colLeft;
            let colRight;
            while(true) {
                randomRow = Math.floor(Math.random() * ((maxRows - 2) - (minRows + 2) + 1)) + (minRows + 2);
                for (let i = 0; i < maxCols + 1; i++) {
                    if (this._grid[randomRow][i][1] === waterBase) {
                        colLeft = i;
                        break;
                    }
                }
                for (let j = colLeft; j < maxCols + 1; j++) {
                    if (this._grid[randomRow][j][1] === waterBase) {
                        colRight = j;
                    } else {
                        break;
                    }
                }
                // Ensures the randomly selected point along the river has land on both sides.
                if (colLeft !== 0 && colRight !== maxCols) {
                    break;
                }
            }
            let rowBottom = randomRow;
            let currRow = randomRow;
            while (this._isInBounds(currRow - 1, colLeft)
                && this._grid[currRow - 1][colLeft][1] === waterBase
                && this._isInBounds(currRow - 1, colLeft - 1)
                && this._grid[currRow - 1][colLeft - 1][1] !== waterBase
                && this._isInBounds(currRow - 1, colRight + 1)
                && this._grid[currRow - 1][colRight + 1][1] !== waterBase) {
                rowBottom = currRow - 1;
                currRow = rowBottom;
            }
            const rows = [rowBottom, rowBottom + 1, rowBottom + 2];
            for (let col = colLeft; col <= colRight; col++) {
                if (col !== colLeft && col !== colRight) { // Everything in the middle
                    this._grid[rows[0]][col][2] = (Math.random() < 0.25) ? (bridgeBase + 3) : (Math.random() < 0.25) ? (bridgeBase + 4) : (bridgeBase + 2);
                    this._grid[rows[1]][col][2] = (Math.random() < 0.25) ? (bridgeBase + 6) : (Math.random() < 0.25) ? (bridgeBase + 7) : (bridgeBase + 5);
                    this._grid[rows[2]][col][2] = (Math.random() < 0.25) ? (bridgeBase + 9) : (Math.random() < 0.25) ? (bridgeBase + 10) : (bridgeBase + 8);
                    // If all 3 are destroyed in a line, pick one by modding current col and decide whether to make it merely damaged, or whole.
                    if (this._grid[rows[0]][col][2] === (bridgeBase + 4) && this._grid[rows[1]][col][2] === (bridgeBase + 7) && this._grid[rows[2]][col][2] === (bridgeBase + 10)) {
                        this._grid[rows[col % 3]][col][2] = (Math.random() < 0.25) ? ((bridgeBase + 3) + (col % 3) * 3) : ((bridgeBase + 2) + (col % 3) * 3);
                    }
                } else if (col === colLeft) { // Start
                    this._grid[rows[0]][col][2] = bridgeBase;
                    this._grid[rows[1]][col][2] = bridgeBase;
                    this._grid[rows[2]][col][2] = bridgeBase;
                } else { // End
                    this._grid[rows[0]][col][2] = bridgeBase + 1;
                    this._grid[rows[1]][col][2] = bridgeBase + 1;
                    this._grid[rows[2]][col][2] = bridgeBase + 1;
                }
            }

            const rightPierRow = Math.floor(Math.random() * (maxRows - randomRow + 3)) + randomRow + 2;
            const leftPierRow = Math.floor(Math.random() * (randomRow - 2));

            // Build pier to the right of bridge
            if (Math.random() < 0.6 && rightPierRow < maxRows + 1 && rightPierRow > randomRow + 3) {
                let firstWaterCol;
                // Pier starts left and goes right
                if (fiftyFifty()) {
                    for (let col = minCols; col < maxCols + 1; col++) {
                        if (this._grid[rightPierRow][col][1] === waterBase) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    this._isInBounds(rightPierRow, firstWaterCol) && (this._grid[rightPierRow][firstWaterCol][2] = bridgeBase + 23);
                    if (fiftyFifty()) {
                        this._isInBounds(rightPierRow, firstWaterCol + 1) && (this._grid[rightPierRow][firstWaterCol + 1][2] = bridgeBase + 23);
                        this._isInBounds(rightPierRow, firstWaterCol + 2) && (this._grid[rightPierRow][firstWaterCol + 2][2] = bridgeBase + 22);
                    } else {
                        this._isInBounds(rightPierRow, firstWaterCol + 1) && (this._grid[rightPierRow][firstWaterCol + 1][2] = bridgeBase + 22);
                    }
                // Pier starts right and goes left
                } else {
                    for (let col = maxCols; col >= minCols; col--) {
                        if (this._grid[rightPierRow][col][1] === waterBase) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    this._isInBounds(rightPierRow, firstWaterCol) && (this._grid[rightPierRow][firstWaterCol][2] = bridgeBase + 23);
                    if (fiftyFifty()) {
                        this._isInBounds(rightPierRow, firstWaterCol - 1) && (this._grid[rightPierRow][firstWaterCol - 1][2] = bridgeBase + 23);
                        this._isInBounds(rightPierRow, firstWaterCol - 2) && (this._grid[rightPierRow][firstWaterCol - 2][2] = bridgeBase + 24);
                    } else {
                        this._isInBounds(rightPierRow, firstWaterCol - 1) && (this._grid[rightPierRow][firstWaterCol - 1][2] = bridgeBase + 24);
                    }
                }
            }
            // Build pier to the left of bridge
            if (Math.random() < 0.6 && leftPierRow > minRows && leftPierRow < randomRow - 3) {
                let firstWaterCol;
                // Pier starts left and goes right
                if (fiftyFifty()) {
                    for (let col = minCols; col < maxCols + 1; col++) {
                        if (this._grid[leftPierRow][col][1] === waterBase) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    this._isInBounds(leftPierRow, firstWaterCol) && (this._grid[leftPierRow][firstWaterCol][2] = bridgeBase + 23);
                    if (fiftyFifty()) {
                        this._isInBounds(leftPierRow, firstWaterCol + 1) && (this._grid[leftPierRow][firstWaterCol + 1][2] = bridgeBase + 23);
                        this._isInBounds(leftPierRow, firstWaterCol + 2) && (this._grid[leftPierRow][firstWaterCol + 2][2] = bridgeBase + 22);
                    } else {
                        this._isInBounds(leftPierRow, firstWaterCol + 1) && (this._grid[leftPierRow][firstWaterCol + 1][2] = bridgeBase + 22);
                    }
                // Pier starts right and goes left
                } else {
                    for (let col = maxCols; col >= minCols; col--) {
                        if (this._grid[leftPierRow][col][1] === waterBase) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    this._isInBounds(leftPierRow, firstWaterCol) && (this._grid[leftPierRow][firstWaterCol][2] = bridgeBase + 23);
                    if (fiftyFifty()) {
                        this._isInBounds(leftPierRow, firstWaterCol - 1) && (this._grid[leftPierRow][firstWaterCol - 1][2] = bridgeBase + 23);
                        this._isInBounds(leftPierRow, firstWaterCol - 2) && (this._grid[leftPierRow][firstWaterCol - 2][2] = bridgeBase + 24);
                    } else {
                        this._isInBounds(leftPierRow, firstWaterCol - 1) && (this._grid[leftPierRow][firstWaterCol - 1][2] = bridgeBase + 24);
                    }
                }
            }
        }
    }

    /**
     * Makes water tiles specific to series of lakes
     */
    private _makeSmallLakes(): void {
        // Seed the water
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (Math.random() < this._ancientRuinsSpec.waterPercentage) {
                    this._grid[row][col][1] = waterBase;
                }
            }
        }

        // Organically let the water spread
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][1] !== waterBase) {
                    const hasWaterPercentage = 0.01
                        + this._checkWaterSpread(row + 1, col - 1)
                        + this._checkWaterSpread(row, col - 1)
                        + this._checkWaterSpread(row - 1, col - 1)
                        + this._checkWaterSpread(row + 1, col)
                        + this._checkWaterSpread(row - 1, col)
                        + this._checkWaterSpread(row + 1, col + 1)
                        + this._checkWaterSpread(row, col + 1)
                        + this._checkWaterSpread(row - 1, col + 1)
                    if (Math.random() < hasWaterPercentage) {
                        this._grid[row][col][1] = waterBase;
                    }
                }
            }
        }

        // Check minimum water reqs.
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][1] === waterBase) {
                    const above = (this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] === waterBase) || !this._isInBounds(row + 1, col);
                    const below = (this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] === waterBase) || !this._isInBounds(row - 1, col);
                    const left = (this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] === waterBase) || !this._isInBounds(row, col - 1);
                    const right = (this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] === waterBase) || !this._isInBounds(row, col + 1);

                    const upperLeftCorner = (this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] === waterBase) || !this._isInBounds(row + 1, col - 1)
                    const upperRightCorner = (this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] === waterBase) || !this._isInBounds(row + 1, col + 1);
                    const lowerLeftCorner = (this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] === waterBase) || !this._isInBounds(row - 1, col - 1)
                    const lowerRightCorner = (this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] === waterBase) || !this._isInBounds(row - 1, col + 1);

                    if ([above, below, left, right].every(x => !x)) {
                        continue;
                    }
                    if (!above && !below) {
                        if (lowerLeftCorner || lowerRightCorner) {
                            this._grid[row - 1][col][1] = waterBase;
                            this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = waterBase);
                            this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = waterBase);
                        } else {
                            this._grid[row + 1][col][1] = waterBase;
                            this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = waterBase);
                            this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = waterBase);
                        }
                    }
                    if (!left && !right) {
                        if (lowerLeftCorner || upperLeftCorner) {
                            this._grid[row][col - 1][1] = waterBase;
                            this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = waterBase);
                            this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = waterBase);
                        } else {
                            this._grid[row][col + 1][1] = waterBase;
                            this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = waterBase);
                            this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = waterBase);
                        }
                    }
                }
            }
        }

        // Remove waters with only 1 tile thickness
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][1] === waterBase) {
                    const above = (this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] === waterBase) || !this._isInBounds(row + 1, col);
                    const below = (this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] === waterBase) || !this._isInBounds(row - 1, col);
                    const left = (this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] === waterBase) || !this._isInBounds(row, col - 1);
                    const right = (this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] === waterBase) || !this._isInBounds(row, col + 1);

                    if ([above, below, left, right].every(x => !x)) {
                        continue;
                    }
                    if (!above && !below) {
                        this._grid[row][col][1] = groundGrassBase + 21;
                        continue;
                    } else if (!left && !right) {
                        this._grid[row][col][1] = groundGrassBase + 21;
                        continue;
                    }

                    const upperLeftCorner = (this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] === waterBase) || !this._isInBounds(row + 1, col - 1)
                    const upperRightCorner = (this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] === waterBase) || !this._isInBounds(row + 1, col + 1);
                    const lowerLeftCorner = (this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] === waterBase) || !this._isInBounds(row - 1, col - 1)
                    const lowerRightCorner = (this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] === waterBase) || !this._isInBounds(row - 1, col + 1);

                    if (above && right && !upperRightCorner) {
                        this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = waterBase);
                    }
                    if (below && right && !lowerRightCorner) {
                        this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = waterBase);
                    }
                    if (below && left && !lowerLeftCorner) {
                        this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = waterBase);
                    }
                    if (above && left && !upperLeftCorner) {
                        this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = waterBase);
                    }
                }
            }
        }

        // Eliminate rare occasions where fill in block connect a former stand alone pond into a 1 thickness stream.
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][1] === waterBase) {
                    const above = (this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] === waterBase) || !this._isInBounds(row + 1, col);
                    const below = (this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] === waterBase) || !this._isInBounds(row - 1, col);
                    const left = (this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] === waterBase) || !this._isInBounds(row, col - 1);
                    const right = (this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] === waterBase) || !this._isInBounds(row, col + 1);

                    if (!above && !below && ((left && !right) || (!left && right))) {
                        this._grid[row][col][1] = groundGrassBase + 21;
                    }
                    if (!left && !right && ((above && !below) || (!above && below))) {
                        this._grid[row][col][1] = groundGrassBase + 21;
                    }
                    if ([above, below, left, right].every(x => !x) && fiftyFifty()) {
                        this._grid[row][col][1] = groundGrassBase + 21;
                    }
                }
            }
        }

        // TODO: Test for lakes too long or too wide and shave them down.
    }

    /**
     * Makes ruins structures relavant to the biomeRuins
     */
    private _makeStructures(): void {
        switch(this._ancientRuinsSpec.biomeRuins) {
            case RuinsBiome.Cemetery: {
                this._makeCemetery();
                break;
            }
            case RuinsBiome.Monastery: {
                this._makeMonastery();
                break;
            }
            case RuinsBiome.Village: {
                this._makeVillage();
                break;
            }
            case RuinsBiome.Town: {
                this._makeTown();
                break;
            }
            case RuinsBiome.City: {
                this._makeCity();
                break;
            }
            case RuinsBiome.MilitaryBase: {
                this._makeMilitaryBase();
                break;
            }
            case RuinsBiome.Library: {
                this._makeLibrary();
                break;
            }
            default: {
                console.error('Invalid Ruins Biome in Ancient Ruins');
            }
        }
    }

    /**
     * Makes an ancient town on the map.
     */
    private _makeTown(): void {
        // TODO: Starting roughly at the center, randomly choose between scattered, circular, square, or row format
        // Add 6-10 small structures, and a rough road. Randomly decide whether to put small funeral plot.
    }

    /**
     * Makes an ancient village on the map.
     */
    private _makeVillage(): void {
        // TODO: Randomly choose between top-left, top-right, and center to place 3-4 small structure
        // Add a well-like structure, and some fencing for animals.
    }

    /**
     * Sets up the grid with water values.
     */
    private _makeWater(): void {
        // If no water on planet, don't spawn water.
        if (this._ancientRuinsSpec.waterColor !== WaterColor.None) {
            return;
        }

        switch(this._ancientRuinsSpec.biomeWater) {
            case WaterBiome.SmallLakes: {
                this._makeSmallLakes();
                break;
            }
            case WaterBiome.LargeLake: {
                this._makeLargeLake();
                break;
            }
            case WaterBiome.Beach: {
                this._makeBeaches();
                break;
            }
            case WaterBiome.Creek: {
                this._makeCreek();
                break;
            }
            case WaterBiome.River: {
                this._makeRiver();
                break;
            }
            default: {
                console.error('Invalid Water Biome in Ancient Ruins');
            }
        }
    }

    /**
     * Checks a given tile's surrounds for grass and updates value to match neighboring dirt tiles.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     */
    private _modifyGrassForEdges(row: number, col: number): void {
        const top = this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] > groundGrassEnd ? 1 : 0;
        const topRight = this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] > groundGrassEnd ? 1 : 0;
        const right = this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] > groundGrassEnd ? 1 : 0;
        const bottomRight = this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] > groundGrassEnd ? 1 : 0;
        const bottom = this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] > groundGrassEnd ? 1 : 0;
        const bottomLeft = this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] > groundGrassEnd ? 1 : 0;
        const left = this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] > groundGrassEnd ? 1 : 0;
        const topLeft = this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] > groundGrassEnd ? 1 : 0;

        // 1 === non-grass tile found
        // 0 === grass tile found

        let key = `${top}${right}${bottom}${left}`;
        if (key === '1111' && [topRight, bottomRight, bottomLeft, topLeft].some(x => !x)) {
            key = 'sparse';
        } else if (key === '0000' && [topRight, bottomRight, bottomLeft, topLeft].some(x => !!x) && Math.random() < 0.3) {
            key = 'mixed';
        }
        this._grid[row][col][1] = grassLookupTable[key] || groundGrassBase;
    }

    /**
     * Cycles through the grass tiles and triggers call to have specific edge graphic chosen to have smooth edges.
     */
    private _modifyGrassesForEdges(): void {
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][1] === 1) {
                    this._modifyGrassForEdges(row, col);
                }
            }
        }
    }

    /**
     * Cycles through the water tiles and triggers call to have specific edge graphic chosen to have smooth edges.
     */
    private _modifyWatersForEdges(): void {
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._grid[row][col][1] === waterBase) {
                    this._modifyWaterForEdge(row, col);
                }
            }
        }
    }

    /**
     * Checks a given tile's surrounds for water and updates value to match neighboring dirt tiles.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     */
    private _modifyWaterForEdge(row: number, col: number): void {
        const top = this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] < waterBase || this._grid[row + 1][col][1] > waterEnd) ? 1 : 0;
        const topRight = this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] < waterBase || this._grid[row + 1][col + 1][1] > waterEnd) ? 1 : 0;
        const right = this._isInBounds(row, col + 1) && (this._grid[row][col + 1][1] < waterBase || this._grid[row][col + 1][1] > waterEnd) ? 1 : 0;
        const bottomRight = this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] < waterBase || this._grid[row - 1][col + 1][1] > waterEnd) ? 1 : 0;
        const bottom = this._isInBounds(row - 1, col) && (this._grid[row - 1][col][1] < waterBase || this._grid[row - 1][col][1] > waterEnd) ? 1 : 0;
        const bottomLeft = this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] < waterBase || this._grid[row - 1][col - 1][1] > waterEnd) ? 1 : 0;
        const left = this._isInBounds(row, col - 1) && (this._grid[row][col - 1][1] < waterBase || this._grid[row][col - 1][1] > waterEnd) ? 1 : 0;
        const topLeft = this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] < waterBase || this._grid[row + 1][col - 1][1] > waterEnd) ? 1 : 0;

        // 1 === non-water tile found
        // 0 === water tile found

        const key = `${top}${right}${bottom}${left}-${topRight}${bottomRight}${bottomLeft}${topLeft}`;
        this._grid[row][col][1] = waterLookupTable[key] || waterBase;
    }

    /**
     * Handles all cleanup responsibility for controller before it's destroyed.
     */
    public dispose(): void {

    }

    /**
     * At the end of each loop iteration, check for grid-specific animations.
     */
    public endCycle(): void {

    }
}
import { GameLoadData } from "../models/game-load-data";
import { ConvertToHex } from "./convert-to-hex";

//
// c1  --> Score (total8thHex) 15 x 1
// c2  --> Satellite State
// c3  --> Score (total5thHex) 15 x 4,096
// c4  --> Difficulty Level
// c5  --> Score (total6thHex) 15 x 256
// c6  --> Level Multiplier
// c7  --> Score (total3rdHex) 15 x 1,048,576
// c8  --> Base State
// c9  --> Score (total7thHex) 15 x 16
// c10 --> Score (total1stHex) 15 x 268,435,456
// c11 --> Level Remainder
// c12 --> Score (total4thHex) 15 x 65,535
// c13 --> Score (total2ndHex) 15 x 16,777,216
//
// Max score would be:
// 4,026,531,840 + 251,658,240 + 15,728,640 + 983,040 + 61,440 + 3,840 + 240 + 15
//

/**
 * Creates a 13 digit hex character array of the game state at each new level.
 * @param gld current level game state
 */
export const CreateSaveCode = function(gld: GameLoadData) {
    const char = [];
    // Convert score into 8 digit 0-15 numbers (for hex conversion)
    const total1stHex = Math.floor(gld.score / 268435456);
    let remainder = gld.score - (total1stHex * 268435456);
    const total2ndHex = Math.floor(remainder / 16777216);
    remainder = remainder - (total2ndHex * 16777216);
    const total3rdHex = Math.floor(remainder / 1048576);
    remainder = remainder - (total3rdHex * 1048576);
    const total4thHex = Math.floor(remainder / 65536);
    remainder = remainder - (total4thHex * 65536);
    const total5thHex = Math.floor(remainder / 4096);
    remainder = remainder - (total5thHex * 4096);
    const total6thHex = Math.floor(remainder / 256);
    remainder = remainder - (total6thHex * 256);
    const total7thHex = Math.floor(remainder / 16);
    remainder = remainder - (total7thHex * 16);
    const total8thHex = Math.floor(remainder / 1);
    // Convert each caluclated value into a single hex digit.
    char.push(ConvertToHex(14));
    char.push(ConvertToHex(total8thHex));
    char.push(ConvertToHex(gld.sat4 * 1 + gld.sat3 * 2 + gld.sat2 * 4 + gld.sat1 * 8));
    char.push(ConvertToHex(total5thHex));
    char.push(ConvertToHex(((gld.difficulty + 1) * 4) + Math.floor(Math.random() * 3)));
    char.push(ConvertToHex(total6thHex));
    char.push(ConvertToHex(Math.floor(gld.level / 16)));
    char.push(ConvertToHex(7));
    char.push(ConvertToHex(total3rdHex));
    char.push(ConvertToHex(gld.b4 * 1 + gld.b3 * 2 + gld.b2 * 4 + gld.b1 * 8));
    char.push(ConvertToHex(total7thHex));
    char.push(ConvertToHex(total1stHex));
    char.push(ConvertToHex(Math.floor(gld.level % 16)));
    char.push(ConvertToHex(total4thHex));
    char.push(ConvertToHex(10));
    char.push(ConvertToHex(total2ndHex));

    return char.slice().map(c => String.fromCharCode(c));
}
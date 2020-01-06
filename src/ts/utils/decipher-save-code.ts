import { GameLoadData } from "../models/game-load-data";
import { ConvertToInt } from "./convert-to-int";

//
// c0  --> 1st code verifier (Has to be 'E')
// c1  --> Score (total8thHex) 15 x 1
// c2  --> Satellite State
// c3  --> Score (total5thHex) 15 x 4,096
// c4  --> Difficulty Level
// c5  --> Score (total6thHex) 15 x 256
// c6  --> Level Multiplier
// c7  --> 2nd code verifier (Has to be '7')
// c8  --> Score (total3rdHex) 15 x 1,048,576
// c9  --> Base State
// c10 --> Score (total7thHex) 15 x 16
// c11 --> Score (total1stHex) 15 x 268,435,456
// c12 --> Level Remainder
// c13 --> Score (total4thHex) 15 x 65,535
// c14 --> 3rd code verifier (Has to be 'A')
// c15 --> Score (total2ndHex) 15 x 16,777,216
//

/**
 * Converts 13 char player entered load code into it's equivalent game load data object.
 * @param loadCode the 13 char code player entered to load a saved game.
 * @returns game load data created from the load code.
 */
export const DecipherSaveCode = function(loadCode: string[]): GameLoadData {
    // Check verification digits.
    if (loadCode[0] !== 'E' || loadCode[7] !== '7' || loadCode[14] !== 'A') return null;
    // Convert 8 digit 0-15 numbers into score
    const total8thHex = ConvertToInt(loadCode[1].charCodeAt(0));
    const total7thHex = ConvertToInt(loadCode[10].charCodeAt(0)) * 16;
    const total6thHex = ConvertToInt(loadCode[5].charCodeAt(0)) * 256;
    const total5thHex = ConvertToInt(loadCode[3].charCodeAt(0)) * 4096;
    const total4thHex = ConvertToInt(loadCode[13].charCodeAt(0)) * 65535;
    const total3rdHex = ConvertToInt(loadCode[8].charCodeAt(0)) * 1048576;
    const total2ndHex = ConvertToInt(loadCode[15].charCodeAt(0)) * 16777216;
    const total1stHex = ConvertToInt(loadCode[11].charCodeAt(0)) * 268435456;
    const score = total1stHex + total2ndHex + total3rdHex + total4thHex + total5thHex +
        total6thHex + total7thHex + total8thHex;
    // Convert 8 digit 0-15 numbers into level
    const level = (ConvertToInt(loadCode[6].charCodeAt(0)) * 16) +
        ConvertToInt(loadCode[12].charCodeAt(0));
    // Convert 8 digit 0-15 numbers into difficulty level
    const difficulty = Math.floor(ConvertToInt(loadCode[4].charCodeAt(0)) / 4) - 1;
    // if (difficulty < 0 || 2 < difficulty) return null;
    // Deciphering byte to satellite status
    let remainder = ConvertToInt(loadCode[2].charCodeAt(0));
    const s1 = Math.floor(remainder / 8);
    remainder -= (s1 * 8);
    const s2 = Math.floor(remainder / 4);
    remainder -= (s2 * 4);
    const s3 = Math.floor(remainder / 2);
    remainder -= (s3 * 2);
    const s4 = remainder;
    // Deciphering byte to base status
    remainder = ConvertToInt(loadCode[9].charCodeAt(0));
    const b1 = Math.floor(remainder / 8);
    remainder -= (b1 * 8);
    const b2 = Math.floor(remainder / 4);
    remainder -= (b2 * 4);
    const b3 = Math.floor(remainder / 2);
    remainder -= (b3 * 2);
    const b4 = remainder;
    
    return { b1, b2, b3, b4, difficulty, level, sat1: s1, sat2: s2, sat3: s3, sat4: s4, score};
}
/**
 * Mandatory structure of the decoded game state data for save and load.
 */
export interface GameLoadData {
    b1: number;
    b2: number;
    b3: number;
    b4: number;
    difficulty: number;
    level: number;
    sat1: number;
    sat2: number;
    sat3: number;
    sat4: number;
    score: number;
}
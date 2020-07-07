import { gridDictionary } from "./tile-values";

/**
 * Checks to see if the tile in question can be travelled to or across.
 * @param tileVal tile value in the grid tile being checked
 * @returns TRUE if that tile is a blocking tile | FALSE if it is not blocking
 */
export function isBlocking(tileVal: number): boolean {
    return tileVal && gridDictionary[tileVal].blocker;
}
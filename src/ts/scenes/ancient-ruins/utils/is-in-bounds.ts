import { MAX_COLS, MAX_ROWS, MIN_COLS, MIN_ROWS } from "./grid-constants";

/**
 * Checks out of bound scenarios for the tile grid.
 * @param row row coordinate in the terrain grid
 * @param col col coordinate in the terrain grid
 * @returns TRUE is in grid range | FALSE not in grid range
 */
export function isInBounds(row: number, col: number): boolean {
    if (row < MIN_ROWS || row > MAX_ROWS) {
        return false;
    } else if (col < MIN_COLS || col > MAX_COLS) {
        return false;
    // Makes sure nothing can be populated behind the control panel.
    } else if (row === MIN_ROWS && col > MAX_COLS - 4) {
        return false;
    }
    return true;
}
import { GridCtrl } from "./grid-controller";

const adjacencyMods: [number, number][] = [ [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1] ];

export class PathFindingCtrl {
    /**
     * Reference to this scene's grid controller.
     */
    private _gridCtrl: GridCtrl;

    /**
     * Constructor for the Path Finder Controller class.
     * @param gridCtrl reference to this scene's grid controller (to check obstruction tiles)
     */
    constructor(gridCtrl: GridCtrl) {
        this._gridCtrl = gridCtrl;
    }

    /**
     * Calculates the (as a crow flies) distance between two tiles
     * @param row1 coordinate of the start tile
     * @param col1 coordinate of the start tile
     * @param row2 coordinate of the end tile
     * @param col2 coordinate of the end tile
     * @returns the absolute distance between two tiles
     */
    private _calculateDistance(row1: number, col1: number, row2: number, col2: number): number {
        const xDistSqr = Math.pow(Math.abs(col2 - col1), 2);
        const yDistSqr = Math.pow(Math.abs(row2 - row1), 2);
        return Math.sqrt(xDistSqr + yDistSqr);
    }

    /**
     * Checks if the cell is already in the tested path. If it is then the new cell would make a cycle.
     * @param testPath path up to, but not including, the tested cell
     * @param testedCell the cell to use to test the path for a cycle
     * @returns TRUE if the new cell would make a cycle | False if it would not make a cycle
     */
    private _checkForCycle(testPath: number[], testedCell: number): boolean {
        return testPath.some(x => x === testedCell);
    }

    /**
     * Converts the row and col values into a single unique number for reference.
     * @param row coordinate of the tile
     * @param col coordinate of the tile
     * @returns single unique reference number belonging to given row and col values
     */
    private _convertRowColToCell(row: number, col: number): number {
        return (row * 100) + col;
    }

    /**
     * Converts the single unique reference number for tile into row and col values.
     * @param cell reference number of the tile
     * @returns [row, col] values belonging to given reference number
     */
    private _convertCellToRowCol(cell: number): [number, number] {
        return [Math.floor(cell / 100), (cell % 100)];
    }

    /**
     * Recursive function to find each path that leads to the target cell.
     * @param row coordinate of the tile
     * @param col coordinate of the tile
     * @param testPath used to push and pop values depending on the success of the path
     * @param targetCell reference number fot the cell crew member is trying to reach
     * @returns true if this cell is target cell, false if path is blocked out out of bounds
     */
    private _getShortestPath(row: number, col: number, testPath: number[], targetCell: number): boolean {
        const nextCell = this._convertRowColToCell(row, col);
        testPath.push(nextCell);

        // Found the target, time to bail out.
        if (nextCell === targetCell) {
            return true;
        }

        // List of neighboring tiles to starting point, ordered by closeness to target cell.
        const closenessScores = adjacencyMods
            // Gets row, col, and distance of considered tile with target tile.
            .map(mod => {
                const testedRow = row + mod[0];
                const testedCol = col + mod[1];
                return [testedRow, testedCol, this._calculateDistance(row, col, testedRow, testedCol)];
            })
            // Check cells in order of closer distance to target cell
            .sort((tile1, tile2) => {
                return tile1[2] - tile2[2];
            })
            // Only in-bounds and unobstructed tiles are considered.
            .filter(tile => {
                return this._gridCtrl.isInBounds(tile[0], tile[1]) && !this._gridCtrl.getTileValue(tile[0], tile[1], 2);
            });

        // Check paths leading out from these neighboring cells.
        for (let x = 0; x < closenessScores.length; x++) {
            const tile = closenessScores[x];

            // If path proves true, go all the way back up the rabbit hole.
            if (this._getShortestPath(tile[0], tile[1], testPath, targetCell)) {
                return true;
            }
            // If path proves false, pop the last cell to prepare for the next iteration.
            testPath.pop();
            return false;
        }
    }

    /**
     * Parent function to the recursive path finding function calls. Chooses the path with the least number of cells.
     * @param row1 coordinate of the start tile
     * @param col1 coordinate of the start tile
     * @param row2 coordinate of the end tile
     * @param col2 coordinate of the end tile
     * @returns path of [row, col] values that lead to target cell. Empty means not a valid path
     */
    public getShortestPath(row1: number, col1: number, row2: number, col2: number): [number, number][] {
        const startCell = this._convertRowColToCell(row1, col1);
        const targetCell = this._convertRowColToCell(row2, col2);

        // Crew member is already in that cell. Bail out early.
        if (startCell === targetCell) {
            return [];
        }

        // List of neighboring tiles to starting point, ordered by closeness to target cell.
        const closenessScores = adjacencyMods
            // Gets row, col, and distance of considered tile with target tile.
            .map(mod => {
                const testedRow = row1 + mod[0];
                const testedCol = col1 + mod[1];
                return [testedRow, testedCol, this._calculateDistance(row1, col1, testedRow, testedCol)];
            })
            // Check cells in order of closer distance to target cell
            .sort((tile1, tile2) => {
                return tile1[2] - tile2[2];
            })
            // Only in-bounds and unobstructed tiles are considered.
            .filter(tile => {
                return this._gridCtrl.isInBounds(tile[0], tile[1]) && !this._gridCtrl.getTileValue(tile[0], tile[1], 2);
            });

        // Check paths leading out from these neighboring cells.
        const path = [startCell];
        for (let x = 0; x < closenessScores.length; x++) {
            const tile = closenessScores[x];

            // If final cell is target cell, we've found our shortest path.
            if (this._getShortestPath(tile[0], tile[1], path, targetCell)) {
                return path.map(cell => this._convertCellToRowCol(cell));
            }
        }

        // Having reached this point, there was no viable path to target cell.
        return [];
    }
}
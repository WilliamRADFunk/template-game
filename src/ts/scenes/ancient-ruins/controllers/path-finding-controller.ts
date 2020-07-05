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
     * @param testPath path leading up to this cell in order to check for cycles
     * @param startCell reference number for the cell crew member started from
     * @param targetCell reference number fot the cell crew member is trying to reach
     * @returns path of cell reference numbers that lead to target cell. Empty means not a valid path
     */
    private _getShortestPath(row: number, col: number, testPath: number[], startCell: number, targetCell: number): number[] {
        const availablePaths: number[][] = adjacencyMods
            .map(mod => {
                const testedRow = row + mod[0];
                const testedCol = col + mod[1];
                const testedCell = this._convertRowColToCell(testedRow, testedCol);
                let testedPath: number[] = [...testPath, testedCell];

                // If new cell is the same as the original cell, it make a perfect cycle. Bail out early.
                if (testedCell === startCell) {
                    return [];
                }

                // Verifies that this new cell doesn't create a cycle. If so, bail out early.
                if (this._checkForCycle(testedPath, testedCell)) {
                    return [];
                }

                // If the cell is out of bounds, it's not a valid path. Bail out early.
                if (!this._gridCtrl.isInBounds(testedRow, testedCol)) {
                    return [];
                }

                // This is the target cell. Bail out early.
                if (testedCell === targetCell) {
                    return testedPath;
                }
                
                // Finds shortest path to target leading out from this cell.
                testedPath = this._getShortestPath(testedRow, testedCol, testedPath.slice(), startCell, targetCell);

                // Only return the value if the final value is the target cell.
                if (testedPath[testedPath.length - 1] === targetCell) {
                    return testedPath;
                }

                // If this is reached, there was no valid path leading out from this cell.
                return [];
            })
            .filter(x => x.length);
        
        // Start with the first path, to compare again the other seven possibilities.
        let shortestPath = availablePaths.pop();

        // Check remaining paths if any were shorter than the first.
        availablePaths.forEach(path => {
            if (path.length < shortestPath.length) {
                shortestPath = path;
            }
        });

        return shortestPath;
    }

    /**
     * Parent function to the recursive path finding function calls. Chooses the path with the least number of cells.
     * @param row1 coordinate of the tile
     * @param col1 coordinate of the tile
     * @param row2 coordinate of the tile
     * @param col2 coordinate of the tile
     * @returns path of [row, col] values that lead to target cell. Empty means not a valid path
     */
    public getShortestPath(row1: number, col1: number, row2: number, col2: number): [number, number][] {
        const startCell = this._convertRowColToCell(row1, col1);
        const targetCell = this._convertRowColToCell(row2, col2);

        // Crew member is already in that cell. Bail out early.
        if (startCell === targetCell) {
            return [];
        }

        const availablePaths: number[][] = adjacencyMods
            .map(mod => {
                const testedRow = row1 + mod[0];
                const testedCol = col1 + mod[1];
                const testedCell = this._convertRowColToCell(testedRow, testedCol);
                let testedPath: number[] = [testedCell];

                // If the cell is out of bounds, it's not a valid path. Bail out early.
                if (!this._gridCtrl.isInBounds(testedRow, testedCol)) {
                    return [];
                }

                // This is the target cell. Bail out early.
                if (testedCell === targetCell) {
                    return testedPath;
                }
                
                // Finds shortest path to target leading out from this cell.
                testedPath = this._getShortestPath(testedRow, testedCol, testedPath.slice(), startCell, targetCell);

                // Only return the value if the final value is the target cell.
                if (testedPath[testedPath.length - 1] === targetCell) {
                    return testedPath;
                }

                // If this is reached, there was no valid path leading out from this cell.
                return [];
            })
            .filter(x => x.length);
        
        // Start with the first path, to compare again the other seven possibilities.
        let shortestPath = availablePaths.pop();

        // Check remaining paths if any were shorter than the first.
        availablePaths.forEach(path => {
            if (path.length < shortestPath.length) {
                shortestPath = path;
            }
        });

        // Convert path of cells back to their usable [row, col] values.
        return shortestPath.map(cell => this._convertCellToRowCol(cell));
    }
}
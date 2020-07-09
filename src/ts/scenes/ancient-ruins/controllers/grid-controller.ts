import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    Texture,
    Vector2,
    NearestFilter,
    RepeatWrapping,
    FrontSide} from "three";

import {
    AncientRuinsSpecifications,
    PlantColor,
    RuinsBiome,
    TreeLeafColor,
    TreeTrunkColor,
    WaterBiome,
    WaterColor } from "../../../models/ancient-ruins-specifications";
import { TileCtrl } from "./tile-controller";
import { RandomWithBounds } from "../../../utils/random-with-bounds";
import { LayerYPos } from "../utils/layer-y-values";
import { RAD_90_DEG_LEFT } from "../utils/radians-x-degrees-left";
import { spriteMapCols, spriteMapRows } from "../utils/tile-values";
import { MIN_ROWS, MAX_ROWS, MIN_COLS, MAX_COLS, MIDDLE_ROW, MIDDLE_COL } from "../utils/grid-constants";
import { createBoxWithRoundedEdges } from "../../../utils/create-box-with-rounded-edges";
import { AncientRuinsState } from "../ancient-ruins";
import { isInBounds } from "../utils/is-in-bounds";
import { isBlocking } from "../utils/is-blocking";

const fiftyFifty = () => Math.random() < 0.5;

let landingFrameCounter = -1;
let overheadMeshOpacityFrameCounter = 0;
const overheadMeshOpacityFrameCounterReset = 30;

const overheadRowColModVals = [ [0, 0], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1] ];

function shuffle(arr: any[]): any[] {
    for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i);
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

export const getXPos = function(col: number): number {
    return -5.8 + (col/2.5);
};
export const getZPos = function(row: number): number {
    return 5.8 - (row/2.5);
};

export class GridCtrl {
    /**
     * Specification of what the planet and ruins below should look like.
     */
    private _ancientRuinsSpec: AncientRuinsSpecifications;

    /**
     * Cloud meshes for passing overhead.
     */
    private _clouds: Mesh[] = [];

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
     * [elevation] 4    Fog of war. Normally high opacity, but transparent when in range of crew member's view distance.
     * Light:           Negative values mirror the positive values as the same content, but dark. Astroteam can counter when in range.
     * Type:            [row][col][elevation] gives "type" of tile
     */
    private _grid: number[][][] = [];

    /**
     * Landing shadow the grows and shrinks when ship lands and takes off again.
     */
    private _landingShadow: Mesh = null;

    /**
     * Dictionary of materials already made for use in building out the game's tile map.
     */
    private _materialsMap: { [key: number]: MeshBasicMaterial } = {};

    /**
     * The mesh array with meshes of all tiles on game map at level 1.
     */
    private _level1GroundMeshMap: Mesh[][] = [];

    /**
     * The mesh array with meshes of all tiles on game map at level 2.
     */
    private _level2TraverseMeshMap: Mesh[][] = [];

    /**
     * The mesh array with meshes of all tiles on game map at level 3.
     */
    private _level3OverheadMeshMap: Mesh[][] = [];

    /**
     * The mesh array with meshes of all tiles on game map at level 4.
     */
    private _level4FogOfWarMeshMap: Mesh[][] = [];

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * All of the textures contained in this scene.
     */
    private _textures: { [key: string]: Texture } = {};

    /**
     * All of the tile textures contained in this scene.
     */
    private _tileCtrl: TileCtrl;

    constructor(scene: Scene, textures: { [key: string]: Texture }, ancientRuinsSpec: AncientRuinsSpecifications, tileCtrl: TileCtrl) {
        this._scene = scene;
        this._textures = textures;
        this._ancientRuinsSpec = ancientRuinsSpec;
        this._tileCtrl = tileCtrl;

        this._makeMaterials();

        // Remaining initialization functions called by game controller.
    }

    private _adjustFogOfWar(): void {
        // Reset all fog of war tiles to 1
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (!isInBounds(row, col)) continue;
                this._grid[row][col][4] = 1;
            }
        }

        // Set only those tiles in range of crew members' visibility to 0
        this._ancientRuinsSpec.crew.map(c => c.position).forEach(cPos => {
            if (cPos) {
                overheadRowColModVals.forEach(overPos => {
                    const posX = cPos[0] + overPos[0];
                    const posY = cPos[1] + overPos[1];

                    if (isInBounds(posX, posY)) {
                        this._grid[posX][posY][4] = 0;
                    }
                });
            }
        });

        // Not that the tiles are updated, it only takes a single pass through to update material opacities.
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (!isInBounds(row, col)) continue;
                
                if (this._grid[row][col][4]) {
                    (this._level4FogOfWarMeshMap[row][col].material as MeshBasicMaterial).opacity = 0.9;
                } else {
                    (this._level4FogOfWarMeshMap[row][col].material as MeshBasicMaterial).opacity = 0;
                }
            }
        }
    }

    /**
     * Checks a given tile for grass, and adds 10% chance to spread.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @returns additional spread percentage for grass
     */
    private _checkGrassSpread(row: number, col: number): number {
        // If non-zero, then it's a grass tile, thus increasing grass spread another 15%
        return (isInBounds(row, col) && this._grid[row][col][1] === 1) ? this._ancientRuinsSpec.plantSpreadability : 0;
    }

    /**
     * Checks surrounding tiles for obstructions to determine if area is good for landing.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @param cellsToCheck list of row/col mod values to check.
     * @returns TRUE if valid landing zone | FALSE if there are obstructions
     */
    private _checkPotentialLandingZone(row: number, col: number, cellsToCheck: number[][]): boolean {
        // If even one of the 9 cells is out of bounds or blocked or water tile, then it isn't a valid landing zone.
        return !cellsToCheck.some(rowColMods => {
            const cell = [row + rowColMods[0], col + rowColMods[1]];
            return !isInBounds(cell[0], cell[1])
                || !!this._grid[cell[0]][cell[1]][0]
                || !!this._grid[cell[0]][cell[1]][2]
                || !!this._grid[cell[0]][cell[1]][3]
                || (this._grid[cell[0]][cell[1]][1] > this._tileCtrl.getWaterBaseValue() && this._grid[cell[0]][cell[1]][1] < this._tileCtrl.getWaterEndValue());
        });
            
    }

    /**
     * Checks a given tile for water, and adds 10% chance to spread.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @returns additional spread percentage for water
     */
    private _checkWaterSpread(row: number, col: number): number {
        // If non-zero, then it's a water tile, thus increasing water spread another 10%
        return (isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) ? this._ancientRuinsSpec.waterSpreadability : 0;
    }

    /**
     * Create a number of varied clouds to pass from left to right across the screen periodically.
     */
    private _createClouds(): void {
        if (!this._ancientRuinsSpec.hasClouds) {
            return;
        }
        for (let i = 0; i < 10; i++) {
            const material: MeshBasicMaterial = this._materialsMap[2500 + i];
            const geometry: PlaneGeometry = new PlaneGeometry( 1, 1, 10, 10 );

            const cloud = new Mesh( geometry, material );
            cloud.rotation.set(RAD_90_DEG_LEFT, 0, 0);
            cloud.name = `cloud-${i}`;
            this._clouds.push(cloud);
            this._scene.add(cloud);

            this._resetCloud(cloud);
        }
    }


    /**
     * Create opaque fog of war tiles at level 4.
     * @returns an empty promise to make function async
     */
    private async _createFogOfWarLevelMeshes(): Promise<void> {
        const material: MeshBasicMaterial = new MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.9,
            side: DoubleSide,
            transparent: true
        });
        return new Promise((resolve) => {
            for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
                for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                    if (isInBounds(row, col)) {
                        const mat = material.clone();
                        const geometry: PlaneGeometry = new PlaneGeometry( 0.4, 0.4, 10, 10 );

                        const fogTile = new Mesh( geometry, mat );
                        fogTile.position.set(getXPos(col), LayerYPos.LAYER_3, getZPos(row))
                        fogTile.rotation.set(RAD_90_DEG_LEFT, 0, 0);
                        fogTile.name = `fog-${row}-${col}`;
                        fogTile.updateMatrix();
                        this._scene.add(fogTile);
                        if (!this._level4FogOfWarMeshMap[row]) {
                            this._level4FogOfWarMeshMap[row] = [];
                        }
                        this._level4FogOfWarMeshMap[row][col] = fogTile;
                        this._grid[row][col][4] = 1;
                    }
                }
            }

            resolve();
        }).then(() => {});
    }

    /**
     * Uses the tile grid to make meshes that match tile values.
     * @returns an empty promise to make function async
     */
    private async _createGroundLevelMeshes(): Promise<void> {
        return new Promise((resolve) => {
            for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
                for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                    if (isInBounds(row, col) && this._grid[row][col][1]) {
                        let material: MeshBasicMaterial = this._materialsMap[this._grid[row][col][1]];

                        // If material type has a second variation, randomize between the two.
                        if (this._tileCtrl.getGridDicVariation(this._grid[row][col][1]) && fiftyFifty()) {
                            material = this._materialsMap[this._grid[row][col][1] + 1];
                        }

                        const tile = new Mesh( this._geometry, material );
                        tile.position.set(getXPos(col), LayerYPos.LAYER_0, getZPos(row))
                        tile.rotation.set(RAD_90_DEG_LEFT, 0, 0);
                        tile.name = `tile-${row}-${col}`;
                        this._scene.add(tile);
                        if (!this._level1GroundMeshMap[row]) {
                            this._level1GroundMeshMap[row] = [];
                        }
                        this._level1GroundMeshMap[row][col] = tile;
                    }
                }
            }
            resolve();
        }).then(() => {});
    }

    /**
     * Finds a place along the edge of one of the four sides of the map to place the away team.
     */
    private _createLandingZone(): number[] {
        const bottomRowColModVals = [ [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2] ];
        const leftRowColModVals = [ [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2] ];
        const rightRowColModVals = [ [0, 0], [0, -1], [0, -2], [1, 0], [1, -1], [1, -2], [2, 0], [2, -1], [2, -2] ];
        const topEdgeRowColModVals = [ [0, 0], [0, 1], [0, 2], [-1, 0], [-1, 1], [-1, 2], [-2, 0], [-2, 1], [-2, 2] ];
        const sideOfMapPreference = shuffle(shuffle(shuffle([1, 2, 3, 4, 1])));
        const landZoneVal = this._tileCtrl.getLandingZoneValue();

        do {
            switch(sideOfMapPreference[0]) {
                case 1: { // Bottom of screen
                    // Middle toward right first.
                    for (let row = MIN_ROWS; row < 2; row++) {
                        for (let col = MIDDLE_COL; col < MAX_COLS - 10; col++) {
                            if (isInBounds(row, col) && !this._grid[row][col][2] && this._checkPotentialLandingZone(row, col, bottomRowColModVals)) {
                                bottomRowColModVals.forEach( rowColMods => this._grid[row + rowColMods[0]][col + rowColMods[1]][0] = landZoneVal + 2);
                                return [row + bottomRowColModVals[4][0], col + bottomRowColModVals[4][1]];
                            }
                        }
                    }
                    // Middle toward left second.
                    for (let row = MIN_ROWS; row < 2; row++) {
                        for (let col = MIDDLE_COL - 1; col > MIN_COLS + 2; col--) {
                            if (isInBounds(row, col) && !this._grid[row][col][2] && this._checkPotentialLandingZone(row, col, bottomRowColModVals)) {
                                bottomRowColModVals.forEach( rowColMods => this._grid[row + rowColMods[0]][col + rowColMods[1]][0] = landZoneVal + 2);
                                return [row + bottomRowColModVals[4][0], col + bottomRowColModVals[4][1]];
                            }
                        }
                    }
                    break;
                }
                case 2: { // Top of screen
                    // Middle toward right first.
                    for (let row = MAX_ROWS; row > MAX_ROWS - 2; row--) {
                        for (let col = MIDDLE_COL; col < MAX_COLS - 2; col++) {
                            if (isInBounds(row, col) && !this._grid[row][col][2] && this._checkPotentialLandingZone(row, col, topEdgeRowColModVals)) {
                                topEdgeRowColModVals.forEach( rowColMods => this._grid[row + rowColMods[0]][col + rowColMods[1]][0] = landZoneVal);
                                return [row + topEdgeRowColModVals[4][0], col + topEdgeRowColModVals[4][1]];
                            }
                        }
                    }
                    // Middle toward left second.
                    for (let row = MAX_ROWS; row > MAX_ROWS - 2; row--) {
                        for (let col = MIDDLE_COL - 1; col > MIN_COLS + 2; col--) {
                            if (isInBounds(row, col) && !this._grid[row][col][2] && this._checkPotentialLandingZone(row, col, topEdgeRowColModVals)) {
                                topEdgeRowColModVals.forEach( rowColMods => this._grid[row + rowColMods[0]][col + rowColMods[1]][0] = landZoneVal);
                                return [row + topEdgeRowColModVals[4][0], col + topEdgeRowColModVals[4][1]];
                            }
                        }
                    }
                    break;
                }
                case 3: { // Left side of screen
                    // Middle toward top first.
                    for (let col = MIN_COLS; col < 2; col++) {
                        for (let row = MIDDLE_ROW; row < MAX_ROWS - 2; row++) {
                            if (isInBounds(row, col) && !this._grid[row][col][2] && this._checkPotentialLandingZone(row, col, leftRowColModVals)) {
                                leftRowColModVals.forEach( rowColMods => this._grid[row + rowColMods[0]][col + rowColMods[1]][0] = landZoneVal + 3);
                                return [row + leftRowColModVals[4][0], col + leftRowColModVals[4][1]];
                            }
                        }
                    }
                    // Middle toward bottom second.
                    for (let col = MIN_COLS; col < 2; col++) {
                        for (let row = MIDDLE_ROW; row < MIN_ROWS + 2; row--) {
                            if (isInBounds(row, col) && !this._grid[row][col][2] && this._checkPotentialLandingZone(row, col, leftRowColModVals)) {
                                leftRowColModVals.forEach( rowColMods => this._grid[row + rowColMods[0]][col + rowColMods[1]][0] = landZoneVal + 3);
                                return [row + leftRowColModVals[4][0], col + leftRowColModVals[4][1]];
                            }
                        }
                    }
                    break;
                }
                case 4: { // Right side of screen
                    // Middle toward top first.
                    for (let col = MAX_COLS; col > MAX_COLS - 2; col--) {
                        for (let row = MIDDLE_ROW; row < MAX_ROWS - 4; row++) {
                            if (isInBounds(row, col) && !this._grid[row][col][2] && this._checkPotentialLandingZone(row, col, rightRowColModVals)) {
                                rightRowColModVals.forEach( rowColMods => this._grid[row + rowColMods[0]][col + rowColMods[1]][0] = landZoneVal + 1);
                                return [row + rightRowColModVals[4][0], col + rightRowColModVals[4][1]];
                            }
                        }
                    }
                    // Middle toward bottom second.
                    for (let col = MAX_COLS; col > MAX_COLS - 2; col--) {
                        for (let row = MIDDLE_ROW; row < MIN_ROWS + 2; row--) {
                            if (isInBounds(row, col) && !this._grid[row][col][2] && this._checkPotentialLandingZone(row, col, rightRowColModVals)) {
                                rightRowColModVals.forEach( rowColMods => this._grid[row + rowColMods[0]][col + rowColMods[1]][0] = landZoneVal + 1);
                                return [row + rightRowColModVals[4][0], col + rightRowColModVals[4][1]];
                            }
                        }
                    }
                    break;
                }
            }
            sideOfMapPreference.shift();
        } while (sideOfMapPreference.length);
        return null;
    }

    /**
     * Places a square graphic above the ground but below away team that "scorches" the ground to designate landing zone.
     */
    private _createLandingZoneShadow(center: number[]): void {
        if (center) {
            const landingGeo = createBoxWithRoundedEdges(1.2, 1.2, 0.05, 0)
            const landingMat: MeshBasicMaterial = new MeshBasicMaterial({
                color: 0x333333,
                opacity: 0.9,
                side: DoubleSide,
                transparent: true
            });
            this._landingShadow = new Mesh(landingGeo, landingMat);
            this._landingShadow.rotation.set(RAD_90_DEG_LEFT, 0, 0);
            this._landingShadow.position.set(getXPos(center[1]), LayerYPos.LAYER_0_5, getZPos(center[0]));
            this._scene.add(this._landingShadow);
        }
    }

    /**
     * Uses the tile grid to make meshes that match tile values.
     * @returns an empty promise to make function async
     */
    private async _createOverheadLevelMeshes(): Promise<void> {
        return new Promise((resolve) => {
            for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
                for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                    if (isInBounds(row, col) && this._grid[row][col][3] && this._materialsMap[this._grid[row][col][3]]) {
                        const posX = getXPos(col) + this._tileCtrl.getGridDicPosMod(this._grid[row][col][3]);
                        const posZ = getZPos(row) + this._tileCtrl.getGridDicPosMod(this._grid[row][col][3], true);
                        const scaleX = 1 + this._tileCtrl.getGridDicScaleMod(this._grid[row][col][3]);
                        const scaleZ = 1 + this._tileCtrl.getGridDicScaleMod(this._grid[row][col][3], true);

                        let material: MeshBasicMaterial = this._materialsMap[this._grid[row][col][3]].clone();

                        const tile = new Mesh( this._geometry, material );
                        tile.scale.set(scaleX, scaleZ, scaleZ);
                        tile.position.set(posX, LayerYPos.LAYER_2, posZ)
                        tile.rotation.set(RAD_90_DEG_LEFT, 0, 0);
                        (tile.material as MeshBasicMaterial).opacity = 1;
                        tile.name = `over:${row}:${col}`;
                        tile.updateMatrix();
                        this._scene.add(tile);
                        if (!this._level3OverheadMeshMap[row]) {
                            this._level3OverheadMeshMap[row] = [];
                        }
                        this._level3OverheadMeshMap[row][col] = tile;
                    }
                }
            }

            resolve();
        }).then(() => {});
    }

    /**
     * Uses the tile grid to make meshes that match tile values.
     * @returns an empty promise to make function async
     */
    private async _createTraverseLevelMeshes(): Promise<void> {
        new Promise((resolve) => {
            for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
                for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                    if (isInBounds(row, col) && this._grid[row][col][2] && this._materialsMap[this._grid[row][col][2]]) {
                        const posX = getXPos(col) + this._tileCtrl.getGridDicPosMod(this._grid[row][col][2]);
                        const posZ = getZPos(row) + this._tileCtrl.getGridDicPosMod(this._grid[row][col][2], true);
                        const scaleX = 1 + this._tileCtrl.getGridDicScaleMod(this._grid[row][col][2]);
                        const scaleZ = 1 + this._tileCtrl.getGridDicScaleMod(this._grid[row][col][2], true);

                        let material: MeshBasicMaterial = this._materialsMap[this._grid[row][col][2]];

                        // If material type has a second variation, randomize between the two.
                        if (this._tileCtrl.getGridDicVariation(this._grid[row][col][2]) && fiftyFifty()) {
                            material = this._materialsMap[this._grid[row][col][2] + 1]
                        }

                        const tile = new Mesh( this._geometry, material );
                        tile.scale.set(scaleX, scaleZ, scaleZ);
                        tile.position.set(posX, LayerYPos.LAYER_1, posZ)
                        tile.rotation.set(RAD_90_DEG_LEFT, 0, 0);
                        tile.name = `level:${row}:${col}`;
                        tile.updateMatrix();
                        this._scene.add(tile);
                        if (!this._level2TraverseMeshMap[row]) {
                            this._level2TraverseMeshMap[row] = [];
                        }
                        this._level2TraverseMeshMap[row][col] = tile;
                    }
                }
            }
            resolve();
        }).then(() => {});
    }

    /**
     * Handles the endCycle functionality of clouds.
     */
    private _cycleClouds(): void {
        this._clouds.forEach(cloud => {
            const currPos = cloud.position;
            if (currPos.x > 12) {
                this._resetCloud(cloud);
            } else {
                cloud.position.x += Number(cloud.name);
            }
        });
    }

    /**
     * Randomly drops boulders in the deep waters, and sets them to obstructed.
     */
    private _dropBouldersInWater(): void {
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (!isInBounds(row, col)) continue;

                if (this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue() && !this._grid[row][col][2]) {
                    this._grid[row][col][2] = this._tileCtrl.getWaterBaseValue() + 30; // Water is too deep to cross.
                    if (Math.random() < 0.06) {
                        // Adds one of 6 boulder in water variations.
                        this._grid[row][col][2] = this._tileCtrl.getWaterBaseValue() + 24 + Math.floor(Math.random() * 5);
                    }
                }
            }
        }
    }

    /**
     * Makes water tiles specific to an oceanside look and feel
     */
    private _makeBeaches(): void {
        const min = 8;
        const max = 12;
        switch(Math.floor(Math.random() * 3)) {
            case 0: { // top
                for (let col = MIN_COLS; col < MAX_COLS + 1; col += 3) {
                    const fillAmount = RandomWithBounds(min, max);
                    for (let row = MAX_ROWS; row > MAX_ROWS - fillAmount; row--) {
                        isInBounds(row, col) && (this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue());
                        isInBounds(row, col + 1) && (this._grid[row][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                        isInBounds(row, col + 2) && (this._grid[row][col + 2][1] = this._tileCtrl.getWaterBaseValue());
                    }
                }
                break;
            }
            case 1: { // left
                for (let row = MIN_ROWS; row < MAX_ROWS + 1; row += 3) {
                    const fillAmount = RandomWithBounds(min, max);
                    for (let col = MIN_COLS; col < fillAmount; col++) {
                        isInBounds(row, col) && (this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue());
                        isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue());
                        isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = this._tileCtrl.getWaterBaseValue());
                    }
                }
                break;
            }
            case 2: { // right
                for (let row = MIN_ROWS; row < MAX_ROWS + 1; row += 3) {
                    const fillAmount = RandomWithBounds(min, max);
                    for (let col = MAX_COLS; col > MAX_COLS - fillAmount; col--) {
                        isInBounds(row, col) && (this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue());
                        isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue());
                        isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = this._tileCtrl.getWaterBaseValue());
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
        console.log('_makeCemetery', 'called');
    }

    /**
     * Makes an ancient city on the map.
     */
    private _makeCity(): void {
        // TODO: Cover upper 2/3rds of the map with buildings, roads, lighting, vehicles.
        // Optionally choose to do nothing, add craters, or other signs of how the city was destroyed.
        console.log('_makeCity', 'called');
    }

    /**
     * Makes water tiles specific to a narrow creek.
     */
    private _makeCreek(): void {
        const flowsHorizontally = fiftyFifty();
        const startRow = Math.floor(Math.random() * ((MAX_ROWS - 9) - (MIN_ROWS + 10) + 1)) + (MIN_ROWS + 10);
        const startCol = startRow;

        if (flowsHorizontally) {
            const flowsUp = startRow < MIDDLE_ROW;
            let lastRow = startRow;
            if (flowsUp) {
                for (let col = MIN_COLS; col < MAX_COLS + 1; col += 2) {
                    // Small chance to flow back down
                    if (Math.random() < 0.1 && lastRow > MIN_ROWS + 1) {
                        lastRow--;
                    // Remaining 50/50 to flow up or stay level.
                    } else if (fiftyFifty() && lastRow < MAX_ROWS - 1) {
                        lastRow++;
                    }
                    this._grid[lastRow][col][1] = this._tileCtrl.getWaterBaseValue();
                    this._grid[lastRow + 1][col][1] = this._tileCtrl.getWaterBaseValue();
                    isInBounds(lastRow, col + 1) && (this._grid[lastRow][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(lastRow + 1, col + 1) && (this._grid[lastRow + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                }
            } else {
                for (let col = MIN_COLS; col < MAX_COLS + 1; col += 2) {
                    // Small chance to flow back up
                    if (Math.random() < 0.1 && lastRow < MAX_ROWS - 1) {
                        lastRow++;
                    // Remaining 50/50 to flow down or stay level.
                    } else if (fiftyFifty() && lastRow > MIN_ROWS + 1) {
                        lastRow--;
                    }
                    this._grid[lastRow][col][1] = this._tileCtrl.getWaterBaseValue();
                    this._grid[lastRow + 1][col][1] = this._tileCtrl.getWaterBaseValue();
                    isInBounds(lastRow, col + 1) && (this._grid[lastRow][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(lastRow + 1, col + 1) && (this._grid[lastRow + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                }
            }
        } else {
            const flowsRight = startCol < MIDDLE_COL;
            let lastCol = startCol;
            if (flowsRight) {
                for (let row = MIN_ROWS; row < MAX_ROWS + 1; row += 2) {
                    // Small chance to flow back left
                    if (Math.random() < 0.1 && lastCol > MIN_COLS + 1) {
                        lastCol--;
                    // Remaining 50/50 to flow right or stay level.
                    } else if (fiftyFifty() && lastCol < MAX_COLS - 1) {
                        lastCol++;
                    }
                    this._grid[row][lastCol][1] = this._tileCtrl.getWaterBaseValue();
                    this._grid[row][lastCol + 1][1] = this._tileCtrl.getWaterBaseValue();
                    isInBounds(row + 1, lastCol) && (this._grid[row + 1][lastCol][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(row + 1, lastCol + 1) && (this._grid[row + 1][lastCol + 1][1] = this._tileCtrl.getWaterBaseValue());
                }
            } else {
                for (let row = MIN_ROWS; row < MAX_ROWS + 1; row += 2) {
                    // Small chance to flow back right
                    if (Math.random() < 0.1 && lastCol < MAX_COLS - 1) {
                        lastCol++;
                    // Remaining 50/50 to flow left or stay level.
                    } else if (fiftyFifty() && lastCol > MIN_COLS + 1) {
                        lastCol--;
                    }
                    this._grid[row][lastCol][1] = this._tileCtrl.getWaterBaseValue();
                    this._grid[row][lastCol + 1][1] = this._tileCtrl.getWaterBaseValue();
                    isInBounds(row + 1, lastCol) && (this._grid[row + 1][lastCol][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(row + 1, lastCol + 1) && (this._grid[row + 1][lastCol + 1][1] = this._tileCtrl.getWaterBaseValue());
                }
            }
        }
    }

    /**
     * Sets up the grid with grass values.
     */
    private _makeGrass(): void {
        // If no plants on planet, don't spawn grass.
        if (this._ancientRuinsSpec.plantColor === PlantColor.None) {
            for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
                this._grid[row] = [];
                for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                    if (!isInBounds(row, col)) continue;

                    this._grid[row][col] = [];
                    this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
                    this._grid[row][col][0] = 0;
                    this._grid[row][col][2] = 0;
                    this._grid[row][col][3] = 0;
                    this._grid[row][col][4] = 0;
                }
            }
            return;
        }

        // Seed the grass
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            this._grid[row] = [];
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (!isInBounds(row, col)) continue;

                this._grid[row][col] = [];
                if (Math.random() < this._ancientRuinsSpec.plantPercentage) {
                    this._grid[row][col][1] = 1;
                } else {
                    this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
                }
                this._grid[row][col][0] = 0;
                this._grid[row][col][2] = 0;
                this._grid[row][col][3] = 0;
                this._grid[row][col][4] = 0;
            }
        }

        // Organically let the grass spread
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (isInBounds(row, col) && this._grid[row][col][1] !== 1) {
                    const hasGrassPercentage = 0.01
                        + this._checkGrassSpread(row + 1, col - 1)
                        + this._checkGrassSpread(row, col - 1)
                        + this._checkGrassSpread(row - 1, col - 1)
                        + this._checkGrassSpread(row + 1, col)
                        + this._checkGrassSpread(row - 1, col)
                        + this._checkGrassSpread(row + 1, col + 1)
                        + this._checkGrassSpread(row, col + 1)
                        + this._checkGrassSpread(row - 1, col + 1)
                    this._grid[row][col][1] = (Math.random() < hasGrassPercentage) ? 1 : this._tileCtrl.getGroundBaseValue() + 21;
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
        const centerRow = Math.floor(Math.random() * 3) + MIDDLE_ROW;
        const centerCol = Math.floor(Math.random() * 3) + MIDDLE_COL;

        for (let row = centerRow; row < MAX_ROWS - 3; row += 3) {
            const leftRadius = RandomWithBounds(min, max);
            const rightRadius = RandomWithBounds(min, max);
            for (let col = centerCol; col > centerCol - leftRadius; col--) {
                this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue());
                isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = this._tileCtrl.getWaterBaseValue());
            }
            for (let col = centerCol; col < centerCol + rightRadius; col++) {
                this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue());
                isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = this._tileCtrl.getWaterBaseValue());
            }
        }
        for (let row = centerRow; row > MIN_ROWS + 4; row -= 3) {
            const leftRadius = RandomWithBounds(min, max);
            const rightRadius = RandomWithBounds(min, max);
            for (let col = centerCol; col > centerCol - leftRadius; col--) {
                this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                isInBounds(row - 1, col) && (this._grid[row - 1][col][1] = this._tileCtrl.getWaterBaseValue());
                isInBounds(row - 2, col) && (this._grid[row - 2][col][1] = this._tileCtrl.getWaterBaseValue());
            }
            for (let col = centerCol; col < centerCol + rightRadius; col++) {
                this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                isInBounds(row - 1, col) && (this._grid[row - 1][col][1] = this._tileCtrl.getWaterBaseValue());
                isInBounds(row - 2, col) && (this._grid[row - 2][col][1] = this._tileCtrl.getWaterBaseValue());
            }
        }

    }

    /**
     * Makes ancient library.
     */
    private _makeLibrary(): void {
        // TODO: either a cluster of small connected buildings, or one large building. Rows of shelves for scrolls, books, or pictures.
        // Depending on tech level could actually be a server farm for digital data storage.
        console.log('_makeLibrary', 'called');
    }

    /**
     * Makes all the tile materials for the game map.
     */
    private _makeMaterials(): void {
        this._tileCtrl.getGridDicKeys().forEach(key => {
            const offCoords = this._tileCtrl.getGridDicSpritePos(key);
            const size = this._tileCtrl.getGridDicCustomSize(key) || [spriteMapCols, spriteMapRows];

            if (offCoords[0] >= 0 && offCoords[1] >= 0) {
                const isGroundLevelMat = (Number(key) <= this._tileCtrl.getGroundLevelEndValue());
                const material: MeshBasicMaterial = new MeshBasicMaterial({
                    color: 0xFFFFFF,
                    map: this._textures.spriteMapAncientRuins.clone(),
                    side: isGroundLevelMat ? FrontSide : DoubleSide,
                    transparent: !isGroundLevelMat
                });

                material.map.offset = new Vector2(
                    (1 / size[0]) * offCoords[0],
                    (1 / size[1]) * offCoords[1]);

                material.map.repeat = new Vector2(
                    (1 / size[0]),
                    (1 / size[1]));

                material.map.magFilter = NearestFilter;
                material.map.minFilter = NearestFilter;
                material.map.wrapS = RepeatWrapping;
                material.map.wrapT = RepeatWrapping;

                material.depthTest = false;
                material.map.needsUpdate = true;

                this._materialsMap[key] = material;
            }
        });
    }

    /**
     * Makes an ancient military base somewhereon the map.
     */
    private _makeMilitaryBase(): void {
        // TODO: centrally located with large hangers, concrete bunkers, missile silos, etc.
        console.log('_makeMilitaryBase', 'called');
    }

    /**
     * Makes an ancient monastery somewhere roughly in the center of the map.
     */
    private _makeMonastery(): void {
        // TODO: Randomly places a large religious structure somewhere in center of map.
        // If in water biome like large lake, must make sure a bridge reaches an entrance.
        console.log('_makeMonastery', 'called');
    }

    /**
     * Makes water tiles specific to a long map-spanning river.
     */
    private _makeRiver(): void {
        const flowsHorizontally = fiftyFifty();
        const startRow = Math.floor(Math.random() * ((MAX_ROWS - 9) - (MIN_ROWS + 10) + 1)) + (MIN_ROWS + 10);
        const startCol = startRow;
        const maxPathShift = 2;
        const minPathShift = 0;
        const maxThickness = 4;
        const minThickness = 2;

        if (flowsHorizontally) {
            let prevRow = startRow;
            for (let col = MIN_COLS; col < MAX_ROWS + 1; col += 3) {
                const upOrDown = startRow < MIDDLE_ROW;
                const amount = Math.floor(Math.random() * (maxPathShift - minPathShift + 1)) + minPathShift;
                prevRow = upOrDown ? prevRow + amount : prevRow - amount;

                const thickness = Math.floor(Math.random() * (maxThickness - minThickness + 1)) + minThickness;
                for (let t = 0; t <= thickness; t++) {
                    isInBounds(prevRow + t, col) && (this._grid[prevRow + t][col][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(prevRow + t, col + 1) && (this._grid[prevRow + t][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(prevRow + t, col + 2) && (this._grid[prevRow + t][col + 2][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(prevRow - t, col) && (this._grid[prevRow - t][col][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(prevRow - t, col + 1) && (this._grid[prevRow - t][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(prevRow - t, col + 2) && (this._grid[prevRow - t][col + 2][1] = this._tileCtrl.getWaterBaseValue());
                }
            }
        } else {
            let prevCol = startCol;
            for (let row = MIN_ROWS; row < MAX_ROWS + 1; row += 3) {
                const leftOrRight = startCol > MIDDLE_COL;
                const amount = Math.floor(Math.random() * (maxPathShift - minPathShift + 1)) + minPathShift;
                prevCol = leftOrRight ? prevCol - amount : prevCol + amount;

                const thickness = Math.floor(Math.random() * (maxThickness - minThickness + 1)) + minThickness;
                for (let t = 0; t <= thickness; t++) {
                    isInBounds(row, prevCol + t) && (this._grid[row][prevCol + t][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(row + 1, prevCol + t) && (this._grid[row + 1][prevCol + t][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(row + 2, prevCol + t) && (this._grid[row + 2][prevCol + t][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(row, prevCol - t) && (this._grid[row][prevCol - t][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(row + 1, prevCol - t) && (this._grid[row + 1][prevCol - t][1] = this._tileCtrl.getWaterBaseValue());
                    isInBounds(row + 2, prevCol - t) && (this._grid[row + 2][prevCol - t][1] = this._tileCtrl.getWaterBaseValue());
                }
            }
        }

        // Vertical Bridge
        if (flowsHorizontally) {
            let randomCol;
            let bottomRow;
            let topRow;
            while(true) {
                randomCol = Math.floor(Math.random() * ((MAX_COLS - 2) - (MIN_COLS + 2) + 1)) + (MIN_COLS + 2);
                for (let i = MIN_ROWS; i < MAX_ROWS + 1; i++) {
                    if (isInBounds(i, randomCol) && this._grid[i][randomCol][1] === this._tileCtrl.getWaterBaseValue()) {
                        bottomRow = i;
                        break;
                    }
                }
                for (let j = bottomRow; j < MAX_ROWS + 1; j++) {
                    if (isInBounds(j, randomCol) && this._grid[j][randomCol][1] === this._tileCtrl.getWaterBaseValue()) {
                        topRow = j;
                    } else {
                        break;
                    }
                }
                // Ensures the randomly selected point along the river has land on both sides.
                if (bottomRow !== MIN_ROWS && topRow !== MAX_ROWS) {
                    break;
                }
            }
            let leftCol = randomCol;
            let currCol = randomCol;
            while (isInBounds(bottomRow, currCol - 1)
                && this._grid[bottomRow][currCol - 1][1] === this._tileCtrl.getWaterBaseValue()
                && isInBounds(bottomRow - 1, currCol - 1)
                && this._grid[bottomRow - 1][currCol - 1][1] !== this._tileCtrl.getWaterBaseValue()
                && isInBounds(topRow + 1, currCol - 1)
                && this._grid[topRow + 1][currCol - 1][1] !== this._tileCtrl.getWaterBaseValue()) {
                leftCol = currCol - 1;
                currCol = leftCol;
            }
            const cols = [leftCol, leftCol + 1, leftCol + 2];
            for (let row = bottomRow; row <= topRow; row++) {
                if (row !== bottomRow && row !== topRow) { // Everything in the middle
                    this._grid[row][cols[0]][2] = (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(20)) : (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(21)) : (this._tileCtrl.getBridgeTileValue(19));
                    this._grid[row][cols[1]][2] = (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(17)) : (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(18)) : (this._tileCtrl.getBridgeTileValue(16));
                    this._grid[row][cols[2]][2] = (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(14)) : (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(15)) : (this._tileCtrl.getBridgeTileValue(13));
                    // If all 3 are destroyed in a line, pick one by modding current row and decide whether to make it merely damaged, or whole.
                    if (this._grid[row][cols[0]][2] === (this._tileCtrl.getBridgeTileValue(15)) && this._grid[row][cols[1]][2] === (this._tileCtrl.getBridgeTileValue(18)) && this._grid[row][cols[1]][2] === (this._tileCtrl.getBridgeTileValue(21))) {
                        this._grid[row][cols[row % 3]][2] = (Math.random() < 0.25) ? ((this._tileCtrl.getBridgeTileValue(14)) + (row % 3) * 3) : ((this._tileCtrl.getBridgeTileValue(13)) + (row % 3) * 3);
                    }
                } else if (row !== bottomRow) { // Start
                    this._grid[row][cols[0]][2] = this._tileCtrl.getBridgeTileValue(11);
                    this._grid[row][cols[1]][2] = this._tileCtrl.getBridgeTileValue(11);
                    this._grid[row][cols[2]][2] = this._tileCtrl.getBridgeTileValue(11);
                } else { // End
                    this._grid[row][cols[0]][2] = this._tileCtrl.getBridgeTileValue(12);
                    this._grid[row][cols[1]][2] = this._tileCtrl.getBridgeTileValue(12);
                    this._grid[row][cols[2]][2] = this._tileCtrl.getBridgeTileValue(12);
                }
            }
        // Horizontal Bridge
        } else {
            let randomRow;
            let colLeft;
            let colRight;
            while(true) {
                randomRow = Math.floor(Math.random() * ((MAX_ROWS - 2) - (MIN_ROWS + 2) + 1)) + (MIN_ROWS + 2);
                for (let i = 0; i < MAX_COLS + 1; i++) {
                    if (isInBounds(randomRow, i) && this._grid[randomRow][i][1] === this._tileCtrl.getWaterBaseValue()) {
                        colLeft = i;
                        break;
                    }
                }
                for (let j = colLeft; j < MAX_COLS + 1; j++) {
                    if (isInBounds(randomRow, j) && this._grid[randomRow][j][1] === this._tileCtrl.getWaterBaseValue()) {
                        colRight = j;
                    } else {
                        break;
                    }
                }
                // Ensures the randomly selected point along the river has land on both sides.
                if (colLeft !== 0 && colRight !== MAX_COLS) {
                    break;
                }
            }
            let rowBottom = randomRow;
            let currRow = randomRow;
            while (isInBounds(currRow - 1, colLeft)
                && this._grid[currRow - 1][colLeft][1] === this._tileCtrl.getWaterBaseValue()
                && isInBounds(currRow - 1, colLeft - 1)
                && this._grid[currRow - 1][colLeft - 1][1] !== this._tileCtrl.getWaterBaseValue()
                && isInBounds(currRow - 1, colRight + 1)
                && this._grid[currRow - 1][colRight + 1][1] !== this._tileCtrl.getWaterBaseValue()) {
                rowBottom = currRow - 1;
                currRow = rowBottom;
            }
            const rows = [rowBottom, rowBottom + 1, rowBottom + 2];
            for (let col = colLeft; col <= colRight; col++) {
                if (col !== colLeft && col !== colRight) { // Everything in the middle
                    this._grid[rows[0]][col][2] = (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(3)) : (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(4)) : (this._tileCtrl.getBridgeTileValue(2));
                    this._grid[rows[1]][col][2] = (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(6)) : (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(7)) : (this._tileCtrl.getBridgeTileValue(5));
                    this._grid[rows[2]][col][2] = (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(9)) : (Math.random() < 0.25) ? (this._tileCtrl.getBridgeTileValue(10)) : (this._tileCtrl.getBridgeTileValue(8));
                    // If all 3 are destroyed in a line, pick one by modding current col and decide whether to make it merely damaged, or whole.
                    if (this._grid[rows[0]][col][2] === (this._tileCtrl.getBridgeTileValue(4)) && this._grid[rows[1]][col][2] === (this._tileCtrl.getBridgeTileValue(7)) && this._grid[rows[2]][col][2] === (this._tileCtrl.getBridgeTileValue(10))) {
                        this._grid[rows[col % 3]][col][2] = (Math.random() < 0.25) ? ((this._tileCtrl.getBridgeTileValue(3)) + (col % 3) * 3) : ((this._tileCtrl.getBridgeTileValue(2)) + (col % 3) * 3);
                    }
                } else if (col === colLeft) { // Start
                    this._grid[rows[0]][col][2] = this._tileCtrl.getBridgeTileValue(0);
                    this._grid[rows[1]][col][2] = this._tileCtrl.getBridgeTileValue(0);
                    this._grid[rows[2]][col][2] = this._tileCtrl.getBridgeTileValue(0);
                } else { // End
                    this._grid[rows[0]][col][2] = this._tileCtrl.getBridgeTileValue(1);
                    this._grid[rows[1]][col][2] = this._tileCtrl.getBridgeTileValue(1);
                    this._grid[rows[2]][col][2] = this._tileCtrl.getBridgeTileValue(1);
                }
            }

            const rightPierRow = Math.floor(Math.random() * (MAX_ROWS - randomRow + 3)) + randomRow + 2;
            const leftPierRow = Math.floor(Math.random() * (randomRow - 2));

            // Build pier to the right of bridge
            if (Math.random() < 0.6 && rightPierRow < MAX_ROWS + 1 && rightPierRow > randomRow + 3) {
                let firstWaterCol;
                // Pier starts left and goes right
                if (fiftyFifty()) {
                    for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                        if (isInBounds(rightPierRow, col) && this._grid[rightPierRow][col][1] === this._tileCtrl.getWaterBaseValue()) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    isInBounds(rightPierRow, firstWaterCol) && (this._grid[rightPierRow][firstWaterCol][2] = this._tileCtrl.getBridgeTileValue(23));
                    if (fiftyFifty()) {
                        isInBounds(rightPierRow, firstWaterCol + 1) && (this._grid[rightPierRow][firstWaterCol + 1][2] = this._tileCtrl.getBridgeTileValue(23));
                        isInBounds(rightPierRow, firstWaterCol + 2) && (this._grid[rightPierRow][firstWaterCol + 2][2] = this._tileCtrl.getBridgeTileValue(22));
                    } else {
                        isInBounds(rightPierRow, firstWaterCol + 1) && (this._grid[rightPierRow][firstWaterCol + 1][2] = this._tileCtrl.getBridgeTileValue(22));
                    }
                // Pier starts right and goes left
                } else {
                    for (let col = MAX_COLS; col >= MIN_COLS; col--) {
                        if (isInBounds(rightPierRow, col) && this._grid[rightPierRow][col][1] === this._tileCtrl.getWaterBaseValue()) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    isInBounds(rightPierRow, firstWaterCol) && (this._grid[rightPierRow][firstWaterCol][2] = this._tileCtrl.getBridgeTileValue(23));
                    if (fiftyFifty()) {
                        isInBounds(rightPierRow, firstWaterCol - 1) && (this._grid[rightPierRow][firstWaterCol - 1][2] = this._tileCtrl.getBridgeTileValue(23));
                        isInBounds(rightPierRow, firstWaterCol - 2) && (this._grid[rightPierRow][firstWaterCol - 2][2] = this._tileCtrl.getBridgeTileValue(24));
                    } else {
                        isInBounds(rightPierRow, firstWaterCol - 1) && (this._grid[rightPierRow][firstWaterCol - 1][2] = this._tileCtrl.getBridgeTileValue(24));
                    }
                }
            }
            // Build pier to the left of bridge
            if (Math.random() < 0.6 && leftPierRow > MIN_ROWS && leftPierRow < randomRow - 3) {
                let firstWaterCol;
                // Pier starts left and goes right
                if (fiftyFifty()) {
                    for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                        if (isInBounds(leftPierRow, col) && this._grid[leftPierRow][col][1] === this._tileCtrl.getWaterBaseValue()) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    isInBounds(leftPierRow, firstWaterCol) && (this._grid[leftPierRow][firstWaterCol][2] = this._tileCtrl.getBridgeTileValue(23));
                    if (fiftyFifty()) {
                        isInBounds(leftPierRow, firstWaterCol + 1) && (this._grid[leftPierRow][firstWaterCol + 1][2] = this._tileCtrl.getBridgeTileValue(23));
                        isInBounds(leftPierRow, firstWaterCol + 2) && (this._grid[leftPierRow][firstWaterCol + 2][2] = this._tileCtrl.getBridgeTileValue(22));
                    } else {
                        isInBounds(leftPierRow, firstWaterCol + 1) && (this._grid[leftPierRow][firstWaterCol + 1][2] = this._tileCtrl.getBridgeTileValue(22));
                    }
                // Pier starts right and goes left
                } else {
                    for (let col = MAX_COLS; col >= MIN_COLS; col--) {
                        if (isInBounds(leftPierRow, col) && this._grid[leftPierRow][col][1] === this._tileCtrl.getWaterBaseValue()) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    isInBounds(leftPierRow, firstWaterCol) && (this._grid[leftPierRow][firstWaterCol][2] = this._tileCtrl.getBridgeTileValue(23));
                    if (fiftyFifty()) {
                        isInBounds(leftPierRow, firstWaterCol - 1) && (this._grid[leftPierRow][firstWaterCol - 1][2] = this._tileCtrl.getBridgeTileValue(23));
                        isInBounds(leftPierRow, firstWaterCol - 2) && (this._grid[leftPierRow][firstWaterCol - 2][2] = this._tileCtrl.getBridgeTileValue(24));
                    } else {
                        isInBounds(leftPierRow, firstWaterCol - 1) && (this._grid[leftPierRow][firstWaterCol - 1][2] = this._tileCtrl.getBridgeTileValue(24));
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
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (isInBounds(row, col) && Math.random() < this._ancientRuinsSpec.waterPercentage) {
                    this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                }
            }
        }

        // Organically let the water spread
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (isInBounds(row, col) && this._grid[row][col][1] !== this._tileCtrl.getWaterBaseValue()) {
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
                        this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                    }
                }
            }
        }

        // Check minimum water reqs.
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) {
                    const above = (isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col);
                    const below = (isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col);
                    const left = (isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col - 1);
                    const right = (isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col + 1);

                    const upperLeftCorner = (isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col - 1)
                    const upperRightCorner = (isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col + 1);
                    const lowerLeftCorner = (isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col - 1)
                    const lowerRightCorner = (isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col + 1);

                    if ([above, below, left, right].every(x => !x)) {
                        continue;
                    }
                    if (!above && !below) {
                        if (lowerLeftCorner || lowerRightCorner) { // If an adjacent lower tile, fill in bottom
                            this._grid[row - 1][col][1] = this._tileCtrl.getWaterBaseValue();
                            isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                            isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                        } else { // If an adjacent upper tile, fill in top
                            this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue();
                            isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                            isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                        }
                    }
                    if (!left && !right) { // If an adjacent left tile, fill in left
                        if (lowerLeftCorner || upperLeftCorner) {
                            this._grid[row][col - 1][1] = this._tileCtrl.getWaterBaseValue();
                            isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                            isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                        } else { // If an adjacent right tile, fill in right
                            this._grid[row][col + 1][1] = this._tileCtrl.getWaterBaseValue();
                            isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                            isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                        }
                    }
                }
            }
        }

        // Remove waters with only 1 tile thickness
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) {
                    let above = (isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col);
                    let below = (isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col);
                    let left = (isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col - 1);
                    let right = (isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col + 1);

                    if ([above, below, left, right].every(x => !x)) {
                        continue;
                    }
                    if (!above && !below) {
                        this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
                        continue;
                    } else if (!left && !right) {
                        this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
                        continue;
                    }

                    const upperLeftCorner = (isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col - 1)
                    const upperRightCorner = (isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col + 1);
                    const lowerLeftCorner = (isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col - 1)
                    const lowerRightCorner = (isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col + 1);

                    // If the lower-left corner is missing with only one tile thickness to its right or above.
                    if (below && left && (!right || !above)) {
                        isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                    }

                    above = (isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col);
                    below = (isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col);
                    left = (isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col - 1);
                    right = (isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col + 1);

                    // If the lower-right corner is missing with only one tile thickness to its left or above.
                    if (below && right && (!left || !above)) {
                        isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    }

                    above = (isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col);
                    below = (isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col);
                    left = (isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col - 1);
                    right = (isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col + 1);

                    // If the upper-left corner is missing with only one tile thickness to its right or below.
                    if (above && left && (!right || !below)) {
                        isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                    }

                    above = (isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col);
                    below = (isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col);
                    left = (isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col - 1);
                    right = (isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col + 1);

                    // If the upper-right corner is missing with only one tile thickness to its left or below.
                    if (above && right && (!left || !below)) {
                        isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    }
                }
            }
        }

        // Eliminate rare occasions where fill-in blocks connect to a former stand alone pond into a 1 thickness stream.
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) {
                    let above = (isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col);
                    let below = (isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col);
                    let left = (isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col - 1);
                    let right = (isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col + 1);

                    // If single tile stream going from left to right, fill in with dirt.
                    if (!above && !below && ((left && !right) || (!left && right) || (left && right))) {
                        this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
                    }

                    above = (isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col);
                    below = (isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col);
                    left = (isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col - 1);
                    right = (isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col + 1);

                     // If single tile stream going from top to bottom, fill in with dirt.
                    if (!left && !right && ((above && !below) || (!above && below) || (above && below))) {
                        this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
                    }

                    above = (isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row + 1, col);
                    below = (isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row - 1, col);
                    left = (isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col - 1);
                    right = (isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !isInBounds(row, col + 1);

                    // If a solo 1-tile puddle, 50% to fill in with dirt.
                    if ([above, below, left, right].every(x => !x) && fiftyFifty()) {
                        this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
                    }
                }
            }
        }
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
            case RuinsBiome.Military_Base: {
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
        console.log('_makeTown', 'called');
    }

    /**
     * Makes tree trunks.
     */
    private _makeTreeTrunks(): void {
        // No tree trunk, no tree leaves
        if (this._ancientRuinsSpec.treeTrunkColor === TreeTrunkColor.None) {
            return;
        }

        // Chooses between small or large tree trunks and covers the square over and around tree trunks with leaf canopy.
        for (let row = MIN_ROWS; row < MAX_ROWS; row++) {
            for (let col = MIN_COLS; col < MAX_COLS; col++) {
                if (!isInBounds(row, col)) continue;

                if (Math.random() < this._ancientRuinsSpec.treePercentage
                    && this._grid[row][col][1] < this._tileCtrl.getWaterBaseValue()
                    && (this._grid[row][col][2] < this._tileCtrl.getTreeTrunkBaseValue() || this._grid[row][col][2] > this._tileCtrl.getTreeTrunkEndValue())) {
                    const rolledDemDice = Math.floor(Math.random() * 100);
                    let version;
                    if (rolledDemDice < 25) {
                        version = 0;
                    } else if (rolledDemDice < 50) {
                        version = 1;
                    } else if (rolledDemDice < 75) {
                        version = 2;
                    } else {
                        version = 3;
                    }
                    this._grid[row][col][2] = this._tileCtrl.getTreeTrunkBaseValue() + version;
                    this._grid[row][col][3] = this._tileCtrl.getTreeLeafBaseValue();

                    const above = isInBounds(row + 1, col);
                    const aboveRight = isInBounds(row + 1, col + 1);
                    const right = isInBounds(row, col + 1);

                    if (fiftyFifty()
                        && !((above && this._grid[row + 1][col][1] > this._tileCtrl.getGroundEndValue())
                        || (aboveRight && this._grid[row + 1][col + 1][1] > this._tileCtrl.getGroundEndValue())
                        || (right && this._grid[row][col + 1][1] > this._tileCtrl.getGroundEndValue()))) {

                        const versionBase = this._tileCtrl.getTreeTrunkBaseValue() + 4 + (version * 4);
                        this._grid[row][col][2] = versionBase + 2;
                        if (above) {
                            this._grid[row + 1][col][2] = versionBase + 3;
                            this._grid[row + 1][col][3] = this._tileCtrl.getTreeLeafBaseValue();
                        }
                        if (aboveRight) {
                            this._grid[row + 1][col + 1][2] = versionBase;
                            this._grid[row + 1][col + 1][3] = this._tileCtrl.getTreeLeafBaseValue();
                        }
                        if (right) {
                            this._grid[row][col + 1][2] = versionBase + 1;
                            this._grid[row][col + 1][3] = this._tileCtrl.getTreeLeafBaseValue();
                        }

                        this._ancientRuinsSpec.treeLeafColor !== TreeLeafColor.None && [
                            [row + 2, col],
                            [row + 2, col + 1],
                            [row + 2, col + 2],
                            [row + 1, col + 2],
                            [row, col + 2],
                            [row - 1, col + 2],
                            [row - 1, col + 1],
                            [row - 1, col],
                            [row - 1, col - 1],
                            [row, col - 1],
                            [row + 1, col - 1],
                            [row + 2, col - 1],
                        ]
                            .filter(tile => isInBounds(tile[0], tile[1]))
                            .filter(tile => this._grid[tile[0]][tile[1]][3] !== this._tileCtrl.getTreeLeafBaseValue())
                            .forEach(tile => {
                                this._grid[tile[0]][tile[1]][3] = -100;
                            });
                    } else {
                        this._ancientRuinsSpec.treeLeafColor !== TreeLeafColor.None && [
                            [row + 1, col],
                            [row + 1, col + 1],
                            [row, col + 1],
                            [row - 1, col + 1],
                            [row - 1, col],
                            [row - 1, col - 1],
                            [row, col - 1],
                            [row + 1, col - 1]
                        ]
                            .filter(tile => isInBounds(tile[0], tile[1]))
                            .filter(tile => this._grid[tile[0]][tile[1]][3] !== this._tileCtrl.getTreeLeafBaseValue())
                            .forEach(tile => {
                                this._grid[tile[0]][tile[1]][3] = -100;
                            });
                    }
                }
            }
        }

        if (this._ancientRuinsSpec.treeLeafColor === TreeLeafColor.None) {
            return;
        }

        // Spreads canopy out in a variable shape.
        for (let row = MIN_ROWS; row < MAX_ROWS; row++) {
            for (let col = MIN_COLS; col < MAX_COLS; col++) {
                if (isInBounds(row, col) && this._grid[row][col][3] === -100) {
                    this._grid[row][col][3] = this._tileCtrl.getTreeLeafBaseValue();
                    const potentialLeaves = [
                        [[row - 1, col], [row, col - 1], [row - 1, col - 1]],
                        [[row + 1, col], [row, col - 1], [row + 1, col - 1]],
                        [[row, col - 1], [row + 1, col - 1], [row + 1, col]],
                        [[row, col + 1], [row + 1, col + 1], [row + 1, col]],
                        [[row - 1, col], [row, col + 1], [row - 1, col + 1]],
                        [[row + 1, col], [row, col + 1], [row + 1, col + 1]],
                        [[row, col - 1], [row - 1, col - 1], [row - 1, col]],
                        [[row, col + 1], [row - 1, col + 1], [row - 1, col]]
                    ];
                    potentialLeaves
                        .filter(option => isInBounds(option[0][0], option[0][1]))
                        .filter(option => isInBounds(option[1][0], option[1][1]))
                        .filter(option => isInBounds(option[2][0], option[2][1]))
                        .filter(option => this._grid[option[0][0]][option[0][1]][3] === this._tileCtrl.getTreeLeafBaseValue() || this._grid[option[0][0]][option[0][1]][3] === -100)
                        .filter(() => Math.random() < 0.25)
                        .forEach(option => {
                            this._grid[option[0][0]][option[0][1]][3] = this._tileCtrl.getTreeLeafBaseValue();
                            this._grid[option[1][0]][option[1][1]][3] = this._tileCtrl.getTreeLeafBaseValue();
                            this._grid[option[2][0]][option[2][1]][3] = this._tileCtrl.getTreeLeafBaseValue();
                        });
                }
            }
        }

        this._modifyLeavesForEdges();
    }

    /**
     * Makes an ancient village on the map.
     */
    private _makeVillage(): void {
        // TODO: Randomly choose between top-left, top-right, and center to place 3-4 small structure
        // Add a well-like structure, and some fencing for animals.
        console.log('_makeVillage', 'called');
    }

    /**
     * Sets up the grid with water values.
     */
    private _makeWater(): void {
        // If no water on planet, don't spawn water.
        if (this._ancientRuinsSpec.waterColor === WaterColor.None) {
            return;
        }

        switch(this._ancientRuinsSpec.biomeWater) {
            case WaterBiome.Small_Lakes: {
                this._makeSmallLakes();
                break;
            }
            case WaterBiome.Large_Lake: {
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
        const top = isInBounds(row + 1, col) && this._grid[row + 1][col][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const topRight = isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const right = isInBounds(row, col + 1) && this._grid[row][col + 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const bottomRight = isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const bottom = isInBounds(row - 1, col) && this._grid[row - 1][col][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const bottomLeft = isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const left = isInBounds(row, col - 1) && this._grid[row][col - 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const topLeft = isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;

        // 1 === non-grass tile found
        // 0 === grass tile found

        let key = `${top}${right}${bottom}${left}`;
        if (key === '1111' && [topRight, bottomRight, bottomLeft, topLeft].some(x => !x)) {
            key = 'sparse';
        } else if (key === '0000' && [topRight, bottomRight, bottomLeft, topLeft].some(x => !!x) && Math.random() < 0.3) {
            key = 'mixed';
        }
        this._grid[row][col][1] = this._tileCtrl.getGroundTileValue(key);
    }

    /**
     * Cycles through the grass tiles and triggers call to have specific edge graphic chosen to have smooth edges.
     */
    private _modifyGrassesForEdges(): void {
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (isInBounds(row, col) && this._grid[row][col][1] === 1) {
                    this._modifyGrassForEdges(row, col);
                }
            }
        }
    }

    /**
     * Cycles through the water tiles and triggers call to have specific edge graphic chosen to have smooth edges.
     */
    private _modifyLeavesForEdges(): void {
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (!isInBounds(row, col)) continue;

                if (this._grid[row][col][3] === -100 || this._grid[row][col][3] === this._tileCtrl.getTreeLeafBaseValue()) {
                    this._modifyLeavesForEdge(row, col);
                }
            }
        }
    }

    /**
     * Checks a given tile's surrounds for leaves and updates value to match neighboring empty tiles.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     */
    private _modifyLeavesForEdge(row: number, col: number): void {
        const top = isInBounds(row + 1, col) && this._grid[row + 1][col][3] !== -100 && (this._grid[row + 1][col][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row + 1][col][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const topRight = isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][3] !== -100 && (this._grid[row + 1][col + 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row + 1][col + 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const right = isInBounds(row, col + 1) && this._grid[row][col + 1][3] !== -100 && (this._grid[row][col + 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row][col + 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const bottomRight = isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][3] !== -100 && (this._grid[row - 1][col + 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row - 1][col + 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const bottom = isInBounds(row - 1, col) && this._grid[row - 1][col][3] !== -100 && (this._grid[row - 1][col][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row - 1][col][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const bottomLeft = isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][3] !== -100 && (this._grid[row - 1][col - 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row - 1][col - 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const left = isInBounds(row, col - 1) && this._grid[row][col - 1][3] !== -100 && (this._grid[row][col - 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row][col - 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const topLeft = isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][3] !== -100 && (this._grid[row + 1][col - 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row + 1][col - 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;

        // 1 === non-leaf tile found
        // 0 === leaf tile found

        const key = `${top}${right}${bottom}${left}-${topRight}${bottomRight}${bottomLeft}${topLeft}`;
        // TODO: remove when confident leaf canopy is done properly.
        if (this._tileCtrl.getTreeLeafTileValue(key) === this._tileCtrl.getTreeLeafBaseValue() && key !== '0000-0000') {
            console.log('key', key, this._tileCtrl.getTreeLeafTileValue(key), row, col);
        }
        this._grid[row][col][3] = this._tileCtrl.getTreeLeafTileValue(key);
    }

    /**
     * Cycles through the water tiles and triggers call to have specific edge graphic chosen to have smooth edges.
     */
    private _modifyWatersForEdges(): void {
        for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
            for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                if (isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) {
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
        const top = isInBounds(row + 1, col) && (this._grid[row + 1][col][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row + 1][col][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const topRight = isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row + 1][col + 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const right = isInBounds(row, col + 1) && (this._grid[row][col + 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row][col + 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const bottomRight = isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row - 1][col + 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const bottom = isInBounds(row - 1, col) && (this._grid[row - 1][col][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row - 1][col][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const bottomLeft = isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row - 1][col - 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const left = isInBounds(row, col - 1) && (this._grid[row][col - 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row][col - 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const topLeft = isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row + 1][col - 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;

        // 1 === non-water tile found
        // 0 === water tile found

        const key = `${top}${right}${bottom}${left}-${topRight}${bottomRight}${bottomLeft}${topLeft}`;
        this._grid[row][col][1] = this._tileCtrl.getWaterTileValue(key);
    }

    /**
     * Resets all the randomized cloud conditions: size, position, opacity, etc..
     * @param cloud the cloud to be reset
     */
    private _resetCloud(cloud: Mesh): void {
        const randomSize = 1 + (Math.random() * 4);
        const randomX = RandomWithBounds(-19, -12);
        const randomZ = RandomWithBounds(-6, 6);
        const randomOpacity = RandomWithBounds(2, 5) / 10;

        cloud.position.set(randomX, LayerYPos.LAYER_SKY, randomZ);
        cloud.scale.set(randomSize, randomSize, randomSize);
        (cloud.material as MeshBasicMaterial).opacity = randomOpacity;
        cloud.name = `${(RandomWithBounds(2, 10) / 1000)}`;
    }

    /**
     * Sets the grid values.
     * @returns an empty promise to make function async
     */
    private async _setGridValues(): Promise<void> {
        return new Promise((resolve) => {
            this._makeGrass();

            this._makeWater();

            this._modifyWatersForEdges();

            this._modifyGrassesForEdges();

            this._makeStructures();

            this._dropBouldersInWater();

            this._makeTreeTrunks();

            resolve();
        }).then(() => {});
    }

    /**
     * Handles all cleanup responsibility for controller before it's destroyed.
     */
    public dispose(): void {

    }

    /**
     * At the end of each loop iteration, check for grid-specific animations.
     */
    public endCycle(state?: AncientRuinsState): boolean {
        if (state === AncientRuinsState.landing_start || state === AncientRuinsState.leaving_start) {
            // TODO: Add animated scene that first grows ship, deposits crew, then shrinks ship again.
            landingFrameCounter++;
            const landingShadowScale = this._landingShadow.scale;
            if (!landingFrameCounter) {
                this._landingShadow.scale.set(0.1, 0.1, 0.1);
                this._landingShadow.visible = true;
                this._landingShadow.updateMatrix();
            } else if (landingFrameCounter < 240) {
                this._landingShadow.scale.set(landingShadowScale.x + 0.00375, landingShadowScale.y + 0.00375, landingShadowScale.z + 0.00375);
            } else if (landingFrameCounter === 240) {
                return true;
            } else if (landingFrameCounter < 480) {
                // Do nothing. Deposit crew.
            } else if (landingFrameCounter < 720) {
                this._landingShadow.scale.set(landingShadowScale.x - 0.00375, landingShadowScale.y - 0.00375, landingShadowScale.z - 0.00375);
            } else if (landingFrameCounter === 720) {
                this._landingShadow.visible = false;
                landingFrameCounter = -1;
                return true;
            }
        } else {
            this._cycleClouds();
            overheadMeshOpacityFrameCounter++;
            if (overheadMeshOpacityFrameCounter >= overheadMeshOpacityFrameCounterReset) {
                overheadMeshOpacityFrameCounter = 0;

                for (let row = MIN_ROWS; row < MAX_ROWS + 1; row++) {
                    for (let col = MIN_COLS; col < MAX_COLS + 1; col++) {
                        if (!isInBounds(row, col) || !this._grid[row][col][3]) continue;

                        (this._level3OverheadMeshMap[row][col].material as MeshBasicMaterial).opacity = 1;
                    }
                }

                this._ancientRuinsSpec.crew.map(c => c.position).forEach(cPos => {
                    overheadRowColModVals.forEach(overPos => {
                        const posX = cPos[0] + overPos[0];
                        const posY = cPos[1] + overPos[1];

                        if (isInBounds(posX, posY) && this._grid[posX][posY][3]) {
                            (this._level3OverheadMeshMap[posX][posY].material as MeshBasicMaterial).opacity = 0.6;
                        }
                    });
                });
            }
        }
        return false;
    }

    /**
     * Returns the maximum number of columns used in grid.
     * @returns maximum number of columns in grid.
     */
    public getMaxCols(): number {
        return MAX_COLS;
    }

    /**
     * Returns the maximum number of columns used in grid.
     * @returns maximum number of columns in grid.
     */
    public getMaxRows(): number {
        return MAX_ROWS;
    }

    /**
     * Fetches the description of the tile belonging to the given coords.
     * @param row coordinate of the tile
     * @param col coordinate of the tile
     * @param elev coordinate of the tile
     * @returns description of the tile
     */
    public getTileDescription(row: number, col: number, elev: number): string {
        return this._tileCtrl.getGridDicDescription(this._grid[row][col][elev])
    }

    /**
     * Fetches the tile value of the tile belonging to the given coords.
     * @param row coordinate of the tile
     * @param col coordinate of the tile
     * @param elev coordinate of the tile
     * @returns numerical tile value
     */
    public getTileValue(row: number, col: number, elev: number): number {
        return isInBounds(row, col) ? this._grid[row][col][elev] : -1;
    }

    /**
     * Constructor level initializer for clouds and landing zone, made public to allow game controller to control timing of loading graphic.
     * @returns an empty promise to make function async
     */
    public async initiateCloudsAndLandingMeshes(): Promise<void> {
        this._createClouds();

        const landingMiddleTile = this._createLandingZone();

        this._createLandingZoneShadow(landingMiddleTile);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 0);
        }).then(() => {});
    }    

    /**
     * Constructor level initializer for fog of war level meshes, made public to allow game controller to control timing of loading graphic.
     * @returns an empty promise to make function async
     */
    public async initiateFogOfWarLevelMeshes(): Promise<void> {
        return this._createFogOfWarLevelMeshes();
    }

    /**
     * Constructor level initializer for ground level meshes, made public to allow game controller to control timing of loading graphic.
     * @returns an empty promise to make function async
     */
    public async initiateGroundLevelMeshes(): Promise<void> {
        return this._createGroundLevelMeshes();
    }

    /**
     * Constructor level initializer for overhead level meshes, made public to allow game controller to control timing of loading graphic.
     * @returns an empty promise to make function async
     */
    public async initiateOverheadLevelMeshes(): Promise<void> {
        return this._createOverheadLevelMeshes();
    }

    /**
     * Constructor level initializer for setting grid grid values, made public to allow game controller to control timing of loading graphic.
     * @returns an empty promise to make function async
     */
    public async initiateGridValues(): Promise<void> {
        return this._setGridValues();
    }

    /**
     * Constructor level initializer for traverse level meshes, made public to allow game controller to control timing of loading graphic.
     * @returns an empty promise to make function async
     */
    public async initiateTraverseLevelMeshes(): Promise<void> {
        return this._createTraverseLevelMeshes();
    }

    /**
     * Updates a grid tile with crew value.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @param crewMember crew member index with which to update the grid tile value.
     * @returns the value of the tile after changed with crew member.
     */
    public updateCrewInGrid(row: number, col: number, crewMember: number): number {
        // If -1 then the crewMember has left the tile, and it needs to be reset.
        if (crewMember === -1 && isInBounds(row, col)) {
            this._grid[row][col][2] = 0;
            return 0;
        }

        const tileVal: number = this._tileCtrl.getCrewValue(crewMember);
        if (isInBounds(row, col) && (!isBlocking(this._grid[row][col][2]) || this._grid[row][col][2] < this._tileCtrl.getLandingZoneValue())) {
            this._grid[row][col][2] = tileVal;

            this._adjustFogOfWar();

            return tileVal;
        }

        // Row/Col not in range or blocked.
        return 0;
    }
}
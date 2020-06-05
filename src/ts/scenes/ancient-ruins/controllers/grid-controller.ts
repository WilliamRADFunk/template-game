import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PlaneGeometry,
    Scene,
    Texture,
    Vector2,
    NearestFilter,
    RepeatWrapping} from "three";
import { AncientRuinsSpecifications, WaterBiome, RuinsBiome, PlantColor, WaterColor, GroundMaterial, TreeTrunkColor, TreeLeafColor } from "../../../models/ancient-ruins-specifications";
import { TileCtrl } from "./tile-controller";

const fiftyFifty = () => Math.random() < 0.5;
const rad90DegLeft = -1.5708;

const maxCols = 29;
const maxRows = 29;
const minCols = 0;
const minRows = 0;
const middleCol = Math.ceil((maxCols - minCols) / 2);
const middleRow = Math.ceil((maxRows - minRows) / 2);
const layer1YPos = 15;
const layer2YPos = 13;
const layer3YPos = 11;

const getXPos = function(col: number): number {
    return -5.8 + (col/2.5);
};
const getZPos = function(row: number): number {
    return 5.8 - (row/2.5);
};

const spriteMapCols = 32;
const spriteMapRows = 32;

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

    /**
     * All of the textures contained in this scene.
     */
    private _tileCtrl: TileCtrl;

    constructor(scene: Scene, textures: { [key: string]: Texture }, ancientRuinsSpec: AncientRuinsSpecifications) {
        this._scene = scene;
        this._textures = textures;
        this._ancientRuinsSpec = ancientRuinsSpec;

        this._tileCtrl = new TileCtrl(ancientRuinsSpec);

        // All meshes added here first to be added as single mesh to the scene.
        const megaMesh = new Object3D();

        this._makeMaterials();

        this._makeGrass();

        this._makeWater();

        this._modifyWatersForEdges();

        this._modifyGrassesForEdges();

        this._makeStructures();

        this._dropBouldersInWater();

        this._makeTreeTrunks();

        this._createGroundLevelMeshes(megaMesh);

        this._createTraverseLevelMeshes(megaMesh);

        this._createOverheadLevelMeshes(megaMesh);

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
        return (this._isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) ? this._ancientRuinsSpec.waterSpreadability : 0;
    }

    /**
     * Uses the tile grid to make meshes that match tile values.
     * @param megaMesh all meshes added here first to be added as single mesh to the scene
     */
    private _createGroundLevelMeshes(megaMesh: Object3D): void {
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][1]) {
                    let material: MeshBasicMaterial = this._materialsMap[this._grid[row][col][1]];

                    // If material type has a second variation, randomize between the two.
                    if (this._tileCtrl.getGridDicVariation(this._grid[row][col][1]) && fiftyFifty()) {
                        material = this._materialsMap[this._grid[row][col][1] + 1];
                    }

                    const tile = new Mesh( this._geometry, material );
                    tile.position.set(getXPos(col), layer1YPos, getZPos(row))
                    tile.rotation.set(rad90DegLeft, 0, 0);
                    tile.name = `tile-${row}-${col}`;
                    this._scene.add(tile);
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
                if (this._isInBounds(row, col) && this._grid[row][col][2] && this._materialsMap[this._grid[row][col][2]]) {
                    const posX = getXPos(col) + this._tileCtrl.getGridDicPosMod(this._grid[row][col][2]);
                    const posZ = getZPos(row) + this._tileCtrl.getGridDicPosMod(this._grid[row][col][2], true);
                    const scaleX = 1 + this._tileCtrl.getGridDicScaleMod(this._grid[row][col][2]);
                    const scaleZ = 1 + this._tileCtrl.getGridDicScaleMod(this._grid[row][col][2], true);

                    let material: MeshBasicMaterial = this._materialsMap[this._grid[row][col][2]];

                    // If material type has a second variation, randomize between the two.
                    if (this._tileCtrl.getGridDicVariation(this._grid[row][col][2]) && fiftyFifty()) {
                        material = this._materialsMap[this._grid[row][col][2] + 1];
                    }

                    const tile = new Mesh( this._geometry, material );
                    tile.scale.set(scaleX, scaleZ, scaleZ);
                    tile.position.set(posX, layer2YPos, posZ)
                    tile.rotation.set(rad90DegLeft, 0, 0);
                    tile.updateMatrix();
                    megaMesh.add(tile);
                }
            }
        }
    }

    /**
     * Uses the tile grid to make meshes that match tile values.
     * @param megaMesh all meshes added here first to be added as single mesh to the scene
     */
    private _createOverheadLevelMeshes(megaMesh: Object3D): void {
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][3] && this._materialsMap[this._grid[row][col][3]]) {
                    const posX = getXPos(col) + this._tileCtrl.getGridDicPosMod(this._grid[row][col][3]);
                    const posZ = getZPos(row) + this._tileCtrl.getGridDicPosMod(this._grid[row][col][3], true);
                    const scaleX = 1 + this._tileCtrl.getGridDicScaleMod(this._grid[row][col][3]);
                    const scaleZ = 1 + this._tileCtrl.getGridDicScaleMod(this._grid[row][col][3], true);

                    let material: MeshBasicMaterial = this._materialsMap[this._grid[row][col][3]];

                    // If material type has a second variation, randomize between the two.
                    if (this._tileCtrl.getGridDicVariation(this._grid[row][col][3]) && fiftyFifty()) {
                        material = this._materialsMap[this._grid[row][col][3]];
                    }

                    const tile = new Mesh( this._geometry, material );
                    tile.scale.set(scaleX, scaleZ, scaleZ);
                    tile.position.set(posX, layer3YPos, posZ)
                    tile.rotation.set(rad90DegLeft, 0, 0);
                    (tile.material as MeshBasicMaterial).opacity = 1;
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
                if (!this._isInBounds(row, col)) continue;

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
        } else if (row === minRows && col > maxCols - 4) {
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
                        this._isInBounds(row, col) && (this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue());
                        this._isInBounds(row, col + 1) && (this._grid[row][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                        this._isInBounds(row, col + 2) && (this._grid[row][col + 2][1] = this._tileCtrl.getWaterBaseValue());
                    }
                }
                break;
            }
            case 1: { // left
                for (let row = minRows; row < maxRows + 1; row += 3) {
                    const fillAmount = Math.floor(Math.random() * (max - min + 1)) + min;
                    for (let col = minCols; col < fillAmount; col++) {
                        this._isInBounds(row, col) && (this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue());
                        this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue());
                        this._isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = this._tileCtrl.getWaterBaseValue());
                    }
                }
                break;
            }
            case 2: { // right
                for (let row = minRows; row < maxRows + 1; row += 3) {
                    const fillAmount = Math.floor(Math.random() * (max - min + 1)) + min;
                    for (let col = maxCols; col > maxCols - fillAmount; col--) {
                        this._isInBounds(row, col) && (this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue());
                        this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue());
                        this._isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = this._tileCtrl.getWaterBaseValue());
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
                    this._grid[lastRow][col][1] = this._tileCtrl.getWaterBaseValue();
                    this._grid[lastRow + 1][col][1] = this._tileCtrl.getWaterBaseValue();
                    this._isInBounds(lastRow, col + 1) && (this._grid[lastRow][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(lastRow + 1, col + 1) && (this._grid[lastRow + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
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
                    this._grid[lastRow][col][1] = this._tileCtrl.getWaterBaseValue();
                    this._grid[lastRow + 1][col][1] = this._tileCtrl.getWaterBaseValue();
                    this._isInBounds(lastRow, col + 1) && (this._grid[lastRow][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(lastRow + 1, col + 1) && (this._grid[lastRow + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
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
                    this._grid[row][lastCol][1] = this._tileCtrl.getWaterBaseValue();
                    this._grid[row][lastCol + 1][1] = this._tileCtrl.getWaterBaseValue();
                    this._isInBounds(row + 1, lastCol) && (this._grid[row + 1][lastCol][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(row + 1, lastCol + 1) && (this._grid[row + 1][lastCol + 1][1] = this._tileCtrl.getWaterBaseValue());
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
                    this._grid[row][lastCol][1] = this._tileCtrl.getWaterBaseValue();
                    this._grid[row][lastCol + 1][1] = this._tileCtrl.getWaterBaseValue();
                    this._isInBounds(row + 1, lastCol) && (this._grid[row + 1][lastCol][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(row + 1, lastCol + 1) && (this._grid[row + 1][lastCol + 1][1] = this._tileCtrl.getWaterBaseValue());
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
            for (let row = minRows; row < maxRows + 1; row++) {
                this._grid[row] = [];
                for (let col = minCols; col < maxCols + 1; col++) {
                    if (!this._isInBounds(row, col)) continue;

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
        for (let row = minRows; row < maxRows + 1; row++) {
            this._grid[row] = [];
            for (let col = minCols; col < maxCols + 1; col++) {
                if (!this._isInBounds(row, col)) continue;

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
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][1] !== 1) {
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
        const centerRow = Math.floor(Math.random() * 3) + middleRow;
        const centerCol = Math.floor(Math.random() * 3) + middleCol;

        for (let row = centerRow; row < maxRows - 3; row += 3) {
            const leftRadius = Math.floor(Math.random() * (max - min + 1)) + min;
            const rightRadius = Math.floor(Math.random() * (max - min + 1)) + min;
            for (let col = centerCol; col > centerCol - leftRadius; col--) {
                this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue());
                this._isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = this._tileCtrl.getWaterBaseValue());
            }
            for (let col = centerCol; col < centerCol + rightRadius; col++) {
                this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue());
                this._isInBounds(row + 2, col) && (this._grid[row + 2][col][1] = this._tileCtrl.getWaterBaseValue());
            }
        }
        for (let row = centerRow; row > minRows + 4; row -= 3) {
            const leftRadius = Math.floor(Math.random() * (max - min + 1)) + min;
            const rightRadius = Math.floor(Math.random() * (max - min + 1)) + min;
            for (let col = centerCol; col > centerCol - leftRadius; col--) {
                this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                this._isInBounds(row - 1, col) && (this._grid[row - 1][col][1] = this._tileCtrl.getWaterBaseValue());
                this._isInBounds(row - 2, col) && (this._grid[row - 2][col][1] = this._tileCtrl.getWaterBaseValue());
            }
            for (let col = centerCol; col < centerCol + rightRadius; col++) {
                this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                this._isInBounds(row - 1, col) && (this._grid[row - 1][col][1] = this._tileCtrl.getWaterBaseValue());
                this._isInBounds(row - 2, col) && (this._grid[row - 2][col][1] = this._tileCtrl.getWaterBaseValue());
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
        this._tileCtrl.getGridDicKeys().forEach(key => {
            const offCoords = this._tileCtrl.getGridDicSpritePos(key);

            if (offCoords[0] >= 0 && offCoords[1] >= 0) {
                const material: MeshBasicMaterial = new MeshBasicMaterial({
                    color: 0xFFFFFF,
                    map: this._textures.spriteMapAncientRuins.clone(),
                    side: DoubleSide,
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

                this._materialsMap[key] = material;
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
                    this._isInBounds(prevRow + t, col) && (this._grid[prevRow + t][col][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(prevRow + t, col + 1) && (this._grid[prevRow + t][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(prevRow + t, col + 2) && (this._grid[prevRow + t][col + 2][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(prevRow - t, col) && (this._grid[prevRow - t][col][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(prevRow - t, col + 1) && (this._grid[prevRow - t][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(prevRow - t, col + 2) && (this._grid[prevRow - t][col + 2][1] = this._tileCtrl.getWaterBaseValue());
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
                    this._isInBounds(row, prevCol + t) && (this._grid[row][prevCol + t][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(row + 1, prevCol + t) && (this._grid[row + 1][prevCol + t][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(row + 2, prevCol + t) && (this._grid[row + 2][prevCol + t][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(row, prevCol - t) && (this._grid[row][prevCol - t][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(row + 1, prevCol - t) && (this._grid[row + 1][prevCol - t][1] = this._tileCtrl.getWaterBaseValue());
                    this._isInBounds(row + 2, prevCol - t) && (this._grid[row + 2][prevCol - t][1] = this._tileCtrl.getWaterBaseValue());
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
                    if (this._isInBounds(i, randomCol) && this._grid[i][randomCol][1] === this._tileCtrl.getWaterBaseValue()) {
                        bottomRow = i;
                        break;
                    }
                }
                for (let j = bottomRow; j < maxRows + 1; j++) {
                    if (this._isInBounds(j, randomCol) && this._grid[j][randomCol][1] === this._tileCtrl.getWaterBaseValue()) {
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
                && this._grid[bottomRow][currCol - 1][1] === this._tileCtrl.getWaterBaseValue()
                && this._isInBounds(bottomRow - 1, currCol - 1)
                && this._grid[bottomRow - 1][currCol - 1][1] !== this._tileCtrl.getWaterBaseValue()
                && this._isInBounds(topRow + 1, currCol - 1)
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
                randomRow = Math.floor(Math.random() * ((maxRows - 2) - (minRows + 2) + 1)) + (minRows + 2);
                for (let i = 0; i < maxCols + 1; i++) {
                    if (this._isInBounds(randomRow, i) && this._grid[randomRow][i][1] === this._tileCtrl.getWaterBaseValue()) {
                        colLeft = i;
                        break;
                    }
                }
                for (let j = colLeft; j < maxCols + 1; j++) {
                    if (this._isInBounds(randomRow, j) && this._grid[randomRow][j][1] === this._tileCtrl.getWaterBaseValue()) {
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
                && this._grid[currRow - 1][colLeft][1] === this._tileCtrl.getWaterBaseValue()
                && this._isInBounds(currRow - 1, colLeft - 1)
                && this._grid[currRow - 1][colLeft - 1][1] !== this._tileCtrl.getWaterBaseValue()
                && this._isInBounds(currRow - 1, colRight + 1)
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

            const rightPierRow = Math.floor(Math.random() * (maxRows - randomRow + 3)) + randomRow + 2;
            const leftPierRow = Math.floor(Math.random() * (randomRow - 2));

            // Build pier to the right of bridge
            if (Math.random() < 0.6 && rightPierRow < maxRows + 1 && rightPierRow > randomRow + 3) {
                let firstWaterCol;
                // Pier starts left and goes right
                if (fiftyFifty()) {
                    for (let col = minCols; col < maxCols + 1; col++) {
                        if (this._isInBounds(rightPierRow, col) && this._grid[rightPierRow][col][1] === this._tileCtrl.getWaterBaseValue()) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    this._isInBounds(rightPierRow, firstWaterCol) && (this._grid[rightPierRow][firstWaterCol][2] = this._tileCtrl.getBridgeTileValue(23));
                    if (fiftyFifty()) {
                        this._isInBounds(rightPierRow, firstWaterCol + 1) && (this._grid[rightPierRow][firstWaterCol + 1][2] = this._tileCtrl.getBridgeTileValue(23));
                        this._isInBounds(rightPierRow, firstWaterCol + 2) && (this._grid[rightPierRow][firstWaterCol + 2][2] = this._tileCtrl.getBridgeTileValue(22));
                    } else {
                        this._isInBounds(rightPierRow, firstWaterCol + 1) && (this._grid[rightPierRow][firstWaterCol + 1][2] = this._tileCtrl.getBridgeTileValue(22));
                    }
                // Pier starts right and goes left
                } else {
                    for (let col = maxCols; col >= minCols; col--) {
                        if (this._isInBounds(rightPierRow, col) && this._grid[rightPierRow][col][1] === this._tileCtrl.getWaterBaseValue()) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    this._isInBounds(rightPierRow, firstWaterCol) && (this._grid[rightPierRow][firstWaterCol][2] = this._tileCtrl.getBridgeTileValue(23));
                    if (fiftyFifty()) {
                        this._isInBounds(rightPierRow, firstWaterCol - 1) && (this._grid[rightPierRow][firstWaterCol - 1][2] = this._tileCtrl.getBridgeTileValue(23));
                        this._isInBounds(rightPierRow, firstWaterCol - 2) && (this._grid[rightPierRow][firstWaterCol - 2][2] = this._tileCtrl.getBridgeTileValue(24));
                    } else {
                        this._isInBounds(rightPierRow, firstWaterCol - 1) && (this._grid[rightPierRow][firstWaterCol - 1][2] = this._tileCtrl.getBridgeTileValue(24));
                    }
                }
            }
            // Build pier to the left of bridge
            if (Math.random() < 0.6 && leftPierRow > minRows && leftPierRow < randomRow - 3) {
                let firstWaterCol;
                // Pier starts left and goes right
                if (fiftyFifty()) {
                    for (let col = minCols; col < maxCols + 1; col++) {
                        if (this._isInBounds(leftPierRow, col) && this._grid[leftPierRow][col][1] === this._tileCtrl.getWaterBaseValue()) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    this._isInBounds(leftPierRow, firstWaterCol) && (this._grid[leftPierRow][firstWaterCol][2] = this._tileCtrl.getBridgeTileValue(23));
                    if (fiftyFifty()) {
                        this._isInBounds(leftPierRow, firstWaterCol + 1) && (this._grid[leftPierRow][firstWaterCol + 1][2] = this._tileCtrl.getBridgeTileValue(23));
                        this._isInBounds(leftPierRow, firstWaterCol + 2) && (this._grid[leftPierRow][firstWaterCol + 2][2] = this._tileCtrl.getBridgeTileValue(22));
                    } else {
                        this._isInBounds(leftPierRow, firstWaterCol + 1) && (this._grid[leftPierRow][firstWaterCol + 1][2] = this._tileCtrl.getBridgeTileValue(22));
                    }
                // Pier starts right and goes left
                } else {
                    for (let col = maxCols; col >= minCols; col--) {
                        if (this._isInBounds(leftPierRow, col) && this._grid[leftPierRow][col][1] === this._tileCtrl.getWaterBaseValue()) {
                            firstWaterCol = col;
                            break;
                        }
                    }
                    // Two or three tiles long?
                    this._isInBounds(leftPierRow, firstWaterCol) && (this._grid[leftPierRow][firstWaterCol][2] = this._tileCtrl.getBridgeTileValue(23));
                    if (fiftyFifty()) {
                        this._isInBounds(leftPierRow, firstWaterCol - 1) && (this._grid[leftPierRow][firstWaterCol - 1][2] = this._tileCtrl.getBridgeTileValue(23));
                        this._isInBounds(leftPierRow, firstWaterCol - 2) && (this._grid[leftPierRow][firstWaterCol - 2][2] = this._tileCtrl.getBridgeTileValue(24));
                    } else {
                        this._isInBounds(leftPierRow, firstWaterCol - 1) && (this._grid[leftPierRow][firstWaterCol - 1][2] = this._tileCtrl.getBridgeTileValue(24));
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
                if (this._isInBounds(row, col) && Math.random() < this._ancientRuinsSpec.waterPercentage) {
                    this._grid[row][col][1] = this._tileCtrl.getWaterBaseValue();
                }
            }
        }

        // Organically let the water spread
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][1] !== this._tileCtrl.getWaterBaseValue()) {
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
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) {
                    const above = (this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row + 1, col);
                    const below = (this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row - 1, col);
                    const left = (this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row, col - 1);
                    const right = (this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row, col + 1);

                    const upperLeftCorner = (this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row + 1, col - 1)
                    const upperRightCorner = (this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row + 1, col + 1);
                    const lowerLeftCorner = (this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row - 1, col - 1)
                    const lowerRightCorner = (this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row - 1, col + 1);

                    if ([above, below, left, right].every(x => !x)) {
                        continue;
                    }
                    if (!above && !below) {
                        if (lowerLeftCorner || lowerRightCorner) {
                            this._grid[row - 1][col][1] = this._tileCtrl.getWaterBaseValue();
                            this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                            this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                        } else {
                            this._grid[row + 1][col][1] = this._tileCtrl.getWaterBaseValue();
                            this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                            this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                        }
                    }
                    if (!left && !right) {
                        if (lowerLeftCorner || upperLeftCorner) {
                            this._grid[row][col - 1][1] = this._tileCtrl.getWaterBaseValue();
                            this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                            this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                        } else {
                            this._grid[row][col + 1][1] = this._tileCtrl.getWaterBaseValue();
                            this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                            this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                        }
                    }
                }
            }
        }

        // Remove waters with only 1 tile thickness
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) {
                    const above = (this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row + 1, col);
                    const below = (this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row - 1, col);
                    const left = (this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row, col - 1);
                    const right = (this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row, col + 1);

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

                    const upperLeftCorner = (this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row + 1, col - 1)
                    const upperRightCorner = (this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row + 1, col + 1);
                    const lowerLeftCorner = (this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row - 1, col - 1)
                    const lowerRightCorner = (this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row - 1, col + 1);

                    if (above && right && !upperRightCorner) {
                        this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    }
                    if (below && right && !lowerRightCorner) {
                        this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = this._tileCtrl.getWaterBaseValue());
                    }
                    if (below && left && !lowerLeftCorner) {
                        this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                    }
                    if (above && left && !upperLeftCorner) {
                        this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = this._tileCtrl.getWaterBaseValue());
                    }
                }
            }
        }

        // Eliminate rare occasions where fill in block connect a former stand alone pond into a 1 thickness stream.
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) {
                    const above = (this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row + 1, col);
                    const below = (this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row - 1, col);
                    const left = (this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row, col - 1);
                    const right = (this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] === this._tileCtrl.getWaterBaseValue()) || !this._isInBounds(row, col + 1);

                    if (!above && !below && ((left && !right) || (!left && right))) {
                        this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
                    }
                    if (!left && !right && ((above && !below) || (!above && below))) {
                        this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
                    }
                    if ([above, below, left, right].every(x => !x) && fiftyFifty()) {
                        this._grid[row][col][1] = this._tileCtrl.getGroundBaseValue() + 21;
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
        for (let row = minRows; row < maxRows; row++) {
            for (let col = minCols; col < maxCols; col++) {
                if (!this._isInBounds(row, col)) continue;

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

                    const above = this._isInBounds(row + 1, col);
                    const aboveRight = this._isInBounds(row + 1, col);
                    const right = this._isInBounds(row + 1, col + 1);

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
                            .filter(tile => this._isInBounds(tile[0], tile[1]))
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
                            .filter(tile => this._isInBounds(tile[0], tile[1]))
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
        for (let row = minRows; row < maxRows; row++) {
            for (let col = minCols; col < maxCols; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][3] === -100) {
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
                        .filter(option => this._isInBounds(option[0][0], option[0][1]))
                        .filter(option => this._isInBounds(option[1][0], option[1][1]))
                        .filter(option => this._isInBounds(option[2][0], option[2][1]))
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
        const top = this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const topRight = this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const right = this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const bottomRight = this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const bottom = this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const bottomLeft = this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const left = this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;
        const topLeft = this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] > this._tileCtrl.getGroundEndValue() ? 1 : 0;

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
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][1] === 1) {
                    this._modifyGrassForEdges(row, col);
                }
            }
        }
    }

    /**
     * Cycles through the water tiles and triggers call to have specific edge graphic chosen to have smooth edges.
     */
    private _modifyLeavesForEdges(): void {
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (!this._isInBounds(row, col)) continue;

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
        const top = this._isInBounds(row + 1, col) && this._grid[row + 1][col][3] !== -100 && (this._grid[row + 1][col][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row + 1][col][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const topRight = this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][3] !== -100 && (this._grid[row + 1][col + 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row + 1][col + 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const right = this._isInBounds(row, col + 1) && this._grid[row][col + 1][3] !== -100 && (this._grid[row][col + 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row][col + 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const bottomRight = this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][3] !== -100 && (this._grid[row - 1][col + 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row - 1][col + 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const bottom = this._isInBounds(row - 1, col) && this._grid[row - 1][col][3] !== -100 && (this._grid[row - 1][col][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row - 1][col][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const bottomLeft = this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][3] !== -100 && (this._grid[row - 1][col - 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row - 1][col - 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const left = this._isInBounds(row, col - 1) && this._grid[row][col - 1][3] !== -100 && (this._grid[row][col - 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row][col - 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;
        const topLeft = this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][3] !== -100 && (this._grid[row + 1][col - 1][3] < this._tileCtrl.getTreeLeafBaseValue() || this._grid[row + 1][col - 1][3] > this._tileCtrl.getTreeLeafEndValue()) ? 1 : 0;

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
        for (let row = minRows; row < maxRows + 1; row++) {
            for (let col = minCols; col < maxCols + 1; col++) {
                if (this._isInBounds(row, col) && this._grid[row][col][1] === this._tileCtrl.getWaterBaseValue()) {
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
        const top = this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row + 1][col][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const topRight = this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row + 1][col + 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const right = this._isInBounds(row, col + 1) && (this._grid[row][col + 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row][col + 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const bottomRight = this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row - 1][col + 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const bottom = this._isInBounds(row - 1, col) && (this._grid[row - 1][col][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row - 1][col][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const bottomLeft = this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row - 1][col - 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const left = this._isInBounds(row, col - 1) && (this._grid[row][col - 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row][col - 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;
        const topLeft = this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] < this._tileCtrl.getWaterBaseValue() || this._grid[row + 1][col - 1][1] > this._tileCtrl.getWaterEndValue()) ? 1 : 0;

        // 1 === non-water tile found
        // 0 === water tile found

        const key = `${top}${right}${bottom}${left}-${topRight}${bottomRight}${bottomLeft}${topLeft}`;
        this._grid[row][col][1] = this._tileCtrl.getWaterTileValue(key);
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

    /**
     * Fetches the description of the tile belonging to the given coords.
     * @param row coordinate of the tile
     * @param col coordinate of the tile
     * @param elev coordinate of the tile
     * @returns description of the tile
     */
    public getTileValue(row: number, col: number, elev: number): string {
        return this._tileCtrl.getGridDicDescription(this._grid[row][col][elev])
    }
}
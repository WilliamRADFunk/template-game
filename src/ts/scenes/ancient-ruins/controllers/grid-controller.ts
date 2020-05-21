import {
    DoubleSide,
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    Object3D,
    PlaneGeometry,
    Scene,
    Texture } from "three";
import { AncientRuinsSpecifications, WaterBiome, RuinsBiome } from "../../../models/ancient-ruins-specifications";

// Lookup table for bridge tiles when assigning edge graphics.
const bridgeLookupTable: { [key: string]: number } = {
    '0000': 2,
    '1000': 3,
    '1100': 4,
    '0100': 5,
    '0110': 6,
    '0010': 7,
    '0011': 8,
    '0001': 9,
    '1001': 10,
    '1101': 11,
    '1110': 12,
    '0111': 13,
    '1011': 14,
    '1010': 15,
    '0101': 16,
    'sparse': 17,
    'mixed': 18,
    '1111': 19
};

// Lookup table for grass tiles when assigning edge graphics.
const grassLookupTable: { [key: string]: number } = {
    '0000': 2,
    '1000': 3,
    '1100': 4,
    '0100': 5,
    '0110': 6,
    '0010': 7,
    '0011': 8,
    '0001': 9,
    '1001': 10,
    '1101': 11,
    '1110': 12,
    '0111': 13,
    '1011': 14,
    '1010': 15,
    '0101': 16,
    'sparse': 17,
    'mixed': 18,
    '1111': 19
};

// Lookup table for water tiles when assigning edge graphics.
const waterLookupTable: { [key: string]: number } = {
    '0000-0000': 20,
    '1000-0000': 21,
    '1000-1000': 21,
    '1000-0001': 21,
    '1000-1001': 21,
    '1100-0000': 22,
    '1100-1000': 22,
    '1100-0100': 22,
    '1100-0001': 22,
    '1100-1001': 22,
    '1100-0101': 22,
    '1100-1101': 22,
    '1100-1100': 22,
    '1000-0101': 22,
    '0100-0000': 23,
    '0100-1000': 23,
    '0100-0100': 23,
    '0100-1100': 23,
    '0110-0000': 24,
    '0110-0100': 24,
    '0110-1000': 24,
    '0110-0010': 24,
    '0110-1100': 24,
    '0110-0110': 24,
    '0110-1010': 24,
    '0110-1110': 24,
    '0010-0000': 25,
    '0010-0100': 25,
    '0010-0010': 25,
    '0010-0110': 25,
    '0011-0000': 26,
    '0011-0010': 26,
    '0011-0100': 26,
    '0011-0001': 26,
    '0011-0110': 26,
    '0011-0011': 26,
    '0011-0101': 26,
    '0011-0111': 26,
    '0010-0001': 26,
    '0001-0000': 27,
    '0001-0010': 27,
    '0001-0001': 27,
    '0001-0011': 27,
    '1001-0000': 28,
    '1001-0001': 28,
    '1001-1000': 28,
    '1001-0010': 28,
    '1001-1010': 28,
    '1001-0011': 28,
    '1001-1001': 28,
    '1001-1011': 28,
    '0000-0001': 29,
    '1000-1010': 29,
    '0000-1000': 30,
    '0000-0100': 31,
    '0000-0010': 32,
    '0010-1010': 32,
    '0000-0101': 33,
    '0000-1010': 34,
    '1111-1111': 35,
    '1111-0111': 35,
    '1111-1011': 35,
    '1111-1101': 35,
    '1111-1110': 35,
    '1111-1100': 35,
    '1111-0110': 35,
    '1111-0011': 35,
    '1111-1001': 35,
    '1111-1000': 35,
    '1111-0100': 35,
    '1111-0010': 35,
    '1111-0001': 35,
    '1111-0000': 35,
    '1111-1010': 35,
    '1111-0101': 35
};

interface MaterialMap {
    [key: string]: {
        [key: string]: {
            [key: string]: {
                [key: string]: MeshPhongMaterial;
            }
        }
    }
}

export class GridCtrl {
    /**
     * Specification of what the planet and ruins below should look like.
     */
    private _ancientRuinsSpec: AncientRuinsSpecifications;

    /**
     * Tile geometry that makes up the ground tiles.
     */
    private _geometry: PlaneGeometry = new PlaneGeometry( 0.4, 0.4, 10, 10 );

    /**
     * The grid array with values of all tiles on game map.
     * [row][col][elevation]
     * [elevation] 0    Special designation tiles. Treasure, Traps, Etc.
     * [elevation] 1    Ground tile on which a player might stand and interact. Also triggers events.
     * [elevation] 2    Obstruction tile. Might be a person, boulder, wall, or tree trunk. Can interact with mouse clicks, but can't move into space.
     * [elevation] 3    Overhead tile such as low ceiling of building. Can move "under" and must turn semi-transparent.
     * [elevation] 4    High overhead tile like tree canopy or high ceiling. Can move "under" and must turn semi-trnsparent.
     * Light:           Negative values mirror the positive values as the same content, but dark. Astroteam can counter when in range.
     * Type:            [row][col][elevation] % 100 gives "type" of tile
     * Directionality:  Math.floor([row][col][elevation] / 100) gives directionality of tile (ie. 0 centered, 1 top-facing, 2 right-facing, etc.) allows for higher numbers and greater flexibility.
     *
     * 2: Green Grass (whole tile)
     * 3: Green Grass (Dirt/Gravel/Sand at top)
     * 4: Green Grass (Dirt/Gravel/Sand at top & right)
     * 5: Green Grass (Dirt/Gravel/Sand at right)
     * 6: Green Grass (Dirt/Gravel/Sand at right & bottom)
     * 7: Green Grass (Dirt/Gravel/Sand at bottom)
     * 8: Green Grass (Dirt/Gravel/Sand at bottom & left)
     * 9: Green Grass (Dirt/Gravel/Sand at left)
     * 10: Green Grass (Dirt/Gravel/Sand at left & top)
     * 11: Green Grass (Dirt/Gravel/Sand at left & top & right)
     * 12: Green Grass (Dirt/Gravel/Sand at top & right & bottom)
     * 13: Green Grass (Dirt/Gravel/Sand at right & bottom & left)
     * 14: Green Grass (Dirt/Gravel/Sand at bottom & left & top)
     * 15: Green Grass (Dirt/Gravel/Sand at top & bottom)
     * 16: Green Grass (Dirt/Gravel/Sand at left & right)
     * 17: Green Grass (Dirt/Gravel/Sand at sides only)
     * 18: Green Grass (Dirt/Gravel/Sand at corners only)
     * 19: Green Grass (Dirt/Gravel/Sand all around)
     * 20: Blue Water (whole tile)
     * 21: Blue Water (Dirt/Gravel/Sand at top)
     * 22: Blue Water (Dirt/Gravel/Sand at top & right)
     * 23: Blue Water (Dirt/Gravel/Sand at right)
     * 24: Blue Water (Dirt/Gravel/Sand at right & bottom)
     * 25: Blue Water (Dirt/Gravel/Sand at bottom)
     * 26: Blue Water (Dirt/Gravel/Sand at bottom & left)
     * 27: Blue Water (Dirt/Gravel/Sand at left)
     * 28: Blue Water (Dirt/Gravel/Sand at left & top)
     * 29: Blue Water (Dirt/Gravel/Sand at upper-left)
     * 30: Blue Water (Dirt/Gravel/Sand at upper-right)
     * 31: Blue Water (Dirt/Gravel/Sand at lower-left)
     * 32: Blue Water (Dirt/Gravel/Sand at lower-right)
     * 33: Blue Water (Dirt/Gravel/Sand at upper-left lower-right)
     * 34: Blue Water (Dirt/Gravel/Sand at upper-right lower-left)
     * 35: Blue Water (Dirt/Gravel/Sand at top & bottom, left & right)
     * 36: Bridge Start Horizontal (Wood/Concrete/Steel)
     * 37: Bridge End Horizontal (Wood/Concrete/Steel)
     * 38: Bridge Bottom Intact Horizontal (Wood/Concrete/Steel)
     * 39: Bridge Bottom Damaged Horizontal (Wood/Concrete/Steel)
     * 40: Bridge Bottom Destroyed Horizontal (Wood/Concrete/Steel)
     * 41: Bridge Middle Intact Horizontal (Wood/Concrete/Steel)
     * 42: Bridge Middle Damaged Horizontal (Wood/Concrete/Steel)
     * 43: Bridge Middle Destroyed Horizontal (Wood/Concrete/Steel)
     * 44: Bridge Top Intact Horizontal (Wood/Concrete/Steel)
     * 45: Bridge Top Damaged Horizontal (Wood/Concrete/Steel)
     * 46: Bridge Top Destroyed Horizontal (Wood/Concrete/Steel)
     * 47: Bridge Start Vertical (Wood/Concrete/Steel)
     * 48: Bridge End Vertical (Wood/Concrete/Steel)
     * 49: Bridge Right Intact Vertical (Wood/Concrete/Steel)
     * 50: Bridge Right Damaged Vertical (Wood/Concrete/Steel)
     * 51: Bridge Right Destroyed Vertical (Wood/Concrete/Steel)
     * 52: Bridge Middle Intact Vertical (Wood/Concrete/Steel)
     * 53: Bridge Middle Damaged Vertical (Wood/Concrete/Steel)
     * 54: Bridge Middle Destroyed Vertical (Wood/Concrete/Steel)
     * 55: Bridge Left Intact Vertical (Wood/Concrete/Steel)
     * 56: Bridge Left Damaged Vertical (Wood/Concrete/Steel)
     * 57: Bridge Left Destroyed Vertical (Wood/Concrete/Steel)
     * 100: Brown Dirt (whole tile) version 1
     * 101: Brown Dirt (whole tile) version 2
     * 102: Grey Gravel (whole tile) version 1
     * 103: Grey Gravel (whole tile) version 2
     * 104: Beige Sand (whole tile) version 1
     * 105: Beige Sand (whole tile) version 2
     */
    private _grid: number[][][] = [];

    /**
     * All of the materials contained in this scene.
     */
    private _materials: MaterialMap = {
        dirt: {
            brown: {
                complete: {}
            }
        },
        gravel: {
            grey: {
                complete: {}
            }
        },
        grass: {
            green: {
                complete: {},
                dirt: {},
                gravel: {},
                water: {}
            }
        },
        rock: {
            brown: {
                dirt: {},
                gravel: {},
                water: {}
            },
            grey: {
                dirt: {},
                gravel: {},
                water: {}
            }
        },
        sand: {
            beige: {
                complete: {}
            }
        },
        water: {
            blue: {
                complete: {},
                dirt: {}
            }
        }
    };

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

        // Sets obstruction over deep water.
        this._dropBouldersInWater(megaMesh);

        this._makeStructures();

        this._createGroundMeshes(megaMesh);

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
        return (this._isInBounds(row, col) && this._grid[row][col][1] === 1) ? this._ancientRuinsSpec.grassSpreadability : 0;
    }

    /**
     * Checks a given tile for water, and adds 10% chance to spread.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @returns additional spread percentage for water
     */
    private _checkWaterSpread(row: number, col: number): number {
        // If non-zero, then it's a water tile, thus increasing water spread another 10%
        return (this._isInBounds(row, col) && this._grid[row][col][1] === 20) ? this._ancientRuinsSpec.waterSpreadability : 0;
    }

    /**
     * Uses the tile grid to make meshes that match tile values.
     * @param megaMesh all meshes added here first to be added as single mesh to the scene
     */
    private _createGroundMeshes(megaMesh: Object3D): void {
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                let block;
                switch(this._grid[row][col][1]) {
                    case 2: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete2 );
                        break;
                    }
                    case 3: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomCenter );
                        break;
                    }
                    case 4: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeft );
                        break;
                    }
                    case 5: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerLeft );
                        break;
                    }
                    case 6: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeft );
                        break;
                    }
                    case 7: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topCenter );
                        break;
                    }
                    case 8: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topRight );
                        break;
                    }
                    case 9: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerRight );
                        break;
                    }
                    case 10: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomRight );
                        break;
                    }
                    case 11: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeftRight );
                        break;
                    }
                    case 12: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topBottomRight );
                        break;
                    }
                    case 13: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeftRight );
                        break;
                    }
                    case 14: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topBottomLeft );
                        break;
                    }
                    case 15: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topBottom );
                        break;
                    }
                    case 16: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].leftRight );
                        break;
                    }
                    case 17: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].sparse );
                        break;
                    }
                    case 18: {
                        if (Math.random() < 0.25) {
                            block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].mixed );
                        } else {
                            block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete2 );
                        }
                        break;
                    }
                    case 19: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerCenter );
                        break;
                    }
                    case 20: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor].complete.complete1 );
                        break;
                    }
                    case 21: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomCenter );
                        break;
                    }
                    case 22: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeft );
                        break;
                    }
                    case 23: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerLeft );
                        break;
                    }
                    case 24: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeft );
                        break;
                    }
                    case 25: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topCenter );
                        break;
                    }
                    case 26: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topRight );
                        break;
                    }
                    case 27: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerRight );
                        break;
                    }
                    case 28: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomRight );
                        break;
                    }
                    case 29: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomRightTip );
                        break;
                    }
                    case 30: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeftTip );
                        break;
                    }
                    case 31: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeftTip );
                        break;
                    }
                    case 32: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topRightTip );
                        break;
                    }
                    case 33: {
                        console.log('33');
                        break;
                    }
                    case 34: {
                        console.log('34');
                        break;
                    }
                    case 35: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerCenter );
                        break;
                    }
                    case 100: {
                        block = new Mesh( this._geometry, this._materials.dirt.brown.complete.centerCenter1 );
                        break;
                    }
                    case 101: {
                        block = new Mesh( this._geometry, this._materials.dirt.brown.complete.centerCenter2 );
                        break;
                    }
                    case 102: {
                        block = new Mesh( this._geometry, this._materials.gravel.grey.complete.centerCenter1 );
                        break;
                    }
                    case 103: {
                        block = new Mesh( this._geometry, this._materials.gravel.grey.complete.centerCenter2 );
                        break;
                    }
                    case 104: {
                        block = new Mesh( this._geometry, this._materials.sand.beige.complete.centerCenter1 );
                        break;
                    }
                    case 105: {
                        block = new Mesh( this._geometry, this._materials.sand.beige.complete.centerCenter2 );
                        break;
                    }
                    default: {
                        console.log(this._grid[row][col][1]);
                    }
                }
                if (block) {
                    block.position.set(-5.8 + (col/2.5), 17, 5.8 - row/2.5)
                    block.rotation.set(-1.5708, 0, 0);
                    megaMesh.add(block);
                }
            }
        }
    }

    /**
     * Randomly drops boulders in the deep waters, and sets them to obstructed.
     * @param megaMesh all meshes added here first to be added as single mesh to the scene
     */
    private _dropBouldersInWater(megaMesh: Object3D): void {
        const waterBoulderMats: MeshPhongMaterial[] = [
            this._materials.rock.brown.water.variation1,
            this._materials.rock.brown.water.variation2,
            this._materials.rock.brown.water.variation3,
            this._materials.rock.grey.water.variation1,
            this._materials.rock.grey.water.variation2,
            this._materials.rock.grey.water.variation3
        ];

        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (this._grid[row][col][1] === 20) {
                    this._grid[row][col][2] = 1; // Water is too deep to cross.
                    let block;
                    if (Math.random() < 0.06) {
                        block = new Mesh( this._geometry, waterBoulderMats[Math.floor(Math.random() * 5)]);
                    }
                    if (block) {
                        block.position.set(-5.8 + (col/2.5), 15, 5.8 - row/2.5)
                        block.rotation.set(-1.5708, 0, 0);
                        megaMesh.add(block);
                    }
                } else {
                    this._grid[row][col][2] = 0; // Traversable tile.
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
        if (row < 0 || row > 29) {
            return false;
        } else if (col < 0 || col > 29) {
            return false;
        }
        return true;
    }

    /**
     * Makes water tiles specific to an oceanside look and feel
     */
    private _makeBeaches(): void {
        // TODO: Pick left, top, or right randomly to place the ocean.
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
        // TODO: Pick a row and col at one end of map randomly, and another row and col at opposite end.
        // Must be at least 10 tile apart depending on direction.
        // Rivers must be 2 tiles thick at all points along its length.
    }

    /**
     * Sets up the grid with grass values.
     */
    private _makeGrass(): void {
        // If no plants on planet, don't spawn grass.
        if (!this._ancientRuinsSpec.hasPlants) {
            for (let row = 0; row < 30; row++) {
                this._grid[row] = [];
                for (let col = 0; col < 30; col++) {
                    this._grid[row][col] = [];
                    if (Math.floor(Math.random() * 10) % 2 === 0) {
                        this._grid[row][col][1] = 100;
                    } else {
                        this._grid[row][col][1] = 101;
                    }
                }
            }
            return;
        }

        // Seed the grass
        for (let row = 0; row < 30; row++) {
            this._grid[row] = [];
            for (let col = 0; col < 30; col++) {
                this._grid[row][col] = [];
                if (Math.random() < this._ancientRuinsSpec.grassPercentage) {
                    this._grid[row][col][1] = 1;
                } else {
                    this._grid[row][col][1] = 100;
                }
            }
        }

        // Organically let the grass spread
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
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
                    this._grid[row][col][1] = (Math.random() < hasGrassPercentage) ? 1 : 100;
                }
            }
        }
    }

    /**
     * Makes water tiles specific to large, centrally-located lake.
     */
    private _makeLargeLake(): void {
        // TODO: Pick rough center location, draw rough radius of 8-10 tiles, and randomize the edge.
        // Once done, fill in interior spaces with full water.
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
        // Rock Materials
        this._materials.rock.brown.water.variation1 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.rockWaterBrown1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.rock.brown.water.variation1.map.minFilter = LinearFilter;

        this._materials.rock.brown.water.variation2 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.rockWaterBrown2,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.rock.brown.water.variation2.map.minFilter = LinearFilter;

        this._materials.rock.brown.water.variation3 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.rockWaterBrown3,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.rock.brown.water.variation3.map.minFilter = LinearFilter;

        this._materials.rock.grey.water.variation1 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.rockWaterGrey1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.rock.grey.water.variation1.map.minFilter = LinearFilter;

        this._materials.rock.grey.water.variation2 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.rockWaterGrey2,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.rock.grey.water.variation2.map.minFilter = LinearFilter;

        this._materials.rock.grey.water.variation3 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.rockWaterGrey3,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.rock.grey.water.variation3.map.minFilter = LinearFilter;

        // Dirt Materials
        this._materials.dirt.brown.complete.centerCenter1 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.dirtCenterCenter01,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.dirt.brown.complete.centerCenter1.map.minFilter = LinearFilter;

        this._materials.dirt.brown.complete.centerCenter2 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.dirtCenterCenter02,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.dirt.brown.complete.centerCenter2.map.minFilter = LinearFilter;

        // Water Materials
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterCenterCenterDirt1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerCenter.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor].complete.complete1 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterComplete01`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor].complete.complete1.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomCenter${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomCenter.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomLeft${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeft.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeftTip = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomLeftTip${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeftTip.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomRight.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomRightTip = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomRightTip${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomRightTip.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterCenterLeft${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerLeft.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterCenterRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerRight.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopCenter${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topCenter.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopLeft${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeft.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeftTip = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopLeftTip${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeftTip.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topRight.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topRightTip = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopRightTip${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topRightTip.map.minFilter = LinearFilter;

        // Grass materials
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassCenterCenter01`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerCenter.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete1 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassComplete01`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete1.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete2 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassComplete02`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete2.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassBottomCenter${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomCenter.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassBottomLeft${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassBottomLeftRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomLeftRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassBottomRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].bottomRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassCenterLeft${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassCenterRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].centerRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].leftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassLeftRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].leftRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].mixed = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassMixed${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].mixed.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].sparse = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassSparse${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].sparse.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topBottom = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopBottom${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topBottom.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topBottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopBottomLeft${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topBottomLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topBottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopBottomRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topBottomRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopCenter${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topCenter.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopLeft${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopLeftRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topLeftRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopRight${this._ancientRuinsSpec.groundMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.groundMaterial.toLowerCase()].topRight.map.minFilter = LinearFilter;
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
        const flowsHorizontally = Math.random() < 0.5;
        const startRow = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
        const startCol = startRow;

        if (flowsHorizontally) {
            let prevRow = startRow;
            for (let col = 0; col < 30; col += 3) {
                const upOrDown = startRow < 15;
                const amount = Math.floor(Math.random() * (2 - 0 + 1));
                prevRow = upOrDown ? prevRow + amount : prevRow - amount;

                const thickness = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
                for (let t = 0; t <= thickness; t++) {
                    this._isInBounds(prevRow + t, col) && (this._grid[prevRow + t][col][1] = 20);
                    this._isInBounds(prevRow + t, col + 1) && (this._grid[prevRow + t][col + 1][1] = 20);
                    this._isInBounds(prevRow + t, col + 2) && (this._grid[prevRow + t][col + 2][1] = 20);
                    this._isInBounds(prevRow - t, col) && (this._grid[prevRow - t][col][1] = 20);
                    this._isInBounds(prevRow - t, col + 1) && (this._grid[prevRow - t][col + 1][1] = 20);
                    this._isInBounds(prevRow - t, col + 2) && (this._grid[prevRow - t][col + 2][1] = 20);
                }
            }
        } else {
            let prevCol = startCol;
            for (let row = 0; row < 30; row += 3) {
                const leftOrRight = startCol > 15;
                const amount = Math.floor(Math.random() * (2 - 0 + 1));
                prevCol = leftOrRight ? prevCol - amount : prevCol + amount;

                const thickness = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
                for (let t = 0; t <= thickness; t++) {
                    this._isInBounds(row, prevCol + t) && (this._grid[row][prevCol + t][1] = 20);
                    this._isInBounds(row + 1, prevCol + t) && (this._grid[row + 1][prevCol + t][1] = 20);
                    this._isInBounds(row + 2, prevCol + t) && (this._grid[row + 2][prevCol + t][1] = 20);
                    this._isInBounds(row, prevCol - t) && (this._grid[row][prevCol - t][1] = 20);
                    this._isInBounds(row + 1, prevCol - t) && (this._grid[row + 1][prevCol - t][1] = 20);
                    this._isInBounds(row + 2, prevCol - t) && (this._grid[row + 2][prevCol - t][1] = 20);
                }
            }
        }
    }

    /**
     * Makes water tiles specific to series of lakes
     */
    private _makeSmallLakes(): void {
        // Seed the water
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (Math.random() < this._ancientRuinsSpec.waterPercentage) {
                    this._grid[row][col][1] = 20;
                }
            }
        }

        // Organically let the water spread
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (this._grid[row][col][1] !== 20) {
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
                        this._grid[row][col][1] = 20;
                    }
                }
            }
        }

        // Check minimum water reqs.
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (this._grid[row][col][1] === 20) {
                    const above = (this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] === 20) || !this._isInBounds(row + 1, col);
                    const below = (this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] === 20) || !this._isInBounds(row - 1, col);
                    const left = (this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] === 20) || !this._isInBounds(row, col - 1);
                    const right = (this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] === 20) || !this._isInBounds(row, col + 1);

                    const upperLeftCorner = (this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] === 20) || !this._isInBounds(row + 1, col - 1)
                    const upperRightCorner = (this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] === 20) || !this._isInBounds(row + 1, col + 1);
                    const lowerLeftCorner = (this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] === 20) || !this._isInBounds(row - 1, col - 1)
                    const lowerRightCorner = (this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] === 20) || !this._isInBounds(row - 1, col + 1);

                    if ([above, below, left, right].every(x => !x)) {
                        continue;
                    }
                    if (!above && !below) {
                        if (lowerLeftCorner || lowerRightCorner) {
                            this._grid[row - 1][col][1] = 20;
                            this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = 20);
                            this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = 20);
                        } else {
                            this._grid[row + 1][col][1] = 20;
                            this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = 20);
                            this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = 20);
                        }
                    }
                    if (!left && !right) {
                        if (lowerLeftCorner || upperLeftCorner) {
                            this._grid[row][col - 1][1] = 20;
                            this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = 20);
                            this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = 20);
                        } else {
                            this._grid[row][col + 1][1] = 20;
                            this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = 20);
                            this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = 20);
                        }
                    }
                }
            }
        }

        // Remove waters with only 1 tile thickness
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (this._grid[row][col][1] === 20) {
                    const above = (this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] === 20) || !this._isInBounds(row + 1, col);
                    const below = (this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] === 20) || !this._isInBounds(row - 1, col);
                    const left = (this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] === 20) || !this._isInBounds(row, col - 1);
                    const right = (this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] === 20) || !this._isInBounds(row, col + 1);

                    if ([above, below, left, right].every(x => !x)) {
                        continue;
                    }
                    if (!above && !below) {
                        this._grid[row][col][1] = 100;
                        continue;
                    } else if (!left && !right) {
                        this._grid[row][col][1] = 100;
                        continue;
                    }

                    const upperLeftCorner = (this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] === 20) || !this._isInBounds(row + 1, col - 1)
                    const upperRightCorner = (this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] === 20) || !this._isInBounds(row + 1, col + 1);
                    const lowerLeftCorner = (this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] === 20) || !this._isInBounds(row - 1, col - 1)
                    const lowerRightCorner = (this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] === 20) || !this._isInBounds(row - 1, col + 1);

                    if (above && right && !upperRightCorner) {
                        this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] = 20);
                    }
                    if (below && right && !lowerRightCorner) {
                        this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] = 20);
                    }
                    if (below && left && !lowerLeftCorner) {
                        this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] = 20);
                    }
                    if (above && left && !upperLeftCorner) {
                        this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] = 20);
                    }
                }
            }
        }

        // Eliminate rare occasions where fill in block connect a former stand alone pond into a 1 thickness stream.
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (this._grid[row][col][1] === 20) {
                    const above = (this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] === 20) || !this._isInBounds(row + 1, col);
                    const below = (this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] === 20) || !this._isInBounds(row - 1, col);
                    const left = (this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] === 20) || !this._isInBounds(row, col - 1);
                    const right = (this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] === 20) || !this._isInBounds(row, col + 1);

                    if (!above && !below && ((left && !right) || (!left && right))) {
                        this._grid[row][col][1] = 101;
                    }
                    if (!left && !right && ((above && !below) || (!above && below))) {
                        this._grid[row][col][1] = 101;
                    }
                    if ([above, below, left, right].every(x => !x) && Math.random() < 0.5) {
                        this._grid[row][col][1] = 101;
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
            case RuinsBiome.CEMETERY: {
                this._makeCemetery();
                break;
            }
            case RuinsBiome.MONASTERY: {
                this._makeMonastery();
                break;
            }
            case RuinsBiome.VILLAGE: {
                this._makeVillage();
                break;
            }
            case RuinsBiome.TOWN: {
                this._makeTown();
                break;
            }
            case RuinsBiome.CITY: {
                this._makeCity();
                break;
            }
            case RuinsBiome.MILITARY_BASE: {
                this._makeMilitaryBase();
                break;
            }
            case RuinsBiome.LIBRARY: {
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
        if (!this._ancientRuinsSpec.hasWater) {
            return;
        }

        switch(this._ancientRuinsSpec.biomeWater) {
            case WaterBiome.SMALL_LAKES: {
                this._makeSmallLakes();
                break;
            }
            case WaterBiome.LARGE_LAKE: {
                this._makeLargeLake();
                break;
            }
            case WaterBiome.BEACH: {
                this._makeBeaches();
                break;
            }
            case WaterBiome.BEACH: {
                this._makeCreek();
                break;
            }
            case WaterBiome.RIVER: {
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
        const top = this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] > 19 ? 1 : 0;
        const topRight = this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] > 19 ? 1 : 0;
        const right = this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] > 19 ? 1 : 0;
        const bottomRight = this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] > 19 ? 1 : 0;
        const bottom = this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] > 19 ? 1 : 0;
        const bottomLeft = this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] > 19 ? 1 : 0;
        const left = this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] > 19 ? 1 : 0;
        const topLeft = this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] > 19 ? 1 : 0;

        // 1 === non-grass tile found
        // 0 === grass tile found

        let key = `${top}${right}${bottom}${left}`;
        if (key === '1111' && [topRight, bottomRight, bottomLeft, topLeft].some(x => !x)) {
            key = 'sparse';
        } else if (key === '0000' && [topRight, bottomRight, bottomLeft, topLeft].some(x => !!x)) {
            key = 'mixed';
        }
        this._grid[row][col][1] = grassLookupTable[key] || 2;
    }

    /**
     * Cycles through the grass tiles and triggers call to have specific edge graphic chosen to have smooth edges.
     */
    private _modifyGrassesForEdges(): void {
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
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
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (this._grid[row][col][1] === 20) {
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
        const top = this._isInBounds(row + 1, col) && (this._grid[row + 1][col][1] < 20 || this._grid[row + 1][col][1] > 99) ? 1 : 0;
        const topRight = this._isInBounds(row + 1, col + 1) && (this._grid[row + 1][col + 1][1] < 20 || this._grid[row + 1][col + 1][1] > 99) ? 1 : 0;
        const right = this._isInBounds(row, col + 1) && (this._grid[row][col + 1][1] < 20 || this._grid[row][col + 1][1] > 99) ? 1 : 0;
        const bottomRight = this._isInBounds(row - 1, col + 1) && (this._grid[row - 1][col + 1][1] < 20 || this._grid[row - 1][col + 1][1] > 99) ? 1 : 0;
        const bottom = this._isInBounds(row - 1, col) && (this._grid[row - 1][col][1] < 20 || this._grid[row - 1][col][1] > 99) ? 1 : 0;
        const bottomLeft = this._isInBounds(row - 1, col - 1) && (this._grid[row - 1][col - 1][1] < 20 || this._grid[row - 1][col - 1][1] > 99) ? 1 : 0;
        const left = this._isInBounds(row, col - 1) && (this._grid[row][col - 1][1] < 20 || this._grid[row][col - 1][1] > 99) ? 1 : 0;
        const topLeft = this._isInBounds(row + 1, col - 1) && (this._grid[row + 1][col - 1][1] < 20 || this._grid[row + 1][col - 1][1] > 99) ? 1 : 0;

        // 1 === non-water tile found
        // 0 === water tile found

        let key = `${top}${right}${bottom}${left}-${topRight}${bottomRight}${bottomLeft}${topLeft}`;
        this._grid[row][col][1] = waterLookupTable[key] || 20;
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
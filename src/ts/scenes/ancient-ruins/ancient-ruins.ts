import {
    DoubleSide,
    LinearFilter,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Scene,
    Texture } from "three";

import { SceneType } from "../../models/scene-type";
import { ControlPanel } from "../../controls/panels/control-panel";
import { noOp } from "../../utils/no-op";
import { getIntersections } from "../../utils/get-intersections";

const grassAgainstDirtLookupTable: { [key: string]: number } = {
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

const waterAgainstDirtLookupTable: { [key: string]: number } = {
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
    '0000-1000': 30,
    '0000-0100': 31,
    '0000-0010': 32,
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
    '1111-0000': 35

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

/**
 * @class
 * Screen dedicated to ancient ruins on planetary surface.
 */
export class AncientRuins {
    /**
     * Specification of what the planet and ruins below should look like.
     */
    private _ancientRuinsSpec: any = {
        dirtMaterial: 'Dirt',
        grassPercentage: 0.3,
        grassColor: 'green',
        hasPlants: true,
        hasWater: true,
        waterColor: 'blue',
        waterPercentage: 0.025
    };

    /**
     * Reference to the main Control Panel.
     */
    private _controlPanel: ControlPanel;

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
     * 100: Brown Dirt (whole tile) version 1
     * 101: Brown Dirt (whole tile) version 2
     * 102: Grey Gravel (whole tile) version 1
     * 103: Grey Gravel (whole tile) version 2
     * 104: Beige Sand (whole tile) version 1
     * 105: Beige Sand (whole tile) version 2
     */
    private _grid: number[][][] = [];

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

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

    /**
     * Constructor for the Ancient Ruins (Scene) class
     * @param scene     graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param textures  all the needed textures for ancient ruins.
     */
    constructor(
        scene: SceneType,
        textures: { [key: string]: Texture }) {

        this._scene = scene.scene;
        this._textures = textures;



        // Text, Button, and Event Listeners
        this._onInitialize(scene);
        this._listenerRef = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._listenerRef, false);

        this._makeMaterials();

        this._makeGrass();

        this._makeWater();

        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (this._grid[row][col][1] === 20) {
                    this._modifyWaterForSurrounds(row, col);
                }
            }
        }

        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (this._grid[row][col][1] === 1) {
                    this._modifyGrassForSurrounds(row, col);
                }
            }
        }

        this._createGroundMeshes();
    }

    /**
     * Checks a given tile for grass, and adds 10% chance to spread.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @returns additional spread percentage for grass
     */
    private _checkGrassSpread(row: number, col: number): number {
        // If non-zero, then it's a grass tile, thus increasing grass spread another 15%
        return (this._isInBounds(row, col) && this._grid[row][col][1] === 1) ? 0.15 : 0;
    }

    /**
     * Checks a given tile for water, and adds 10% chance to spread.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     * @returns additional spread percentage for water
     */
    private _checkWaterSpread(row: number, col: number): number {
        // If non-zero, then it's a water tile, thus increasing water spread another 10%
        return (this._isInBounds(row, col) && this._grid[row][col][1] === 20) ? 0.1 : 0;
    }

    /**
     * Uses the tile grid to make meshes that match tile values.
     */
    private _createGroundMeshes(): void {
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                let block;
                switch(this._grid[row][col][1]) {
                    case 2: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete2 );
                        break;
                    }
                    case 3: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomCenter );
                        break;
                    }
                    case 4: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeft );
                        break;
                    }
                    case 5: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerLeft );
                        break;
                    }
                    case 6: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeft );
                        break;
                    }
                    case 7: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topCenter );
                        break;
                    }
                    case 8: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRight );
                        break;
                    }
                    case 9: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerRight );
                        break;
                    }
                    case 10: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRight );
                        break;
                    }
                    case 11: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeftRight );
                        break;
                    }
                    case 12: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomRight );
                        break;
                    }
                    case 13: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeftRight );
                        break;
                    }
                    case 14: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomLeft );
                        break;
                    }
                    case 15: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottom );
                        break;
                    }
                    case 16: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].leftRight );
                        break;
                    }
                    case 17: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].sparse );
                        break;
                    }
                    case 18: {
                        if (Math.random() < 0.25) {
                            block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].mixed );
                        } else {
                            block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete2 );
                        }
                        break;
                    }
                    case 19: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerCenter );
                        break;
                    }
                    case 20: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor].complete.complete1 );
                        break;
                    }
                    case 21: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomCenter );
                        break;
                    }
                    case 22: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeft );
                        break;
                    }
                    case 23: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerLeft );
                        break;
                    }
                    case 24: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeft );
                        break;
                    }
                    case 25: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topCenter );
                        break;
                    }
                    case 26: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRight );
                        break;
                    }
                    case 27: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerRight );
                        break;
                    }
                    case 28: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRight );
                        break;
                    }
                    case 29: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRightTip );
                        break;
                    }
                    case 30: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeftTip );
                        break;
                    }
                    case 31: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeftTip );
                        break;
                    }
                    case 32: {
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRightTip );
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
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerCenter );
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
                    this._scene.add(block);
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
     * Sets up the grid with grass values.
     */
    private _makeGrass(): void {
        // If no plants on planet, don't spawn grass.
        if (!this._ancientRuinsSpec.hasPlants) {
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
                    let hasGrassPercentage = 0.01
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
     * Sets up the grid with water values.
     */
    private _makeWater(): void {
        // If no water on planet, don't spawn water.
        if (!this._ancientRuinsSpec.hasWater) {
            return;
        }

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
                    let hasWaterPercentage = 0.01
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
    }

    /**
     * Makes all the tile materials for the game map.
     */
    private _makeMaterials(): void {
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
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterCenterCenterDirt1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerCenter.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor].complete.complete1 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterComplete01`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor].complete.complete1.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomCenter${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomCenter.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomLeft${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeft.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeftTip = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomLeftTip${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeftTip.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRight.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRightTip = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomRightTip${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRightTip.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterCenterLeft${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerLeft.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterCenterRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerRight.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopCenter${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topCenter.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopLeft${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeft.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeftTip = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopLeftTip${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeftTip.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRight.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRightTip = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopRightTip${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRightTip.map.minFilter = LinearFilter;

        // Grass materials
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassCenterCenter01`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerCenter.map.minFilter = LinearFilter;

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

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassBottomCenter${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomCenter.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassBottomLeft${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassBottomLeftRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeftRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassBottomRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassCenterLeft${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassCenterRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].leftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassLeftRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].leftRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].mixed = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassMixed${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].mixed.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].sparse = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassSparse${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].sparse.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottom = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopBottom${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottom.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopBottomLeft${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopBottomRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopCenter${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topCenter.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopLeft${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopLeftRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeftRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.grassColor}GrassTopRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRight.map.minFilter = LinearFilter;
    }

    /**
     * Checks a given tile's surrounds for grass and updates value to match neighboring dirt tiles.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     */
    private _modifyGrassForSurrounds(row: number, col: number): void {
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
        this._grid[row][col][1] = grassAgainstDirtLookupTable[key] || 2;
    }

    /**
     * Checks a given tile's surrounds for water and updates value to match neighboring dirt tiles.
     * @param row row coordinate in the terrain grid
     * @param col col coordinate in the terrain grid
     */
    private _modifyWaterForSurrounds(row: number, col: number): void {
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
        this._grid[row][col][1] = waterAgainstDirtLookupTable[key] || 20;
    }

    /**
     * Creates all of the html elements for the first time on scene creation.
     */
    private _onInitialize(sceneType: SceneType): void {
        // DOM Events
        const container = document.getElementById('mainview');
        document.oncontextmenu = event => {
            return false;
        };
        document.onclick = event => {
            event.preventDefault();
            // Three JS object intersections.
            getIntersections(event, container, sceneType).forEach(el => {

            });
        };
        document.onmousemove = event => {

        };

        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        const exitHelp = () => { noOp(); };
        const exitSettings = () => { noOp(); };
        const help = () => { noOp(); };
        const pause = () => { noOp(); };
        const play = () => { noOp(); };
        const settings = () => { noOp(); };

        this._controlPanel = new ControlPanel(
            { height, left: left, top: null, width },
            { exitHelp, exitSettings, help, pause, play, settings },
            true);
    }

    /**
     * When the browser window changes in size, all html elements are updated in kind.
     */
    private _onWindowResize(): void {
        // Get new window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        this._controlPanel.resize({ height, left: left, top: null, width });
    }

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        document.oncontextmenu = () => {};
        this._controlPanel.dispose();
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    public endCycle(): { [key: number]: number } {
        return null;
    }

}
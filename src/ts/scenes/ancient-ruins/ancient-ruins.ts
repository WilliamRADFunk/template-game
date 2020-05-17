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

const greenGrassAgainstDirtLookupTable: { [key: string]: number } = {
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
     *
     */
    private _ancientRuinsSpec: any = {
        dirtMaterial: 'Dirt',
        grassPercentage: 0.3,
        grassColor: 'green',
        hasPlants: true,
        hasWater: true,
        waterColor: 'blue',
        waterPercentage: 0.1
    };

    /**
     * Reference to the main Control Panel.
     */
    private _controlPanel: ControlPanel;

    /**
     *
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
        // If non-zero, then it's a grass tile, thus increasing grass spread another 10%
        return (this._isInBounds(row, col) && this._grid[row][col][1] === 1) ? 0.1 : 0;
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
                        block = new Mesh( this._geometry, this._materials.water[this._ancientRuinsSpec.waterColor].complete.complete2 );
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

        // Grass Materials
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].centerCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterCenterCenter01`],
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

        this._materials.water[this._ancientRuinsSpec.waterColor].complete.complete2 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterComplete02`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor].complete.complete2.map.minFilter = LinearFilter;

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

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomLeftRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomLeftRight.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterBottomRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].bottomRight.map.minFilter = LinearFilter;

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

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].leftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterLeftRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].leftRight.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].mixed = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterMixed${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].mixed.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].sparse = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterSparse${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].sparse.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottom = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopBottom${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottom.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopBottomLeft${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomLeft.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopBottomRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topBottomRight.map.minFilter = LinearFilter;

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

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopLeftRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topLeftRight.map.minFilter = LinearFilter;

        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures[`${this._ancientRuinsSpec.waterColor}WaterTopRight${this._ancientRuinsSpec.dirtMaterial}1`],
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.water[this._ancientRuinsSpec.waterColor][this._ancientRuinsSpec.dirtMaterial.toLowerCase()].topRight.map.minFilter = LinearFilter;

        // Water materials
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
        const top = this._isInBounds(row + 1, col) && this._grid[row + 1][col][1] > 99 ? 1 : 0;
        const topRight = this._isInBounds(row + 1, col + 1) && this._grid[row + 1][col + 1][1] > 99 ? 1 : 0;
        const right = this._isInBounds(row, col + 1) && this._grid[row][col + 1][1] > 99 ? 1 : 0;
        const bottomRight = this._isInBounds(row - 1, col + 1) && this._grid[row - 1][col + 1][1] > 99 ? 1 : 0;
        const bottom = this._isInBounds(row - 1, col) && this._grid[row - 1][col][1] > 99 ? 1 : 0;
        const bottomLeft = this._isInBounds(row - 1, col - 1) && this._grid[row - 1][col - 1][1] > 99 ? 1 : 0;
        const left = this._isInBounds(row, col - 1) && this._grid[row][col - 1][1] > 99 ? 1 : 0;
        const topLeft = this._isInBounds(row + 1, col - 1) && this._grid[row + 1][col - 1][1] > 99 ? 1 : 0;

        // 1 === non-grass tile found
        // 0 === grass tile found

        let key = `${top}${right}${bottom}${left}`;
        if (key === '1111' && [topRight, bottomRight, bottomLeft, topLeft].some(x => !x)) {
            key = 'sparse';
        } else if (key === '0000' && [topRight, bottomRight, bottomLeft, topLeft].some(x => !!x)) {
            key = 'mixed';
        }
        this._grid[row][col][1] = greenGrassAgainstDirtLookupTable[key] || 2;
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
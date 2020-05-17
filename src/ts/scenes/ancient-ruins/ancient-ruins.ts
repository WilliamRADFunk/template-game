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
    '1111': 20
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
        grassPercentage: 0.3,
        grassColor: 'green',
        hasPlants: true
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
     * 3: Green Grass (Brown at top)
     * 4: Green Grass (Brown at top & right)
     * 5: Green Grass (Brown at right)
     * 6: Green Grass (Brown at right & bottom)
     * 7: Green Grass (Brown at bottom)
     * 8: Green Grass (Brown at bottom & left)
     * 9: Green Grass (Brown at left)
     * 10: Green Grass (Brown at left & top)
     * 11: Green Grass (Brown at left & top & right)
     * 12: Green Grass (Brown at top & right & bottom)
     * 13: Green Grass (Brown at right & bottom & left)
     * 14: Green Grass (Brown at bottom & left & top)
     * 15: Green Grass (Brown at top & bottom)
     * 16: Green Grass (Brown at left & right)
     * 20: Green Grass (Brown all around)
     * 100: Brown dirt (whole tile)
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
        grass: {
            green: {
                complete: {},
                dirt: {},
                gravel: {},
                water: {}
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
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomCenter );
                        break;
                    }
                    case 4: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomLeft );
                        break;
                    }
                    case 5: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerLeft );
                        break;
                    }
                    case 6: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topLeft );
                        break;
                    }
                    case 7: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topCenter );
                        break;
                    }
                    case 8: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topRight );
                        break;
                    }
                    case 9: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerRight );
                        break;
                    }
                    case 10: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomRight );
                        break;
                    }
                    case 11: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topLeftRight );
                        break;
                    }
                    case 12: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topBottomRight );
                        break;
                    }
                    case 13: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomLeftRight );
                        break;
                    }
                    case 14: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topBottomLeft );
                        break;
                    }
                    case 15: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topBottom );
                        break;
                    }
                    case 16: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.leftRight );
                        break;
                    }
                    case 20: {
                        block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerCenter );
                        break;
                    }
                    case 100: {
                        block = new Mesh( this._geometry, this._materials.dirt.brown.complete.centerCenter1 );
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

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassCenterCenter01,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerCenter.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete1 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassComplete01,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete1.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete2 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassComplete02,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].complete.complete2.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassBottomCenterDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomCenter.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassBottomLeftDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomLeftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassBottomLeftRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomLeftRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassBottomRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.bottomRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassCenterLeftDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassCenterRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.leftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassLeftRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.leftRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topBottom = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopBottomDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topBottom.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topBottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopBottomLeftDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topBottomLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topBottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopBottomRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topBottomRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopCenterDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topCenter.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopLeftDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topLeft.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topLeftRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopLeftRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topLeftRight.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.topRight.map.minFilter = LinearFilter;
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

        const key = `${top}${right}${bottom}${left}`;
        this._grid[row][col][1] = grassAgainstDirtLookupTable[key] || 2;
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
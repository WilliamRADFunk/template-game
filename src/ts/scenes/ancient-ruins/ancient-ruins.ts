import { AdditiveBlending, CanvasTexture, DoubleSide, Mesh, MeshPhongMaterial, PlaneGeometry, Scene, Sprite, SpriteMaterial, Texture, Vector2, LinearFilter } from "three";

import { SceneType } from "../../models/scene-type";
import { ControlPanel } from "../../controls/panels/control-panel";
import { noOp } from "../../utils/no-op";
import { getIntersections } from "../../utils/get-intersections";

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
        grassPercentage: 0.1,
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
     * [elevation] 0    Ground tile on which a player might stand and interact. Also triggers events.
     * [elevation] 1    Obstruction tile. Might be a person, boulder, wall, or tree trunk. Can interact with mouse clicks, but can't move into space.
     * [elevation] 2    Overhead tile such as low ceiling of building. Can move "under" and must turn semi-transparent.
     * [elevation] 3    High overhead tile like tree canopy or high ceiling. Can move "under" and must turn semi-trnsparent.
     * Light:           Negative values mirror the positive values as the same content, but dark. Astroteam can counter when in range.
     * Type:            [row][col][elevation] % 100 gives "type" of tile
     * Directionality:  Math.floor([row][col][elevation] / 100) gives directionality of tile (ie. 0 centered, 1 top-facing, 2 right-facing, etc.) allows for higher numbers and greater flexibility.
     *
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
        grass: {
            green: {
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

        // Check grass results
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                // for (let elev = 0; elev < 4; elev++) { }
                if (this._grid[row][col][1] === 1) {
                    const block = new Mesh( this._geometry, this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerCenter2 );
                    block.position.set(-5.8 + (col/2.5), 17, 5.8 - row/2.5)
                    block.rotation.set(-1.5708, 0, 0);
                    this._scene.add(block);
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
    private _checkGrassSurroundings(row: number, col: number): number {
        // Check out of bounds.
        if (row < 0 || row > 29) {
            return 0;
        } else if (col < 0 || col > 29) {
            return 0;
        }

        // If non-zero, then it's a grass tile, thus increasing grass spread another 10%
        return (this._grid[row][col][1] === 1) ? 0.1 : 0;
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
                    this._grid[row][col][1] = 0;
                }
            }
        }

        // Organically let the grass spread
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                if (!this._grid[row][col][1]) {
                    let hasGrassPercentage = 0.01
                        + this._checkGrassSurroundings(row + 1, col - 1)
                        + this._checkGrassSurroundings(row, col - 1)
                        + this._checkGrassSurroundings(row - 1, col - 1)
                        + this._checkGrassSurroundings(row + 1, col)
                        + this._checkGrassSurroundings(row - 1, col)
                        + this._checkGrassSurroundings(row + 1, col + 1)
                        + this._checkGrassSurroundings(row, col + 1)
                        + this._checkGrassSurroundings(row - 1, col + 1)
                    this._grid[row][col][1] = (Math.random() < hasGrassPercentage) ? 1 : 0;
                }
            }
        }
    }

    /**
     * Makes all the tile materials for the game map.
     */
    private _makeMaterials(): void {
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerCenter1 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassCenter01,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerCenter1.map.minFilter = LinearFilter;

        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerCenter2 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassCenter02,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass[this._ancientRuinsSpec.grassColor].dirt.centerCenter2.map.minFilter = LinearFilter;

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
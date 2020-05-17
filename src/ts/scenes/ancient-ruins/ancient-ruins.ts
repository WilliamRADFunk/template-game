import { AdditiveBlending, CanvasTexture, DoubleSide, Mesh, MeshPhongMaterial, PlaneGeometry, Scene, Sprite, SpriteMaterial, Texture, Vector2, LinearFilter } from "three";

import { SceneType } from "../../models/scene-type";
import { ControlPanel } from "../../controls/panels/control-panel";
import { noOp } from "../../utils/no-op";
import { getIntersections } from "../../utils/get-intersections";

interface MaterialMap {
    [key: string]: {
        [key: string]: {
            [key: string]: MeshPhongMaterial;
        }
    }
}

/**
 * @class
 * Screen dedicated to ancient ruins on planetary surface.
 */
export class AncientRuins {
    /**
     * Reference to the main Control Panel.
     */
    private _controlPanel: ControlPanel;

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
        grassWithDirt: {
            green: { }
        },
        grass: {
            green: { }
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

        this._materials.grass.green.centerCenter1 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassCenter01,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass.green.centerCenter1.map.minFilter = LinearFilter;

        this._materials.grass.green.centerCenter2 = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassCenter02,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grass.green.centerCenter2.map.minFilter = LinearFilter;

        this._materials.grassWithDirt.green.bottomCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassBottomCenterDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grassWithDirt.green.bottomCenter.map.minFilter = LinearFilter;

        this._materials.grassWithDirt.green.bottomLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassBottomLeftDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grassWithDirt.green.bottomLeft.map.minFilter = LinearFilter;

        this._materials.grassWithDirt.green.bottomRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassBottomRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grassWithDirt.green.bottomRight.map.minFilter = LinearFilter;

        this._materials.grassWithDirt.green.centerLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassCenterLeftDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grassWithDirt.green.centerLeft.map.minFilter = LinearFilter;

        this._materials.grassWithDirt.green.centerRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassCenterRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grassWithDirt.green.centerRight.map.minFilter = LinearFilter;

        this._materials.grassWithDirt.green.topCenter = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopCenterDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grassWithDirt.green.topCenter.map.minFilter = LinearFilter;

        this._materials.grassWithDirt.green.topLeft = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopLeftDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grassWithDirt.green.topLeft.map.minFilter = LinearFilter;

        this._materials.grassWithDirt.green.topRight = new MeshPhongMaterial({
            color: '#FFFFFF',
            map: this._textures.greenGrassTopRightDirt1,
            shininess: 0,
            side: DoubleSide,
            transparent: false
        });
        this._materials.grassWithDirt.green.topRight.map.minFilter = LinearFilter;

        const geo = new PlaneGeometry( 0.4, 0.4, 10, 10 );
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 30; col++) {
                // for (let elev = 0; elev < 4; elev++) {
                    let block;
                    if (row === 29 && col > 0 && col < 29) {
                        block = new Mesh( geo, this._materials.grassWithDirt.green.bottomCenter );
                    } else if (row === 0 && col > 0 && col < 29) {
                        block = new Mesh( geo, this._materials.grassWithDirt.green.topCenter );
                    } else if (col === 29 && row > 0 && row < 29) {
                        block = new Mesh( geo, this._materials.grassWithDirt.green.centerLeft );
                    } else if (col === 0 && row > 0 && row < 29) {
                        block = new Mesh( geo, this._materials.grassWithDirt.green.centerRight );
                    } else if (row === 29 && col === 0) {
                        block = new Mesh( geo, this._materials.grassWithDirt.green.bottomRight );
                    } else if (row === 29 && col === 29) {
                        block = new Mesh( geo, this._materials.grassWithDirt.green.bottomLeft );
                    } else if (row === 0 && col === 29) {
                        block = new Mesh( geo, this._materials.grassWithDirt.green.topLeft );
                    } else if (row === 0 && col === 0) {
                        block = new Mesh( geo, this._materials.grassWithDirt.green.topRight );
                    } else if ((row + col) % 2 === 0) {
                        block = new Mesh( geo, this._materials.grass.green.centerCenter1 );
                    } else {
                        block = new Mesh( geo, this._materials.grass.green.centerCenter2 );
                    }
                    block.position.set(-5.8 + (col/2.5), 17, 5.8 - row/2.5)
                    block.rotation.set(-1.5708, 0, 0);
                    this._scene.add(block);
                // }
            }
        }
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
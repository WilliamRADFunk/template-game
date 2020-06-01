import {
    MeshPhongMaterial,
    PlaneGeometry,
    Scene,
    Texture } from "three";

import { SceneType } from "../../models/scene-type";
import { ControlPanel } from "../../controls/panels/control-panel";
import { noOp } from "../../utils/no-op";
import { getIntersections } from "../../utils/get-intersections";
import { GridCtrl } from "./controllers/grid-controller";
import { AncientRuinsSpecifications, GroundMaterial, PlantColor, WaterColor, WaterBiome, RuinsBiome } from "../../models/ancient-ruins-specifications";

/**
 * @class
 * Screen dedicated to ancient ruins on planetary surface.
 */
export class AncientRuins {
    /**
     * Specification of what the planet and ruins below should look like.
     */
    private _ancientRuinsSpec: AncientRuinsSpecifications;

    /**
     * Reference to the main Control Panel.
     */
    private _controlPanel: ControlPanel;

    /**
     * Tile geometry that makes up the ground tiles.
     */
    private _geometry: PlaneGeometry = new PlaneGeometry( 0.4, 0.4, 10, 10 );

    /**
     * Reference to this scene's grid controller.
     */
    private _gridCtrl: GridCtrl;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    /**
     * All of the materials contained in this scene.
     */
    private _materials: { [key: string]: MeshPhongMaterial };

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
        textures: { [key: string]: Texture },
        ancientRuinsSpec: AncientRuinsSpecifications) {

        this._scene = scene.scene;
        this._textures = textures;
        this._ancientRuinsSpec = ancientRuinsSpec;

        // Text, Button, and Event Listeners
        this._onInitialize(scene);
        this._listenerRef = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._listenerRef, false);

        this._gridCtrl = new GridCtrl(this._scene, this._textures, this._ancientRuinsSpec);
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
                const tileName = el && el.object && el.object.name;
                const tileSplit = tileName.split('-');
                if (tileSplit.length === 3) {
                    const tileGround = this._gridCtrl.getTileValue(Number(tileSplit[1]), Number(tileSplit[2]), 1);
                    const tileTraverse = this._gridCtrl.getTileValue(Number(tileSplit[1]), Number(tileSplit[2]), 2);
                    const tileOverhead = this._gridCtrl.getTileValue(Number(tileSplit[1]), Number(tileSplit[2]), 3);
                    console.log(tileGround, tileTraverse, tileOverhead);
                }
                
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
        this._gridCtrl.dispose();
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    public endCycle(): { [key: number]: number } {
        this._gridCtrl.endCycle();
        return null;
    }

}
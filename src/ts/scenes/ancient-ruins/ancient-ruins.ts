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
import { AncientRuinsSpecifications } from "../../models/ancient-ruins-specifications";
import { PanelBase } from "../../controls/panels/panel-base";
import { TileDescriptionText } from "./custom-controls/tile-description-text";
import { COLORS } from "../../styles/colors";
import { TextType } from "../../controls/text/text-type";
import { SettingsCtrl } from "../../controls/controllers/settings-controllers";
import { HTMLElementPosition } from "../../models/html-element-position";
import { ButtonBase } from "../../controls/buttons/button-base";
import { TextBase } from "../../controls/text/text-base";

/**
 * Border value used for dev mode to see outline around text content (for positioning and sizing).
 */
// const border: string = '1px solid #FFF';
const border: string = 'none';

/**
 * The game state mode enum for this scene.
 */
export enum AncientRuinsState {
    'paused' = 0,
    'newGame' = 1,
    'tutorial' = 2,
    'settings' = 3
}

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
     * List of buttons
     */
    private _buttons: { [key: string]: ButtonBase } = {
        startButton: null
    };

    /**
     * Reference to the main Control Panel.
     */
    private _controlPanel: ControlPanel;

    /**
     * Text appearing in lower-right panel for tile descriptions.
     */
    private _descText: TileDescriptionText;

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
     * Reference to this scene's settings controller.
     */
    private _settingsCtrl: SettingsCtrl;

    /**
     * Tracks current game state mode.
     */
    private _state: AncientRuinsState = AncientRuinsState.newGame;

    /**
     * Text and button objects that were visible before player entered help or settings mode.
     */
    private _stateStoredObjects: (ButtonBase | TextBase)[] = [];

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

        const descPanel = new PanelBase('Description Panel', this._scene, 4, 4.2, 1.2, 3.9, 4.95);
        descPanel.toggleOpacity();
    }

    /**
     * Makes all existing buttons unclickable.
     */
    private _disableAllButtons(): void {
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].disable());
    }

    /**
     * Makes all existing buttons clickable.
     */
    private _enableAllButtons(): void {
        Object.keys(this._buttons)
            .filter(key => !!this._buttons[key])
            .forEach(key => this._buttons[key].enable());
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
                    const desc = `
                        <table>
                            ${tileOverhead ? `
                                <tr>
                                    <th>Above:&nbsp;</th>
                                    <td style="padding-bottom: 3px;">${tileOverhead}</td>
                                </tr>` :
                                ''
                            }
                            ${tileTraverse ? `
                                <tr>
                                    <th>Level:&nbsp;</th>
                                    <td style="padding-bottom: 3px;">${tileTraverse}</td>
                                </tr>` :
                                ''
                            }
                            ${tileGround ? `
                                <tr>
                                    <th>Below:&nbsp;</th>
                                    <td>${tileGround}</td>
                                </tr>` :
                                ''
                            }
                        </table>
                    `;
                    this._descText.update(desc);
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

        const exitHelp = (prevState: AncientRuinsState) => {
            this._descText.show();
            // this._helpCtrl.hide();
            // this._gridCtrl.show();

            this._enableAllButtons();
            this._stateStoredObjects.forEach(obj => obj && obj.show());
            this._stateStoredObjects.length = 0;

            this._state = prevState;
        };

        const exitSettings = (prevState: AncientRuinsState)  => {
            this._settingsCtrl.hide();
            this._descText.show();
            // this._gridCtrl.show();

            this._enableAllButtons();
            this._stateStoredObjects.forEach(obj => obj && obj.show());
            this._stateStoredObjects.length = 0;

            this._state = prevState;
        };

        const help = () => {
            this._descText.hide();
            // this._helpCtrl.show();
            // this._gridCtrl.hide();

            this._disableAllButtons();
            const prevState = this._state;
            this._state = AncientRuinsState.tutorial;
            Object.values(this._buttons).filter(x => !!x).forEach(button => {
                if (button.isVisible()) {
                    this._stateStoredObjects.push(button);
                    button.hide();
                }
            });
            return prevState;
        };

        const pause = () => {
            this._disableAllButtons();
            const prevState = this._state;
            this._state = AncientRuinsState.paused;
            return prevState;
        };

        const play = (prevState: AncientRuinsState) => {
            this._enableAllButtons();
            this._state = prevState;
        };

        const settings = () => {
            this._settingsCtrl.show();
            this._descText.hide();
            // this._gridCtrl.hide();

            this._disableAllButtons();
            const prevState = this._state;
            this._state = AncientRuinsState.settings;
            Object.values(this._buttons).filter(x => !!x).forEach(button => {
                if (button.isVisible()) {
                    this._stateStoredObjects.push(button);
                    button.hide();
                }
            });
            return prevState;
        };

        this._controlPanel = new ControlPanel(
            { height, left: left, top: null, width },
            { exitHelp, exitSettings, help, pause, play, settings },
            true);

        this._descText = new TileDescriptionText(
            'Your team has successfully landed on the planet\'s surface as close to the ruins as they dare.',
            { height, left: left, top: null, width },
            null);
        
        this._settingsCtrl = new SettingsCtrl(this._scene, border)
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
        this._descText.resize({ height, left: left, top: null, width });
        this._settingsCtrl.onWindowResize(height, left, null, width);
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
        this._settingsCtrl.dispose();
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    public endCycle(): { [key: number]: number } {
        // Game externally paused from control panel. Nothing should progress.
        if (this._state === AncientRuinsState.paused) {
            return;
        }
        // Game is in help mode. Play animations from help screen.
        if (this._state === AncientRuinsState.tutorial) {
            // this._helpCtrl.endCycle();
            return;
        }
        // Game is in settings mode. Activate settings screen.
        if (this._state === AncientRuinsState.settings) {
            this._settingsCtrl.endCycle();
            return;
        }
        this._gridCtrl.endCycle();
        return null;
    }
}
import {
    MeshPhongMaterial,
    PlaneGeometry,
    Scene,
    Texture } from "three";

import { SceneType } from "../../models/scene-type";
import { ControlPanel } from "../../controls/panels/control-panel";
import { getIntersections } from "../../utils/get-intersections";
import { GridCtrl } from "./controllers/grid-controller";
import { AncientRuinsSpecifications, TeamMember } from "../../models/ancient-ruins-specifications";
import { PanelBase } from "../../controls/panels/panel-base";
import { TileDescriptionText } from "./custom-controls/tile-description-text";
import { SettingsCtrl } from "../../controls/controllers/settings-controllers";
import { ButtonBase } from "../../controls/buttons/button-base";
import { TextBase } from "../../controls/text/text-base";
import { TeamCtrl } from "./controllers/team-controller";
import { TileCtrl } from "./controllers/tile-controller";
import { LoadingCtrl } from "./controllers/loading-controller";
import { GridCtrlFactory } from "./utils/grid-controller-factory";
import { PathFindingCtrl } from "./controllers/path-finding-controller";

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
    'settings' = 3,
    'landing_start' = 4,
    'leaving_start' = 5,
    'loading' = 6
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
     * Reference to the main Control Panel.
     */
    private _descTextPanel: PanelBase;

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
     * Reference to this scene's loading controller.
     */
    private _loadingCtrl: LoadingCtrl;

    /**
     * All of the materials contained in this scene.
     */
    private _materials: { [key: string]: MeshPhongMaterial };

    /**
     * Reference to this scene's path finding controller.
     */
    private _pathFindingCtrl: PathFindingCtrl;

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
    private _state: AncientRuinsState = AncientRuinsState.loading;

    /**
     * Text and button objects that were visible before player entered help or settings mode.
     */
    private _stateStoredObjects: (ButtonBase | TextBase)[] = [];

    /**
     * All of the team functionality contained in this scene.
     */
    private _teamCtrl: TeamCtrl;

    /**
     * All of the textures contained in this scene.
     */
    private _textures: { [key: string]: Texture } = {};

    /**
     * Reference to this scene's tile controller.
     */
    private _tileCtrl: TileCtrl;

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

        this._loadingCtrl = new LoadingCtrl();
        this._loadingCtrl.loadingMode();

        // Text, Button, and Event Listeners
        const initialize = async function(scene: SceneType): Promise<void> {
            this._onInitialize(scene);
            this._listenerRef = this._onWindowResize.bind(this);
            window.addEventListener('resize', this._listenerRef, false);
    
            return this._loadingCtrl.getLoadWaitPromise(100, 24);
        };

        initialize.bind(this)(scene)
        // Tile controller initialization and crew tile value.
        .then(() => {
            this._tileCtrl = new TileCtrl(this._ancientRuinsSpec);
            // This line must run after tile controller instantiation, but before grid or team controller.
            this._ancientRuinsSpec.crew.forEach((member: TeamMember, index: number) => member.tileValue = this._tileCtrl.getCrewValue(index));
    
            return this._loadingCtrl.getLoadWaitPromise(1000, 38);
        })
        // Grid controller base initialization.
        .then(() => {
            return GridCtrlFactory(this._scene, this._textures, this._ancientRuinsSpec, this._tileCtrl)
                .then((gridCtrl) => {
                    this._gridCtrl = gridCtrl;
                    return this._loadingCtrl.getLoadWaitPromise(750, 43);
                });
        })
        // Grid controller grid values initialization.
        .then(() => {
            return this._gridCtrl.initiateGridValues().then(() => {
                return this._loadingCtrl.getLoadWaitPromise(1000, 54);
            });
        })
        // Grid controller ground level mesh initialization.
        .then(() => {
            return this._gridCtrl.initiateGroundLevelMeshes().then(() => {
                return this._loadingCtrl.getLoadWaitPromise(250, 59);
            });
        })
        // Grid controller traverse level mesh initialization.
        .then(() => {
            return this._gridCtrl.initiateTraverseLevelMeshes().then(() => {
                return this._loadingCtrl.getLoadWaitPromise(250, 63);
            });
        })
        // Grid controller overhead level mesh initialization.
        .then(() => {
            return this._gridCtrl.initiateOverheadLevelMeshes().then(() => {
                return this._loadingCtrl.getLoadWaitPromise(250, 67);
            });
        })
        // Grid controller fog of war level mesh initialization.
        .then(() => {
            return this._gridCtrl.initiateFogOfWarLevelMeshes().then(() => {
                return this._loadingCtrl.getLoadWaitPromise(250, 70);
            });
        })
        // Initialization clouds and landing zone.
        .then(() => {
            return this._gridCtrl.initiateCloudsAndLandingMeshes().then(() => {
                return this._loadingCtrl.getLoadWaitPromise(1000, 75);
            });
        })
        // Team controller initialization, and creation of lower right description panel.
        .then(() => {
            this._teamCtrl = new TeamCtrl(
                this._scene,
                this._textures,
                this._ancientRuinsSpec,
                this._gridCtrl,
                this._tileCtrl);
    
            this._descTextPanel = new PanelBase('Description Panel', this._scene, 4, 4.2, 1.2, 3.9, 4.95);
            this._descTextPanel.toggleOpacity();
            this._teamCtrl.hideTeam();
    
            return this._loadingCtrl.getLoadWaitPromise(100, 89);
        })
        // Path Finder Controller initialization.
        .then(() => {
            this._pathFindingCtrl = new PathFindingCtrl(this._gridCtrl);

            return this._loadingCtrl.getLoadWaitPromise(100, 94);
        })
        // Turn off loading graphic and initiate game.
        .then(() => {
            return this._loadingCtrl.getLoadWaitPromise(750, 100);
        })
        // Loading finished. Switch screens and state.
        .then(() => {
            this._loadingCtrl.gameMode();
            this._state = AncientRuinsState.landing_start;
        });
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
            event.preventDefault();
            // If no crew member active, or in intro sequence, do nothing.
            if (this._teamCtrl.getCurrTeamMember() < 0
                || this._state === AncientRuinsState.landing_start
                || this._state === AncientRuinsState.leaving_start) {
                return false;
            }
            // ThreeJS object intersections.
            getIntersections(event, container, sceneType).forEach(el => {
                const tileName = el && el.object && el.object.name;
                const tileSplit = tileName.split('-');
                if (tileSplit.length === 3) {
                    const currTeamMemberTile = this._ancientRuinsSpec.crew[this._teamCtrl.getCurrTeamMember()].position;
                    console.log(`Move ${
                        this._gridCtrl.getTileDescription(Number(currTeamMemberTile[0]), Number(currTeamMemberTile[1]), 2)} to tile ${
                        Number(tileSplit[1])}, ${
                        Number(tileSplit[2])}`);
                    
                    const shortestPath = this._pathFindingCtrl.getShortestPath(
                        currTeamMemberTile[0],
                        currTeamMemberTile[1],
                        Number(tileSplit[1]), Number(tileSplit[2]));
                    
                    console.log(`Starting Tile: [${Number(currTeamMemberTile[0])}, ${Number(currTeamMemberTile[1])}]`,
                        `Target Tile: [${Number(tileSplit[1])}, ${Number(tileSplit[2])}]`,
                        'Shortest Path: ', shortestPath);
                }
            });
            return false;
        };
        document.onclick = event => {
            event.preventDefault();
            // If no crew member active, or in intro sequence, do nothing.
            if (this._state === AncientRuinsState.landing_start || this._state === AncientRuinsState.leaving_start) {
                return false;
            }
            // ThreeJS object intersections.
            getIntersections(event, container, sceneType).forEach(el => {
                const tileName = el && el.object && el.object.name;
                const tileSplit = tileName.split('-');
                if (tileSplit.length === 3) {
                    const tileSpecial = this._gridCtrl.getTileDescription(Number(tileSplit[1]), Number(tileSplit[2]), 0);
                    const tileGround = this._gridCtrl.getTileDescription(Number(tileSplit[1]), Number(tileSplit[2]), 1);
                    const tileTraverse = this._gridCtrl.getTileDescription(Number(tileSplit[1]), Number(tileSplit[2]), 2);
                    const tileOverhead = this._gridCtrl.getTileDescription(Number(tileSplit[1]), Number(tileSplit[2]), 3);
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
                                    <td style="padding-bottom: 3px;">${tileGround}</td>
                                </tr>` :
                                ''
                            }
                            ${tileSpecial ? `
                                <tr>
                                    <th>Notes:&nbsp;</th>
                                    <td>${tileSpecial}</td>
                                </tr>` :
                                ''
                            }
                        </table>
                    `;
                    this._descText.update(desc);

                    if (tileSplit[0] === 'crew') {
                        this._teamCtrl.selectCrewMember(Number(tileSplit[1]), Number(tileSplit[2]));
                    }
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
            this._descTextPanel.show();
            this._stateStoredObjects.forEach(obj => obj && obj.show());
            this._stateStoredObjects.length = 0;

            this._state = prevState;
        };

        const exitSettings = (prevState: AncientRuinsState)  => {
            this._settingsCtrl.hide();
            this._descText.show();
            // this._gridCtrl.show();

            this._enableAllButtons();
            this._descTextPanel.show();
            this._stateStoredObjects.forEach(obj => obj && obj.show());
            this._stateStoredObjects.length = 0;

            this._state = prevState;
        };

        const help = () => {
            this._descText.hide();
            // this._helpCtrl.show();
            // this._gridCtrl.hide();

            this._disableAllButtons();
            this._descTextPanel.hide();
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
            this._descTextPanel.hide();
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
        this._teamCtrl.dispose();
        this._settingsCtrl.dispose();
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    public endCycle(): { [key: number]: number } {
        // Game is loading, run absolutely nothing.
        if (this._state === AncientRuinsState.loading) {
            return;
        }
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
        // Game is in landing_start mode. Freeze user team controls.
        if (this._state === AncientRuinsState.landing_start) {
            if (this._gridCtrl.endCycle(AncientRuinsState.landing_start)) {
                this._state = AncientRuinsState.leaving_start;
                this._teamCtrl.showTeam();
            }
        }
        if (this._state === AncientRuinsState.leaving_start) {
            if (this._gridCtrl.endCycle(AncientRuinsState.leaving_start)) {
                this._state = AncientRuinsState.newGame;
            }
        }

        this._gridCtrl.endCycle();
        this._teamCtrl.endCycle();

        return null;
    }
}
import {
    MeshPhongMaterial,
    PlaneGeometry,
    Scene,
    Texture } from "three";

import { SceneType } from "../../models/scene-type";
import { ControlPanel } from "../../controls/panels/control-panel";
import { getIntersections } from "../../utils/get-intersections";
import { GridCtrl, getXPos, getZPos } from "./controllers/grid-controller";
import { AncientRuinsSpecifications, TeamMember, TeamMemberDirection } from "../../models/ancient-ruins-specifications";
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
import { calculateNewCrewMemberDirection } from "./utils/calculate-new-crew-member-direction";
import { rotateCrewMember } from "./utils/rotate-crew-member";
import { RankAbbreviationsMap } from "../../utils/rank-map";
import { formatString } from "../../utils/format-string";
import { EnergyBarCtrl } from "../../controls/controllers/energy-bar-controller";
import { HealthBarCtrl } from "../../controls/controllers/health-bar-controller";

/**
 * Border value used for dev mode to see outline around text content (for positioning and sizing).
 */
// const border: string = '1px solid #FFF';
const border: string = 'none';

const walkingSpeed = 0.003;

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
     * Reference to this scene's energy bar controller.
     */
    private _energyBarCtrl: EnergyBarCtrl;

    /**
     * Tile geometry that makes up the ground tiles.
     */
    private _geometry: PlaneGeometry = new PlaneGeometry( 0.4, 0.4, 10, 10 );

    /**
     * Reference to this scene's grid controller.
     */
    private _gridCtrl: GridCtrl;

    /**
     * Reference to this scene's health bar controller.
     */
    private _healthBarCtrl: HealthBarCtrl;

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
     * Reference to this scene's tile controller.
     */
    private _tileCtrl: TileCtrl;

    /**
     * Constructor for the Ancient Ruins (Scene) class
     * @param scene             graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param ancientRuinsSpec  all the details for these ancient ruins.
     */
    constructor(scene: SceneType, ancientRuinsSpec: AncientRuinsSpecifications) {

        this._scene = scene.scene;
        this._ancientRuinsSpec = ancientRuinsSpec;

        this._loadingCtrl = new LoadingCtrl();
        this._loadingCtrl.loadingMode();
        
        this._energyBarCtrl = new EnergyBarCtrl();
        this._healthBarCtrl = new HealthBarCtrl();

        // Text, Button, and Event Listeners
        const initialize = async function(_scene: SceneType): Promise<void> {
            this._onInitialize(_scene);
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
            return GridCtrlFactory(this._scene, this._ancientRuinsSpec, this._tileCtrl)
                .then((gridCtrl) => {
                    this._gridCtrl = gridCtrl;
                    return this._loadingCtrl.getLoadWaitPromise(750, 43);
                });
        })
        // Grid controller grid values initialization.
        .then(() => {
            return this._gridCtrl.initiateGridValues().then(() => {
                return this._loadingCtrl.getLoadWaitPromise(250, 54);
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
        // Initialization clouds.
        .then(() => {
            return this._gridCtrl.initiateCloudAndLandingMeshes().then(() => {
                return this._loadingCtrl.getLoadWaitPromise(100, 75);
            });
        })
        // Team controller initialization, and creation of lower right description panel.
        .then(() => {
            this._teamCtrl = new TeamCtrl(
                this._scene,
                this._ancientRuinsSpec,
                this._gridCtrl,
                this._tileCtrl);
    
            this._descTextPanel = new PanelBase('Description Panel', this._scene, 4, 4.2, 1.2, 3.9, 4.95);
            this._descTextPanel.toggleOpacity();
            this._teamCtrl.hideTeam();
    
            return this._loadingCtrl.getLoadWaitPromise(250, 81);
        })
        // Initialization Landing zone.
        .then(() => {
            return this._gridCtrl.initiateLandingShadowMeshes().then(() => {
                return this._loadingCtrl.getLoadWaitPromise(500, 89);
            });
        })
        // Path Finder Controller initialization.
        .then(() => {
            this._pathFindingCtrl = new PathFindingCtrl(this._gridCtrl);

            return this._loadingCtrl.getLoadWaitPromise(250, 94);
        })
        // Turn off loading graphic and initiate game.
        .then(() => {
            return this._loadingCtrl.getLoadWaitPromise(750, 100);
        })
        // Loading finished. Switch screens and state.
        .then(() => {
            this._loadingCtrl.gameMode();
            this._energyBarCtrl.set(100);
            this._healthBarCtrl.set(100);
            this._state = AncientRuinsState.landing_start;
        });
    }

    /**
     * Calculates the next frame amount of movement the crew member must travel.
     * @param member crew member who's next move is being calculated.
     * @returns the x,z coordinate amounts to move in those directions.
     */
    private _calculateCrewMemberNextMove(member: TeamMember): [number, number] {
        switch(member.currDirection) {
            case TeamMemberDirection.Down: {
                return [0, walkingSpeed];
            }
            case TeamMemberDirection.Down_Left: {
                return [-walkingSpeed, walkingSpeed];
            }
            case TeamMemberDirection.Down_Right: {
                return [walkingSpeed, walkingSpeed];
            }
            case TeamMemberDirection.Left: {
                return [-walkingSpeed, 0];
            }
            case TeamMemberDirection.Right: {
                return [walkingSpeed, 0];
            }
            case TeamMemberDirection.Up: {
                return [0, -walkingSpeed];
            }
            case TeamMemberDirection.Up_Left: {
                return [-walkingSpeed, -walkingSpeed];
            }
            case TeamMemberDirection.Up_Right: {
                return [walkingSpeed, -walkingSpeed];
            }
            default: {
                console.error('_calculateCrewMemberNextMove: Impossible direction', member, member.currDirection);
            }
        }
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
     * Checks to see if crew member is close enough to center of next tile to consider it arrived.
     * @param member crew member who's position is checked against next tile in its path.
     * @returns whether or not crew member has arrived at next tile. TRUE has arrived | FALSE has not arrived.
     */
    private _hasCrewMemberArrivedAtCell(member: TeamMember): boolean {
        const currPos = member.animationMeshes[0].position;
        const tileCoords = member.path[1];

        const zDist = getZPos(tileCoords[0]) - currPos.z;
        const xDist = getXPos(tileCoords[1]) - currPos.x;

        const dist = Math.sqrt((zDist * zDist) + (xDist * xDist));

        if (dist <= walkingSpeed + 0.001) {
            return true;
        }
        return false;
    }

    /**
     * Creates all of the html elements for the first time on scene creation.
     */
    private _onInitialize(sceneType: SceneType): void {
        // DOM Events
        const container = document.getElementById('mainview');
        document.oncontextmenu = event => {
            event.preventDefault();
            
            const currTeamMember = this._teamCtrl.getCurrTeamMember();
            // If no crew member active, or in intro sequence, do nothing.
            if (currTeamMember < 0
                || this._state === AncientRuinsState.landing_start
                || this._state === AncientRuinsState.leaving_start) {
                // TODO: User notification as to why they can't move.
                return false;
            }
            // ThreeJS object intersections.
            const intersects = getIntersections(event, container, sceneType)
            for (let i = 0; i < intersects.length; i++) {
                const el = intersects[i];
                const tileName = el && el.object && el.object.name;
                const tileSplit = tileName.split('-');
                if (tileSplit.length === 3 && tileSplit[0] === 'tile') {
                    const currMember = this._ancientRuinsSpec.crew[currTeamMember];
                    let currTeamMemberTile = currMember.position;

                    // If crew member was already on the move, teleport them to last tile, and halt them, before recalculating.
                    if (currMember.isMoving) {
                        currMember.isMoving = false;
                        // Calculate which is closer: previous cell, or next cell.
                        const currX = currMember.animationMeshes[0].position.x;
                        const currZ = currMember.animationMeshes[0].position.z;
                        const prevX = getXPos(currTeamMemberTile[1]);
                        const prevZ = getZPos(currTeamMemberTile[0]);
                        const prevXDiff = prevX - currX;
                        const prevZDiff = prevZ - currZ;
                        const nextTile = (currMember.path[0][0] === currTeamMemberTile[0] && currMember.path[0][1] === currTeamMemberTile[1])
                            ? currMember.path[1] : currMember.path[0];
                        const nextX = getXPos(nextTile[1]);
                        const nextZ = getZPos(nextTile[0]);
                        const nextXDiff = nextX - currX;
                        const nextZDiff = nextZ - currZ;
                        const prevDist = Math.sqrt((prevXDiff * prevXDiff) + (prevZDiff * prevZDiff));
                        const nextDist = Math.sqrt((nextXDiff * nextXDiff) + (nextZDiff * nextZDiff));
                        this._gridCtrl.updateCrewInGrid(currTeamMemberTile[0], currTeamMemberTile[1], -1);
                        if (prevDist < nextDist) {
                            this._teamCtrl.teleportCrewMember(currMember, prevX, prevZ);
                            this._gridCtrl.updateCrewInGrid(currTeamMemberTile[0], currTeamMemberTile[1], currMember);
                        } else {
                            this._teamCtrl.teleportCrewMember(currMember, nextX, nextZ);
                            this._gridCtrl.updateCrewInGrid(nextTile[0], nextTile[1], currMember);
                            currMember.position = nextTile.slice() as [number, number];
                        }
                        currMember.path.length = 0;
                        currTeamMemberTile = currMember.position;
                    }
                    
                    const shortestPath = this._pathFindingCtrl.getShortestPath(
                        currTeamMemberTile[0],
                        currTeamMemberTile[1],
                        Number(tileSplit[1]), Number(tileSplit[2]));
                    
                    if (shortestPath.length >= 2) {
                        currMember.isMoving = true;
                        currMember.path = shortestPath;

                        // Player has a new tile to head towards. Calculate direction to face.
                        const vertDir = currMember.path[1][0] - currTeamMemberTile[0];
                        const horrDir = currMember.path[1][1] - currTeamMemberTile[1];

                        currMember.currDirection = calculateNewCrewMemberDirection(horrDir, vertDir);
                        rotateCrewMember(currMember);

                        const desc = `
                            <table>
                                <tr>
                                    <td style="padding-bottom: 3px;">${formatString(this._tileCtrl.getGridDicDescription(currMember.tileValue), `(${RankAbbreviationsMap[currMember.rank]})`, currMember.name)} is moving...</td>
                                </tr>
                            </table>
                        `;
                        this._descText.update(desc);

                        console.log('Shortest Path: ', shortestPath);
                    } else {
                        // TODO: User notification that the tile they chose can't be reached.
                    }
                    return false;
                }
            };
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
                    
                    if (tileSplit[0] === 'tile') {
                        this._teamCtrl.selectCrewMember(Number(tileSplit[1]), Number(tileSplit[2]));
                        this._energyBarCtrl.set(this._ancientRuinsSpec.crew[this._teamCtrl.getCurrTeamMember()].energy);
                        this._energyBarCtrl.show();
                        this._healthBarCtrl.set(this._ancientRuinsSpec.crew[this._teamCtrl.getCurrTeamMember()].health);
                        this._healthBarCtrl.show();
                    }
                }
            });
        };

        document.onmousemove = event => { };

        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        this._healthBarCtrl.reposition(this._teamCtrl && this._teamCtrl.getCurrTeamMember() >= 0, {
            height: (height * 0.02),
            left: left + (width * 0.01),
            top: (height * 0.005),
            width: (width * 0.1)
        });
        this._energyBarCtrl.reposition(this._teamCtrl && this._teamCtrl.getCurrTeamMember() >= 0, {
            height: (height * 0.02),
            left: left + (width * 0.01),
            top: (height * 0.02),
            width: (width * 0.1)
        });

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

        this._settingsCtrl = new SettingsCtrl(this._scene, border);
        this._energyBarCtrl.hide();
        this._healthBarCtrl.hide();
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

        this._healthBarCtrl.reposition(this._teamCtrl && this._teamCtrl.getCurrTeamMember() >= 0, {
            height: (height * 0.02),
            left: left + (width * 0.02),
            top: (height * 0.005),
            width: (width * 0.1)
        });
        this._energyBarCtrl.reposition(this._teamCtrl && this._teamCtrl.getCurrTeamMember() >= 0, {
            height: (height * 0.02),
            left: left + (width * 0.02),
            top: (height * 0.02),
            width: (width * 0.1)
        });
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
        this._energyBarCtrl.hide();
        this._healthBarCtrl.hide();
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


        this._ancientRuinsSpec.crew
            .filter(member => member.isMoving)
            .forEach((member, index) => {
                // Crew member has arrived at next cell in its path. Update position and shed last tile in path.
                if (this._hasCrewMemberArrivedAtCell(member)) {
                    this._gridCtrl.updateCrewInGrid(member.path[0][0], member.path[0][1], -1);
                    member.path.shift();
                    member.position = member.path[0].slice() as [number, number];
                    this._gridCtrl.updateCrewInGrid(member.path[0][0], member.path[0][1], member);
                    const xPos = getXPos(member.position[1]);
                    const zPos = getZPos(member.position[0]);
                    this._teamCtrl.teleportCrewMember(member, xPos, zPos);
                // Still in between tiles, move a little closer to next tile.
                } else {
                    const nextMove = this._calculateCrewMemberNextMove(member);
                    this._teamCtrl.moveCrewMember(member, nextMove[0], nextMove[1]);
                    return;
                }

                if (!member.path.length) {
                    console.error('This never should have happened!!!', member);
                }

                // Crew member has arrived at the intended destination. Stop moving.
                if (member.path.length === 1) {
                    member.position = member.path.shift();
                    member.path.shift();
                    member.isMoving = false;
                    const desc = `
                            <table>
                                <tr>
                                    <td style="padding-bottom: 3px;">${formatString(this._tileCtrl.getGridDicDescription(member.tileValue), `(${RankAbbreviationsMap[member.rank]})`, member.name)} has arrived.</td>
                                </tr>
                            </table>
                        `;
                        this._descText.update(desc);
                    return;
                }

                // Player has a new tile to head towards. Calculate direction to face.
                const vertDir = member.path[1][0] - member.position[0];
                const horrDir = member.path[1][1] - member.position[1];

                member.currDirection = calculateNewCrewMemberDirection(horrDir, vertDir);
                rotateCrewMember(member);
            });
        this._gridCtrl.endCycle();
        this._teamCtrl.endCycle();

        return null;
    }
}
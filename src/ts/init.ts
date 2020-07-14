import {
    Audio,
    AudioListener,
    AudioLoader,
    Font,
    FontLoader,
    Raycaster,
    TextureLoader,
    Texture} from 'three';

import { SceneType } from './models/scene-type';
import { SOUNDS_CTRL } from './controls/controllers/sounds-controller';
import { Menu } from './scenes/main-menu/menu';
import { Intro } from './scenes/intro/intro';
import { ShipLayout } from './scenes/ship-layout/ship-layout';
import { DevMenu } from './scenes/dev-menu/dev-menu';
import { ENVIRONMENT } from './environment';
import { LandAndMine } from './scenes/land-and-mine/land-and-mine';
import { PlanetSpecifications, OreTypes, OreQuantity, PlanetLandTypes, SkyTypes } from './models/planet-specifications';
import { LanderSpecifications } from './models/lander-specifications';
import * as stats from 'stats.js';
import { AncientRuins } from './scenes/ancient-ruins/ancient-ruins';
import { AncientRuinsSpecifications } from './models/ancient-ruins-specifications';
import { createSceneModule } from './utils/create-scene-module';
import { getIntersections } from './utils/get-intersections';
import { ASSETS_CTRL } from './controls/controllers/assets-controller';
const statsPanel = new stats();

const scenes: { [ key: string ]: SceneType } = {
    ancientRuins: {
        active: false,
        camera: null,
        instance: null,
        raycaster: null,
        renderer: null,
        scene: null
    },
    devMenu: {
        active: false,
        camera: null,
        instance: null,
        raycaster: null,
        renderer: null,
        scene: null
    },
    intro: {
        active: false,
        camera: null,
        instance: null,
        raycaster: null,
        renderer: null,
        scene: null
    },
    landAndMine: {
        active: false,
        camera: null,
        instance: null,
        raycaster: null,
        renderer: null,
        scene: null
    },
    menu: {
        active: false,
        camera: null,
        instance: null,
        raycaster: null,
        renderer: null,
        scene: null
    },
    shipLayout: {
        active: false,
        camera: null,
        instance: null,
        raycaster: null,
        renderer: null,
        scene: null
    }
};

/**
 * Loads the dev menu with all the mini games and game sections separated as testable/playable games.
 */
const loadDevMenu = () => {
    const sceneMod = createSceneModule(scenes.devMenu);

    window.addEventListener( 'resize', sceneMod.onWindowResizeRef, false);
    // Click event listeners that activates certain menu options.
    const activateAncientRuinsScene = (ancientRuinsSpec: AncientRuinsSpecifications) => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
        sceneMod.container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadAncientRuinsScene(ancientRuinsSpec);
        }, 50);
    };
    const activateIntroScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
        sceneMod.container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadIntroScene();
        }, 50);
    };
    const activateGameMenu = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
        sceneMod.container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadGameMenu();
        }, 50);
    };
    const activateRepairScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
        sceneMod.container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            // loadRepairScene();
        }, 50);
    };
    const activateShipLayoutScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
        sceneMod.container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadShipLayoutScene();
        }, 50);
    };
    const activateTravelScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
        sceneMod.container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            // loadTravelScene();
        }, 50);
    };
    const activateVertexMapScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
        sceneMod.container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            // loadVertexMapScene();
        }, 50);
    };
    const activateLandAndMineScene = (planetSpec: PlanetSpecifications, landerSpec: LanderSpecifications) => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
        sceneMod.container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadLandAndMineScene(planetSpec, landerSpec);
        }, 50);
    };
    const activatePlanetRaid = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
        sceneMod.container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            // loadPlanetRaidScene();
        }, 50);
    };
    const raycaster = new Raycaster();
    scenes.devMenu.instance = new DevMenu(
        scenes.devMenu,
        {
            activateAncientRuinsScene,
            activateGameMenu,
            activateIntroScene,
            activateLandAndMineScene,
            activatePlanetRaid,
            activateRepairScene,
            activateShipLayoutScene,
            activateTravelScene,
            activateVertexMapScene
        });
    scenes.devMenu.raycaster = raycaster;
    
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (scenes.devMenu.active) {
            scenes.devMenu.instance.endCycle();
        } else {
            scenes.devMenu.instance.dispose();
            scenes.devMenu.camera = null;
            scenes.devMenu.instance = null;
            scenes.devMenu.raycaster = null;
            scenes.devMenu.renderer = null;
            scenes.devMenu.scene = null;
            return;
        }
        scenes.devMenu.renderer.render( scenes.devMenu.scene, scenes.devMenu.camera );
        requestAnimationFrame( render );
    };
    // Kick off the first render loop iteration.
    scenes.devMenu.renderer.render( scenes.devMenu.scene, scenes.devMenu.camera );
    requestAnimationFrame( render );
};

/**
 * Loads the game menu with the actual gameplay starting point
 */
const loadGameMenu = () => {
    const sceneMod = createSceneModule(scenes.menu, true);

    // Click event listener that activates certain menu options.
    const raycaster = new Raycaster();
    document.onclick = event => {
        event.preventDefault();

        // Detection for player clicked on menu option.
        const thingsTouched = getIntersections(event, sceneMod.container, scenes.menu);
        thingsTouched.forEach(el => {
            if (el.object.name === 'Start') {
                const difficulty = scenes.menu.instance.pressedStart();
                setTimeout(() => {
                    scenes.menu.active = false;
                    window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                    sceneMod.container.removeChild( (scenes.menu.renderer as any).domElement );
                    loadLandAndMineScene(
                        {
                            gravity: 0.0001,
                            hasWater: true,
                            isFrozen: false,
                            isLife: true,
                            ore: OreTypes.Gold,
                            oreQuantity: OreQuantity.Average,
                            peakElevation: 3,
                            planetBase: PlanetLandTypes.Red,
                            skyBase: SkyTypes.Blue,
                            wind: 0
                        },
                        {
                            drillLength: 5,
                            fuelBurn: 0.05,
                            horizontalCrashMargin: 0.001,
                            oxygenBurn: 0.02,
                            verticalCrashMargin: 0.01
                        }
                    );
                }, 750);
                SOUNDS_CTRL.playBidooo();
                return;
            } else if (el.object.name === 'Load Code') {
                setTimeout(() => {
                    scenes.menu.active = false;
                    window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                    sceneMod.container.removeChild( (scenes.menu.renderer as any).domElement );
                    // loadGame(1);
                }, 250);
                SOUNDS_CTRL.playBidooo();
                return;
            } else if (el.object.name === 'Easy') {
                scenes.menu.instance.changeDifficulty(0);
                SOUNDS_CTRL.playBidooo();
                return;
            } else if (el.object.name === 'Normal') {
                scenes.menu.instance.changeDifficulty(1);
                SOUNDS_CTRL.playBidooo();
                return;
            } else if (el.object.name === 'Hard') {
                scenes.menu.instance.changeDifficulty(2);
                SOUNDS_CTRL.playBidooo();
                return;
            } else if (el.object.name === 'Hardcore') {
                scenes.menu.instance.changeDifficulty(3);
                SOUNDS_CTRL.playBidooo();
                return;
            } else if (el.object.name === 'Load') {
                scenes.menu.instance.pressedLoad();
                SOUNDS_CTRL.playBidooo();
                return;
            } else if (el.object.name === 'Help') {
                scenes.menu.instance.pressedHelp();
                SOUNDS_CTRL.playBidooo();
                return;
            } else if (el.object.name === 'On') {
                scenes.menu.instance.pressedOn();
                return;
            } else if (el.object.name === 'Off') {
                scenes.menu.instance.pressedOff();
                return;
            } else if (el.object.name === 'Return Help') {
                scenes.menu.instance.returnToMainMenu();
                SOUNDS_CTRL.playBidooo();
                return;
            } else if (el.object.name === 'Return Load') {
                scenes.menu.instance.returnToMainMenu();
                SOUNDS_CTRL.playBidooo();
                return;
            }
        });
    };
    scenes.menu.instance = new Menu(scenes.menu);
    scenes.menu.raycaster = raycaster;

    const render = () => {
        if (scenes.menu.active) {
            scenes.menu.instance.endCycle();
            scenes.menu.renderer.render( scenes.menu.scene, scenes.menu.camera );
            requestAnimationFrame( render );
        }
    };
    // Kick off the first render loop iteration.
    scenes.menu.renderer.render( scenes.menu.scene, scenes.menu.camera );
	requestAnimationFrame( render );
};

/**
 * Environment specific menu.
 * Dev environment loads Dev menu, while Prod environment loads regular menu.
 */
const loadMenu = ENVIRONMENT === 'production' ? loadGameMenu : loadDevMenu;

/**
 * Game's intro scene. Only starts when all assets are finished loading.
 */
const loadIntroScene = () => {
    const sceneMod = createSceneModule(scenes.intro);

    // Click event listener to register user click.
    const raycaster = new Raycaster();
    document.onclick = event => {
        event.preventDefault();
        const thingsTouched = getIntersections(event, sceneMod.container, scenes.intro);
        // Detection for player clicked on pause button
        thingsTouched.forEach(el => {
            if (el.object.name === 'Click Barrier') {
                SOUNDS_CTRL.playBidooo();
                scenes.intro.active = false;
                loadMenu();
                return;
            }
        });
    };

    // Create instance of game section.
    const intro = new Intro(scenes.intro);
    scenes.intro.raycaster = raycaster;

    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.intro.active) {
            intro.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
            sceneMod.container.removeChild( (scenes.intro.renderer as any).domElement );
            // Clear up memory used by intro scene.
            scenes.intro.camera = null;
            scenes.intro.instance = null;
            scenes.intro.raycaster = null;
            scenes.intro.renderer = null;
            scenes.intro.scene = null;
            return;
        } else {
            if (intro.endCycle()) {
                intro.dispose();
                scenes.intro.active = false;
                // Remove renderer from the html container, and remove event listeners.
                window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                sceneMod.container.removeChild( (scenes.intro.renderer as any).domElement );
                // Clear up memory used by intro scene.
                scenes.intro.camera = null;
                scenes.intro.instance = null;
                scenes.intro.raycaster = null;
                scenes.intro.renderer = null;
                scenes.intro.scene = null;
                loadMenu();
                return;
            }
        }
        scenes.intro.renderer.render( scenes.intro.scene, scenes.intro.camera );
        requestAnimationFrame( render );
    };
    // Kick off the first render loop iteration.
    scenes.intro.renderer.render( scenes.intro.scene, scenes.intro.camera );
	requestAnimationFrame( render );
};

/**
 * Game's intro scene. Only starts when all assets are finished loading.
 */
const loadAncientRuinsScene = (ancientRuinsSpec: AncientRuinsSpecifications) => {
    const sceneMod = createSceneModule(scenes.ancientRuins);

    // Click event listener to register user click.
    const raycaster = new Raycaster();
    const ancientRuins = new AncientRuins(scenes.ancientRuins, ancientRuinsSpec);
    scenes.ancientRuins.raycaster = raycaster;
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.ancientRuins.active) {
            ancientRuins.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
            sceneMod.container.removeChild( (scenes.ancientRuins.renderer as any).domElement );
            // Clear up memory used by ancientRuins scene.
            scenes.ancientRuins.camera = null;
            scenes.ancientRuins.instance = null;
            scenes.ancientRuins.raycaster = null;
            scenes.ancientRuins.renderer = null;
            scenes.ancientRuins.scene = null;
            statsPanel.end();
            return;
        } else {
            statsPanel.update();
            const output: any = ancientRuins.endCycle();
            if (output) {
                console.log('Output', output);
                ancientRuins.dispose();
                scenes.ancientRuins.active = false;
                window.alert(output);
                // Remove renderer from the html container, and remove event listeners.
                window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                sceneMod.container.removeChild( (scenes.ancientRuins.renderer as any).domElement );
                // Clear up memory used by ancientRuins scene.
                scenes.ancientRuins.camera = null;
                scenes.ancientRuins.instance = null;
                scenes.ancientRuins.raycaster = null;
                scenes.ancientRuins.renderer = null;
                scenes.ancientRuins.scene = null;
                statsPanel.end();
                setTimeout(() => {
                    loadMenu();
                }, 10);
                return;
            }
        }
        scenes.ancientRuins.renderer.render( scenes.ancientRuins.scene, scenes.ancientRuins.camera );
        requestAnimationFrame( render );
    };
    statsPanel.begin();
    // Kick off the first render loop iteration.
    scenes.ancientRuins.renderer.render( scenes.ancientRuins.scene, scenes.ancientRuins.camera );
	requestAnimationFrame( render );
};

/**
 * Game's intro scene. Only starts when all assets are finished loading.
 */
const loadLandAndMineScene = (planetSpec: PlanetSpecifications, landerSpec: LanderSpecifications) => {
    const sceneMod = createSceneModule(scenes.landAndMine);

    // Click event listener to register user click.
    const raycaster = new Raycaster();
    const landAndMine = new LandAndMine(scenes.landAndMine, planetSpec, landerSpec);
    scenes.landAndMine.raycaster = raycaster;
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.landAndMine.active) {
            landAndMine.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
            sceneMod.container.removeChild( (scenes.landAndMine.renderer as any).domElement );
            // Clear up memory used by landAndMine scene.
            scenes.landAndMine.camera = null;
            scenes.landAndMine.instance = null;
            scenes.landAndMine.raycaster = null;
            scenes.landAndMine.renderer = null;
            scenes.landAndMine.scene = null;
            return;
        } else {
            statsPanel.begin();
            const layout: { [key: number]: number } = landAndMine.endCycle();
            statsPanel.end();
            if (layout) {
                let output = `Loot received:
                    Lander = ${layout[-3]},
                    Crew = ${layout[-2] > 0 ? '+': ''}${layout[-2]},
                    Food = ${layout[-1]},
                    Water = ${layout[0]}`;
                Object.keys(layout).filter(key => Number(key) > 0).forEach(key => {
                    output += `,
                    ${OreTypes[Number(key)]} = ${layout[Number(key)]}`;
                });
                landAndMine.dispose();
                scenes.landAndMine.active = false;
                window.alert(output);
                // Remove renderer from the html container, and remove event listeners.
                window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                sceneMod.container.removeChild( (scenes.landAndMine.renderer as any).domElement );
                // Clear up memory used by landAndMine scene.
                scenes.landAndMine.camera = null;
                scenes.landAndMine.instance = null;
                scenes.landAndMine.raycaster = null;
                scenes.landAndMine.renderer = null;
                scenes.landAndMine.scene = null;
                setTimeout(() => {
                    loadMenu();
                }, 10);
                return;
            }
        }
        scenes.landAndMine.renderer.render( scenes.landAndMine.scene, scenes.landAndMine.camera );
        requestAnimationFrame( render );
    };
    // Kick off the first render loop iteration.
    scenes.landAndMine.renderer.render( scenes.landAndMine.scene, scenes.landAndMine.camera );
	requestAnimationFrame( render );
};

/**
 * Game's intro scene. Only starts when all assets are finished loading.
 */
const loadShipLayoutScene = () => {
    const sceneMod = createSceneModule(scenes.shipLayout);

    // Click event listener to register user click.
    const raycaster = new Raycaster();
    const shipLayout = new ShipLayout(scenes.shipLayout);
    scenes.shipLayout.raycaster = raycaster;
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.shipLayout.active) {
            shipLayout.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
            sceneMod.container.removeChild( (scenes.shipLayout.renderer as any).domElement );
            // Clear up memory used by shipLayout scene.
            scenes.shipLayout.camera = null;
            scenes.shipLayout.instance = null;
            scenes.shipLayout.raycaster = null;
            scenes.shipLayout.renderer = null;
            scenes.shipLayout.scene = null;
            return;
        } else {
            const layout = shipLayout.endCycle();
            if (layout) {
                console.log("Chosen Layout: ", layout);
                shipLayout.dispose();
                scenes.shipLayout.active = false;
                // Remove renderer from the html container, and remove event listeners.
                window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                sceneMod.container.removeChild( (scenes.shipLayout.renderer as any).domElement );
                // Clear up memory used by shipLayout scene.
                scenes.shipLayout.camera = null;
                scenes.shipLayout.instance = null;
                scenes.shipLayout.raycaster = null;
                scenes.shipLayout.renderer = null;
                scenes.shipLayout.scene = null;
                setTimeout(() => {
                    loadMenu();
                }, 10);
                return;
            }
        }
        scenes.shipLayout.renderer.render( scenes.shipLayout.scene, scenes.shipLayout.camera );
        requestAnimationFrame( render );
    };
    // Kick off the first render loop iteration.
    scenes.shipLayout.renderer.render( scenes.shipLayout.scene, scenes.shipLayout.camera );
	requestAnimationFrame( render );
};

/**
 * Called by DOM when page is finished loading. Now load assets, then the game.
 */
export default () => {
    const ldBar = document.getElementsByClassName('ldBar')[0];
    ldBar.classList.remove('ldBar-fat');
    ldBar.classList.remove('ldBar-skinny');

    let WIDTH = window.innerWidth * 0.99;
    let HEIGHT = window.innerHeight * 0.99;
    if(WIDTH < HEIGHT) {
        HEIGHT = WIDTH;
        ldBar.classList.add('ldBar-skinny');
    } else {
        WIDTH = HEIGHT;
        ldBar.classList.add('ldBar-fat');
    }

    const loading = document.getElementById('loading');
    loading.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
    loading.style.width = WIDTH + 'px';
    loading.style.height = HEIGHT + 'px';

    ASSETS_CTRL.init(loadDevMenu);
}
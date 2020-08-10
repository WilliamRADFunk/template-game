import { ASSETS_CTRL } from './controls/controllers/assets-controller';

import { AncientRuinsSpecifications } from './models/ancient-ruins-specifications';
import { LanderSpecifications } from './models/lander-specifications';
import { SceneType } from './models/scene-type';

import { AncientRuins } from './scenes/ancient-ruins/ancient-ruins';
import { DevMenu } from './scenes/dev-menu/dev-menu';
import { Intro } from './scenes/cut-scenes/intro/intro';
import { LandAndMine } from './scenes/land-and-mine/land-and-mine';
import { Menu } from './scenes/main-menu/menu';
import { ShipLayout } from './scenes/ship-layout/ship-layout';

import { ENVIRONMENT } from './environment';
import { PlanetSpecifications, OreTypes, OreQuantity, PlanetLandTypes, SkyTypes } from './models/planet-specifications';

import * as stats from 'stats.js';

import { createSceneModule } from './utils/create-scene-module';
import { disposeScene } from './utils/dispose-scene';
import { adjustWindowDimensions } from './utils/on-window-resize';

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
    
    // Create instance of game section.
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
    
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (scenes.devMenu.active) {
            scenes.devMenu.instance.endCycle();
        } else {
            scenes.devMenu.instance.dispose();
            // Clear up memory used by dev menu scene.
            disposeScene(scenes.devMenu);
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
    // Create instance of game section.
    scenes.menu.instance = new Menu(scenes.menu);

    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (scenes.menu.instance.endCycle()) {
            setTimeout(() => {
                scenes.menu.instance.dispose();
                window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                sceneMod.container.removeChild( (scenes.menu.renderer as any).domElement );
                // Clears up memory used by menu scene.
                disposeScene(scenes.menu);

                // TODO: Load ship lost in wormhole scene. For now, launch most recently completed mini-section.
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
        } else {
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
    // Create instance of game section.
    scenes.intro.instance = new Intro(scenes.intro);

    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (scenes.intro.instance.endCycle()) {
            scenes.intro.instance.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
            sceneMod.container.removeChild( (scenes.intro.renderer as any).domElement );
            // Clear up memory used by intro scene.
            disposeScene(scenes.intro);
            // Always launch menu after intro is complete.
            loadMenu();
            return;
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
    // Create instance of game section.
    scenes.ancientRuins.instance = new AncientRuins(scenes.ancientRuins, ancientRuinsSpec);

    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.ancientRuins.active) {
            scenes.ancientRuins.instance.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
            sceneMod.container.removeChild( (scenes.ancientRuins.renderer as any).domElement );
            // Clear up memory used by ancientRuins scene.
            disposeScene(scenes.ancientRuins);
            statsPanel.end();
            return;
        } else {
            statsPanel.update();
            const output: any = scenes.ancientRuins.instance.endCycle();
            if (output) {
                console.log('Output', output);
                scenes.ancientRuins.instance.dispose();
                scenes.ancientRuins.active = false;
                window.alert(output);
                // Remove renderer from the html container, and remove event listeners.
                window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                sceneMod.container.removeChild( (scenes.ancientRuins.renderer as any).domElement );
                // Clear up memory used by ancientRuins scene.
                disposeScene(scenes.ancientRuins);
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
    // Create instance of game section.
    scenes.landAndMine.instance = new LandAndMine(scenes.landAndMine, planetSpec, landerSpec);

    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.landAndMine.active) {
            scenes.landAndMine.instance.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
            sceneMod.container.removeChild( (scenes.landAndMine.renderer as any).domElement );
            // Clear up memory used by landAndMine scene.
            disposeScene(scenes.landAndMine);
            return;
        } else {
            statsPanel.begin();
            const layout: { [key: number]: number } = scenes.landAndMine.instance.endCycle();
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
                scenes.landAndMine.instance.dispose();
                scenes.landAndMine.active = false;
                window.alert(output);
                // Remove renderer from the html container, and remove event listeners.
                window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                sceneMod.container.removeChild( (scenes.landAndMine.renderer as any).domElement );
                // Clear up memory used by landAndMine scene.
                disposeScene(scenes.landAndMine);
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
    // Create instance of game section.
    scenes.shipLayout.instance = new ShipLayout(scenes.shipLayout);

    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.shipLayout.active) {
            scenes.shipLayout.instance.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
            sceneMod.container.removeChild( (scenes.shipLayout.renderer as any).domElement );
            // Clear up memory used by shipLayout scene.
            disposeScene(scenes.shipLayout);
            return;
        } else {
            const layout = scenes.shipLayout.instance.endCycle();
            if (layout) {
                console.log("Chosen Layout: ", layout);
                scenes.shipLayout.instance.dispose();
                scenes.shipLayout.active = false;
                // Remove renderer from the html container, and remove event listeners.
                window.removeEventListener( 'resize', sceneMod.onWindowResizeRef, false);
                sceneMod.container.removeChild( (scenes.shipLayout.renderer as any).domElement );
                // Clear up memory used by shipLayout scene.
                disposeScene(scenes.shipLayout);
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
    adjustWindowDimensions();

    ASSETS_CTRL.init(loadDevMenu); // TODO: Add ability to read game load code from url query param.
}
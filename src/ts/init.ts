import {
    AmbientLight,
    Audio,
    AudioBuffer,
    AudioListener,
    AudioLoader,
    CanvasRenderer,
    DoubleSide,
    Font,
    FontLoader,
    Mesh,
    MeshBasicMaterial,
    OrthographicCamera,
    PlaneGeometry,
    Raycaster,
    Scene,
    TextureLoader,
    WebGLRenderer,
    Vector2,
    Texture} from 'three';

import { SceneType } from './models/scene-type';
import { SoundinatorSingleton } from './soundinator';
import { Menu } from './scenes/main-menu/menu';
import { Intro } from './scenes/intro/intro';
import { ShipLayout } from './scenes/ship-layout/ship-layout';
import { DevMenu } from './scenes/dev-menu/dev-menu';
import { ENVIRONMENT } from './environment';
import { LandAndMine } from './scenes/land-and-mine.ts/land-and-mine';
import { PlanetSpecifications } from './models/planet-specifications';

/**
 * Loads the graphic for asteroid.
 */
const asteroidLoader = new TextureLoader();
/**
 * The loaded texture, used for the asteroids.
 */
let asteroidTexture: Texture;
/**
 * Loads the graphic for astronaut1.
 */
const astronaut1Loader = new TextureLoader();
/**
 * The loaded texture, used for the astronaut1.
 */
let astronaut1Texture: Texture;
/**
 * The thing that hears sound.
 */
const audioListener: AudioListener = new AudioListener();
/**
 * Loads the graphic for earth.
 */
const earthLoader = new TextureLoader();
/**
 * The loaded texture, used for the earth.
 */
let earthTexture: Texture;
/**
 * Loads the graphic for enceladus.
 */
const enceladusLoader = new TextureLoader();
/**
 * The loaded texture, used for the enceladus.
 */
let enceladusTexture: Texture;
/**
 * Loads the graphic for ship layout dialogue.
 */
const engineerProfileLoader = new TextureLoader();
/**
 * The loaded texture, used for the ship layout dialogue.
 */
let engineerProfileTexture: Texture;
/**
 * Loads the graphic for ship layout dialogue.
 */
const engineer2ProfileLoader = new TextureLoader();
/**
 * The loaded texture, used for the ship layout dialogue.
 */
let engineer2ProfileTexture: Texture;
/**
 * Loads the graphic for enzmann.
 */
const enzmannLayoutLoader = new TextureLoader();
/**
 * The loaded texture, used for the enzmann.
 */
let enzmannLayoutTexture: Texture;
/**
 * Loads the graphic for enzmann.
 */
const enzmannOutsideLoader = new TextureLoader();
/**
 * The loaded texture, used for the enzmann.
 */
let enzmannOutsideTexture: Texture;
/**
 * Loads the graphic for fire.
 */
const fireLoader = new TextureLoader();
/**
 * The loaded texture, used for the fire.
 */
let fireTexture: Texture;
/**
 * Loads the font from a json file.
 */
const fontLoader = new FontLoader();
/**
 * The loaded font, used for the scoreboard.
 */
let gameFont: Font;
/**
 * Loads the graphic for mars.
 */
const marsLoader = new TextureLoader();
/**
 * The loaded texture, used for the mars.
 */
let marsTexture: Texture;
/**
 * Loads the graphic for miningEquipment1.
 */
const miningEquipment1Loader = new TextureLoader();
/**
 * The loaded texture, used for the miningEquipment1.
 */
let miningEquipment1Texture: Texture;
/**
 * Loads the graphic for miningEquipment2.
 */
const miningEquipment2Loader = new TextureLoader();
/**
 * The loaded texture, used for the miningEquipment2.
 */
let miningEquipment2Texture: Texture;
/**
 * Loads the graphic for miningDrill.
 */
const miningDrillLoader = new TextureLoader();
/**
 * The loaded texture, used for the miningDrill.
 */
let miningDrillTexture: Texture;
/**
 * Loads the graphic for minedSquare1.
 */
const minedSquare1Loader = new TextureLoader();
/**
 * The loaded texture, used for the minedSquare1.
 */
let minedSquare1Texture: Texture;

const scenes: { [ key: string ]: SceneType } = {
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
 * Loads the graphic for ship.
 */
const shipLoader = new TextureLoader();
/**
 * The loaded texture, used for the ships.
 */
let shipTexture: Texture;
/**
 * Sound file paths
 */
const soundPaths: string[] = [
    /**
     * Bomb Exploding Sound
     * http://soundbible.com/1986-Bomb-Exploding.html
     * license: Attribution 3.0
     * Recorded by: Sound Explorer
     */
    'assets/audio/boom.mp3',
    /**
     * Click On Sound
     * http://soundbible.com/1280-Click-On.html
     * license: Attribution 3.0
     * Recorded by: Mike Koenig
     */
    'assets/audio/click.mp3',
    /**
    * Tank Firing Sound
    * http://soundbible.com/1326-Tank-Firing.html
    * license: Attribution 3.0
    * Recorded by: snottyboy
    */
    'assets/audio/fire.mp3',
    /**
    * Metroid Door Sound
    * http://soundbible.com/1858-Metroid-Door.html
    * license: Attribution 3.0
    * Recorded by: Brandino480
    */
    'assets/audio/shield-down.mp3',
    /**
    * Power Up Ray Sound
    * http://soundbible.com/1636-Power-Up-Ray.html
    * license: Noncommercial 3.0
    * Recorded by: Mike Koenig
    */
    'assets/audio/shield-up.mp3',
    /**
    * Strange Noise Sound
    * http://soundbible.com/1636-Power-Up-Ray.html
    * license: Noncommercial 3.0
    * Recorded by: Mike Koenig
    */
    'assets/audio/saucer.mp3',
    /**
    * Beep Ping Sound
    * http://soundbible.com/1133-Beep-Ping.html
    * license: Attribution 3.0
    * Recorded by: Mike Koenig
    */
    'assets/audio/drone.mp3',
    /**
    * Ta Da Sound
    * http://soundbible.com/1003-Ta-Da.html
    * license: Attribution 3.0
    * Recorded by: Mike Koenig
    */
    'assets/audio/regen.mp3',
    /**
    * Gunfire In Crowd Sound
    * http://soundbible.com/1608-Gunfire-In-Crowd.html
    * license: Public Domain
    * Recorded by: KevanGC
    */
    'assets/audio/base-lost.mp3',
    /**
    * Beam Me Up Scotty Sound
    * http://soundbible.com/256-Beam-Me-Up-Scotty.html
    * license: Personal Use Only
    * Recorded by: N/A
    */
    'assets/audio/game-over.mp3'
];
/**
 * Loads the audio files.
 */
const soundLoaders: AudioLoader[] = [
    new AudioLoader(),
    new AudioLoader(),
    new AudioLoader(),
    new AudioLoader(),
    new AudioLoader(),
    new AudioLoader(),
    new AudioLoader(),
    new AudioLoader(),
    new AudioLoader(),
    new AudioLoader()
];
/**
 * List of loaded audio files.
 */
const sounds: Audio[] = [];
/**
 * Passes the callback functions to font and texture loaders,
 * each fitted with their chance to check if all others are done.
 */
const loadAssets = () => {
    SoundinatorSingleton.addListener(audioListener);
    // Callback function to set the asteroid texture once it is finished loading.
    asteroidLoader.load( 'assets/images/asteroid.png', texture => {
        asteroidTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the astronaut1 texture once it is finished loading.
    astronaut1Loader.load( 'assets/images/astronaut-01.png', texture => {
        astronaut1Texture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the earth texture once it is finished loading.
    earthLoader.load( 'assets/images/earth.png', texture => {
        earthTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the enceladus texture once it is finished loading.
    enceladusLoader.load( 'assets/images/enceladus.png', texture => {
        enceladusTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the ship layout dialogue texture once it is finished loading.
    engineerProfileLoader.load( 'assets/images/ship-layout-profile.png', texture => {
        engineerProfileTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the ship layout dialogue texture once it is finished loading.
    engineer2ProfileLoader.load( 'assets/images/ship-layout-profile-2.png', texture => {
        engineer2ProfileTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the enzmannLayout texture once it is finished loading.
    enzmannLayoutLoader.load( 'assets/images/enzmann-layout.png', texture => {
        enzmannLayoutTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the enzmannOutside texture once it is finished loading.
    enzmannOutsideLoader.load( 'assets/images/enzmann-outside.png', texture => {
        enzmannOutsideTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the fire texture once it is finished loading.
    fireLoader.load( 'assets/images/fire.png', texture => {
        fireTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the mars texture once it is finished loading.
    marsLoader.load( 'assets/images/mars.png', texture => {
        marsTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the mars texture once it is finished loading.
    miningEquipment1Loader.load( 'assets/images/mining-equipment-01.png', texture => {
        miningEquipment1Texture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the miningEquipment2 texture once it is finished loading.
    miningEquipment2Loader.load( 'assets/images/mining-equipment-02.png', texture => {
        miningEquipment2Texture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the miningDrill texture once it is finished loading.
    miningDrillLoader.load( 'assets/images/mining-drill.png', texture => {
        miningDrillTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the minedSquare1 texture once it is finished loading.
    minedSquare1Loader.load( 'assets/images/mined-square-01.png', texture => {
        minedSquare1Texture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the ship texture once it is finished loading.
    shipLoader.load( 'assets/images/ship.png', texture => {
        shipTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the scoreboard font once it is finished loading.
    fontLoader.load( 'assets/fonts/Luckiest_Guy_Regular.json', font => {
        gameFont = font;
        checkAssetsLoaded();
    });
    // Get the ball rolling on each of the sound file loads.
    soundLoaders.forEach((loader, index) => {
        soundLoaders[index].load(
            soundPaths[index],
            (soundBuffer: AudioBuffer) => {
                const sound = (new Audio(audioListener)).setBuffer(soundBuffer);
                sound.setLoop(false);
                sounds[index] = sound;
                checkAssetsLoaded();
            },
            (xhr: { loaded: number; total: number;}) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error: string) => console.log(`Failed to load (${soundPaths[index].split('/').pop()}) sound file`, error)
        );
    });
};
/**
 * Checks to see if all assets are finished loaded. If so, start rendering the game.
 */
const checkAssetsLoaded = () => {
    if (gameFont &&
        asteroidTexture &&
        astronaut1Texture &&
        shipTexture &&
        earthTexture &&
        fireTexture &&
        marsTexture &&
        enceladusTexture &&
        engineerProfileTexture &&
        engineer2ProfileTexture &&
        enzmannOutsideTexture &&
        miningEquipment1Texture &&
        miningEquipment2Texture &&
        miningDrillTexture &&
        minedSquare1Texture &&
        sounds.filter(s => s).length === soundLoaders.length) {
        SoundinatorSingleton.addSounds(sounds);
        loadMenu();
    }
};
const loadDevMenu = () => {
    scenes.devMenu.active = true;
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    scenes.devMenu.scene = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    scenes.devMenu.renderer = ((window as any)['WebGLRenderingContext'])
        ? new WebGLRenderer()
        : new CanvasRenderer();
    // Make it black and size it to window.
    (scenes.devMenu.renderer as any).setClearColor(0x000000, 0);
    scenes.devMenu.renderer.setSize( WIDTH, HEIGHT );
    (scenes.devMenu.renderer as any).autoClear = false;
    // An all around brightish light that hits everything equally.
    scenes.devMenu.scene.add(new AmbientLight(0xCCCCCC));
    // Render to the html container.
    const container = document.getElementById('mainview');
	container.appendChild( (scenes.devMenu.renderer as any).domElement );
    // Set up player's ability to see the game, and focus center on planet.
    scenes.devMenu.camera =  new OrthographicCamera( -6, 6, -6, 6, 0, 100 );
	scenes.devMenu.camera.position.set(0, -20, 0);
    scenes.devMenu.camera.lookAt(scenes.devMenu.scene.position);
    scenes.devMenu.camera.add(audioListener);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.devMenu.camera and scenes.devMenu.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.devMenu.renderer.setSize( WIDTH, HEIGHT );
        document.getElementById('mainview').style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        document.getElementById('mainview').style.width = WIDTH + 'px';
        document.getElementById('mainview').style.height = HEIGHT + 'px';
    };
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false);
    // Click event listeners that activates certain menu options.
    const activateIntroScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadIntroScene();
        }, 50);
    };
    const activateGameMenu = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadGameMenu();
        }, 50);
    };
    const activateRepairScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            // loadRepairScene();
        }, 50);
    };
    const activateShipLayoutScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadShipLayoutScene();
        }, 50);
    };
    const activateTravelScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            // loadTravelScene();
        }, 50);
    };
    const activateVertexMapScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            // loadVertexMapScene();
        }, 50);
    };
    const activateLandAndMineScene = (planetSpec?: PlanetSpecifications) => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadLandAndMineScene(planetSpec);
        }, 50);
    };
    const activatePlanetRaid = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            // loadPlanetRaidScene();
        }, 50);
    };
    const raycaster = new Raycaster();
    scenes.devMenu.instance = new DevMenu(
        scenes.devMenu,
        {
            activateGameMenu,
            activateIntroScene,
            activateLandAndMineScene,
            activatePlanetRaid,
            activateRepairScene,
            activateShipLayoutScene,
            activateTravelScene,
            activateVertexMapScene
        },
        {
            engineer: engineerProfileTexture,
            engineer2: engineer2ProfileTexture,
            enzmann: enzmannOutsideTexture
        });
    scenes.devMenu.raycaster = raycaster;
    startDevMenuRendering();
};
const startDevMenuRendering = () => {
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (scenes.devMenu.active) {
            scenes.devMenu.instance.endCycle();
            scenes.devMenu.renderer.render( scenes.devMenu.scene, scenes.devMenu.camera );
            requestAnimationFrame( render );
        } else {
            scenes.devMenu.instance.dispose();
            scenes.devMenu.camera = null;
            scenes.devMenu.instance = null;
            scenes.devMenu.raycaster = null;
            scenes.devMenu.renderer = null;
            scenes.devMenu.scene = null;
        }
    };
    // Kick off the first render loop iteration.
    scenes.devMenu.renderer.render( scenes.devMenu.scene, scenes.devMenu.camera );
	requestAnimationFrame( render );
};
const loadGameMenu = () => {
    scenes.menu.active = true;
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    scenes.menu.scene = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    scenes.menu.renderer = ((window as any)['WebGLRenderingContext']) ?
        new WebGLRenderer() : new CanvasRenderer();
    // Make it black and size it to window.
    (scenes.menu.renderer as any).setClearColor(0x000000, 0);
    scenes.menu.renderer.setSize( WIDTH, HEIGHT );
    (scenes.menu.renderer as any).autoClear = false;
    // Render to the html container.
    const container = document.getElementById('mainview');
	container.appendChild( (scenes.menu.renderer as any).domElement );
    // Set up player's ability to see the game, and focus center on planet.
    scenes.menu.camera =  new OrthographicCamera( -6, 6, -6, 6, 0, 100 );
	scenes.menu.camera.position.set(0, -20, 0);
    scenes.menu.camera.lookAt(scenes.menu.scene.position);
    scenes.menu.camera.add(audioListener);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.menu.camera and scenes.menu.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.menu.renderer.setSize( WIDTH, HEIGHT );
        document.getElementById('mainview').style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        document.getElementById('mainview').style.width = WIDTH + 'px';
        document.getElementById('mainview').style.height = HEIGHT + 'px';
    };
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false);
    // Click event listener that activates certain menu options.
    const raycaster = new Raycaster();
    document.onclick = event => {
        const mouse = new Vector2();
        event.preventDefault();
        // Gets accurate click positions using css and raycasting.
        const position = {
            left: container.offsetLeft,
            top: container.offsetTop
        };
        const scrollUp = document.getElementsByTagName('body')[0].scrollTop;
        if (event.clientX !== undefined) {
            mouse.x = ((event.clientX - position.left) / container.clientWidth) * 2 - 1;
            mouse.y = - ((event.clientY - position.top + scrollUp) / container.clientHeight) * 2 + 1;
        }
        raycaster.setFromCamera(mouse, scenes.menu.camera);
        const thingsTouched = raycaster.intersectObjects(scenes.menu.scene.children);
        // Detection for player clicked on planet for shield manipulation.
        thingsTouched.forEach(el => {
            if (el.object.name === 'Start') {
                const difficulty = scenes.menu.instance.pressedStart();
                setTimeout(() => {
                    scenes.menu.active = false;
                    window.removeEventListener( 'resize', onWindowResize, false);
                    container.removeChild( (scenes.menu.renderer as any).domElement );
                    loadShipLayoutScene();
                }, 750);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Load Code') {
                setTimeout(() => {
                    scenes.menu.active = false;
                    window.removeEventListener( 'resize', onWindowResize, false);
                    container.removeChild( (scenes.menu.renderer as any).domElement );
                    // loadGame(1);
                }, 250);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Easy') {
                scenes.menu.instance.changeDifficulty(0);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Normal') {
                scenes.menu.instance.changeDifficulty(1);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Hard') {
                scenes.menu.instance.changeDifficulty(2);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Hardcore') {
                scenes.menu.instance.changeDifficulty(3);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Load') {
                scenes.menu.instance.pressedLoad();
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Help') {
                scenes.menu.instance.pressedHelp();
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'On') {
                scenes.menu.instance.pressedOn();
                return;
            } else if (el.object.name === 'Off') {
                scenes.menu.instance.pressedOff();
                return;
            } else if (el.object.name === 'Return Help') {
                scenes.menu.instance.returnToMainMenu();
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Return Load') {
                scenes.menu.instance.returnToMainMenu();
                SoundinatorSingleton.playClick();
                return;
            }
        });
    };
    scenes.menu.instance = new Menu(scenes.menu, gameFont);
    scenes.menu.raycaster = raycaster;
    startMenuRendering();
};
const startMenuRendering = () => {
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
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
    scenes.intro.active = true;
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    scenes.intro.scene = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    scenes.intro.renderer = ((window as any)['WebGLRenderingContext'])
        ? new WebGLRenderer()
        : new CanvasRenderer();
    // Make it black and size it to window.
    (scenes.intro.renderer as any).setClearColor(0x000000, 0);
    scenes.intro.renderer.setSize( WIDTH, HEIGHT );
    (scenes.intro.renderer as any).autoClear = false;
    // An all around brightish light that hits everything equally.
    scenes.intro.scene.add(new AmbientLight(0xCCCCCC));
    // Render to the html container.
    const container = document.getElementById('mainview');
	container.appendChild( (scenes.intro.renderer as any).domElement );
    // Set up player's ability to see the game, and focus center on planet.
    scenes.intro.camera =  new OrthographicCamera( -6, 6, -6, 6, 0, 100 );
	scenes.intro.camera.position.set(0, -20, 0);
    scenes.intro.camera.lookAt(scenes.intro.scene.position);
    scenes.intro.camera.add(audioListener);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.intro.camera and scenes.intro.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.intro.renderer.setSize( WIDTH, HEIGHT );
        document.getElementById('mainview').style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        document.getElementById('mainview').style.width = WIDTH + 'px';
        document.getElementById('mainview').style.height = HEIGHT + 'px';
    };
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false);
    // Create the click collision layer
    const clickBarrierGeometry = new PlaneGeometry( 12, 12, 0, 0 );
    const clickBarrierMaterial = new MeshBasicMaterial( {opacity: 0, transparent: true, side: DoubleSide} );
    const clickBarrier = new Mesh( clickBarrierGeometry, clickBarrierMaterial );
    clickBarrier.name = 'Click Barrier';
    clickBarrier.position.set(0, 0, 0);
    clickBarrier.rotation.set(1.5708, 0, 0);
    scenes.intro.scene.add(clickBarrier);

    // Click event listener that turns shield on or off if player clicks on planet. Fire weapon otherwise.
    const raycaster = new Raycaster();
    document.onclick = event => {
        const mouse = new Vector2();
        event.preventDefault();
        // Gets accurate click positions using css and raycasting.
        const position = {
            left: container.offsetLeft,
            top: container.offsetTop
        };
        const scrollUp = document.getElementsByTagName('body')[0].scrollTop;
        if (event.clientX !== undefined) {
            mouse.x = ((event.clientX - position.left) / container.clientWidth) * 2 - 1;
            mouse.y = - ((event.clientY - position.top + scrollUp) / container.clientHeight) * 2 + 1;
        }
        raycaster.setFromCamera(mouse, scenes.intro.camera);
        const thingsTouched = raycaster.intersectObjects(scenes.intro.scene.children);
        // Detection for player clicked on pause button
        thingsTouched.forEach(el => {
            if (el.object.name === 'Click Barrier') {
                SoundinatorSingleton.playClick();
                scenes.intro.active = false;
                loadMenu();
                return;
            }
        });
    };
    const intro = new Intro(scenes.intro, shipTexture, earthTexture, marsTexture, asteroidTexture, enceladusTexture, gameFont);
    scenes.intro.raycaster = raycaster;
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.intro.active) {
            intro.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', onWindowResize, false);
            container.removeChild( (scenes.intro.renderer as any).domElement );
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
                window.removeEventListener( 'resize', onWindowResize, false);
                container.removeChild( (scenes.intro.renderer as any).domElement );
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
const loadLandAndMineScene = (planetSpec: PlanetSpecifications) => {
    scenes.landAndMine.active = true;
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    scenes.landAndMine.scene = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    scenes.landAndMine.renderer = ((window as any)['WebGLRenderingContext'])
        ? new WebGLRenderer()
        : new CanvasRenderer();
    // Make it black and size it to window.
    (scenes.landAndMine.renderer as any).setClearColor(0x000000, 0);
    scenes.landAndMine.renderer.setSize( WIDTH, HEIGHT );
    (scenes.landAndMine.renderer as any).autoClear = false;
    // An all around brightish light that hits everything equally.
    scenes.landAndMine.scene.add(new AmbientLight(0xCCCCCC));
    // Render to the html container.
    const container = document.getElementById('mainview');
	container.appendChild( (scenes.landAndMine.renderer as any).domElement );
    // Set up player's ability to see the game, and focus center on planet.
    scenes.landAndMine.camera =  new OrthographicCamera( -6, 6, -6, 6, 0, 100 );
	scenes.landAndMine.camera.position.set(0, -20, 0);
    scenes.landAndMine.camera.lookAt(scenes.landAndMine.scene.position);
    scenes.landAndMine.camera.add(audioListener);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.landAndMine.camera and scenes.landAndMine.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.landAndMine.renderer.setSize( WIDTH, HEIGHT );
        document.getElementById('mainview').style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        document.getElementById('mainview').style.width = WIDTH + 'px';
        document.getElementById('mainview').style.height = HEIGHT + 'px';
    };
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false);
    // Create the click collision layer
    const clickBarrierGeometry = new PlaneGeometry( 12, 12, 0, 0 );
    const clickBarrierMaterial = new MeshBasicMaterial( {opacity: 0, transparent: true, side: DoubleSide} );
    const clickBarrier = new Mesh( clickBarrierGeometry, clickBarrierMaterial );
    clickBarrier.name = 'Click Barrier';
    clickBarrier.position.set(0, 50, 0);
    clickBarrier.rotation.set(1.5708, 0, 0);
    scenes.landAndMine.scene.add(clickBarrier);

    // Click event listener that turns shield on or off if player clicks on planet. Fire weapon otherwise.
    const raycaster = new Raycaster();
    const landAndMine = new LandAndMine(
        scenes.landAndMine,
        {
            shipTexture,
            astronaut1Texture,
            miningEquipment1Texture,
            miningEquipment2Texture,
            miningDrillTexture,
            minedSquare1Texture
        },
        planetSpec);
    scenes.landAndMine.raycaster = raycaster;
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.landAndMine.active) {
            landAndMine.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', onWindowResize, false);
            container.removeChild( (scenes.landAndMine.renderer as any).domElement );
            // Clear up memory used by landAndMine scene.
            scenes.landAndMine.camera = null;
            scenes.landAndMine.instance = null;
            scenes.landAndMine.raycaster = null;
            scenes.landAndMine.renderer = null;
            scenes.landAndMine.scene = null;
            return;
        } else {
            const layout = landAndMine.endCycle();
            if (layout) {
                landAndMine.dispose();
                scenes.landAndMine.active = false;
                // Remove renderer from the html container, and remove event listeners.
                window.removeEventListener( 'resize', onWindowResize, false);
                container.removeChild( (scenes.landAndMine.renderer as any).domElement );
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
    scenes.shipLayout.active = true;
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    scenes.shipLayout.scene = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    scenes.shipLayout.renderer = ((window as any)['WebGLRenderingContext'])
        ? new WebGLRenderer()
        : new CanvasRenderer();
    // Make it black and size it to window.
    (scenes.shipLayout.renderer as any).setClearColor(0x000000, 0);
    scenes.shipLayout.renderer.setSize( WIDTH, HEIGHT );
    (scenes.shipLayout.renderer as any).autoClear = false;
    // An all around brightish light that hits everything equally.
    scenes.shipLayout.scene.add(new AmbientLight(0xCCCCCC));
    // Render to the html container.
    const container = document.getElementById('mainview');
	container.appendChild( (scenes.shipLayout.renderer as any).domElement );
    // Set up player's ability to see the game, and focus center on planet.
    scenes.shipLayout.camera =  new OrthographicCamera( -6, 6, -6, 6, 0, 100 );
	scenes.shipLayout.camera.position.set(0, -20, 0);
    scenes.shipLayout.camera.lookAt(scenes.shipLayout.scene.position);
    scenes.shipLayout.camera.add(audioListener);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.shipLayout.camera and scenes.shipLayout.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.shipLayout.renderer.setSize( WIDTH, HEIGHT );
        document.getElementById('mainview').style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        document.getElementById('mainview').style.width = WIDTH + 'px';
        document.getElementById('mainview').style.height = HEIGHT + 'px';
    };
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false);
    // Create the click collision layer
    const clickBarrierGeometry = new PlaneGeometry( 12, 12, 0, 0 );
    const clickBarrierMaterial = new MeshBasicMaterial( {opacity: 0, transparent: true, side: DoubleSide} );
    const clickBarrier = new Mesh( clickBarrierGeometry, clickBarrierMaterial );
    clickBarrier.name = 'Click Barrier';
    clickBarrier.position.set(0, 50, 0);
    clickBarrier.rotation.set(1.5708, 0, 0);
    scenes.shipLayout.scene.add(clickBarrier);

    // Click event listener that turns shield on or off if player clicks on planet. Fire weapon otherwise.
    const raycaster = new Raycaster();
    const shipLayout = new ShipLayout(scenes.shipLayout, enzmannLayoutTexture, enzmannOutsideTexture, engineerProfileTexture);
    scenes.shipLayout.raycaster = raycaster;
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.shipLayout.active) {
            shipLayout.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', onWindowResize, false);
            container.removeChild( (scenes.shipLayout.renderer as any).domElement );
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
                window.removeEventListener( 'resize', onWindowResize, false);
                container.removeChild( (scenes.shipLayout.renderer as any).domElement );
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
    loadAssets();
}
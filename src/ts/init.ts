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
    Texture,
    Camera} from 'three';

import { SoundinatorSingleton } from './soundinator';
import { LevelHandler } from './displays/level-handler';
import { Menu } from './displays/menu';
import { ControlPanel } from './controls/control-panel';
import { HelpHandler } from './displays/help-handler';
import { GameLoadData } from './models/game-load-data';
import { CreateSaveCode } from './utils/create-save-code';
import { SaveHandler } from './displays/save-handler';

/**
 * Loads the graphic for asteroid.
 */
const asteroidLoader = new TextureLoader();
/**
 * The loaded texture, used for the asteroids.
 */
let asteroidTexture: Texture;
/**
 * The thing that hears sound.
 */
const audioListener: AudioListener = new AudioListener();
/**
 * Loads the graphics for buildings.
 */
const buildingLoaders: TextureLoader[] = [
    new TextureLoader(),
    new TextureLoader(),
    new TextureLoader(),
    new TextureLoader()
];
/**
 * The loaded textures, used for the buildings.
 */
const buildingTextures: Texture[] = [];
/**
 * The camera for main menu
 */
let cameraMenu: Camera;
/**
 * Loads the font from a json file.
 */
const fontLoader = new FontLoader();
/**
 * The loaded font, used for the scoreboard.
 */
let gameFont: Font;
/**
 * Flag to allow menu rendering to continue.
 */
let isMenuMode: boolean = true;
/**
 * Instance of Menu for controlling buttons and menu lighting.
 */
let menu: Menu;
/**
 * Loads the graphics for planet.
 */
const planetLoaders: TextureLoader[] = [
    new TextureLoader(),
    new TextureLoader(),
    new TextureLoader()
];
/**
 * The loaded textures, used for the planet.
 */
const planetTextures: Texture[] = [];
/**
 * The renderer for main menu
 */
let rendererMenu: WebGLRenderer|CanvasRenderer;
/**
 * Loads the graphics for saucers.
 */
const saucerLoaders: TextureLoader[] = [
    new TextureLoader(),
    new TextureLoader(),
    new TextureLoader(),
    new TextureLoader(),
    new TextureLoader()
];
/**
 * The loaded textures, used for the saucers.
 */
const saucerTextures: Texture[] = [];
/**
 * The scene for main menu.
 */
let sceneMenu: Scene;
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
    // Callback function to set the scoreboard font once it is finished loading.
    fontLoader.load( 'assets/fonts/Light Pixel-7_Regular.json', font => {
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
    if (gameFont && asteroidTexture &&
        saucerTextures.length === saucerLoaders.length &&
        sounds.filter(s => s).length === soundLoaders.length) {
        SoundinatorSingleton.addSounds(sounds);
        loadMenu();
    }
};
const loadMenu = () => {
    isMenuMode = true;
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    sceneMenu = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    rendererMenu = ((window as any)['WebGLRenderingContext']) ?
        new WebGLRenderer() : new CanvasRenderer();
    // Make it black and size it to window.
    (rendererMenu as any).setClearColor(0x000000, 0);
    rendererMenu.setSize( WIDTH, HEIGHT );
    rendererMenu.autoClear = false;
    // Render to the html container.
    const container = document.getElementById('mainview');
	container.appendChild( (rendererMenu as any).domElement );
    // Set up player's ability to see the game, and focus center on planet.
    cameraMenu =  new OrthographicCamera( -6, 6, -6, 6, 0, 100 );
	cameraMenu.position.set(0, -20, 0);
    cameraMenu.lookAt(sceneMenu.position);
    cameraMenu.add(audioListener);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating cameraMenu and rendererMenu.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        rendererMenu.setSize( WIDTH, HEIGHT );
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
        raycaster.setFromCamera(mouse, cameraMenu);
        const thingsTouched = raycaster.intersectObjects(sceneMenu.children);
        // Detection for player clicked on planet for shield manipulation.
        thingsTouched.forEach(el => {
            if (el.object.name === 'Start') {
                const difficulty = menu.pressedStart();
                setTimeout(() => {
                    isMenuMode = false;
                    window.removeEventListener( 'resize', onWindowResize, false);
                    container.removeChild( (rendererMenu as any).domElement );
                    loadGame(difficulty);
                }, 750);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Load Code') {
                // setTimeout(() => {
                //     isMenuMode = false;
                //     window.removeEventListener( 'resize', onWindowResize, false);
                //     container.removeChild( (rendererMenu as any).domElement );
                //     loadGame(menu.getDifficulty(), menu.getGameData());
                // }, 250);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Easy') {
                menu.changeDifficulty(0);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Normal') {
                menu.changeDifficulty(1);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Hard') {
                menu.changeDifficulty(2);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Hardcore') {
                menu.changeDifficulty(3);
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Load') {
                // menu.pressedLoad();
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Help') {
                // menu.pressedHelp();
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'On') {
                menu.pressedOn();
                return;
            } else if (el.object.name === 'Off') {
                menu.pressedOff();
                return;
            } else if (el.object.name === 'Return Help') {
                // menu.returnToMainMenu();
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Return Load') {
                menu.returnToMainMenu();
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Help Shield') {
                menu.toggleHelpShield();
                return;
            } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
                .some(test => test === el.object.name)) {
                menu.charEntered(el.object.name);
                SoundinatorSingleton.playClick();
                return;
            }
        });
    };
    menu = new Menu(sceneMenu, gameFont, asteroidTexture);
    startMenuRendering();
};
const startMenuRendering = () => {
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (isMenuMode) {
            menu.endCycle();
            rendererMenu.render( sceneMenu, cameraMenu );
            requestAnimationFrame( render );
        }
    };
    // Kick off the first render loop iteration.
    rendererMenu.render( sceneMenu, cameraMenu );
	requestAnimationFrame( render );
};
/**
 * All things game related. Only starts when all assets are finished loading.
 * @param difficulty player's choice in difficulty level.
 */
const loadGame = (difficulty: number, gld?: GameLoadData) => {
    const gameLoadData: GameLoadData = (gld && gld.difficulty < 3) ? gld : {
        b1: 1, b2: 1, b3: 1, b4: 1,
        difficulty: difficulty,
        level: 1,
        sat1: 1, sat2: 1, sat3: 1, sat4: 1,
        score: 0
    };
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    const scene = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    const renderer: WebGLRenderer|CanvasRenderer = ((window as any)['WebGLRenderingContext'])
        ? new WebGLRenderer()
        : new CanvasRenderer();
    // Make it black and size it to window.
    (renderer as any).setClearColor(0x000000, 0);
    renderer.setSize( WIDTH, HEIGHT );
    renderer.autoClear = false;
    // An all around brightish light that hits everything equally.
    scene.add(new AmbientLight(0xCCCCCC));
    // Render to the html container.
    const container = document.getElementById('mainview');
	container.appendChild( (renderer as any).domElement );
    // Set up player's ability to see the game, and focus center on planet.
    const camera =  new OrthographicCamera( -6, 6, -6, 6, 0, 100 );
	camera.position.set(0, -20, 0);
    camera.lookAt(scene.position);
    camera.add(audioListener);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating camera and renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        renderer.setSize( WIDTH, HEIGHT );
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
    scene.add(clickBarrier);

    // Create Score and Level handlers 
    const levelHandler = new LevelHandler(scene, gameFont, gameLoadData);
    // Create control panel in upper right corner of screen.
    const controlPanel = new ControlPanel(scene, 3.25, -5.8, gameLoadData.difficulty, levelHandler.getColor(), gameFont);

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
        raycaster.setFromCamera(mouse, camera);
        const thingsTouched = raycaster.intersectObjects(scene.children);
        // Detection for player clicked on pause button
        thingsTouched.forEach(el => {
            if (el.object.name === 'Pause Button') {
                if (controlPanel.isHelp()) {
                    helpHandler.deactivate();
                } else if (controlPanel.isSave()) {
                    saveHandler.deactivate();
                }
                controlPanel.pauseChange();
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Help Button') {
                controlPanel.helpChange(!controlPanel.isHelp());
                saveHandler.deactivate();
                if (controlPanel.isHelp()) {
                    helpHandler.activate();
                } else {
                    helpHandler.deactivate();
                }
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Mute Button') {
                controlPanel.muteChange();
                return;
            }
            if (el.object.name === 'Exit Button') {
                controlPanel.resume();
                saveHandler.deactivate();
                helpHandler.deactivate();
                controlPanel.exitChange();
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Return Help') {
                if (controlPanel.isHelp()) {
                    controlPanel.helpChange(!controlPanel.isHelp());
                    helpHandler.deactivate();
                }
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Return Save') {
                if (controlPanel.isSave()) {
                    controlPanel.saveChange(!controlPanel.isSave());
                    saveHandler.deactivate();
                }
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Save Button') {
                controlPanel.saveChange(!controlPanel.isSave());
                helpHandler.deactivate();
                if (controlPanel.isSave()) {
                    saveHandler.activate(CreateSaveCode(gameLoadData));
                } else {
                    saveHandler.deactivate();
                }
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Help Shield') {
                const helpShield = helpHandler.getShield();
                if (helpShield.getActive()) helpShield.deactivate();
                else helpShield.activate();
                return;
            }
        });
        if (!controlPanel.isPaused()) {
            
        }
    };

    
    const helpHandler = new HelpHandler(scene, gameFont, asteroidTexture);
    const saveHandler = new SaveHandler(scene, gameFont);
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (controlPanel.isExit()) {
            window.removeEventListener( 'resize', onWindowResize, false);
            container.removeChild( (renderer as any).domElement );
            loadMenu();
            return;
        } else if (controlPanel.isHelp()) {
            helpHandler.endCycle();
        } else if (controlPanel.isSave()) {
            saveHandler.endCycle();
        } else if (controlPanel.isPaused()) {
            // When paused, do nothing but render.
        // Only run operations allowed during a fluctuating banner animation.
        } else if (levelHandler.isAnimating()) {
            
        // Run operations unrelated to fluctuating banner animation
        } else {
            
        }
        renderer.render( scene, camera );
	    requestAnimationFrame( render );
    };
    // Kick off the first render loop iteration.
    renderer.render( scene, camera );
	requestAnimationFrame( render );
};
/**
 * Called by DOM when page is finished loading. Now load assets, then the game.
 */
export default () => {
    loadAssets();
}
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

import { SceneType } from './models/SceneType';
import { SoundinatorSingleton } from './soundinator';
import { Menu } from './displays/menu';
import { Intro } from './scenes/intro/intro';

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
 * Loads the graphic for entryEffect.
 */
const entryEffectLoader = new TextureLoader();
/**
 * The loaded texture, used for the entryEffect.
 */
let entryEffectTexture: Texture;
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

const scenes: { [ key: string ]: SceneType } = {
    intro: {
        active: false,
        camera: null,
        instance: null,
        renderer: null,
        scene: null
    },
    menu: {
        active: false,
        camera: null,
        instance: null,
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
    // Callback function to set the atmosphere entry effect texture once it is finished loading.
    entryEffectLoader.load( 'assets/images/entry-flame.png', texture => {
        entryEffectTexture = texture;
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
    // Callback function to set the mars texture once it is finished loading.
    marsLoader.load( 'assets/images/mars.png', texture => {
        marsTexture = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the ship texture once it is finished loading.
    shipLoader.load( 'assets/images/ship.png', texture => {
        shipTexture = texture;
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
    if (gameFont && asteroidTexture && shipTexture && earthTexture && marsTexture &&
        sounds.filter(s => s).length === soundLoaders.length) {
        SoundinatorSingleton.addSounds(sounds);
        loadIntro();
    }
};
const loadMenu = () => {
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
                    // loadGame(difficulty);
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
    scenes.menu.instance = new Menu(scenes.menu.scene, gameFont);
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
 * Game's intro scene. Only starts when all assets are finished loading.
 */
const loadIntro = () => {
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
    const intro = new Intro(scenes.intro.scene, shipTexture, earthTexture, marsTexture, asteroidTexture, enceladusTexture, entryEffectTexture, gameFont);
    let introConter = -1;
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        introConter++;
        if (!scenes.intro.active) {
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', onWindowResize, false);
            const container = document.getElementById('mainview');
            container.removeChild( (scenes.intro.renderer as any).domElement );
            // Clear up memory used by intro scene.
            scenes.intro.camera = null;
            scenes.intro.instance = null;
            scenes.intro.renderer = null;
            scenes.intro.scene = null;
            return;
        } else {
            if (!intro.endCycle()) {
                scenes.intro.active = false;
                // Remove renderer from the html container, and remove event listeners.
                window.removeEventListener( 'resize', onWindowResize, false);
                const container = document.getElementById('mainview');
                container.removeChild( (scenes.intro.renderer as any).domElement );
                // Clear up memory used by intro scene.
                scenes.intro.camera = null;
                scenes.intro.instance = null;
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
 * Called by DOM when page is finished loading. Now load assets, then the game.
 */
export default () => {
    loadAssets();
}
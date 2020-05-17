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
import { LandAndMine } from './scenes/land-and-mine/land-and-mine';
import { PlanetSpecifications, OreTypes, OreQuantity, PlanetLandTypes, SkyTypes } from './models/planet-specifications';
import { LanderSpecifications } from './models/lander-specifications';
import * as stats from 'stats.js';
import { AncientRuins } from './scenes/ancient-ruins/ancient-ruins';
const statsPanel = new stats();

const TEXTURES: { [key: string]: [string, Texture] } = {
    arrow: ['assets/images/arrow.png', null],
    asteroid: ['assets/images/asteroid.png', null],
    astronaut1: ['assets/images/astronaut-01.png', null],
    astronaut2: ['assets/images/astronaut-02.png', null],
    astronaut3: ['assets/images/astronaut-03.png', null],
    astronautSuffocation1: ['assets/images/astronaut-suffocation-01.png', null],
    astronautSuffocation2: ['assets/images/astronaut-suffocation-02.png', null],
    astronautSuffocation3: ['assets/images/astronaut-suffocation-03.png', null],
    astronautSuffocation4: ['assets/images/astronaut-suffocation-04.png', null],
    astronautSuffocation5: ['assets/images/astronaut-suffocation-05.png', null],
    earth: ['assets/images/earth.png', null],
    enceladus: ['assets/images/enceladus.png', null],
    // The loaded texture, used for the ship layout dialogue engineer profile 1.
    engineerProfile: ['assets/images/ship-layout-profile.png', null],
    // The loaded texture, used for the ship layout dialogue engineer profile 2.
    engineer2Profile: ['assets/images/ship-layout-profile-2.png', null],
    // The loaded texture, used for the enzmann's interior.
    enzmannLayout: ['assets/images/enzmann-layout.png', null],
    enzmannOutside: ['assets/images/enzmann-outside.png', null],
    fire: ['assets/images/fire.png', null],
    keysForDown: ['assets/images/keys-down.png', null],
    keysForLeft: ['assets/images/keys-left.png', null],
    keysForRight: ['assets/images/keys-right.png', null],
    keysForUp: ['assets/images/keys-up.png', null],
    lander: ['assets/images/lander.png', null],
    mars: ['assets/images/mars.png', null],
    minedSquare1: ['assets/images/mined-square-01.png', null],
    miningDrill: ['assets/images/mining-drill.png', null],
    miningEquipment1: ['assets/images/mining-equipment-01.png', null],
    miningEquipment2: ['assets/images/mining-equipment-02.png', null],
    miningOfficerProfile1: ['assets/images/mining-officer-profile-01.png', null],
    mouse: ['assets/images/mouse.png', null],
    mouseLeft: ['assets/images/mouse-left.png', null],
    scienceOfficerProfile1: ['assets/images/science-officer-profile-01.png', null],
    ship: ['assets/images/ship.png', null],
    greenGrassCenter01: ['assets/images/grass-tile-green-center-01.png', null],
    greenGrassCenter02: ['assets/images/grass-tile-green-center-02.png', null],
    greenGrassBottomCenterDirt1: ['assets/images/grass-tile-green-bottom-center-dirt-01.png', null],
    greenGrassBottomLeftDirt1: ['assets/images/grass-tile-green-bottom-left-dirt-01.png', null],
    greenGrassBottomRightDirt1: ['assets/images/grass-tile-green-bottom-right-dirt-01.png', null],
    greenGrassCenterLeftDirt1: ['assets/images/grass-tile-green-center-left-dirt-01.png', null],
    greenGrassCenterRightDirt1: ['assets/images/grass-tile-green-center-right-dirt-01.png', null],
    greenGrassTopCenterDirt1: ['assets/images/grass-tile-green-top-center-dirt-01.png', null],
    greenGrassTopLeftDirt1: ['assets/images/grass-tile-green-top-left-dirt-01.png', null],
    greenGrassTopRightDirt1: ['assets/images/grass-tile-green-top-right-dirt-01.png', null]
};

/**
 * The thing that hears sound.
 */
const AUDIO_LISTENER: AudioListener = new AudioListener();

/**
 * The loaded font, used for the scoreboard.
 */
let gameFont: Font;

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
 * Sound file paths
 */
const SOUND_PATHS: { name: string; path: string; }[] = [
    {
        name: 'airThruster',
        /**
        * Astri : 45 minutes sound designs » Astri : 008 : rocketship hover landing.wav
        * https://freesound.org/people/prod.astri/sounds/492850/
        * license: Creative Commons 0 License
        * Recorded by: prod.astri
        */
        path: 'assets/audio/air-thruster.wav'
    },
    {
        name: 'backgroundMusicScifi01',
        /**
        * Atmospheric sci-fi drone
        * https://www.zapsplat.com/music/atmospheric-sci-fi-drone-2/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: Sumo Blanco
        */
        path: 'assets/audio/background-music-scifi-01.mp3'
    },
    {
        name: 'baseLost',
        /**
        * Gunfire In Crowd Sound
        * http://soundbible.com/1608-Gunfire-In-Crowd.html
        * license: Public Domain
        * Recorded by: KevanGC
        */
        path: 'assets/audio/base-lost.mp3'
    },
    {
        name: 'bidooo',
        /**
        * Boom, Crackle and Scream Sampler/Analo Fireworks, Boom, Glitch, Granular, Analog, Distort, Distortion, Saturation, Explode, Glitchy, Harsh, Sci-Fi
        * https://www.zapsplat.com/music/boom-crackle-and-scream-sampler-analo-fireworks-boom-glitch-granular-analog-distort-distortion-saturation-explode-glitchy-harsh-sci-fi/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: Sound Spark LLC
        */
        path: 'assets/audio/bidooo.mp3'
    },
    {
        name: 'bipBipBipBing',
        /**
        * Dead.wav
        * https://freesound.org/people/Daleonfire/sounds/406113/
        * license: Creative Commons 0 License
        * Recorded by: Daleonfire
        */
        path: 'assets/audio/bip-bip-bip-bing.wav'
    },
    {
        name: 'blap',
        /**
        * Cartoon object drop, lite clunk 2
        * https://www.zapsplat.com/music/cartoon-object-drop-lite-clunk-2/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: ZapSplat
        */
        path: 'assets/audio/blap.mp3'
    },
    {
        name: 'blip',
        /**
        * Cartoon object drop, lite clunk 1
        * https://www.zapsplat.com/music/cartoon-object-drop-lite-clunk-1/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: ZapSplat
        */
        path: 'assets/audio/blip.mp3'
    },
    {
        name: 'clickClack',
        /**
         * Click On Sound
         * http://soundbible.com/1280-Click-On.html
         * license: Attribution 3.0
         * Recorded by: Mike Koenig
         */
        path: 'assets/audio/click-clack.mp3'
    },
    {
        name: 'deathNoNoAchEhh',
        /**
        * Bug Sprayed.wav
        * https://freesound.org/people/husky70/sounds/157293/
        * license: Creative Commons 0 License
        * Recorded by: husky70
        */
        path: 'assets/audio/death-no-no-ach-ehh.wav'
    },
    {
        name: 'drilling',
        /**
        * Drone, Machine, Engine, Motor, UFO, Spaceship, Sci-Fi, Aliens, Ambience, Buzz, Hum, Noise, Seamless, Loop, Looping
        * https://www.zapsplat.com/music/drone-machine-engine-motor-ufo-spaceship-sci-fi-aliens-ambience-buzz-hum-noise-seamless-loop-looping-2/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: Sound Spark LLC
        */
        path: 'assets/audio/drilling.mp3'
    },
    {
        name: 'drone',
        /**
        * Beep Ping Sound
        * http://soundbible.com/1133-Beep-Ping.html
        * license: Attribution 3.0
        * Recorded by: Mike Koenig
        */
        path: 'assets/audio/drone.mp3'
    },
    {
        name: 'explosionLarge',
        /**
         * Bomb Exploding Sound
         * http://soundbible.com/1986-Bomb-Exploding.html
         * license: Attribution 3.0
         * Recorded by: Sound Explorer
         */
        path: 'assets/audio/boom.mp3'
    },
    {
        name: 'explosionSmall',
        /**
        * Explosion, large with glass breaking and other debris 2
        * https://www.zapsplat.com/music/explosion-large-with-glass-breaking-and-other-debris-2/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: ZapSplat
        */
        path: 'assets/audio/explosion-small.mp3'
    },
    {
        name: 'fire',
        /**
        * Tank Firing Sound
        * http://soundbible.com/1326-Tank-Firing.html
        * license: Attribution 3.0
        * Recorded by: snottyboy
        */
        path: 'assets/audio/fire.mp3'
    },
    {
        name: 'fooPang',
        /**
        * Fast swing, whoosh into a metal hit, thud or clunk, could be sword hitting shield or armor. Version 2
        * https://www.zapsplat.com/music/fast-swing-whoosh-into-a-metal-hit-thud-or-clunk-could-be-sword-hitting-shield-or-armor-version-2/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: ZapSplat
        */
        path: 'assets/audio/foop-pang.mp3'
    },
    {
        name: 'gameOver',
        /**
        * Beam Me Up Scotty Sound
        * http://soundbible.com/256-Beam-Me-Up-Scotty.html
        * license: Personal Use Only
        * Recorded by: N/A
        */
        path: 'assets/audio/game-over.mp3'
    },
    {
        name: 'hollowClank',
        /**
        * Horror, hit, heavy wood thump or clunk with reverb, good for shock, jump scare 2
        * https://www.zapsplat.com/music/horror-hit-heavy-wood-thump-or-clunk-with-reverb-good-for-shock-jump-scare-2/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: Skyclad Sound
        */
        path: 'assets/audio/hollow-clank.mp3'
    },
    {
        name: 'hollowClunk',
        /**
        * Horror, hit, heavy wood thump or clunk with reverb, good for shock, jump scare 3
        * https://www.zapsplat.com/music/horror-hit-heavy-wood-thump-or-clunk-with-reverb-good-for-shock-jump-scare-3/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: Skyclad Sound
        */
        path: 'assets/audio/hollow-clunk.mp3'
    },
    {
        name: 'mainThrusterSmall',
        /**
        * RocketThrustMaxx.wav
        * https://freesound.org/people/Maxx222/sounds/446764/
        * license: Creative Commons 0 License
        * Recorded by: Maxx222
        */
        path: 'assets/audio/main-thruster-small.wav'
    },
    {
        name: 'regen',
        /**
        * Ta Da Sound
        * http://soundbible.com/1003-Ta-Da.html
        * license: Attribution 3.0
        * Recorded by: Mike Koenig
        */
        path: 'assets/audio/regen.mp3'
    },
    {
        name: 'saucer',
        /**
        * Strange Noise Sound
        * http://soundbible.com/1636-Power-Up-Ray.html
        * license: Noncommercial 3.0
        * Recorded by: Mike Koenig
        */
        path: 'assets/audio/saucer.mp3'
    },
    {
        name: 'shieldDown',
        /**
        * Metroid Door Sound
        * http://soundbible.com/1858-Metroid-Door.html
        * license: Attribution 3.0
        * Recorded by: Brandino480
        */
        path: 'assets/audio/shield-down.mp3'
    },
    {
        name: 'shieldUp',
        /**
        * Power Up Ray Sound
        * http://soundbible.com/1636-Power-Up-Ray.html
        * license: Noncommercial 3.0
        * Recorded by: Mike Koenig
        */
        path: 'assets/audio/shield-up.mp3'
    },
    {
        name: 'walkingFastGravel',
        /**
        * Running, Snow, A.wav
        * https://freesound.org/people/InspectorJ/sounds/421022/
        * license: Attribution License
        * Recorded by: InspectorJ
        */
        path: 'assets/audio/walking-fast-gravel.wav'
    },
    {
        name: 'wind',
        /**
        * Synthesised cold, howling wind
        * https://www.zapsplat.com/music/synthesised-cold-howling-wind/
        * license: Standard License (See ZapSplat license pdf)
        * Recorded by: Adam A Johnson
        */
        path: 'assets/audio/wind.mp3'
    }
];

/**
 * Loads the audio files.
 */
const SOUND_LOADERS: { name: string; loader: AudioLoader; path: string; }[] = SOUND_PATHS.map(x => {
    return {
        name: x.name,
        loader: new AudioLoader(),
        path: x.path
    };
});

/**
 * List of loaded audio files.
 */
const SOUNDS: { [key: string]: Audio; } = {};

/**
 * Total number of assets to load.
 */
const TOTAL_ASSET_COUNT_TO_LOAD = Object.values(TEXTURES).length + 1 + SOUND_LOADERS.length;

/**
 * Tracks number of assets loaded.
 */
let assetsLoadedCount = 0;

/**
 * Passes the callback functions to font and texture loaders,
 * each fitted with their chance to check if all others are done.
 */
const loadAssets = () => {
    SoundinatorSingleton.addListener(AUDIO_LISTENER);
    const loadingBar = document.getElementById('loading').getElementsByClassName('ldBar')[0];
    Object.keys(TEXTURES).forEach(key => {
        (new TextureLoader()).load( TEXTURES[key][0], texture => {
            TEXTURES[key][1] = texture;
            assetsLoadedCount++;
            (loadingBar as any).ldBar.set((assetsLoadedCount / TOTAL_ASSET_COUNT_TO_LOAD) * 100);
            checkAssetsLoaded();
        });
    });
    // Callback function to set the scoreboard font once it is finished loading.
    (new FontLoader()).load( 'assets/fonts/Luckiest_Guy_Regular.json', font => {
        gameFont = font;
        assetsLoadedCount++;
        (loadingBar as any).ldBar.set((assetsLoadedCount / TOTAL_ASSET_COUNT_TO_LOAD) * 100);
        checkAssetsLoaded();
    });
    // Get the ball rolling on each of the sound file loads.
    SOUND_LOADERS.forEach((soundLoader, index) => {
        soundLoader.loader.load(
            soundLoader.path,
            (soundBuffer: AudioBuffer) => {
                const sound = (new Audio(AUDIO_LISTENER)).setBuffer(soundBuffer);
                sound.setLoop(false);
                SOUNDS[soundLoader.name] = sound;
                assetsLoadedCount++;
                (loadingBar as any).ldBar.set((assetsLoadedCount / TOTAL_ASSET_COUNT_TO_LOAD) * 100);
                checkAssetsLoaded();
            },
            (xhr: { loaded: number; total: number;}) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error: string) => console.log(`Failed to load (${soundLoader.path.split('/').pop()}) sound file`, error)
        );
    });
};

/**
 * Checks to see if all assets are finished loaded. If so, start rendering the game.
 */
const checkAssetsLoaded = () => {
    if (gameFont &&
        !Object.keys(TEXTURES).some(key => !TEXTURES[key][1]) &&
        Object.keys(SOUNDS).length === SOUND_LOADERS.length) {
        SoundinatorSingleton.addSounds(SOUNDS);

        setTimeout(() => {
            const loading = document.getElementById('loading');
            loading.classList.add('hidden');
            const mainview = document.getElementById('mainview');
            mainview.classList.remove('hidden');
            loadMenu();
        }, 500);
    }
};

/**
 * Loads the dev menu with all the mini games and game sections separated as testable/playable games.
 */
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
    scenes.devMenu.camera.add(AUDIO_LISTENER);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.devMenu.camera and scenes.devMenu.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.devMenu.renderer.setSize( WIDTH, HEIGHT );
        const loading = document.getElementById('loading');
        loading.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        loading.style.width = WIDTH + 'px';
        loading.style.height = HEIGHT + 'px';
        const mainview = document.getElementById('mainview');
        mainview.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        mainview.style.width = WIDTH + 'px';
        mainview.style.height = HEIGHT + 'px';
    };
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false);
    // Click event listeners that activates certain menu options.
    const activateAncientRuinsScene = () => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadAncientRuinsScene();
        }, 50);
    };
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
    const activateLandAndMineScene = (planetSpec: PlanetSpecifications, landerSpec: LanderSpecifications) => {
        scenes.devMenu.active = false;
        window.removeEventListener( 'resize', onWindowResize, false);
        container.removeChild( (scenes.devMenu.renderer as any).domElement );
        setTimeout(() => {
            loadLandAndMineScene(planetSpec, landerSpec);
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
            activateAncientRuinsScene,
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
            engineer: TEXTURES.engineerProfile[1],
            engineer2: TEXTURES.engineer2Profile[1],
            miner1: TEXTURES.miningOfficerProfile1[1],
            science1: TEXTURES.scienceOfficerProfile1[1],
            enzmann: TEXTURES.enzmannOutside[1],
            arrow: TEXTURES.arrow[1]
        });
    scenes.devMenu.raycaster = raycaster;
    startDevMenuRendering();
};

/**
 * Kick off function for rendering the dev menu scene.
 */
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

/**
 * Loads the game menu with the actual gameplay starting point
 */
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
    scenes.menu.camera.add(AUDIO_LISTENER);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.menu.camera and scenes.menu.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.menu.renderer.setSize( WIDTH, HEIGHT );
        const loading = document.getElementById('loading');
        loading.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        loading.style.width = WIDTH + 'px';
        loading.style.height = HEIGHT + 'px';
        const mainview = document.getElementById('mainview');
        mainview.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        mainview.style.width = WIDTH + 'px';
        mainview.style.height = HEIGHT + 'px';
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
                SoundinatorSingleton.playBidooo();
                return;
            } else if (el.object.name === 'Load Code') {
                setTimeout(() => {
                    scenes.menu.active = false;
                    window.removeEventListener( 'resize', onWindowResize, false);
                    container.removeChild( (scenes.menu.renderer as any).domElement );
                    // loadGame(1);
                }, 250);
                SoundinatorSingleton.playBidooo();
                return;
            } else if (el.object.name === 'Easy') {
                scenes.menu.instance.changeDifficulty(0);
                SoundinatorSingleton.playBidooo();
                return;
            } else if (el.object.name === 'Normal') {
                scenes.menu.instance.changeDifficulty(1);
                SoundinatorSingleton.playBidooo();
                return;
            } else if (el.object.name === 'Hard') {
                scenes.menu.instance.changeDifficulty(2);
                SoundinatorSingleton.playBidooo();
                return;
            } else if (el.object.name === 'Hardcore') {
                scenes.menu.instance.changeDifficulty(3);
                SoundinatorSingleton.playBidooo();
                return;
            } else if (el.object.name === 'Load') {
                scenes.menu.instance.pressedLoad();
                SoundinatorSingleton.playBidooo();
                return;
            } else if (el.object.name === 'Help') {
                scenes.menu.instance.pressedHelp();
                SoundinatorSingleton.playBidooo();
                return;
            } else if (el.object.name === 'On') {
                scenes.menu.instance.pressedOn();
                return;
            } else if (el.object.name === 'Off') {
                scenes.menu.instance.pressedOff();
                return;
            } else if (el.object.name === 'Return Help') {
                scenes.menu.instance.returnToMainMenu();
                SoundinatorSingleton.playBidooo();
                return;
            } else if (el.object.name === 'Return Load') {
                scenes.menu.instance.returnToMainMenu();
                SoundinatorSingleton.playBidooo();
                return;
            }
        });
    };
    scenes.menu.instance = new Menu(scenes.menu, gameFont);
    scenes.menu.raycaster = raycaster;
    startMenuRendering();
};

/**
 * Kick off function for rendering the real menu scene.
 */
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
    scenes.intro.camera.add(AUDIO_LISTENER);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.intro.camera and scenes.intro.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.intro.renderer.setSize( WIDTH, HEIGHT );
        const loading = document.getElementById('loading');
        loading.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        loading.style.width = WIDTH + 'px';
        loading.style.height = HEIGHT + 'px';
        const mainview = document.getElementById('mainview');
        mainview.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        mainview.style.width = WIDTH + 'px';
        mainview.style.height = HEIGHT + 'px';
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

    // Click event listener to register user click.
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
                SoundinatorSingleton.playBidooo();
                scenes.intro.active = false;
                loadMenu();
                return;
            }
        });
    };
    const intro = new Intro(
        scenes.intro,
        TEXTURES.ship[1],
        TEXTURES.earth[1],
        TEXTURES.mars[1],
        TEXTURES.asteroid[1],
        TEXTURES.enceladus[1],
        gameFont);
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
const loadAncientRuinsScene = () => {
    scenes.ancientRuins.active = true;
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    scenes.ancientRuins.scene = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    scenes.ancientRuins.renderer = ((window as any)['WebGLRenderingContext'])
        ? new WebGLRenderer()
        : new CanvasRenderer();
    // Make it black and size it to window.
    (scenes.ancientRuins.renderer as any).setClearColor(0x000000, 0);
    scenes.ancientRuins.renderer.setSize( WIDTH, HEIGHT );
    (scenes.ancientRuins.renderer as any).autoClear = false;
    // An all around brightish light that hits everything equally.
    scenes.ancientRuins.scene.add(new AmbientLight(0xCCCCCC));
    // Render to the html container.
    const container = document.getElementById('mainview');
	container.appendChild( (scenes.ancientRuins.renderer as any).domElement );
    // Set up player's ability to see the game, and focus center on planet.
    scenes.ancientRuins.camera =  new OrthographicCamera( -6, 6, -6, 6, 0, 100 );
	scenes.ancientRuins.camera.position.set(0, -20, 0);
    scenes.ancientRuins.camera.lookAt(scenes.ancientRuins.scene.position);
    scenes.ancientRuins.camera.add(AUDIO_LISTENER);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.ancientRuins.camera and scenes.ancientRuins.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.ancientRuins.renderer.setSize( WIDTH, HEIGHT );
        const loading = document.getElementById('loading');
        loading.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        loading.style.width = WIDTH + 'px';
        loading.style.height = HEIGHT + 'px';
        const mainview = document.getElementById('mainview');
        mainview.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        mainview.style.width = WIDTH + 'px';
        mainview.style.height = HEIGHT + 'px';
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
    scenes.ancientRuins.scene.add(clickBarrier);

    // Click event listener to register user click.
    const raycaster = new Raycaster();
    const ancientRuins = new AncientRuins(
        scenes.ancientRuins,
        {
            greenGrassCenter01: TEXTURES.greenGrassCenter01[1],
            greenGrassCenter02: TEXTURES.greenGrassCenter02[1],
            greenGrassBottomCenterDirt1: TEXTURES.greenGrassBottomCenterDirt1[1],
            greenGrassBottomLeftDirt1: TEXTURES.greenGrassBottomLeftDirt1[1],
            greenGrassBottomRightDirt1: TEXTURES.greenGrassBottomRightDirt1[1],
            greenGrassCenterLeftDirt1: TEXTURES.greenGrassCenterLeftDirt1[1],
            greenGrassCenterRightDirt1: TEXTURES.greenGrassCenterRightDirt1[1],
            greenGrassTopCenterDirt1: TEXTURES.greenGrassTopCenterDirt1[1],
            greenGrassTopLeftDirt1: TEXTURES.greenGrassTopLeftDirt1[1],
            greenGrassTopRightDirt1: TEXTURES.greenGrassTopRightDirt1[1]
        });
    scenes.ancientRuins.raycaster = raycaster;
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        if (!scenes.ancientRuins.active) {
            ancientRuins.dispose();
            // Remove renderer from the html container, and remove event listeners.
            window.removeEventListener( 'resize', onWindowResize, false);
            container.removeChild( (scenes.ancientRuins.renderer as any).domElement );
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
                window.removeEventListener( 'resize', onWindowResize, false);
                container.removeChild( (scenes.ancientRuins.renderer as any).domElement );
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
    scenes.landAndMine.camera.add(AUDIO_LISTENER);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.landAndMine.camera and scenes.landAndMine.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.landAndMine.renderer.setSize( WIDTH, HEIGHT );
        const loading = document.getElementById('loading');
        loading.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        loading.style.width = WIDTH + 'px';
        loading.style.height = HEIGHT + 'px';
        const mainview = document.getElementById('mainview');
        mainview.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        mainview.style.width = WIDTH + 'px';
        mainview.style.height = HEIGHT + 'px';
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

    // Click event listener to register user click.
    const raycaster = new Raycaster();
    const landAndMine = new LandAndMine(
        scenes.landAndMine,
        {
            arrow: TEXTURES.arrow[1],
            astronaut1: TEXTURES.astronaut1[1],
            astronaut2: TEXTURES.astronaut2[1],
            astronaut3: TEXTURES.astronaut3[1],
            astronautSuffocation1: TEXTURES.astronautSuffocation1[1],
            astronautSuffocation2: TEXTURES.astronautSuffocation2[1],
            astronautSuffocation3: TEXTURES.astronautSuffocation3[1],
            astronautSuffocation4: TEXTURES.astronautSuffocation4[1],
            astronautSuffocation5: TEXTURES.astronautSuffocation5[1],
            keysForDown: TEXTURES.keysForDown[1],
            keysForLeft: TEXTURES.keysForLeft[1],
            keysForRight: TEXTURES.keysForRight[1],
            keysForUp: TEXTURES.keysForUp[1],
            minedSquare1: TEXTURES.minedSquare1[1],
            miningDrill: TEXTURES.miningDrill[1],
            miningEquipment1: TEXTURES.miningEquipment1[1],
            miningEquipment2: TEXTURES.miningEquipment2[1],
            mouse: TEXTURES.mouse[1],
            mouseLeft: TEXTURES.mouseLeft[1],
            miningOfficerProfile1: TEXTURES.miningOfficerProfile1[1],
            ship: TEXTURES.lander[1]
        },
        planetSpec,
        landerSpec);
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
    scenes.shipLayout.camera.add(AUDIO_LISTENER);
    /**
     * Gracefully handles a change in window size, by recalculating shape and updating scenes.shipLayout.camera and scenes.shipLayout.renderer.
     */
    const onWindowResize = () => {
        WIDTH = window.innerWidth * 0.99;
        HEIGHT = window.innerHeight * 0.99;
        if(WIDTH < HEIGHT) HEIGHT = WIDTH;
        else WIDTH = HEIGHT;
        scenes.shipLayout.renderer.setSize( WIDTH, HEIGHT );
        const loading = document.getElementById('loading');
        loading.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        loading.style.width = WIDTH + 'px';
        loading.style.height = HEIGHT + 'px';
        const mainview = document.getElementById('mainview');
        mainview.style.left = (((window.innerWidth * 0.99) - WIDTH) / 2) + 'px';
        mainview.style.width = WIDTH + 'px';
        mainview.style.height = HEIGHT + 'px';
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

    // Click event listener to register user click.
    const raycaster = new Raycaster();
    const shipLayout = new ShipLayout(
        scenes.shipLayout,
        TEXTURES.enzmannLayout[1],
        TEXTURES.enzmannOutside[1],
        TEXTURES.engineerProfile[1]);
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
    let INITIAL_WIDTH = window.innerWidth * 0.99;
    let INITIAL_HEIGHT = window.innerHeight * 0.99;
    if(INITIAL_WIDTH < INITIAL_HEIGHT) INITIAL_HEIGHT = INITIAL_WIDTH;
    else INITIAL_WIDTH = INITIAL_HEIGHT;

    const loading = document.getElementById('loading');
    loading.style.left = (((window.innerWidth * 0.99) - INITIAL_WIDTH) / 2) + 'px';
    loading.style.width = INITIAL_WIDTH + 'px';
    loading.style.height = INITIAL_HEIGHT + 'px';

    loadAssets();
}
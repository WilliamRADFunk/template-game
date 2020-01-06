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

import { CollisionatorSingleton } from './collisionator';
import { SoundinatorSingleton } from './soundinator';
import { Planet } from './player/planet';
import { Shield } from './player/shield';
import { AsteroidGenerator } from './asteroids/asteroid-generator';
import { ScoreHandler } from './displays/score-handler';
import { EnemyMissileGenerator } from './enemies/enemy-missile-generator';
import { LevelHandler } from './displays/level-handler';
import { SaucerGenerator } from './enemies/saucer-generator';
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
 * Loads the graphics for specMap.
 */
const specMapLoader = new TextureLoader();
/**
 * The loaded font, used for the scoreboard.
 */
let specMap: Texture;
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
    // Get the ball rolling on each of the five saucer texture loads.
    buildingLoaders.forEach((loader, index) => {
        buildingLoaders[index].load( `assets/images/building${index + 1}.png`, texture => {
            buildingTextures[index] = texture;
            checkAssetsLoaded();
        });
    });
    // Callback function to set the scoreboard font once it is finished loading.
    fontLoader.load( 'assets/fonts/Light Pixel-7_Regular.json', font => {
        gameFont = font;
        checkAssetsLoaded();
    });
    // Callback function to set the planet foundation texture once it is finished loading.
    planetLoaders[0].load( 'assets/images/funkmap.jpg', texture => {
        planetTextures[0] = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the planet dead texture once it is finished loading.
    planetLoaders[2].load( 'assets/images/funkmap_dead.jpg', texture => {
        planetTextures[2] = texture;
        checkAssetsLoaded();
    });
    // Callback function to set the planet bump texture once it is finished loading.
    planetLoaders[1].load( 'assets/images/funkbump.jpg', texture => {
        planetTextures[1] = texture;
        checkAssetsLoaded();
    });
    // Get the ball rolling on each of the five saucer texture loads.
    saucerLoaders.forEach((loader, index) => {
        saucerLoaders[index].load( `assets/images/saucer${index + 1}.png`, texture => {
            saucerTextures[index] = texture;
            checkAssetsLoaded();
        });
    });
    // Callback function to set the specMap texture once it is finished loading.
    specMapLoader.load( 'assets/images/funkspec.jpg', texture => {
        specMap = texture;
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
    if (gameFont && asteroidTexture && specMap &&
        buildingTextures.length === buildingLoaders.length &&
        saucerTextures.length === saucerLoaders.length &&
        planetTextures.length === planetLoaders.length &&
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
                setTimeout(() => {
                    isMenuMode = false;
                    window.removeEventListener( 'resize', onWindowResize, false);
                    container.removeChild( (rendererMenu as any).domElement );
                    loadGame(menu.getDifficulty(), menu.getGameData());
                }, 250);
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
                menu.pressedLoad();
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'Help') {
                menu.pressedHelp();
                SoundinatorSingleton.playClick();
                return;
            } else if (el.object.name === 'On') {
                menu.pressedOn();
                return;
            } else if (el.object.name === 'Off') {
                menu.pressedOff();
                return;
            } else if (el.object.name === 'Return Help') {
                menu.returnToMainMenu();
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
    menu = new Menu(sceneMenu, gameFont, saucerTextures, asteroidTexture, buildingTextures, specMap, planetTextures);
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
    let isGameLive = true;
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    const scene = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    const renderer: WebGLRenderer|CanvasRenderer = ((window as any)['WebGLRenderingContext']) ?
        new WebGLRenderer() : new CanvasRenderer();
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
    // Create player's planet, which will also create its four satellites.
    const planet = new Planet([0, 0, 0], gameLoadData, gameFont);
    planet.addToScene(scene, planetTextures, buildingTextures, specMap);
    CollisionatorSingleton.add(planet);
    // Create shield around the planet.
    const shield = new Shield();
    shield.addToScene(scene);
    CollisionatorSingleton.add(shield);
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
    const scoreboard = new ScoreHandler(scene, levelHandler.getColor(), gameFont, gameLoadData);
    // Create all unit generators that can be dangerous to player
    const asteroidGenerator = new AsteroidGenerator(scene, scoreboard, asteroidTexture, gameLoadData);
    const saucerGenerator = new SaucerGenerator(scene, scoreboard, saucerTextures, gameLoadData);
    const enemyMissileGenerator = new EnemyMissileGenerator(scene, scoreboard, levelHandler.getColor(), gameLoadData);
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
        let launchFlag = true;
        // Detection for player clicked on pause button
        thingsTouched.forEach(el => {
            if (el.object.name === 'Pause Button') {
                if (controlPanel.isHelp()) {
                    helpHandler.deactivate();
                } else if (controlPanel.isSave()) {
                    saveHandler.deactivate();
                }
                controlPanel.pauseChange();
                launchFlag = false;
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
                launchFlag = false;
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Mute Button') {
                controlPanel.muteChange();
                launchFlag = false;
                return;
            }
            if (el.object.name === 'Exit Button') {
                controlPanel.resume();
                saveHandler.deactivate();
                helpHandler.deactivate();
                controlPanel.exitChange();
                launchFlag = false;
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Return Help') {
                if (controlPanel.isHelp()) {
                    controlPanel.helpChange(!controlPanel.isHelp());
                    helpHandler.deactivate();
                }
                launchFlag = false;
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Return Save') {
                if (controlPanel.isSave()) {
                    controlPanel.saveChange(!controlPanel.isSave());
                    saveHandler.deactivate();
                }
                launchFlag = false;
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
                launchFlag = false;
                SoundinatorSingleton.playClick();
                return;
            }
            if (el.object.name === 'Help Shield') {
                const helpShield = helpHandler.getShield();
                if (helpShield.getActive()) helpShield.deactivate();
                else helpShield.activate();
                launchFlag = false;
                return;
            }
        });
        if (!controlPanel.isPaused()) {
            // Detection for player clicked on planet for shield manipulation.
            thingsTouched.forEach(el => {
                if (el.object.name === 'Shield') {
                    if (shield.getActive()) shield.deactivate();
                    else shield.activate();
                    launchFlag = false;
                    return;
                }
            });
            // Detection for where (if not planet) player clicked to fire satellite weapons.
            if (launchFlag) {
                thingsTouched.forEach(el => {
                    if (el.object.name === 'Click Barrier') {
                        planet.fire(scene, el.point);
                        return;
                    }
                });
            }
        }
    };

    
    const helpHandler = new HelpHandler(scene, gameFont, saucerTextures, asteroidTexture, buildingTextures, specMap, planetTextures);
    const saveHandler = new SaveHandler(scene, gameFont);
    
    let jobCounter = 0;
    let noMissiles = false;
    let noAsteroids = false;
    let noSaucers = false;
    /**
     * The render loop. Everything that should be checked, called, or drawn in each animation frame.
     */
    const render = () => {
        jobCounter++;
        if (jobCounter > 10) jobCounter = 0;

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
            const levelBannerPeak = levelHandler.runAnimationCycle();
            if (levelBannerPeak && isGameLive) {
                controlPanel.nextLevel(levelHandler.getColor());
                scoreboard.nextLevel(levelHandler.getColor());
            }
            // Periodically check if things collided.
            if (jobCounter === 10) {
                CollisionatorSingleton.checkForCollisions(scene);
            }
            // Let the last explosions finish off even during next level banner animation.
            noAsteroids = asteroidGenerator.endCycle(isGameLive);
            noSaucers = saucerGenerator.endCycle(isGameLive);
            noMissiles = enemyMissileGenerator.endCycle(isGameLive);
            // To give the game over screen a more interesting feel,
            // spawn more asteroids and missiles after they've exhausted themselves.
            if (noAsteroids && noMissiles && (noSaucers || !isGameLive)) {
                enemyMissileGenerator.refreshLevel(levelHandler.getLevel(), levelHandler.getColor());
                asteroidGenerator.refreshLevel(levelHandler.getLevel());
                saucerGenerator.refreshLevel(levelHandler.getLevel());
            }
            // The world keeps on spinning.
            planet.endCycle();
            // If dead, drain the battery. If not, let charging get a head start.
            shield.endCycle(planet.getPowerRegenRate());
        // Run operations unrelated to fluctuating banner animation
        } else {
            // Checks to make sure game isn't over.
            if (isGameLive) {
                const status = planet.getStatus();
                isGameLive = status.quadrant1 || status.quadrant2 || status.quadrant3 || status.quadrant4;
                // No matter what let control panel be visible again.
                controlPanel.endCycle();
                // If game is over, stop increasing the score.
                scoreboard.endCycle();
                // If game is over, level can't change.
                levelHandler.endCycle();
                if (!isGameLive) levelHandler.endGame();
            }
            // Periodically check if things collided.
            if (jobCounter === 10) {
                CollisionatorSingleton.checkForCollisions(scene);
            }
            noAsteroids = asteroidGenerator.endCycle(isGameLive);
            noSaucers = saucerGenerator.endCycle(isGameLive);
            noMissiles = enemyMissileGenerator.endCycle(isGameLive);
            planet.endCycle(scoreboard.getBonuses());
            shield.endCycle(planet.getPowerRegenRate());
            // Game is still live but there are no more enemy missiles or asteroids.
            // Increase the level and refresh everything.
            if (isGameLive && noAsteroids && noMissiles && noSaucers) {
                levelHandler.nextLevel();
                scoreboard.endCycle(true);
                controlPanel.endCycle(true);
                // Adjust game save data.
                const status = planet.getStatus();
                gameLoadData.b1 = (status.quadrant1) ? 1 : 0;
                gameLoadData.b2 = (status.quadrant2) ? 1 : 0;
                gameLoadData.b3 = (status.quadrant3) ? 1 : 0;
                gameLoadData.b4 = (status.quadrant4) ? 1 : 0;
                gameLoadData.level = levelHandler.getLevel();
                gameLoadData.sat1 = (status.sat1) ? 1 : 0;
                gameLoadData.sat2 = (status.sat2) ? 1 : 0;
                gameLoadData.sat3 = (status.sat3) ? 1 : 0;
                gameLoadData.sat4 = (status.sat4) ? 1 : 0;
                gameLoadData.score = scoreboard.getScore();
                // Start the next wave of enemies.
                asteroidGenerator.refreshLevel(levelHandler.getLevel());
                saucerGenerator.refreshLevel(levelHandler.getLevel());
                enemyMissileGenerator.refreshLevel(levelHandler.getLevel(), levelHandler.getColor());
            }
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
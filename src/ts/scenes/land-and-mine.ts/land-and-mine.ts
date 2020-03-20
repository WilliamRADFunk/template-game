import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    Texture } from 'three';

import { SoundinatorSingleton } from '../../soundinator';
import { Actor } from '../../models/actor';
import { SceneType } from '../../models/scene-type';
import { getIntersections } from '../../utils/get-intersections';
import { ButtonBase } from '../../controls/buttons/button-base';
import { TextBase } from '../../controls/text/text-base';
import { createLander } from './actors/create-lander';
import { PlanetSpecifications } from '../../models/planet-specification';

// const border: string = '1px solid #FFF';
const border: string = 'none';

const HORIZONTAL_THRUST: number = 0.0001;

const VERTICAL_THRUST: number = 0.0002;

/**
 * @class
 * Screen dedicated to landing the lander on planetary surface to mine.
 */
export class LandAndMine {
    /**
     * List of actors in the scene.
     */
    private _actors: Actor[] = [];

    /**
     * List of buttons
     */
    private _buttons: { [key: string]: ButtonBase } = { };

    private _currentLanderHorizontalSpeed: number = 0.001;

    private _currentLanderVerticalSpeed: number = 0.001;

    private _isLeftThrusting: boolean = false;

    private _isRightThrusting: boolean = false;

    private _isVerticalThrusting: boolean = false;

    private _lander: Actor;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    private _planetSpecifications: PlanetSpecifications;

    /**
     * Reference to the scene, used to remove elements from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * Groups of text elements
     */
    private _textElements: { [key: string]: TextBase } = { };

    /**
     * Constructor for the Land and Mine (Scene) class
     * @param scene                     graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param landerTexture             texture for the lander.
     * @param planetSpecifications      details about the planet used to operate the scene.
     */
    constructor(
        scene: SceneType,
        landerTexture: Texture,
        planetSpecifications: PlanetSpecifications) {
        this._scene = scene.scene;
        this._planetSpecifications = planetSpecifications;

        this._onInitialize();
        this._listenerRef = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._listenerRef, false);

        const lander = createLander(landerTexture);
        this._lander = lander;
        this._actors.push(lander);
        this._scene.add(lander.mesh);

        // DOM Events
        const container = document.getElementById('mainview');
        document.onclick = event => {
            event.preventDefault();
            // Three JS object intersections.
            getIntersections(event, container, scene).forEach(el => {

            });
        };
        document.onmousemove = event => {

        };
        document.onkeydown = event => {
            console.log('onkeydown', event.keyCode, event);
            if (event.keyCode === 87) {
                this._isVerticalThrusting = true;
                return;
            } else if (event.keyCode === 65) {
                this._isLeftThrusting = true;
                return;
            } else if (event.keyCode === 68) {
                this._isRightThrusting = true;
                return;
            }
        };
        document.onkeyup = event => {
            console.log('onkeyup', event.keyCode, event);
            if (event.keyCode === 87) {
                this._isVerticalThrusting = false;
                return;
            } else if (event.keyCode === 65) {
                this._isLeftThrusting = false;
                return;
            } else if (event.keyCode === 68) {
                this._isRightThrusting = false;
                return;
            }
        };
    }

    /**
     * Creates all of the html elements for the first time on scene creation.
     */
    private _onInitialize(): void {
        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

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

    };

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        // Object.keys(this._textElements).forEach(x => x && this._textElements[x].dispose());
        // Object.keys(this._buttons).forEach(x => x && this._buttons[x].dispose());
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    public endCycle(): { substance: string, quantity: number }[] {
        // if (done) {
        //     return finishedObjectOrArray;
        // }
        const currPos = this._lander.mesh.position;
        if (this._isVerticalThrusting) {
            this._currentLanderVerticalSpeed -= VERTICAL_THRUST;
        }
        if (this._isLeftThrusting) {
            this._currentLanderHorizontalSpeed -= HORIZONTAL_THRUST;
        }
        if (this._isRightThrusting) {
            this._currentLanderHorizontalSpeed += HORIZONTAL_THRUST;
        }

        if (currPos.x < -6.2) {
            this._lander.mesh.position.set(6, currPos.y, currPos.z);
        }
        if (currPos.x > 6.2) {
            this._lander.mesh.position.set(-6, currPos.y, currPos.z);
        }

        this._lander.mesh.position.set(currPos.x + this._currentLanderHorizontalSpeed, currPos.y, currPos.z + this._currentLanderVerticalSpeed);
        this._currentLanderVerticalSpeed += this._planetSpecifications.gravity;

        // Object.keys(this._textElements).forEach(x => x && this._textElements[x].cycle());
        return null;
    }
}
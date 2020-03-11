import { Scene } from "three";

import { SoundinatorSingleton } from '../../soundinator';
import { SceneType } from "../../models/scene-type";
import { LeftTopPanel } from "../../controls/panels/left-top-panel";
import { RightTopPanel } from "../../controls/panels/right-top-panel";
import { LeftTopMiddlePanel } from "../../controls/panels/left-top-middle-panel";
import { RightTopMiddlePanel } from "../../controls/panels/right-top-middle-panel";
import { LeftBottomMiddlePanel } from "../../controls/panels/left-bottom-middle-panel";
import { RightBottomMiddlePanel } from "../../controls/panels/right-bottom-middle-panel";
import { LeftBottomPanel } from "../../controls/panels/left-bottom-panel";
import { RightBottomPanel } from "../../controls/panels/right-bottom-panel";
import { LoadButton } from "../../controls/buttons/load-button";
import { BUTTON_COLORS } from "../../styles/button-colors";
import { LeftTopTitleText } from "../../controls/text/left-top-title-text";
import { COLORS } from "../../styles/colors";
import { TextType } from "../../controls/text/text-type";
import { ButtonBase } from "../../controls/buttons/button-base";
import { RightTopTitleText } from "../../controls/text/right-top-title-text";
import { LeftTopMiddleTitleText } from "../../controls/text/left-top-middle-title-text";
import { RightTopMiddleTitleText } from "../../controls/text/right-top-middle-title-text";
import { LeftBottomMiddleTitleText } from "../../controls/text/left-bottom-middle-title-text";
import { RightBottomMiddleTitleText } from "../../controls/text/right-bottom-middle-title-text";

const border: string = '1px solid #FFF';
// const border: string = 'none';

const buttonScale: number = 2;

/**
 * @class
 * Keeps track of all things menu related accessible only to dev.
 */
export class DevMenu {
    /**
     * List of buttons
     */
    private _buttons: { [key: string]: ButtonBase } = {
        launchGameMenuButton: null,
        launchIntroSceneButton: null,
        launchRepairSceneButton: null,
        launchShipLayoutSceneButton: null,
        launchTravelSceneButton: null,
        launchVertexMapSceneButton: null
    };

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    /**
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private _scene: Scene;

    /**
     * Groups of text elements
     */
    private _textElements: { [key: string]: (LeftBottomMiddleTitleText | LeftTopTitleText | LeftTopMiddleTitleText | RightBottomMiddleTitleText | RightTopTitleText | RightTopMiddleTitleText) } = {
        leftBottomMiddleTitleText: null,
        leftTopMiddleTitleText: null,
        leftTopTitleText: null,
        rightBottomMiddleTitleText: null,
        rightTopMiddleTitleText: null,
        rightTopTitleText: null,
    }

    /**
     * Constructor for the Menu class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param menuFont loaded font to use for menu button text.
     * @hidden
     */
    constructor(scene: SceneType, callbacks: { [key: string]: () => void }) {
        this._scene = scene.scene;

        this._listenerRef = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._listenerRef, false);

        const leftTopPanel = new LeftTopPanel(this._scene);
        const rightTopPanel = new RightTopPanel(this._scene);
        const leftTopMiddlePanel = new LeftTopMiddlePanel(this._scene);
        const rightTopMiddlePanel = new RightTopMiddlePanel(this._scene);
        const leftBottomMiddlePanel = new LeftBottomMiddlePanel(this._scene);
        const rightBottomMiddlePanel = new RightBottomMiddlePanel(this._scene);
        const leftBottomPanel = new LeftBottomPanel(this._scene);
        const rightBottomPanel = new RightBottomPanel(this._scene);

        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        this._textElements.leftTopTitleText = new LeftTopTitleText(
            'Game Menu',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        let onClick = () => {
            SoundinatorSingleton.playClick();
            this._buttons.launchGameMenuButton.disable();
            callbacks.activateGameMenu();
        };

        this._buttons.launchGameMenuButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.1 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._textElements.rightTopTitleText = new RightTopTitleText(
            'Intro Scene',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            SoundinatorSingleton.playClick();
            this._buttons.launchIntroSceneButton.disable();
            callbacks.activateIntroScene();
        };

        this._buttons.launchIntroSceneButton = new LoadButton(
            { left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.1 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._textElements.leftTopMiddleTitleText = new LeftTopMiddleTitleText(
            'Ship Layout Scene',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            SoundinatorSingleton.playClick();
            this._buttons.launchShipLayoutSceneButton.disable();
            callbacks.activateShipLayoutScene();
        };

        this._buttons.launchShipLayoutSceneButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.375 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._textElements.rightTopMiddleTitleText = new RightTopMiddleTitleText(
            'Repair Scene',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            SoundinatorSingleton.playClick();
            this._buttons.launchRepairSceneButton.disable();
            callbacks.activateRepairScene();
        };

        this._buttons.launchRepairSceneButton = new LoadButton(
            { left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.375 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._textElements.leftBottomMiddleTitleText = new LeftBottomMiddleTitleText(
            'Travel Scene',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            SoundinatorSingleton.playClick();
            this._buttons.launchTravelSceneButton.disable();
            callbacks.activateTravelScene();
        };

        this._buttons.launchTravelSceneButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.61 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._textElements.rightBottomMiddleTitleText = new RightBottomMiddleTitleText(
            'Vertex Map Scene',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            SoundinatorSingleton.playClick();
            this._buttons.launchVertexMapSceneButton.disable();
            callbacks.activateVertexMapScene();
        };

        this._buttons.launchVertexMapSceneButton = new LoadButton(
            { left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.61 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);
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

        // Update the various buttons
        this._buttons.launchGameMenuButton.resize({ left: left + (0.115 * width), height, top: 0.1 * height, width });
        this._buttons.launchIntroSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.115 * width), height, top: 0.1 * height, width });
        this._buttons.launchRepairSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.375 * height, width });
        this._buttons.launchShipLayoutSceneButton.resize({ left: left + (0.115 * width), height, top: 0.375 * height, width });
        this._buttons.launchTravelSceneButton.resize({ left: left + (0.115 * width), height, top: 0.61 * height, width });
        this._buttons.launchVertexMapSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.61 * height, width });

        // Update the various texts
        this._textElements.rightBottomMiddleTitleText.resize({ left, height, top: null, width });
        this._textElements.leftBottomMiddleTitleText.resize({ left, height, top: null, width });
        this._textElements.leftTopMiddleTitleText.resize({ left, height, top: null, width });
        this._textElements.rightTopMiddleTitleText.resize({ left, height, top: null, width });
        this._textElements.leftTopTitleText.resize({ left, height, top: null, width });
        this._textElements.rightTopTitleText.resize({ left, height, top: null, width });
    };

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        Object.keys(this._textElements).forEach(x => this._textElements[x] && this._textElements[x].dispose());
        Object.keys(this._buttons).forEach(x => this._buttons[x] && this._buttons[x].dispose());
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * Something called once per frame on every scene.
     */
    public endCycle(): void {
        Object.keys(this._textElements).forEach(el => this._textElements[el] && this._textElements[el].cycle());
    }

}
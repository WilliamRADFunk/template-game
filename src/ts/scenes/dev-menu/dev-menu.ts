import { Scene, Texture } from "three";

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
import { LeftTopTitleText } from "../../controls/text/title/left-top-title-text";
import { COLORS } from "../../styles/colors";
import { TextType } from "../../controls/text/text-type";
import { ButtonBase } from "../../controls/buttons/button-base";
import { RightTopTitleText } from "../../controls/text/title/right-top-title-text";
import { LeftTopMiddleTitleText } from "../../controls/text/title/left-top-middle-title-text";
import { RightTopMiddleTitleText } from "../../controls/text/title/right-top-middle-title-text";
import { LeftBottomMiddleTitleText } from "../../controls/text/title/left-bottom-middle-title-text";
import { RightBottomMiddleTitleText } from "../../controls/text/title/right-bottom-middle-title-text";
import { LeftBottomTitleText } from "../../controls/text/title/left-bottom-title-text";
import { NextButton } from "../../controls/buttons/next-button";
import { RightBottomTitleText } from "../../controls/text/title/right-bottom-title-text";
import { TextMap } from "../../models/text-map";
import { PreviousButton } from "../../controls/buttons/previous-button";
import { LeftTopProfile } from "../../controls/profiles/left-top-profile";
import { RightTopProfile } from "../../controls/profiles/right-top-profile";
import { RightTopMiddleProfile } from "../../controls/profiles/right-top-middle-profile";
import { LeftTopMiddleProfile } from "../../controls/profiles/left-top-middle-profile";
import { LeftBottomMiddleProfile } from "../../controls/profiles/left-bottom-middle-profile";
import { RightBottomMiddleProfile } from "../../controls/profiles/right-bottom-middle-profile";
import { LeftBottomProfile } from "../../controls/profiles/left-bottom-profile";
import { RightBottomProfile } from "../../controls/profiles/right-bottom-profile";
import { LeftTopDialogueText } from "../../controls/text/dialogue/left-top-dialogue-text";

const border: string = '1px solid #FFF';
// const border: string = 'none';

const buttonScale: number = 2;

/**
 * @class
 * Keeps track of all things menu related accessible only to dev.
 */
export class DevMenu {
    /**
     * List of profiles on page 1.
     */
    private _page1profiles: { [key: string]: LeftTopProfile | RightTopProfile } = {};

    /**
     * List of profiles on page 2.
     */
    private _page2profiles: { [key: string]: LeftBottomMiddleProfile | LeftTopMiddleProfile | LeftTopProfile | RightBottomMiddleProfile | RightTopMiddleProfile | RightTopProfile } = {
        leftBottomMiddleProfile: null,
        leftTopMiddleProfile: null,
        leftTopProfile: null,
        rightBottomMiddleProfile: null,
        rightTopProfile: null,
        rightTopMiddleProfile: null
    };

    /**
     * List of profiles on page 3.
     */
    private _page3profiles: { [key: string]: LeftBottomProfile | RightBottomProfile } = {
        leftBottomProfile3: null,
        rightBottomProfile3: null
    };

    /**
     * List of profiles.
     */
    private _profiles: { [key: string]: LeftTopProfile | RightTopProfile } = {
        ...this._page1profiles,
        ...this._page2profiles,
        ...this._page3profiles
    };

    /**
     * List of buttons on page 1.
     */
    private _page1buttons: { [key: string]: ButtonBase } = {
        launchGameMenuButton: null,
        launchIntroSceneButton: null,
        launchLandAndMineSceneButton: null,
        launchRepairSceneButton: null,
        launchShipLayoutSceneButton: null,
        launchTravelSceneButton: null,
        launchVertexMapSceneButton: null,
        nextPageButton: null,
    };
    /**
     * List of buttons on page 2.
     */
    private _page2buttons: { [key: string]: ButtonBase } = {
        launchPlanetRaidSceneButton: null,
        nextPageButton2: null,
        previousPageButton2: null,
    };
    /**
     * List of buttons on page 3.
     */
    private _page3buttons: { [key: string]: ButtonBase } = {
        previousPageButton3: null,
    };

    /**
     * List of buttons.
     */
    private _buttons: { [key: string]: ButtonBase };

    /**
     * Current page number.
     */
    private _currentPage: number = 1;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    /**
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private _scene: Scene;

    /**
     * Groups of text elements for page 1.
     */
    private _page1textElements: TextMap = {
        leftBottomMiddleTitleText: null,
        leftBottomTitleText: null,
        leftTopMiddleTitleText: null,
        leftTopTitleText: null,
        rightBottomTitleText: null,
        rightBottomMiddleTitleText: null,
        rightTopMiddleTitleText: null,
        rightTopTitleText: null,
    };

    /**
     * Groups of text elements for page 2.
     */
    private _page2textElements: TextMap = {
        leftBottomTitleText2: null,
        leftTopDialogueText2: null,
        rightBottomTitleText2: null
    };

    /**
     * Groups of text elements for page 3.
     */
    private _page3textElements: TextMap = {
        leftBottomTitleText3: null
    };

    /**
     * Groups of text elements.
     */
    private _textElements: TextMap;

    /**
     * Groups of text texture.
     */
    private readonly _textures: { [key: string]: Texture };

    /**
     * Constructor for the Menu class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param menuFont loaded font to use for menu button text.
     * @hidden
     */
    constructor(scene: SceneType, callbacks: { [key: string]: () => void }, textures: { [key: string]: Texture }) {
        this._scene = scene.scene;
        this._textures = textures;

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

        this._page1textElements.leftTopTitleText = new LeftTopTitleText(
            'Game Menu',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        let onClick = () => {
            this._page1buttons.launchGameMenuButton.disable();
            callbacks.activateGameMenu();
        };

        this._page1buttons.launchGameMenuButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.1 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._page1textElements.rightTopTitleText = new RightTopTitleText(
            'Intro',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchIntroSceneButton.disable();
            callbacks.activateIntroScene();
        };

        this._page1buttons.launchIntroSceneButton = new LoadButton(
            { left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.1 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._page1textElements.leftTopMiddleTitleText = new LeftTopMiddleTitleText(
            'Ship Layout',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchShipLayoutSceneButton.disable();
            callbacks.activateShipLayoutScene();
        };

        this._page1buttons.launchShipLayoutSceneButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.375 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._page1textElements.rightTopMiddleTitleText = new RightTopMiddleTitleText(
            'Repair',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchRepairSceneButton.disable();
            callbacks.activateRepairScene();
        };

        this._page1buttons.launchRepairSceneButton = new LoadButton(
            { left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.375 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._page1textElements.leftBottomMiddleTitleText = new LeftBottomMiddleTitleText(
            'Travel',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchTravelSceneButton.disable();
            callbacks.activateTravelScene();
        };

        this._page1buttons.launchTravelSceneButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.61 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._page1textElements.rightBottomMiddleTitleText = new RightBottomMiddleTitleText(
            'Vertex Map',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchVertexMapSceneButton.disable();
            callbacks.activateVertexMapScene();
        };

        this._page1buttons.launchVertexMapSceneButton = new LoadButton(
            { left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.61 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._page1textElements.leftBottomTitleText = new LeftBottomTitleText(
            'Land & Mine',
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.launchLandAndMineSceneButton.disable();
            callbacks.activateLandAndMineScene();
        };

        this._page1buttons.launchLandAndMineSceneButton = new LoadButton(
            { left: left + (0.115 * width), height, top: 0.845 * height, width },
            BUTTON_COLORS,
            onClick,
            true,
            buttonScale);

        this._page1textElements.rightBottomTitleText = new RightBottomTitleText(
            'Next Page',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);

        onClick = () => {
            this._page1buttons.nextPageButton.disable();
            this._next();
            this._page1buttons.nextPageButton.enable();
        };

        this._page1buttons.nextPageButton = new NextButton(
            { left: left + width - (0.29 * width), height, top: 0.845 * height, width },
            BUTTON_COLORS,
            onClick,
            true);

        // Page 2
        this._page2profiles.leftBottomMiddleProfile = new LeftBottomMiddleProfile(this._scene, this._textures.engineer2);
        this._page2profiles.leftTopMiddleProfile = new LeftTopMiddleProfile(this._scene, this._textures.engineer);
        this._page2profiles.leftTopProfile = new LeftTopProfile(this._scene, this._textures.engineer2);
        this._page2profiles.rightBottomMiddleProfile = new RightBottomMiddleProfile(this._scene, this._textures.engineer2);
        this._page2profiles.rightTopMiddleProfile = new RightTopMiddleProfile(this._scene, this._textures.engineer2);
        this._page2profiles.rightTopProfile = new RightTopProfile(this._scene, this._textures.engineer);
        this._page2profiles.leftBottomMiddleProfile.hide();
        this._page2profiles.leftTopMiddleProfile.hide();
        this._page2profiles.leftTopProfile.hide();
        this._page2profiles.rightBottomMiddleProfile.hide();
        this._page2profiles.rightTopMiddleProfile.hide();
        this._page2profiles.rightTopProfile.hide();

        this._page2textElements.leftTopDialogueText2 = new LeftTopDialogueText(
            `This is the launching point for PLANET RAID scene. Click load button to launch it.`,
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.DIALOGUE);
        this._page2textElements.leftTopDialogueText2.hide();

        onClick = () => {
            this._page2buttons.launchPlanetRaidSceneButton.disable();
            callbacks.activatePlanetRaid();
        };

        this._page2buttons.launchPlanetRaidSceneButton = new LoadButton(
            { left: left + (0.29 * width), height, top: 0.20 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        this._page2buttons.launchPlanetRaidSceneButton.hide();

        this._page2textElements.leftBottomTitleText2 = new LeftBottomTitleText(
            'Previous Page',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);
        this._page2textElements.leftBottomTitleText2.hide();

        onClick = () => {
            this._page2buttons.previousPageButton2.disable();
            this._previous();
            this._page2buttons.previousPageButton2.enable();
        };

        this._page2buttons.previousPageButton2 = new PreviousButton(
            { left: left + (0.21 * width), height, top: 0.845 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        this._page2buttons.previousPageButton2.hide();

        this._page2textElements.rightBottomTitleText2 = new RightBottomTitleText(
            'Next Page',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);
        this._page2textElements.rightBottomTitleText2.hide();

        onClick = () => {
            this._page2buttons.nextPageButton2.disable();
            this._next();
            this._page2buttons.nextPageButton2.enable();
        };

        this._page2buttons.nextPageButton2 = new NextButton(
            { left: left + width - (0.29 * width), height, top: 0.845 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        this._page2buttons.nextPageButton2.hide();

        // Page 3
        this._page3profiles.leftBottomProfile3 = new LeftBottomProfile(this._scene, this._textures.engineer2);
        this._page3profiles.rightBottomProfile3 = new RightBottomProfile(this._scene, this._textures.engineer);
        this._page3profiles.leftBottomProfile3.hide();
        this._page3profiles.rightBottomProfile3.hide();

        this._page3textElements.leftTopTitleText3 = new LeftTopTitleText(
            'Previous Page',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);
        this._page3textElements.leftTopTitleText3.hide();

        onClick = () => {
            this._page3buttons.previousPageButton3.disable();
            this._previous();
            this._page3buttons.previousPageButton3.enable();
        };

        this._page3buttons.previousPageButton3 = new PreviousButton(
            { left: left + (0.21 * width), height, top: 0.115 * height, width },
            BUTTON_COLORS,
            onClick,
            true);
        this._page3buttons.previousPageButton3.hide();

        this._textElements = {
            ...this._page1textElements,
            ...this._page2textElements,
            ...this._page3textElements
        };
        this._buttons = {
            ...this._page1buttons,
            ...this._page2buttons,
            ...this._page3buttons
        };
    }

    /**
     * Transitions to the next page in the dev menu options.
     */
    private _next(): void {
        this._currentPage++;
        if (this._currentPage === 2) {
            Object.keys(this._page1textElements).forEach(x => this._page1textElements[x] && this._page1textElements[x].hide());
            Object.keys(this._page1buttons).forEach(x => this._page1buttons[x] && this._page1buttons[x].hide());
            Object.keys(this._page1profiles).forEach(x => this._page1profiles[x] && this._page1profiles[x].hide());
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].show());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].show());
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].show());
        } else if (this._currentPage === 3) {
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].hide());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].hide());
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].hide());
            Object.keys(this._page3textElements).forEach(x => this._page3textElements[x] && this._page3textElements[x].show());
            Object.keys(this._page3buttons).forEach(x => this._page3buttons[x] && this._page3buttons[x].show());
            Object.keys(this._page3profiles).forEach(x => this._page3profiles[x] && this._page3profiles[x].show());
        }
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
        this._buttons.launchIntroSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.1 * height, width });
        this._buttons.launchLandAndMineSceneButton.resize({ left: left + (0.115 * width), height, top: 0.845 * height, width });
        this._buttons.launchPlanetRaidSceneButton.resize({ left: left + (0.29 * width), height, top: 0.20 * height, width });
        this._buttons.launchRepairSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.375 * height, width });
        this._buttons.launchShipLayoutSceneButton.resize({ left: left + (0.115 * width), height, top: 0.375 * height, width });
        this._buttons.launchTravelSceneButton.resize({ left: left + (0.115 * width), height, top: 0.61 * height, width });
        this._buttons.launchVertexMapSceneButton.resize({ left: left + width - (buttonScale * 0.12 * width) - (0.14 * width), height, top: 0.61 * height, width });
        this._buttons.nextPageButton.resize({ left: left + width - (0.29 * width), height, top: 0.845 * height, width });
        this._buttons.nextPageButton2.resize({ left: left + width - (0.29 * width), height, top: 0.845 * height, width });
        this._buttons.previousPageButton2.resize({ left: left + (0.21 * width), height, top: 0.845 * height, width });
        this._buttons.previousPageButton3.resize({ left: left + (0.21 * width), height, top: 0.115 * height, width });

        // Update the various texts
        Object.keys(this._textElements).forEach(el =>this._textElements[el] && this._textElements[el].resize({ left, height, top: null, width }));
    };

    /**
     * Transitions to the previous page in the dev menu options.
     */
    private _previous(): void {
        this._currentPage--;
        if (this._currentPage === 1) {
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].hide());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].hide());
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].hide());
            Object.keys(this._page1textElements).forEach(x => this._page1textElements[x] && this._page1textElements[x].show());
            Object.keys(this._page1buttons).forEach(x => this._page1buttons[x] && this._page1buttons[x].show());
            Object.keys(this._page1profiles).forEach(x => this._page1profiles[x] && this._page1profiles[x].show());
        } else if (this._currentPage === 2) {
            Object.keys(this._page3textElements).forEach(x => this._page3textElements[x] && this._page3textElements[x].hide());
            Object.keys(this._page3buttons).forEach(x => this._page3buttons[x] && this._page3buttons[x].hide());
            Object.keys(this._page3profiles).forEach(x => this._page3profiles[x] && this._page3profiles[x].hide());
            Object.keys(this._page2textElements).forEach(x => this._page2textElements[x] && this._page2textElements[x].show());
            Object.keys(this._page2buttons).forEach(x => this._page2buttons[x] && this._page2buttons[x].show());
            Object.keys(this._page2profiles).forEach(x => this._page2profiles[x] && this._page2profiles[x].show());
        }
    }

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
        Object.keys(this._textElements).forEach(el =>
            this._textElements[el]
            && this._textElements[el].element.style.visibility === 'visible'
            && this._textElements[el].cycle());
    }

}
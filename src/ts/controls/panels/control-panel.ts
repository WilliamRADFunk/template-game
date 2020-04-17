import { FunctionMap } from "../../models/function-map";
import { HTMLElementPosition } from "../../models/html-element-position";
import { FreestyleSquareButton } from "../buttons/freestyle-square-button";
import { BUTTON_COLORS } from "../../styles/button-colors";
import { SoundinatorSingleton } from "../../soundinator";

/**
 * @class
 * Base class for control panel in any scene of the game.
 */
export class ControlPanel {
    /**
     * List of buttons in the control panel.
     */
    private readonly _buttons: { [key: string]: FreestyleSquareButton } = {};

    /**
     * List of callback functions from Control Panel creator to pair with matching buttons.
     */
    private readonly _callbacks: FunctionMap;

    /**
     * When pause button is pressed, a previous state may be captured for return when play button is pressed.
     */
    private _prevState: any;

    /**
     * HTMLElement that is the panel itself.
     */
    public readonly element: HTMLElement;

    /**
     * Id attribute on the element.
     */
    public readonly id: string;

    /**
     * Constructor for the text base class
     * @param id id attribute on the element.
     * @param sentence text content in the element.
     * @param color color attribute on the element.
     * @param align test align attribute on the element.
     * @param border border attribute on the element.
     * @param type type of text on the element.
     */
    constructor(position: HTMLElementPosition, callbacks: FunctionMap, startPaused?: boolean) {
        this.element = document.createElement('div');
        this.element.id = this.id = 'control-panel';
        this.element.style.fontFamily = 'Luckiest Guy';
        this.element.style.color = '#CCC';
        this.element.style.position = 'absolute';
        this.element.style.position = 'absolute';
        this.element.style.backgroundColor = '#000';
        this.element.style.overflowY = 'hidden';
        this.element.style.textAlign = 'center';
        this.element.style.border = '1px solid #CCC';
        this.element.style.borderRadius = '5px';

        this._callbacks = callbacks;

        document.body.appendChild(this.element);

        this._buttons.helpButton = new FreestyleSquareButton(
            { height: position.height, left: position.left + (0.964 * position.width), top: ( 0.964 * position.height), width: position.width },
            BUTTON_COLORS,
            this._onHelpClicked.bind(this),
            true,
            'fa-question',
            0.5);

        this._buttons.settingsButton = new FreestyleSquareButton(
            { height: position.height, left: position.left + (0.93 * position.width), top: ( 0.964 * position.height), width: position.width },
            BUTTON_COLORS,
            this._onSettingsClicked.bind(this),
            true,
            'fa-gear',
            0.5);

        this._buttons.soundMuffledButton = new FreestyleSquareButton(
            { height: position.height, left: position.left + (0.896 * position.width), top: ( 0.964 * position.height), width: position.width },
            BUTTON_COLORS,
            () => {},
            false,
            'fa-volume-down',
            0.5);

        this._buttons.soundOffButton = new FreestyleSquareButton(
            { height: position.height, left: position.left + (0.896 * position.width), top: ( 0.964 * position.height), width: position.width },
            BUTTON_COLORS,
            this._onSoundOffClicked.bind(this),
            false,
            'fa-volume-off',
            0.5);

        this._buttons.soundOnButton = new FreestyleSquareButton(
            { height: position.height, left: position.left + (0.896 * position.width), top: ( 0.964 * position.height), width: position.width },
            BUTTON_COLORS,
            this._onSoundOnClicked.bind(this),
            true,
            'fa-volume-up',
            0.5);

        this._buttons.pauseButton = new FreestyleSquareButton(
            { height: position.height, left: position.left + (0.862 * position.width), top: ( 0.964 * position.height), width: position.width },
            BUTTON_COLORS,
            this._onPauseClicked.bind(this),
            true,
            'fa-pause',
            0.5);

        this._buttons.playButton = new FreestyleSquareButton(
            { height: position.height, left: position.left + (0.862 * position.width), top: ( 0.964 * position.height), width: position.width },
            BUTTON_COLORS,
            this._onPlayClicked.bind(this),
            false,
            'fa-play',
            0.5);

        SoundinatorSingleton.getMute() ? this._buttons.soundOnButton.show() : this._buttons.soundOnButton.hide();
        SoundinatorSingleton.getMute() ? this._buttons.soundOnButton.hide() : this._buttons.soundOnButton.show();
        startPaused ? this._buttons.pauseButton.show() : this._buttons.pauseButton.hide();
        startPaused ? this._buttons.playButton.hide() : this._buttons.playButton.show();

        this.resize(position);
    }

    private _onHelpClicked(): void {
        console.log('Control Panel: Help Button Clicked');
        this._callbacks.help();
    }

    private _onPauseClicked(): void {
        console.log('Control Panel: Pause Button Clicked');
        this._prevState = this._callbacks.pause();
        this._buttons.pauseButton.hide();
        this._buttons.playButton.show();
    }

    private _onPlayClicked(): void {
        console.log('Control Panel: Play Button Clicked');
        this._callbacks.play(this._prevState);
        this._buttons.pauseButton.show();
        this._buttons.playButton.hide();
    }

    private _onSettingsClicked(): void {
        console.log('Control Panel: Settings Button Clicked');
        this._callbacks.settings();
    }

    private _onSoundOffClicked(): void {
        console.log('Control Panel: Sound Off Button Clicked');
        SoundinatorSingleton.toggleMute(false);
        this._buttons.soundOffButton.hide();
        this._buttons.soundOnButton.show();
    }

    private _onSoundOnClicked(): void {
        console.log('Control Panel: Sound On Button Clicked');
        SoundinatorSingleton.toggleMute(true);
        this._buttons.soundOffButton.show();
        this._buttons.soundOnButton.hide();
    }

    /**
     * Remove the element from the DOM
     */
    public dispose() {
        this.element && this.element.remove();
    }

    /**
     * Hides the button from visibility.
     */
    public hide() {
        this.element.style.visibility = 'hidden';
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition) {
        this.element.style.maxWidth = `${0.1425 * position.width}px`;
        this.element.style.width = `${0.1425 * position.width}px`;
        this.element.style.maxHeight = `${0.04 * position.height}px`;
        this.element.style.height = `${0.04 * position.height}px`;
        this.element.style.top = `${0.958 * position.height}px`;
        this.element.style.left = `${position.left + (0.8555 * position.width)}px`;
        this.element.style.fontSize = `${0.03 * position.width}px`;

        this._buttons.helpButton.resize({ height: position.height, left: position.left + (0.964 * position.width), top: ( 0.964 * position.height), width: position.width });
        this._buttons.settingsButton.resize({ height: position.height, left: position.left + (0.93 * position.width), top: ( 0.964 * position.height), width: position.width });
        this._buttons.soundMuffledButton.resize({ height: position.height, left: position.left + (0.896 * position.width), top: ( 0.964 * position.height), width: position.width });
        this._buttons.soundOffButton.resize({ height: position.height, left: position.left + (0.896 * position.width), top: ( 0.964 * position.height), width: position.width });
        this._buttons.soundOnButton.resize({ height: position.height, left: position.left + (0.896 * position.width), top: ( 0.964 * position.height), width: position.width });
        this._buttons.pauseButton.resize({ height: position.height, left: position.left + (0.862 * position.width), top: ( 0.964 * position.height), width: position.width });
        this._buttons.playButton.resize({ height: position.height, left: position.left + (0.862 * position.width), top: ( 0.964 * position.height), width: position.width });
    }

    /**
     * Makes the button visible.
     */
    public show() {
        this.element.style.visibility = 'visible';
    }
}
import { HTMLElementPosition } from "../../models/html-element-position";
import { TextType } from "./text-type";

/**
 * @class
 * Base class for text anywhere in the game.
 */
export class TextBase {
    /**
     * Cycle counter
     */
    private _counter: number = 2;

    /**
     * Tracks which index of the sentence string cycle is currently on.
     */
    private _currentIndex: number = 0;

    /**
     * Counter of cycles in holding
     */
    private _holdCount: number = -1;

    /**
     * Flag to denote text is in fade-in mode.
     */
    private _isFadeIn: boolean = true;

    /**
     * Flag to denote text is finished revealing all of the letters.
     */
    private _isFinished: boolean = false;

    /**
     * Flag to denote text is in holding mode.
     */
    private _isHolding: boolean = false;

    /**
     * Type of text. Used to determine action on cycle event.
     */
    private _type: TextType;

    /**
     * Text color.
     */
    public color: string;

    /**
     * HTMLElement that is the text itself.
     */
    public readonly element: HTMLElement;

    /**
     * Id attribute on the element.
     */
    public readonly id: string;

    /**
     * Text content.
     */
    public sentence: string = '';

    /**
     * Constructor for the text base class
     * @param id id attribute on the element.
     * @param sentence text content in the element.
     * @param color color attribute on the element.
     * @param align test align attribute on the element.
     * @param border border attribute on the element.
     * @param type type of text on the element.
     */
    constructor(id: string, sentence: string, color: string, align: string, border: string, type: TextType) {
        this.element = document.createElement('div');
        this.element.id = this.id = id;
        this.element.style.fontFamily = 'Luckiest Guy';
        this.element.style.color = this.color = color;
        this.element.style.position = 'absolute';
        this.element.style.backgroundColor = 'transparent';
        this.element.style.overflowY = 'hidden';
        this.element.style.textAlign = align;
        this.element.style.border = border;

        this.sentence = sentence;
        this.element.innerHTML = sentence;

        this._type = type;

        this.element.onclick = () => {
            this.element.innerHTML = sentence;
            this._isFinished = true;
            this.element.style.opacity = '1';
            this._isHolding = true;
        };
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
     * Activates button changes related to onmouseleave listeners.
     * @param color the color the text should have.
     */
    public cycle(color?: string): void {
        if (this._type === TextType.STATIC) {
            if (this._isHolding) {
                return;
            }
            this.element.style.opacity = '1';
            this._isHolding = true;
        } else if (this._type === TextType.DIALOGUE) {
            if (this._isFinished) {
                return;
            }
            this._counter += 1;
            if (this._counter % 3 === 0 && this._currentIndex < this.sentence.length) {
                this._currentIndex++;
                if (this.sentence.charAt(this._currentIndex - 1) === '<') {
                    this._currentIndex += 3;
                }if (this.sentence.charAt(this._currentIndex - 1) === '&') {
                    this._currentIndex += 11;
                }
                if (this.element) {
                    this.element.innerHTML = this.sentence.slice(0, this._currentIndex);
                }
            }
            if (this._currentIndex >= this.sentence.length) {
                this._isFinished = true;
            }
        } else if (this._type === TextType.FADABLE) {
            if (this._isHolding) {
                return;
            }
            if (this._isFadeIn && this._counter > 20) {
                this._isFadeIn = false;
                this._isHolding = true;
                this._counter = 1;
            }
            if (this._isFadeIn) {
                this.element.style.opacity = (this._counter / 20) + '';
                this._counter++;
                this.element.style.color = color;
            }
        }

        if (color) {
            this.element.style.color = this.color = color;
        }
    }

    /**
     * Determines whether the text is visible or not.
     * @returns TRUE == visible, FALSE == not visible
     */
    public isVisible(): boolean {
        return this.element.style.visibility === 'visible';
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition) {}

    /**
     * Makes the button visible.
     */
    public show() {
        this.update();
        this.element.style.visibility = 'visible';
    }

    /**
     * Updates the content of the text.
     */
    public update(sentence?: string): void {
        this._isFadeIn = true;
        this._isHolding = false;
        this._counter = 1;
        this._currentIndex = 0;
        this._isFinished = false;
        if (sentence) {
            this.element.innerHTML = this.sentence = sentence;

            this.element.onclick = () => {
                this.element.innerHTML = sentence;
                this._isFinished = true;
                this.element.style.opacity = '1';
                this._isHolding = true;
            };
        }
    }
}
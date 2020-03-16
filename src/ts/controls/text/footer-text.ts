import { TextBase } from "./text-base";
import { HTMLElementPosition } from "../../models/html-element-position";
import { TextType } from "./text-type";

/**
 * @class
 * Text class for text that will appear in the bottom of the screen, usually left corner.
 */
export class FooterText extends TextBase {
    /**
     * Scale to apply to button dimensions.
     */
    private _scale: number;

    /**
     * Constructor for the play button sub class
     * @param sentence starting text content.
     * @param position height, width, left and top position of the button.
     * @param color color of the text.
     * @param align text align.
     * @param border debug border around the text.
     * @param type type of text. Used to determine action on cycle event.
     * @param scale scale to apply to button dimensions.
     */
    constructor(
        sentence: string,
        position: HTMLElementPosition,
        color: string,
        align: string,
        border: string,
        type: TextType,
        scale?: number) {
        super('footer-text', sentence, color, align, border, type);

        this._scale = scale || 1;

        document.body.appendChild(this.element);

        this.resize(position);
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition) {
        this.element.style.maxWidth = `${this._scale * (0.50 * position.width)}px`;
        this.element.style.width = `${this._scale * (0.50 * position.width)}px`;
        this.element.style.maxHeight = `${this._scale * (0.04 * position.height)}px`;
        this.element.style.height = `${this._scale * (0.04 * position.height)}px`;
        this.element.style.top = `${position.top}px`;
        this.element.style.left = `${position.left}px`;
        this.element.style.fontSize = `${this._scale * (0.03 * position.width)}px`;
    }
}
import { TextBase } from "./text-base";
import { HTMLElementPosition } from "../../models/html-element-position";
import { TextType } from "./text-type";

let index = 0;

/**
 * @class
 * Text class for text that will appear where position tells it to be.
 */
export class FreestyleText extends TextBase {
    /**
     * Optionally set font size modifier.
     */
    private _fontSize: number;

    /**
     * Optionally set padding top modifier.
     */
    private _topPadding: number;

    /**
     * Constructor for the freestyle text sub class
     * @param sentence starting text content.
     * @param position height, width, left and top position of the button.
     * @param color color of the text.
     * @param border debug border around the text.
     * @param type type of text. Used to determine action on cycle event.
     */
    constructor(
        sentence: string,
        position: HTMLElementPosition,
        color: string,
        border: string,
        type: TextType,
        fontSize?: number,
        topPadding?: number,
        alignment?: string) {
        index++;
        super(`freestyle-text-${index}`, sentence, color, alignment || 'left', border, type);

        this._fontSize = fontSize || 0.0175;
        this._topPadding = topPadding || 0.006875;

        document.body.appendChild(this.element);

        this.resize(position);
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition) {
        this.element.style.top = `${position.top}px`;
        this.element.style.left = `${position.left}px`;
        this.element.style.fontSize = `${this._fontSize * position.width}px`;
        this.element.style.paddingTop = `${this._topPadding * position.width}px`;
    }
}
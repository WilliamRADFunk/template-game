import { TextBase } from "../../../controls/text/text-base";
import { HTMLElementPosition } from "../../../models/html-element-position";
import { TextType } from "../../../controls/text/text-type";

/**
 * @class
 * Text class for text that will appear center/center.
 */
export class MineCountText extends TextBase {
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
        type: TextType) {
        super(`mine-count-text`, sentence, color, 'center', border, type);

        document.body.appendChild(this.element);

        this.resize(position);
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition) {
        this.element.style.top = `${0.4 * position.height}px`;
        this.element.style.left = `${position.left + (0.5 * position.width) - 50}px`;
        this.element.style.maxWidth = '100px';
        this.element.style.width = '100px';
        this.element.style.fontSize = `${0.0175 * position.width}px`;
    }
}
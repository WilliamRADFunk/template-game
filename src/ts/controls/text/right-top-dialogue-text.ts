import { TextBase } from "./text-base";
import { HTMLElementPosition } from "../../models/html-element-position";
import { TextType } from "./text-type";

export class RightTopDialogueText extends TextBase {
    /**
     * Constructor for the right top dialogue text sub class
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
        super('right-top-dialogue-text', color, 'left', border, type);

        this.element.innerHTML = sentence;
        document.body.appendChild(this.element);

        this.resize(position);
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition) {
        this.element.style.maxWidth = `${0.25 * position.width}px`;
        this.element.style.width = `${0.25 * position.width}px`;
        this.element.style.maxHeight = `${0.24 * position.height}px`;
        this.element.style.height = `${0.24 * position.height}px`;
        this.element.style.top = `${0.01 * position.height}px`;
        this.element.style.left = `${position.left + (0.5 * position.width)}px`;
        this.element.style.fontSize = `${0.017 * position.width}px`;
    }
}
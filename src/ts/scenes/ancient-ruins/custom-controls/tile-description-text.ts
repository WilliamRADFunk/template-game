import { TextBase } from "../../../controls/text/text-base";
import { HTMLElementPosition } from "../../../models/html-element-position";
import { TextType } from "../../../controls/text/text-type";
import { COLORS } from "../../../styles/colors";

/**
 * @class
 * Text class for text that will appear lower-right in faded panel.
 */
export class TileDescriptionText extends TextBase {
    /**
     * Constructor for the Tile Description Text text sub class
     * @param sentence starting text content.
     * @param position height, width, left and top position of the button.
     * @param color color of the text.
     * @param border debug border around the text.
     * @param type type of text. Used to determine action on cycle event.
     */
    constructor(
        sentence: string,
        position: HTMLElementPosition,
        border: string) {
        super(`tile-description-text`, sentence, COLORS.neutral, 'left', border, TextType.STATIC);

        document.body.appendChild(this.element);

        this.resize(position);
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition) {
        this.element.style.top = `${0.872 * position.height}px`;
        this.element.style.left = `${position.left + (0.659 * position.width)}px`;
        this.element.style.height = `${0.08 * position.width}px`;
        this.element.style.maxHeight = `${0.08 * position.width}px`;
        this.element.style.maxWidth = `${0.331 * position.width}px`;
        this.element.style.width = `${0.331 * position.width}px`;
        this.element.style.fontSize = `${0.013 * position.width}px`;
        this.element.style.padding = '0px';
        this.element.style.textOverflow = 'ellipsis';
    }
}
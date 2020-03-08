import { ButtonBase } from "./button-base";
import { HTMLElementPosition } from "../../models/html-element-position";
import { ButtonColors } from "../../models/button-colors";

export class MinusButton extends ButtonBase {
    /**
     * Scale to apply to button dimensions.
     */
    private _scale: number;

    /**
     * Constructor for the minus button sub class
     * @param position height, width, left and top position of the button.
     * @param colors colors of the buttons at the different stages of its lifecycle.
     * @param onClick callback for onClick event.
     * @param visible whether or not to start the button in a visible state.
     * @param scale scale to apply to button dimensions.
     */
    constructor(position: HTMLElementPosition, colors: ButtonColors, onClick: () => void, visible: boolean, scale?: number) {
        super('minus-button', colors, onClick, visible);

        this._scale = scale || 1;

        this.element.classList.add('fa', 'fa-minus');
        this.element.style.borderRadius = '10px';
        document.body.appendChild(this.element);

        this.resize(position);
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition) {
        this.element.style.maxWidth = `${this._scale * (0.06 * position.width)}px`;
        this.element.style.width = `${this._scale * (0.06 * position.width)}px`;
        this.element.style.maxHeight = `${this._scale * (0.06 * position.height)}px`;
        this.element.style.height = `${this._scale * (0.06 * position.height)}px`;
        this.element.style.top = `${position.top}px`;
        this.element.style.left = `${position.left}px`;
        this.element.style.fontSize = `${this._scale * (0.022 * position.width)}px`;
    }
}
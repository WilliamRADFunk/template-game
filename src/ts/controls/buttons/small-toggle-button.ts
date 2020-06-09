import { ButtonBase } from "./button-base";
import { HTMLElementPosition } from "../../models/html-element-position";
import { ButtonColors } from "../../models/button-colors";
import { ToggleBase } from "./toggle-base";

let index = 0;

/**
 * @class
 * Button with a minus symbol.
 */
export class SmallToggleButton extends ToggleBase {
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
     * @param startToggled whether to have been already in pressed state when instantiated.
     */
    constructor(position: HTMLElementPosition, colors: ButtonColors, icon: string, visible: boolean, scale?: number, startToggled?: boolean) {
        index++;
        super(`small-toggle-button-${index}`, colors, visible);

        this._scale = scale || 1;

        this.element.classList.add('fa', icon);
        this.element.style.borderRadius = '10px';
        this.element.style.padding = '0';
        document.body.appendChild(this.element);

        this.resize(position);

        if (startToggled) {
            this.onMouseDown();
            this.onMouseUp();
            this.onExit();
        }
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition): void {
        this.element.style.maxWidth = `${this._scale * (0.03 * position.width)}px`;
        this.element.style.width = `${this._scale * (0.03 * position.width)}px`;
        this.element.style.maxHeight = `${this._scale * (0.03 * position.height)}px`;
        this.element.style.height = `${this._scale * (0.03 * position.height)}px`;
        this.element.style.top = `${position.top}px`;
        this.element.style.left = `${position.left}px`;
        this.element.style.fontSize = `${this._scale * (0.015 * position.width)}px`;
    }
}
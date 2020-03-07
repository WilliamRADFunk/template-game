import { ButtonBase } from "./button-base";
import { HTMLElementPosition } from "../../models/html-element-position";
import { ButtonColors } from "../../models/button-colors";

export class PlusButton extends ButtonBase {
    constructor(position: HTMLElementPosition, colors: ButtonColors, onClick: () => void, visible: boolean) {
        super('plus-button', colors, onClick, visible);

        this.element.classList.add('fa', 'fa-plus');
        this.element.style.borderRadius = '10px';
        document.body.appendChild(this.element);

        this.resize(position);
    }

    /**
     * Sets the height, width, left and top positioning of the element.
     * @param position height, width, left and top position of the button.
     */
    public resize(position: HTMLElementPosition) {
        this.element.style.maxWidth = `${0.06 * position.width}px`;
        this.element.style.width = `${0.06 * position.width}px`;
        this.element.style.maxHeight = `${0.06 * position.height}px`;
        this.element.style.height = `${0.06 * position.height}px`;
        this.element.style.top = `${position.top}px`;
        this.element.style.left = `${position.left}px`;
        this.element.style.fontSize = `${0.022 * position.width}px`;
    }
}
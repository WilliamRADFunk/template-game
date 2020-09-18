import { HTMLElementPosition } from "../../models/html-element-position";

export class ModalDialogueCtrl {
    /**
     * The HTML element containing the opaque backdrop.
     */
    protected _backdrop: HTMLElement;

    /**
     * The HTML element containing the modal itself.
     */
    protected _box: HTMLElement;

    /**
     * The HTML element containing the description text.
     */
    protected _description: HTMLElement;

    /**
     * The HTML element containing the modal dialogue's main text.
     */
    protected _mainText: string;

    /**
     * The HTML element containing the whole dialogue modal and backdrop
     */
    protected _wrapper: HTMLElement;

    /**
     * Constructor for the modal dialogue Base Controller class.
     */
    constructor (container: HTMLElement) {
        this._backdrop = document.createElement('div');
        this._box = document.createElement('div');
        this._description = document.createElement('p');
        this._wrapper = document.createElement('div');
        this._wrapper.appendChild(this._backdrop);
        this._wrapper.appendChild(this._box);
        this._wrapper.appendChild(this._description);

        container.appendChild(this._wrapper);

        this.hide();
    }

    /**
     * Places the modal dialogue out of sight.
     */
    public hide(): void {
        this._wrapper.style.display = 'none';
    }

    /**
     * Positions the modal dialogue within view with optional params for specificity.
     * @param left the left position of the modal dialogue.
     * @param top the top position of the modal dialogue.
     */
    public reposition(position?: HTMLElementPosition): void {
        this._wrapper.style.width = position.width + 'px';
        this._wrapper.style.height = position.height + 'px';
        this._wrapper.style.left = position.left + 'px';
        this._wrapper.style.top = position.top + 'px';
        this._wrapper.style.position = 'absolute';
        this._wrapper.style.zIndex = '10';
        this._backdrop.style.width = position.width + 'px';
        this._backdrop.style.height = position.height + 'px';
        this._backdrop.style.left = position.left + 'px';
        this._backdrop.style.top = position.top + 'px';
        this._backdrop.style.opacity = '0.7';
        this._backdrop.style.display = 'block';
        this._backdrop.style.position = 'absolute';
        this._backdrop.style.zIndex = '10';
        this._box.style.width = (position.width * 0.7) + 'px';
        this._box.style.height = (position.height * 0.5) + 'px';
        this._box.style.left = position.left + 'px';
        this._box.style.top = position.top + 'px';
        this._box.style.backgroundColor = '#CCCCCC';
        this._box.style.border = '3px solid white';
        this._box.style.borderRadius = '3px';
        this._box.style.display = 'block';
        this._box.style.position = 'absolute';
        this._box.style.zIndex = '20';
    }

    /**
     * Places the modal dialogue within view.
     */
    public show(): void {
        this._wrapper.style.display = 'block';
    }
}
export class ProgressBarBaseCtrl {
    /**
     * The HTML element containing the progress bar.
     */
    protected _element: HTMLElement;

    /**
     * The HTML element containing the inner ldBar for progress.
     */
    protected _ldBar: any;

    /**
     * Left position to place the progress bar.
     */
    protected _left: string = '0';

    /**
     * Top position to place the progress bar.
     */
    protected _top: string = '0';

    /**
     * Constructor for the Progress Bar Base Controller class.
     */
    constructor () {}

    /**
     * Places the progress bar out of sight.
     */
    public hide(): void {
        this._element.style.left = '-10000px';
    }

    /**
     * Adds hidden class to the ldBar-label element
     */
    public hideLabel(): void {
        this._element.getElementsByClassName('ldBar-label')[0].classList.add('hidden');
    }

    /**
     * Positions the progress bar within view with optional params for specificity.
     * @param show denotes whether to update position "and" show the new position.
     * @param left the left position of the progress bar.
     * @param top the top position of the progress bar.
     */
    public reposition(show?: boolean, left?: number, top?: number): void {
        this._left = left ? left + 'px' : '0';
        this._top = top ? top + 'px' : '0';
        show ? this.show() : this.hide();
    }

    /**
     * Fills the progress bar with a certain given percentage.
     * @param val amount to set the progress bar fill.
     */
    public set(val: number): void {
        let formattedVal = val;
        if (val < 0) {
            formattedVal = 0;
        } else if (val > 100) {
            formattedVal = 100;
        }
        this._ldBar.ldBar.set(formattedVal);
    }

    /**
     * Places the progress bar within view.
     */
    public show(): void {
        this._element.style.left = this._left;
        this._element.style.top = this._top;
    }

    /**
     * Removes hidden class from the ldBar-label element
     */
    public showLabel(): void {
        this._element.getElementsByClassName('ldBar-label')[0].classList.remove('hidden');
    }
}
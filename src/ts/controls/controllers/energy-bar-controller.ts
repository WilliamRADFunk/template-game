export class EnergyBarCtrl {
    /**
     * The HTML element containing the energy bar.
     */
    private _element: HTMLElement;

    /**
     * The HTML element containing the inner ldBar for energy.
     */
    private _ldBar: any;

    /**
     * Left position to place the energy bar.
     */
    private _left: string = '0';

    /**
     * Top position to place the energy bar.
     */
    private _top: string = '0';

    /**
     * Constructor for the Energy Bar Controller class.
     */
    constructor () {
        this._element = document.getElementById('energy');
        this._ldBar = this._element.getElementsByClassName('ldBar')[0];
    }

    /**
     * Places the energy bar out of sight.
     */
    public hide(): void {
        this._element.style.left = '-10000px';
    }

    /**
     * Positions the energy bar within view with optional params for specificity.
     * @param left the left position of the energy bar.
     * @param top the top position of the energy bar.
     */
    public reposition(left?: number, top?: number): void {
        this._left = left ? left + 'px' : '0';
        this._top = top ? top + 'px' : '0';
    }

    /**
     * Fills the energy bar with a certain given percentage.
     * @param val amount to set the energy bar fill.
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
     * Places the energy bar within view.
     */
    public show(): void {
        this._element.style.left = this._left;
        this._element.style.top = this._top;
    }
}
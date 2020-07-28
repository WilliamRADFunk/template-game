import { ProgressBarBaseCtrl } from "./progress-bar-base-controller";

/**
 * @class
 * Controls the basic functionality around the HTML Element that is the progress bar associated with health level.
 */
export class HealthBarCtrl extends ProgressBarBaseCtrl{
    /**
     * Constructor for the Health Bar Controller class.
     */
    constructor () {
        super();
        this._element = document.getElementById('health');
        this._ldBar = this._element.getElementsByClassName('ldBar')[0];
        if (!this._element.getElementsByClassName('ldBar-label')[0].classList.contains('hidden')) {
            this.hideLabel();
        }
    }
}
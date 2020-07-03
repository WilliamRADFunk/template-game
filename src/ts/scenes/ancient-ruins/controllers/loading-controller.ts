/**
 * @class
 * Controller for loading bar graphic specifically in the Ancient Ruins mini-game scene.
 */
export class LoadingCtrl {
    /**
     * The loading bar container, used to hide and show when appropriate.
     */
    private _loading: HTMLElement = document.getElementById('loading');

    /**
     * The loading bar with which the percentage can be altered.
     */
    private _loadingBar: Element = document.getElementById('loading').getElementsByClassName('ldBar')[0];
    
    /**
     * The game view container, used to hide and show when appropriate.
     */
    private _mainview: HTMLElement = document.getElementById('mainview');

    /**
     * Constructor for the LoadingCtrl class.
     */
    constructor() {
        this._adjustLoadingProgress(12);
    }

    /**
     * Adjusts the amount on the loading bar.
     */
    private _adjustLoadingProgress(amt: number): void {
        (this._loadingBar as any).ldBar.set(amt);
    }

    /**
     * Turns on the game view and hides loading graphic.
     */
    public gameMode(): void {
        this._loading.classList.add('hidden');
        this._mainview.classList.remove('hidden');
    }

    /**
     * Gets a bare bones void promise in a setTimeout lasting as long as param value.
     * @param time wait time in millisends for setTimeout
     * @param loadedAmt amount to update the loading bar with
     * @returns a void promise that will auto-resolve after param time
     */
    public getLoadWaitPromise(time: number, loadedAmt: number): Promise<void> {
        this._adjustLoadingProgress(loadedAmt);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        }).then(() => {});
    }

    /**
     * Turns on the loading bar graphic and hides game view.
     */
    public loadingMode(): void {
        this._mainview.classList.add('hidden');
        this._loading.classList.remove('hidden');
    }
}
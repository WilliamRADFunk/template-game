import { Scene } from "three";

import { SceneType } from "../../models/scene-type";
import { LeftTopPanel } from "../../controls/panels/left-top-panel";
import { RightTopPanel } from "../../controls/panels/right-top-panel";
import { LeftTopMiddlePanel } from "../../controls/panels/left-top-middle-panel";
import { RightTopMiddlePanel } from "../../controls/panels/right-top-middle-panel";

/**
 * @class
 * Keeps track of all things menu related accessible only to dev.
 */
export class DevMenu {
    /**
     * Reference to the scene, used to remove and reinstall text geometries.
     */
    private _scene: Scene;

    /**
     * Constructor for the Menu class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param menuFont loaded font to use for menu button text.
     * @hidden
     */
    constructor(scene: SceneType) {
        this._scene = scene.scene;

        const leftTopPanel = new LeftTopPanel(this._scene);
        const rightTopPanel = new RightTopPanel(this._scene);
        const leftTopMiddlePanel = new LeftTopMiddlePanel(this._scene);
        const rightTopMiddlePanel = new RightTopMiddlePanel(this._scene);
    }

}
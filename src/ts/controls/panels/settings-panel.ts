import { Scene } from "three";

import { PanelBase } from "./panel-base";

/**
 * @class
 * Provides the necessary dimensions to the base panel class to make a centered panel.
 */
export class SettingsPanel extends PanelBase {
    /**
     * Constructor for the Settings Panel class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @hidden
     */
    constructor(scene: Scene) {
        super( 'Settings Panel', scene, 11, 11.2, 11.4, 0, 0 );
    }
}
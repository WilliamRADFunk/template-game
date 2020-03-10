import { Scene } from "three";

import { PanelBase } from "./panel-base";

/**
 * @class
 * Provides the necessary dimensions to the base panel class to make a panel in upper right corner.
 */
export class RightTopPanel extends PanelBase {
    /**
     * Constructor for the Right Top Panel class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @hidden
     */
    constructor(scene: Scene) {
        super( 'Right Top Panel', scene, 6, 6.2, 3.2, 2.9, -4.45 );
    }
}
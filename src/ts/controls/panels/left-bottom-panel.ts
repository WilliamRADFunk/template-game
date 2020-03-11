import { Scene } from "three";

import { PanelBase } from "./panel-base";

/**
 * @class
 * Provides the necessary dimensions to the base panel class to make a panel in lower left.
 */
export class LeftBottomPanel extends PanelBase {
    /**
     * Constructor for the Left Bottom Panel class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @hidden
     */
    constructor(scene: Scene) {
        super( 'Left Bottom Panel', scene, 5.5, 5.7, 3.2, -3.15, 4.45);
    }
}
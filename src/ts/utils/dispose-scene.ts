import { SceneType } from "../models/scene-type";

/**
 * Clears up memory used by scene.
 * @param scene the scene type object that contains the no longer needed ThreeJS instances.
 */ 
export function disposeScene(scene: SceneType): void {
    scene.camera = null;
    scene.instance = null;
    scene.raycaster = null;
    scene.renderer = null;
    scene.scene = null;
}
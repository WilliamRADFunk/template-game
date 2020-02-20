import { Camera, OrthographicCamera, Raycaster, Renderer, Scene } from "three";

export interface SceneType {
    active: boolean;
    camera: Camera | OrthographicCamera;
    instance: any;
    raycaster: Raycaster,
    renderer: Renderer;
    scene: Scene;
}
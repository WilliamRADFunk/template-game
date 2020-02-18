import { Camera, OrthographicCamera, Renderer, Scene } from "three";

export interface SceneType {
    active: boolean;
    camera: Camera | OrthographicCamera;
    instance: any;
    renderer: Renderer;
    scene: Scene;
}
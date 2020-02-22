import { Intersection, Vector2 } from "three";

import { SceneType } from "../models/scene-type";

export function getIntersections(event: MouseEvent, container: HTMLElement, scene: SceneType): Intersection[] {
    const mouse = new Vector2();
    // Gets accurate click positions using css and raycasting.
    const position = {
        left: container.offsetLeft,
        top: container.offsetTop
    };
    const scrollUp = document.getElementsByTagName('body')[0].scrollTop;
    if (event.clientX !== undefined) {
        mouse.x = ((event.clientX - position.left) / container.clientWidth) * 2 - 1;
        mouse.y = - ((event.clientY - position.top + scrollUp) / container.clientHeight) * 2 + 1;
    }

    scene.raycaster.setFromCamera(mouse, scene.camera);
    return scene.raycaster.intersectObjects(scene.scene.children);
}
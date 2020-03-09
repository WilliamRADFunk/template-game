import {
    CircleGeometry,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Scene } from "three";

import { createBoxWithRoundedEdges } from "../../../utils/create-box-with-rounded-edges";

export function createShipLayoutGrid(
    scene: Scene,
    rectangleBoxes: { height: number; width: number; x: number; z: number; radius: number; rot: number; name: string; }[],
    meshMap: { [key: string]: Mesh },
    defaultColor: string
) {
    rectangleBoxes.forEach(box => {
        const recBoxMaterial = new MeshBasicMaterial({
            color: defaultColor,
            opacity: 0.5,
            transparent: true,
            side: DoubleSide
        });
        const recBoxGeometry = createBoxWithRoundedEdges(box.width, box.height, box.radius, 0);
        const barrier = new Mesh( recBoxGeometry, recBoxMaterial );
        barrier.name = box.name;
        barrier.position.set(box.x, 15, box.z);
        barrier.rotation.set(1.5708, 0, box.rot);
        scene.add(barrier);
        meshMap[box.name] = barrier;
    });

    const material = new MeshBasicMaterial({
        color: defaultColor,
        opacity: 0.5,
        transparent: true,
        side: DoubleSide
    });
    const geometry: CircleGeometry = new CircleGeometry(1.56, 48, 48);
    const circleBarrier = new Mesh( geometry, material );
    circleBarrier.name = 'Deuterium Tank';
    circleBarrier.position.set(3.42, 15, 2.94);
    circleBarrier.rotation.set(1.5708, 0, 0);
    scene.add(circleBarrier);
    meshMap[circleBarrier.name] = circleBarrier;

    return [...rectangleBoxes, circleBarrier];
}
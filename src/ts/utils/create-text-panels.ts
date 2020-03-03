import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene } from "three";

export function createTextPanels(
    scene: Scene,
    textBoxes: { widthIn: number; widthOut: number; x: number; z: number; name: string; }[]
): void {
    textBoxes.forEach(box => {
        let textBoxMaterial = new MeshBasicMaterial({
            color: 0xFFFFFF,
            opacity: 0.6,
            transparent: true,
            side: DoubleSide
        });
        let textBoxGeometry = new PlaneGeometry( box.widthOut, 3.2, 10, 10 );
        let barrier = new Mesh( textBoxGeometry, textBoxMaterial );
        barrier.name = `${box.name} Outter Box`;
        barrier.position.set(box.x, 15, box.z);
        barrier.rotation.set(1.5708, 0, 0);
        scene.add(barrier);

        textBoxMaterial = new MeshBasicMaterial({
            color: 0x000000,
            opacity: 1,
            transparent: true,
            side: DoubleSide
        });
        textBoxGeometry = new PlaneGeometry( box.widthIn, 3, 10, 10 );
        barrier = new Mesh( textBoxGeometry, textBoxMaterial );
        barrier.name = `${box.name} Inner Box`;
        barrier.position.set(box.x, 10, box.z);
        barrier.rotation.set(1.5708, 0, 0);
        scene.add(barrier);
    });
}
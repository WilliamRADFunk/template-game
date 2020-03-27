import {
    CircleGeometry,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Scene } from "three";

export function createWindParticles(scene: Scene, color: string): Mesh[] {
    const particles: Mesh[] = [];

    for (let i = 0; i < 10; i++) {
        const geometry = new CircleGeometry( 0.02, 10, 10 );
        const material = new MeshBasicMaterial({
            color,
            opacity: Math.random(),
            transparent: true,
            side: DoubleSide
        });
        const mesh = new Mesh( geometry, material );
        mesh.position.set(-6 + (Math.random() * 10), 13, 3 - (Math.random() * 6));
        mesh.rotation.set(1.5708, 0, 0);

        particles.push(mesh);
        scene.add(mesh);
    }

    return particles;
}
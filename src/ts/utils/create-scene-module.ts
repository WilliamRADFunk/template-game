import { AmbientLight, AudioListener, Color, DoubleSide, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, WebGLRenderer } from "three";

import { SceneType } from "../models/scene-type";
import { onWindowResize } from "./on-window-resize";

export function createSceneModule(scene: SceneType, audioListener: AudioListener, excludeAmbientLight?: boolean) {
    scene.active = true;
    // Establish initial window size.
    let WIDTH: number = window.innerWidth * 0.99;
    let HEIGHT: number = window.innerHeight * 0.99;
    // Create ThreeJS scene.
    scene.scene = new Scene();
    // Choose WebGL renderer if browser supports, otherwise fall back to canvas renderer.
    scene.renderer = ((window as any)['WebGLRenderingContext'])
        ? new WebGLRenderer({ powerPreference: "high-performance" })
        : new WebGLRenderer({ powerPreference: "high-performance" }); // TODO: Create error page for people usiing outdated browsers that don't support WebGL rendering.
    // Make it black and size it to window.
    (scene.renderer as any).setClearColor(0x000000, 0);
    scene.renderer.setSize( WIDTH, HEIGHT );
    (scene.renderer as any).autoClear = false;
    // An all around brightish light that hits everything equally.
    !excludeAmbientLight && scene.scene.add(new AmbientLight(0xCCCCCC));
    // Render to the html container.
    const container = document.getElementById('mainview');
	container.appendChild( (scene.renderer as any).domElement );
    // Set up player's ability to see the game, and focus center on planet.
    scene.camera =  new OrthographicCamera( -6, 6, -6, 6, 0, 100 );
	scene.camera.position.set(0, -20, 0);
    scene.camera.lookAt(scene.scene.position);
    scene.camera.add(audioListener);

    // Resize window setup.
    const onWindowResizeRef = () => { onWindowResize(scene.renderer) };
    onWindowResizeRef();
    window.addEventListener( 'resize', onWindowResizeRef, false);

    // Create the click collision layer
    const clickBarrierGeometry = new PlaneGeometry( 12, 12, 0, 0 );
    const clickBarrierMaterial = new MeshBasicMaterial( {opacity: 0, transparent: true, side: DoubleSide} );
    const clickBarrier = new Mesh( clickBarrierGeometry, clickBarrierMaterial );
    clickBarrier.name = 'Click Barrier';
    clickBarrier.position.set(0, 0, 0);
    clickBarrier.rotation.set(1.5708, 0, 0);
    scene.scene.add(clickBarrier);

    return {
        container,
        onWindowResizeRef,
    };
}
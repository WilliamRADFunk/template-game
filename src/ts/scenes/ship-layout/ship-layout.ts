import {
    DoubleSide,
    Font,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PlaneGeometry,
    Scene,
    TextGeometry,
    Texture,
    Vector2} from 'three';

import { SoundinatorSingleton } from '../../soundinator';
import { Actor } from '../../models/actor';
import { FadableText } from '../../models/fadable-text';
import { createShip } from './actors/create-ship';
import { createShipInteriorFrame } from './actors/create-ship-interior-frame';
import { SceneType } from '../../models/scene-type';

/**
 * @class
 * Slow moving debris object that is sometimes on the path towards planet.
 */
export class ShipLayout {
    /**
     * List of actors in the scene.
     */
    private actors: Actor[] = [];
    private highlightedColor = 0x00FF00;
    private unhighlightedColor = 0x87D3F8;
    private selectedColor = 0xF1149A;
    private meshMap: { [key: string]: Mesh } = {};
    /**
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private scene: Scene;

    private stars: Mesh[] = [];
    /**
     * Text of the intro screen.
     */
    private text: FadableText = {
        counter: 1,
        font: null,
        geometry: null,
        headerParams: null,
        holdCount: 0,
        isFadeIn: true,
        isHolding: false,
        material: null,
        mesh: null,
        sentence: ''
    };
    /**
     * Constructor for the Intro (Scene) class
     * @param scene         graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param shipTexture   texture for the ship.
     * @param earthTexture  texture for the earth.
     * @param marsTexture   texture for the mars.
     * @param introFont     loaded font to use for help display text.
     * @param x1            origin point x of where the ship starts.
     * @param z1            origin point z of where the ship starts.
     */
    constructor(
        scene: SceneType,
        shipInteriorTexture: Texture,
        shipTexture: Texture,
        introFont: Font) {
        this.scene = scene.scene;
        
        this.text.headerParams = {
            font: introFont,
            size: 0.199,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };

        this.createStars();

        const ship = createShip(shipTexture);
        this.actors.push(ship);
        this.scene.add(ship.mesh);
        const shipInterior = createShipInteriorFrame(shipInteriorTexture);
        this.actors.push(shipInterior);
        this.scene.add(shipInterior.mesh);

        this.text.sentence = 'Testing';
        this.text.isFadeIn = true;
        this.text.isHolding = false;
        this.text.holdCount = -1; // Hold until replaced
        this.text.counter = 0;

        let selectedBox: Mesh = null;

        const container = document.getElementById('mainview');
        document.onclick = event => {
            const mouse = new Vector2();
            event.preventDefault();
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
            const thingsTouched = scene.raycaster.intersectObjects(scene.scene.children);
            // Detection for player clicked on center center square
            thingsTouched.forEach(el => {
                if (el.object.name === 'center center') {
                    SoundinatorSingleton.playClick();
                    console.log("Clicked Center Center");
                    return;
                } else if (el.object.name === 'center top') {
                    SoundinatorSingleton.playClick();
                    console.log("Clicked Center Top");
                    return;
                } else if (el.object.name === 'center bottom') {
                    SoundinatorSingleton.playClick();
                    console.log("Clicked Center Bottom");
                    return;
                } 
            });
        };
        document.onmousemove = event => {
            const mouse = new Vector2();
            event.preventDefault();
            // Gets accurate hover positions using css and raycasting.
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
            const thingsHovered = scene.raycaster.intersectObjects(scene.scene.children);
            thingsHovered.forEach(el => {
                this.clearMeshMap(selectedBox, el.object.name);
                // Detection for player hovered on center center square
                if (el.object.name === 'center center') {
                    setTimeout(() => {
                        (this.meshMap[el.object.name].material as any).color.set(this.highlightedColor);
                    }, 0);
                    SoundinatorSingleton.playClick();
                    console.log("Hover Center Center");
                    return;
                // Detection for player hovered on center top square
                } else if (el.object.name === 'center top') {
                    (this.meshMap[el.object.name].material as any).color.set(this.highlightedColor);
                    SoundinatorSingleton.playClick();
                    console.log("Hover Center Top");
                    return;
                // Detection for player hovered on center botton square
                } else if (el.object.name === 'center bottom') {
                    (this.meshMap[el.object.name].material as any).color.set(this.highlightedColor);
                    SoundinatorSingleton.playClick();
                    console.log("Hover Center Bottom");
                    return;
                } else {
                    console.log("el.object.name", el.object.name);
                }
            });
        };

        // Create the center center collision layer
        const materialCenterCenter = new MeshBasicMaterial( {color: this.unhighlightedColor, opacity: 0.5, transparent: true, side: DoubleSide} );
        const centerCenterBarrierGeometry = new PlaneGeometry( 1.64, 0.49, 10, 10 );
        const barrierCenterCenter = new Mesh( centerCenterBarrierGeometry, materialCenterCenter );
        barrierCenterCenter.name = 'center center';
        barrierCenterCenter.position.set(-0.9, 15, 2.98);
        barrierCenterCenter.rotation.set(1.5708, 0, 0);
        this.scene.add(barrierCenterCenter);
        this.meshMap['center center'] = barrierCenterCenter;
        // Create the center top collision layer
        const materialCenterTop = new MeshBasicMaterial( {color: this.unhighlightedColor, opacity: 0.5, transparent: true, side: DoubleSide} );
        const centerTopBarrierGeometry = new PlaneGeometry( 1.64, 0.49, 10, 10 );
        const barrierCenterTop = new Mesh( centerTopBarrierGeometry, materialCenterTop );
        barrierCenterTop.name = 'center top';
        barrierCenterTop.position.set(-0.9, 15, 2.28);
        barrierCenterTop.rotation.set(1.5708, 0, 0);
        this.scene.add(barrierCenterTop);
        this.meshMap['center top'] = barrierCenterTop;
        // Create the center bottom collision layer
        const materialCenterBottom = new MeshBasicMaterial( {color: this.unhighlightedColor, opacity: 0.5, transparent: true, side: DoubleSide} );
        const centerBottomBarrierGeometry = new PlaneGeometry( 1.64, 0.49, 10, 10 );
        const barrierCenterBottom = new Mesh( centerBottomBarrierGeometry, materialCenterBottom );
        barrierCenterBottom.name = 'center bottom';
        barrierCenterBottom.position.set(-0.9, 15, 3.71);
        barrierCenterBottom.rotation.set(1.5708, 0, 0);
        this.scene.add(barrierCenterBottom);
        this.meshMap['center bottom'] = barrierCenterBottom;
    }

    private clearMeshMap(selectedBox: Mesh, name: string): void {
        // If no selected box, don't bother with the extra conditional check.
        if (!selectedBox) {
            Object.keys(this.meshMap).forEach(key => {
                if (key !== name) {
                    (this.meshMap[key].material as any).color.set(this.unhighlightedColor);
                }
            });
        } else {
            Object.keys(this.meshMap).forEach(key => {
                if (key !== selectedBox.name && key !== name) {
                    (this.meshMap[key].material as any).color.set(this.unhighlightedColor);
                }
            });
        }
    }

    private createStars(): void {
        const material = new MeshBasicMaterial( {color: 0xFFFFFF, opacity: 1, transparent: false, side: DoubleSide} );
        for (let i = 0; i < 500; i++) {
            const mag = (Math.floor(Math.random() * 3) + 1) / 100;
            const geometry = new PlaneGeometry(mag, mag, 0.01, 0.01);
            const isXNeg = Math.random() < 0.5 ? -1 : 1;
            const isZNeg = Math.random() < 0.5 ? -1 : 1;
            const xCoord = Math.random() * 7;
            const zCoord = Math.random() * 7;
            const mesh = new Mesh( geometry, material );
            mesh.position.set((isXNeg * xCoord), 30, (isZNeg * zCoord));
            mesh.rotation.set(1.5708, 0, 0);
            mesh.name = `Star-${i}`;
            this.scene.add(mesh);
            this.stars[i] = mesh;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at bottom of screen.
     */
    private makeText(): void {
        if (this.text.mesh) {
            this.scene.remove(this.text.mesh);
        }
        if (this.text.isFadeIn && this.text.counter > 180) {
            this.text.isFadeIn = false;
            this.text.isHolding = true;
            this.text.counter = 1;
        } else if (this.text.isHolding) {
            this.text.isFadeIn = false;
            this.text.isHolding = true;
            this.text.counter = 1;
        }

        if (this.text.isFadeIn) {
            this.text.material = new MeshLambertMaterial( {color: 0x00B39F, opacity: this.text.counter / 180, transparent: true} );
            this.text.counter++;
        } else if (this.text.isHolding) {
            // Do nothing
        } else {
            return;
        }

        this.text.geometry = new TextGeometry(this.text.sentence, this.text.headerParams);
        this.text.mesh = new Mesh( this.text.geometry, this.text.material );
        this.text.mesh.position.set(-5.65, -11.4, 5.5);
        this.text.mesh.rotation.x = -1.5708;
        this.scene.add(this.text.mesh);
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    endCycle(): boolean {
        if (true) {
            
        } else {
            return false;
        }
        this.makeText();
        return true;
    }
}
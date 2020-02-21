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
import { getIntersections } from '../../utils/get-intersections';

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

        

        const rectangleBoxes = [
            { height: 0.49, width: 1.64, x: -0.9, z: 2.98, name: 'center center' },
            { height: 0.49, width: 1.64, x: -0.9, z: 2.28, name: 'center top' },
            { height: 0.49, width: 1.64, x: -0.9, z: 3.71, name: 'center bottom' },
            { height: 1.01, width: 0.49, x: 0.36, z: 2.35, name: 'right1 top' },
            { height: 1.01, width: 0.49, x: 0.36, z: 3.59, name: 'right1 bottom' },
            { height: 0.95, width: 0.94, x: -2.39, z: 2.45, name: 'left1 top' },
            { height: 0.95, width: 0.94, x: -2.39, z: 3.62, name: 'left1 bottom' },
            { height: 2.10, width: 0.48, x: -3.38, z: 3.04, name: 'left2' },
            { height: 0.77, width: 0.48, x: 0.99, z: 2.98, name: 'right2 center' },
            { height: 0.47, width: 0.48, x: 0.99, z: 2.22, name: 'right2 top' },
            { height: 0.47, width: 0.48, x: 0.99, z: 3.75, name: 'right2 bottom' },
            { height: 0.24, width: 0.38, x: -5.69, z: 1.99, name: 'thruster top' },
            { height: 0.24, width: 0.38, x: -5.69, z: 3.02, name: 'thruster center' },
            { height: 0.24, width: 0.38, x: -5.69, z: 3.98, name: 'thruster bottom' }
        ];

        rectangleBoxes.forEach(box => {
            const material = new MeshBasicMaterial( {color: this.unhighlightedColor, opacity: 0.5, transparent: true, side: DoubleSide} );
            const geometry = new PlaneGeometry( box.width, box.height, 10, 10 );
            const barrier = new Mesh( geometry, material );
            barrier.name = box.name;
            barrier.position.set(box.x, 15, box.z);
            barrier.rotation.set(1.5708, 0, 0);
            this.scene.add(barrier);
            this.meshMap[box.name] = barrier;
        });

        const intersectableThings = [...rectangleBoxes];

        const material = new MeshBasicMaterial( {color: 0xFFFFFF, opacity: 0.6, transparent: true, side: DoubleSide} );
        const geometry = new PlaneGeometry( 5.7, 3.2, 10, 10 );
        const barrier = new Mesh( geometry, material );
        barrier.name = 'profile dialogue outline';
        barrier.position.set(3, 15, -4.3);
        barrier.rotation.set(1.5708, 0, 0);
        this.scene.add(barrier);

        let selectedBox: Mesh = null;
        let hoveredBox: Mesh = null;
        const container = document.getElementById('mainview');
        document.onclick = event => {
            event.preventDefault();
            Object.keys(this.meshMap).forEach(key => {
                (this.meshMap[key].material as any).color.set(this.unhighlightedColor);
            });
            getIntersections(event, container, scene).forEach(el => {
                const hit = intersectableThings.find(box => {
                    if (el.object.name === box.name) {
                        return true;
                    }
                });
                if (hit) {
                    selectedBox = this.meshMap[hit.name];
                    (this.meshMap[hit.name].material as any).color.set(this.selectedColor);
                    SoundinatorSingleton.playClick();
                    return;
                }
            });
        };
        document.onmousemove = event => {
            event.preventDefault();
            let isHovering = false;
            getIntersections(event, container, scene).forEach(el => {
                const hit = intersectableThings.find(box => {
                    if (el.object.name === box.name) {
                        return true;
                    }
                });
                if (hit) {
                    if (!selectedBox || selectedBox.name !== hit.name) {
                        isHovering = true;
                        hoveredBox = this.meshMap[el.object.name];
                        (this.meshMap[el.object.name].material as any).color.set(this.highlightedColor);
                    } else if (selectedBox && selectedBox.name === hit.name) {
                        isHovering = true;
                    }
                    this.text.sentence = hit.name;
                    this.makeText();
                    return;
                }
            });
            if (!isHovering) {
                hoveredBox = null;
                this.text.sentence = '';
                this.makeText();
            }
            this.clearMeshMap(selectedBox, hoveredBox);
        };
    }

    private clearMeshMap(selectedBox: Mesh, hoveredBox: Mesh): void {
        const selectedName = selectedBox && selectedBox.name;
        const hoveredName = hoveredBox && hoveredBox.name;
        // If no selected box, don't bother with the extra conditional check.
        if (!selectedName && !hoveredName) {
            Object.keys(this.meshMap).forEach(key => {
                (this.meshMap[key].material as any).color.set(this.unhighlightedColor);
            });
        } else {
            Object.keys(this.meshMap).forEach(key => {
                if (key !== selectedName && key !== hoveredName) {
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
import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    Texture } from 'three';

import { SoundinatorSingleton } from '../../soundinator';
import { Actor } from '../../models/actor';
import { FadableText } from '../../models/fadable-text';
import { createShip } from './actors/create-ship';
import { createShipInteriorFrame } from './actors/create-ship-interior-frame';
import { SceneType } from '../../models/scene-type';
import { getIntersections } from '../../utils/get-intersections';
import { createBoxWithRoundedEdges } from '../../utils/create-box-with-rounded-edges';
import { createProfile } from './actors/create-profile';
import { DialogueText } from '../../models/dialogue-text';
import { compareRGBValues } from '../../utils/compare-rgb-values';
import { dialogues } from './configs/dialogues';
import { techPoints } from './configs/tech-points';
import { techPellets, rectangleBoxes, textBoxes } from './configs/grid-items';
import { createShipLayoutGrid } from '../../utils/create-ship-layout-grid';

// const border: string = '1px solid #FFF';
const border: string = 'none';

/**
 * Color for boxes user is hovering over.
 */
const highlightedColor = '#00FF00';

/**
 * Gold text color.
 */
const neutralColor = '#FFD700';

/**
 * Color for boxes user has clicked.
 */
const selectedColor = '#F1149A';

/**
 * Color in rgb for boxes user has clicked.
 */
const selectedColorRgb: [number, number, number] = [parseInt('F1', 16), parseInt('14', 16), parseInt('9A', 16)];

/**
 * Color for boxes user is not hovering over (default).
 */
const unhighlightedColor = '#87D3F8';

/**
 * @class
 * Slow moving debris object that is sometimes on the path towards planet.
 */
export class ShipLayout {
    /**
     * List of actors in the scene.
     */
    private actors: Actor[] = [];

    /**
     * Text for hovered room at bottom of screen.
     */
    private dialogueText: DialogueText = {
        counter: 1,
        currentIndex: 0,
        element: null,
        font: null,
        isFinished: false,
        sentence: dialogues['']
    };

    /**
     * Opacity level when button is disabled.
     */
    private disabledOpacity: string = '0.4';

    /**
     * Opacity level when button is enabled.
     */
    private enabledOpacity: string = '1';

    /**
     * Mesh for box user has hovered over.
     */
    private hoveredBox: Mesh = null;

    /**
     * Text for hovered room at bottom of screen.
     */
    private hoverText: FadableText = {
        counter: 1,
        element: null,
        holdCount: -1, // Hold until replaced
        isFadeIn: true,
        isHolding: false,
        sentence: ''
    };

    /**
     * Reference to onWindowResize so that it can be removed later.
     */
    private listenerRef: () => void;

    /**
     * Meshes for all the boxes user can interact with.
     */
    private meshMap: { [key: string]: Mesh } = {};

    /**
     * HTML button for decreasing tech point on a specific ship section.
     */
    private minusButton: HTMLElement = null;

    /**
     * HTML button for increasing tech point on a specific ship section.
     */
    private plusButton: HTMLElement = null;

    /**
     * Number of tech points player has left to spend.
     */
    private points: number = 10;

    /**
     * Text for points to spend at top left of screen.
     */
    private pointsText: FadableText = {
        counter: 1,
        element: null,
        holdCount: -1, // Hold until replaced
        isFadeIn: true,
        isHolding: false,
        sentence: ''
    };

    /**
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private scene: Scene;

    /**
     * Mesh for box user has selected.
     */
    private selectedBox: Mesh = null;

    /**
     * Text for selected room at top left of screen.
     */
    private selectionText: FadableText = {
        counter: 1,
        element: null,
        holdCount: -1, // Hold until replaced
        isFadeIn: true,
        isHolding: false,
        sentence: ''
    };

    /**
     * Stars in background.
     */
    private stars: Mesh[] = [];

    /**
     * Meshes for all the tech pellets.
     */
    private techPellentMeshMap: Mesh[] = [];

    /**
     * Constructor for the Intro (Scene) class
     * @param scene             graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param shipIntTexture    texture for the ship in cut profile.
     * @param shipTexture       texture for the ship.
     * @param dialogueTexture   texture for the profile image.
     * @param introFont         loaded font to use for help display text.
     */
    constructor(
        scene: SceneType,
        shipIntTexture: Texture,
        shipTexture: Texture,
        dialogueTexture: Texture) {
        this.scene = scene.scene;

        this.onWindowResize();
        this.listenerRef = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.listenerRef, false);

        this.minusButton.style.visibility = 'hidden';
        this.plusButton.style.visibility = 'hidden';

        this.createStars();

        const ship = createShip(shipTexture);
        this.actors.push(ship);
        this.scene.add(ship.mesh);
        const shipInterior = createShipInteriorFrame(shipIntTexture);
        this.actors.push(shipInterior);
        this.scene.add(shipInterior.mesh);
        const profile = createProfile(dialogueTexture);
        this.actors.push(profile);
        this.scene.add(profile.mesh);

        techPellets.forEach(pellet => {
            const pelletMaterial = new MeshBasicMaterial({
                color: unhighlightedColor,
                opacity: 0.5,
                transparent: true,
                side: DoubleSide
            });
            const pelletGeometry = createBoxWithRoundedEdges(pellet.width, pellet.height, pellet.radius, 0);
            const barrier = new Mesh( pelletGeometry, pelletMaterial );
            barrier.name = pellet.name;
            barrier.position.set(pellet.x, 8, pellet.z);
            barrier.rotation.set(1.5708, 0, 0);
            this.scene.add(barrier);
            barrier.visible = false;
            this.techPellentMeshMap.push(barrier);
        });

        const intersectableThings = createShipLayoutGrid(this.scene, rectangleBoxes, this.meshMap, unhighlightedColor);

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
            this.scene.add(barrier);

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
            this.scene.add(barrier);
        });

        const container = document.getElementById('mainview');
        document.onclick = event => {
            event.preventDefault();
            getIntersections(event, container, scene).forEach(el => {
                const hit = intersectableThings.find(box => {
                    if (el.object.name === box.name) {
                        return true;
                    }
                });
                if (hit && hit.name !== (this.selectedBox && this.selectedBox.name)) {
                    Object.keys(this.meshMap).forEach(key => {
                        (this.meshMap[key].material as any).color.set(unhighlightedColor);
                    });

                    this.selectedBox = this.meshMap[hit.name];
                    (this.meshMap[hit.name].material as any).color.set(selectedColor);
                    SoundinatorSingleton.playClick();

                    this.selectionText.sentence = hit.name;
                    this.selectionText.element.innerHTML = this.selectionText.sentence;
                    this.selectionText.isFadeIn = true;
                    this.selectionText.isHolding = false;
                    this.selectionText.counter = 1;
                    this.makeSelectionText();

                    this.minusButton.style.visibility = 'visible';
                    this.plusButton.style.visibility = 'visible';

                    !this.techPellentMeshMap[0].visible ? this.techPellentMeshMap.forEach(x => x.visible = true) : null;
                    this.adjustTechPoints(techPoints[hit.name]);

                    this.dialogueText.sentence = dialogues[hit.name];
                    this.dialogueText.counter = -1;
                    this.dialogueText.currentIndex = 0;
                    this.dialogueText.isFinished = false;
                    this.makeDialogueText();
                }
            });
        };
        document.onmousemove = event => {
            event.preventDefault();
            const hoverName = this.hoveredBox && this.hoveredBox.name;
            const selectedName = this.selectedBox && this.selectedBox.name;
            let isHovering = false;
            getIntersections(event, container, scene).forEach(el => {
                const hit = intersectableThings.find(box => {
                    if (el.object.name === box.name) {
                        return true;
                    }
                });
                if (hit) {
                    if (selectedName !== hit.name) {
                        isHovering = true;
                        this.hoveredBox = this.meshMap[el.object.name];
                        (this.meshMap[el.object.name].material as any).color.set(highlightedColor);
                    } else if (selectedName === hit.name) {
                        isHovering = true;
                        if (!compareRGBValues(this.hoverText.element.style.color.toString().trim(), selectedColorRgb)) {
                            this.hoverText.sentence = hit.name;
                            this.hoverText.element.innerHTML = this.hoverText.sentence;
                            this.hoverText.isFadeIn = true;
                            this.hoverText.isHolding = false;
                            this.hoverText.counter = 1;
                            this.makeHoverText();
                        }
                    }

                    if (hit.name !== hoverName && hit.name !== selectedName) {
                        this.hoverText.sentence = hit.name;
                        this.hoverText.element.innerHTML = this.hoverText.sentence;
                        this.hoverText.isFadeIn = true;
                        this.hoverText.isHolding = false;
                        this.hoverText.counter = 1;
                        this.makeHoverText();
                    }
                    return;
                }
            });
            if (!isHovering && this.hoverText.sentence) {
                this.hoveredBox = null;
                this.hoverText.sentence = '';
                this.hoverText.element.innerHTML = this.hoverText.sentence;
                this.hoverText.isFadeIn = true;
                this.hoverText.isHolding = false;
                this.hoverText.counter = 1;
                this.makeHoverText();
            }
            this.clearMeshMap();
        };
    }

    private adjustTechPoints(pointSpread: { current: number; min: number; start: number; }): void {
        for (let i = 0; i < this.techPellentMeshMap.length; i++) {
            if (i < pointSpread.min) {
                (this.techPellentMeshMap[i].material as any).color.set(neutralColor);
            } else if (i < pointSpread.current) {
                (this.techPellentMeshMap[i].material as any).color.set(selectedColor);
            } else {
                (this.techPellentMeshMap[i].material as any).color.set(unhighlightedColor);
            }
        }
        if (pointSpread.current > pointSpread.min) {
            this.minusButton.style.opacity = this.enabledOpacity;
        } else {
            this.minusButton.style.opacity = this.disabledOpacity;
        }
        if (this.points <= 0 || pointSpread.current >= 10) {
            this.plusButton.style.opacity = this.disabledOpacity;
        } else {
            this.plusButton.style.opacity = this.enabledOpacity;
        }
        this.pointsText.sentence = `You have <span style="color: ${neutralColor};">${this.points}</span> tech points to spend`;
        this.pointsText.element.innerHTML = this.pointsText.sentence;
        this.pointsText.isFadeIn = true;
        this.pointsText.isHolding = false;
        this.pointsText.counter = 20;
        this.makePointsText();
    }

    private clearMeshMap(): void {
        const selectedName = this.selectedBox && this.selectedBox.name;
        const hoveredName = this.hoveredBox && this.hoveredBox.name;
        // If no selected box, don't bother with the extra conditional check.
        if (!selectedName && !hoveredName) {
            Object.keys(this.meshMap).forEach(key => {
                (this.meshMap[key].material as any).color.set(unhighlightedColor);
            });
        } else {
            Object.keys(this.meshMap).forEach(key => {
                if (key !== selectedName && key !== hoveredName) {
                    (this.meshMap[key].material as any).color.set(unhighlightedColor);
                }
            });
        }
    }

    private createStars(): void {
        const material = new MeshBasicMaterial({
            color: 0xFFFFFF,
            opacity: 1,
            transparent: false,
            side: DoubleSide
        });
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
     * Builds the text and graphics for the text dialogue at top right of screen.
     */
    private makeDialogueText(): void {
        if (this.dialogueText.isFinished) {
            return;
        }
        this.dialogueText.counter++;
        if (this.dialogueText.counter % 3 === 0 && this.dialogueText.currentIndex < this.dialogueText.sentence.length) {
            this.dialogueText.currentIndex++;
            if (this.dialogueText.sentence.charAt(this.dialogueText.currentIndex - 1) === '<') {
                this.dialogueText.currentIndex += 3;
            }if (this.dialogueText.sentence.charAt(this.dialogueText.currentIndex - 1) === '&') {
                this.dialogueText.currentIndex += 11;
            }
            if (this.dialogueText.element) {
                this.dialogueText.element.innerHTML = this.dialogueText.sentence.slice(0, this.dialogueText.currentIndex);
            }
        }
        if (this.dialogueText.currentIndex >= this.dialogueText.sentence.length) {
            this.dialogueText.isFinished = true;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at bottom of screen.
     */
    private makeHoverText(): void {
        const name = this.selectedBox && this.selectedBox.name;
        const color = name === this.hoverText.sentence ? selectedColor : '#00B39F';
        if (this.hoverText.isFadeIn && this.hoverText.counter > 20) {
            this.hoverText.isFadeIn = false;
            this.hoverText.isHolding = true;
            this.hoverText.counter = 1;
        }

        if (this.hoverText.isFadeIn) {
            this.hoverText.element.style.opacity = (this.hoverText.counter / 20) + '';
            this.hoverText.counter++;
            this.hoverText.element.style.color = color;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue for points at top left of screen.
     */
    private makePointsText(): void {
        if (this.pointsText.isHolding) {
            return;
        }
        if (this.pointsText.isFadeIn && this.pointsText.counter > 20) {
            this.pointsText.isFadeIn = false;
            this.pointsText.isHolding = true;
            this.pointsText.counter = 1;
        }

        if (this.pointsText.isFadeIn) {
            this.pointsText.element.style.opacity = (this.pointsText.counter / 20) + '';
            this.pointsText.counter++;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at top left of screen.
     */
    private makeSelectionText(): void {
        if (this.selectionText.isHolding) {
            return;
        }
        if (this.selectionText.isFadeIn && this.selectionText.counter > 20) {
            this.selectionText.isFadeIn = false;
            this.selectionText.isHolding = true;
            this.selectionText.counter = 1;
        }

        if (this.selectionText.isFadeIn) {
            this.selectionText.element.style.opacity = (this.selectionText.counter / 20) + '';
            this.selectionText.counter++;
        }
    }

    private onWindowResize(): void {
        const dialogueElement = document.getElementById('ship-layout-screen-dialogue');
        if (dialogueElement) {
            dialogueElement.remove();
        }
        const pointsElement = document.getElementById('ship-layout-screen-points');
        if (pointsElement) {
            pointsElement.remove();
        }
        const selectionElement = document.getElementById('ship-layout-screen-selection');
        if (selectionElement) {
            selectionElement.remove();
        }
        const hoverElement = document.getElementById('ship-layout-screen-hover');
        if (hoverElement) {
            hoverElement.remove();
        }
        const minusButtonElement = document.getElementById('minus-button');
        if (minusButtonElement) {
            minusButtonElement.remove();
        }
        const plusButtonElement = document.getElementById('plus-button');
        if (plusButtonElement) {
            plusButtonElement.remove();
        }

        let WIDTH = window.innerWidth * 0.99;
        let HEIGHT = window.innerHeight * 0.99;
        if ( WIDTH < HEIGHT ) {
            HEIGHT = WIDTH;
        } else {
            WIDTH = HEIGHT;
        }
        const left = (((window.innerWidth * 0.99) - WIDTH) / 2);
        const width = WIDTH;
        const height = HEIGHT;

        this.minusButton = document.createElement('button');
        this.minusButton.classList.add('fa', 'fa-minus');
        this.minusButton.id = 'minus-button';
        this.minusButton.style.outline = 'none';
        this.minusButton.style.backgroundColor = selectedColor;
        this.minusButton.style.color = neutralColor;
        this.minusButton.style.position = 'absolute';
        this.minusButton.style.maxWidth = `${0.06 * width}px`;
        this.minusButton.style.width = `${0.06 * width}px`;
        this.minusButton.style.maxHeight = `${0.06 * height}px`;
        this.minusButton.style.height = `${0.06 * height}px`;
        this.minusButton.style.top = `${0.15 * height}px`;
        this.minusButton.style.left = `${left + (0.02 * width)}px`;
        this.minusButton.style.overflowY = 'hidden';
        this.minusButton.style.textAlign = 'center';
        this.minusButton.style.border = '1px solid #FFD700';
        this.minusButton.style.borderRadius = '10px';
        this.minusButton.style.fontSize = `${0.022 * width}px`;
        this.minusButton.style.boxSizing = 'border-box';
        document.body.appendChild(this.minusButton);

        const minusHover = () => {
            const pointSpread = techPoints[this.selectedBox.name];
            if (pointSpread.current > pointSpread.min) {
                this.minusButton.style.backgroundColor = '#00B39F';
                this.minusButton.style.color = neutralColor;
                this.minusButton.style.border = '1px solid #FFD700';
            }
        };
        this.minusButton.onmouseover = minusHover.bind(this);
        const minusExit = () => {
            const pointSpread = techPoints[this.selectedBox.name];
            if (pointSpread.current > pointSpread.min) {
                this.minusButton.style.backgroundColor = selectedColor;
                this.minusButton.style.color = neutralColor;
                this.minusButton.style.border = '1px solid #FFD700';
            }
        };
        this.minusButton.onmouseleave = minusExit.bind(this);
        const minusMouseDown = () => {
            const pointSpread = techPoints[this.selectedBox.name];
            if (pointSpread.current > pointSpread.min) {
                this.minusButton.style.backgroundColor = '#00B39F';
                this.minusButton.style.color = selectedColor;
                this.minusButton.style.border = '1px solid ' + selectedColor;
            }
        };
        this.minusButton.onmousedown = minusMouseDown.bind(this);
        const minusMouseUp = () => {
            const pointSpread = techPoints[this.selectedBox.name];
            if (pointSpread.current > pointSpread.min) {
                this.minusButton.style.backgroundColor = selectedColor;
                this.minusButton.style.color = neutralColor;
                this.minusButton.style.border = '1px solid #FFD700';
                this.points++;
                pointSpread.current--;
                this.adjustTechPoints(pointSpread);
            }
            if (this.points > 0) {
                this.plusButton.style.opacity = this.enabledOpacity;
            }
            if (pointSpread.current <= pointSpread.min) {
                this.minusButton.style.opacity = this.disabledOpacity;
            }
        };
        this.minusButton.onmouseup = minusMouseUp.bind(this);

        this.plusButton = document.createElement('button');
        this.plusButton.classList.add('fa', 'fa-plus');
        this.plusButton.id = 'plus-button';
        this.plusButton.style.outline = 'none';
        this.plusButton.style.backgroundColor = selectedColor;
        this.plusButton.style.color = neutralColor;
        this.plusButton.style.position = 'absolute';
        this.plusButton.style.maxWidth = `${0.06 * width}px`;
        this.plusButton.style.width = `${0.06 * width}px`;
        this.plusButton.style.maxHeight = `${0.06 * height}px`;
        this.plusButton.style.height = `${0.06 * height}px`;
        this.plusButton.style.top = `${0.15 * height}px`;
        this.plusButton.style.left = `${left + (0.395 * width)}px`;
        this.plusButton.style.overflowY = 'hidden';
        this.plusButton.style.textAlign = 'center';
        this.plusButton.style.border = '1px solid #FFD700';
        this.plusButton.style.borderRadius = '10px';
        this.plusButton.style.fontSize = `${0.022 * width}px`;
        this.plusButton.style.boxSizing = 'border-box';
        document.body.appendChild(this.plusButton);

        const plusHover = () => {
            const pointSpread = techPoints[this.selectedBox.name];
            if (this.points > 0 && pointSpread.current < 10) {
                this.plusButton.style.backgroundColor = '#00B39F';
                this.plusButton.style.color = neutralColor;
                this.plusButton.style.border = '1px solid #FFD700';
            }
        };
        this.plusButton.onmouseover = plusHover.bind(this);
        const plusExit = () => {
            const pointSpread = techPoints[this.selectedBox.name];
            if (this.points > 0 && pointSpread.current < 10) {
                this.plusButton.style.backgroundColor = selectedColor;
                this.plusButton.style.color = neutralColor;
                this.plusButton.style.border = '1px solid #FFD700';
            }
        };
        this.plusButton.onmouseleave = plusExit.bind(this);
        const plusMouseDown = () => {
            const pointSpread = techPoints[this.selectedBox.name];
            if (this.points > 0 && pointSpread.current < 10) {
                this.plusButton.style.backgroundColor = '#00B39F';
                this.plusButton.style.color = selectedColor;
                this.plusButton.style.border = '1px solid ' + selectedColor;
            }
        };
        this.plusButton.onmousedown = plusMouseDown.bind(this);
        const plusMouseUp = () => {
            const pointSpread = techPoints[this.selectedBox.name];
            if (this.points > 0 && pointSpread.current < 10) {
                this.plusButton.style.backgroundColor = selectedColor;
                this.plusButton.style.color = neutralColor;
                this.plusButton.style.border = '1px solid #FFD700';
                if (pointSpread.current < 10) {
                    this.points--;
                    pointSpread.current++;
                    this.adjustTechPoints(pointSpread);
                }
            }
            if (this.points <= 0 || pointSpread.current >= 10) {
                this.plusButton.style.opacity = this.disabledOpacity;
            }
        };
        this.plusButton.onmouseup = plusMouseUp.bind(this);

        if (this.selectedBox) {
            this.adjustTechPoints(techPoints[this.selectedBox.name]);
        }

        this.dialogueText.element = document.createElement('div');
        this.dialogueText.element.id = 'ship-layout-screen-dialogue';
        this.dialogueText.element.style.fontFamily = 'Luckiest Guy';
        this.dialogueText.element.style.color = neutralColor;
        this.dialogueText.element.style.position = 'absolute';
        this.dialogueText.element.style.maxWidth = `${0.25 * width}px`;
        this.dialogueText.element.style.width = `${0.25 * width}px`;
        this.dialogueText.element.style.maxHeight = `${0.24 * height}px`;
        this.dialogueText.element.style.height = `${0.24 * height}px`;
        this.dialogueText.element.style.backgroundColor = 'transparent';
        this.dialogueText.element.innerHTML = this.dialogueText.sentence.slice(0, this.dialogueText.currentIndex);
        this.dialogueText.element.style.top = `${0.01 * height}px`;
        this.dialogueText.element.style.left = `${left + (0.5 * width)}px`;
        this.dialogueText.element.style.overflowY = 'hidden';
        this.dialogueText.element.style.fontSize = `${0.017 * width}px`;
        this.dialogueText.element.style.border = border;
        document.body.appendChild(this.dialogueText.element);

        this.pointsText.element = document.createElement('div');
        this.pointsText.element.id = 'ship-layout-screen-points';
        this.pointsText.element.style.fontFamily = 'Luckiest Guy';
        this.pointsText.element.style.color = selectedColor;
        this.pointsText.element.style.position = 'absolute';
        this.pointsText.element.style.maxWidth = `${0.43 * width}px`;
        this.pointsText.element.style.width = `${0.43 * width}px`;
        this.pointsText.element.style.maxHeight = `${0.03 * height}px`;
        this.pointsText.element.style.height = `${0.03 * height}px`;
        this.pointsText.element.style.backgroundColor = 'transparent';
        this.pointsText.element.innerHTML = this.pointsText.sentence;
        this.pointsText.element.style.top = `${0.09 * height}px`;
        this.pointsText.element.style.left = `${left + (0.02 * width)}px`;
        this.pointsText.element.style.overflowY = 'hidden';
        this.pointsText.element.style.textAlign = 'center';
        this.pointsText.element.style.fontSize = `${0.025 * width}px`;
        this.pointsText.element.style.border = border;
        document.body.appendChild(this.pointsText.element);

        this.selectionText.element = document.createElement('div');
        this.selectionText.element.id = 'ship-layout-screen-selection';
        this.selectionText.element.style.fontFamily = 'Luckiest Guy';
        this.selectionText.element.style.color = neutralColor;
        this.selectionText.element.style.position = 'absolute';
        this.selectionText.element.style.maxWidth = `${0.43 * width}px`;
        this.selectionText.element.style.width = `${0.43 * width}px`;
        this.selectionText.element.style.maxHeight = `${0.08 * height}px`;
        this.selectionText.element.style.height = `${0.08 * height}px`;
        this.selectionText.element.style.backgroundColor = 'transparent';
        this.selectionText.element.innerHTML = this.selectionText.sentence;
        this.selectionText.element.style.top = `${0.01 * height}px`;
        this.selectionText.element.style.left = `${left + (0.02 * width)}px`;
        this.selectionText.element.style.overflowY = 'hidden';
        this.selectionText.element.style.textAlign = 'center';
        this.selectionText.element.style.fontSize = `${0.03 * width}px`;
        this.selectionText.element.style.border = border;
        document.body.appendChild(this.selectionText.element);

        this.hoverText.element = document.createElement('div');
        this.hoverText.element.id = 'ship-layout-screen-hover';
        this.hoverText.element.style.fontFamily = 'Luckiest Guy';
        this.hoverText.element.style.color = neutralColor;
        this.hoverText.element.style.position = 'absolute';
        this.hoverText.element.style.maxWidth = `${0.50 * width}px`;
        this.hoverText.element.style.width = `${0.50 * width}px`;
        this.hoverText.element.style.maxHeight = `${0.04 * height}px`;
        this.hoverText.element.style.height = `${0.04 * height}px`;
        this.hoverText.element.style.backgroundColor = 'transparent';
        this.hoverText.element.innerHTML = this.hoverText.sentence;
        this.hoverText.element.style.bottom = `${(window.innerHeight * 0.99 - height) + (0.02 * height)}px`;
        this.hoverText.element.style.left = `${left + (0.02 * width)}px`;
        this.hoverText.element.style.overflowY = 'hidden';
        this.hoverText.element.style.textAlign = 'left';
        this.hoverText.element.style.fontSize = `${0.03 * width}px`;
        this.hoverText.element.style.border = border;
        document.body.appendChild(this.hoverText.element);
    };

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.getElementById('ship-layout-screen-dialogue').remove();
        document.getElementById('ship-layout-screen-hover').remove();
        document.getElementById('ship-layout-screen-points').remove();
        document.getElementById('ship-layout-screen-selection').remove();
        document.getElementById('minus-button').remove();
        document.getElementById('plus-button').remove();
        window.removeEventListener( 'resize', this.listenerRef, false);
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
        this.makeDialogueText();
        this.makeHoverText();
        this.makePointsText();
        this.makeSelectionText();
        return true;
    }
}
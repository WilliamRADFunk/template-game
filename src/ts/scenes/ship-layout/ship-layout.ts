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
import { techPellets, rectangleBoxes, textBoxes, textElements } from './configs/grid-items';
import { createShipLayoutGrid } from '../../utils/create-ship-layout-grid';
import { createRightPanelText } from '../../utils/create-right-panel-text';
import { createLeftPanelTitleText } from '../../utils/create-left-panel-title-text';
import { createLeftPanelSubtitleText } from '../../utils/create-left-panel-subtitle-text';
import { createTextPanels } from '../../utils/create-text-panels';
import { createMinusButton } from '../../utils/create-minus-button';
import { TechPoints } from '../../models/tech-points';

// const border: string = '1px solid #FFF';
const border: string = 'none';

/**
 * Border size and style string to avoid string create repetition.
 */
const borderSizeAndStyle: string = '1px solid ';

/**
 * Color for boxes used for anything non-specific.
 */
const defaultColor = '#00B39F';

/**
 * Opacity level when button is disabled.
 */
const disabledOpacity: string = '0.4';

/**
 * Opacity level when button is enabled.
 */
const enabledOpacity: string = '1';

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
 * Number of points user can have to use initially.
 */
const startingPoints = 10;

/**
 * Color for boxes user is not hovering over (neutral).
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
    private _actors: Actor[] = [];

    /**
     * Cloned version of the techPoints object to allow for resetting.
     */
    private _cloneTechPoints: TechPoints = JSON.parse(JSON.stringify(techPoints));

    /**
     * Text for hovered room at bottom of screen.
     */
    private _dialogueText: DialogueText = {
        counter: 1,
        currentIndex: 0,
        element: null,
        font: null,
        isFinished: false,
        sentence: dialogues['']
    };

    /**
     * Flag to signal user has completed layout specs.
     */
    private _hasSubmitted: boolean = false;

    /**
     * Mesh for box user has hovered over.
     */
    private _hoveredBox: Mesh = null;

    /**
     * Text for hovered room at bottom of screen.
     */
    private _hoverText: FadableText = {
        counter: 1,
        element: null,
        holdCount: -1, // Hold until replaced
        isFadeIn: true,
        isHolding: false,
        sentence: ''
    };

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    /**
     * Meshes for all the boxes user can interact with.
     */
    private _meshMap: { [key: string]: Mesh } = {};

    /**
     * HTML button for decreasing tech point on a specific ship section.
     */
    private _minusButton: HTMLElement = null;

    /**
     * HTML button for increasing tech point on a specific ship section.
     */
    private _plusButton: HTMLElement = null;

    /**
     * Number of tech points player has left to spend.
     */
    private _points: number = 10;

    /**
     * Text for points to spend at top left of screen.
     */
    private _pointsText: FadableText = {
        counter: 1,
        element: null,
        holdCount: -1, // Hold until replaced
        isFadeIn: true,
        isHolding: false,
        sentence: ''
    };

    /**
     * HTML button for restting point distribution in ship layout section.
     */
    private _resetButton: HTMLElement = null;

    /**
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * Mesh for box user has selected.
     */
    private _selectedBox: Mesh = null;

    /**
     * Text for selected room at top left of screen.
     */
    private _selectionText: FadableText = {
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
    private _stars: Mesh[] = [];

    /**
     * HTML button for submitting point distribution in ship layout section.
     */
    private _submitButton: HTMLElement = null;

    /**
     * Meshes for all the tech pellets.
     */
    private _techPellentMeshMap: Mesh[] = [];

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
        this._scene = scene.scene;

        this._onWindowResize();
        this._listenerRef = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._listenerRef, false);

        this._createStars();

        const ship = createShip(shipTexture);
        this._actors.push(ship);
        this._scene.add(ship.mesh);
        const shipInterior = createShipInteriorFrame(shipIntTexture);
        this._actors.push(shipInterior);
        this._scene.add(shipInterior.mesh);
        const profile = createProfile(dialogueTexture);
        this._actors.push(profile);
        this._scene.add(profile.mesh);

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
            this._scene.add(barrier);
            barrier.visible = false;
            this._techPellentMeshMap.push(barrier);
        });

        const intersectableThings = createShipLayoutGrid(this._scene, rectangleBoxes, this._meshMap, unhighlightedColor);

        createTextPanels(this._scene, textBoxes);

        const container = document.getElementById('mainview');
        document.onclick = event => {
            event.preventDefault();
            getIntersections(event, container, scene).forEach(el => {
                const hit = intersectableThings.find(box => {
                    if (el.object.name === box.name) {
                        return true;
                    }
                });
                if (hit && hit.name !== (this._selectedBox && this._selectedBox.name)) {
                    Object.keys(this._meshMap).forEach(key => {
                        (this._meshMap[key].material as any).color.set(unhighlightedColor);
                    });

                    this._selectedBox = this._meshMap[hit.name];
                    (this._meshMap[hit.name].material as any).color.set(selectedColor);
                    SoundinatorSingleton.playClick();

                    this._selectionText.sentence = hit.name;
                    this._selectionText.element.innerHTML = this._selectionText.sentence;
                    this._selectionText.isFadeIn = true;
                    this._selectionText.isHolding = false;
                    this._selectionText.counter = 1;
                    this._makeSelectionText();

                    !this._techPellentMeshMap[0].visible ? this._techPellentMeshMap.forEach(x => x.visible = true) : null;
                    this._adjustTechPoints([this._cloneTechPoints[hit.name]]);

                    this._minusButton.style.visibility = 'visible';
                    this._plusButton.style.visibility = 'visible';

                    this._dialogueText.sentence = dialogues[hit.name];
                    this._dialogueText.counter = -1;
                    this._dialogueText.currentIndex = 0;
                    this._dialogueText.isFinished = false;
                    this._makeDialogueText();
                }
            });
        };
        document.onmousemove = event => {
            event.preventDefault();
            const hoverName = this._hoveredBox && this._hoveredBox.name;
            const selectedName = this._selectedBox && this._selectedBox.name;
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
                        this._hoveredBox = this._meshMap[el.object.name];
                        (this._meshMap[el.object.name].material as any).color.set(highlightedColor);
                    } else if (selectedName === hit.name) {
                        isHovering = true;
                        if (!compareRGBValues(this._hoverText.element.style.color.toString().trim(), selectedColorRgb)) {
                            this._hoverText.sentence = hit.name;
                            this._hoverText.element.innerHTML = this._hoverText.sentence;
                            this._hoverText.isFadeIn = true;
                            this._hoverText.isHolding = false;
                            this._hoverText.counter = 1;
                            this._makeHoverText();
                        }
                    }

                    if (hit.name !== hoverName && hit.name !== selectedName) {
                        this._hoverText.sentence = hit.name;
                        this._hoverText.element.innerHTML = this._hoverText.sentence;
                        this._hoverText.isFadeIn = true;
                        this._hoverText.isHolding = false;
                        this._hoverText.counter = 1;
                        this._makeHoverText();
                    }
                    return;
                }
            });
            if (!isHovering && this._hoverText.sentence) {
                this._hoveredBox = null;
                this._hoverText.sentence = '';
                this._hoverText.element.innerHTML = this._hoverText.sentence;
                this._hoverText.isFadeIn = true;
                this._hoverText.isHolding = false;
                this._hoverText.counter = 1;
                this._makeHoverText();
            }
            this._clearMeshMap();
        };
    }

    private _adjustTechPoints(pointSpreads: { current: number; max: number; min: number; start: number; }[]): void {
        pointSpreads.forEach(pointSpread => {
            for (let i = 0; i < this._techPellentMeshMap.length; i++) {
                if (i < pointSpread.min) {
                    (this._techPellentMeshMap[i].material as any).color.set(neutralColor);
                } else if (i < pointSpread.current) {
                    (this._techPellentMeshMap[i].material as any).color.set(selectedColor);
                } else if (i < pointSpread.max) {
                    (this._techPellentMeshMap[i].material as any).color.set(unhighlightedColor);
                } else {
                    (this._techPellentMeshMap[i].material as any).color.set(defaultColor);
                }
            }
            if (pointSpread.current > pointSpread.min) {
                this._minusButton.style.opacity = enabledOpacity;
            } else {
                this._minusButton.style.opacity = disabledOpacity;
            }
            if (this._points <= 0 || pointSpread.current >= pointSpread.max) {
                this._plusButton.style.opacity = disabledOpacity;
            } else {
                this._plusButton.style.opacity = enabledOpacity;
            }
        });
        this._pointsText.sentence = `You have <span style="color: ${neutralColor};">${this._points}</span> tech points to spend`;
        this._pointsText.element.innerHTML = this._pointsText.sentence;
        this._pointsText.isFadeIn = true;
        this._pointsText.isHolding = false;
        this._pointsText.counter = 20;
        this._makePointsText();

        if (this._points === 0) {
            this._submitButton.style.visibility = 'visible';
        } else {
            this._submitButton.style.visibility = 'hidden';
        }

        if (this._points !== startingPoints) {
            this._resetButton.style.visibility = 'visible';
        } else {
            this._resetButton.style.visibility = 'hidden';
        }
    }

    private _clearMeshMap(): void {
        const selectedName = this._selectedBox && this._selectedBox.name;
        const hoveredName = this._hoveredBox && this._hoveredBox.name;
        // If no selected box, don't bother with the extra conditional check.
        if (!selectedName && !hoveredName) {
            Object.keys(this._meshMap).forEach(key => {
                (this._meshMap[key].material as any).color.set(unhighlightedColor);
            });
        } else {
            Object.keys(this._meshMap).forEach(key => {
                if (key !== selectedName && key !== hoveredName) {
                    (this._meshMap[key].material as any).color.set(unhighlightedColor);
                }
            });
        }
    }

    private _createStars(): void {
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
            this._scene.add(mesh);
            this._stars[i] = mesh;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at top right of screen.
     */
    private _makeDialogueText(): void {
        if (this._dialogueText.isFinished) {
            return;
        }
        this._dialogueText.counter++;
        if (this._dialogueText.counter % 3 === 0 && this._dialogueText.currentIndex < this._dialogueText.sentence.length) {
            this._dialogueText.currentIndex++;
            if (this._dialogueText.sentence.charAt(this._dialogueText.currentIndex - 1) === '<') {
                this._dialogueText.currentIndex += 3;
            }if (this._dialogueText.sentence.charAt(this._dialogueText.currentIndex - 1) === '&') {
                this._dialogueText.currentIndex += 11;
            }
            if (this._dialogueText.element) {
                this._dialogueText.element.innerHTML = this._dialogueText.sentence.slice(0, this._dialogueText.currentIndex);
            }
        }
        if (this._dialogueText.currentIndex >= this._dialogueText.sentence.length) {
            this._dialogueText.isFinished = true;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at bottom of screen.
     */
    private _makeHoverText(): void {
        const name = this._selectedBox && this._selectedBox.name;
        const color = name === this._hoverText.sentence ? selectedColor : defaultColor;
        if (this._hoverText.isFadeIn && this._hoverText.counter > 20) {
            this._hoverText.isFadeIn = false;
            this._hoverText.isHolding = true;
            this._hoverText.counter = 1;
        }

        if (this._hoverText.isFadeIn) {
            this._hoverText.element.style.opacity = (this._hoverText.counter / 20) + '';
            this._hoverText.counter++;
            this._hoverText.element.style.color = color;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue for points at top left of screen.
     */
    private _makePointsText(): void {
        if (this._pointsText.isHolding) {
            return;
        }
        if (this._pointsText.isFadeIn && this._pointsText.counter > 20) {
            this._pointsText.isFadeIn = false;
            this._pointsText.isHolding = true;
            this._pointsText.counter = 1;
        }

        if (this._pointsText.isFadeIn) {
            this._pointsText.element.style.opacity = (this._pointsText.counter / 20) + '';
            this._pointsText.counter++;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at top left of screen.
     */
    private _makeSelectionText(): void {
        if (this._selectionText.isHolding) {
            return;
        }
        if (this._selectionText.isFadeIn && this._selectionText.counter > 20) {
            this._selectionText.isFadeIn = false;
            this._selectionText.isHolding = true;
            this._selectionText.counter = 1;
        }

        if (this._selectionText.isFadeIn) {
            this._selectionText.element.style.opacity = (this._selectionText.counter / 20) + '';
            this._selectionText.counter++;
        }
    }

    private _onWindowResize(): void {
        textElements.forEach(el => {
            const element = document.getElementById(el);
            if (element) {
                element.remove();
            }
        });

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

        this._minusButton = createMinusButton(
            { left, height, width },
            { neutralColor, selectedColor },
            !!this._selectedBox
        );

        const minusHover = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (pointSpread.current > pointSpread.min) {
                this._minusButton.style.backgroundColor = defaultColor;
                this._minusButton.style.color = neutralColor;
                this._minusButton.style.border = borderSizeAndStyle + neutralColor;
            }
        };
        this._minusButton.onmouseover = minusHover.bind(this);
        const minusExit = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (pointSpread.current > pointSpread.min) {
                this._minusButton.style.backgroundColor = selectedColor;
                this._minusButton.style.color = neutralColor;
                this._minusButton.style.border = borderSizeAndStyle + neutralColor;
            }
        };
        this._minusButton.onmouseleave = minusExit.bind(this);
        const minusMouseDown = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (pointSpread.current > pointSpread.min) {
                this._minusButton.style.backgroundColor = defaultColor;
                this._minusButton.style.color = selectedColor;
                this._minusButton.style.border = borderSizeAndStyle + selectedColor;
            }
        };
        this._minusButton.onmousedown = minusMouseDown.bind(this);
        const minusMouseUp = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (pointSpread.current > pointSpread.min) {
                this._minusButton.style.backgroundColor = selectedColor;
                this._minusButton.style.color = neutralColor;
                this._minusButton.style.border = borderSizeAndStyle + neutralColor;
                this._points++;
                pointSpread.current--;
                this._adjustTechPoints([pointSpread]);
            }
            if (this._points > 0 && pointSpread.current < pointSpread.max) {
                this._plusButton.style.opacity = enabledOpacity;
            }
            if (pointSpread.current <= pointSpread.min) {
                this._minusButton.style.opacity = disabledOpacity;
            }
        };
        this._minusButton.onmouseup = minusMouseUp.bind(this);

        this._plusButton = document.createElement('button');
        this._plusButton.classList.add('fa', 'fa-plus');
        this._plusButton.id = 'plus-button';
        this._plusButton.style.outline = 'none';
        this._plusButton.style.backgroundColor = selectedColor;
        this._plusButton.style.color = neutralColor;
        this._plusButton.style.position = 'absolute';
        this._plusButton.style.maxWidth = `${0.06 * width}px`;
        this._plusButton.style.width = `${0.06 * width}px`;
        this._plusButton.style.maxHeight = `${0.06 * height}px`;
        this._plusButton.style.height = `${0.06 * height}px`;
        this._plusButton.style.top = `${0.15 * height}px`;
        this._plusButton.style.left = `${left + (0.395 * width)}px`;
        this._plusButton.style.overflowY = 'hidden';
        this._plusButton.style.textAlign = 'center';
        this._plusButton.style.border = borderSizeAndStyle + neutralColor;
        this._plusButton.style.borderRadius = '10px';
        this._plusButton.style.fontSize = `${0.022 * width}px`;
        this._plusButton.style.boxSizing = 'border-box';
        this._plusButton.style.visibility = this._selectedBox ? 'visible' : 'hidden';
        document.body.appendChild(this._plusButton);

        const plusHover = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (this._points > 0 && pointSpread.current < pointSpread.max) {
                this._plusButton.style.backgroundColor = defaultColor;
                this._plusButton.style.color = neutralColor;
                this._plusButton.style.border = borderSizeAndStyle + neutralColor;
            }
        };
        this._plusButton.onmouseover = plusHover.bind(this);
        const plusExit = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (this._points > 0 && pointSpread.current < pointSpread.max) {
                this._plusButton.style.backgroundColor = selectedColor;
                this._plusButton.style.color = neutralColor;
                this._plusButton.style.border = borderSizeAndStyle + neutralColor;
            }
        };
        this._plusButton.onmouseleave = plusExit.bind(this);
        const plusMouseDown = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (this._points > 0 && pointSpread.current < pointSpread.max) {
                this._plusButton.style.backgroundColor = defaultColor;
                this._plusButton.style.color = selectedColor;
                this._plusButton.style.border = borderSizeAndStyle + selectedColor;
            }
        };
        this._plusButton.onmousedown = plusMouseDown.bind(this);
        const plusMouseUp = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (this._points > 0 && pointSpread.current < pointSpread.max) {
                this._plusButton.style.backgroundColor = selectedColor;
                this._plusButton.style.color = neutralColor;
                this._plusButton.style.border = borderSizeAndStyle + neutralColor;
                this._points--;
                pointSpread.current++;
                this._adjustTechPoints([pointSpread]);
            }
            if (this._points <= 0 || pointSpread.current <= pointSpread.min) {
                this._plusButton.style.opacity = disabledOpacity;
            }
        };
        this._plusButton.onmouseup = plusMouseUp.bind(this);

        if (this._selectedBox) {
            this._adjustTechPoints([this._cloneTechPoints[this._selectedBox.name]]);
        }

        this._dialogueText.element = createRightPanelText(
            { left, height, width },
            this._dialogueText.sentence.slice(0, this._dialogueText.currentIndex),
            border,
            neutralColor);

        this._selectionText.element = createLeftPanelTitleText(
            { left, height, width },
            this._selectionText.sentence,
            border,
            neutralColor);

        this._pointsText.element = createLeftPanelSubtitleText(
            { left, height, width },
            this._pointsText.sentence,
            border,
            selectedColor);

        this._hoverText.element = document.createElement('div');
        this._hoverText.element.id = 'ship-layout-screen-hover';
        this._hoverText.element.style.fontFamily = 'Luckiest Guy';
        this._hoverText.element.style.color = neutralColor;
        this._hoverText.element.style.position = 'absolute';
        this._hoverText.element.style.maxWidth = `${0.50 * width}px`;
        this._hoverText.element.style.width = `${0.50 * width}px`;
        this._hoverText.element.style.maxHeight = `${0.04 * height}px`;
        this._hoverText.element.style.height = `${0.04 * height}px`;
        this._hoverText.element.style.backgroundColor = 'transparent';
        this._hoverText.element.innerHTML = this._hoverText.sentence;
        this._hoverText.element.style.bottom = `${(window.innerHeight * 0.99 - height) + (0.02 * height)}px`;
        this._hoverText.element.style.left = `${left + (0.02 * width)}px`;
        this._hoverText.element.style.overflowY = 'hidden';
        this._hoverText.element.style.textAlign = 'left';
        this._hoverText.element.style.fontSize = `${0.03 * width}px`;
        this._hoverText.element.style.border = border;
        document.body.appendChild(this._hoverText.element);

        this._resetButton = document.createElement('button');
        this._resetButton.innerHTML = 'Reset Points';
        this._resetButton.id = 'reset-button';
        this._resetButton.style.outline = 'none';
        this._resetButton.style.backgroundColor = selectedColor;
        this._resetButton.style.color = neutralColor;
        this._resetButton.style.position = 'absolute';
        this._resetButton.style.maxWidth = `${0.18 * width}px`;
        this._resetButton.style.width = `${0.18 * width}px`;
        this._resetButton.style.maxHeight = `${0.03 * height}px`;
        this._resetButton.style.height = `${0.03 * height}px`;
        this._resetButton.style.bottom = `${(window.innerHeight * 0.99 - height) + (0.02 * height)}px`;
        this._resetButton.style.left = `${left + (0.65 * width)}px`;
        this._resetButton.style.overflowY = 'hidden';
        this._resetButton.style.textAlign = 'center';
        this._resetButton.style.border = borderSizeAndStyle + neutralColor;
        this._resetButton.style.borderRadius = '5px';
        this._resetButton.style.fontSize = `${0.022 * width}px`;
        this._resetButton.style.boxSizing = 'border-box';
        this._resetButton.style.visibility = this._points !== startingPoints ? 'visible' : 'hidden';
        document.body.appendChild(this._resetButton);

        const resetHover = () => {
            if (!this._hasSubmitted) {
                this._resetButton.style.backgroundColor = defaultColor;
                this._resetButton.style.color = neutralColor;
                this._resetButton.style.border = borderSizeAndStyle + neutralColor;
            }
        };
        this._resetButton.onmouseover = resetHover.bind(this);
        const resetExit = () => {
            if (!this._hasSubmitted) {
                this._resetButton.style.backgroundColor = selectedColor;
                this._resetButton.style.color = neutralColor;
                this._resetButton.style.border = borderSizeAndStyle + neutralColor;
            }
        };
        this._resetButton.onmouseleave = resetExit.bind(this);
        const resetMouseDown = () => {
            if (!this._hasSubmitted) {
                this._resetButton.style.backgroundColor = defaultColor;
                this._resetButton.style.color = selectedColor;
                this._resetButton.style.border = borderSizeAndStyle + selectedColor;
            }
        };
        this._resetButton.onmousedown = resetMouseDown.bind(this);
        const resetMouseUp = () => {
            if (!this._hasSubmitted) {
                this._resetButton.style.backgroundColor = selectedColor;
                this._resetButton.style.color = neutralColor;
                this._resetButton.style.border = borderSizeAndStyle + neutralColor;
                this._resetPoints();
                setTimeout(() => {
                    this._adjustTechPoints(Object.values(this._cloneTechPoints));
                }, 10);
            }
        };
        this._resetButton.onmouseup = resetMouseUp.bind(this);

        this._submitButton = document.createElement('button');
        this._submitButton.innerHTML = 'Play';
        this._submitButton.id = 'submit-button';
        this._submitButton.style.outline = 'none';
        this._submitButton.style.backgroundColor = selectedColor;
        this._submitButton.style.color = neutralColor;
        this._submitButton.style.position = 'absolute';
        this._submitButton.style.maxWidth = `${0.12 * width}px`;
        this._submitButton.style.width = `${0.12 * width}px`;
        this._submitButton.style.maxHeight = `${0.03 * height}px`;
        this._submitButton.style.height = `${0.03 * height}px`;
        this._submitButton.style.bottom = `${(window.innerHeight * 0.99 - height) + (0.02 * height)}px`;
        this._submitButton.style.left = `${left + (0.85 * width)}px`;
        this._submitButton.style.overflowY = 'hidden';
        this._submitButton.style.textAlign = 'center';
        this._submitButton.style.border = borderSizeAndStyle + neutralColor;
        this._submitButton.style.borderRadius = '5px';
        this._submitButton.style.fontSize = `${0.022 * width}px`;
        this._submitButton.style.boxSizing = 'border-box';
        this._submitButton.style.visibility = this._points === 0 ? 'visible' : 'hidden';
        document.body.appendChild(this._submitButton);

        const submitHover = () => {
            if (!this._hasSubmitted) {
                this._submitButton.style.backgroundColor = defaultColor;
                this._submitButton.style.color = neutralColor;
                this._submitButton.style.border = borderSizeAndStyle + neutralColor;
            }
        };
        this._submitButton.onmouseover = submitHover.bind(this);
        const submitExit = () => {
            if (!this._hasSubmitted) {
                this._submitButton.style.backgroundColor = selectedColor;
                this._submitButton.style.color = neutralColor;
                this._submitButton.style.border = borderSizeAndStyle + neutralColor;
            }
        };
        this._submitButton.onmouseleave = submitExit.bind(this);
        const submitMouseDown = () => {
            if (!this._hasSubmitted) {
                this._submitButton.style.backgroundColor = defaultColor;
                this._submitButton.style.color = selectedColor;
                this._submitButton.style.border = borderSizeAndStyle + selectedColor;
            }
        };
        this._submitButton.onmousedown = submitMouseDown.bind(this);
        const submitMouseUp = () => {
            if (!this._hasSubmitted) {
                this._submitButton.style.backgroundColor = selectedColor;
                this._submitButton.style.color = neutralColor;
                this._submitButton.style.border = borderSizeAndStyle + neutralColor;
                this._submitButton.style.opacity = disabledOpacity;
                setTimeout(() => {
                    this._hasSubmitted = true;
                }, 100);
            }
        };
        this._submitButton.onmouseup = submitMouseUp.bind(this);
    };

    private _resetPoints(): void {
        this._cloneTechPoints = JSON.parse(JSON.stringify(techPoints));
        this._points = startingPoints;
    }

    /**
     * Removes any attached DOM elements, event listeners, or anything separate from ThreeJS
     */
    public dispose(): void {
        document.onmousemove = () => {};
        document.onclick = () => {};
        textElements.forEach(el => {
            document.getElementById(el).remove();
        });
        window.removeEventListener( 'resize', this._listenerRef, false);
    }

    /**
     * At the end of each loop iteration, check for end state.
     * @returns whether or not the scene is done.
     */
    public endCycle(): { [key: string]: number } {
        if (this._hasSubmitted) {
            const chosenLayout: { [key: string]: number } = {};
            Object.keys(this._cloneTechPoints).forEach(tp => {
                chosenLayout[tp] = this._cloneTechPoints[tp].current;
            });
            return chosenLayout;
        }
        this._makeDialogueText();
        this._makeHoverText();
        this._makePointsText();
        this._makeSelectionText();
        return null;
    }
}
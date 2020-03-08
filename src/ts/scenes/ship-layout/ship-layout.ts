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
import { TechPoints } from '../../models/tech-points';
import { MinusButton } from '../../controls/buttons/minus-button';
import { ButtonBase } from '../../controls/buttons/button-base';
import { ButtonColors } from '../../models/button-colors';
import { PlusButton } from '../../controls/buttons/plus-button';
import { PlayButton } from '../../controls/buttons/play-button';
import { ResetButton } from '../../controls/buttons/reset-button';

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
 * Color scheme for all lifecycle events of a button.
 */
const buttonColors: ButtonColors = {
    default: {
        backgroundColor: selectedColor,
        color: neutralColor,
        border: neutralColor
    },
    onExit: {
        backgroundColor: selectedColor,
        color: neutralColor,
        border: neutralColor
    },
    onHover: {
        backgroundColor: defaultColor,
        color: neutralColor,
        border: neutralColor
    },
    onMouseDown: {
        backgroundColor: defaultColor,
        color: selectedColor,
        border: selectedColor
    },
    onMouseUp: {
        backgroundColor: selectedColor,
        color: neutralColor,
        border: neutralColor
    }
};

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
     * List of buttons
     */
    private _buttons: { [key: string]: ButtonBase } = {
        // HTML button for decreasing tech point on a specific ship section.
        minusButton: null,
        // HTML button for submitting point distribution in ship layout section.
        playButton: null,
        // HTML button for increasing tech point on a specific ship section.
        plusButton: null,
        // HTML button for restting point distribution in ship layout section.
        resetButton: null
    };

    /**
     * Cloned version of the techPoints object to allow for resetting.
     */
    private _cloneTechPoints: { [key: string]: TechPoints } = JSON.parse(JSON.stringify(techPoints));

    /**
     * Flag to signal user has completed layout specs.
     */
    private _hasSubmitted: boolean = false;

    /**
     * Mesh for box user has hovered over.
     */
    private _hoveredBox: Mesh = null;

    /**
     * Reference to _onWindowResize so that it can be removed later.
     */
    private _listenerRef: () => void;

    /**
     * Meshes for all the boxes user can interact with.
     */
    private _meshMap: { [key: string]: Mesh } = {};

    /**
     * Number of tech points player has left to spend.
     */
    private _points: number = 10;

    /**
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private _scene: Scene;

    /**
     * Mesh for box user has selected.
     */
    private _selectedBox: Mesh = null;

    /**
     * Stars in background.
     */
    private _stars: Mesh[] = [];

    /**
     * Meshes for all the tech pellets.
     */
    private _techPellentMeshMap: Mesh[] = [];

    /**
     * Groups of text elements
     */
    private _textElements: { [key: string]: (DialogueText | FadableText) } = {
        // Text for hovered room at bottom of screen.
        dialogueText: {
            counter: 1,
            currentIndex: 0,
            element: null,
            font: null,
            isFinished: false,
            sentence: dialogues['']
        },
        // Text for hovered room at bottom of screen.
        hoverText: {
            counter: 1,
            element: null,
            holdCount: -1, // Hold until replaced
            isFadeIn: true,
            isHolding: false,
            sentence: ''
        },
        // Text for points to spend at top left of screen.
        pointsText: {
            counter: 1,
            element: null,
            holdCount: -1, // Hold until replaced
            isFadeIn: true,
            isHolding: false,
            sentence: ''
        },
        // Text for selected room at top left of screen.
        selectionText: {
            counter: 1,
            element: null,
            holdCount: -1, // Hold until replaced
            isFadeIn: true,
            isHolding: false,
            sentence: ''
        }
    };

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

        this._onInitialize();
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

                    this._textElements.selectionText.sentence = hit.name;
                    this._textElements.selectionText.element.innerHTML = this._textElements.selectionText.sentence;
                    (<FadableText>this._textElements.selectionText).isFadeIn = true;
                    (<FadableText>this._textElements.selectionText).isHolding = false;
                    this._textElements.selectionText.counter = 1;
                    this._makeSelectionText();

                    !this._techPellentMeshMap[0].visible ? this._techPellentMeshMap.forEach(x => x.visible = true) : null;
                    this._adjustTechPoints([this._cloneTechPoints[hit.name]]);

                    this._buttons.minusButton.show();
                    this._buttons.plusButton.show();

                    this._textElements.dialogueText.sentence = dialogues[hit.name];
                    this._textElements.dialogueText.counter = -1;
                    (<DialogueText>this._textElements.dialogueText).currentIndex = 0;
                    (<DialogueText>this._textElements.dialogueText).isFinished = false;
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
                        if (!compareRGBValues(this._textElements.hoverText.element.style.color.toString().trim(), selectedColorRgb)) {
                            this._textElements.hoverText.sentence = hit.name;
                            this._textElements.hoverText.element.innerHTML = this._textElements.hoverText.sentence;
                            (<FadableText>this._textElements.hoverText).isFadeIn = true;
                            (<FadableText>this._textElements.hoverText).isHolding = false;
                            this._textElements.hoverText.counter = 1;
                            this._makeHoverText();
                        }
                    }

                    if (hit.name !== hoverName && hit.name !== selectedName) {
                        this._textElements.hoverText.sentence = hit.name;
                        this._textElements.hoverText.element.innerHTML = this._textElements.hoverText.sentence;
                        (<FadableText>this._textElements.hoverText).isFadeIn = true;
                        (<FadableText>this._textElements.hoverText).isHolding = false;
                        this._textElements.hoverText.counter = 1;
                        this._makeHoverText();
                    }
                    return;
                }
            });
            if (!isHovering && this._textElements.hoverText.sentence) {
                this._textElements.hoveredBox = null;
                this._textElements.hoverText.sentence = '';
                this._textElements.hoverText.element.innerHTML = this._textElements.hoverText.sentence;
                (<FadableText>this._textElements.hoverText).isFadeIn = true;
                (<FadableText>this._textElements.hoverText).isHolding = false;
                this._textElements.hoverText.counter = 1;
                this._makeHoverText();
            }
            this._clearMeshMap();
        };
    }

    /**
     * Cycles through the series of tech points objects and adjusts their color schemes, and related buttons.
     * @param pointSpreads current tech points objects to adjust
     */
    private _adjustTechPoints(pointSpreads: TechPoints[]): void {
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
                this._buttons.minusButton.enable();
            } else {
                this._buttons.minusButton.disable();
            }
            if (this._points <= 0 || pointSpread.current >= pointSpread.max) {
                this._buttons.plusButton.disable();
            } else {
                this._buttons.plusButton.enable();
            }
        });
        this._textElements.pointsText.sentence = `You have <span style="color: ${neutralColor};">${this._points}</span> tech points to spend`;
        this._textElements.pointsText.element.innerHTML = this._textElements.pointsText.sentence;
        (<FadableText>this._textElements.pointsText).isFadeIn = true;
        (<FadableText>this._textElements.pointsText).isHolding = false;
        this._textElements.pointsText.counter = 20;
        this._makePointsText();

        if (this._points === 0) {
            this._buttons.playButton.show();
        } else {
            this._buttons.playButton.hide();
        }

        if (this._points !== startingPoints) {
            this._buttons.resetButton.show();
        } else {
            this._buttons.resetButton.hide();
        }
    }

    /**
     * Sets all interactable boxes to default colors if user isn't interacting with them.
     */
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

    /**
     * Creates the illusion of stars in the background.
     */
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
        if ((<DialogueText>this._textElements.dialogueText).isFinished) {
            return;
        }
        this._textElements.dialogueText.counter++;
        if (this._textElements.dialogueText.counter % 3 === 0 && (<DialogueText>this._textElements.dialogueText).currentIndex < this._textElements.dialogueText.sentence.length) {
            (<DialogueText>this._textElements.dialogueText).currentIndex++;
            if (this._textElements.dialogueText.sentence.charAt((<DialogueText>this._textElements.dialogueText).currentIndex - 1) === '<') {
                (<DialogueText>this._textElements.dialogueText).currentIndex += 3;
            }if (this._textElements.dialogueText.sentence.charAt((<DialogueText>this._textElements.dialogueText).currentIndex - 1) === '&') {
                (<DialogueText>this._textElements.dialogueText).currentIndex += 11;
            }
            if (this._textElements.dialogueText.element) {
                this._textElements.dialogueText.element.innerHTML = this._textElements.dialogueText.sentence.slice(0, (<DialogueText>this._textElements.dialogueText).currentIndex);
            }
        }
        if ((<DialogueText>this._textElements.dialogueText).currentIndex >= this._textElements.dialogueText.sentence.length) {
            (<DialogueText>this._textElements.dialogueText).isFinished = true;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at bottom of screen.
     */
    private _makeHoverText(): void {
        const name = this._selectedBox && this._selectedBox.name;
        const color = name === this._textElements.hoverText.sentence ? selectedColor : defaultColor;
        if ((<FadableText>this._textElements.hoverText).isFadeIn && this._textElements.hoverText.counter > 20) {
            (<FadableText>this._textElements.hoverText).isFadeIn = false;
            (<FadableText>this._textElements.hoverText).isHolding = true;
            this._textElements.hoverText.counter = 1;
        }

        if ((<FadableText>this._textElements.hoverText).isFadeIn) {
            this._textElements.hoverText.element.style.opacity = (this._textElements.hoverText.counter / 20) + '';
            this._textElements.hoverText.counter++;
            this._textElements.hoverText.element.style.color = color;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue for points at top left of screen.
     */
    private _makePointsText(): void {
        if ((<FadableText>this._textElements.pointsText).isHolding) {
            return;
        }
        if ((<FadableText>this._textElements.pointsText).isFadeIn && this._textElements.pointsText.counter > 20) {
            (<FadableText>this._textElements.pointsText).isFadeIn = false;
            (<FadableText>this._textElements.pointsText).isHolding = true;
            this._textElements.pointsText.counter = 1;
        }

        if ((<FadableText>this._textElements.pointsText).isFadeIn) {
            this._textElements.pointsText.element.style.opacity = (this._textElements.pointsText.counter / 20) + '';
            this._textElements.pointsText.counter++;
        }
    }

    /**
     * Builds the text and graphics for the text dialogue at top left of screen.
     */
    private _makeSelectionText(): void {
        if ((<FadableText>this._textElements.selectionText).isHolding) {
            return;
        }
        if ((<FadableText>this._textElements.selectionText).isFadeIn && this._textElements.selectionText.counter > 20) {
            (<FadableText>this._textElements.selectionText).isFadeIn = false;
            (<FadableText>this._textElements.selectionText).isHolding = true;
            this._textElements.selectionText.counter = 1;
        }

        if ((<FadableText>this._textElements.selectionText).isFadeIn) {
            this._textElements.selectionText.element.style.opacity = (this._textElements.selectionText.counter / 20) + '';
            this._textElements.selectionText.counter++;
        }
    }

    /**
     * Creates all of the html elements for the first time on scene creation.
     */
    private _onInitialize(): void {
        // Get window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        // Sets up the minus button, or adjusts it.
        let onClick = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (pointSpread.current > pointSpread.min) {
                this._points++;
                pointSpread.current--;
                this._adjustTechPoints([pointSpread]);
            }
            if (pointSpread.current <= pointSpread.min) {
                this._buttons.minusButton.disable();
            }
        };

        this._buttons.minusButton = new MinusButton(
            { left: left + (0.02 * width), height, top: (0.15 * height), width },
            buttonColors,
            onClick,
            !!this._selectedBox);

        // Sets up the plus button, or adjusts it.
        onClick = () => {
            const pointSpread = this._cloneTechPoints[this._selectedBox.name];
            if (this._points > 0 && pointSpread.current < pointSpread.max) {
                this._points--;
                pointSpread.current++;
                this._adjustTechPoints([pointSpread]);
            }
            if (this._points <= 0 || pointSpread.current <= pointSpread.min) {
                this._buttons.plusButton.disable();
            }
        };

        this._buttons.plusButton = new PlusButton(
            { left: left + (0.395 * width), height, top: (0.15 * height), width },
            buttonColors,
            onClick,
            !!this._selectedBox);

        // Sets up the play button, or adjusts it.
        onClick = () => {
            if (!this._hasSubmitted) {
                this._buttons.playButton.disable();
                setTimeout(() => {
                    this._hasSubmitted = true;
                }, 100);
            }
        };

        this._buttons.playButton = new PlayButton(
            { left: left + (0.85 * width), height, top: height - (0.04 * height), width },
            buttonColors,
            onClick,
            this._points === 0);

        // Sets up the reset button, or adjusts it.
        onClick = () => {
            if (!this._hasSubmitted) {
                this._resetPoints();
                setTimeout(() => {
                    this._adjustTechPoints(Object.values(this._cloneTechPoints));
                }, 10);
            }
        };

        this._buttons.resetButton = new ResetButton(
            { left: left + (0.65 * width), height, top: height - (0.04 * height), width },
            buttonColors,
            onClick,
            this._points !== startingPoints);

        // Create the various texts
        this._textElements.dialogueText.element = createRightPanelText(
            { left, height, width },
            this._textElements.dialogueText.sentence.slice(0, (<DialogueText>this._textElements.dialogueText).currentIndex),
            border,
            neutralColor);

        this._textElements.selectionText.element = createLeftPanelTitleText(
            { left, height, width },
            this._textElements.selectionText.sentence,
            border,
            neutralColor);

        this._textElements.pointsText.element = createLeftPanelSubtitleText(
            { left, height, width },
            this._textElements.pointsText.sentence,
            border,
            selectedColor);

        this._textElements.hoverText.element = document.createElement('div');
        this._textElements.hoverText.element.id = 'ship-layout-screen-hover';
        this._textElements.hoverText.element.style.fontFamily = 'Luckiest Guy';
        this._textElements.hoverText.element.style.color = neutralColor;
        this._textElements.hoverText.element.style.position = 'absolute';
        this._textElements.hoverText.element.style.maxWidth = `${0.50 * width}px`;
        this._textElements.hoverText.element.style.width = `${0.50 * width}px`;
        this._textElements.hoverText.element.style.maxHeight = `${0.04 * height}px`;
        this._textElements.hoverText.element.style.height = `${0.04 * height}px`;
        this._textElements.hoverText.element.style.backgroundColor = 'transparent';
        this._textElements.hoverText.element.innerHTML = this._textElements.hoverText.sentence;
        this._textElements.hoverText.element.style.bottom = `${(window.innerHeight * 0.99 - height) + (0.02 * height)}px`;
        this._textElements.hoverText.element.style.left = `${left + (0.02 * width)}px`;
        this._textElements.hoverText.element.style.overflowY = 'hidden';
        this._textElements.hoverText.element.style.textAlign = 'left';
        this._textElements.hoverText.element.style.fontSize = `${0.03 * width}px`;
        this._textElements.hoverText.element.style.border = border;
        document.body.appendChild(this._textElements.hoverText.element);
    }

    /**
     * When the browser window changes in size, all html elements are updated in kind.
     */
    private _onWindowResize(): void {
        // Get new window dimmensions
        let width = window.innerWidth * 0.99;
        let height = window.innerHeight * 0.99;
        width < height ? height = width : width = height;
        const left = (((window.innerWidth * 0.99) - width) / 2);

        this._buttons.minusButton.resize({ left: left + (0.02 * width), height, top: (0.15 * height), width });
        this._buttons.plusButton.resize({ left: left + (0.395 * width), height, top: (0.15 * height), width });
        this._buttons.playButton.resize({ left: left + (0.85 * width), height, top: height - (0.04 * height), width });
        this._buttons.resetButton.resize({ left: left + (0.65 * width), height, top: height - (0.04 * height), width });

        if (this._selectedBox) {
            this._adjustTechPoints([this._cloneTechPoints[this._selectedBox.name]]);
        }

        // Destroy old text
        textElements.forEach(el => {
            const element = document.getElementById(el);
            if (element) {
                element.remove();
            }
        });

        // Create the various texts
        this._textElements.dialogueText.element = createRightPanelText(
            { left, height, width },
            this._textElements.dialogueText.sentence.slice(0, (<DialogueText>this._textElements.dialogueText).currentIndex),
            border,
            neutralColor);

        this._textElements.selectionText.element = createLeftPanelTitleText(
            { left, height, width },
            this._textElements.selectionText.sentence,
            border,
            neutralColor);

        this._textElements.pointsText.element = createLeftPanelSubtitleText(
            { left, height, width },
            this._textElements.pointsText.sentence,
            border,
            selectedColor);

        this._textElements.hoverText.element = document.createElement('div');
        this._textElements.hoverText.element.id = 'ship-layout-screen-hover';
        this._textElements.hoverText.element.style.fontFamily = 'Luckiest Guy';
        this._textElements.hoverText.element.style.color = neutralColor;
        this._textElements.hoverText.element.style.position = 'absolute';
        this._textElements.hoverText.element.style.maxWidth = `${0.50 * width}px`;
        this._textElements.hoverText.element.style.width = `${0.50 * width}px`;
        this._textElements.hoverText.element.style.maxHeight = `${0.04 * height}px`;
        this._textElements.hoverText.element.style.height = `${0.04 * height}px`;
        this._textElements.hoverText.element.style.backgroundColor = 'transparent';
        this._textElements.hoverText.element.innerHTML = this._textElements.hoverText.sentence;
        this._textElements.hoverText.element.style.bottom = `${(window.innerHeight * 0.99 - height) + (0.02 * height)}px`;
        this._textElements.hoverText.element.style.left = `${left + (0.02 * width)}px`;
        this._textElements.hoverText.element.style.overflowY = 'hidden';
        this._textElements.hoverText.element.style.textAlign = 'left';
        this._textElements.hoverText.element.style.fontSize = `${0.03 * width}px`;
        this._textElements.hoverText.element.style.border = border;
        document.body.appendChild(this._textElements.hoverText.element);
    };

    /**
     * Uses original tech points to overwrite current tech points.
     */
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
        Object.keys(this._buttons).forEach(x => x && this._buttons[x].dispose());
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
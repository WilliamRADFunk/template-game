import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    Texture } from 'three';

import { SoundinatorSingleton } from '../../soundinator';
import { Actor } from '../../models/actor';
import { createShip } from './actors/create-ship';
import { createShipInteriorFrame } from './actors/create-ship-interior-frame';
import { SceneType } from '../../models/scene-type';
import { getIntersections } from '../../utils/get-intersections';
import { createBoxWithRoundedEdges } from '../../utils/create-box-with-rounded-edges';
import { RightTopProfile } from '../../controls/profiles/right-top-profile';
import { dialogues } from './configs/dialogues';
import { techPoints } from './configs/tech-points';
import { techPellets, rectangleBoxes } from './configs/grid-items';
import { createShipLayoutGrid } from './helpers/create-ship-layout-grid';
import { TechPoints } from '../../models/tech-points';
import { BUTTON_COLORS } from '../../styles/button-colors';
import { MinusButton } from '../../controls/buttons/minus-button';
import { ButtonBase } from '../../controls/buttons/button-base';
import { PlusButton } from '../../controls/buttons/plus-button';
import { PlayButton } from '../../controls/buttons/play-button';
import { ResetButton } from '../../controls/buttons/reset-button';
import { FooterText } from '../../controls/text/footer-text';
import { TextType } from '../../controls/text/text-type';
import { LeftTopTitleText } from '../../controls/text/title/left-top-title-text';
import { LeftTopSubtitleText } from '../../controls/text/subtitle/left-top-subtitle-text';
import { RightTopDialogueText } from '../../controls/text/dialogue/right-top-dialogue-text';
import { LeftTopPanel } from '../../controls/panels/left-top-panel';
import { RightTopPanel } from '../../controls/panels/right-top-panel';
import { COLORS } from '../../styles/colors';
import { noOp } from '../../utils/no-op';

// const border: string = '1px solid #FFF';
const border: string = 'none';

/**
 * Number of points user can have to use initially.
 */
const startingPoints = 10;

/**
 * @class
 * Screen dedicated to letting user choose their initial ship layout.
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
    private _textElements: { [key: string]: (RightTopDialogueText | LeftTopSubtitleText | LeftTopTitleText | FooterText) } = {
        // Text for hovered room at bottom of screen.
        dialogueText: null,
        // Text for hovered room at bottom of screen.
        hoverText:  null,
        // Text for points to spend at top left of screen.
        pointsText: null,
        // Text for selected room at top left of screen.
        selectionText: null
    };

    /**
     * Constructor for the Ship Layout (Scene) class
     * @param scene             graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param shipIntTexture    texture for the ship in cut profile.
     * @param shipTexture       texture for the ship.
     * @param dialogueTexture   texture for the profile image.
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
        this._actors.push(new RightTopProfile(this._scene, dialogueTexture, false).profile);

        techPellets.forEach(pellet => {
            const pelletMaterial = new MeshBasicMaterial({
                color: COLORS.unhighlighted,
                opacity: 0.5,
                transparent: true,
                side: DoubleSide
            });
            const pelletGeometry = createBoxWithRoundedEdges(pellet.width, pellet.height, pellet.radius, 0);
            const barrier = new Mesh( pelletGeometry, pelletMaterial );
            barrier.name = pellet.name;
            barrier.position.set(pellet.x, -10, pellet.z);
            barrier.rotation.set(1.5708, 0, 0);
            this._scene.add(barrier);
            barrier.visible = false;
            this._techPellentMeshMap.push(barrier);
        });

        const intersectableThings = createShipLayoutGrid(this._scene, rectangleBoxes, this._meshMap, COLORS.unhighlighted);

        const leftTopPanel = new LeftTopPanel(this._scene);
        const rightTopPanel = new RightTopPanel(this._scene);

        const container = document.getElementById('mainview');
        document.oncontextmenu = event => {
            return false;
        };
        document.onclick = event => {
            event.preventDefault();
            getIntersections(event, container, scene).forEach(el => {
                const hit = intersectableThings.find(box => {
                    if (el.object.name === box.name) {
                        return true;
                    }
                });
                if (hit) {
                    SoundinatorSingleton.playBidooo();
                }
                if (hit && hit.name !== (this._selectedBox && this._selectedBox.name)) {
                    Object.keys(this._meshMap).forEach(key => {
                        (this._meshMap[key].material as any).color.set(COLORS.unhighlighted);
                    });

                    this._selectedBox = this._meshMap[hit.name];
                    (this._meshMap[hit.name].material as any).color.set(COLORS.selected);
                    SoundinatorSingleton.playBidooo();

                    this._textElements.hoverText.update(hit.name);
                    this._textElements.selectionText.update(hit.name);

                    !this._techPellentMeshMap[0].visible ? this._techPellentMeshMap.forEach(x => x.visible = true) : noOp();
                    this._adjustTechPoints([this._cloneTechPoints[hit.name]]);

                    this._buttons.minusButton.show();
                    this._buttons.plusButton.show();

                    this._textElements.dialogueText.update(dialogues[hit.name]);
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
                        (this._meshMap[el.object.name].material as any).color.set(COLORS.highlighted);
                    } else if (selectedName === hit.name) {
                        isHovering = true;
                        if (this._textElements.hoverText.color.toString().trim() !== COLORS.selected) {
                            this._textElements.hoverText.update(hit.name);
                        }
                    }

                    if (hit.name !== hoverName && hit.name !== selectedName) {
                        this._textElements.hoverText.update(hit.name);
                    }
                    return;
                }
            });
            if (!isHovering && this._textElements.hoverText.sentence) {
                this._textElements.hoverText.update('');
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
                let color;
                if (i < pointSpread.min) {
                    color = COLORS.neutral;
                } else if (i < pointSpread.current) {
                    color = COLORS.selected;
                } else if (i < pointSpread.max) {
                    color = COLORS.unhighlighted;
                } else {
                    color = COLORS.default;
                }
                (this._techPellentMeshMap[i].material as any).color.set(color);
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
        this._textElements.pointsText.update(`You have <span style="color: ${COLORS.neutral};">${this._points}</span> tech points to spend`);

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
            Object.keys(this._meshMap).forEach(key => (this._meshMap[key].material as any).color.set(COLORS.unhighlighted));
        } else {
            Object.keys(this._meshMap)
                .filter(key => key !== selectedName && key !== hoveredName)
                .forEach(key => (this._meshMap[key].material as any).color.set(COLORS.unhighlighted));
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
            BUTTON_COLORS,
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
            BUTTON_COLORS,
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
            BUTTON_COLORS,
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
            BUTTON_COLORS,
            onClick,
            this._points !== startingPoints);

        // Create the various texts
        this._textElements.dialogueText = new RightTopDialogueText(
            dialogues[''],
            { left, height, top: null, width },
            COLORS.neutral,
            border,
            TextType.DIALOGUE);

        this._textElements.selectionText = new LeftTopTitleText(
            '',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.FADABLE);

        this._textElements.pointsText = new LeftTopSubtitleText(
            '',
            { left, height, top: null, width },
            COLORS.selected,
            border,
            TextType.STATIC);

        this._textElements.hoverText = new FooterText(
            '',
            { left: left + (0.02 * width), height, top: height - (0.04 * height), width },
            COLORS.neutral,
            'left',
            border,
            TextType.FADABLE);
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

        // Update the various buttons
        this._buttons.minusButton.resize({ left: left + (0.02 * width), height, top: (0.15 * height), width });
        this._buttons.plusButton.resize({ left: left + (0.395 * width), height, top: (0.15 * height), width });
        this._buttons.playButton.resize({ left: left + (0.85 * width), height, top: height - (0.04 * height), width });
        this._buttons.resetButton.resize({ left: left + (0.65 * width), height, top: height - (0.04 * height), width });

        if (this._selectedBox) {
            this._adjustTechPoints([this._cloneTechPoints[this._selectedBox.name]]);
        }

        // Update the various texts
        this._textElements.dialogueText.resize({ left, height, top: null, width });
        this._textElements.selectionText.resize({ left: left + (0.02 * width), height, top: 0.01 * height, width });
        this._textElements.pointsText.resize({ left, height, top: null, width });
        this._textElements.hoverText.resize({ left: left + (0.02 * width), height, top: height - (0.04 * height), width });
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
        document.oncontextmenu = () => {};
        Object.keys(this._textElements).forEach(x => x && this._textElements[x].dispose());
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
            Object.keys(this._cloneTechPoints).forEach(tp => chosenLayout[tp] = this._cloneTechPoints[tp].current);
            return chosenLayout;
        }

        const name = this._selectedBox && this._selectedBox.name;
        const color = name === this._textElements.hoverText.sentence ? COLORS.selected : COLORS.default;
        this._textElements.hoverText.cycle(color);
        this._textElements.selectionText.cycle();
        this._textElements.pointsText.cycle();
        this._textElements.dialogueText.cycle();
        return null;
    }
}
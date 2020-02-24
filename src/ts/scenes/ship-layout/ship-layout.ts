import {
    CircleGeometry,
    DoubleSide,
    Font,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PlaneGeometry,
    Scene,
    TextGeometry,
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

const dialogues: { [key: string]: string } = {
    '': `"Click a blue box to select
 a room and assign
 technology points."`,

    'Galley & Mess Hall': `"The galley prepares food
 for the crew. The mess
 hall is where they eat
 and socialize.
  Improved equipment will
 help less food to feed
 more. A larger mess hall
 is also better for
 morale."`,

    'Crew Quarters A': `"Crew quarters are
 where your crew will
 sleep and relax.
  Larger crew quarters
 allow for a higher
 crew cap, and an improved
 overall morale."`,

    'Crew Quarters B': `"Crew quarters are
 where your crew will
 sleep and relax.
  Larger crew quarters
 allow for a higher
 crew cap, and an improved
 overall morale."`,

    'Weapons Room': `"The Weapons Room stores,
 loads, and fires your
 ship's nukes. You can
 only hold two weapon
 types at a time.
  Add tech points here
 to extend range, blast
 radius, and concussive
 power."`,

    'Extended Reality Deck': `"An entire deck with
 full-body haptic suits,
 and wireless VR/AR
 headsets.
  Boosts crew morale as
 the improved processing
 power allows for a more
 immersive experience."`,

    'Climate-Controlled Cargo Space': `"This is where your more
 delicate cargo is stored.
 Temperature, humidity,
 and atmosphere regulated
 to preserve it for longer.
  Improved equipment here
 increases cargo space,
 and allows a larger
 variety of goods to be
 stored."`,

    'Standard Cargo Space': `"This is where your more
 ruggid cargo is stored.
 Ores, trade goods, various
 currencies, and anything
 that can be left on a
 shelf for long periods.
  Improved equipment here
 increases cargo space,
 and allows a larger
 variety of goods to be
 stored."`,

    'Engine Room': `"The engines don't just
 use deuterium to make
 the ship go. They power
 everything on board.
  Improvements here
 increase the engine's
 efficiency; to use less
 fuel to achieve the same
 effect."`,

    'Bridge': `"The bridge is where
 your officers do their
 work.
  Advancements here will
 increase the number of
 officers you can have
 on-duty at a given time."`,

    'Officers Quarters': `"Like crew quarters, your
 officers need a place to
 lay their heads. They
 can't be seen fraternizing
 with the enlisted. So,
 they get their own space.
  Improvements give
 them more room to
 stretch their feet,
 and encourages them
 to be at their best."`,

    'Training Deck': `"While the crew are some
 of the League's best
 trained people, they
 still need to keep those
 skills sharp.
  Better equipment, space,
 and training regimen
 will have your crew
 humming like a finely-
 tuned machine."`,

    'Port Thrusters': `"Port-side thrusters allow
 your ship to turn toward
 starboard (clockwise).
  More tech points give
 the thrusters more kick
 and a faster clockwise
 turn speed."`,

    'Main Thruster': `"How fast and how far
 your ship can move with
 each jump.
  Advancements here will
 increase forward speed
 in combat, but also how
 far the ship can move
 across the stars with
 each burst."`,

    'Starboard Thrusters': `"Starboard-side thrusters
 allow your ship to
 turn toward port
 (counter-clockwise).
  More tech points give
 the thrusters more kick
 and a faster counter-
 clockwise turn speed."`,

    'Sensors': `"You can't rely on looking
 out a window to know
 what's going on outside
 the ship. You need
 complex sensory equipment
 to avoid debris, black
 holes; to steer the ship
 accurately; to find
 things worth exploring.
  More points translate
 to seeing farther."`,

    'Artificial Gravity Rings': `"The enzmann has three
 high-density rings that
 spin continuously about
 the ship to provide
 earthlike gravity, and
 shock-aborbing stability.
  Upgrades improve overall
 crew efficiency and
 reduced hull damage from
 blasts that penetrate
 your shilds."`,

    'Shield Emitters': `"Your shields can deflect
 many forms of physical
 damage through a complex
 array of electromagnetic
 frequencies. Some photon-
 based weapons may still
 bypass these.
  Spend tech points and
 you will be able to hold
 your shields longer and
 recharge them faster."`,

    'Deuterium Tank': `"Deuterium is your fuel.
 This massive tank is
 where that fuel is stored.
  Add tech points, and
 increase the max amount
 of fuel you can safely
 store at one time.`
};

const rectangleBoxes: { height: number; width: number; x: number; z: number; radius: number; rot: number; name: string; }[] = [
    { height: 0.49, width: 1.64, x: -0.9, z: 2.98, radius: 0.09, rot: 0, name: 'Galley & Mess Hall' },
    { height: 0.49, width: 1.64, x: -0.9, z: 2.28, radius: 0.07, rot: 0, name: 'Crew Quarters A' },
    { height: 0.49, width: 1.64, x: -0.9, z: 3.71, radius: 0.09, rot: 0, name: 'Crew Quarters B' },
    { height: 1.01, width: 0.49, x: 0.36, z: 2.35, radius: 0.05, rot: 0, name: 'Weapons Room' },
    { height: 1.01, width: 0.49, x: 0.36, z: 3.59, radius: 0.05, rot: 0, name: 'Extended Reality Deck' },
    { height: 0.95, width: 0.94, x: -2.39, z: 2.45, radius: 0.06, rot: 0, name: 'Climate-Controlled Cargo Space' },
    { height: 0.95, width: 0.94, x: -2.39, z: 3.62, radius: 0.06, rot: 0, name: 'Standard Cargo Space' },
    { height: 2.10, width: 0.48, x: -3.38, z: 3.04, radius: 0.05, rot: 0, name: 'Engine Room' },
    { height: 0.77, width: 0.48, x: 0.99, z: 2.98, radius: 0.04, rot: 0, name: 'Bridge' },
    { height: 0.47, width: 0.48, x: 0.99, z: 2.22, radius: 0.05, rot: 0, name: 'Officers Quarters' },
    { height: 0.47, width: 0.48, x: 0.99, z: 3.75, radius: 0.03, rot: 0, name: 'Training Deck' },
    { height: 0.24, width: 0.38, x: -5.69, z: 1.99, radius: 0.02, rot: 0, name: 'Port Thrusters' },
    { height: 0.24, width: 0.38, x: -5.69, z: 3.02, radius: 0.02, rot: 0, name: 'Main Thruster' },
    { height: 0.24, width: 0.38, x: -5.69, z: 3.98, radius: 0.02, rot: 0, name: 'Starboard Thrusters' },
    { height: 0.24, width: 0.37, x: 5.50, z: 3.00, radius: 0.02, rot: 0, name: 'Sensors' },
    { height: 3.02, width: 0.20, x: -4.04, z: 2.98, radius: 0.099, rot: 0, name: 'Artificial Gravity Rings' },
    { height: 1.28, width: 0.16, x: 1.53, z: 2.98, radius: 0.07, rot: -0.02, name: 'Shield Emitters' }
];

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
    private dialogueText: FadableText = {
        counter: 1,
        font: null,
        geometry: null,
        headerParams: null,
        holdCount: -1, // Hold until replaced
        isFadeIn: true,
        isHolding: false,
        material: null,
        mesh: null,
        sentence: dialogues['']
    };

    /**
     * Color for boxes user is hovering over.
     */
    private highlightedColor = 0x00FF00;

    /**
     * Mesh for box user has hovered over.
     */
    private hoveredBox: Mesh = null;

    /**
     * Text for hovered room at bottom of screen.
     */
    private hoverText: FadableText = {
        counter: 1,
        font: null,
        geometry: null,
        headerParams: null,
        holdCount: -1, // Hold until replaced
        isFadeIn: true,
        isHolding: false,
        material: null,
        mesh: null,
        sentence: ''
    };

    /**
     * Meshes for all the boxes user can interact with.
     */
    private meshMap: { [key: string]: Mesh } = {};

    /**
     * Reference to the scene, used to remove ship from rendering cycle once destroyed.
     */
    private scene: Scene;

    /**
     * Mesh for box user has selected.
     */
    private selectedBox: Mesh = null;

    /**
     * Color for boxes user has clicked.
     */
    private selectedColor = 0xF1149A;

    /**
     * Text for selected room at top left of screen.
     */
    private selectionText: FadableText = {
        counter: 1,
        font: null,
        geometry: null,
        headerParams: null,
        holdCount: -1, // Hold until replaced
        isFadeIn: true,
        isHolding: false,
        material: null,
        mesh: null,
        sentence: ''
    };

    /**
     * Stars in background.
     */
    private stars: Mesh[] = [];

    /**
     * Color for boxes user is not hovering over (default).
     */
    private unhighlightedColor = 0x87D3F8;

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
        dialogueTexture: Texture,
        introFont: Font) {
        this.scene = scene.scene;

        this.dialogueText.headerParams = {
            font: introFont,
            size: 0.125,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };

        this.hoverText.headerParams = {
            font: introFont,
            size: 0.199,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelSegments: 3
        };

        this.selectionText.headerParams = {
            font: introFont,
            size: 0.159,
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
        const shipInterior = createShipInteriorFrame(shipIntTexture);
        this.actors.push(shipInterior);
        this.scene.add(shipInterior.mesh);
        const profile = createProfile(dialogueTexture);
        this.actors.push(profile);
        this.scene.add(profile.mesh);

        rectangleBoxes.forEach(box => {
            const material = new MeshBasicMaterial({
                color: this.unhighlightedColor,
                opacity: 0.5,
                transparent: true,
                side: DoubleSide
            });
            const geometry = createBoxWithRoundedEdges(box.width, box.height, box.radius, 0);
            const barrier = new Mesh( geometry, material );
            barrier.name = box.name;
            barrier.position.set(box.x, 15, box.z);
            barrier.rotation.set(1.5708, 0, box.rot);
            this.scene.add(barrier);
            this.meshMap[box.name] = barrier;
        });

        let material = new MeshBasicMaterial({
            color: this.unhighlightedColor,
            opacity: 0.5,
            transparent: true,
            side: DoubleSide
        });
        let geometry: CircleGeometry = new CircleGeometry(1.56, 48, 48);
        const circleBarrier = new Mesh( geometry, material );
        circleBarrier.name = 'Deuterium Tank';
        circleBarrier.position.set(3.42, 15, 2.94);
        circleBarrier.rotation.set(1.5708, 0, 0);
        this.scene.add(circleBarrier);
        this.meshMap[circleBarrier.name] = circleBarrier;

        const intersectableThings = [...rectangleBoxes, circleBarrier];

        const textBoxes = [
            { widthIn: 6, widthOut: 6.2, x: 2.9, z: -4.45, name: 'Profile Dialogue' },
            { widthIn: 5.5, widthOut: 5.7, x: -3.15, z: -4.45, name: 'Selection' },
        ];

        textBoxes.forEach(box => {
            let material = new MeshBasicMaterial({
                color: 0xFFFFFF,
                opacity: 0.6,
                transparent: true,
                side: DoubleSide
            });
            let geometry = new PlaneGeometry( box.widthOut, 3.2, 10, 10 );
            let barrier = new Mesh( geometry, material );
            barrier.name = `${box.name} Outter Box`;
            barrier.position.set(box.x, 15, box.z);
            barrier.rotation.set(1.5708, 0, 0);
            this.scene.add(barrier);

            material = new MeshBasicMaterial({
                color: 0x000000,
                opacity: 1,
                transparent: true,
                side: DoubleSide
            });
            geometry = new PlaneGeometry( box.widthIn, 3, 10, 10 );
            barrier = new Mesh( geometry, material );
            barrier.name = `${box.name} Inner Box`;
            barrier.position.set(box.x, 10, box.z);
            barrier.rotation.set(1.5708, 0, 0);
            this.scene.add(barrier);
        });

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
                    this.selectedBox = this.meshMap[hit.name];
                    (this.meshMap[hit.name].material as any).color.set(this.selectedColor);
                    SoundinatorSingleton.playClick();
                    this.selectionText.sentence = hit.name;
                    this.selectionText.isFadeIn = true;
                    this.selectionText.isHolding = false;
                    this.selectionText.counter = 1;
                    this.makeSelectionText();

                    this.dialogueText.sentence = dialogues[hit.name];
                    this.dialogueText.isFadeIn = true;
                    this.dialogueText.isHolding = false;
                    this.dialogueText.counter = 1;
                    this.makeDialogueText();
                    return;
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
                    if (!this.selectedBox || this.selectedBox.name !== hit.name) {
                        isHovering = true;
                        this.hoveredBox = this.meshMap[el.object.name];
                        (this.meshMap[el.object.name].material as any).color.set(this.highlightedColor);
                    } else if (this.selectedBox && this.selectedBox.name === hit.name) {
                        isHovering = true;
                    }

                    if (hit.name !== hoverName && hit.name !== selectedName) {
                        this.hoverText.sentence = hit.name;
                        this.hoverText.isFadeIn = true;
                        this.hoverText.isHolding = false;
                        this.hoverText.counter = 1;
                        this.makeHoverText();
                    }
                    return;
                }
            });
            if (!isHovering) {
                this.hoveredBox = null;
                this.hoverText.sentence = '';
                this.hoverText.isFadeIn = true;
                this.hoverText.isHolding = false;
                this.hoverText.counter = 1;
                this.makeHoverText();
            }
            this.clearMeshMap();
        };
    }

    private clearMeshMap(): void {
        const selectedName = this.selectedBox && this.selectedBox.name;
        const hoveredName = this.hoveredBox && this.hoveredBox.name;
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
        if (this.dialogueText.mesh) {
            this.scene.remove(this.dialogueText.mesh);
        }
        if (this.dialogueText.isFadeIn && this.dialogueText.counter > 20) {
            this.dialogueText.isFadeIn = false;
            this.dialogueText.isHolding = true;
            this.dialogueText.counter = 1;
        } else if (this.dialogueText.isHolding) {
            this.dialogueText.isFadeIn = false;
            this.dialogueText.isHolding = true;
            this.dialogueText.counter = 1;
        }

        if (this.dialogueText.isFadeIn) {
            this.dialogueText.material = new MeshLambertMaterial({
                color: 0xFFD700,
                opacity: this.dialogueText.counter / 20,
                transparent: true
            });
            this.dialogueText.counter++;
        } else if (this.dialogueText.isHolding) {
            // Do nothing
        } else {
            return;
        }

        this.dialogueText.geometry = new TextGeometry(
            this.dialogueText.sentence,
            this.dialogueText.headerParams);
        this.dialogueText.mesh = new Mesh(
            this.dialogueText.geometry,
            this.dialogueText.material);
        this.dialogueText.mesh.position.set(0, -11.4, -5.7);
        this.dialogueText.mesh.rotation.x = -1.5708;
        this.scene.add(this.dialogueText.mesh);
    }

    /**
     * Builds the text and graphics for the text dialogue at bottom of screen.
     */
    private makeHoverText(): void {
        const name = this.selectedBox && this.selectedBox.name;
        const color = name === this.hoverText.sentence ? this.selectedColor : 0x00B39F
        if (this.hoverText.mesh) {
            this.scene.remove(this.hoverText.mesh);
        }
        if (this.hoverText.isFadeIn && this.hoverText.counter > 20) {
            this.hoverText.isFadeIn = false;
            this.hoverText.isHolding = true;
            this.hoverText.counter = 1;
        } else if (this.hoverText.isHolding) {
            this.hoverText.isFadeIn = false;
            this.hoverText.isHolding = true;
            this.hoverText.counter = 1;
        }

        if (this.hoverText.isFadeIn) {
            this.hoverText.material = new MeshLambertMaterial({
                color,
                opacity: this.hoverText.counter / 20,
                transparent: true
            });
            this.hoverText.counter++;
        } else if (this.hoverText.isHolding) {
            // Do nothing
        } else {
            return;
        }

        this.hoverText.geometry = new TextGeometry(
            this.hoverText.sentence,
            this.hoverText.headerParams);
        this.hoverText.material.color.set(color);
        this.hoverText.mesh = new Mesh(
            this.hoverText.geometry,
            this.hoverText.material);
        this.hoverText.mesh.position.set(-5.65, -11.4, 5.5);
        this.hoverText.mesh.rotation.x = -1.5708;
        this.scene.add(this.hoverText.mesh);
    }

    /**
     * Builds the text and graphics for the text dialogue at top left of screen.
     */
    private makeSelectionText(): void {
        if (this.selectionText.mesh) {
            this.scene.remove(this.selectionText.mesh);
        }
        if (this.selectionText.isFadeIn && this.selectionText.counter > 20) {
            this.selectionText.isFadeIn = false;
            this.selectionText.isHolding = true;
            this.selectionText.counter = 1;
        } else if (this.selectionText.isHolding) {
            this.selectionText.isFadeIn = false;
            this.selectionText.isHolding = true;
            this.selectionText.counter = 1;
        }

        if (this.selectionText.isFadeIn) {
            this.selectionText.material = new MeshLambertMaterial({
                color: this.selectedColor,
                opacity: this.selectionText.counter / 20,
                transparent: true
            });
            this.selectionText.counter++;
        } else if (this.selectionText.isHolding) {
            // Do nothing
        } else {
            return;
        }

        this.selectionText.geometry = new TextGeometry(
            this.selectionText.sentence,
            this.selectionText.headerParams);
        this.selectionText.mesh = new Mesh(
            this.selectionText.geometry,
            this.selectionText.material);
        this.selectionText.mesh.position.set(-5.65, -11.4, -5.5);
        this.selectionText.mesh.rotation.x = -1.5708;
        this.scene.add(this.selectionText.mesh);
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
        this.makeSelectionText();
        return true;
    }
}
import {
    Face3,
    Geometry,
    Mesh,
    MeshBasicMaterial,
    Scene,
    Triangle,
    Vector3, 
    Euler} from 'three';
    
import { SOUNDS_CTRL } from '../../../controls/controllers/sounds-controller';

const ORANGE: string = '#FF6800';
const RED: string = '#FF0000';
const YELLOW: string = '#FFFE00';
/**
 * @class
 * Creates and updates main thrusters.
 */
export class DirectionalThruster {
    /**
     * Controls the overall rendering of the various flames.
     */

    private _flames: Mesh[] = [];

    /**
     * Flag to track which of the two thrusters to show.
     */
    private _isUsingLeftThrusters: boolean = true;

    /**
     * Reference to the scene, used to and and remove flames from rendering cycle once finished.
     */
    private _scene: Scene;

    /**
     * Blue color in the main thruster's flame.
     */
    private _orangeFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: ORANGE,
        opacity: 0.5,
        transparent: true
    });

    /**
     * White color in the main thruster's flame.
     */
    private _redFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: RED,
        opacity: 0.2,
        transparent: true
    });

    /**
     * Yellow color in the main thruster's flame.
     */
    private _yellowFlameMaterial: MeshBasicMaterial = new MeshBasicMaterial({
        color: YELLOW,
        opacity: 0.8,
        transparent: true
    });

    /**
     * Constructor for the Thruster class
     * @param scene graphic rendering scene object. Used each iteration to redraw things contained in scene.
     * @param position x, y, z coordinate for base of flames.
     * @hidden
     */
    constructor(scene: Scene, position: [number, number, number], useLeftThrusters: boolean) {
        this._scene = scene;
        this._createFlames(position);
        this._isUsingLeftThrusters = useLeftThrusters;
    }

    /**
     * Instantiates the flames of the thruster.
     * @param position x, y, z coordinate for base of flames.
     */
    private _createFlames(position: [number, number, number]): void {
        // left facing thrusters
        const leftGeo = new Geometry();
        const leftV1 = new Vector3(0.75, 0, 0.36);
        const leftV2 = new Vector3(0.05, 0, 0);
        const leftV3 = new Vector3(0.75, 0, -0.36);

        const leftTri = new Triangle( leftV1, leftV2, leftV3 );
        const leftNormal = leftTri.getNormal(new Vector3(1, 1, 1));

        // add new geometry based on the specified positions
        leftGeo.vertices.push(leftTri.a);
        leftGeo.vertices.push(leftTri.b);
        leftGeo.vertices.push(leftTri.c);
        leftGeo.faces.push(new Face3(0, 2, 1, leftNormal));

        const leftMeshYellow = new Mesh(leftGeo, this._yellowFlameMaterial);
        leftMeshYellow.position.set(position[0], position[1], position[2]);
        this._flames.push(leftMeshYellow);
        this._scene.add(leftMeshYellow);
        leftMeshYellow.visible = false;

        const leftMeshOrange = new Mesh(leftGeo, this._orangeFlameMaterial);
        leftMeshOrange.position.set(position[0], position[1], position[2]);
        this._flames.push(leftMeshOrange);
        this._scene.add(leftMeshOrange);
        leftMeshOrange.visible = false;

        const leftMeshRed = new Mesh(leftGeo, this._redFlameMaterial);
        leftMeshRed.position.set(position[0], position[1], position[2]);
        this._flames.push(leftMeshRed);
        this._scene.add(leftMeshRed);
        leftMeshRed.visible = false;
        
        const rightGeo = new Geometry();
        const rightV1 = new Vector3(-0.75, 0, -0.36);
        const rightV2 = new Vector3(0.05, 0, 0);
        const rightV3 = new Vector3(-0.75, 0, 0.36);

        const rightTri = new Triangle( rightV1, rightV2, rightV3 );
        const rightNormal = rightTri.getNormal(new Vector3(1, 1, 1));

        // add new geometry based on the specified positions
        rightGeo.vertices.push(rightTri.a);
        rightGeo.vertices.push(rightTri.b);
        rightGeo.vertices.push(rightTri.c);
        rightGeo.faces.push(new Face3(0, 2, 1, rightNormal));

        const rightMeshYellow = new Mesh(rightGeo, this._yellowFlameMaterial);
        rightMeshYellow.position.set(position[0] + 2.8, position[1], position[2]);
        this._flames.push(rightMeshYellow);
        this._scene.add(rightMeshYellow);
        rightMeshYellow.visible = false;

        const rightMeshOrange = new Mesh(rightGeo, this._orangeFlameMaterial);
        rightMeshOrange.position.set(position[0] + 2.8, position[1], position[2]);
        this._flames.push(rightMeshOrange);
        this._scene.add(rightMeshOrange);
        rightMeshOrange.visible = false;

        const rightMeshRed = new Mesh(rightGeo, this._redFlameMaterial);
        rightMeshRed.position.set(position[0] + 2.8, position[1], position[2]);
        this._flames.push(rightMeshRed);
        this._scene.add(rightMeshRed);
        rightMeshRed.visible = false;
    }

    public dispose(): void {
        this._flames.forEach(flame => flame && this._scene.remove(flame));
        this._flames.length = 0;
    }

    /**
     * At the end of each loop iteration, rotate each flame color's opacity a little.
     * @returns boolean that means very little neither true or false will have any meaning.
     */
    public endCycle(position: [number, number, number], isBurning?: boolean): void {
        console.log('endCycle', this._isUsingLeftThrusters ? 0 : 3, this._isUsingLeftThrusters ? 3 : 6);
        const flames = this._flames.slice(this._isUsingLeftThrusters ? 0 : 3, this._isUsingLeftThrusters ? 3 : 6);
        if (isBurning) {
            if (!flames[0].visible) {
                flames.forEach(flame => {
                    flame.visible = true;
                    flame.updateMatrix();
                    SOUNDS_CTRL.playMainThrusterSmall();
                });
            }
            flames.forEach(flame => {
                const currOpacity = (flame.material as MeshBasicMaterial).opacity;
                if (currOpacity <= 0.1) {
                    (flame.material as MeshBasicMaterial).opacity = 0.8;
                } else {
                    (flame.material as MeshBasicMaterial).opacity = currOpacity - 0.05;
                }
            });
        } else {
            if (flames[0].visible) {
                flames.forEach(flame => {
                    flame.visible = false;
                    flame.updateMatrix();
                    SOUNDS_CTRL.stopMainThrusterSmall();
                });
            }
        }
        // For the thrusters not being used
        const offFlames = this._flames.slice(this._isUsingLeftThrusters ? 3 : 0, this._isUsingLeftThrusters ? 6 : 3);
        if (offFlames[0].visible) {
            offFlames.forEach(flame => {
                flame.visible = false;
                flame.updateMatrix();
                SOUNDS_CTRL.stopMainThrusterSmall();
            });
        }
        this._flames.slice(0, 3).forEach(flame => flame.position.set(position[0], position[1], position[2]));
        this._flames.slice(3, 6).forEach(flame => flame.position.set(position[0] + 2.8, position[1], position[2]));
    }

    public switch() {
        this._isUsingLeftThrusters = !this._isUsingLeftThrusters;
    }
}
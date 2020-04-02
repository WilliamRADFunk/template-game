import {
    CircleGeometry,
    Mesh,
    MeshPhongMaterial,
    PlaneGeometry,
    Texture,
    Object3D} from "three";
import { createActor } from "../../../utils/create-actor";
import { Actor } from "../../../models/actor";

/**
 * Creates the rectangle image of the lander.
 * @param astronautTextures         textures for the astronaut images.
 * @param miningEquipmentTextures   textures for the mining equipment images.
 */
export function createMiningTeam(astronautTextures: { [key: string]: Texture }, miningEquipmentTextures: { [key: string]: Texture }): Actor[] {
    const astronautGeometry = new PlaneGeometry( 0.15, 0.15, 10, 10 );
    const astronautMaterialStanding = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronautTextures.astronaut1,
        shininess: 0,
        transparent: true
    });
    const astronautMaterialWalking1 = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronautTextures.astronaut2,
        shininess: 0,
        transparent: true
    });
    const astronautMaterialWalking2 = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronautTextures.astronaut3,
        shininess: 0,
        transparent: true
    });

    const astronautLeft1 = createActor();
    astronautLeft1.originalStartingPoint = [-4, -4];
    astronautLeft1.currentPoint = [-4, -4];
    astronautLeft1.endingPoint = [-4, -4];
    astronautLeft1.mesh = new Mesh(astronautGeometry, astronautMaterialStanding);
    astronautLeft1.mesh.position.set(astronautLeft1.currentPoint[0], 1, astronautLeft1.currentPoint[1] + 0.02);
    astronautLeft1.mesh.rotation.set(-1.5708, 0, 0);
    astronautLeft1.mesh.name = 'Astronaut-Left-1';
    const astronautLeft2 = createActor();
    astronautLeft2.originalStartingPoint = [-4, -4];
    astronautLeft2.currentPoint = [-4, -4];
    astronautLeft2.endingPoint = [-4, -4];
    astronautLeft2.mesh = new Mesh(astronautGeometry, astronautMaterialWalking1);
    astronautLeft2.mesh.position.set(astronautLeft2.currentPoint[0], 1, astronautLeft2.currentPoint[1] + 0.02);
    astronautLeft2.mesh.rotation.set(-1.5708, 0, 0);
    astronautLeft2.mesh.name = 'Astronaut-Left-2';
    const astronautLeft3 = createActor();
    astronautLeft3.originalStartingPoint = [-4, -4];
    astronautLeft3.currentPoint = [-4, -4];
    astronautLeft3.endingPoint = [-4, -4];
    astronautLeft3.mesh = new Mesh(astronautGeometry, astronautMaterialWalking2);
    astronautLeft3.mesh.position.set(astronautLeft3.currentPoint[0], 1, astronautLeft3.currentPoint[1] + 0.03);
    astronautLeft3.mesh.rotation.set(-1.5708, 0, 0);
    astronautLeft3.mesh.name = 'Astronaut-Left-3';

    const astronautRight1 = createActor();
    astronautRight1.originalStartingPoint = [-4, -4];
    astronautRight1.currentPoint = [-4, -4];
    astronautRight1.endingPoint = [-4, -4];
    astronautRight1.mesh = new Mesh(astronautGeometry, astronautMaterialStanding);
    astronautRight1.mesh.position.set(astronautRight1.currentPoint[0], 1, astronautRight1.currentPoint[1] + 0.02);
    astronautRight1.mesh.rotation.set(-1.5708, 0, 0);
    astronautRight1.mesh.name = 'Astronaut-Right-1';
    const astronautRight2 = createActor();
    astronautRight2.originalStartingPoint = [-4, -4];
    astronautRight2.currentPoint = [-4, -4];
    astronautRight2.endingPoint = [-4, -4];
    astronautRight2.mesh = new Mesh(astronautGeometry, astronautMaterialWalking1);
    astronautRight2.mesh.position.set(astronautRight2.currentPoint[0], 1, astronautRight2.currentPoint[1] + 0.02);
    astronautRight2.mesh.rotation.set(-1.5708, 0, 0);
    astronautRight2.mesh.name = 'Astronaut-Right-2';
    const astronautRight3 = createActor();
    astronautRight3.originalStartingPoint = [-4, -4];
    astronautRight3.currentPoint = [-4, -4];
    astronautRight3.endingPoint = [-4, -4];
    astronautRight3.mesh = new Mesh(astronautGeometry, astronautMaterialWalking2);
    astronautRight3.mesh.position.set(astronautRight3.currentPoint[0], 1, astronautRight3.currentPoint[1] + 0.03);
    astronautRight3.mesh.rotation.set(-1.5708, 0, 0);
    astronautRight3.mesh.name = 'Astronaut-Right-3';

    const miningEquipment = createActor();
    miningEquipment.originalStartingPoint = [-4, -4];
    miningEquipment.currentPoint = [-4, -4];
    miningEquipment.endingPoint = [-4, -4];

    const mwGeo = new CircleGeometry( 0.075, 10, 10 );
    const mwMat = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: miningEquipmentTextures.miningEquipment1,
        shininess: 0,
        transparent: true
    });
    const mwMesh = new Mesh(mwGeo, mwMat);
    mwMesh.position.set(0, -1, -0.1);
    mwMesh.rotation.set(-1.5708, 0, 0);
    mwMesh.name = 'Mining-Wheel';

    const mbGeo = new PlaneGeometry( 0.15, 0.15, 10, 10 );
    const mbMat = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: miningEquipmentTextures.miningEquipment2,
        shininess: 0,
        transparent: true
    });
    const mbMesh = new Mesh(mbGeo, mbMat);
    mbMesh.position.set(0, 1, -0.02);
    mbMesh.rotation.set(-1.5708, 0, 0);
    mbMesh.name = 'Mining-Base';

    const allEquip = new Object3D();
    allEquip.add(mwMesh);
    allEquip.add(mbMesh);
    miningEquipment.mesh = allEquip;
    miningEquipment.mesh.position.set(miningEquipment.currentPoint[0], 1, miningEquipment.currentPoint[1]);

    return [astronautLeft1, miningEquipment, astronautRight1, astronautLeft2, null, astronautRight2, astronautLeft3, null, astronautRight3];
}
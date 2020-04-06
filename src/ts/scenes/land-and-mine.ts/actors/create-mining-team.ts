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


    const astronautMaterialSuffocation1 = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronautTextures.astronautSuffocation1,
        shininess: 0,
        transparent: true
    });
    const astronautMaterialSuffocation2 = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronautTextures.astronautSuffocation2,
        shininess: 0,
        transparent: true
    });
    const astronautMaterialSuffocation3 = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronautTextures.astronautSuffocation3,
        shininess: 0,
        transparent: true
    });
    const astronautMaterialSuffocation4 = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronautTextures.astronautSuffocation4,
        shininess: 0,
        transparent: true
    });
    const astronautMaterialSuffocation5 = new MeshPhongMaterial({
        color: '#FFFFFF',
        map: astronautTextures.astronautSuffocation5,
        shininess: 0,
        transparent: true
    });

    const astronautSuffocation1 = createActor();
    astronautSuffocation1.originalStartingPoint = [-4, -4];
    astronautSuffocation1.currentPoint = [-4, -4];
    astronautSuffocation1.endingPoint = [-4, -4];
    astronautSuffocation1.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation1);
    astronautSuffocation1.mesh.position.set(astronautSuffocation1.currentPoint[0], 1, astronautSuffocation1.currentPoint[1] + 0.03);
    astronautSuffocation1.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocation1.mesh.name = 'Astronaut-Suffocation-1';

    const astronautSuffocation2 = createActor();
    astronautSuffocation2.originalStartingPoint = [-4, -4];
    astronautSuffocation2.currentPoint = [-4, -4];
    astronautSuffocation2.endingPoint = [-4, -4];
    astronautSuffocation2.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation2);
    astronautSuffocation2.mesh.position.set(astronautSuffocation2.currentPoint[0], 1, astronautSuffocation2.currentPoint[1] + 0.03);
    astronautSuffocation2.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocation2.mesh.name = 'Astronaut-Suffocation-2';

    const astronautSuffocation3 = createActor();
    astronautSuffocation3.originalStartingPoint = [-4, -4];
    astronautSuffocation3.currentPoint = [-4, -4];
    astronautSuffocation3.endingPoint = [-4, -4];
    astronautSuffocation3.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation3);
    astronautSuffocation3.mesh.position.set(astronautSuffocation3.currentPoint[0], 1, astronautSuffocation3.currentPoint[1] + 0.03);
    astronautSuffocation3.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocation3.mesh.name = 'Astronaut-Suffocation-3';

    const astronautSuffocation4 = createActor();
    astronautSuffocation4.originalStartingPoint = [-4, -4];
    astronautSuffocation4.currentPoint = [-4, -4];
    astronautSuffocation4.endingPoint = [-4, -4];
    astronautSuffocation4.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation4);
    astronautSuffocation4.mesh.position.set(astronautSuffocation4.currentPoint[0], 1, astronautSuffocation4.currentPoint[1] + 0.03);
    astronautSuffocation4.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocation4.mesh.name = 'Astronaut-Suffocation-4';

    const astronautSuffocation5 = createActor();
    astronautSuffocation5.originalStartingPoint = [-4, -4];
    astronautSuffocation5.currentPoint = [-4, -4];
    astronautSuffocation5.endingPoint = [-4, -4];
    astronautSuffocation5.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation5);
    astronautSuffocation5.mesh.position.set(astronautSuffocation5.currentPoint[0], 1, astronautSuffocation5.currentPoint[1] + 0.03);
    astronautSuffocation5.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocation5.mesh.name = 'Astronaut-Suffocation-5';
    return [
        astronautLeft1, // 0
        miningEquipment, // 1
        astronautRight1, // 2
        astronautLeft2, // 3
        null, // 4
        astronautRight2, // 5
        astronautLeft3, // 6
        null, // 7
        astronautRight3, // 8
        astronautSuffocation1, // 9
        astronautSuffocation2, // 10
        astronautSuffocation3, // 11
        astronautSuffocation4, // 12
        astronautSuffocation5]; // 13
}
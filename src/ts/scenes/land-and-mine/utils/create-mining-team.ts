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

    const astronautSuffocationLeft1 = createActor();
    astronautSuffocationLeft1.originalStartingPoint = [-4, -4];
    astronautSuffocationLeft1.currentPoint = [-4, -4];
    astronautSuffocationLeft1.endingPoint = [-4, -4];
    astronautSuffocationLeft1.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation1);
    astronautSuffocationLeft1.mesh.position.set(astronautSuffocationLeft1.currentPoint[0], 1, astronautSuffocationLeft1.currentPoint[1] + 0.03);
    astronautSuffocationLeft1.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationLeft1.mesh.name = 'Astronaut-Suffocation-Left-1';

    const astronautSuffocationLeft2 = createActor();
    astronautSuffocationLeft2.originalStartingPoint = [-4, -4];
    astronautSuffocationLeft2.currentPoint = [-4, -4];
    astronautSuffocationLeft2.endingPoint = [-4, -4];
    astronautSuffocationLeft2.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation2);
    astronautSuffocationLeft2.mesh.position.set(astronautSuffocationLeft2.currentPoint[0], 1, astronautSuffocationLeft2.currentPoint[1] + 0.03);
    astronautSuffocationLeft2.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationLeft2.mesh.name = 'Astronaut-Suffocation-Left-2';

    const astronautSuffocationLeft3 = createActor();
    astronautSuffocationLeft3.originalStartingPoint = [-4, -4];
    astronautSuffocationLeft3.currentPoint = [-4, -4];
    astronautSuffocationLeft3.endingPoint = [-4, -4];
    astronautSuffocationLeft3.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation3);
    astronautSuffocationLeft3.mesh.position.set(astronautSuffocationLeft3.currentPoint[0], 1, astronautSuffocationLeft3.currentPoint[1] + 0.03);
    astronautSuffocationLeft3.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationLeft3.mesh.name = 'Astronaut-Suffocation-Left-3';

    const astronautSuffocationLeft4 = createActor();
    astronautSuffocationLeft4.originalStartingPoint = [-4, -4];
    astronautSuffocationLeft4.currentPoint = [-4, -4];
    astronautSuffocationLeft4.endingPoint = [-4, -4];
    astronautSuffocationLeft4.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation4);
    astronautSuffocationLeft4.mesh.position.set(astronautSuffocationLeft4.currentPoint[0], 1, astronautSuffocationLeft4.currentPoint[1] + 0.03);
    astronautSuffocationLeft4.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationLeft4.mesh.name = 'Astronaut-Suffocation-Left-4';

    const astronautSuffocationLeft5 = createActor();
    astronautSuffocationLeft5.originalStartingPoint = [-4, -4];
    astronautSuffocationLeft5.currentPoint = [-4, -4];
    astronautSuffocationLeft5.endingPoint = [-4, -4];
    astronautSuffocationLeft5.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation5);
    astronautSuffocationLeft5.mesh.position.set(astronautSuffocationLeft5.currentPoint[0], 1, astronautSuffocationLeft5.currentPoint[1] + 0.03);
    astronautSuffocationLeft5.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationLeft5.mesh.name = 'Astronaut-Suffocation-Left-5';

    const astronautSuffocationRight1 = createActor();
    astronautSuffocationRight1.originalStartingPoint = [-4, -4];
    astronautSuffocationRight1.currentPoint = [-4, -4];
    astronautSuffocationRight1.endingPoint = [-4, -4];
    astronautSuffocationRight1.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation1);
    astronautSuffocationRight1.mesh.position.set(astronautSuffocationRight1.currentPoint[0], 1, astronautSuffocationRight1.currentPoint[1] + 0.03);
    astronautSuffocationRight1.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationRight1.mesh.name = 'Astronaut-Suffocation-Right-1';

    const astronautSuffocationRight2 = createActor();
    astronautSuffocationRight2.originalStartingPoint = [-4, -4];
    astronautSuffocationRight2.currentPoint = [-4, -4];
    astronautSuffocationRight2.endingPoint = [-4, -4];
    astronautSuffocationRight2.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation2);
    astronautSuffocationRight2.mesh.position.set(astronautSuffocationRight2.currentPoint[0], 1, astronautSuffocationRight2.currentPoint[1] + 0.03);
    astronautSuffocationRight2.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationRight2.mesh.name = 'Astronaut-Suffocation-Right-2';

    const astronautSuffocationRight3 = createActor();
    astronautSuffocationRight3.originalStartingPoint = [-4, -4];
    astronautSuffocationRight3.currentPoint = [-4, -4];
    astronautSuffocationRight3.endingPoint = [-4, -4];
    astronautSuffocationRight3.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation3);
    astronautSuffocationRight3.mesh.position.set(astronautSuffocationRight3.currentPoint[0], 1, astronautSuffocationRight3.currentPoint[1] + 0.03);
    astronautSuffocationRight3.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationRight3.mesh.name = 'Astronaut-Suffocation-Right-3';

    const astronautSuffocationRight4 = createActor();
    astronautSuffocationRight4.originalStartingPoint = [-4, -4];
    astronautSuffocationRight4.currentPoint = [-4, -4];
    astronautSuffocationRight4.endingPoint = [-4, -4];
    astronautSuffocationRight4.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation4);
    astronautSuffocationRight4.mesh.position.set(astronautSuffocationRight4.currentPoint[0], 1, astronautSuffocationRight4.currentPoint[1] + 0.03);
    astronautSuffocationRight4.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationRight4.mesh.name = 'Astronaut-Suffocation-Right-4';

    const astronautSuffocationRight5 = createActor();
    astronautSuffocationRight5.originalStartingPoint = [-4, -4];
    astronautSuffocationRight5.currentPoint = [-4, -4];
    astronautSuffocationRight5.endingPoint = [-4, -4];
    astronautSuffocationRight5.mesh = new Mesh(astronautGeometry, astronautMaterialSuffocation5);
    astronautSuffocationRight5.mesh.position.set(astronautSuffocationRight5.currentPoint[0], 1, astronautSuffocationRight5.currentPoint[1] + 0.03);
    astronautSuffocationRight5.mesh.rotation.set(-1.5708, 0, 0);
    astronautSuffocationRight5.mesh.name = 'Astronaut-Suffocation-Right-5';
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
        astronautSuffocationLeft1, // 9
        astronautSuffocationLeft2, // 10
        astronautSuffocationLeft3, // 11
        astronautSuffocationLeft4, // 12
        astronautSuffocationLeft5, // 13
        astronautSuffocationRight1, // 14
        astronautSuffocationRight2, // 15
        astronautSuffocationRight3, // 16
        astronautSuffocationRight4, // 17
        astronautSuffocationRight5]; // 18
}
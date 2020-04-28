import {
    CircleGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    Object3D,
    PlaneGeometry,
    TextGeometry,
    TextGeometryParameters} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createSun(
    lbgGeo: PlaneGeometry,
    lbgMat: MeshPhongMaterial,
    lbGeo: PlaneGeometry,
    lbMat: MeshBasicMaterial,
    headerParams: TextGeometryParameters,
    zIndex: number): Actor {

    const labelBackGlow = new Mesh( lbgGeo, lbgMat );
    labelBackGlow.position.set(0, 0.1, -5);
    labelBackGlow.rotation.set(1.5708, 0, 0);

    const labelBack = new Mesh( lbGeo, lbMat );
    labelBack.position.set(0, 0, -5);
    labelBack.rotation.set(1.5708, 0, 0);

    const textMaterial = new MeshLambertMaterial( {color: 0x00B39F, opacity: 1, transparent: true} );
    const textGeometry = new TextGeometry('Sol System', headerParams);
    const textMesh = new Mesh( textGeometry, textMaterial );
    textMesh.position.set(-0.9, -0.5, -4.85);
    textMesh.rotation.x = -1.5708;

    const sun = createActor();
    sun.originalStartingPoint = [0, 0];
    sun.currentPoint = [0, 0];
    sun.endingPoint = [0, 0];
    const meshGroup = new Object3D();
    sun.geometry = new CircleGeometry(0.5, 48, 48);
    sun.material = new MeshBasicMaterial({ color: 0xF9D71C });
    sun.mesh = new Mesh(sun.geometry, sun.material);
    sun.mesh.position.set(sun.currentPoint[0], zIndex, sun.currentPoint[1]);
    sun.mesh.rotation.set(-1.5708, 0, 0);
    sun.mesh.name = 'Sun';
    meshGroup.add(sun.mesh);
    meshGroup.add(labelBackGlow);
    meshGroup.add(labelBack);
    meshGroup.add(textMesh);
    sun.mesh = meshGroup;
    sun.mesh.scale.set(0.0001, 0.0001, 0.0001);

    return sun;
}
import {
    CircleGeometry,
    LinearFilter,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    Object3D,
    PlaneGeometry,
    TextGeometry,
    TextGeometryParameters } from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";
import { ASSETS_CTRL } from "../../../controls/controllers/assets-controller";

export function createEarth(
    lbgGeo: PlaneGeometry,
    lbgMat: MeshPhongMaterial,
    lbGeo: PlaneGeometry,
    lbMat: MeshBasicMaterial,
    headerParams: TextGeometryParameters): Actor {
    const labelBackGlow = new Mesh( lbgGeo, lbgMat );
    labelBackGlow.position.set(0, 0.1, -5);
    labelBackGlow.rotation.set(1.5708, 0, 0);

    const labelBack = new Mesh( lbGeo, lbMat );
    labelBack.position.set(0, 0, -5);
    labelBack.rotation.set(1.5708, 0, 0);

    const textMaterial = new MeshLambertMaterial( {color: 0x00B39F, opacity: 1, transparent: true} );
    const textGeometry = new TextGeometry('Earth', headerParams);
    const textMesh = new Mesh( textGeometry, textMaterial );
    textMesh.position.set(-0.5, -0.5, -4.85);
    textMesh.rotation.x = -1.5708;

    const earth = createActor();
    earth.originalStartingPoint = [0, 0];
    earth.currentPoint = [0, 0];
    earth.endingPoint = [0, 0];
    const meshGroup = new Object3D();
    earth.geometry = new CircleGeometry(5, 48, 48);
    earth.material = new MeshPhongMaterial();
    earth.material.map = ASSETS_CTRL.textures.earth;
    earth.material.map.minFilter = LinearFilter;
    (earth.material as any).shininess = 0;
    earth.material.transparent = true;
    earth.mesh = new Mesh(earth.geometry, earth.material);
    earth.mesh.position.set(earth.currentPoint[0], 2, earth.currentPoint[1]);
    earth.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(earth.mesh);
    meshGroup.add(labelBackGlow);
    meshGroup.add(labelBack);
    meshGroup.add(textMesh);
    meshGroup.name = 'Earth';
    earth.mesh = meshGroup;

    return earth;
}
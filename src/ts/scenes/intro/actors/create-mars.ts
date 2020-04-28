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
    TextGeometryParameters,
    Texture } from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createMars(
    marsTexture: Texture,
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
    const textGeometry = new TextGeometry('Mars', headerParams);
    const textMesh = new Mesh( textGeometry, textMaterial );
    textMesh.position.set(-0.5, -0.5, -4.85);
    textMesh.rotation.x = -1.5708;

    const mars = createActor();
    mars.originalStartingPoint = [0, 0];
    mars.currentPoint = [0, 0];
    mars.endingPoint = [0, 0];
    const meshGroup = new Object3D();
    mars.geometry = new CircleGeometry(5, 48, 48);
    mars.material = new MeshPhongMaterial();
    mars.material.map = marsTexture;
    mars.material.map.minFilter = LinearFilter;
    (mars.material as any).shininess = 0;
    mars.material.transparent = true;
    mars.mesh = new Mesh(mars.geometry, mars.material);
    mars.mesh.position.set(mars.currentPoint[0], 2, mars.currentPoint[1]);
    mars.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(mars.mesh);
    meshGroup.add(labelBackGlow);
    meshGroup.add(labelBack);
    meshGroup.add(textMesh);
    mars.mesh = meshGroup;
    meshGroup.name = 'Mars';
    meshGroup.position.set(-50, 2, 0);

    return mars;
}
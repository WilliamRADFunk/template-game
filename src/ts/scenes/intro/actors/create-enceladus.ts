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

export function createEnceladus(
    enceladusTexture: Texture,
    lbgGeo: PlaneGeometry,
    lbgMat: MeshPhongMaterial,
    lbGeo: PlaneGeometry,
    lbMat: MeshBasicMaterial,
    headerParams: TextGeometryParameters): Actor {
        
    let labelBackGlow = new Mesh( lbgGeo, lbgMat );
    labelBackGlow.position.set(0, 0.1, -5);
    labelBackGlow.rotation.set(1.5708, 0, 0);

    let labelBack = new Mesh( lbGeo, lbMat );
    labelBack.position.set(0, 0, -5);
    labelBack.rotation.set(1.5708, 0, 0); 
    
    const textMaterial = new MeshLambertMaterial( {color: 0x00B39F, opacity: 1, transparent: true} );
    let textGeometry = new TextGeometry('Enceladus', headerParams);
    let textMesh = new Mesh( textGeometry, textMaterial );
    textMesh.position.set(-0.8, -0.5, -4.85);
    textMesh.rotation.x = -1.5708;

    const enceladus = createActor();
    enceladus.originalStartingPoint = [0, 0];
    enceladus.currentPoint = [0, 0];
    enceladus.endingPoint = [0, 0];
    const meshGroup = new Object3D();
    enceladus.geometry = new CircleGeometry(5, 48, 48);
    enceladus.material = new MeshPhongMaterial();
    enceladus.material.map = enceladusTexture;
    enceladus.material.map.minFilter = LinearFilter;
    (enceladus.material as any).shininess = 0;
    enceladus.material.transparent = true;
    enceladus.mesh = new Mesh(enceladus.geometry, enceladus.material);
    enceladus.mesh.position.set(enceladus.currentPoint[0], 2, enceladus.currentPoint[1]);
    enceladus.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(enceladus.mesh);
    meshGroup.add(labelBackGlow);
    meshGroup.add(labelBack);
    meshGroup.add(textMesh);
    enceladus.mesh = meshGroup;
    meshGroup.name = 'Enceladus';
    meshGroup.position.set(-50, 2, 0);

    return enceladus;
}
import {
    CircleGeometry,
    DoubleSide,
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

import { createActor } from "../../../utils/create-actor";

export function createGeminiStation(
    stationTexture: Texture,
    lbgGeo: PlaneGeometry,
    lbgMat: MeshPhongMaterial,
    lbGeo: PlaneGeometry,
    lbMat: MeshBasicMaterial,
    headerParams: TextGeometryParameters) {
    const labelBackGlow = new Mesh( lbgGeo, lbgMat );
    labelBackGlow.rotation.set(1.5708, 0, 0);

    const labelBack = new Mesh( lbGeo, lbMat );
    labelBack.rotation.set(1.5708, 0, 0); 

    const textGeometry = new TextGeometry('Gemini Station: The Rim', headerParams);
    const textMaterial = new MeshLambertMaterial( {color: 0x00B39F, opacity: 1, transparent: true} );
    const textMesh = new Mesh( textGeometry, textMaterial );
    textMesh.rotation.x = -1.5708;

    const station = createActor();
    station.originalStartingPoint = [0, 0];
    station.currentPoint = [0, 0];
    station.endingPoint = [0, 0];
    const xmeshGroup = new Object3D();
    station.material = new MeshBasicMaterial( {color: 0xFF0000, opacity: 1, transparent: false, side: DoubleSide} );
    station.geometry = new PlaneGeometry(4, 4, 1, 1);
    station.mesh = new Mesh( station.geometry, station.material );
    station.mesh.position.set(station.currentPoint[0], 1, station.currentPoint[1]);
    station.mesh.rotation.set(1.5708, 0, 0);
    xmeshGroup.add(station.mesh);
    labelBackGlow.position.set(station.currentPoint[0], 0.1, station.currentPoint[1] - 5);
    xmeshGroup.add(labelBackGlow);
    labelBack.position.set(station.currentPoint[0], 0, station.currentPoint[1] - 5);
    xmeshGroup.add(labelBack);
    textMesh.position.set(station.currentPoint[0] - 2.5, -0.5, station.currentPoint[1] - 4.85);
    xmeshGroup.add(textMesh);
    station.mesh = xmeshGroup;
    xmeshGroup.name = 'Station';
    xmeshGroup.position.set(-50, 2, 0);

    return station;
}
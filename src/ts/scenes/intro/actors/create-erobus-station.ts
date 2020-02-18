import {
    CircleGeometry,
    Color,
    DoubleSide,
    Font,
    Geometry,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    Object3D,
    PlaneGeometry,
    TextGeometry,
    Vector3} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createErobusStation(
    introFont: Font,
    lbgMat: MeshPhongMaterial,
    lbMat: MeshBasicMaterial,
    zIndex: number): Actor {
    const labelGeometry = new PlaneGeometry( 2, 0.4, 0, 0 );
    const labelGlowGeometry = new PlaneGeometry( 2.1, 0.5, 0, 0 );

    const labelBackGlow = new Mesh( labelGlowGeometry, lbgMat );
    labelBackGlow.position.set(-4.29, 0, 0);
    labelBackGlow.rotation.set(1.5708, 0, 0);

    const labelBack = new Mesh( labelGeometry, lbMat );
    labelBack.position.set(-4.29, -1, 0);
    labelBack.rotation.set(1.5708, 0, 0);

    const headerParams = {
        font: introFont,
        size: 0.125,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 1,
        bevelSize: 0.5,
        bevelSegments: 3
    }

    const textGeometry = new TextGeometry('Erebos Station', headerParams);
    const textMaterial = new MeshLambertMaterial( {color: 0x00B39F, opacity: 1, transparent: true} );
    const textMesh = new Mesh( textGeometry, textMaterial );
    textMesh.position.set(-3.45, -2, -0.1);
    textMesh.rotation.set(-1.5708, 0, -3.1416);
    // Planetoid
    const barrierStation = createActor();
    barrierStation.originalStartingPoint = [0, 0];
    barrierStation.currentPoint = [-2.99, 0];
    barrierStation.endingPoint = [0, 0];
    barrierStation.currentRotation = -3.1416;
    const meshGroup = new Object3D();
    barrierStation.geometry = new CircleGeometry(0.05, 48, 48);
    barrierStation.material = new MeshBasicMaterial({ color: 0x00FFFF });
    barrierStation.mesh = new Mesh(barrierStation.geometry, barrierStation.material);
    barrierStation.mesh.position.set(barrierStation.currentPoint[0], zIndex - 1, barrierStation.currentPoint[1]);
    barrierStation.mesh.rotation.set(-1.5708, 0, 0);
    meshGroup.add(barrierStation.mesh);
    meshGroup.name = 'Barrier Station';
    barrierStation.mesh = meshGroup;
    // White Orbital Ring
    const orbitGeometry = new CircleGeometry(3, 32, 32);
    const orbitMaterial = new MeshBasicMaterial({
        color: new Color(0xFFFFFF),
        opacity: 1,
        side: DoubleSide,
        transparent: true});
    const orbit = new Mesh(orbitGeometry, orbitMaterial);
    orbit.position.set(0, zIndex + 3, 0);
    orbit.rotation.set(-1.5708, 0, 0);
    meshGroup.add(orbit);
    // Inner Black Circle
    const blackGeometry = new CircleGeometry(2.98, 32, 32);
    const blackMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const black = new Mesh(blackGeometry, blackMaterial);
    black.position.set(0, zIndex + 2, 0);
    black.rotation.set(-1.5708, 0, 0);
    meshGroup.add(black);

    const redCircleGeometry = new CircleGeometry(0.1, 32, 32);
    const redCircleMaterial = new MeshBasicMaterial({
        color: new Color(0xFF0033),
        opacity: 1,
        side: DoubleSide,
        transparent: true});
    const redCircle = new Mesh(redCircleGeometry, redCircleMaterial);
    redCircle.position.set(barrierStation.currentPoint[0], zIndex + 1, barrierStation.currentPoint[1]);
    redCircle.rotation.set(-1.5708, 0, 0);
    meshGroup.add(redCircle);
    
    const redCircleInnerGeometry = new CircleGeometry(0.08, 32, 32);
    const redCircleInnerMaterial = new MeshBasicMaterial({
        color: new Color(0x000000),
        opacity: 1,
        side: DoubleSide,
        transparent: false});
    const redCircleInner = new Mesh(redCircleInnerGeometry, redCircleInnerMaterial);
    redCircleInner.position.set(barrierStation.currentPoint[0], zIndex, barrierStation.currentPoint[1]);
    redCircleInner.rotation.set(-1.5708, 0, 0);
    meshGroup.add(redCircleInner);

    const redCircleLineGeometry = new Geometry();
    redCircleLineGeometry.vertices.push(
        new Vector3(barrierStation.currentPoint[0], zIndex + 1, barrierStation.currentPoint[1]),
        new Vector3(barrierStation.currentPoint[0] - 0.25, zIndex + 1, barrierStation.currentPoint[1]));
    const redCircleLineMaterial = new LineBasicMaterial({color: 0xFF0033});
    const redCircleLineMesh = new Line(redCircleLineGeometry, redCircleLineMaterial);
    meshGroup.add(redCircleLineMesh);

    meshGroup.add(labelBackGlow);
    meshGroup.add(labelBack);
    meshGroup.add(textMesh);

    meshGroup.rotation.set(0, -3.1416, 0);
    meshGroup.scale.set(0.0001, 0.0001, 0.0001);

    return barrierStation;
}
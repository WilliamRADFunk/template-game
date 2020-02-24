import {
    Font,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    TextGeometry,
    TextGeometryParameters } from "three";

export interface DialogueText {
    counter: number;
    currentIndex: number;
    font: Font;
    geometry: TextGeometry;
    headerParams: TextGeometryParameters;
    isFinished: boolean;
    material: MeshBasicMaterial | MeshLambertMaterial;
    mesh: Mesh;
    sentence: string;
}
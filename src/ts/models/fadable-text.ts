import {
    Font,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    TextGeometry,
    TextGeometryParameters } from "three";

export interface FadableText {
    counter: number;
    font: Font;
    geometry: TextGeometry;
    headerParams: TextGeometryParameters;
    holdCount: number;
    isFadeIn: boolean;
    isHolding: boolean;
    material: MeshBasicMaterial | MeshLambertMaterial;
    mesh: Mesh;
    sentence: string;
}
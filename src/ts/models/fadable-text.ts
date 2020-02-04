import { Font, Mesh, MeshLambertMaterial, TextGeometry, TextGeometryParameters } from "three";

export interface FadableText {
    counter: number;
    font: Font;
    geometry: TextGeometry;
    headerParams: TextGeometryParameters;
    isFadeIn: boolean;
    isHolding: boolean;
    material: MeshLambertMaterial;
    mesh: Mesh;
    sentence: string;
}
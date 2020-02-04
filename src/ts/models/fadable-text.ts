import { Font, Mesh, MeshLambertMaterial, TextGeometryParameters } from "three";

export interface FadableText {
    counter: number;
    font: Font;
    headerParams: TextGeometryParameters;
    isFadeIn: boolean;
    isHolding: boolean;
    material: MeshLambertMaterial;
    mesh: Mesh;
    sentence: string;
}
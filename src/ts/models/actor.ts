import { CircleGeometry, Mesh, MeshPhongMaterial, MeshBasicMaterial, PlaneGeometry } from "three";

export interface Actor {
    currentPoint: number[];
    distanceTraveled: number;
    endingPoint: number[];
    geometry: CircleGeometry | PlaneGeometry;
    inMotion: boolean;
    material: MeshPhongMaterial | MeshBasicMaterial;
    mesh: Mesh;
    originalStartingPoint: number[];
    speed: number;
    totalDistance: number;
};
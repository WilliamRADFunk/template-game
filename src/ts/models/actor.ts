import { CircleGeometry, Mesh, MeshPhongMaterial, MeshBasicMaterial, PlaneGeometry } from "three";
import { ActorEvent } from "./actor-event";

export interface Actor {
    action?: ActorEvent;
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
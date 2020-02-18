import {
    CircleGeometry,
    Mesh,
    MeshPhongMaterial,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PlaneGeometry,
    Object3D,
    SphereGeometry } from "three";
import { ActorEvent } from "./actor-event";

export interface Actor {
    action?: ActorEvent;
    currentPoint: number[];
    currentRotation: number;
    distanceTraveled: number;
    endingPoint: number[];
    geometry: CircleGeometry | PlaneGeometry | SphereGeometry;
    inMotion: boolean;
    material: MeshPhongMaterial | MeshBasicMaterial | MeshStandardMaterial;
    mesh: Mesh|Object3D;
    originalStartingPoint: number[];
    moveSpeed: number;
    rotateSpeed: number;
    totalDistance: number;
};
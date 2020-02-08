import { Actor } from "../models/actor";

export function createActor(): Actor {
    return {
        currentPoint: [],
        currentRotation: 0,
        distanceTraveled: 0,
        endingPoint: [],
        geometry: null,
        inMotion: false,
        material: null,
        mesh: null,
        originalStartingPoint: [],
        moveSpeed: 0,
        rotateSpeed: 0,
        totalDistance: 0
    };
}
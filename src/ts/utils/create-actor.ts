import { Actor } from "../models/actor";

export function createActor(): Actor {
    return {
        currentPoint: [],
        distanceTraveled: 0,
        endingPoint: [],
        geometry: null,
        inMotion: false,
        material: null,
        mesh: null,
        originalStartingPoint: [],
        speed: 0.001,
        totalDistance: 0
    };
}
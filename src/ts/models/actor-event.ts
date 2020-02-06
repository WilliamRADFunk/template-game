export interface ActorEvent {
    actorIndex: number;
    duration?: number,
    endPoint: number[];
    speed: number;
    startingFrame: number;
    startPoint: number[];
    type: string;
}
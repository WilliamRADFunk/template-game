export interface ActorEvent {
    actorIndex: number;
    duration?: number,
    endPoint: number[];
    moveSpeed: number;
    rotateSpeed?: number;
    startingFrame: number;
    startPoint: number[];
    type: string;
}
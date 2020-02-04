export interface Sequence {
    actorEvents: { actorIndex: number; endPoint: number[]; speed: number; startingFrame: number; startPoint: number[]; }[];
    endingFrame: number;
    textEvents: { startingFrame: number; sentence: string; }[];
    startingFrame: number;
}
import { ActorEvent } from "./actor-event";
import { TextEvent } from "./text-event";

export interface Sequence {
    actorEvents: ActorEvent[];
    endingFrame: number;
    textEvents: TextEvent[];
    startingFrame: number;
}
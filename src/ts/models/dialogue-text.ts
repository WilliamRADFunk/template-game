import { Font } from "three";

export interface DialogueText {
    counter: number;
    currentIndex: number;
    element: HTMLElement;
    font: Font;
    isFinished: boolean;
    sentence: string;
}
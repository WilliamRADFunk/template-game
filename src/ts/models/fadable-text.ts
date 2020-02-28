export interface FadableText {
    counter: number;
    element: HTMLElement;
    holdCount: number;
    isFadeIn: boolean;
    isHolding: boolean;
    sentence: string;
}
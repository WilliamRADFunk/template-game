export const RandomPosOrNeg = function(): number {
    return (Math.random() < 0.5) ? -1 : 1;
}
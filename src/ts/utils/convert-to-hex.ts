export const ConvertToHex = function(c: number): number {
    if (c > 9) return (c + 55);
    return (c + 48);
};
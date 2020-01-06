/**
 * Converts the ascii character for a hexidecimal char to it's integer 0-15 equivalent.
 * @param c The ascii char code for the hexidecimal char.
 * @returns the numberical equivalent of the hexidecimal char 0-15
 */
export const ConvertToInt = function(c: number): number {
    if (c >= 65) return (c - 55);
    return (c - 48);
};
/**
 * Makes sure hex is a valid color string.
 * @param colorHex hex value of the color that needs verification.
 * @return TRUE is a color of valid brightness | FALSE is too dark.
 */
export const CheckColorBrighness = function(colorHex: string): boolean {
    if (!colorHex.match(/#{1}[A-Fa-f0-9]{6}/)) {
        return false;
    }
    const c = colorHex.substring(1);
    const rgb = parseInt(c, 16);

    const redBits = 16;
    const greenBits = 8;
    const mask = 0xff;
    const r = (rgb >> redBits) & mask;
    const g = (rgb >> greenBits) & mask;
    const b = (rgb >> 0) & mask;

    // per ITU-R BT.709
    const lumaRedMod = 0.2126;
    const lumaGreenMod = 0.7152;
    const lumaBlueMod = 0.0722;
    const luma = lumaRedMod * r + lumaGreenMod * g + lumaBlueMod * b;

    const minBrightness = 40;
    if (luma < minBrightness) {
        return false;
    } else {
        return true;
    }
}
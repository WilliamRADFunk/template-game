import { ButtonColors } from "../models/button-colors";
import { COLORS } from "./colors";

/**
 * Color scheme for all lifecycle events of a button.
 */
export const BUTTON_COLORS: ButtonColors = {
    default: {
        backgroundColor: COLORS.selected,
        color: COLORS.neutral,
        border: COLORS.neutral
    },
    onExit: {
        backgroundColor: COLORS.selected,
        color: COLORS.neutral,
        border: COLORS.neutral
    },
    onHover: {
        backgroundColor: COLORS.default,
        color: COLORS.neutral,
        border: COLORS.neutral
    },
    onMouseDown: {
        backgroundColor: COLORS.default,
        color: COLORS.selected,
        border: COLORS.selected
    },
    onMouseUp: {
        backgroundColor: COLORS.selected,
        color: COLORS.neutral,
        border: COLORS.neutral
    }
};
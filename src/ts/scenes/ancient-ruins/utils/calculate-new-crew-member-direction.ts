import { TeamMemberDirection } from "../../../models/ancient-ruins-specifications";

/**
 * Based on the difference in row and column of current crew member tile and their next, this finds new crew member direction.
 * @param horizontalDifference difference in row coordinates between crew member's current tile and the next.
 * @param verticalDifference difference in column coordinates between crew member's current tile and the next.
 * @returns the new direction the crew member should be facing.
 */
export function calculateNewCrewMemberDirection(horizontalDifference: number, verticalDifference: number): TeamMemberDirection {
    // vertical difference * 10 + horrizontal difference = unique number for each of 8 possible directions without all the if-elses.
    const dirCode = (verticalDifference * 10) + horizontalDifference;
    switch(dirCode) {
        case 10: {
            return TeamMemberDirection.Up;
        }
        case 11: {
            return TeamMemberDirection.Up_Right;
        }
        case 1: {
            return TeamMemberDirection.Right;
        }
        case -9: {
            return TeamMemberDirection.Down_Right;
        }
        case -10: {
            return TeamMemberDirection.Down;
        }
        case -11: {
            return TeamMemberDirection.Down_Left;
        }
        case -1: {
            return TeamMemberDirection.Left;
        }
        case 9: {
            return TeamMemberDirection.Up_Left;
        }
        default: {
            console.log('calculateNewCrewMemberDirection: Impossible dirrection key', dirCode, verticalDifference, horizontalDifference);
        }
    }
}
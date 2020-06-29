export enum RankAbbreviationsMap {
    ''      = 0,
    // Enlisted Ranks
    'SR'    = 1,
    'SA'    = 2,
    'SN'    = 3,
    'PO3'   = 4,
    'PO2'   = 5,
    'PO1'   = 6,
    'CPO'   = 7,
    'SCPO'  = 8,
    'MCPO'  = 9,
    // Officer Ranks
    'ENS'   = 10,
    'LTJR'  = 11,
    'LT'    = 12,
    'LTDR'  = 13,
    'CDR'   = 14,
    'CAPT'  = 15,
    'ADM'   = 16,
}

export const ENLISTED_RANK_START = 1;

export const OFFICER_RANK_START = 10;

export const OFFICER_RANK_END = 16;

/**
 * There should be only one captain of the enzmann: the player.
 * This helps prevent crew members promoting up to or above the player.
 */
export const MAX_OFFICER_RANK = 15;

export enum RankTitlesMap {
    ''                              = 0,
    // Enlisted Ranks
    'Spaceman Recruit'              = 1,
    'Spaceman Apprentice'           = 2,
    'Spaceman'                      = 3,
    'Petty Officer Third Class'     = 4,
    'Petty Officer Second Class'    = 5,
    'Petty Officer First Class'     = 6,
    'Chief Petty Officer'           = 7,
    'Senior Chief Petty Officer'    = 8,
    'Master Chief Petty Officer'    = 9,
    // Officer Ranks
    'Ensign'                        = 10,
    'Lieutenant Junior Grade'       = 11,
    'Lieutenant'                    = 12,
    'Lieutenant Commander'          = 13,
    'Commander'                     = 14,
    'Captain'                       = 15,
    'Admiral'                       = 16,
}
export enum GroundMaterial {
    'DIRT' = 'Dirt',
    'GRAVEL' = 'Gravel',
    'SAND' = 'Sand'
}

export enum GrassColor {
    'BROWN' = 'brown',
    'GREEN' = 'green',
    'PURPLE' = 'purple'
}

export enum RuinsBiome {
    'CEMETERY' = 0,
    'MONASTERY' = 1,
    'VILLAGE' = 2,
    'TOWN' = 3,
    'CITY' = 4,
    'MILITARY_BASE' = 5,
    'LIBRARY' = 6
}

export enum WaterBiome {
    'SMALL_LAKES' = 0,
    'LARGE_LAKE' = 1,
    'BEACH' = 2,
    'RIVER' = 3,
    'CREEK' = 4
}

export enum WaterColor {
    'BLUE' = 'blue',
    'GREEN' = 'green',
    'PURPLE' = 'purple'
}

export interface AncientRuinsSpecifications {
    biomeRuins: RuinsBiome,
    biomeWater: WaterBiome,
    groundMaterial: GroundMaterial,
    grassColor: GrassColor,
    grassPercentage: number,
    grassSpreadability: number,
    hasPlants: boolean,
    hasWater: boolean,
    waterColor: WaterColor,
    waterPercentage: number,
    waterSpreadability: number
}
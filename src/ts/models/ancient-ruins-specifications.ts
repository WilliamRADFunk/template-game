export enum GroundMaterial {
    'Dirt' = 1,
    'Gravel' = 2,
    'Sand' = 3
}

export enum PlantColor {
    'Brown' = 1,
    'Green' = 2,
    'Purple' = 3,
    'None' = 4
}

export enum RuinsBiome {
    'Monastery' = 1,
    'Village' = 2,
    'Town' = 3,
    'City' = 4,
    'Military_Base' = 5,
    'Library' = 6,
    'Cemetery' = 7
}

export enum WaterBiome {
    'Large_Lake' = 1,
    'Beach' = 2,
    'River' = 3,
    'Creek' = 4,
    'Small_Lakes' = 5
}

export enum WaterColor {
    'Blue' = 1,
    'Green' = 2,
    'Purple' = 3,
    'None' = 4
}

export interface AncientRuinsSpecifications {
    biomeRuins: RuinsBiome,
    biomeWater: WaterBiome,
    groundMaterial: GroundMaterial,
    plantColor: PlantColor,
    plantPercentage: number,
    plantSpreadability: number,
    waterColor: WaterColor,
    waterPercentage: number,
    waterSpreadability: number
}
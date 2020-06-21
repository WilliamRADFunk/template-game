import {
    AncientRuinsSpecifications,
    GroundMaterial,
    WaterColor,
    PlantColor,
    TreeTrunkColor,
    TreeLeafColor} from "../../../models/ancient-ruins-specifications";
import { gridDictionary } from "../utils/tile-spritemap-values";

export class TileCtrl {
    private _ancientRuinsSpec: AncientRuinsSpecifications;
    private _bridgeBase: number;
    private _bridgeEnd: number;
    private _groundPlantBase: number;
    private _groundGrassEnd: number;
    // Lookup table for grass/plant tiles when assigning edge graphics.
    private _groundPlantLookupTable: { [key: string]: number };
    private _treeLeafBase: number;
    private _treeLeafEnd: number;
    private _treeLeafLookupTable: { [key: string]: number };
    private _treeTrunkBase: number;
    private _treeTrunkEnd: number;
    private _treeTrunkLookupTable: { [key: string]: number };
    private _waterBase: number;
    private _waterEnd: number;
    // Lookup table for water tiles when assigning edge graphics.
    private _waterLookupTable: { [key: string]: number };

    constructor(ancientRuinsSpec: AncientRuinsSpecifications) {
        this._ancientRuinsSpec = ancientRuinsSpec;
        const mod = this._setGroundStart(ancientRuinsSpec.groundMaterial);
        this._setPlantStart(ancientRuinsSpec.plantColor, this._groundPlantBase);
        this._setWaterStart(ancientRuinsSpec.waterColor, mod);
        this._setTreeLeafStart(ancientRuinsSpec.treeLeafColor);
        this._setTreeTrunkStart(ancientRuinsSpec.treeTrunkColor);

        this._groundGrassEnd = this._groundPlantBase + 20;
        this._waterEnd = this._waterBase + 99;
        this._treeLeafEnd = this._treeLeafBase + 19;
        this._treeTrunkEnd = this._treeTrunkBase + 19;
        this._bridgeBase = 3000;
        this._bridgeEnd = 3999;

        this._groundPlantLookupTable = {
            '0000': this._groundPlantBase,
            '1000': this._groundPlantBase + 2,
            '1100': this._groundPlantBase + 3,
            '0100': this._groundPlantBase + 4,
            '0110': this._groundPlantBase + 5,
            '0010': this._groundPlantBase + 6,
            '0011': this._groundPlantBase + 7,
            '0001': this._groundPlantBase + 8,
            '1001': this._groundPlantBase + 9,
            '1101': this._groundPlantBase + 10,
            '1110': this._groundPlantBase + 11,
            '0111': this._groundPlantBase + 12,
            '1011': this._groundPlantBase + 13,
            '1010': this._groundPlantBase + 14,
            '0101': this._groundPlantBase + 15,
            'sparse': this._groundPlantBase + 16,
            'mixed': this._groundPlantBase + 18,
            '1111': this._groundPlantBase + 20
        };

        this._treeLeafLookupTable = {
            '0000-0000': this._treeLeafBase,
            '1000-0000': this._treeLeafBase + 1,
            '1000-1001': this._treeLeafBase + 1,
            '1000-0001': this._treeLeafBase + 1,
            '1000-1000': this._treeLeafBase + 1,
            '1000-0101': this._treeLeafBase + 2,
            '0100-0101': this._treeLeafBase + 2,
            '1100-1101': this._treeLeafBase + 2,
            '1100-0101': this._treeLeafBase + 2,
            '1100-1001': this._treeLeafBase + 2,
            '1100-1100': this._treeLeafBase + 2,
            '1100-1000': this._treeLeafBase + 2,
            '1100-0100': this._treeLeafBase + 2,
            '1100-0001': this._treeLeafBase + 2,
            '1100-0000': this._treeLeafBase + 2,
            '1000-0100': this._treeLeafBase + 2,
            '0100-0001': this._treeLeafBase + 2,
            '0100-1100': this._treeLeafBase + 3,
            '0100-1000': this._treeLeafBase + 3,
            '0100-0100': this._treeLeafBase + 3,
            '0100-0000': this._treeLeafBase + 3,
            '0010-1010': this._treeLeafBase + 4,
            '0100-1010': this._treeLeafBase + 4,
            '0110-1110': this._treeLeafBase + 4,
            '0110-0110': this._treeLeafBase + 4,
            '0110-1010': this._treeLeafBase + 4,
            '0110-1100': this._treeLeafBase + 4,
            '0110-1000': this._treeLeafBase + 4,
            '0110-0100': this._treeLeafBase + 4,
            '0110-0010': this._treeLeafBase + 4,
            '0110-0000': this._treeLeafBase + 4,
            '0010-1000': this._treeLeafBase + 4,
            '0100-0010': this._treeLeafBase + 4,
            '0010-0110': this._treeLeafBase + 5,
            '0010-0010': this._treeLeafBase + 5,
            '0010-0100': this._treeLeafBase + 5,
            '0010-0000': this._treeLeafBase + 5,
            '0010-0101': this._treeLeafBase + 6,
            '0001-0101': this._treeLeafBase + 6,
            '0011-0111': this._treeLeafBase + 6,
            '0011-0011': this._treeLeafBase + 6,
            '0011-0101': this._treeLeafBase + 6,
            '0011-0110': this._treeLeafBase + 6,
            '0011-0100': this._treeLeafBase + 6,
            '0011-0001': this._treeLeafBase + 6,
            '0011-0010': this._treeLeafBase + 6,
            '0011-0000': this._treeLeafBase + 6,
            '0010-0001': this._treeLeafBase + 6,
            '0001-0100': this._treeLeafBase + 6,
            '0001-0011': this._treeLeafBase + 7,
            '0001-0001': this._treeLeafBase + 7,
            '0001-0010': this._treeLeafBase + 7,
            '0001-0000': this._treeLeafBase + 7,
            '1000-1010': this._treeLeafBase + 8,
            '0001-1010': this._treeLeafBase + 8,
            '1001-1011': this._treeLeafBase + 8,
            '1001-0011': this._treeLeafBase + 8,
            '1001-1001': this._treeLeafBase + 8,
            '1001-1010': this._treeLeafBase + 8,
            '1001-1000': this._treeLeafBase + 8,
            '1001-0010': this._treeLeafBase + 8,
            '1001-0001': this._treeLeafBase + 8,
            '1001-0000': this._treeLeafBase + 8,
            '0001-1000': this._treeLeafBase + 8,
            '1000-0010': this._treeLeafBase + 8,
            '0000-1000': this._treeLeafBase + 9,
            '0000-0100': this._treeLeafBase + 10,
            '0000-0010': this._treeLeafBase + 11,
            '0000-0001': this._treeLeafBase + 12,
            '0000-0101': this._treeLeafBase + 13,
            '0000-1010': this._treeLeafBase + 14,
        };

        this._waterLookupTable = {
            '0000-0000': this._waterBase,
            '1000-0000': this._waterBase + 1,
            '1000-1000': this._waterBase + 1,
            '1000-0001': this._waterBase + 1,
            '1000-1001': this._waterBase + 1,
            '1100-0000': this._waterBase + 2,
            '1100-1000': this._waterBase + 2,
            '1100-0100': this._waterBase + 2,
            '1100-0001': this._waterBase + 2,
            '1100-1001': this._waterBase + 2,
            '1100-0101': this._waterBase + 2,
            '1100-1101': this._waterBase + 2,
            '1100-1100': this._waterBase + 2,
            '0100-0000': this._waterBase + 3,
            '0100-1000': this._waterBase + 3,
            '0100-0100': this._waterBase + 3,
            '0100-1100': this._waterBase + 3,
            '0110-0000': this._waterBase + 4,
            '0110-0100': this._waterBase + 4,
            '0110-1000': this._waterBase + 4,
            '0110-0010': this._waterBase + 4,
            '0110-1100': this._waterBase + 4,
            '0110-0110': this._waterBase + 4,
            '0110-1010': this._waterBase + 4,
            '0110-1110': this._waterBase + 4,
            '0010-0000': this._waterBase + 5,
            '0010-0100': this._waterBase + 5,
            '0010-0010': this._waterBase + 5,
            '0010-0110': this._waterBase + 5,
            '0011-0000': this._waterBase + 6,
            '0011-0010': this._waterBase + 6,
            '0011-0100': this._waterBase + 6,
            '0011-0001': this._waterBase + 6,
            '0011-0110': this._waterBase + 6,
            '0011-0011': this._waterBase + 6,
            '0011-0101': this._waterBase + 6,
            '0011-0111': this._waterBase + 6,
            '0001-0000': this._waterBase + 7,
            '0001-0010': this._waterBase + 7,
            '0001-0001': this._waterBase + 7,
            '0001-0011': this._waterBase + 7,
            '1001-0000': this._waterBase + 8,
            '1001-0001': this._waterBase + 8,
            '1001-1000': this._waterBase + 8,
            '1001-0010': this._waterBase + 8,
            '1001-1010': this._waterBase + 8,
            '1001-0011': this._waterBase + 8,
            '1001-1001': this._waterBase + 8,
            '1001-1011': this._waterBase + 8,
            '0000-0001': this._waterBase + 9,
            '0000-1000': this._waterBase + 10,
            '0000-0100': this._waterBase + 11,
            '0000-0010': this._waterBase + 12,
            '0000-0101': this._waterBase + 13,
            '0000-1010': this._waterBase + 14,
            '1111-1111': this._waterBase + 15,
            '1111-0111': this._waterBase + 15,
            '1111-1011': this._waterBase + 15,
            '1111-1101': this._waterBase + 15,
            '1111-1110': this._waterBase + 15,
            '1111-1100': this._waterBase + 15,
            '1111-0110': this._waterBase + 15,
            '1111-0011': this._waterBase + 15,
            '1111-1001': this._waterBase + 15,
            '1111-1000': this._waterBase + 15,
            '1111-0100': this._waterBase + 15,
            '1111-0010': this._waterBase + 15,
            '1111-0001': this._waterBase + 15,
            '1111-0000': this._waterBase + 15,
            '1111-1010': this._waterBase + 15,
            '1111-0101': this._waterBase + 15,
            '0001-0100': this._waterBase + 16,
            '0001-0111': this._waterBase + 16,
            '0001-0101': this._waterBase + 16,
            '0001-0110': this._waterBase + 16,
            '0100-0010': this._waterBase + 17,
            '0100-1110': this._waterBase + 17,
            '0100-1010': this._waterBase + 17,
            '0100-0110': this._waterBase + 17,
            '0001-1000': this._waterBase + 18,
            '0001-1011': this._waterBase + 18,
            '0001-1001': this._waterBase + 18,
            '0001-1010': this._waterBase + 18,
            '0100-0001': this._waterBase + 19,
            '0100-1101': this._waterBase + 19,
            '0100-0101': this._waterBase + 19,
            '0100-1001': this._waterBase + 19,
            '0010-0001': this._waterBase + 20,
            '0010-0111': this._waterBase + 20,
            '0010-0011': this._waterBase + 20,
            '0010-0101': this._waterBase + 20,
            '0010-1000': this._waterBase + 21,
            '0010-1110': this._waterBase + 21,
            '0010-1010': this._waterBase + 21,
            '0010-1100': this._waterBase + 21,
            '1000-0010': this._waterBase + 22,
            '1000-1011': this._waterBase + 22,
            '1000-0011': this._waterBase + 22,
            '1000-1010': this._waterBase + 22,
            '1000-0100': this._waterBase + 23,
            '1000-1101': this._waterBase + 23,
            '1000-0101': this._waterBase + 23,
            '1000-1100': this._waterBase + 23
        };
    }

    private _setPlantStart(color: PlantColor, groundMod: number): void {
        switch(color) {
            case PlantColor.Green: {
                this._groundPlantBase = groundMod;
                return;
            }
            case PlantColor.Yellow: {
                this._groundPlantBase = 300 + groundMod;
                return;
            }
            case PlantColor.Purple: {
                this._groundPlantBase = 600 + groundMod;
                return;
            }
            default: {
                this._groundPlantBase = groundMod;
            }
        }
    }

    private _setGroundStart(mat: GroundMaterial): number {
        switch(mat) {
            case GroundMaterial.Dirt: {
                this._groundPlantBase = 2;
                return 0;
            }
            case GroundMaterial.Sand: {
                this._groundPlantBase = 102;
                return 100;
            }
            case GroundMaterial.Gravel: {
                this._groundPlantBase = 202;
                return 200;
            }
        }
    }

    private _setTreeLeafStart(color: TreeLeafColor): void {
        switch(color) {
            case TreeLeafColor.Green: {
                this._treeLeafBase = 2200;
                break;
            }
            case TreeLeafColor.Red: {
                this._treeLeafBase = 2220;
                break;
            }
            case TreeLeafColor.Yellow: {
                this._treeLeafBase = 2240;
                break;
            }
            case TreeLeafColor.Grey: {
                this._treeLeafBase = 2260;
                break;
            }
            case TreeLeafColor.Purple: {
                this._treeLeafBase = 2280;
                break;
            }
            case TreeLeafColor.Blue: {
                this._treeLeafBase = 2300;
                break;
            }
            case TreeLeafColor.Brown: {
                this._treeLeafBase = 2320;
                break;
            }
            default: {
                this._treeLeafBase = 2200;
            }
        }
    }

    private _setTreeTrunkStart(color: TreeTrunkColor): void {
        switch(color) {
            case TreeTrunkColor.Grey: {
                this._treeTrunkBase = 2000;
                break;
            }
            case TreeTrunkColor.Yellow: {
                this._treeTrunkBase = 2020;
                break;
            }
            case TreeTrunkColor.Purple: {
                this._treeTrunkBase = 2040;
                break;
            }
            case TreeTrunkColor.Red: {
                this._treeTrunkBase = 2060;
                break;
            }
            case TreeTrunkColor.Blue: {
                this._treeTrunkBase = 2080;
                break;
            }
            case TreeTrunkColor.Brown: {
                this._treeTrunkBase = 2100;
                break;
            }
            default: {
                this._treeTrunkBase = 2000;
            }
        }
    }

    private _setWaterStart(color: WaterColor, waterMod: number): void {
        switch(color) {
            case WaterColor.Blue: {
                this._waterBase = 1000 + waterMod;
                return;
            }
            case WaterColor.Green: {
                this._waterBase = 1300 + waterMod;
                return;
            }
            case WaterColor.Purple: {
                this._waterBase = 1600 + waterMod;
                return;
            }
            default: {
                this._waterBase = 1000 + waterMod;
            }
        }
    }

    public getBridgeBaseValue(): number {
        return this._bridgeBase;
    }

    public getBridgeEndValue(): number {
        return this._bridgeEnd;
    }

    public getBridgeTileValue(key: number): number {
        return this._bridgeBase + key;
    }

    public getGridDicCustomSize(key: number): [number, number] {
        return gridDictionary[key].customSize || null;
    }

    public getGridDicDescription(key: number): string {
        return (gridDictionary[key] && gridDictionary[key].gameDescription) || '';
    }

    public getGridDicKeys(): number[] {
        return Object.keys(gridDictionary).map(key => Number(key));
    }

    public getGridDicPosMod(key: number, z?: boolean): number {
        return z ? (gridDictionary[key].zPosMod || 0) : (gridDictionary[key].xPosMod || 0);
    }

    public getGridDicScaleMod(key: number, z?: boolean): number {
        return z ? (gridDictionary[key].zScaleMod || 0) : (gridDictionary[key].xScaleMod || 0);
    }

    public getGridDicSpritePos(key: number): [number, number] {
        return gridDictionary[key].spritePosition;
    }

    public getGridDicVariation(key: number): boolean {
        return gridDictionary[key].hasVariation || false;
    }

    public getGroundBaseValue(): number {
        return this._groundPlantBase;
    }

    public getGroundEndValue(): number {
        return this._groundGrassEnd;
    }

    public getGroundTileValue(key: string): number {
        return this._groundPlantLookupTable[key] || this._groundPlantBase;
    }

    public getTreeLeafBaseValue(): number {
        return this._ancientRuinsSpec.treeLeafColor !== TreeLeafColor.None ? this._treeLeafBase : 0;
    }

    public getTreeLeafEndValue(): number {
        return this._ancientRuinsSpec.treeLeafColor !== TreeLeafColor.None ? this._treeLeafEnd : 0;
    }

    public getTreeLeafTileValue(key: string): number {
        return this._ancientRuinsSpec.treeLeafColor !== TreeLeafColor.None ? (this._treeLeafLookupTable[key] || this._treeLeafBase) : 0;
    }

    public getTreeTrunkBaseValue(): number {
        return this._treeTrunkBase;
    }

    public getTreeTrunkEndValue(): number {
        return this._treeTrunkEnd;
    }

    public getTreeTrunkTileValue(key: string): number {
        return this._treeTrunkLookupTable[key] || this._treeTrunkBase;
    }

    public getWaterBaseValue(): number {
        return this._waterBase;
    }

    public getWaterEndValue(): number {
        return this._waterEnd;
    }

    public getWaterTileValue(key: string): number {
        return this._waterLookupTable[key] || this._waterBase;
    }
}
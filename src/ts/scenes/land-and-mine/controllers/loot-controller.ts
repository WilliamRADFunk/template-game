import { PlanetSpecifications, OreTypes } from "../../../models/planet-specifications";
import { TextCtrl } from "./text-controller";

export class LootCtrl {
    private _oreKey: OreTypes;

    private _quantities: { [key: number]: number } = {
        '-3': 1,    // the lander itself
        '-2': 0,    // surviving crew members'
        '-1': 0,    // food
        '0': 0,     // water
    };

    private _tempQuantities: { [key: number]: number } = {
        '-1': 0,    // food
        '0': 0,     // water
    };

    private _txtCtrl: TextCtrl;

    constructor(oreKey: OreTypes, txtCtrl: TextCtrl) {
        this._oreKey = oreKey;
        this._quantities[this._oreKey] = 0;
        this._tempQuantities[this._oreKey] = 0;
        this._txtCtrl = txtCtrl;
    }

    private _getFood(): number {
        return this._quantities[-1];
    }

    private _getOre(): number {
        let oreKey;
        Object.keys(this._quantities).forEach(key => {
            if (Number(key) > 0)
            oreKey = key
        });
        return this._quantities[Number(oreKey)];
    }

    private _getWater(): number {
        return this._quantities[0];
    }

    public addTempFood(amount: number): void {
        this._tempQuantities[-1] += amount;
        this._txtCtrl.generateMinedText(`${amount} x Food`);
    }

    public addTempOre(amount: number): void {
        this._tempQuantities[this._oreKey] += amount;
        this._txtCtrl.generateMinedText(`${amount} x ${OreTypes[this._oreKey]}`);
    }

    public addTempWater(amount: number): void {
        this._tempQuantities[0] += amount;
        this._txtCtrl.generateMinedText(`${amount} x Water`);
    }

    public crashTheLander(): void {
        Object.keys(this._quantities).forEach(key => {
            this._quantities[Number(key)] = 0;
        });
        this._txtCtrl.resetLoot();
    }

    public getLoot(): { [key: number]: number } {
        return this._quantities;
    }

    public loadLoot(): void {
        Object.keys(this._tempQuantities).forEach(key => {
            this._quantities[Number(key)] += this._tempQuantities[Number(key)];
            this._tempQuantities[Number(key)] = 0;
        });

        this._txtCtrl.update('waterAndFoodCollected', `${this._getWater()} Water / ${this._getFood()} Food`);
        this._txtCtrl.update('oreCollected', `${this._getOre()} ${OreTypes[this._oreKey]}`);
    }

    public loseCrew(): void {
        this._quantities[-2] = 0;
        this._txtCtrl.update('crewCollected', '0 crew recovered');
    }

    public regainCrew(): void {
        this._quantities[-2] = 2;
        this._txtCtrl.update('crewCollected', '2 crew recovered');
    }
}
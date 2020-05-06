import { OreTypes } from "../../../models/planet-specifications";
import { TextCtrl } from "./text-controller";

/**
 * @class
 * The loot controller class - tracks and updates the official and unofficial loot values.
 */
export class LootCtrl {
    /**
     * Ore enum lookup value for the current planetary body.
     */
    private _oreKey: OreTypes;

    /**
     * Loot values on the ship. The official values.
     */
    private _quantities: { [key: number]: number } = {
        '-3': 1,    // the lander itself
        '-2': 0,    // surviving crew members'
        '-1': 0,    // food
        '0': 0,     // water
    };

    /**
     * Temporary loot values held by miners, not yet on ship.
     */
    private _tempQuantities: { [key: number]: number } = {
        '-1': 0,    // food
        '0': 0,     // water
    };

    /**
     * Reference to the game's Text Controller.
     */
    private _txtCtrl: TextCtrl;

    /**
     * Constructor for the Loot Controller class.
     * @param oreKey ore enum lookup value for the current planetary body.
     * @param lootCtrl reference to the Text Controller to update loot values
     */
    constructor(oreKey: OreTypes, txtCtrl: TextCtrl) {
        this._oreKey = oreKey;
        this._quantities[this._oreKey] = 0;
        this._tempQuantities[this._oreKey] = 0;
        this._txtCtrl = txtCtrl;
    }

    /**
     * Returns the amount of food currently on the ship.
     * @returns quantity of food held on the ship
     */
    private _getFood(): number {
        return this._quantities[-1];
    }

    /**
     * Returns the amount of ore currently on the ship.
     * @returns quantity of ore held on the ship
     */
    private _getOre(): number {
        let oreKey;
        Object.keys(this._quantities).forEach(key => {
            if (Number(key) > 0)
            oreKey = key
        });
        return this._quantities[Number(oreKey)];
    }

    /**
     * Returns the amount of water currently on the ship.
     * @returns quantity of water held on the ship
     */
    private _getWater(): number {
        return this._quantities[0];
    }

    /**
     * Adds food quantity to the temporary (carried by miners) loot.
     * @param amount quantity of food to add to miners' temporary carry
     */
    public addTempFood(amount: number): void {
        this._tempQuantities[-1] += amount;
        this._txtCtrl.generateMinedText(`${amount} x Food`);
    }

    /**
     * Adds ore quantity to the temporary (carried by miners) loot.
     * @param amount quantity of ore to add to miners' temporary carry
     */
    public addTempOre(amount: number): void {
        this._tempQuantities[this._oreKey] += amount;
        this._txtCtrl.generateMinedText(`${amount} x ${OreTypes[this._oreKey]}`);
    }

    /**
     * Adds water quantity to the temporary (carried by miners) loot.
     * @param amount quantity of water to add to miners' temporary carry
     */
    public addTempWater(amount: number): void {
        this._tempQuantities[0] += amount;
        this._txtCtrl.generateMinedText(`${amount} x Water`);
    }

    /**
     * Performs the necessary updates to loot and text when lander has crashed.
     */
    public crashTheLander(): void {
        Object.keys(this._quantities).forEach(key => {
            this._quantities[Number(key)] = 0;
        });
        this._txtCtrl.resetLoot();
    }

    /**
     * Returns the current loot values to caller.
     * @returns the loot object
     */
    public getLoot(): { [key: number]: number } {
        return this._quantities;
    }

    /**
     * Loads the loot onto the ship that the miners collected, and updates the text values.
     */
    public loadLoot(): void {
        Object.keys(this._tempQuantities).forEach(key => {
            this._quantities[Number(key)] += this._tempQuantities[Number(key)];
            this._tempQuantities[Number(key)] = 0;
        });

        this._txtCtrl.update('waterAndFoodCollected', `${this._getWater()} Water / ${this._getFood()} Food`);
        this._txtCtrl.update('oreCollected', `${this._getOre()} ${OreTypes[this._oreKey]}`);
    }

    /**
     * Called when crew dies. Both text and loot amounts are updated.
     */
    public loseCrew(): void {
        this._quantities[-2] = 0;
        this._txtCtrl.update('crewCollected', '0 crew recovered');
    }

    /**
     * Called when crew successfully escapes. Both text and loot amounts are updated.
     */
    public regainCrew(): void {
        this._quantities[-2] = 2;
        this._txtCtrl.update('crewCollected', '2 crew recovered');
    }
}
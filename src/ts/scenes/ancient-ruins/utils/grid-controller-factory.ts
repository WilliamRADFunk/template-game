import { Scene, Texture } from "three";

import { AncientRuinsSpecifications } from "../../../models/ancient-ruins-specifications";
import { GridCtrl } from "../controllers/grid-controller";
import { TileCtrl } from "../controllers/tile-controller";

export async function GridCtrlFactory(
    scene: Scene,
    textures: { [key: string]: Texture },
    ancientRuinsSpec: AncientRuinsSpecifications,
    tileCtrl: TileCtrl
): Promise<GridCtrl> {
    return new Promise((resolve) => {
        const gridCtrl: GridCtrl = new GridCtrl(scene, textures, ancientRuinsSpec, tileCtrl);
        resolve(gridCtrl);
    }).then((res: GridCtrl) => res);
}
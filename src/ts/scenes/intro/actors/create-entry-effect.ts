import {
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    SphericalReflectionMapping,
    Texture} from "three";

import { Actor } from "../../../models/actor";
import { createActor } from "../../../utils/create-actor";

export function createEntryEffect(entryEffectTexture: Texture) {
    const shieldSize = 1;
    const entryEffect = createActor();
    entryEffect.currentPoint = [0, 0];
    entryEffect.endingPoint = [0, 0];
    entryEffect.originalStartingPoint = [0, 0];
    // Creates the semi-transparent flame shield over ship's nose cone.
    entryEffect.geometry = new SphereGeometry(shieldSize, 32, 32);
    const envMap = entryEffectTexture;
    envMap.mapping = SphericalReflectionMapping;
    entryEffect.material = new MeshStandardMaterial({
        color: 0x05EDFF,
        envMap: envMap,
        opacity: 0.65,
        roughness: 0,
        transparent: true
    });
    entryEffect.mesh = new Mesh(entryEffect.geometry, entryEffect.material);
    entryEffect.mesh.position.set(entryEffect.originalStartingPoint[0], -4, entryEffect.originalStartingPoint[1]);
    entryEffect.mesh.name = 'Shield';
    return entryEffect;
}
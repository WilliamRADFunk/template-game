import {
    Font,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PlaneGeometry,
    TextGeometryParameters } from "three";

import { Actor } from "../../../models/actor";
import { createSun } from "./create-sun";
import { createMercury } from "./create-mercury";
import { createVenus } from "./create-venus";
import { createTinyEarth } from "./create-tiny-earth";
import { createTinyMars } from "./create-tiny-mars";
import { createJuptier } from "./create-jupiter";
import { createSaturn } from "./create-saturn";
import { createUranus } from "./create-uranus";
import { createNeptune } from "./create-neptune";
import { createPluto } from "./create-pluto";
import { createErobusStation } from "./create-erobus-station";

export function createSolarSystem(
    introFont: Font,
    lbgGeo: PlaneGeometry,
    lbgMat: MeshPhongMaterial,
    lbGeo: PlaneGeometry,
    lbMat: MeshBasicMaterial,
    headerParams: TextGeometryParameters
): Actor[] {
    const actors = [];

    let zIndex = 3;
    actors.push(createSun(
        lbgGeo,
        lbgMat,
        lbGeo,
        lbMat,
        headerParams,
        zIndex));

    zIndex += 3;
    actors.push(createMercury(zIndex));

    zIndex += 3;
    actors.push(createVenus(zIndex));

    zIndex += 3;
    actors.push(createTinyEarth(zIndex));

    zIndex += 3;
    actors.push(createTinyMars(zIndex));

    zIndex += 3;
    actors.push(createJuptier(zIndex));

    zIndex += 3;
    actors.push(createSaturn(zIndex));

    zIndex += 3;
    actors.push(createUranus(zIndex));

    zIndex += 3;
    actors.push(createNeptune(zIndex));

    zIndex += 3;
    actors.push(createPluto(zIndex));

    zIndex += 3;
    actors.push(createErobusStation(
        introFont,
        lbgMat,
        lbMat,
        zIndex));
    
    return actors;
}
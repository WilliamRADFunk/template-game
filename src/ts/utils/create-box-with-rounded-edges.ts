import { ExtrudeBufferGeometry, Shape } from "three";

// Complements of this clever person: https://discourse.threejs.org/t/round-edged-box/1402
export function createBoxWithRoundedEdges(width: number, height: number, radius: number, smoothness: number) {
    const _shape = new Shape();
    const _eps = 0.00001;
    const _radius = radius - _eps;
    _shape.absarc( _eps, _eps, _eps, -Math.PI / 2, -Math.PI, true );
    _shape.absarc( _eps, height -  _radius * 2, _eps, Math.PI, Math.PI / 2, true );
    _shape.absarc( width - _radius * 2, height -  _radius * 2, _eps, Math.PI / 2, 0, true );
    _shape.absarc( width - _radius * 2, _eps, _eps, 0, -Math.PI / 2, true );
    const geometry = new ExtrudeBufferGeometry( _shape, {
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius,
        curveSegments: smoothness
    });

    geometry.center();

    return geometry;
  }
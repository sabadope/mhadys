import * as THREE from "three";

/** Mutable camera rig shared between HTML controls and the R3F frame loop (no React state per frame). */
export interface Rig {
  target: THREE.Vector3;
  angle: number; // azimuth radians
  elevation: number; // polar-ish height factor
  dist: number;
  animating: boolean;
  instant: boolean;
}

export const BASE_ANGLE = Math.PI / 4;

export function createRig(): Rig {
  return { target: new THREE.Vector3(-24, 3, 0), angle: BASE_ANGLE, elevation: 0.8, dist: 38, animating: true, instant: false };
}

export function rigCameraPosition(r: Rig, out: THREE.Vector3) {
  const horiz = r.dist * Math.cos(Math.atan(r.elevation));
  out.set(r.target.x + Math.sin(r.angle) * horiz, r.target.y + r.dist * Math.sin(Math.atan(r.elevation)), r.target.z + Math.cos(r.angle) * horiz);
  return out;
}

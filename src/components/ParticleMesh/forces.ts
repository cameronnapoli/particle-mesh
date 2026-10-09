import * as THREE from 'three';

/** Gravitational constant */
export const G = 10000;
/** Softening length (ε) */
export const GRAV_SOFTENING_PX = 200;

/**
 * Pulls `body` toward `attractor` with softened inverse-square magnitude.
 *
 * @param attractorPosition Attractor position
 * @param bodyPosition Body position
 * @param scale Coefficient force multiplier
 * @param radiusPx Radius outside of which gravity will not apply, or `null` for unlimited range
 * @returns Force vector acting on `body`
 */
export const gravity = (
  attractorPosition: THREE.Vector3,
  bodyPosition: THREE.Vector3,
  scale: number,
  radiusPx: number | null,
): THREE.Vector3 => {
  const distance = bodyPosition.distanceTo(attractorPosition);

  // short circuit if outside radius
  if (radiusPx !== null && distance > radiusPx) {
    return new THREE.Vector3(0, 0, 0);
  }

  const direction = new THREE.Vector3()
    .subVectors(attractorPosition, bodyPosition)
    .normalize();

  // F = G * ((m1 * m2) / (r^2 + ε^2))
  const m1 = 1.0;
  const m2 = 1.0;
  const magnitude = scale * G * ((m1 * m2) / (distance * distance + GRAV_SOFTENING_PX * GRAV_SOFTENING_PX));

  return new THREE.Vector3(
    direction.x * magnitude,
    direction.y * magnitude,
    direction.z * magnitude,
  );
};

/**
 * Pulls `body` back toward `anchor` like a damped spring.
 *
 * @param anchorPosition Anchor position
 * @param bodyPosition Body position
 * @param bodyVelocity Body velocity
 * @param springConstant Stiffness (k)
 * @param dampingConstant Damping coefficient (c)
 * @returns Force vector acting on `body`
 */
export const elasticity = (
  anchorPosition: THREE.Vector3,
  bodyPosition: THREE.Vector3,
  bodyVelocity: THREE.Vector3,
  springConstant: number,
  dampingConstant: number,
): THREE.Vector3 => {
  // F = -k * x - c * v
  const displacement = bodyPosition
    .clone()
    .sub(anchorPosition);
  const springForce = displacement
    .multiplyScalar(-springConstant);
  const dampingForce = bodyVelocity
    .clone()
    .multiplyScalar(-dampingConstant);
  return springForce
    .add(dampingForce);
};
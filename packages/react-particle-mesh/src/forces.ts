import * as THREE from 'three';

/**
 * Pulls `body` toward `attractor` with Plummer-softened inverse-square magnitude.
 *
 * @param attractorPosition Attractor position
 * @param bodyPosition Body position
 * @param magnitudeCoefficient Coefficient force multiplier
 * @param radius Radius outside of which gravity will not apply, or `null` for unlimited range
 * @param target Vector to write the result into
 * @returns Force vector acting on `body`
 */
export const gravity = (
  attractorPosition: THREE.Vector3,
  bodyPosition: THREE.Vector3,
  magnitudeCoefficient: number,
  radius: number | null,
  target = new THREE.Vector3(),
): THREE.Vector3 => {
  const distance = bodyPosition.distanceTo(attractorPosition);

  // short circuit if outside radius
  if (radius !== null && distance > radius) {
    return target.set(0, 0, 0);
  }

  const direction = target
    .subVectors(attractorPosition, bodyPosition)
    .normalize();

  // F = G * m1 * m2 * r / (r^2 + ε^2)^(3/2)
  const G = 62000;
  const EPSILON = 200;
  const m1 = 1.0;
  const m2 = 1.0;
  const magnitude = magnitudeCoefficient * G * ((m1 * m2 * distance)
    / Math.pow(distance * distance + EPSILON * EPSILON, 1.5));

  return direction.multiplyScalar(magnitude);
};

/**
 * Pulls `body` back toward `anchor` like a damped spring.
 *
 * @param anchorPosition Anchor position
 * @param bodyPosition Body position
 * @param bodyVelocity Body velocity
 * @param springConstant Stiffness (k)
 * @param dampingConstant Damping coefficient (c)
 * @param target Vector to write the result into
 * @returns Force vector acting on `body`
 */
export const elasticity = (
  anchorPosition: THREE.Vector3,
  bodyPosition: THREE.Vector3,
  bodyVelocity: THREE.Vector3,
  springConstant: number,
  dampingConstant: number,
  target = new THREE.Vector3(),
): THREE.Vector3 => {
  // F = -k * x - c * v
  return target
    .subVectors(bodyPosition, anchorPosition)
    .multiplyScalar(-springConstant)
    .addScaledVector(bodyVelocity, -dampingConstant);
};
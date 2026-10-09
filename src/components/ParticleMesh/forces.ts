import * as THREE from 'three';

/** Gravitational constant */
export const G = 10000;
/** Softening length (ε) */
export const GRAV_SOFTENING_PX = 200;

/**
 * Pulls `body` toward `attractor` with softened inverse-square magnitude.
 *
 * @param attractor Position the body is pulled toward
 * @param body Position of the body being pulled
 * @param scale Coefficient multiplying the force
 * @param radiusPx Radius outside of which gravity will not apply, or `null` for unlimited range
 * @returns Force vector acting on `body`
 */
export const gravity = (
  attractor: THREE.Vector3,
  body: THREE.Vector3,
  scale: number = 5,
  radiusPx: number | null,
): THREE.Vector3 => {
  const distance = body.distanceTo(attractor);

  // short circuit if outside radius
  if (radiusPx !== null && distance > radiusPx) {
    return new THREE.Vector3(0, 0, 0);
  }

  const direction = new THREE.Vector3()
    .subVectors(attractor, body)
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

export const elasticity = (
  anchor: THREE.Vector3,
  particlePosition: THREE.Vector3,
  particleVelocity: THREE.Vector3,
  springConstant: number,
  dampingConstant: number,
): THREE.Vector3 => {
  const displacement = particlePosition.clone().sub(anchor);
  const springForce = displacement.multiplyScalar(-springConstant);
  const dampingForce = particleVelocity.clone().multiplyScalar(-dampingConstant);
  return springForce.add(dampingForce);
};
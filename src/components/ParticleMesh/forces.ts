import * as THREE from 'three';

export const gravity = (
  mouse: THREE.Vector3,
  particle: THREE.Vector3,
  strength: number = 50000,
  radiusPx: number | null,
): THREE.Vector3 => {
  let distance = particle.distanceTo(mouse);

  // short circuit if outside radius
  if (radiusPx !== null && distance > radiusPx) {
    return new THREE.Vector3(0, 0, 0);
  }

  // caps the magnitude by creating a min distance
  distance = Math.max(distance, 200);

  const direction = new THREE.Vector3()
    .subVectors(mouse, particle)
    .normalize();

  const magnitude = strength / (distance * distance);

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
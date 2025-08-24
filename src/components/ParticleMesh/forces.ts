import * as THREE from 'three';

export const gravitationalForce = (
  mouse: THREE.Vector3,
  particle: THREE.Vector3,
  mouseGravityStrength: number,
  mouseGravityRadiusPx: number | null,
): THREE.Vector3 => {
  let distance = particle.distanceTo(mouse);

  if (mouseGravityRadiusPx !== null && distance > mouseGravityRadiusPx) {
    return new THREE.Vector3(0, 0, 0);
  }

  // our units are px, so this bumps up the grav strength
  distance = distance / 100;

  // caps the magnitude by creating a min distance
  distance = Math.max(distance, 2.0);

  const direction = new THREE.Vector3()
    .subVectors(mouse, particle)
    .normalize();

  const magnitude = mouseGravityStrength / (distance * distance);

  return new THREE.Vector3(
    direction.x * magnitude,
    direction.y * magnitude,
    direction.z * magnitude,
  );
};

export const elasticForce = (
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
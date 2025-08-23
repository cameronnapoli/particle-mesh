import * as THREE from 'three';

export const gravitationalForce = (
  mouse: THREE.Vector3,
  particle: THREE.Vector3,
): THREE.Vector3 => {
  const mouseGravityStrength = 0.001;
  const mouseGravityRadius = 5.0;

  let distance = particle.distanceTo(mouse);

  if (distance > mouseGravityRadius) {
    return new THREE.Vector3(0, 0, 0);
  }

  // caps the magnitude
  distance = Math.max(distance, 0.2);

  const direction = new THREE.Vector3()
    .subVectors(mouse, particle)
    .normalize();
  
  const magnitude = mouseGravityStrength / (distance * distance);

  return new THREE.Vector3(
    direction.x * magnitude,
    direction.y * magnitude,
    direction.z * magnitude,
  )
}

export const elasticForce = (
  anchor: THREE.Vector3,
  particlePosition: THREE.Vector3,
  particleVelocity: THREE.Vector3,
  springConstant = 0.1,
  dampingConstant = 0.1,
): THREE.Vector3 => {
  const displacement = particlePosition.clone().sub(anchor);
  const springForce = displacement.multiplyScalar(-springConstant);
  const dampingForce = particleVelocity.clone().multiplyScalar(-dampingConstant);
  return springForce.add(dampingForce);
}
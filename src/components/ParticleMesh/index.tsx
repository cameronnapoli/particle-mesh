'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const settings = {
  rows: 20,
  cols: 40,
  gap: 0.2,
}

const particleCount = settings.rows * settings.cols;
const gridMidpoint = new THREE.Vector3(
  (settings.cols * settings.gap) / 2,
  (settings.rows * settings.gap) / 2,
  0,
);

const gravitationalForce = (mouse: THREE.Vector3, particle: THREE.Vector3): THREE.Vector3 => {
  const mouseGravityStrength = 0.001;
  const mouseGravityRadius = 2.0;

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

const ParticleMesh: React.FunctionComponent = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const particles: THREE.BufferGeometry = new THREE.BufferGeometry();
    const positions: Float32Array = new Float32Array(particleCount * 3);
    const anchors: Float32Array = new Float32Array(particleCount * 3);
    const velocities: Float32Array = new Float32Array(particleCount * 3);
    const colors: Float32Array = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const column = Math.floor(i / settings.rows);
      const row = i % settings.rows;
      const x = (column * settings.gap) - gridMidpoint.x;
      const y = (row * settings.gap) - gridMidpoint.y;

      const arrayIndex = i * 3;

      positions[arrayIndex] = x;
      positions[arrayIndex + 1] = y;
      positions[arrayIndex + 2] = 0;

      anchors[arrayIndex] = x;
      anchors[arrayIndex + 1] = y;
      anchors[arrayIndex + 2] = 0;

      const color = new THREE.Color().setHSL(0, 1.0, 1.0);
      colors[arrayIndex] = color.r;
      colors[arrayIndex + 1] = color.g;
      colors[arrayIndex + 2] = color.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial: THREE.PointsMaterial = new THREE.PointsMaterial({
      size: 0.08,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true,
      vertexColors: true,
      alphaTest: 0.1
    });
    
    const particleSystem: THREE.Points = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // off screen initially
    const mouse: THREE.Vector2 = new THREE.Vector2(9999999, 9999999);
    const raycaster: THREE.Raycaster = new THREE.Raycaster();

    const geometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      alphaTest: 0.1,
      depthWrite: false,
      blending: THREE.NormalBlending,
    }); 
    const mouseCube = new THREE.Mesh(geometry, material);
    scene.add(mouseCube)

    function onMouseMove(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', onMouseMove, false);

    // helper axes
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const positionsArray = particles.attributes.position.array as Float32Array;

      raycaster.setFromCamera(mouse, camera);
      const mouseIntersectPoint: THREE.Vector3 = new THREE.Vector3();
      raycaster.ray.at(camera.position.z, mouseIntersectPoint);
      
      // apply forces
      for (let i = 0; i < particleCount; i++) {
        const arrayIndex = i * 3;

        // mouse gravity
        const gForce = gravitationalForce(
          mouseIntersectPoint,
          new THREE.Vector3(positionsArray[arrayIndex], positionsArray[arrayIndex + 1], positionsArray[arrayIndex + 2]),
        )
        velocities[arrayIndex] += gForce.x;
        velocities[arrayIndex + 1] += gForce.y;
        // velocities[arrayIndex + 2] += gForce.z

        // anchor elasticity

        // const entropy = 0.0005;
        // velocities[arrayIndex] += (Math.random() - 0.5) * entropy
        // velocities[arrayIndex + 1] += (Math.random() - 0.5) * entropy
        // velocities[index + 2] += (Math.random() - 0.5) * 0.005
      }

      // update positions
      for (let i = 0; i < particleCount; i++) {
        const arrayIndex = i * 3;
        positionsArray[arrayIndex] += velocities[arrayIndex]
        positionsArray[arrayIndex + 1] += velocities[arrayIndex + 1]
        // positionsArray[index + 2] += velocities[index + 2]
      }

      mouseCube.position.copy(mouseIntersectPoint)

      particles.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);
    };
    animate();

    // handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove, false);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
  );
};

export default ParticleMesh;
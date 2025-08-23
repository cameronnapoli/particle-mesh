'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const particleCount = 100;

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

    // add some basic geometry (e.g. a cube)
    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    const particles: THREE.BufferGeometry = new THREE.BufferGeometry();
    const positions: Float32Array = new Float32Array(particleCount * 3);
    const velocities: Float32Array = new Float32Array(particleCount * 3);
    const colors: Float32Array = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const index = i * 3;

      positions[index] = (Math.random() - 0.5) * 3;
      positions[index + 1] = (Math.random() - 0.5) * 3;
      positions[index + 2] = (Math.random() - 0.5) * 3;

      const hue = 0;
      const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6);
      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
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

    // animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const positionsArray = particles.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;

        velocities[index] += (Math.random() - 0.5) * 0.005
        velocities[index + 1] += (Math.random() - 0.5) * 0.005
        velocities[index + 2] += (Math.random() - 0.5) * 0.005
      }

      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;

        positionsArray[index] += velocities[index]
        positionsArray[index + 1] += velocities[index + 1]
        positionsArray[index + 2] += velocities[index + 2]
      }

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
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
  );
};

export default ParticleMesh;
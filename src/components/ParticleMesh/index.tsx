'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      
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
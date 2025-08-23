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
      positions[index + 2] = 0;

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

    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const mouse: THREE.Vector2 = new THREE.Vector2();
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
      
      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        velocities[index] += (Math.random() - 0.5) * 0.005
        velocities[index + 1] += (Math.random() - 0.5) * 0.005
        // velocities[index + 2] += (Math.random() - 0.5) * 0.005
      }

      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        positionsArray[index] += velocities[index]
        positionsArray[index + 1] += velocities[index + 1]
        positionsArray[index + 2] += velocities[index + 2]
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
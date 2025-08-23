'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gravitationalForce, elasticForce } from './forces';
import ParticleSettings from './settings';
import Stats from 'stats.js'

let stats: Stats | null = null;

// TODO: update 3d to 2d vects
// TODO: canvas width/height update

const settings = new ParticleSettings()

const ParticleMesh: React.FunctionComponent = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    stats = new Stats()
    stats.showPanel(0)
    document.body.appendChild(stats.dom)
    return () => {
      document.body.removeChild(stats!.dom)
    }
  }, [])

  useEffect(() => {
    if (!mountRef.current) return;

    // initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1a1a)

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
    const positions: Float32Array = new Float32Array(settings.getParticleCount() * 3);
    const anchors: Float32Array = new Float32Array(settings.getParticleCount() * 3);
    const velocities: Float32Array = new Float32Array(settings.getParticleCount() * 3);
    const colors: Float32Array = new Float32Array(settings.getParticleCount() * 3);

    for (let i = 0; i < settings.getParticleCount(); i++) {
      const column = Math.floor(i / settings.getRows());
      const row = i % settings.getRows();
      const x = (column * settings.getGap()) - settings.getGridMidpoint().x;
      const y = (row * settings.getGap()) - settings.getGridMidpoint().y;

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
      size: 0.1,
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
      stats?.begin();

      animationFrameRef.current = requestAnimationFrame(animate);

      const positionsArray = particles.attributes.position.array as Float32Array;

      raycaster.setFromCamera(mouse, camera);
      const mouseIntersectPoint: THREE.Vector3 = new THREE.Vector3();
      raycaster.ray.at(camera.position.z, mouseIntersectPoint);
      
      // apply forces
      for (let i = 0; i < settings.getParticleCount(); i++) {
        const arrayIndex = i * 3;

        const anchorPosition = new THREE.Vector3(anchors[arrayIndex], anchors[arrayIndex + 1], anchors[arrayIndex + 2]);
        const particlePosition = new THREE.Vector3(positionsArray[arrayIndex], positionsArray[arrayIndex + 1], positionsArray[arrayIndex + 2]);

        // mouse gravity
        const gForce = gravitationalForce(mouseIntersectPoint, particlePosition)
        velocities[arrayIndex] += gForce.x;
        velocities[arrayIndex + 1] += gForce.y;
        velocities[arrayIndex + 2] += gForce.z;

        // anchor elasticity
        const particleVelocity = new THREE.Vector3(
          velocities[arrayIndex],
          velocities[arrayIndex + 1],
          velocities[arrayIndex + 2],
        )
        const eForce = elasticForce(anchorPosition, particlePosition, particleVelocity)
        velocities[arrayIndex] += eForce.x;
        velocities[arrayIndex + 1] += eForce.y;
        velocities[arrayIndex + 2] += eForce.z;
      }

      // update positions
      for (let i = 0; i < settings.getParticleCount(); i++) {
        const arrayIndex = i * 3;
        positionsArray[arrayIndex] += velocities[arrayIndex]
        positionsArray[arrayIndex + 1] += velocities[arrayIndex + 1]
        positionsArray[arrayIndex + 2] += velocities[arrayIndex + 2]
      }

      mouseCube.position.copy(mouseIntersectPoint)

      particles.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);

      stats?.end()
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
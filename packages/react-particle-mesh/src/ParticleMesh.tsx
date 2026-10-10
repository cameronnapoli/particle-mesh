'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { HydratedConfig, withConfig } from './config';
import { gravity, elasticity } from './forces';

const ParticleMeshCanvas: React.FunctionComponent<HydratedConfig> = (config) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // read by the animation loop so prop changes apply without rebuilding the scene
  const liveConfigRef = useRef(config);
  liveConfigRef.current = config;

  useEffect(() => {
    if (!mountRef.current) return;

    // initialize Three.js scene
    const scene = new THREE.Scene();
    let backgroundColor = config.backgroundColor;
    scene.background = new THREE.Color(backgroundColor);

    // create camera; 1 world unit = 1 CSS px
    const camera = new THREE.OrthographicCamera(
      -config.width / 2,
      config.width / 2,
      -config.height / 2,
      config.height / 2,
      1,
      100,
    );

    // create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(config.width, config.height);
    const mountContainer = mountRef.current;
    const canvasElement = renderer.domElement;
    canvasElement.style.display = 'block'; // inline canvases add a descender gap below
    mountContainer.appendChild(canvasElement);

    // create particles
    const particles: THREE.BufferGeometry = new THREE.BufferGeometry();
    const positions: Float32Array = new Float32Array(config.count * 3);
    const anchors: Float32Array = new Float32Array(config.count * 3);
    const velocities: Float32Array = new Float32Array(config.count * 3);
    const colors: Float32Array = new Float32Array(config.count * 3);

    for (let i = 0; i < config.count; i++) {
      const particlePosition = config.particlePosition(i);
      const arrayIndex = i * 3;

      positions[arrayIndex] = particlePosition.x;
      positions[arrayIndex + 1] = particlePosition.y;
      positions[arrayIndex + 2] = particlePosition.z;

      anchors[arrayIndex] = particlePosition.x;
      anchors[arrayIndex + 1] = particlePosition.y;
      anchors[arrayIndex + 2] = particlePosition.z;

      const color = new THREE.Color(config.particleColor(i));
      colors[arrayIndex] = color.r;
      colors[arrayIndex + 1] = color.g;
      colors[arrayIndex + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial: THREE.PointsMaterial = new THREE.PointsMaterial({
      size: config.particleSize,
      vertexColors: true,
    });

    const particleSystem: THREE.Points = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // add listeners
    const mousePosition: THREE.Vector3 = new THREE.Vector3(9999999, 9999999, 0);
    function onPointerMove(event: PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();
      mousePosition.x = event.clientX - rect.left - config.width / 2;
      mousePosition.y = event.clientY - rect.top - config.height / 2;
    }
    const resetPointer = () => mousePosition.set(9999999, 9999999, 0);
    const onPointerEnd = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') resetPointer();
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
    document.addEventListener('mouseleave', resetPointer);

    // debug
    let debugCursor: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial> | null = null;
    if (config.debug) {
      debugCursor = new THREE.Mesh(
        new THREE.CircleGeometry(6),
        new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide }),
      );
      debugCursor.position.z = 1;
      scene.add(debugCursor);
    }

    // scratch vectors reused every frame
    const anchorPosition = new THREE.Vector3();
    const particlePosition = new THREE.Vector3();
    const particleVelocity = new THREE.Vector3();
    const gForce = new THREE.Vector3();
    const eForce = new THREE.Vector3();

    // animation loop
    const animate = () => {
      const live = liveConfigRef.current;
      const positionsArray = particles.attributes.position.array as Float32Array;

      if (live.backgroundColor !== backgroundColor) {
        backgroundColor = live.backgroundColor;
        if (scene.background instanceof THREE.Color) {
          scene.background.set(backgroundColor);
        }
      }
      particleMaterial.size = live.particleSize;

      // apply forces
      for (let i = 0; i < config.count; i++) {
        const arrayIndex = i * 3;

        anchorPosition.fromArray(anchors, arrayIndex);
        particlePosition.fromArray(positionsArray, arrayIndex);
        particleVelocity.fromArray(velocities, arrayIndex);

        // mouse gravity
        gravity(
          mousePosition,
          particlePosition,
          live.mouseGravityStrength,
          live.mouseGravityRadius,
          gForce,
        );

        // anchor elasticity
        elasticity(
          anchorPosition,
          particlePosition,
          particleVelocity,
          live.anchorSpringConstant,
          live.anchorDampingConstant,
          eForce,
        );

        velocities[arrayIndex] += gForce.x + eForce.x;
        velocities[arrayIndex + 1] += gForce.y + eForce.y;
        velocities[arrayIndex + 2] += gForce.z + eForce.z;
      }

      // update positions
      for (let i = 0; i < config.count; i++) {
        const arrayIndex = i * 3;
        positionsArray[arrayIndex] += velocities[arrayIndex];
        positionsArray[arrayIndex + 1] += velocities[arrayIndex + 1];
        positionsArray[arrayIndex + 2] += velocities[arrayIndex + 2];
      }

      particles.attributes.position.needsUpdate = true;

      debugCursor?.position.set(mousePosition.x, mousePosition.y, 1);

      renderer.render(scene, camera);

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      mountContainer.removeChild(canvasElement);
      particles.dispose();
      particleMaterial.dispose();
      debugCursor?.geometry.dispose();
      debugCursor?.material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      document.removeEventListener('mouseleave', resetPointer);
    };
    // structural options (size, count, debug) remount this component via withConfig
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={mountRef} />
  );
};

export const ParticleMesh = withConfig(ParticleMeshCanvas);

'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { HydratedConfig, withConfig } from './config';
import { gravity, elasticity } from './forces';

const ParticleMeshCanvas: React.FunctionComponent<HydratedConfig> = (config) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.backgroundColor);

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
    function onMouseMove(event: MouseEvent) {
      const rect = canvasElement.getBoundingClientRect();
      mousePosition.x = event.clientX - rect.left - config.width / 2;
      mousePosition.y = event.clientY - rect.top - config.height / 2;
    }
    window.addEventListener('mousemove', onMouseMove, false);
    const onMouseLeave = () => mousePosition.set(9999999, 9999999, 0);
    document.addEventListener('mouseleave', onMouseLeave);

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

    // animation loop
    const animate = () => {
      const positionsArray = particles.attributes.position.array as Float32Array;

      // apply forces
      for (let i = 0; i < config.count; i++) {
        const arrayIndex = i * 3;

        const anchorPosition = new THREE.Vector3(anchors[arrayIndex], anchors[arrayIndex + 1], anchors[arrayIndex + 2]);
        const particlePosition = new THREE.Vector3(positionsArray[arrayIndex], positionsArray[arrayIndex + 1], positionsArray[arrayIndex + 2]);

        const particleVelocity = new THREE.Vector3(
          velocities[arrayIndex],
          velocities[arrayIndex + 1],
          velocities[arrayIndex + 2],
        );

        // mouse gravity
        const gForce = gravity(
          mousePosition,
          particlePosition,
          config.mouseGravityStrength,
          config.mouseGravityRadius,
        );

        // anchor elasticity
        const eForce = elasticity(
          anchorPosition,
          particlePosition,
          particleVelocity,
          config.anchorSpringConstant,
          config.anchorDampingConstant,
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
      window.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={mountRef} />
  );
};

export const ParticleMesh = withConfig(ParticleMeshCanvas);

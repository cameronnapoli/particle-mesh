'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { HydratedConfig, withConfig } from './config';
import { gravity, elasticity } from './forces';

export const ParticleMesh: React.FunctionComponent<HydratedConfig> = (config) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const { width, height } = config;

    // initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.backgroundColor);

    // create camera; 1 world unit = 1 CSS px
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      -height / 2,
      height / 2,
      1,
      100,
    );

    // create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);

    const mountContainer = mountRef.current;
    const canvasElement = renderer.domElement;
    mountContainer.appendChild(canvasElement);

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
      size: 5.0,
      vertexColors: true,
    });

    const particleSystem: THREE.Points = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const mouse: THREE.Vector2 = new THREE.Vector2(9999999, 9999999);
    const raycaster: THREE.Raycaster = new THREE.Raycaster();

    function onMouseMove(event: MouseEvent) {
      const rect = canvasElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    }
    window.addEventListener('mousemove', onMouseMove, false);

    // animation loop
    const animate = () => {
      const positionsArray = particles.attributes.position.array as Float32Array;

      raycaster.setFromCamera(mouse, camera);
      const mouseIntersectPoint: THREE.Vector3 = new THREE.Vector3();
      raycaster.ray.at(camera.position.z, mouseIntersectPoint);

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
          mouseIntersectPoint,
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
      renderer.dispose();
      renderer.forceContextLoss();
      window.removeEventListener('mousemove', onMouseMove, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={mountRef} />
  );
};

export const ParticleMeshWithConfig = withConfig(ParticleMesh)

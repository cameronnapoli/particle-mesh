'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gravitationalForce, elasticForce } from './forces';
import { WithSettingsProps, withSettings } from './settings';
import { useStats } from './useStats';

const ParticleMesh: React.FunctionComponent<WithSettingsProps> = ({ settings }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stats = useStats()

  useEffect(() => {
    if (!mountRef.current) return;

    // initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xdddddd)

    // create camera
    const camera = new THREE.OrthographicCamera(
      -settings.width / 2,
      settings.width / 2,
      -settings.height / 2,
      settings.height / 2,
      1,
      100,
    );

    // create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(settings.width, settings.height);
    // renderer.setClearColor(0x000000);
    rendererRef.current = renderer;

    const mountContainer = mountRef.current
    const canvasElement = renderer.domElement;
    mountContainer.appendChild(canvasElement);

    const particles: THREE.BufferGeometry = new THREE.BufferGeometry();
    const positions: Float32Array = new Float32Array(settings.count * 3);
    const anchors: Float32Array = new Float32Array(settings.count * 3);
    const velocities: Float32Array = new Float32Array(settings.count * 3);
    const colors: Float32Array = new Float32Array(settings.count * 3);

    for (let i = 0; i < settings.count; i++) {
      const particlePosition = settings.findParticlePosition(i);
      const arrayIndex = i * 3;

      positions[arrayIndex] = particlePosition.x;
      positions[arrayIndex + 1] = particlePosition.y;
      positions[arrayIndex + 2] = particlePosition.z;

      anchors[arrayIndex] = particlePosition.x;
      anchors[arrayIndex + 1] = particlePosition.y;
      anchors[arrayIndex + 2] = particlePosition.z;

      const color = new THREE.Color(0, 0, 0)
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

    const mouseCube = new THREE.Mesh(
      new THREE.BoxGeometry(15.0, 15.0, 15.0),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.3,
        alphaTest: 0.1,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    );
    const mouseCircle = new THREE.Mesh(
      new THREE.CircleGeometry(settings.mouseGravityRadiusPx, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        alphaTest: 0.05,
      })
    )
    mouseCircle.position.z = -0.1;
    scene.add(mouseCube)
    scene.add(mouseCircle)

    function onMouseMove(event: MouseEvent) {
      mouse.x = (event.clientX / settings.width) * 2 - 1;
      mouse.y = -(event.clientY / settings.height) * 2 + 1;
    }
    window.addEventListener('mousemove', onMouseMove, false);

    // helper axes
    // const axesHelper = new THREE.AxesHelper(Math.min(settings.cameraNormalX, settings.cameraNormalY));
    // scene.add(axesHelper);

    // animation loop
    const animate = () => {
      stats.current?.begin();

      const positionsArray = particles.attributes.position.array as Float32Array;

      raycaster.setFromCamera(mouse, camera);
      const mouseIntersectPoint: THREE.Vector3 = new THREE.Vector3();
      raycaster.ray.at(camera.position.z, mouseIntersectPoint);
      
      // apply forces
      for (let i = 0; i < settings.count; i++) {
        const arrayIndex = i * 3;

        const anchorPosition = new THREE.Vector3(anchors[arrayIndex], anchors[arrayIndex + 1], anchors[arrayIndex + 2]);
        const particlePosition = new THREE.Vector3(positionsArray[arrayIndex], positionsArray[arrayIndex + 1], positionsArray[arrayIndex + 2]);

        // mouse gravity
        const gForce = gravitationalForce(
          mouseIntersectPoint,
          particlePosition,
          settings.mouseGravityStrength,
          settings.mouseGravityRadiusPx,
        )
        velocities[arrayIndex] += gForce.x;
        velocities[arrayIndex + 1] += gForce.y;
        velocities[arrayIndex + 2] += gForce.z;

        // anchor elasticity
        const particleVelocity = new THREE.Vector3(
          velocities[arrayIndex],
          velocities[arrayIndex + 1],
          velocities[arrayIndex + 2],
        )
        const eForce = elasticForce(
          anchorPosition,
          particlePosition,
          particleVelocity,
          settings.springConstant,
          settings.dampingConstant,
        )
        velocities[arrayIndex] += eForce.x;
        velocities[arrayIndex + 1] += eForce.y;
        velocities[arrayIndex + 2] += eForce.z;
      }

      // update positions
      for (let i = 0; i < settings.count; i++) {
        const arrayIndex = i * 3;
        positionsArray[arrayIndex] += velocities[arrayIndex]
        positionsArray[arrayIndex + 1] += velocities[arrayIndex + 1]
        positionsArray[arrayIndex + 2] += velocities[arrayIndex + 2]
      }

      mouseCube.position.copy(mouseIntersectPoint)
      mouseCircle.position.copy(mouseIntersectPoint)

      particles.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);
      
      animationFrameRef.current = requestAnimationFrame(animate);

      stats.current?.end()
    };
    animate();

    // handle window resize
    const handleResize = () => {
      // TODO: reset settings
      // camera.aspect = settings.width / settings.height;
      // camera.updateProjectionMatrix();
      // renderer.setSize(settings.width, settings.height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      mountContainer.removeChild(canvasElement);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove, false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={mountRef} />
  );
};

export default withSettings(ParticleMesh);

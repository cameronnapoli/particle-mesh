'use client';
import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

// import styles from './styles.module.css';

interface Box {
  id: string;
  position: [number, number, number];
}

function BoxComponent(props: { position: [number, number, number] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meshRef = useRef<any>(null)
  const [hovered, setHover] = useState(false)
  const [size, setSize] = useState(1)

  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (meshRef.current.rotation.x += delta))

  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={size}
      onClick={() => setSize((prev) => {
        const next = prev * 1.2;
        if (next > 5) {
          return 0.5;
        }
        return next;
      })}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

const ParticleMesh: React.FunctionComponent = () => {
  const [boxes] = useState<Box[]>([
    { id: 'dflt1', position: [-1.5, 0, 0] },
    { id: 'dflt2', position: [1.5, 0, 0] },
  ])

  return (
    <Canvas
      style={{
        border: '1px solid #00000011',
        width: 'calc(100vw / 2)',
        height: 'calc(100vh / 2)',
      }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      {boxes.map((box) => (
        <BoxComponent key={box.id} position={box.position} />
      ))}
    </Canvas>
  );
};

export default ParticleMesh;

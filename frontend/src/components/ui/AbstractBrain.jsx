"use client";
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Icosahedron, Sphere } from '@react-three/drei';

function NeuralCore() {
  const coreRef = useRef();
  const outerRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.x = time * 0.2;
      coreRef.current.rotation.y = time * 0.3;
    }
    if (outerRef.current) {
      outerRef.current.rotation.x = time * -0.1;
      outerRef.current.rotation.y = time * -0.15;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.05;
      particlesRef.current.position.y = Math.sin(time) * 0.1;
    }
  });

  return (
    <group>
      {/* Inner Glowing Core */}
      <Icosahedron ref={coreRef} args={[1, 2]} scale={1.2}>
        <meshStandardMaterial 
          color="#00f2fe" 
          emissive="#00f2fe" 
          emissiveIntensity={1.5} 
          wireframe={true} 
        />
      </Icosahedron>

      {/* Outer Data Shell */}
      <Icosahedron ref={outerRef} args={[1.5, 4]} scale={1.2}>
        <meshStandardMaterial 
          color="#667eea" 
          emissive="#667eea" 
          emissiveIntensity={0.2} 
          wireframe={true} 
          transparent={true} 
          opacity={0.3} 
        />
      </Icosahedron>

      {/* Orbiting Memory Orbs */}
      <group ref={particlesRef}>
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 2.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = Math.sin(angle * 3) * 0.5;

          return (
            <Sphere key={i} args={[0.05, 16, 16]} position={[x, y, z]}>
              <meshBasicMaterial color="#00f2fe" />
            </Sphere>
          );
        })}
      </group>
    </group>
  );
}

export default function AbstractBrain() {
  return (
    <div style={{ width: '100%', height: '100%', cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2fe" />
        <NeuralCore />
        <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={false} />
      </Canvas>
    </div>
  );
}

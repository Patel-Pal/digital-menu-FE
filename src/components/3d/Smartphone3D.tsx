import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

export function Smartphone3D() {
  const phoneRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      phoneRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
    }
    
    if (screenRef.current) {
      // Subtle screen glow effect
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={phoneRef}>
      {/* Phone body */}
      <RoundedBox
        args={[1.2, 2.4, 0.15]}
        radius={0.1}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#1f2937" 
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>
      
      {/* Screen */}
      <RoundedBox
        ref={screenRef}
        args={[1.0, 2.0, 0.02]}
        radius={0.05}
        smoothness={4}
        position={[0, 0, 0.08]}
      >
        <meshStandardMaterial 
          color="#000000" 
          emissive="#3b82f6"
          emissiveIntensity={0.2}
          metalness={0.1}
          roughness={0.9}
        />
      </RoundedBox>
      
      {/* Menu items simulation */}
      <Text
        position={[0, 0.6, 0.09]}
        fontSize={0.08}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Digital Menu
      </Text>
      
      {/* Menu item cards */}
      {[-0.4, -0.1, 0.2, 0.5].map((y, index) => (
        <RoundedBox
          key={index}
          args={[0.8, 0.15, 0.01]}
          radius={0.02}
          position={[0, y, 0.09]}
        >
          <meshStandardMaterial 
            color="#f3f4f6" 
            transparent
            opacity={0.9}
          />
        </RoundedBox>
      ))}
      
      {/* Home indicator */}
      <RoundedBox
        args={[0.2, 0.03, 0.01]}
        radius={0.015}
        position={[0, -1.05, 0.09]}
      >
        <meshStandardMaterial 
          color="#6b7280" 
          transparent
          opacity={0.6}
        />
      </RoundedBox>
    </group>
  );
}

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export function MenuShowcase3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const menuItems = [
    { name: 'Margherita Pizza', price: '$12.99', color: '#ef4444' },
    { name: 'Caesar Salad', price: '$8.99', color: '#10b981' },
    { name: 'Grilled Salmon', price: '$18.99', color: '#f59e0b' },
    { name: 'Chocolate Cake', price: '$6.99', color: '#8b5cf6' },
  ];

  return (
    <group ref={groupRef}>
      {menuItems.map((item, index) => {
        const y = (menuItems.length - 1 - index) * 0.8 - 1;
        
        return (
          <Float
            key={index}
            speed={1 + index * 0.2}
            rotationIntensity={0.1}
            floatIntensity={0.2}
            position={[0, y, index * 0.1]}
          >
            {/* Card Background */}
            <RoundedBox
              args={[3, 0.6, 0.05]}
              radius={0.05}
              position={[0, 0, 0]}
            >
              <meshStandardMaterial 
                color="#ffffff" 
                metalness={0.1}
                roughness={0.8}
              />
            </RoundedBox>
            
            {/* Color accent */}
            <RoundedBox
              args={[0.1, 0.6, 0.06]}
              radius={0.02}
              position={[-1.45, 0, 0.001]}
            >
              <meshStandardMaterial 
                color={item.color}
                metalness={0.3}
                roughness={0.7}
              />
            </RoundedBox>
            
            {/* Item name */}
            <Text
              position={[-0.5, 0.1, 0.03]}
              fontSize={0.12}
              color="#1f2937"
              anchorX="left"
              anchorY="middle"
              maxWidth={2}
            >
              {item.name}
            </Text>
            
            {/* Price */}
            <Text
              position={[1.2, 0, 0.03]}
              fontSize={0.1}
              color={item.color}
              anchorX="right"
              anchorY="middle"
              font="/fonts/inter-bold.woff"
            >
              {item.price}
            </Text>
            
            {/* Subtle glow effect */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[3.2, 0.8]} />
              <meshBasicMaterial 
                color={item.color}
                transparent
                opacity={0.05}
              />
            </mesh>
          </Float>
        );
      })}
      
      {/* Menu header */}
      <Float
        speed={0.5}
        rotationIntensity={0.05}
        floatIntensity={0.1}
        position={[0, 2.5, 0]}
      >
        <RoundedBox
          args={[3, 0.8, 0.08]}
          radius={0.08}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial 
            color="#3b82f6" 
            metalness={0.3}
            roughness={0.7}
          />
        </RoundedBox>
        
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          Digital Menu
        </Text>
      </Float>
    </group>
  );
}

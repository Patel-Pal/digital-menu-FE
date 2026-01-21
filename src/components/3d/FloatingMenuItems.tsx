import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function FloatingMenuItems() {
  const groupRef = useRef<THREE.Group>(null);
  const itemRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    
    itemRefs.current.forEach((item, index) => {
      if (item) {
        const time = state.clock.elapsedTime;
        item.position.y = Math.sin(time * 0.8 + index * 0.8) * 0.3;
        item.rotation.z = Math.sin(time * 0.5 + index * 0.5) * 0.1;
      }
    });
  });

  const menuItems = [
    { name: 'Pizza', color: '#ef4444', emoji: '🍕' },
    { name: 'Burger', color: '#f59e0b', emoji: '🍔' },
    { name: 'Coffee', color: '#8b5cf6', emoji: '☕' },
    { name: 'Salad', color: '#10b981', emoji: '🥗' },
    { name: 'Pasta', color: '#f97316', emoji: '🍝' },
    { name: 'Sushi', color: '#06b6d4', emoji: '🍣' },
  ];

  return (
    <group ref={groupRef}>
      {menuItems.map((item, index) => {
        const angle = (index / menuItems.length) * Math.PI * 2;
        const radius = 2.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group
            key={index}
            ref={(el) => {
              if (el) itemRefs.current[index] = el;
            }}
            position={[x, 0, z]}
          >
            {/* Card background */}
            <RoundedBox
              args={[0.8, 1.0, 0.05]}
              radius={0.05}
              position={[0, 0, 0]}
            >
              <meshStandardMaterial 
                color="#ffffff" 
                metalness={0.1}
                roughness={0.8}
              />
            </RoundedBox>
            
            {/* Food icon background */}
            <Sphere
              args={[0.2]}
              position={[0, 0.25, 0.03]}
            >
              <meshStandardMaterial 
                color={item.color}
                metalness={0.3}
                roughness={0.7}
              />
            </Sphere>
            
            {/* Food emoji */}
            <Text
              position={[0, 0.25, 0.26]}
              fontSize={0.15}
              anchorX="center"
              anchorY="middle"
            >
              {item.emoji}
            </Text>
            
            {/* Item name */}
            <Text
              position={[0, -0.1, 0.03]}
              fontSize={0.08}
              color="#1f2937"
              anchorX="center"
              anchorY="middle"
              font="/fonts/inter-bold.woff"
            >
              {item.name}
            </Text>
            
            {/* Price */}
            <Text
              position={[0, -0.25, 0.03]}
              fontSize={0.06}
              color="#6b7280"
              anchorX="center"
              anchorY="middle"
            >
              $12.99
            </Text>
            
            {/* Floating particles */}
            <Sphere
              args={[0.02]}
              position={[0.3, 0.4, 0.1]}
            >
              <meshStandardMaterial 
                color={item.color}
                transparent
                opacity={0.6}
              />
            </Sphere>
            
            <Sphere
              args={[0.015]}
              position={[-0.25, 0.3, 0.15]}
            >
              <meshStandardMaterial 
                color={item.color}
                transparent
                opacity={0.4}
              />
            </Sphere>
          </group>
        );
      })}
    </group>
  );
}

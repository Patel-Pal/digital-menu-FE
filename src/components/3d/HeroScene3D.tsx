import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { QRCode3D } from './QRCode3D';
import { Smartphone3D } from './Smartphone3D';
import { FloatingMenuItems } from './FloatingMenuItems';

export function HeroScene3D() {
  const sceneRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (sceneRef.current) {
      // Gentle scene rotation
      sceneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Main QR Code - Center */}
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        position={[0, 0, 0]}
      >
        <QRCode3D />
      </Float>
      
      {/* Smartphone - Right side */}
      <Float
        speed={2}
        rotationIntensity={0.1}
        floatIntensity={0.3}
        position={[3, -0.5, -1]}
      >
        <Smartphone3D />
      </Float>
      
      {/* Floating menu items around */}
      <Float
        speed={0.8}
        rotationIntensity={0.05}
        floatIntensity={0.2}
      >
        <FloatingMenuItems />
      </Float>
      
      {/* Additional decorative elements */}
      <Float
        speed={3}
        rotationIntensity={0.3}
        floatIntensity={0.8}
        position={[-2, 2, -2]}
      >
        <mesh>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.6}
            emissive="#3b82f6"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>
      
      <Float
        speed={2.5}
        rotationIntensity={0.2}
        floatIntensity={0.6}
        position={[2.5, 2.5, -1.5]}
      >
        <mesh>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial 
            color="#10b981" 
            transparent 
            opacity={0.7}
            emissive="#10b981"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
      
      <Float
        speed={1.8}
        rotationIntensity={0.15}
        floatIntensity={0.4}
        position={[-3, -1, -0.5]}
      >
        <mesh>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial 
            color="#f59e0b" 
            transparent 
            opacity={0.5}
            emissive="#f59e0b"
            emissiveIntensity={0.25}
          />
        </mesh>
      </Float>
    </group>
  );
}

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';

export function QRCode3D() {
  const groupRef = useRef<THREE.Group>(null);
  const boxRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    
    // Animate individual boxes
    boxRefs.current.forEach((box, index) => {
      if (box) {
        box.position.z = Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * 0.1;
      }
    });
  });

  // QR Code pattern (simplified)
  const qrPattern = [
    [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0],
    [1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,1],
    [0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0],
    [1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,1],
    [0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0],
    [1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,1],
    [0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0],
    [1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,1],
  ];

  return (
    <group ref={groupRef}>
      {qrPattern.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell === 1) {
            return (
              <Box
                key={`${rowIndex}-${colIndex}`}
                ref={(el) => {
                  if (el) boxRefs.current[rowIndex * 16 + colIndex] = el;
                }}
                position={[
                  (colIndex - 7.5) * 0.2,
                  (7.5 - rowIndex) * 0.2,
                  0
                ]}
                args={[0.18, 0.18, 0.1]}
              >
                <meshStandardMaterial 
                  color="#3b82f6" 
                  metalness={0.3}
                  roughness={0.4}
                />
              </Box>
            );
          }
          return null;
        })
      )}
      
      {/* Base plate */}
      <Box position={[0, 0, -0.1]} args={[3.5, 3.5, 0.05]}>
        <meshStandardMaterial 
          color="#f8fafc" 
          metalness={0.1}
          roughness={0.8}
        />
      </Box>
    </group>
  );
}

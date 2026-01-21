import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';

interface Scene3DProps {
  children: React.ReactNode;
  className?: string;
  enableControls?: boolean;
  cameraPosition?: [number, number, number];
}

export function Scene3D({ 
  children, 
  className = "w-full h-full", 
  enableControls = false,
  cameraPosition = [0, 0, 5]
}: Scene3DProps) {
  return (
    <div className={className}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={50}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Controls */}
        {enableControls && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        )}
        
        {/* Content */}
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}

import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

/**
 * WaterMesh for light / daylight ripples
 */
function WaterMesh({ amplitude = 0.5, speed = 1.3 }) {
  const meshRef = useRef();
  const geomRef = useRef();

  useEffect(() => {
    const geometry = new THREE.PlaneGeometry(15, 15, 128, 128);
    geomRef.current = geometry;
    if (meshRef.current) {
      meshRef.current.geometry = geometry;
      meshRef.current.rotation.x = -Math.PI / 2;
      meshRef.current.position.y = -2.8;
    }
    return () => geometry.dispose();
  }, []);

  // animate via rAF loop inside Canvas (handled by react-three-fiber)
  return (
    <mesh ref={meshRef}>
      <meshStandardMaterial
        color="#b3e5fc"
        emissive="#90caf9"
        emissiveIntensity={0.12}
        metalness={0.5}
        roughness={0.3}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function WaterScene() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "linear-gradient(to bottom, #e3f2fd, #bbdefb)" }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.8} color="#f5faff" />
        <directionalLight position={[5, 10, 5]} intensity={0.7} color="#ffffff" />
        <hemisphereLight skyColor="#bbdefb" groundColor="#e3f2fd" intensity={0.6} />
        <fog attach="fog" args={["#e3f2fd", 10, 25]} />
        <WaterMesh amplitude={0.55} speed={1.4} />
      </Canvas>
    </div>
  );
}

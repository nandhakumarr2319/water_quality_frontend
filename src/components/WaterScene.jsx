import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* -----------------------------------------------------
   ADVANCED OCEAN MATERIAL
----------------------------------------------------- */
function WaterMesh({ amplitude = 0.5, speed = 1.1, tint = "#90c9ff" }) {
  const meshRef = useRef();
  const geomRef = useRef();

  useEffect(() => {
    // Higher resolution plane
    const geometry = new THREE.PlaneGeometry(50, 50, 200, 200);
    geomRef.current = geometry;

    if (meshRef.current) {
      meshRef.current.geometry = geometry;
      meshRef.current.rotation.x = -Math.PI / 2;
      meshRef.current.position.y = -3.0;
    }

    return () => geometry.dispose();
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const geom = geomRef.current;
    if (!geom) return;

    const pos = geom.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Layered waves for realism
      const wave =
        Math.sin(x * 0.25 + t * speed) * amplitude * 0.07 +
        Math.cos(y * 0.35 + t * speed * 0.8) * amplitude * 0.06 +
        Math.sin((x + y) * 0.18 + t * speed * 1.4) * amplitude * 0.04;

      pos.setZ(i, wave);
    }

    pos.needsUpdate = true;

    // Sun shimmer animation
    meshRef.current.material.emissiveIntensity =
      0.13 + Math.sin(t * 0.8) * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <meshStandardMaterial
        color={tint}
        emissive="#4aa8ff"
        emissiveIntensity={0.15}
        metalness={0.65}
        roughness={0.35}
        transparent
        opacity={0.92}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* -----------------------------------------------------
   MAIN SCENE WRAPPER
----------------------------------------------------- */
export default function WaterScene() {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -2,
        background: "linear-gradient(to bottom, #dff3ff, #b5ddff)",
      }}
    >
      <Canvas
        camera={{ position: [0, 6, 12], fov: 60 }}
        shadows
      >
        {/* Lights */}
        <ambientLight intensity={0.7} color="#e7f5ff" />
        <directionalLight
          intensity={1.1}
          position={[8, 12, 5]}
          color="#ffffff"
        />
        <hemisphereLight
          skyColor="#a8d8ff"
          groundColor="#b8e2ff"
          intensity={1}
        />

        {/* Soft fog */}
        <fog attach="fog" args={["#dff3ff", 14, 45]} />

        {/* Main Ocean (disabled on mobile for performance) */}
        {!isMobile && (
          <>
            <WaterMesh amplitude={0.6} speed={1.4} tint="#8fcfff" />
            {/* Parallax second layer for realism */}
            <WaterMesh
              amplitude={0.3}
              speed={0.8}
              tint="#7fcafe"
            />
          </>
        )}
      </Canvas>
    </div>
  );
}

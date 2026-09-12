import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Laptop3D = ({ accentColor }) => {
  const groupRef = useRef();

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1c1c2e',
    roughness: 0.15,
    metalness: 0.95,
  }), []);

  const screenFrameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111122',
    roughness: 0.1,
    metalness: 0.98,
  }), []);

  // Dark screen with code glow
  const screenBgMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#060612',
    roughness: 0.8,
    metalness: 0.0,
    emissive: new THREE.Color('#0a0a2a'),
    emissiveIntensity: 1,
  }), []);

  const neonLineMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: new THREE.Color(accentColor),
    emissiveIntensity: 4,
    roughness: 0,
    metalness: 0,
  }), [accentColor]);

  const codeLine1 = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f97316',
    emissive: new THREE.Color('#f97316'),
    emissiveIntensity: 3,
  }), []);

  const codeLine2 = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c084fc',
    emissive: new THREE.Color('#c084fc'),
    emissiveIntensity: 3,
  }), []);

  const codeLine3 = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#34d399',
    emissive: new THREE.Color('#34d399'),
    emissiveIntensity: 2.5,
  }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.1;
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.06;
  });

  const screenAngle = -0.22;

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[1.0, 1.0, 1.0]}>

      {/* ── SCREEN ASSEMBLY ── */}
      {/* Outer screen bezel */}
      <mesh position={[0, 1.35, -0.04]} rotation={[screenAngle, 0, 0]} material={screenFrameMat}>
        <boxGeometry args={[3.4, 2.15, 0.1]} />
      </mesh>

      {/* Dark screen background */}
      <mesh position={[0, 1.35, 0.02]} rotation={[screenAngle, 0, 0]} material={screenBgMat}>
        <boxGeometry args={[3.1, 1.88, 0.01]} />
      </mesh>

      {/* Code lines on screen */}
      {/* Line 1 — orange (longest) */}
      <mesh position={[-0.25, 1.62, 0.04]} rotation={[screenAngle, 0, 0]} material={codeLine1}>
        <boxGeometry args={[2.0, 0.065, 0.005]} />
      </mesh>
      {/* Line 2 — purple (medium) */}
      <mesh position={[-0.5, 1.38, 0.04]} rotation={[screenAngle, 0, 0]} material={codeLine2}>
        <boxGeometry args={[1.4, 0.065, 0.005]} />
      </mesh>
      {/* Line 3 — green (short) */}
      <mesh position={[-0.6, 1.14, 0.04]} rotation={[screenAngle, 0, 0]} material={codeLine3}>
        <boxGeometry args={[1.0, 0.065, 0.005]} />
      </mesh>
      {/* Dot indicators */}
      <mesh position={[-1.35, 1.62, 0.04]} rotation={[screenAngle, 0, 0]} material={codeLine1}>
        <boxGeometry args={[0.1, 0.065, 0.005]} />
      </mesh>

      {/* Screen glow border */}
      <mesh position={[0, 1.35, 0.015]} rotation={[screenAngle, 0, 0]}>
        <boxGeometry args={[3.12, 1.9, 0.008]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={new THREE.Color(accentColor)}
          emissiveIntensity={0.8}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ── HINGE ── */}
      <mesh position={[0, 0.32, -0.05]}>
        <boxGeometry args={[3.4, 0.1, 0.12]} />
        <meshStandardMaterial color="#0a0a14" metalness={1} roughness={0.05} />
      </mesh>

      {/* ── BASE/KEYBOARD ── */}
      {/* Main base */}
      <mesh position={[0, 0.0, 0.5]} rotation={[-0.06, 0, 0]} material={bodyMat}>
        <boxGeometry args={[3.4, 0.1, 2.3]} />
      </mesh>

      {/* Keyboard deck surface */}
      <mesh position={[0, 0.06, 0.38]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[2.9, 0.005, 1.7]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.9} />
      </mesh>

      {/* Keys hint rows */}
      {[-0.4, -0.1, 0.2, 0.5].map((z, i) => (
        <mesh key={i} position={[0, 0.07, z]} rotation={[-0.06, 0, 0]}>
          <boxGeometry args={[2.4, 0.005, 0.08]} />
          <meshStandardMaterial color="#181830" roughness={0.95} />
        </mesh>
      ))}

      {/* Trackpad */}
      <mesh position={[0, 0.065, 0.88]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[0.9, 0.005, 0.55]} />
        <meshStandardMaterial color="#141428" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Neon bottom glow strip */}
      <mesh position={[0, -0.06, 0.5]} rotation={[-0.06, 0, 0]} material={neonLineMat}>
        <boxGeometry args={[3.38, 0.012, 2.28]} />
      </mesh>

      {/* ── LIGHTS ── */}
      {/* Screen light */}
      <pointLight position={[0, 1.8, 1.5]} intensity={3} color={accentColor} distance={7} decay={2} />
      {/* Under-glow */}
      <pointLight position={[0, -0.5, 0.5]} intensity={2} color={accentColor} distance={5} decay={2} />
      {/* Code color lights */}
      <pointLight position={[0, 1.6, 0.5]} intensity={1} color="#c084fc" distance={3} decay={2} />
    </group>
  );
};

export default Laptop3D;

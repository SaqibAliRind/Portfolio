import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Connection line from badge to laptop center using cylinder geometry
const ConnectionLine = ({ from, to, color }) => {
  const lineRef = useRef();

  const { position, rotation, length } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    // Align cylinder with direction
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const euler = new THREE.Euler().setFromQuaternion(quaternion);

    return { position: [mid.x, mid.y, mid.z], rotation: euler, length: len };
  }, [from, to]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const t = state.clock.getElapsedTime();
    lineRef.current.material.opacity = 0.2 + Math.sin(t * 1.5) * 0.15;
  });

  return (
    <mesh ref={lineRef} position={position} rotation={[rotation.x, rotation.y, rotation.z]}>
      <cylinderGeometry args={[0.008, 0.008, length, 6]} />
      <meshStandardMaterial
        color={color}
        emissive={new THREE.Color(color)}
        emissiveIntensity={3}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

// Tech Icon Badge
const TechBadge = ({ position, color, label, symbol, speed }) => {
  const groupRef = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const initPos = useMemo(() => [...position], []);

  const bgMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0a1a',
    roughness: 0.1,
    metalness: 0.95,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.2,
  }), [color]);

  const borderMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    emissive: new THREE.Color(color),
    emissiveIntensity: 2.5,
    roughness: 0.0,
    metalness: 0.1,
  }), [color]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = initPos[1] + Math.sin(t * speed + offset) * 0.22;
    groupRef.current.rotation.y += 0.006 * speed;
  });

  const S = 0.55; // badge size

  return (
    <group ref={groupRef} position={position}>
      {/* Background face */}
      <mesh material={bgMat}>
        <boxGeometry args={[S, S, S * 0.22]} />
      </mesh>

      {/* Glowing border frame (slightly larger, backside) */}
      <mesh>
        <boxGeometry args={[S + 0.04, S + 0.04, S * 0.18]} />
        <meshStandardMaterial
          color={color}
          emissive={new THREE.Color(color)}
          emissiveIntensity={1.5}
          transparent
          opacity={0.25}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Top/bottom neon edge strips */}
      <mesh position={[0, S / 2, 0]} material={borderMat}>
        <boxGeometry args={[S, 0.03, S * 0.22]} />
      </mesh>
      <mesh position={[0, -S / 2, 0]} material={borderMat}>
        <boxGeometry args={[S, 0.03, S * 0.22]} />
      </mesh>
      <mesh position={[S / 2, 0, 0]} material={borderMat}>
        <boxGeometry args={[0.03, S, S * 0.22]} />
      </mesh>
      <mesh position={[-S / 2, 0, 0]} material={borderMat}>
        <boxGeometry args={[0.03, S, S * 0.22]} />
      </mesh>

      {/* Tech symbol text */}
      <Text
        position={[0, 0.04, S * 0.14]}
        fontSize={0.22}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.008}
        outlineColor={color}
        font={undefined}
      >
        {symbol}
      </Text>

      {/* Label below symbol */}
      <Text
        position={[0, -0.14, S * 0.14]}
        fontSize={0.09}
        color="white"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
        font={undefined}
      >
        {label}
      </Text>

      {/* Point light per badge */}
      <pointLight color={color} intensity={1.5} distance={2.5} decay={2} />
    </group>
  );
};

// Floating particles
const Particles = ({ accentColor }) => {
  const ref = useRef();

  const { geo, mat } = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: accentColor,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    return { geo: geometry, mat: material };
  }, [accentColor]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.01;
  });

  return <points ref={ref} geometry={geo} material={mat} />;
};

const FloatingElements = ({ accentColor }) => {
  // Laptop center point (approximate)
  const laptopCenter = [0, 0.8, 0];

  const techBadges = [
    { pos: [3.0,  1.8,  0.5], color: '#61dafb', label: 'React',   symbol: '⚛',  speed: 0.75 },
    { pos: [-3.0, 1.5,  0.4], color: '#68a063', label: 'Node.js', symbol: 'N',   speed: 0.90 },
    { pos: [3.2, -0.6,  0.8], color: '#f7df1e', label: 'JS',      symbol: 'JS',  speed: 1.05 },
    { pos: [-3.1,-0.4,  0.6], color: '#47a248', label: 'MongoDB', symbol: 'M',   speed: 0.82 },
    { pos: [1.2,  3.0, -0.8], color: '#764abc', label: 'Redux',   symbol: '⚙',   speed: 1.15 },
    { pos: [-1.5,-2.8,  0.4], color: accentColor, label:'Express', symbol: 'Ex', speed: 0.65 },
  ];

  return (
    <>
      {/* Tech icon badges */}
      {techBadges.map((b, i) => (
        <TechBadge
          key={i}
          position={b.pos}
          color={b.color}
          label={b.label}
          symbol={b.symbol}
          speed={b.speed}
        />
      ))}

      {/* Glowing connection lines from each badge to laptop */}
      {techBadges.map((b, i) => (
        <ConnectionLine
          key={`line-${i}`}
          from={b.pos}
          to={laptopCenter}
          color={b.color}
        />
      ))}

      {/* Background star particles */}
      <Particles accentColor={accentColor} />
    </>
  );
};

export default FloatingElements;

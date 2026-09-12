import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useTheme } from '../../../context/ThemeContext';
import Laptop3D from './DeveloperCore';
import FloatingElements from './FloatingElements';
import './HeroScene.css';

const ACCENT_MAP = {
  blue:    '#3b82f6',
  purple:  '#8b5cf6',
  cyan:    '#06b6d4',
  green:   '#10b981',
  orange:  '#f97316',
  pink:    '#ec4899',
  red:     '#ef4444',
  default: '#f97316',
};

const FallbackVisual = () => (
  <div className="hero-visual-fallback">
    <div className="visual-circle-1 fallback-pulse" />
    <div className="visual-circle-2 fallback-pulse" />
    <div className="visual-glass-card">
      <span className="visual-icon">{'</>'}</span>
      <p>Developer Ecosystem</p>
    </div>
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e) { console.warn('WebGL Error:', e); }
  render() {
    if (this.state.hasError) return <FallbackVisual />;
    return this.props.children;
  }
}

const SceneContent = ({ accentColor, reducedMotion }) => (
  <>
    {/* Very dim ambient — let point lights do the work */}
    <ambientLight intensity={0.12} color="#0a0a2a" />

    {/* Key light — cool blue-white from top */}
    <directionalLight position={[3, 8, 4]} intensity={0.8} color="#a0b4ff" />

    {/* Rim light from behind-left */}
    <directionalLight position={[-6, 2, -4]} intensity={0.3} color={accentColor} />

    {/* Floor bounce — very subtle warm */}
    <pointLight position={[0, -4, 2]} intensity={1.5} color={accentColor} distance={12} decay={2} />

    {/* Atmospheric fill — deep purple from far */}
    <pointLight position={[-8, 4, -6]} intensity={0.8} color="#4a2080" distance={20} decay={1} />
    <pointLight position={[8, 4, -6]}  intensity={0.6} color="#2040a0" distance={20} decay={1} />

    <group scale={[0.88, 0.88, 0.88]}>
      <Laptop3D accentColor={accentColor} />
      {!reducedMotion && <FloatingElements accentColor={accentColor} />}
    </group>

    <OrbitControls
      enableZoom={false}
      enablePan={false}
      autoRotate={!reducedMotion}
      autoRotateSpeed={0.35}
      maxPolarAngle={Math.PI / 1.8}
      minPolarAngle={Math.PI / 3.2}
    />
  </>
);

const HeroScene = () => {
  const { accentColor: accentName } = useTheme();
  const accentColor = ACCENT_MAP[accentName] || ACCENT_MAP.orange;

  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch (e) {
      setWebglSupported(false);
    }
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!webglSupported) return <FallbackVisual />;

  return (
    <div
      className="hero-scene-container"
      aria-label="Interactive 3D developer workspace"
      role="img"
    >
      <ErrorBoundary>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.0, 9], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <SceneContent accentColor={accentColor} reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default HeroScene;

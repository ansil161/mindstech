import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition } from '../hooks/useMousePosition';

/* ─── Floating glass panel ─────────────────────────────────────────────── */
function GlassPanel({ position, rotation, scale, speed = 0.4, delay = 0 }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime * speed + delay;
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.3) * 0.08;
    meshRef.current.rotation.y = rotation[1] + Math.cos(t * 0.2) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[1, 1.4, 0.02]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={0.02}
        roughness={0.05}
        transmission={0.96}
        ior={1.5}
        chromaticAberration={0.03}
        color="#ffffff"
        opacity={0.12}
        transparent
      />
    </mesh>
  );
}

/* ─── Animated signal line ──────────────────────────────────────────────── */
function SignalLine({ start, end, color = '#CC0001', speed = 1, delay = 0 }) {
  const ref = useRef();

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      pts.push(
        new THREE.Vector3(
          THREE.MathUtils.lerp(start[0], end[0], t),
          THREE.MathUtils.lerp(start[1], end[1], t) + Math.sin(t * Math.PI) * 0.3,
          THREE.MathUtils.lerp(start[2], end[2], t)
        )
      );
    }
    return pts;
  }, [start, end]);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
  }, [points]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.elapsedTime * speed + delay) % 3) / 3;
    ref.current.material.dashOffset = -t * 2;
    ref.current.material.opacity = 0.3 + Math.sin(t * Math.PI) * 0.4;
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineDashedMaterial
        color={color}
        dashSize={0.3}
        gapSize={0.15}
        transparent
        opacity={0.3}
      />
    </line>
  );
}

/* ─── Particle cloud ────────────────────────────────────────────────────── */
function Particles({ count = 120 }) {
  const ref = useRef();

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      sizes[i] = Math.random() * 0.015 + 0.004;
    }
    return { positions, sizes };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.018;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.009) * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Red accent ring ────────────────────────────────────────────────────── */
function AccentRing() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * 0.08;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.06) * 0.15;
  });
  return (
    <mesh ref={ref} position={[1.5, -0.5, -2]}>
      <torusGeometry args={[1.8, 0.008, 8, 96]} />
      <meshBasicMaterial color="#CC0001" transparent opacity={0.18} />
    </mesh>
  );
}

/* ─── Camera that reacts to mouse ──────────────────────────────────────── */
function MouseCamera() {
  const mouse = useMousePosition({ smooth: true, lerpFactor: 0.04 });
  useFrame(({ camera }) => {
    camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 0.25 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─── Scene content ──────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 6, 3]} intensity={0.4} color="#ffffff" />
      <pointLight position={[-3, 2, 1]} intensity={0.6} color="#CC0001" distance={8} />
      <pointLight position={[3, -2, 2]} intensity={0.3} color="#4466ff" distance={6} />

      <MouseCamera />
      <Particles count={140} />
      <AccentRing />

      {/* Glass panels */}
      <Float speed={0.6} floatIntensity={0.4} rotationIntensity={0.2}>
        <GlassPanel position={[-3.2, 0.8, -3]} rotation={[0.1, 0.3, -0.05]} scale={[1.4, 1.4, 1]} delay={0} />
      </Float>
      <Float speed={0.5} floatIntensity={0.3} rotationIntensity={0.15}>
        <GlassPanel position={[3.0, -0.4, -2.5]} rotation={[-0.05, -0.25, 0.08]} scale={[1, 1, 1]} delay={1.2} />
      </Float>
      <Float speed={0.7} floatIntensity={0.5} rotationIntensity={0.25}>
        <GlassPanel position={[0.4, 1.6, -4]} rotation={[0.15, 0.1, -0.12]} scale={[0.7, 0.7, 1]} delay={2.1} />
      </Float>

      {/* Signal lines */}
      <SignalLine start={[-5, -2, -3]} end={[5, 1, -3]} color="#CC0001" speed={0.6} delay={0} />
      <SignalLine start={[-4, 2, -4]} end={[4, -1.5, -4]} color="#4466ff" speed={0.4} delay={1.5} />
      <SignalLine start={[-3, 0, -2]} end={[3, 0.5, -2]} color="#ffffff" speed={0.8} delay={0.8} />
    </>
  );
}

/* ─── Exported component ─────────────────────────────────────────────────── */
export default function GalleryBackground() {
  return (
    <div className="absolute inset-0 w-full h-full" aria-hidden="true">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}

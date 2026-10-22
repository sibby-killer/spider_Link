"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Vec = [number, number, number];

/** A cylinder stretched between two points — used for the spider legs. */
function Strut({ a, b, radius = 0.075, color = "#e60000" }: { a: Vec; b: Vec; radius?: number; color?: string }) {
  const { position, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const dir = end.clone().sub(start);
    const len = dir.length();
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return { position: mid, quaternion: quat, length: len };
  }, [a, b]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius * 0.7, length, 6]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
    </mesh>
  );
}

function Leg({
  side,
  index,
  hip,
  knee,
  foot,
}: {
  side: number;
  index: number;
  hip: Vec;
  knee: Vec;
  foot: Vec;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.z = Math.sin(t * 0.9 + index * 0.8) * 0.045;
    group.current.rotation.x = Math.sin(t * 0.7 + index * 0.5) * 0.03;
  });

  return (
    <group ref={group}>
      <Strut a={hip} b={knee} radius={0.075} />
      <Strut a={knee} b={foot} radius={0.052} />
      <mesh position={knee}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#b30000" roughness={0.5} />
      </mesh>
    </group>
  );
}

function WifiArcs() {
  const arcs = useMemo(
    () => [
      { radius: 0.62, y: 1.15, delay: 0 },
      { radius: 0.95, y: 1.42, delay: 0.35 },
      { radius: 1.28, y: 1.69, delay: 0.7 },
    ],
    [],
  );
  const materials = useRef<Array<THREE.MeshStandardMaterial | null>>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    materials.current.forEach((material, i) => {
      if (!material) return;
      const pulse = (t * 0.55 + arcs[i].delay) % 1.8;
      material.emissiveIntensity = 0.55 + Math.max(0, Math.sin(pulse * Math.PI * 1.6)) * 2.1;
    });
  });

  return (
    <group>
      {arcs.map((arc, i) => (
        <mesh key={arc.radius} position={[0, arc.y, 0]} rotation={[0, 0, -0.16]}>
          <torusGeometry args={[arc.radius, 0.055, 12, 64, Math.PI * 1.05]} />
          <meshStandardMaterial
            ref={(material) => {
              materials.current[i] = material;
            }}
            color="#e60000"
            emissive="#e60000"
            emissiveIntensity={1}
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function Particles() {
  const group = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 140;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 1.2 + Math.random() * 2.6;
      const angle = Math.random() * Math.PI * 2;
      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] = (Math.random() - 0.5) * 7;
      array[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return array;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.05;
    group.current.position.y = ((t * 0.22) % 1.6) - 0.8;
    const attribute = group.current.geometry.getAttribute("position");
    for (let i = 0; i < attribute.count; i += 1) {
      let y = attribute.getY(i) + delta * (0.12 + (i % 5) * 0.02);
      if (y > 3.5) y = -3.5;
      attribute.setY(i, y);
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={group}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#ff6b6b" transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Backdrop() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.035;
    mesh.current.rotation.x = t * 0.015;
  });

  return (
    <mesh ref={mesh} scale={4.6}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#e60000" wireframe transparent opacity={0.08} />
    </mesh>
  );
}

function Spider() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.18) * 0.45 + t * 0.06;
    group.current.position.y = Math.sin(t * 0.9) * 0.07;
  });

  const legs: Array<{ hip: Vec; knee: Vec; foot: Vec }> = [
    { hip: [0.32, 0.42, 0], knee: [1.05, 1.12, -0.18], foot: [1.62, 1.78, -0.3] },
    { hip: [0.44, 0.12, 0], knee: [1.28, 0.12, -0.22], foot: [1.98, 0.02, -0.36] },
    { hip: [0.44, -0.16, 0], knee: [1.3, -0.58, -0.22], foot: [1.88, -1.02, -0.36] },
    { hip: [0.32, -0.46, 0], knee: [1.08, -1.18, -0.18], foot: [1.5, -1.72, -0.3] },
  ];

  return (
    <group ref={group} scale={0.95} position={[0, 0.15, 0]}>
      <WifiArcs />
      {/* abdomen */}
      <mesh position={[0, -0.62, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.95, 1.7, 7]} />
        <meshStandardMaterial color="#e60000" roughness={0.35} metalness={0.25} flatShading />
      </mesh>
      {/* abdomen highlight */}
      <mesh position={[0, -0.32, 0.44]} rotation={[0.35, 0, 0]}>
        <octahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#ff5a5a" roughness={0.3} metalness={0.3} flatShading />
      </mesh>
      {/* thorax */}
      <mesh position={[0, 0.42, 0]}>
        <octahedronGeometry args={[0.66, 0]} />
        <meshStandardMaterial color="#c20000" roughness={0.4} metalness={0.25} flatShading />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.98, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.26, 0.46, 4]} />
        <meshStandardMaterial color="#e60000" roughness={0.35} metalness={0.2} flatShading />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.12, 0.99, 0.17]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffcccc" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.12, 0.99, 0.17]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffcccc" emissiveIntensity={0.6} />
      </mesh>
      {legs.map((leg, i) => (
        <group key={`left-${i}`}>
          <Leg
            side={-1}
            index={i}
            hip={[-leg.hip[0], leg.hip[1], leg.hip[2]]}
            knee={[-leg.knee[0], leg.knee[1], leg.knee[2]]}
            foot={[-leg.foot[0], leg.foot[1], leg.foot[2]]}
          />
          <Leg
            side={1}
            index={i + 2}
            hip={[leg.hip[0], leg.hip[1], leg.hip[2]]}
            knee={[leg.knee[0], leg.knee[1], leg.knee[2]]}
            foot={[leg.foot[0], leg.foot[1], leg.foot[2]]}
          />
        </group>
      ))}
    </group>
  );
}

function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const targetX = 0.35 + pointer.x * 0.3;
    const targetY = 0.2 - pointer.y * 0.2;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0.05, 0);
  });
  return null;
}

export default function HeroScene3D() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    if (reduced || small) return;
    setMounted(true);

    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
        <div className="relative">
          <img
            src="/brand/spider-mark.svg"
            alt=""
            width={260}
            height={260}
            className="w-52 animate-float opacity-90 drop-shadow-[0_0_40px_rgba(230,0,0,0.55)] sm:w-64"
          />
          <span className="absolute inset-0 -z-10 m-auto h-40 w-40 rounded-full bg-brand-600/25 blur-3xl" />
        </div>
      </div>
    );
  }

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.35, 9], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={visible ? "always" : "never"}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <pointLight position={[-3, 1.5, 3]} intensity={22} distance={16} color="#ff2b2b" />
      <pointLight position={[3, -2, 2]} intensity={10} distance={14} color="#ffffff" />
      <Backdrop />
      <Particles />
      <Spider />
      <Rig />
    </Canvas>
  );
}

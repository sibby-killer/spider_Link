"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type TechProps = {
  accent: string;
  wave: boolean;
  skin: string;
};

function Technician({ accent, wave, skin }: TechProps) {
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const arm = useRef<THREE.Group>(null);
  const blink = useRef({ timer: 2.4, closing: 0 });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (body.current) {
      body.current.position.y = -1.05 + Math.sin(t * 1.6) * 0.018;
      body.current.rotation.y = Math.sin(t * 0.55) * 0.07;
    }

    if (head.current) {
      const px = state.pointer.x;
      const py = state.pointer.y;
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, px * 0.45, 0.08);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -py * 0.22, 0.08);
    }

    const b = blink.current;
    b.timer -= delta;
    if (b.timer <= 0) {
      b.timer = 2.6 + Math.random() * 3.2;
      b.closing = 0.13;
    }
    b.closing = Math.max(0, b.closing - delta);
    const eyeScale = b.closing > 0 ? 0.18 : 1;
    if (leftEye.current) leftEye.current.scale.y = eyeScale;
    if (rightEye.current) rightEye.current.scale.y = eyeScale;

    if (arm.current) {
      const target = wave ? -2.15 + Math.sin(t * 9) * 0.22 : 0.05;
      arm.current.rotation.z = THREE.MathUtils.lerp(arm.current.rotation.z, target, 0.14);
    }
  });

  return (
    <group ref={body} position={[0, -1.05, 0]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.72, 40]} />
        <meshBasicMaterial color={accent} transparent opacity={0.12} />
      </mesh>

      {/* boots */}
      <mesh position={[-0.17, 0.09, 0.04]}>
        <boxGeometry args={[0.22, 0.14, 0.34]} />
        <meshStandardMaterial color="#232733" roughness={0.7} />
      </mesh>
      <mesh position={[0.17, 0.09, 0.04]}>
        <boxGeometry args={[0.22, 0.14, 0.34]} />
        <meshStandardMaterial color="#232733" roughness={0.7} />
      </mesh>

      {/* legs */}
      <mesh position={[-0.17, 0.44, 0]}>
        <capsuleGeometry args={[0.11, 0.42, 6, 12]} />
        <meshStandardMaterial color="#2c3140" roughness={0.65} />
      </mesh>
      <mesh position={[0.17, 0.44, 0]}>
        <capsuleGeometry args={[0.11, 0.42, 6, 12]} />
        <meshStandardMaterial color="#2c3140" roughness={0.65} />
      </mesh>

      {/* torso / uniform */}
      <mesh position={[0, 1.02, 0]}>
        <capsuleGeometry args={[0.26, 0.38, 8, 16]} />
        <meshStandardMaterial color="#2c3140" roughness={0.6} />
      </mesh>

      {/* hi-vis vest */}
      <mesh position={[0, 1.02, 0.015]}>
        <capsuleGeometry args={[0.275, 0.34, 8, 16]} />
        <meshStandardMaterial color={accent} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.12, 0.16]}>
        <boxGeometry args={[0.46, 0.035, 0.03]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.93, 0.16]}>
        <boxGeometry args={[0.46, 0.035, 0.03]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.35} />
      </mesh>

      {/* shoulders */}
      <mesh position={[-0.34, 1.26, 0]}>
        <sphereGeometry args={[0.12, 14, 12]} />
        <meshStandardMaterial color={accent} roughness={0.55} />
      </mesh>
      <mesh position={[0.34, 1.26, 0]}>
        <sphereGeometry args={[0.12, 14, 12]} />
        <meshStandardMaterial color={accent} roughness={0.55} />
      </mesh>

      {/* resting arm */}
      <group position={[-0.36, 1.24, 0]} rotation={[0, 0, 0.1]}>
        <mesh position={[0, -0.24, 0]}>
          <capsuleGeometry args={[0.075, 0.32, 6, 12]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <sphereGeometry args={[0.085, 14, 12]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
      </group>

      {/* waving arm */}
      <group ref={arm} position={[0.36, 1.24, 0]} rotation={[0, 0, 0.05]}>
        <mesh position={[0, -0.24, 0]}>
          <capsuleGeometry args={[0.075, 0.32, 6, 12]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.48, 0]}>
          <sphereGeometry args={[0.09, 14, 12]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 1.68, 0]}>
        <mesh>
          <sphereGeometry args={[0.29, 24, 20]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>

        {/* ears */}
        <mesh position={[-0.29, 0.01, 0]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>
        <mesh position={[0.29, 0.01, 0]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>

        {/* eyes */}
        <mesh ref={leftEye} position={[-0.1, 0.02, 0.265]}>
          <sphereGeometry args={[0.034, 10, 10]} />
          <meshStandardMaterial color="#171717" roughness={0.4} />
        </mesh>
        <mesh ref={rightEye} position={[0.1, 0.02, 0.265]}>
          <sphereGeometry args={[0.034, 10, 10]} />
          <meshStandardMaterial color="#171717" roughness={0.4} />
        </mesh>

        {/* smile */}
        <mesh position={[0, -0.1, 0.255]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.075, 0.014, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#7a3b2e" roughness={0.5} />
        </mesh>

        {/* hard hat */}
        <mesh position={[0, 0.17, 0]}>
          <sphereGeometry args={[0.315, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={accent} roughness={0.35} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.17, 0.03]}>
          <cylinderGeometry args={[0.34, 0.34, 0.03, 28]} />
          <meshStandardMaterial color={accent} roughness={0.35} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.5]} />
          <meshStandardMaterial color={accent} roughness={0.35} metalness={0.1} />
        </mesh>

        {/* headset mic */}
        <mesh position={[0.24, -0.02, 0.08]} rotation={[0, 0, -0.5]}>
          <capsuleGeometry args={[0.012, 0.16, 4, 8]} />
          <meshStandardMaterial color="#1f232b" roughness={0.5} />
        </mesh>
        <mesh position={[0.2, -0.12, 0.21]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#1f232b" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

const SKIN = ["#8d5524", "#c68642", "#6b3f1d"];

export default function TechnicianScene3D({
  accent,
  wave,
  variant = 0,
}: {
  accent: string;
  wave: boolean;
  variant?: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.05, 3.55], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[2.5, 4, 3.5]} intensity={2.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-1.6, 1.8, 2]} intensity={9} distance={7} color={accent} />
      <Technician accent={accent} wave={wave} skin={SKIN[variant % SKIN.length]} />
    </Canvas>
  );
}

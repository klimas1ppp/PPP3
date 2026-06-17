'use client'

import { useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

type FadeRef = MutableRefObject<number>

// ---- Golden tree billboard (chroma-keyed logo) ----
function TreeBillboard({ fade, compact = false }: { fade: FadeRef; compact?: boolean }) {
  const texture = useLoader(THREE.TextureLoader, '/images/tree-logo.png')
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        map: { value: texture },
        keyColor: { value: new THREE.Color(0.08, 0.2, 0.15) },
        threshold: { value: 0.34 },
        smoothing: { value: 0.07 },
        opacity: { value: 1 },
        glow: { value: 1.18 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D map;
        uniform vec3 keyColor;
        uniform float threshold;
        uniform float smoothing;
        uniform float opacity;
        uniform float glow;
        varying vec2 vUv;
        void main() {
          vec4 c = texture2D(map, vUv);
          float d = distance(c.rgb, keyColor);
          float a = smoothstep(threshold, threshold + smoothing, d);
          if (a <= 0.001) discard;
          gl_FragColor = vec4(c.rgb * glow, a * opacity);
        }
      `,
    })
  }, [texture])

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.opacity.value = fade.current
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      groupRef.current.position.y = Math.sin(t * 0.6) * (compact ? 0.04 : 0.08)
      const base = compact ? 0.62 : 0.85
      const s = base + fade.current * (compact ? 0.08 : 0.15)
      groupRef.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh material={material}>
        <planeGeometry args={compact ? [2.6, 3.15] : [3.45, 4.18]} />
        <primitive object={material} ref={matRef} attach="material" />
      </mesh>
    </group>
  )
}

// ---- 3D orbital rings ----
function Orbits({ fade, compact = false }: { fade: FadeRef; compact?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const rings = useMemo(
    () => [
      { r: 2.7, rot: [1.3, 0.2, 0.1], speed: 0.18, op: 0.55 },
      { r: 3.25, rot: [1.1, -0.5, 0.4], speed: -0.12, op: 0.4 },
      { r: 3.9, rot: [1.5, 0.6, -0.3], speed: 0.08, op: 0.28 },
    ],
    [],
  )

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      child.rotation.z += delta * rings[i].speed
    })
    groupRef.current.scale.setScalar((compact ? 0.55 : 0.8) + fade.current * (compact ? 0.12 : 0.2))
  })

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          rotation={ring.rot as [number, number, number]}
        >
          <torusGeometry args={[ring.r, 0.012, 16, 160]} />
          <meshBasicMaterial
            color="#d8b14a"
            transparent
            opacity={ring.op}
          />
        </mesh>
      ))}
    </group>
  )
}

// ---- Golden particle field ----
function Particles({ fade, count = 700, compact = false }: { fade: FadeRef; count?: number; compact?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.PointsMaterial>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 2.2 + Math.random() * 3.4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = (Math.random() * 2 - 1) * 3.6
      arr[i * 3 + 2] = radius * Math.cos(phi) * 0.6
    }
    return arr
  }, [count])

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04
      const t = state.clock.elapsedTime
      pointsRef.current.position.y = Math.sin(t * 0.3) * 0.1
    }
    if (matRef.current) matRef.current.opacity = (compact ? 0.55 : 0.85) * fade.current
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color="#e7c66a"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ---- Pointer parallax wrapper ----
function ParallaxGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!groupRef.current) return
    const targetX = state.pointer.y * 0.18
    const targetY = state.pointer.x * 0.28
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      0.05,
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      0.05,
    )
  })
  return <group ref={groupRef}>{children}</group>
}

export function TreeScene({ fade, compact = false }: { fade: FadeRef; compact?: boolean }) {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, compact ? 9.5 : 8], fov: compact ? 36 : 42 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[4, 4, 6]} intensity={1.2} color="#e7c66a" />
      <ParallaxGroup>
        <TreeBillboard fade={fade} compact={compact} />
        <Orbits fade={fade} compact={compact} />
        <Particles fade={fade} compact={compact} />
      </ParallaxGroup>
    </Canvas>
  )
}

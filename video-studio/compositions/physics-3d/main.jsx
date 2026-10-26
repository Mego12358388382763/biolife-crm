// 3D physics shot: React Three Fiber + Rapier (gravity, collisions, bounce)
// + postprocessing (bloom, depth of field, vignette, film noise).
//
// Determinism: the canvas never runs its own loop (frameloop="never") and the
// physics world is paused. seek(frame) steps the world in fixed 1/FPS steps up
// to that frame and then renders exactly once, so every render is identical.
// Seeking backwards remounts the world and replays from frame 0.
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider, useRapier } from "@react-three/rapier";
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from "@react-three/postprocessing";
import { registerStudio } from "../studio.js";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const DURATION = 6;
const GOLD = "#e3bd5a";

// Seeded random so every render drops the same bodies in the same places.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Bodies() {
  const bodies = useMemo(() => {
    const rand = mulberry32(7);
    return Array.from({ length: 36 }, (_, i) => ({
      key: i,
      shape: i % 3 === 0 ? "ball" : "box",
      position: [(rand() - 0.5) * 3, 5 + i * 0.45, (rand() - 0.5) * 2],
      rotation: [rand() * Math.PI, rand() * Math.PI, 0],
      glow: i % 7 === 0,
    }));
  }, []);

  return bodies.map((b) => (
    <RigidBody key={b.key} position={b.position} rotation={b.rotation} colliders={b.shape === "ball" ? "ball" : "cuboid"} restitution={0.55} friction={0.6}>
      <mesh castShadow>
        {b.shape === "ball" ? <sphereGeometry args={[0.32, 32, 32]} /> : <boxGeometry args={[0.5, 0.5, 0.5]} />}
        <meshStandardMaterial
          color={b.glow ? GOLD : "#f2efe8"}
          emissive={b.glow ? GOLD : "#000"}
          emissiveIntensity={b.glow ? 2.2 : 0}
          metalness={0.35}
          roughness={0.35}
        />
      </mesh>
    </RigidBody>
  ));
}

function Floor() {
  return (
    <RigidBody type="fixed" restitution={0.4}>
      <CuboidCollider args={[8, 0.1, 8]} position={[0, -0.1, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#17171b" roughness={0.9} />
      </mesh>
    </RigidBody>
  );
}

// Lives inside <Physics> so it can reach the world stepper and the renderer.
function Bridge({ onReady }) {
  const { step } = useRapier();
  const { advance, camera } = useThree();

  useEffect(() => {
    let simulated = 0;
    onReady(async (frame) => {
      while (simulated < frame) {
        step(1 / FPS);
        simulated++;
      }
      // Slow push-in and orbit, driven by the frame number only.
      const t = frame / FPS;
      const angle = 0.6 + t * 0.12;
      const radius = 9 - t * 0.5;
      camera.position.set(Math.sin(angle) * radius, 3.2 + t * 0.15, Math.cos(angle) * radius);
      camera.lookAt(0, 1, 0);
      advance(t * 1000);
      return simulated;
    });
  }, [step, advance, camera, onReady]);

  return null;
}

// The renderer talks to whichever world is currently mounted through these.
let stepper = null;
let waitForWorld = null;
let remountWorld = () => {};
let registered = false;
let current = -1;

function onWorldReady(fn) {
  stepper = fn;
  waitForWorld?.();
  waitForWorld = null;
  if (registered) return;
  registered = true;
  registerStudio({
    width: WIDTH,
    height: HEIGHT,
    fps: FPS,
    duration: DURATION,
    seek: async (frame) => {
      if (frame < current) {
        // Going backwards: rebuild the world and replay from the start.
        await new Promise((resolve) => {
          waitForWorld = resolve;
          remountWorld();
        });
      }
      current = frame;
      await stepper(frame);
    },
  });
}

function Scene() {
  const [run, setRun] = useState(0);
  remountWorld = () => setRun((r) => r + 1);

  return (
    <Canvas
      frameloop="never"
      shadows
      dpr={1}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ fov: 40, position: [0, 3, 9] }}
      style={{ width: WIDTH, height: HEIGHT }}
    >
      <color attach="background" args={["#0d0d10"]} />
      <fog attach="fog" args={["#0d0d10", 10, 22]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 8, 3]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-3, 2, -2]} intensity={25} color={GOLD} />
      <Physics key={run} paused gravity={[0, -9.81, 0]}>
        <Floor />
        <Bodies />
        <Bridge onReady={onWorldReady} />
      </Physics>
      <EffectComposer>
        <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
        <Bloom intensity={1.1} luminanceThreshold={0.6} mipmapBlur />
        <Noise opacity={0.04} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
}

document.documentElement.style.setProperty("--w", `${WIDTH}px`);
document.documentElement.style.setProperty("--h", `${HEIGHT}px`);

createRoot(document.getElementById("root")).render(<Scene />);

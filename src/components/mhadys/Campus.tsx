import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";

/* ---------- shared materials (reused across the whole campus) ---------- */
const M = {
  ground: new THREE.MeshStandardMaterial({ color: "#1b2540", roughness: 0.95 }),
  lawn: new THREE.MeshStandardMaterial({ color: "#2f6b4f", roughness: 1 }),
  road: new THREE.MeshStandardMaterial({ color: "#242a38", roughness: 0.85 }),
  stripe: new THREE.MeshStandardMaterial({ color: "#e8ecf6", roughness: 0.6 }),
  path: new THREE.MeshStandardMaterial({ color: "#c9cfdc", roughness: 0.9 }),
  // Luxury mansion palette
  stone: new THREE.MeshStandardMaterial({ color: "#e9e2d2", roughness: 0.85 }),
  stone2: new THREE.MeshStandardMaterial({ color: "#d9cdb4", roughness: 0.8 }),
  trim: new THREE.MeshStandardMaterial({ color: "#c9a86a", roughness: 0.3, metalness: 0.85 }),
  bronze: new THREE.MeshStandardMaterial({ color: "#6a5233", roughness: 0.35, metalness: 0.75 }),
  bronzeDark: new THREE.MeshStandardMaterial({ color: "#3c3226", roughness: 0.45, metalness: 0.6 }),
  roofm: new THREE.MeshStandardMaterial({ color: "#2b2f3a", roughness: 0.45, metalness: 0.5 }),
  glow: new THREE.MeshStandardMaterial({ color: "#ffdfae", emissive: "#ffc98a", emissiveIntensity: 1.5 }),
  hedge: new THREE.MeshStandardMaterial({ color: "#24483a", roughness: 1 }),
  soil: new THREE.MeshStandardMaterial({ color: "#3a2c22", roughness: 1 }),
  redcarpet: new THREE.MeshStandardMaterial({ color: "#7c2f3e", roughness: 0.9 }),
  glassRoof: new THREE.MeshStandardMaterial({ color: "#bcd2ff", roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.22, depthWrite: false }),
  // interior / service palette (preserved)
  white: new THREE.MeshStandardMaterial({ color: "#eef1f7", roughness: 0.55 }),
  cool: new THREE.MeshStandardMaterial({ color: "#c7cedd", roughness: 0.6 }),
  slab: new THREE.MeshStandardMaterial({ color: "#dfe4ee", roughness: 0.7 }),
  metal: new THREE.MeshStandardMaterial({ color: "#8a93a8", roughness: 0.3, metalness: 0.8 }),
  dark: new THREE.MeshStandardMaterial({ color: "#20263a", roughness: 0.6 }),
  glass: new THREE.MeshStandardMaterial({ color: "#9cc4ff", roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.18, depthWrite: false }),
  indigo: new THREE.MeshStandardMaterial({ color: "#5b6cff", roughness: 0.4, emissive: "#2a2f9a", emissiveIntensity: 0.4 }),
  blue: new THREE.MeshStandardMaterial({ color: "#2f6fe0", roughness: 0.45 }),
  teal: new THREE.MeshStandardMaterial({ color: "#16b39a", roughness: 0.4, emissive: "#0b6b5a", emissiveIntensity: 0.3 }),
  carpet: new THREE.MeshStandardMaterial({ color: "#7a4a8f", roughness: 0.9 }),
  wood: new THREE.MeshStandardMaterial({ color: "#a07450", roughness: 0.8 }),
  cloth: new THREE.MeshStandardMaterial({ color: "#f7f4ee", roughness: 0.9 }),
  carton: new THREE.MeshStandardMaterial({ color: "#c49a64", roughness: 0.85 }),
  belt: new THREE.MeshStandardMaterial({ color: "#303648", roughness: 0.5 }),
  water: new THREE.MeshStandardMaterial({ color: "#5fb4ff", roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.8 }),
  bulb: new THREE.MeshStandardMaterial({ color: "#fff2c4", emissive: "#ffd27a", emissiveIntensity: 2 }),
  brush: new THREE.MeshStandardMaterial({ color: "#3a7bff", roughness: 0.9, emissive: "#1a3c99", emissiveIntensity: 0.3 }),
  leaf: new THREE.MeshStandardMaterial({ color: "#3d7a52", roughness: 0.9 }),
  trunk: new THREE.MeshStandardMaterial({ color: "#5d4230", roughness: 1 }),
  tire: new THREE.MeshStandardMaterial({ color: "#15171f", roughness: 0.8 }),
  flower: new THREE.MeshStandardMaterial({ color: "#f2a7c3", roughness: 0.8 }),
  flowerW: new THREE.MeshStandardMaterial({ color: "#f5efe2", roughness: 0.8 }),
  screen: new THREE.MeshStandardMaterial({ color: "#7fa8ff", emissive: "#4a6dff", emissiveIntensity: 1.2 }),
};
const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 20),
  sphere: new THREE.SphereGeometry(0.5, 14, 10),
  cone: new THREE.ConeGeometry(0.5, 1, 10),
  capsule: new THREE.CapsuleGeometry(0.14, 0.32, 4, 8),
};

/* Hip roof: frustum with unit footprint (x/z -0.5..0.5, y 0..1), rectangular via scale */
const HIP = (() => {
  const b = 0.5;
  const t = 0.15;
  const v = [
    [-b, 0, -b], [b, 0, -b], [b, 0, b], [-b, 0, b],
    [-t, 1, -t], [t, 1, -t], [t, 1, t], [-t, 1, t],
  ];
  const pos: number[] = [];
  const tri = (a: number, c: number, d: number) => {
    for (const i of [a, c, d]) pos.push(v[i]![0], v[i]![1], v[i]![2]);
  };
  // sides (outward-facing) + top
  tri(1, 0, 4); tri(1, 4, 5);
  tri(2, 1, 5); tri(2, 5, 6);
  tri(3, 2, 6); tri(3, 6, 7);
  tri(0, 3, 7); tri(0, 7, 4);
  tri(4, 6, 5); tri(4, 7, 6);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
})();

type V3 = [number, number, number];
const B = ({ p, s, m, r }: { p: V3; s: V3; m: THREE.Material; r?: V3 }) => (
  <mesh geometry={G.box} material={m} position={p} scale={s} rotation={r} castShadow receiveShadow />
);
const HipRoof = ({ p, s, m = M.roofm }: { p: V3; s: V3; m?: THREE.Material }) => (
  <mesh geometry={HIP} material={m} position={p} scale={s} castShadow receiveShadow />
);

/* Lit mansion window: dark reveal + warm glowing pane + bronze mullion */
function Win({ p, w = 1.5, h = 2.2, axis = "z" }: { p: V3; w?: number; h?: number; axis?: "x" | "z" }) {
  return (
    <group position={p} rotation={axis === "x" ? [0, Math.PI / 2, 0] : undefined}>
      <B p={[0, 0, -0.06]} s={[w + 0.22, h + 0.22, 0.14]} m={M.bronzeDark} />
      <B p={[0, 0, 0.01]} s={[w, h, 0.05]} m={M.glow} />
      <B p={[0, 0, 0.03]} s={[0.08, h, 0.04]} m={M.bronze} />
    </group>
  );
}

/* Illuminated facade signage drawn on a local canvas (no remote assets) */
function useSignTexture(text: string, round = false) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = round ? 256 : 192;
    const ctx = c.getContext("2d")!;
    if (round) {
      ctx.beginPath();
      ctx.arc(128, 128, 108, 0, Math.PI * 2);
      ctx.fillStyle = "#241d12";
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#c9a86a";
      ctx.stroke();
      ctx.fillStyle = "#f0dcae";
      ctx.font = "600 150px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("M", 128, 140);
    } else {
      ctx.fillStyle = "#f0dcae";
      ctx.font = "600 118px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 512, 100);
      ctx.fillStyle = "#c9a86a";
      ctx.fillRect(120, 168, 260, 5);
      ctx.fillRect(644, 168, 260, 5);
    }
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }, [text, round]);
}
function FacadeSign({ p, s, text }: { p: V3; s: [number, number]; text: string }) {
  const tex = useSignTexture(text);
  return (
    <mesh position={p} scale={[s[0], s[1], 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}
function Medallion({ p, s }: { p: V3; s: number }) {
  const tex = useSignTexture("M", true);
  return (
    <mesh position={p} scale={[s, s, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

/* ---------- path mover: drives any child along a polyline ---------- */
function Mover({ points, speed, pingpong, offset = 0, children, bob = 0 }: { points: V3[]; speed: number; pingpong?: boolean; offset?: number; bob?: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), !pingpong, "catmullrom", 0), [points, pingpong]);
  const t = useRef(offset);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    t.current += (dt * speed) / curve.getLength();
    const g = ref.current;
    if (!g) return;
    let u = t.current % 1;
    let dir = 1;
    if (pingpong) {
      const w = t.current % 2;
      u = w < 1 ? w : 2 - w;
      dir = w < 1 ? 1 : -1;
    }
    curve.getPointAt(u, g.position);
    curve.getTangentAt(u, tmp).multiplyScalar(dir);
    g.rotation.y = Math.atan2(tmp.x, tmp.z);
    if (bob) g.position.y += Math.abs(Math.sin(t.current * curve.getLength() * 6)) * bob;
  });
  return <group ref={ref}>{children}</group>;
}

/* ---------- people ---------- */
const SHIRTS = ["#f2f4fa", "#5b6cff", "#16b39a", "#f0b45a", "#e66a8a", "#2f6fe0", "#a77bff"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }));
const SKIN = new THREE.MeshStandardMaterial({ color: "#d7a982", roughness: 0.8 });
function Person({ c = 0, work = 0, phase = 0 }: { c?: number; work?: number; phase?: number }) {
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (work && body.current) body.current.rotation.x = Math.sin(clock.elapsedTime * 3 + phase) * work;
  });
  return (
    <group ref={body} scale={0.9}>
      <mesh geometry={G.capsule} material={SHIRTS[c % SHIRTS.length]!} position={[0, 0.3, 0]} castShadow />
      <mesh geometry={G.sphere} material={SKIN} position={[0, 0.68, 0]} scale={0.22} castShadow />
    </group>
  );
}

/* ---------- vehicles ---------- */
const PAINT = ["#e8ecf4", "#c8323a", "#1d2a4a", "#2e7dd6", "#1a1c22", "#d9a23a"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.15, metalness: 0.6 }));
function Car({ c = 0, scale = 1 }: { c?: number; scale?: number }) {
  return (
    <group scale={scale}>
      <B p={[0, 0.35, 0]} s={[0.9, 0.35, 1.9]} m={PAINT[c % PAINT.length]!} />
      <B p={[0, 0.65, -0.1]} s={[0.78, 0.3, 1.0]} m={M.glass} />
      <B p={[0, 0.79, -0.1]} s={[0.76, 0.03, 0.95]} m={PAINT[c % PAINT.length]!} />
      {([[-0.45, 0.6], [0.45, 0.6], [-0.45, -0.6], [0.45, -0.6]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} geometry={G.cyl} material={M.tire} position={[x, 0.18, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.36, 0.14, 0.36]} />
      ))}
    </group>
  );
}
function Truck() {
  return (
    <group>
      <B p={[0, 0.7, -0.6]} s={[1.2, 1.2, 2.6]} m={M.white} />
      <B p={[0, 0.72, -0.6]} s={[1.22, 0.25, 2.62]} m={M.blue} />
      <B p={[0, 0.55, 1.2]} s={[1.1, 0.9, 1]} m={M.blue} />
      <B p={[0, 0.75, 1.71]} s={[0.9, 0.35, 0.02]} m={M.glass} />
      {([[-0.6, 1.2], [0.6, 1.2], [-0.6, -1.4], [0.6, -1.4]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} geometry={G.cyl} material={M.tire} position={[x, 0.2, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.4, 0.16, 0.4]} />
      ))}
    </group>
  );
}

/* ---------- environment props ---------- */
function Tree({ p, s = 1 }: { p: V3; s?: number }) {
  const ref = useRef<THREE.Group>(null);
  const ph = useMemo(() => p[0] * 0.7 + p[2], [p]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + ph) * 0.03;
  });
  return (
    <group position={p} scale={s} ref={ref}>
      <mesh geometry={G.cyl} material={M.trunk} position={[0, 0.5, 0]} scale={[0.16, 1, 0.16]} castShadow />
      <mesh geometry={G.sphere} material={M.leaf} position={[0, 1.55, 0]} scale={[1.15, 1.3, 1.15]} castShadow />
      <mesh geometry={G.sphere} material={M.leaf} position={[0.45, 1.15, 0.3]} scale={[0.7, 0.75, 0.7]} castShadow />
      <mesh geometry={G.sphere} material={M.leaf} position={[-0.4, 1.3, -0.25]} scale={[0.6, 0.65, 0.6]} castShadow />
    </group>
  );
}
function Topiary({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <mesh geometry={G.cyl} material={M.stone2} position={[0, 0.3, 0]} scale={[0.55, 0.6, 0.55]} castShadow />
      <mesh geometry={G.sphere} material={M.hedge} position={[0, 0.95, 0]} scale={[0.6, 0.6, 0.6]} castShadow />
    </group>
  );
}
function Hedge({ p, s }: { p: V3; s: V3 }) {
  return <B p={p} s={s} m={M.hedge} />;
}
function Lamp({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <mesh geometry={G.cyl} material={M.bronzeDark} position={[0, 0.7, 0]} scale={[0.07, 1.4, 0.07]} castShadow />
      <mesh geometry={G.cyl} material={M.trim} position={[0, 1.44, 0]} scale={[0.16, 0.06, 0.16]} />
      <mesh geometry={G.sphere} material={M.bulb} position={[0, 1.58, 0]} scale={0.15} />
    </group>
  );
}
function FlowerBed({ p, s, n = 10 }: { p: V3; s: V3; n?: number }) {
  return (
    <group>
      <B p={p} s={[s[0], 0.16, s[2]]} m={M.soil} />
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} geometry={G.sphere} material={i % 2 ? M.flower : M.flowerW} position={[p[0] - s[0] / 2 + 0.5 + (i * (s[0] - 1)) / (n - 1), p[1] + 0.16, p[2] + (i % 2 ? 0.15 : -0.15)]} scale={0.2} castShadow />
      ))}
    </group>
  );
}
function Fountain({ p }: { p: V3 }) {
  const water = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (water.current) (water.current.material as THREE.MeshStandardMaterial).opacity = 0.65 + Math.sin(clock.elapsedTime * 1.4) * 0.12;
  });
  return (
    <group position={p}>
      <mesh geometry={G.cyl} material={M.stone2} position={[0, 0.25, 0]} scale={[3.1, 0.5, 3.1]} castShadow receiveShadow />
      <mesh ref={water} geometry={G.cyl} material={M.water} position={[0, 0.46, 0]} scale={[2.7, 0.08, 2.7]} />
      <mesh geometry={G.cyl} material={M.stone} position={[0, 0.85, 0]} scale={[0.32, 1, 0.32]} castShadow />
      <mesh geometry={G.cyl} material={M.trim} position={[0, 1.4, 0]} scale={[0.9, 0.14, 0.9]} castShadow />
      <mesh geometry={G.sphere} material={M.bulb} position={[0, 1.6, 0]} scale={0.18} />
    </group>
  );
}

/* ---------- estate grounds: forecourt, gardens, boulevard ---------- */
function makeLawnTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#2c523f";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#274a38" : "#38684e";
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(30, 18);
  return t;
}
function makePavingTexture(rx: number, rz: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#cfc4ab";
  ctx.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#c6bba2" : "#d8cdb5";
    const s = 6 + Math.random() * 10;
    ctx.fillRect(Math.random() * 64, Math.random() * 64, s, s);
  }
  ctx.strokeStyle = "#a99e86";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, rz);
  return t;
}

function ReflectingPool() {
  const water = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (water.current) (water.current.material as THREE.MeshStandardMaterial).opacity = 0.72 + Math.sin(clock.elapsedTime * 1.2) * 0.1;
  });
  return (
    <group>
      <B p={[0, 0.025, 10.15]} s={[8.7, 0.05, 1.15]} m={M.bronzeDark} />
      <mesh ref={water} geometry={G.box} material={M.water} position={[0, 0.055, 10.15]} scale={[8.5, 0.05, 1.05]} />
      <B p={[0, 0.07, 9.6]} s={[8.9, 0.09, 0.16]} m={M.stone2} />
      <B p={[0, 0.07, 10.7]} s={[8.9, 0.09, 0.16]} m={M.stone2} />
      <B p={[-4.42, 0.07, 10.15]} s={[0.16, 0.09, 1.26]} m={M.stone2} />
      <B p={[4.42, 0.07, 10.15]} s={[0.16, 0.09, 1.26]} m={M.stone2} />
    </group>
  );
}

function Ground({ lite }: { lite: boolean }) {
  const lawnMat = useMemo(() => new THREE.MeshStandardMaterial({ map: makeLawnTexture(), roughness: 1 }), []);
  const courtMat = useMemo(() => new THREE.MeshStandardMaterial({ map: makePavingTexture(24, 5), roughness: 0.9 }), []);
  const walkMat = useMemo(() => new THREE.MeshStandardMaterial({ map: makePavingTexture(48, 2), roughness: 0.9 }), []);
  const driveMat = useMemo(() => new THREE.MeshStandardMaterial({ map: makePavingTexture(3, 20), roughness: 0.9 }), []);
  const courtEastMat = useMemo(() => new THREE.MeshStandardMaterial({ map: makePavingTexture(16, 4), roughness: 0.9 }), []);

  const boulevardTrees: V3[] = useMemo(() => Array.from({ length: 11 }, (_, i) => [-45 + i * 9, 0, 17.6]), []);
  const gardenTrees: V3[] = [[-34, 0, 9.6], [-16, 0, 9.6], [17.5, 0, 9.6], [29.5, 0, 9.6], [-13.5, 0, 6.4], [13.5, 0, 6.4]];
  const backTrees: V3[] = [[-30, 0, -15], [-10, 0, -15], [10, 0, -15], [30, 0, -15]];

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} material={lawnMat} receiveShadow>
        <planeGeometry args={[140, 80]} />
      </mesh>
      {/* tree-lined boulevard (south) + rear service road */}
      <B p={[0, 0.05, 14.3]} s={[110, 0.04, 4.2]} m={M.road} />
      <B p={[0, 0.07, 12.25]} s={[110, 0.02, 0.14]} m={M.stone2} />
      <B p={[0, 0.07, 16.35]} s={[110, 0.02, 0.14]} m={M.stone2} />
      <B p={[0, 0.05, -12.5]} s={[110, 0.04, 3]} m={M.road} />
      {Array.from({ length: 26 }, (_, i) => -50 + i * 4).map((x) => (
        <B key={x} p={[x, 0.08, 14.3]} s={[1.6, 0.01, 0.12]} m={M.stripe} />
      ))}
      {/* grand arrival forecourt + promenade */}
      <B p={[0, 0.03, 7.9]} s={[26, 0.05, 5.4]} m={courtMat} />
      <B p={[0, 0.04, 11.5]} s={[86, 0.04, 1.3]} m={walkMat} />
      <ReflectingPool />
      {/* automotive arrival court + drive */}
      <B p={[15.3, 0.04, 8]} s={[2.2, 0.05, 15.5]} m={driveMat} />
      <B p={[23.5, 0.04, 8.6]} s={[17, 0.05, 4.6]} m={courtEastMat} />
      {[18.5, 21.5, 27.5].map((x) => (
        <B key={x} p={[x, 0.07, 8.6]} s={[1.4, 0.01, 0.12]} m={M.stripe} />
      ))}
      {/* events celebration garden */}
      <B p={[-25, 0.03, 8.5]} s={[18, 0.05, 3.4]} m={lawnMat} />
      <Hedge p={[-34.3, 0.43, 8.5]} s={[0.5, 0.8, 3.2]} />
      <Hedge p={[-15.7, 0.43, 8.5]} s={[0.5, 0.8, 3.2]} />
      <FlowerBed p={[-25, 0.43, 6.5]} s={[15, 0.16, 0.9]} n={12} />
      <Fountain p={[-25, 0.03, 8.5]} />
      {!lite && (
        <>
          {[[-33, 0.36, 7.4], [-17, 0.36, 7.4], [-33, 0.36, 9.8], [-17, 0.36, 9.8]].map(([x, y, z], i) => (
            <mesh key={i} geometry={G.cyl} material={M.bronzeDark} position={[x, y + 1.2, z]} scale={[0.07, 2.4, 0.07]} />
          ))}
          <StringLights y={2.7} x0={-33} x1={-17} z={7.4} />
          <StringLights y={2.7} x0={-33} x1={-17} z={9.8} />
          {([[-29, 8.9], [-21, 9.1]] as [number, number][]).map(([x, z], i) => (
            <group key={i} position={[x, 0.05, z]}>
              <mesh geometry={G.cyl} material={M.cloth} position={[0, 0.42, 0]} scale={[1.1, 0.07, 1.1]} castShadow />
              <mesh geometry={G.cyl} material={M.metal} position={[0, 0.2, 0]} scale={[0.09, 0.4, 0.09]} />
              <group position={[0.8, 0, 0]}><Person c={i + 4} /></group>
              <group position={[-0.7, 0, 0.6]}><Person c={i + 1} /></group>
            </group>
          ))}
        </>
      )}
      {/* hedges & screening */}
      <Hedge p={[-9.5, 0.71, 6.1]} s={[5, 0.7, 0.6]} />
      <Hedge p={[9.5, 0.71, 6.1]} s={[5, 0.7, 0.6]} />
      <Hedge p={[2.7, 0.45, 6.9]} s={[3.4, 0.9, 0.6]} />
      <Hedge p={[8.1, 0.45, 6.9]} s={[2.6, 0.9, 0.6]} />
      {[-32, -16, 0, 16, 32].map((x) => (
        <Hedge key={x} p={[x, 0.55, -13.5]} s={[15, 1.1, 0.8]} />
      ))}
      <Topiary p={[-5.6, 0.36, 8.15]} />
      <Topiary p={[5.6, 0.36, 8.15]} />
      {/* estate lighting */}
      {[[11, 10.1], [-11, 10.1], [6, 8.3], [-6, 8.3]].map(([x, z], i) => (
        <Lamp key={i} p={[x, i > 1 ? 0.36 : 0, z]} />
      ))}
      {lite
        ? [-24, 0, 24].map((x) => <Lamp key={x} p={[x, 0, 11.3]} />)
        : [-36, -24, -12, 0, 12, 24, 36].map((x) => <Lamp key={x} p={[x, 0, 11.3]} />)}
      {[[16.5, 10.6], [24, 10.6], [31.5, 10.6], [-22, 7.2], [-28, 7.2]].map(([x, z], i) => (
        <Lamp key={i} p={[x, 0, z]} s={0.85} />
      ))}
      {/* trees */}
      {(lite ? boulevardTrees.slice(0, 6) : boulevardTrees).map((t, i) => (
        <Tree key={`b${i}`} p={t} s={1 + (i % 3) * 0.12} />
      ))}
      {(lite ? gardenTrees.slice(0, 4) : gardenTrees).map((t, i) => (
        <Tree key={`g${i}`} p={t} s={0.85 + (i % 3) * 0.15} />
      ))}
      {(lite ? backTrees.slice(0, 2) : backTrees).map((t, i) => (
        <Tree key={`k${i}`} p={t} s={1} />
      ))}
      {/* boulevard traffic */}
      <Mover points={[[-55, 0.05, 15.4], [55, 0.05, 15.4]]} speed={4} pingpong={false} offset={0.1}>
        <Car c={3} />
      </Mover>
      <Mover points={[[55, 0.05, 13.2], [-55, 0.05, 13.2]]} speed={3.4} offset={0.55}>
        <Car c={1} />
      </Mover>
      {!lite && (
        <Mover points={[[-55, 0.05, 15.4], [55, 0.05, 15.4]]} speed={4} offset={0.6}>
          <Car c={4} />
        </Mover>
      )}
      {/* promenade + garden strollers */}
      {Array.from({ length: lite ? 3 : 7 }, (_, i) => (
        <Mover key={i} points={[[-40, 0.08, 11.5 + (i % 2) * 0.3], [40, 0.08, 11.5 + (i % 2) * 0.3]]} speed={0.9 + (i % 3) * 0.2} pingpong offset={i * 0.29} bob={0.05}>
          <Person c={i} />
        </Mover>
      ))}
      {!lite && (
        <>
          <Mover points={[[-12, 0.08, 9.6], [-5.5, 0.08, 9.6]]} speed={0.6} pingpong offset={0.2} bob={0.04}>
            <Person c={5} />
          </Mover>
          <Mover points={[[5.5, 0.08, 9.6], [12, 0.08, 9.6]]} speed={0.6} pingpong offset={0.7} bob={0.04}>
            <Person c={6} />
          </Mover>
          <Mover points={[[-31, 0.08, 8.2], [-19, 0.08, 8.2]]} speed={0.5} pingpong offset={0.4} bob={0.04}>
            <Person c={2} />
          </Mover>
        </>
      )}
      {/* delivery truck to the commerce docks (screened by hedges) */}
      <Mover points={[[5.6, 0.05, 18], [5.6, 0.05, 7.7]]} speed={1.6} pingpong>
        <group rotation-y={Math.PI}>
          <Truck />
        </group>
      </Mover>
      {/* guest car arriving at the automotive court */}
      <Mover points={[[13.6, 0.05, 15.4], [15.3, 0.05, 12.4], [15.3, 0.05, 6.5], [15.4, 0.05, 2]]} speed={1.2} pingpong>
        <Car c={2} />
      </Mover>
    </group>
  );
}

/* ---------- A. Event Experience Center ---------- */
function StringLights({ y, x0, x1, z }: { y: number; x0: number; x1: number; z: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    ref.current?.children.forEach((c, i) => {
      const m = c as THREE.Mesh;
      m.scale.setScalar(0.14 + Math.sin(clock.elapsedTime * 2 + i) * 0.03);
    });
  });
  const n = 10;
  return (
    <group ref={ref}>
      {Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        return <mesh key={i} geometry={G.sphere} material={M.bulb} position={[x0 + (x1 - x0) * u, y - Math.sin(u * Math.PI) * 0.35, z]} scale={0.14} />;
      })}
    </group>
  );
}

function Pool() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.7 + Math.sin(clock.elapsedTime * 1.5) * 0.1;
  });
  return <mesh ref={ref} geometry={G.box} material={M.water} position={[-24, 9.08, -2.2]} scale={[5, 0.06, 1.6]} />;
}

function EventsEnvironment({ lite }: { lite: boolean }) {
  const x = -24;
  const tables: V3[] = [[-28, 0, -1], [-26, 0, 1.4], [-28, 0, 3], [-30, 0, 1]];
  return (
    <group>
      {/* plinth + floor slabs */}
      <B p={[x, 0.2, 0]} s={[14, 0.4, 11]} m={M.stone2} />
      <B p={[x, 3.6, 0]} s={[13.6, 0.25, 10.6]} m={M.white} />
      <B p={[x, 6.9, 0]} s={[13.6, 0.25, 10.6]} m={M.white} />
      <B p={[x, 9, -1]} s={[13.6, 0.25, 8.6]} m={M.white} />
      {/* back + side solid walls (cutaway front) */}
      <B p={[x, 4.6, -5.2]} s={[13.6, 8.6, 0.25]} m={M.stone} />
      <B p={[x - 6.7, 4.6, 0]} s={[0.25, 8.6, 10.6]} m={M.stone} />
      {/* lit windows on the stone facades */}
      {(!lite ? [2.2, 5.6, 7.8] : [5.6]).map((wy) =>
        [-28.4, -25.6, -22.8, -20].map((wx) => (
          <Win key={`${wy}-${wx}`} p={[wx, wy, -5.36]} w={1.5} h={wy > 7 ? 1.6 : 2.1} />
        )),
      )}
      {(!lite ? [2.2, 5.6] : [5.6]).map((wy) =>
        [-3, 0, 3].map((wz) => (
          <Win key={`l${wy}-${wz}`} p={[-30.86, wy, wz]} w={1.5} h={2.1} axis="x" />
        )),
      )}
      {/* glass front + right */}
      <B p={[x, 4.6, 5.2]} s={[13.6, 8.6, 0.06]} m={M.glass} />
      <B p={[x + 6.7, 4.6, 0]} s={[0.06, 8.6, 10.6]} m={M.glass} />
      {[-6.7, -2.2, 2.2, 6.7].map((dx) => (
        <B key={dx} p={[x + dx, 4.6, 5.2]} s={[0.18, 8.6, 0.18]} m={M.bronze} />
      ))}
      <B p={[x, 8.2, 5.25]} s={[13.6, 0.5, 0.1]} m={M.indigo} />
      {/* grand door + cornice + parapet around the rooftop terrace */}
      <B p={[x, 1.7, 5.26]} s={[2.4, 2.8, 0.08]} m={M.bronzeDark} />
      <B p={[x, 1.7, 5.31]} s={[2.7, 3, 0.06]} m={M.trim} />
      <B p={[x, 8.98, 5.3]} s={[14.2, 0.22, 0.5]} m={M.trim} />
      <B p={[x, 9.4, -5.3]} s={[14.3, 0.8, 0.35]} m={M.stone2} />
      <B p={[x, 9.4, 5.3]} s={[14.3, 0.8, 0.35]} m={M.stone2} />
      <B p={[x - 7, 9.4, 0]} s={[0.35, 0.8, 10.9]} m={M.stone2} />
      <B p={[x + 7, 9.4, 0]} s={[0.35, 0.8, 10.9]} m={M.stone2} />
      {/* warm cove lighting under the floor plates */}
      <B p={[x, 3.43, 4.6]} s={[13, 0.05, 0.5]} m={M.glow} />
      <B p={[x, 3.43, -4.6]} s={[13, 0.05, 0.5]} m={M.glow} />
      <B p={[x, 6.73, 4.6]} s={[13, 0.05, 0.5]} m={M.glow} />

      {/* Ballroom (ground) */}
      <B p={[x - 1, 0.42, 0]} s={[12, 0.04, 9]} m={M.carpet} />
      <B p={[x + 3.8, 0.6, -2.8]} s={[4, 0.35, 2.4]} m={M.wood} />
      <B p={[x + 3.8, 2.2, -4.9]} s={[3.6, 2.6, 0.1]} m={M.indigo} />
      {tables.map((t, i) => (
        <group key={i} position={[t[0], 0.4, t[2]]}>
          <mesh geometry={G.cyl} material={M.cloth} position={[0, 0.45, 0]} scale={[1.3, 0.08, 1.3]} castShadow />
          <mesh geometry={G.cyl} material={M.metal} position={[0, 0.22, 0]} scale={[0.1, 0.45, 0.1]} />
          <mesh geometry={G.sphere} material={M.flower} position={[0, 0.62, 0]} scale={0.28} />
          {[0, 1, 2, 3].map((k) => (
            <group key={k} position={[Math.sin(k * 1.57) * 0.85, 0, Math.cos(k * 1.57) * 0.85]}>
              <Person c={i + k} work={0.05} phase={k} />
            </group>
          ))}
        </group>
      ))}
      {/* servers walking between tables */}
      <Mover points={[[-31, 0.42, -2.5], [-24.5, 0.42, -2.5], [-24.5, 0.42, 3.5], [-31, 0.42, 3.5]]} speed={1.1} bob={0.04}>
        <Person c={0} />
      </Mover>
      {!lite && (
        <Mover points={[[-24, 0.42, 4], [-30.5, 0.42, 4], [-30.5, 0.42, -2], [-24, 0.42, -2]]} speed={0.9} offset={0.4} bob={0.04}>
          <Person c={6} />
        </Mover>
      )}

      {/* Conference hall (level 2) */}
      <B p={[x, 5.0, -4.9]} s={[6, 2.2, 0.08]} m={M.screen} />
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => (
          <group key={`${r}-${c}`} position={[x - 3.75 + c * 1.5, 3.72, -1.6 + r * 1.5]} rotation-y={Math.PI}>
            <B p={[0, 0.2, 0]} s={[0.5, 0.4, 0.5]} m={M.dark} />
            {(r + c) % 3 !== 0 && (
              <group position={[0, 0.25, 0]}>
                <Person c={r * 6 + c} />
              </group>
            )}
          </group>
        )),
      )}
      <Mover points={[[x - 2, 3.73, -3.8], [x + 2, 3.73, -3.8]]} speed={0.6} pingpong>
        <Person c={1} />
      </Mover>

      {/* Rooftop garden terrace */}
      <Pool />
      {[[-29.5, 9.1, 1], [-18.5, 9.1, 1.5], [-29.5, 9.1, -4], [-18.5, 9.1, -4]].map((p, i) => (
        <Tree key={i} p={p as V3} s={0.7} />
      ))}
      {[[-25.5, 9.1, 1.5], [-22.5, 9.1, 1.5]].map((p, i) => (
        <group key={i} position={p as V3}>
          <mesh geometry={G.cyl} material={M.white} position={[0, 0.5, 0]} scale={[0.9, 0.06, 0.9]} />
          <mesh geometry={G.cyl} material={M.metal} position={[0, 0.25, 0]} scale={[0.08, 0.5, 0.08]} />
        </group>
      ))}
      {[-30, -18].map((px) => (
        <B key={px} p={[px, 10.3, 2.8]} s={[0.08, 2.4, 0.08]} m={M.bronze} />
      ))}
      <StringLights y={11.4} x0={-30} x1={-18} z={2.8} />
      {Array.from({ length: lite ? 3 : 6 }, (_, i) => (
        <Mover key={i} points={[[-28.5, 9.13, 0.2], [-19.5, 9.13, 0.2], [-19.5, 9.13, 2.6], [-28.5, 9.13, 2.6]]} speed={0.5} offset={i / 6} bob={0.03}>
          <Person c={i + 2} />
        </Mover>
      ))}
    </group>
  );
}

/* ---------- B. Merchandise Fulfillment Center (Commerce wing) ---------- */
function Conveyor() {
  const boxes = useRef<THREE.Group>(null);
  const rollers = useRef<THREE.Group>(null);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    boxes.current?.children.forEach((b) => {
      b.position.x += dt * 1.4;
      if (b.position.x > 5) b.position.x = -5;
    });
    rollers.current?.children.forEach((r) => (r.rotation.z -= dt * 6));
  });
  return (
    <group position={[0, 0.4, 2]}>
      <B p={[0, 0.5, 0]} s={[10.4, 0.12, 1]} m={M.belt} />
      {[-5, 5].map((x) => (
        <B key={x} p={[x, 0.25, 0]} s={[0.15, 0.5, 1]} m={M.metal} />
      ))}
      <group ref={rollers}>
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={i} geometry={G.cyl} material={M.metal} position={[-5 + i, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.16, 1.02, 0.16]} />
        ))}
      </group>
      <group ref={boxes}>
        {Array.from({ length: 6 }, (_, i) => (
          <B key={i} p={[-5 + i * 1.7, 0.78, 0]} s={[0.6, 0.45, 0.55]} m={M.carton} />
        ))}
      </group>
    </group>
  );
}

function Racks({ lite }: { lite: boolean }) {
  const count = lite ? 3 : 4;
  return (
    <group>
      {Array.from({ length: count }, (_, r) => (
        <group key={r} position={[-5.5 + r * 2.4, 0.4, -3.4]}>
          {[-0.9, 0.9].map((dx) => (
            <B key={dx} p={[dx, 2, 0]} s={[0.08, 4, 1.2]} m={M.blue} />
          ))}
          {[0.1, 1.4, 2.7, 4].map((y) => (
            <group key={y}>
              <B p={[0, y, 0]} s={[1.9, 0.06, 1.2]} m={M.metal} />
              {y < 3.9 &&
                [-0.5, 0.05, 0.55].map((bx, k) => <B key={k} p={[bx, y + 0.35, 0]} s={[0.45, 0.6 - ((k + r) % 2) * 0.15, 0.9]} m={(k + r + y) % 3 < 1 ? M.indigo : M.carton} />)}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function Forklift() {
  const fork = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (fork.current) fork.current.position.y = 0.3 + (Math.sin(clock.elapsedTime * 0.9) * 0.5 + 0.5) * 0.6;
  });
  return (
    <group>
      <B p={[0, 0.45, 0]} s={[0.8, 0.6, 1.1]} m={new THREE.MeshStandardMaterial({ color: "#f0b42e", roughness: 0.5 })} />
      <B p={[0, 1.05, -0.1]} s={[0.7, 0.05, 0.7]} m={M.dark} />
      <B p={[0, 0.9, 0.62]} s={[0.7, 1.4, 0.08]} m={M.metal} />
      <group ref={fork}>
        <B p={[0, 0, 0.95]} s={[0.6, 0.06, 0.6]} m={M.metal} />
        <B p={[0, 0.25, 0.95]} s={[0.5, 0.4, 0.5]} m={M.carton} />
      </group>
      <group position={[0, 0.7, -0.15]}>
        <Person c={3} />
      </group>
    </group>
  );
}

function MerchandiseEnvironment({ lite }: { lite: boolean }) {
  return (
    <group>
      <B p={[0, 0.2, 0]} s={[16, 0.4, 11]} m={M.stone2} />
      {/* back + left walls, glazed atrium roof over the rear half */}
      <B p={[0, 3, -5.2]} s={[16, 5.6, 0.25]} m={M.stone} />
      <B p={[0, 5.3, -5.1]} s={[16, 0.6, 0.3]} m={M.bronze} />
      <B p={[-7.9, 3, 0]} s={[0.25, 5.6, 10.6]} m={M.stone} />
      <B p={[7.9, 3, -2.5]} s={[0.25, 5.6, 5.6]} m={M.glass} />
      {(!lite ? [-6, -3, 0, 3, 6] : [-4.5, 1.5]).map((wx) => (
        <Win key={wx} p={[wx, 3, -5.36]} w={1.7} h={2.3} />
      ))}
      {[-7.9, -2.6, 2.6, 7.9].map((x) => (
        <B key={x} p={[x, 3, 5.2]} s={[0.25, 5.6, 0.25]} m={M.bronze} />
      ))}
      {[-6, -2, 2, 6].map((x) => (
        <B key={x} p={[x, 5.85, 0]} s={[0.15, 0.25, 10.6]} m={M.bronze} />
      ))}
      {/* glazed mansard-style atrium roof over the rear half */}
      <B p={[0, 5.9, -2.4]} s={[16.8, 0.15, 6.5]} m={M.bronze} />
      <mesh geometry={HIP} material={M.glassRoof} position={[0, 5.95, -2.4]} scale={[16.4, 1.7, 6.3]} />
      <B p={[0, 5.78, 5.3]} s={[16.4, 0.25, 0.5]} m={M.trim} />
      <B p={[0, 5.66, 4.9]} s={[15.6, 0.06, 0.5]} m={M.glow} />
      <Racks lite={lite} />
      <Conveyor />
      {/* packing stations with workers */}
      {[-3, 0, 3].map((x, i) => (
        <group key={x} position={[x, 0.4, 3.6]}>
          <B p={[0, 0.45, 0]} s={[1.4, 0.08, 0.8]} m={M.white} />
          <B p={[0, 0.22, 0]} s={[0.08, 0.45, 0.08]} m={M.metal} />
          <B p={[0.2, 0.62, 0]} s={[0.4, 0.3, 0.35]} m={M.carton} />
          <group position={[0, 0, 0.7]} rotation-y={Math.PI}>
            <Person c={i + 1} work={0.35} phase={i} />
          </group>
        </group>
      ))}
      {/* sorting worker */}
      <group position={[5.5, 0.4, 0.6]}>
        <Person c={5} work={0.3} />
      </group>
      {/* product display / bundle wall */}
      <group position={[3.5, 0.4, -0.8]}>
        <B p={[0, 0.5, 0]} s={[2.6, 1, 1]} m={M.white} />
        {[-0.8, 0, 0.8].map((dx, i) => (
          <B key={dx} p={[dx, 1.25, 0]} s={[0.6, 0.5, 0.6]} m={[M.indigo, M.teal, M.blue][i]!} />
        ))}
      </group>
      <Mover points={[[-6, 0.4, 0.2], [2, 0.4, 0.2]]} speed={1.2} pingpong>
        <Forklift />
      </Mover>
      {/* loading docks */}
      {[4, 6.4].map((x) => (
        <B key={x} p={[x + 0.2, 1.4, 5.25]} s={[1.9, 2.2, 0.08]} m={M.bronzeDark} />
      ))}
    </group>
  );
}

/* ---------- C. Automotive Service & Detailing Center (Automotive pavilion) ---------- */
function WashTunnel() {
  const brushes = useRef<THREE.Group>(null);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    brushes.current?.children.forEach((b, i) => (b.rotation.y += dt * (i % 2 ? -5 : 5)));
  });
  const z0 = -1;
  return (
    <group position={[19, 0.4, z0]}>
      {/* open frame tunnel along x */}
      {[-4, -1.3, 1.3, 4].map((dx) => (
        <group key={dx}>
          <B p={[dx, 1.6, -1.5]} s={[0.25, 3.2, 0.25]} m={M.bronze} />
          <B p={[dx, 1.6, 1.5]} s={[0.25, 3.2, 0.25]} m={M.bronze} />
        </group>
      ))}
      <B p={[0, 3.3, 0]} s={[8.4, 0.3, 3.4]} m={M.roofm} />
      <B p={[0, 3.12, 0]} s={[8.6, 0.12, 3.6]} m={M.teal} />
      <B p={[0, 1.6, -1.6]} s={[8.4, 3.2, 0.06]} m={M.glass} />
      <B p={[0, 0.03, 0]} s={[8.4, 0.04, 2.4]} m={M.water} />
      <group ref={brushes}>
        {[-1, 1].map((side) =>
          [-1.3, 1.3].map((dx) => <mesh key={`${side}${dx}`} geometry={G.cyl} material={M.brush} position={[dx, 1.2, side * 1.05]} scale={[0.55, 2.2, 0.55]} />),
        )}
      </group>
      <mesh geometry={G.cyl} material={M.brush} position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.4, 2.4, 0.4]} />
      <Mover points={[[-7, 0, 0], [7, 0, 0]]} speed={1.1}>
        <Car c={0} />
      </Mover>
    </group>
  );
}

function Polisher({ p, c, phase }: { p: V3; c: number; phase: number }) {
  const tech = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.6 + phase;
    if (tech.current) {
      tech.current.position.set(Math.sin(t) * 1.25, 0, Math.cos(t) * 0.75);
      tech.current.rotation.y = Math.atan2(-tech.current.position.x, -tech.current.position.z);
    }
  });
  return (
    <group position={p}>
      <Car c={c} />
      <group ref={tech}>
        <Person c={2} work={0.25} phase={phase} />
      </group>
    </group>
  );
}

function Turntable() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, raw) => {
    if (ref.current) ref.current.rotation.y += Math.min(raw, 0.05) * 0.4;
  });
  return (
    <group position={[29, 0.42, 3.4]}>
      <mesh geometry={G.cyl} material={M.metal} scale={[2.6, 0.06, 2.6]} />
      <group ref={ref}>
        <Car c={5} scale={1.1} />
      </group>
    </group>
  );
}

function AutoCareEnvironment({ lite }: { lite: boolean }) {
  return (
    <group>
      <B p={[24, 0.2, 0]} s={[16, 0.4, 11]} m={M.stone2} />
      {/* detailing bays pavilion (back right) */}
      <B p={[27.5, 2.2, -5.2]} s={[9, 4, 0.25]} m={M.stone} />
      <B p={[31.9, 2.2, -2.6]} s={[0.25, 4, 5.4]} m={M.stone} />
      {(!lite ? [[25.5, -5.36], [29.5, -5.36], [32.05, -3.8], [32.05, -1.4]] : [[27.5, -5.36]]).map(([wx, wz], i) => (
        <Win key={i} p={[wx, 2.2, wz]} w={1.5} h={2} axis={wz === -5.36 ? "z" : "x"} />
      ))}
      <B p={[27.5, 4.32, 0.15]} s={[9.4, 0.22, 0.4]} m={M.trim} />
      <HipRoof p={[27.5, 4.42, -2.6]} s={[9.6, 1.5, 6]} />
      <B p={[27.5, 4.35, 0.1]} s={[9, 0.25, 0.15]} m={M.teal} />
      {[23.1, 27.5].map((x) => (
        <B key={x} p={[x, 2.2, -2.6]} s={[0.1, 4, 5.4]} m={M.bronze} />
      ))}
      <Polisher p={[25.3, 0.42, -2.6]} c={1} phase={0} />
      <Polisher p={[29.7, 0.42, -2.6]} c={2} phase={2} />
      {/* bay lights */}
      {[25.3, 29.7].map((x) => (
        <B key={x} p={[x, 4.15, -2.6]} s={[2.4, 0.06, 0.25]} m={M.bulb} />
      ))}
      <WashTunnel />
      {/* glass showroom / reception */}
      <B p={[29, 1.9, 3.4]} s={[5.6, 3, 3.8]} m={M.glass} />
      <B p={[29, 3.45, 3.4]} s={[5.8, 0.15, 4]} m={M.stone2} />
      <B p={[29, 3.62, 3.4]} s={[6.1, 0.12, 4.3]} m={M.trim} />
      <Turntable />
      <B p={[27, 0.85, 4.8]} s={[1.2, 0.85, 0.4]} m={M.white} />
      <group position={[27, 0.42, 4.2]}>
        <Person c={2} />
      </group>
      {/* interior cleaning prep */}
      <group position={[20, 0.42, 3.6]}>
        <Car c={3} />
        <group position={[0.7, 0, 0.2]}>
          <Person c={2} work={0.4} />
        </group>
      </group>
      {!lite && (
        <group position={[22.5, 0.42, 3.6]}>
          <Car c={4} />
          <group position={[-0.7, 0, -0.4]}>
            <Person c={2} work={0.3} phase={1} />
          </group>
        </group>
      )}
    </group>
  );
}

/* ---------- D. The Grand Entrance: portico, entrance hall, atrium crown ---------- */
function GrandEntrance() {
  return (
    <group>
      {/* entrance hall */}
      <B p={[-3.5, 3.28, 6.4]} s={[0.25, 5.84, 2.4]} m={M.stone} />
      <B p={[3.5, 3.28, 6.4]} s={[0.25, 5.84, 2.4]} m={M.stone} />
      <B p={[-3.06, 3.28, 7.6]} s={[0.88, 5.84, 0.2]} m={M.stone} />
      <B p={[3.06, 3.28, 7.6]} s={[0.88, 5.84, 0.2]} m={M.stone} />
      <B p={[0, 3.28, 7.6]} s={[5.2, 5.6, 0.06]} m={M.glass} />
      {[-1.7, 0, 1.7].map((dx) => (
        <B key={dx} p={[dx, 3.28, 7.62]} s={[0.14, 5.6, 0.14]} m={M.bronze} />
      ))}
      {/* bronze double door */}
      <B p={[0, 2.2, 7.66]} s={[2.2, 3.4, 0.08]} m={M.bronzeDark} />
      <B p={[0, 2.2, 7.71]} s={[0.06, 3.3, 0.02]} m={M.trim} />
      <B p={[0, 6.05, 7.6]} s={[7, 0.4, 0.25]} m={M.stone} />
      {/* interior: carpet, chandelier, reception */}
      <B p={[0, 0.38, 6.4]} s={[3, 0.04, 4.4]} m={M.redcarpet} />
      <group position={[0, 5.2, 6.4]}>
        <mesh geometry={G.sphere} material={M.bulb} scale={0.3} />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <mesh key={k} geometry={G.sphere} material={M.bulb} position={[Math.sin(k * 1.047) * 0.45, -0.25 - (k % 2) * 0.2, Math.cos(k * 1.047) * 0.45]} scale={0.12} />
        ))}
        <mesh geometry={G.cyl} material={M.trim} position={[0, 0.45, 0]} scale={[0.04, 0.6, 0.04]} />
      </group>
      <B p={[1.9, 0.76, 5.9]} s={[1.4, 0.8, 0.5]} m={M.wood} />
      <group position={[1.9, 0.4, 6.7]} rotation-y={Math.PI}>
        <Person c={4} />
      </group>
      <group position={[-1.9, 0.4, 6.9]}>
        <Person c={1} work={0.05} />
      </group>
      {/* portico: canopy on bronze columns */}
      {[-3.4, -1.15, 1.15, 3.4].map((dx) => (
        <group key={dx}>
          <mesh geometry={G.cyl} material={M.bronze} position={[dx, 3.03, 8.5]} scale={[0.4, 5.34, 0.4]} castShadow />
          <B p={[dx, 0.5, 8.5]} s={[0.62, 0.3, 0.62]} m={M.stone2} />
          <B p={[dx, 5.76, 8.5]} s={[0.58, 0.12, 0.58]} m={M.trim} />
        </group>
      ))}
      <B p={[0, 5.85, 8.05]} s={[9, 0.35, 1.7]} m={M.stone2} />
      <B p={[0, 6.08, 8.05]} s={[9.3, 0.12, 1.9]} m={M.trim} />
      {/* illuminated signage on a bronze panel */}
      <B p={[0, 6.75, 8.68]} s={[6.2, 1.3, 0.1]} m={M.bronzeDark} />
      <FacadeSign p={[0, 6.75, 8.74]} s={[5.6, 1.05]} text="MhadysEvents" />
      {/* atrium crown */}
      <B p={[-2.6, 8.2, 6.4]} s={[0.25, 4, 2.4]} m={M.stone} />
      <B p={[2.6, 8.2, 6.4]} s={[0.25, 4, 2.4]} m={M.stone} />
      <B p={[0, 8.2, 7.6]} s={[5.2, 3.8, 0.06]} m={M.glass} />
      <B p={[0, 8.2, 7.45]} s={[4.6, 3.4, 0.05]} m={M.glow} />
      <B p={[0, 8.2, 5.2]} s={[5.2, 3.8, 0.06]} m={M.glass} />
      <B p={[0, 8.2, 5.35]} s={[4.6, 3.4, 0.05]} m={M.glow} />
      {[-2.6, 0, 2.6].map((dx) => (
        <group key={dx}>
          <B p={[dx, 8.2, 7.64]} s={[0.12, 3.8, 0.12]} m={M.bronze} />
          <B p={[dx, 8.2, 5.16]} s={[0.12, 3.8, 0.12]} m={M.bronze} />
        </group>
      ))}
      <B p={[0, 10.25, 6.4]} s={[6, 0.3, 3]} m={M.trim} />
      <HipRoof p={[0, 10.4, 6.4]} s={[6.6, 1.9, 3.6]} />
      <mesh geometry={G.cyl} material={M.trim} position={[0, 12.15, 6.4]} scale={[0.05, 0.5, 0.05]} />
      <mesh geometry={G.sphere} material={M.bulb} position={[0, 12.5, 6.4]} scale={0.16} />
      {/* grand steps from the terrace down to the forecourt */}
      <B p={[0, 0.18, 8.05]} s={[10, 0.36, 0.6]} m={M.stone2} />
      <B p={[0, 0.12, 8.65]} s={[10.6, 0.24, 0.6]} m={M.stone2} />
      <B p={[0, 0.06, 9.25]} s={[11.2, 0.12, 0.6]} m={M.stone2} />
      <Medallion p={[0, 5.87, 8.98]} s={0.8} />
    </group>
  );
}

export function Campus({ lite }: { lite: boolean }) {
  return (
    <group>
      <Ground lite={lite} />
      {/* continuous estate podium shared by all three wings */}
      <B p={[0, 0.18, 0.45]} s={[65.4, 0.36, 14.6]} m={M.stone2} />
      <EventsEnvironment lite={lite} />
      <MerchandiseEnvironment lite={lite} />
      <AutoCareEnvironment lite={lite} />
      <GrandEntrance />
    </group>
  );
}

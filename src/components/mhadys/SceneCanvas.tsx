import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Campus } from "./Campus";
import { HOTSPOTS, type HotspotDef, type ServiceId } from "./data";
import { rigCameraPosition, type Rig } from "./rig";
import { cn } from "@/lib/utils";

function CameraRig({ rig, reduced }: { rig: Rig; reduced: boolean }) {
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const desired = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, raw) => {
    if (!controls || !rig.animating) return;
    const dt = Math.min(raw, 0.05);
    const k = reduced || rig.instant ? 1 : 1 - Math.exp(-2.6 * dt);
    rigCameraPosition(rig, desired);
    controls.target.lerp(rig.target, k);
    camera.position.lerp(desired, k);
    controls.update();
    if (camera.position.distanceTo(desired) < 0.05) {
      rig.animating = false;
      rig.instant = false;
    }
  });
  return null;
}

const HTML_STYLE = { pointerEvents: "auto" as const };
function Hotspot({ h, active, dim, onPick }: { h: HotspotDef; active: boolean; dim: boolean; onPick: (h: HotspotDef) => void }) {
  return (
    <Html position={h.position} center zIndexRange={[20, 0]} style={HTML_STYLE}>
      <button
        type="button"
        onClick={() => onPick(h)}
        aria-label={`${h.title} — show details`}
        className={cn(
          "group relative flex items-center gap-2 whitespace-nowrap rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          dim ? "opacity-40 hover:opacity-100" : "opacity-100",
        )}
      >
        <span className={cn("relative grid size-7 place-items-center rounded-full border border-white/40 bg-background/50 backdrop-blur-md transition-transform group-hover:scale-110", active && "scale-110 border-white")}>
          <span className="absolute inset-0 animate-ping rounded-full bg-sky-300/30 [animation-duration:2.4s]" />
          <span className={cn("size-2.5 rounded-full bg-sky-300", active && "bg-white")} />
        </span>
        <span className={cn("rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-md transition-opacity", active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100")}>
          {h.title}
        </span>
      </button>
    </Html>
  );
}

export interface SceneCanvasProps {
  rig: Rig;
  service: ServiceId;
  activeHotspot: string | null;
  onPickHotspot: (h: HotspotDef) => void;
  onUserInteract: () => void;
  lite: boolean;
  reduced: boolean;
}

export function SceneCanvas({ rig, service, activeHotspot, onPickHotspot, onUserInteract, lite, reduced }: SceneCanvasProps) {
  const ctrl = useRef<OrbitControlsImpl>(null);
  return (
    <Canvas shadows={!lite} dpr={[1, lite ? 1.5 : 2]} camera={{ position: [10, 30, 30], fov: 32, near: 0.5, far: 300 }} gl={{ antialias: true }}>
      <color attach="background" args={["#0e1830"]} />
      <fog attach="fog" args={["#0e1830", 60, 140]} />
      <hemisphereLight args={["#9db1e0", "#2e2a24", 0.85]} />
      <directionalLight position={[24, 32, 20]} intensity={2.4} color="#ffdcb0" castShadow={!lite} shadow-mapSize={[2048, 2048]} shadow-camera-left={-45} shadow-camera-right={45} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-bias={-0.0005} />
      <directionalLight position={[-30, 10, 26]} intensity={0.7} color="#ff9e66" />
      <directionalLight position={[-25, 12, -10]} intensity={0.5} color="#8a9cff" />
      <Environment resolution={128}>
        <Lightformer intensity={2} color="#fff2df" position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
        <Lightformer intensity={1.3} color="#ffbe8a" position={[-10, 3, 10]} scale={[30, 3, 1]} />
        <Lightformer intensity={0.7} color="#7f95c9" position={[10, 3, -10]} scale={[30, 3, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Campus lite={lite} />
        {!lite && <ContactShadows position={[0, 0.03, 0]} scale={100} opacity={0.35} blur={2} far={10} resolution={512} />}
      </Suspense>
      {HOTSPOTS.map((h) => (
        <Hotspot key={h.id} h={h} active={activeHotspot === h.id} dim={h.service !== service} onPick={onPickHotspot} />
      ))}
      <OrbitControls
        ref={ctrl}
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={10}
        maxDistance={70}
        minPolarAngle={0.35}
        maxPolarAngle={1.25}
        onStart={() => {
          rig.animating = false;
          onUserInteract();
        }}
      />
      <CameraRig rig={rig} reduced={reduced} />
    </Canvas>
  );
}

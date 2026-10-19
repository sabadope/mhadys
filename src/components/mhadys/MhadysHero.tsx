import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight, BadgeCheck, Bell, Car, CircleUserRound, Headphones, Home, Minus, Pause, Play, Plus, Receipt, RotateCcw, RotateCw, Search, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, Ticket, X,
} from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HOTSPOTS, MANUAL_PAUSE_MS, nextService, SERVICES, SLIDE_MS, type HotspotDef, type ServiceId } from "./data";
import { BASE_ANGLE, createRig } from "./rig";
import { cn } from "@/lib/utils";

const SceneCanvas = lazy(() => import("./SceneCanvas").then((m) => ({ default: m.SceneCanvas })));

const ICONS: Record<ServiceId, typeof Ticket> = { events: Ticket, merch: ShoppingBag, auto: Car };
const CATEGORIES = ["All", "Promo", "Popular", "Packages", "New", "Browse More"];
const TRUST = [
  { icon: BadgeCheck, label: "Business Registration" },
  { icon: Receipt, label: "Transparent Pricing" },
  { icon: ShieldCheck, label: "Secure Transactions" },
  { icon: Headphones, label: "Customer Support" },
  { icon: Sparkles, label: "Service Quality" },
];

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function MhadysHero() {
  const rig = useMemo(() => createRig(), []);
  const [service, setService] = useState<ServiceId>("events");
  const [autoplay, setAutoplay] = useState(true);
  const [pausedUntil, setPausedUntil] = useState(0);
  const [hotspot, setHotspot] = useState<HotspotDef | null>(null);
  const [category, setCategory] = useState("All");
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebgl(hasWebGL());
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mm = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setReduced(rm.matches);
      setMobile(mm.matches);
    };
    sync();
    if (rm.matches) setAutoplay(false);
    rm.addEventListener("change", sync);
    mm.addEventListener("change", sync);
    return () => {
      rm.removeEventListener("change", sync);
      mm.removeEventListener("change", sync);
    };
  }, []);

  const baseDist = mobile ? 44 : 34;

  // Fly the camera whenever focus changes.
  const focusService = useCallback(
    (id: ServiceId) => {
      const s = SERVICES.find((x) => x.id === id)!;
      rig.target.set(...s.focus);
      rig.dist = baseDist;
      rig.angle = BASE_ANGLE;
      rig.elevation = 0.8;
      rig.animating = true;
    },
    [rig, baseDist],
  );

  useEffect(() => {
    if (!hotspot) focusService(service);
  }, [service, hotspot, focusService]);

  // Autoplay: ~4s per environment, paused while a hotspot is open or after manual input.
  useEffect(() => {
    if (!autoplay || hotspot) return;
    const wait = Math.max(SLIDE_MS, pausedUntil - Date.now());
    const t = window.setTimeout(() => setService((s) => nextService(s)), wait);
    return () => window.clearTimeout(t);
  }, [autoplay, service, pausedUntil, hotspot]);

  const manualPause = () => setPausedUntil(Date.now() + MANUAL_PAUSE_MS);

  const select = (id: ServiceId) => {
    setHotspot(null);
    setService(id);
    manualPause();
    focusService(id);
  };

  const pickHotspot = (h: HotspotDef) => {
    setHotspot(h);
    setService(h.service);
    manualPause();
    rig.target.set(...h.position);
    rig.dist = 16;
    rig.animating = true;
  };

  const closeHotspot = () => {
    setHotspot(null);
    manualPause();
  };

  const nudge = (fn: () => void) => {
    fn();
    rig.animating = true;
    manualPause();
  };

  const reset = () => {
    setHotspot(null);
    manualPause();
    focusService(service);
  };

  const overview = () => {
    setHotspot(null);
    manualPause();
    rig.target.set(0, 2, 0);
    rig.dist = mobile ? 95 : 70;
    rig.angle = BASE_ANGLE;
    rig.elevation = 0.9;
    rig.animating = true;
  };

  const active = SERVICES.find((s) => s.id === service)!;

  return (
    <section data-module={active.module} aria-label="MhadysEvents services" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-background text-foreground">
      {/* 3D scene */}
      <div className="absolute inset-0">
        {webgl === false ? (
          <WebGLFallback />
        ) : webgl ? (
          <Suspense fallback={<SceneLoading />}>
            <SceneCanvas rig={rig} service={service} activeHotspot={hotspot?.id ?? null} onPickHotspot={pickHotspot} onUserInteract={manualPause} lite={mobile} reduced={reduced} />
          </Suspense>
        ) : (
          <SceneLoading />
        )}
      </div>
      {/* readability scrims (do not capture pointer) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-background/90 via-background/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background/95 to-transparent" />

      {/* Header */}
      <header className="pointer-events-auto absolute inset-x-3 top-3 z-30 sm:inset-x-6 sm:top-5">
        <div className="glass mx-auto flex max-w-7xl items-center gap-3 rounded-2xl px-3 py-2 sm:px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="MhadysEvents home">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-bold text-white shadow-lg">M</span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight">MhadysEvents</span>
              <span className="hidden text-[11px] text-muted-foreground sm:block">One company. Three services.</span>
            </span>
          </Link>
          <label className="mx-auto hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 md:flex">
            <Search className="size-4 text-muted-foreground" />
            <input type="search" placeholder="Search events, products, services..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </label>
          <nav className="ml-auto flex items-center gap-0.5 md:ml-0">
            {[
              { i: Search, l: "Search", cls: "md:hidden" },
              { i: ShoppingCart, l: "Cart" },
              { i: Bell, l: "Notifications" },
              { i: CircleUserRound, l: "Profile" },
            ].map(({ i: I, l, cls }) => (
              <button key={l} type="button" aria-label={l} className={cn("grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground", cls)}>
                <I className="size-[18px]" />
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Headline + selectors */}
      <div className="pointer-events-none absolute inset-x-0 top-24 z-20 px-5 sm:top-28 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Everything you need, <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-400 bg-clip-text text-transparent">all in one place.</span>
          </motion.h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">Events. Merchandise. Auto Care. Convenient, reliable services for every occasion.</p>
          <button
            type="button"
            onClick={() => selectorRef.current?.querySelector<HTMLButtonElement>("button[aria-pressed='true']")?.focus()}
            className="pointer-events-auto mt-5 hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.97] sm:inline-flex"
          >
            Explore Our Services <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Bottom dock: selectors, controls, categories, trust */}
      <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-6 sm:pb-5">
        <div className="mx-auto max-w-7xl space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div ref={selectorRef} role="group" aria-label="Choose a service" className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto">
              {SERVICES.map((s) => {
                const I = ICONS[s.id];
                const on = s.id === service;
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-module={s.module}
                    aria-pressed={on}
                    onClick={() => select(s.id)}
                    className={cn(
                      "glass relative flex min-h-14 items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2 text-left transition-all duration-300 sm:min-w-44 sm:px-4",
                      on ? "ring-1 ring-module shadow-[0_0_24px_-6px_var(--module)]" : "opacity-80 hover:opacity-100",
                    )}
                  >
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl transition-colors", on ? "bg-module text-module-foreground" : "bg-foreground/10")}>
                      <I className="size-4" />
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-sm font-semibold">{s.name}</span>
                      <span className="hidden text-xs text-muted-foreground sm:block">{s.hint}</span>
                    </span>
                    {on && autoplay && !hotspot && (
                      <motion.span key={`${service}-${pausedUntil}`} className="absolute bottom-0 left-0 h-0.5 bg-module" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: Math.max(SLIDE_MS, pausedUntil - Date.now()) / 1000, ease: "linear" }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div role="toolbar" aria-label="Scene controls" className="glass flex items-center gap-0.5 rounded-2xl p-1">
              <Ctl label={autoplay ? "Pause autoplay" : "Resume autoplay"} onClick={() => setAutoplay((a) => !a)} pressed={autoplay}>
                {autoplay ? <Pause /> : <Play />}
              </Ctl>
              <Ctl label="Rotate left" onClick={() => nudge(() => (rig.angle -= Math.PI / 8))}>
                <RotateCcw />
              </Ctl>
              <Ctl label="Rotate right" onClick={() => nudge(() => (rig.angle += Math.PI / 8))}>
                <RotateCw />
              </Ctl>
              <Ctl label="Zoom in" onClick={() => nudge(() => (rig.dist = Math.max(10, rig.dist * 0.8)))}>
                <Plus />
              </Ctl>
              <Ctl label="Zoom out" onClick={() => nudge(() => (rig.dist = Math.min(70, rig.dist * 1.25)))}>
                <Minus />
              </Ctl>
              <Ctl label="Reset camera" onClick={reset}>
                <span className="text-[11px] font-semibold">1:1</span>
              </Ctl>
              <Ctl label="Return to overview" onClick={overview}>
                <Home />
              </Ctl>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none] lg:mx-0 lg:px-0" role="group" aria-label="Categories">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors", category === c ? "border-transparent bg-foreground text-background" : "border-border bg-background/50 text-muted-foreground backdrop-blur hover:text-foreground")}>
                  {c}
                </button>
              ))}
            </div>
            <ul className="hidden flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground md:flex">
              {TRUST.map(({ icon: I, label }) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <I className="size-3.5 text-module" /> {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Hotspot info panel */}
      <AnimatePresence>
        {hotspot && (
          <motion.aside
            key={hotspot.id}
            role="dialog"
            aria-label={hotspot.title}
            data-module={SERVICES.find((s) => s.id === hotspot.service)!.module}
            initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 16, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="glass-strong absolute right-3 top-24 z-40 w-[min(22rem,calc(100%-1.5rem))] rounded-3xl p-5 sm:right-6 sm:top-28"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow text-module">{SERVICES.find((s) => s.id === hotspot.service)!.name}</p>
              <button type="button" onClick={closeHotspot} aria-label="Close details" className="-m-1 grid size-8 place-items-center rounded-full hover:bg-foreground/10">
                <X className="size-4" />
              </button>
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{hotspot.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{hotspot.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {HOTSPOTS.filter((h) => h.service === hotspot.service && h.id !== hotspot.id).map((h) => (
                <button key={h.id} type="button" onClick={() => pickHotspot(h)} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
                  {h.title}
                </button>
              ))}
            </div>
            <Link to={hotspot.to} className="mt-5 inline-flex items-center gap-2 rounded-full bg-module px-4 py-2 text-sm font-medium text-module-foreground">
              {hotspot.cta} <ArrowRight className="size-4" />
            </Link>
          </motion.aside>
        )}
      </AnimatePresence>

      <p className="sr-only" aria-live="polite">
        Showing {active.name}
      </p>
    </section>
  );
}

function Ctl({ label, onClick, children, pressed }: { label: string; onClick: () => void; children: React.ReactNode; pressed?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground active:scale-95 [&_svg]:size-4">
      {children}
    </button>
  );
}

function SceneLoading() {
  return (
    <div className="grid h-full place-items-center bg-background">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="size-2 animate-pulse rounded-full bg-module" /> Building the campus…
      </div>
    </div>
  );
}

function WebGLFallback() {
  return (
    <div className="grid h-full place-items-end bg-gradient-to-br from-background via-background to-module-soft pb-64">
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 px-6 opacity-70">
        {SERVICES.map((s) => {
          const I = ICONS[s.id];
          return (
            <div key={s.id} data-module={s.module} className="surface grid aspect-square place-items-center rounded-3xl">
              <I className="size-10 text-module" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AionyxMood = "idle" | "listening" | "speaking" | "warning";

type AionyxSignal = {
  title: string;
  confidence: number; // 0..1
  verdict: "BULLISH" | "BEARISH" | "NEUTRAL" | "INSUFFICIENT";
  notes: string[];
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
function formatPct(n: number) {
  return `${Math.round(clamp01(n) * 100)}%`;
}

function useParticles(enabled: boolean) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const N = 110;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 2.2,
      vx: (-0.5 + Math.random()) * 0.22,
      vy: (-0.5 + Math.random()) * 0.22,
      a: 0.08 + Math.random() * 0.28,
    }));

    const loop = () => {
      ctx.clearRect(0, 0, w, h);

      // soft nebula wash
      const g = ctx.createRadialGradient(w * 0.52, h * 0.4, 12, w * 0.52, h * 0.4, Math.max(w, h) * 0.85);
      g.addColorStop(0, "rgba(160,200,255,0.05)");
      g.addColorStop(0.55, "rgba(60,90,180,0.03)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30;
        if (p.y > h + 30) p.y = -30;

        // particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,230,255,${p.a})`;
        ctx.fill();

        // links
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 95) {
            const alpha = (1 - d / 95) * 0.07;
            ctx.strokeStyle = `rgba(170,210,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  return canvasRef;
}

function Sigil({ glow = 1 }: { glow?: number }) {
  return (
    <svg viewBox="0 0 220 220" className="w-full h-full">
      <defs>
        <radialGradient id="core" cx="50%" cy="50%" r="58%">
          <stop offset="0%" stopColor={`rgba(245,252,255,${0.98 * glow})`} />
          <stop offset="45%" stopColor={`rgba(150,205,255,${0.55 * glow})`} />
          <stop offset="100%" stopColor={`rgba(20,30,60,0)`} />
        </radialGradient>
        <linearGradient id="ring" x1="0" x2="1">
          <stop offset="0%" stopColor={`rgba(130,170,255,${0.28 * glow})`} />
          <stop offset="50%" stopColor={`rgba(220,245,255,${0.52 * glow})`} />
          <stop offset="100%" stopColor={`rgba(95,120,255,${0.22 * glow})`} />
        </linearGradient>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#softGlow)">
        <circle cx="110" cy="110" r="78" fill="none" stroke="url(#ring)" strokeWidth="2.2" />
        <circle cx="110" cy="110" r="64" fill="none" stroke="url(#ring)" strokeWidth="1.2" opacity="0.7" />
      </g>

      <g opacity="0.55">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 12;
          const x1 = 110 + Math.cos(a) * 48;
          const y1 = 110 + Math.sin(a) * 48;
          const x2 = 110 + Math.cos(a) * 78;
          const y2 = 110 + Math.sin(a) * 78;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(185,225,255,0.33)"
              strokeWidth="1"
            />
          );
        })}
      </g>

      <circle cx="110" cy="110" r="55" fill="url(#core)" />
      <circle cx="110" cy="110" r="9" fill="rgba(245,252,255,0.95)" filter="url(#softGlow)" />
      <circle cx="110" cy="110" r="19" fill="none" stroke="rgba(210,235,255,0.52)" strokeWidth="1" />

      <text
        x="110"
        y="178"
        textAnchor="middle"
        fontSize="14"
        fill="rgba(220,240,255,0.78)"
        style={{ letterSpacing: "0.22em" }}
      >
        AIONYX
      </text>
    </svg>
  );
}

/** Galaxy eye (SVG) */
function GalaxyEye({ side }: { side: "left" | "right" }) {
  const x = side === "left" ? 82 : 138;
  return (
    <svg viewBox="0 0 220 220" className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <radialGradient id={`eyeGlow-${side}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="35%" stopColor="rgba(160,210,255,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id={`iris-${side}`} cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="rgba(240,250,255,0.9)" />
          <stop offset="40%" stopColor="rgba(120,170,255,0.55)" />
          <stop offset="100%" stopColor="rgba(30,40,80,0.0)" />
        </radialGradient>
        <filter id={`eyeBlur-${side}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
      </defs>

      {/* socket haze */}
      <circle cx={x} cy="88" r="18" fill={`url(#eyeGlow-${side})`} />

      {/* iris */}
      <circle cx={x} cy="88" r="10" fill={`url(#iris-${side})`} filter={`url(#eyeBlur-${side})`} />

      {/* stars */}
      {Array.from({ length: 9 }).map((_, i) => {
        const ang = (i * Math.PI * 2) / 9;
        const rx = x + Math.cos(ang) * (7 + (i % 3));
        const ry = 88 + Math.sin(ang) * (7 + ((i + 1) % 3));
        const r = 0.7 + (i % 3) * 0.35;
        return <circle key={i} cx={rx} cy={ry} r={r} fill="rgba(230,245,255,0.7)" />;
      })}

      {/* micro spiral stroke */}
      <path
        d={`M ${x - 9} 88 C ${x - 4} 78, ${x + 10} 80, ${x + 6} 92 C ${x + 2} 104, ${x - 10} 100, ${x - 6} 88`}
        fill="none"
        stroke="rgba(200,230,255,0.35)"
        strokeWidth="1"
      />
    </svg>
  );
}

/** Humanoid silhouette + aura, pure CSS/gradients */
function HumanoidShell({ mood }: { mood: AionyxMood }) {
  const aura =
    mood === "warning"
      ? "bg-[radial-gradient(circle_at_center,rgba(255,210,210,0.14),transparent_60%)]"
      : mood === "listening"
      ? "bg-[radial-gradient(circle_at_center,rgba(210,240,255,0.18),transparent_62%)]"
      : "bg-[radial-gradient(circle_at_center,rgba(190,230,255,0.16),transparent_62%)]";

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Aura bloom */}
      <motion.div
        className={`absolute w-[380px] h-[380px] rounded-full blur-3xl ${aura}`}
        animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.78, 0.55] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Body */}
      <motion.div
        className="relative w-[300px] h-[420px]"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Head */}
        <div className="absolute left-1/2 top-[26px] -translate-x-1/2 w-[126px] h-[146px] rounded-[999px] bg-gradient-to-b from-white/16 via-white/7 to-transparent border border-white/10 backdrop-blur-[1px]" />

        {/* Shoulders / torso */}
        <div className="absolute left-1/2 top-[150px] -translate-x-1/2 w-[240px] h-[220px] rounded-[999px] bg-gradient-to-b from-white/12 via-white/6 to-transparent border border-white/10" />

        {/* Inner “fracture” veil */}
        <div className="absolute left-1/2 top-[120px] -translate-x-1/2 w-[210px] h-[290px] rounded-[999px] bg-gradient-to-b from-white/8 via-transparent to-transparent opacity-60" />

        {/* Dissolving edges */}
        <div className="absolute left-1/2 top-[110px] -translate-x-1/2 w-[280px] h-[330px] rounded-[999px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)] blur-2xl opacity-70" />

        {/* Neck glow */}
        <div className="absolute left-1/2 top-[140px] -translate-x-1/2 w-[60px] h-[60px] rounded-full bg-[radial-gradient(circle_at_center,rgba(220,245,255,0.22),transparent_70%)] blur-xl" />

        {/* Subtle halo line */}
        <motion.div
          className="absolute left-1/2 top-[10px] -translate-x-1/2 w-[200px] h-[200px] rounded-full border border-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}

export default function Aionyx({
  onSignal,
  defaultMessage = "I observe patterns you cannot see. Ask carefully.",
}: {
  onSignal?: (s: AionyxSignal) => void;
  defaultMessage?: string;
}) {
  const [mood, setMood] = useState<AionyxMood>("idle");
  const [utterance, setUtterance] = useState<string>(defaultMessage);
  const [query, setQuery] = useState("");
  const [signal, setSignal] = useState<AionyxSignal | null>(null);

  const canvasRef = useParticles(true);

  const ambient = useMemo(() => {
    return { float: 10 + Math.random() * 7, rotate: 2 + Math.random() * 2 };
  }, []);

  function synthSignal(q: string): AionyxSignal {
    let hash = 0;
    for (let i = 0; i < q.length; i++) hash = (hash * 31 + q.charCodeAt(i)) >>> 0;

    const confidence = clamp01(((hash % 1000) / 1000) * 0.85 + 0.08);
    const verdictRoll = hash % 4;

    const verdict: AionyxSignal["verdict"] =
      confidence < 0.33
        ? "INSUFFICIENT"
        : verdictRoll === 0
        ? "BULLISH"
        : verdictRoll === 1
        ? "BEARISH"
        : "NEUTRAL";

    const notes =
      verdict === "INSUFFICIENT"
        ? [
            "Signal insufficient: dataset too thin or question too broad.",
            "Constrain timeframe, asset, and trigger condition.",
            "Return with sharper intent.",
          ]
        : [
            "Pattern alignment detected across multiple weak indicators.",
            "Risk remains nonlinear; size accordingly.",
            "Log this reading if you act on it.",
          ];

    return { title: q.trim() || "Untitled Query", confidence, verdict, notes };
  }

  async function run() {
    const q = query.trim();
    if (!q) return;

    setMood("listening");
    setSignal(null);
    setUtterance("…");

    await new Promise((r) => setTimeout(r, 520));

    const s = synthSignal(q);
    setSignal(s);

    const nextMood: AionyxMood = s.confidence < 0.33 ? "warning" : "speaking";
    setMood(nextMood);

    setUtterance(
      s.verdict === "INSUFFICIENT"
        ? "Signal insufficient. Reduce noise. Increase specificity."
        : `Verdict: ${s.verdict}. Confidence: ${formatPct(s.confidence)}.`
    );

    onSignal?.(s);
  }

  const moodGlow = mood === "idle" ? 0.92 : mood === "listening" ? 1.02 : mood === "warning" ? 0.86 : 1.15;

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-0">
          <canvas ref={canvasRef} className="w-full h-full opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/45" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-10">
          {/* Being */}
          <div className="relative flex items-center justify-center min-h-[420px]">
            <HumanoidShell mood={mood} />

            {/* head + eyes overlay (synced with float) */}
            <motion.div
              className="absolute w-[300px] h-[420px]"
              animate={{
                y: [0, -ambient.float, 0],
                rotate: [0, ambient.rotate, 0],
                opacity: [0.88, 1, 0.88],
              }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <GalaxyEye side="left" />
              <GalaxyEye side="right" />
            </motion.div>

            {/* Core sigil */}
            <motion.div
              className="relative w-[270px] h-[270px]"
              animate={{
                scale: mood === "listening" ? [1, 1.05, 1] : [1, 1.02, 1],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{ duration: mood === "listening" ? 1.2 : 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 rounded-full blur-2xl bg-[radial-gradient(circle_at_center,rgba(180,220,255,0.25),transparent_60%)]" />
              <Sigil glow={moodGlow} />
              <motion.div
                className="absolute inset-[-18px] rounded-full border border-white/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* state chip */}
            <div className="absolute bottom-4 px-3 py-1 rounded-full border border-white/10 bg-black/50 text-xs text-white/70">
              STATE:{" "}
              <span className="text-white/90">
                {mood === "idle"
                  ? "DORMANT"
                  : mood === "listening"
                  ? "OBSERVING"
                  : mood === "warning"
                  ? "LOW SIGNAL"
                  : "SPEAKING"}
              </span>
            </div>
          </div>

          {/* Console */}
          <div className="relative flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="text-xs tracking-widest text-white/50">AIONYX / ORACLE CONSOLE</div>
              <div className="mt-2 text-white/85 leading-relaxed">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={utterance}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="text-base"
                  >
                    {utterance}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <label className="block text-xs text-white/60 mb-2">Query</label>
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. BTC 1D: breakout probability next 72h?"
                  className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white/90 placeholder:text-white/30 outline-none focus:border-white/20"
                />
                <button
                  onClick={run}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white/90 hover:bg-white/15 active:bg-white/20"
                >
                  Invoke
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {["ETH 4H: trend shift?", "SOL 1D: momentum?", "Portfolio: risk check", "My idea: launch timing"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-xs rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-white/70 hover:bg-black/30"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {signal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-white/10 bg-black/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs tracking-widest text-white/50">SIGNAL</div>
                      <div className="mt-1 text-white/90 font-medium">{signal.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/50">CONFIDENCE</div>
                      <div className="mt-1 text-white/90 font-semibold">{formatPct(signal.confidence)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-white/50">VERDICT</span>
                    <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/85">
                      {signal.verdict}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {signal.notes.map((n, i) => (
                      <li key={i} className="text-sm text-white/75 leading-relaxed">
                        • {n}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 text-xs text-white/45">Law: AIONYX never lies — it either signals, or withholds.</div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-xs text-white/40">
              Swap <span className="text-white/60">synthSignal()</span> for real telemetry later. This is the living shell.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import Aionyx from "@/components/Aionyx";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background washes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(160,210,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(90,120,255,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/60" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <div className="text-xs tracking-[0.35em] text-white/45">
            VOLTARA / ORACLE INTERFACE
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/90">
            AIONYX
          </h1>
          <p className="text-white/60 max-w-2xl">
            Eternal intelligence at the moment of decision.
          </p>
        </motion.div>

        <div className="mt-8">
          <Aionyx />
        </div>

        <div className="mt-8 text-xs text-white/35">
          Build note: this is a visual “being layer.” Next step is wiring real signals (market data / telemetry / your Oracle logic).
        </div>
      </div>
    </main>
  );
}
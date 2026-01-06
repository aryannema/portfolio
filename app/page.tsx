"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type BootLine = {
  text: string;
  delayMs: number;
};

const BOOT_SKIP_KEY = "portfolio_boot_skipped_v1";
const AUDIO_KEY = "portfolio_audio_on_v1";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function HomePage() {
  const router = useRouter();

  const [linesShown, setLinesShown] = useState<string[]>([]);
  const [phase, setPhase] = useState<"booting" | "ready">("booting");
  const [audioOn, setAudioOn] = useState(true);

  const startedRef = useRef(false);

  const script: BootLine[] = useMemo(
    () => [
      { text: "ARYAN BIOS v0.8", delayMs: 450 },
      { text: "Checking memory... OK", delayMs: 350 },
      { text: "Detecting devices... OK", delayMs: 350 },
      { text: "Mounting cartridge: PORTFOLIO.NES", delayMs: 500 },
      { text: "Loading assets... OK", delayMs: 400 },
      { text: "Initializing engine... OK", delayMs: 450 },
      { text: "Boot complete.", delayMs: 300 },
    ],
    []
  );

  // Load preferences + optional skip
  useEffect(() => {
    const storedAudio = localStorage.getItem(AUDIO_KEY);
    if (storedAudio === "0") setAudioOn(false);

    const skip = localStorage.getItem(BOOT_SKIP_KEY);
    if (skip === "1") {
      setPhase("ready");
      setLinesShown(script.map((l) => l.text));
    }
  }, [script]);

  // Run boot typing
  useEffect(() => {
    if (phase !== "booting") return;
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      for (const line of script) {
        setLinesShown((prev) => [...prev, line.text]);
        await sleep(line.delayMs);
      }
      setPhase("ready");
    })();
  }, [phase, script]);

  async function playBeep() {
    if (!audioOn) return;

    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();

      // Some browsers keep AudioContext suspended until explicitly resumed.
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const o = ctx.createOscillator();
      const g = ctx.createGain();

      o.type = "square";
      o.frequency.setValueAtTime(880, ctx.currentTime);

      // Small envelope to avoid click/pop
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);

      o.connect(g);
      g.connect(ctx.destination);

      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.1);

      o.onended = () => {
        ctx.close().catch(() => {});
      };
    } catch {
      // ignore audio failures
    }
  }

  async function handleStart() {
    await playBeep();
    // skip boot next time (recommended UX)
    localStorage.setItem(BOOT_SKIP_KEY, "1");
    router.push("/game");
  }

  // Key controls (Space sometimes needs more robust handling + capture)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (phase !== "ready") return;

      const isEnter = e.key === "Enter";
      const isSpace =
        e.code === "Space" || e.key === " " || e.key === "Spacebar";

      if (!isEnter && !isSpace) return;

      // Prevent scroll/focus quirks
      e.preventDefault();
      e.stopPropagation();

      handleStart();
    }

    // capture helps ensure we receive Space even if something else consumes it
    window.addEventListener("keydown", onKeyDown, { capture: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown, {
        capture: true,
      } as any);
    };
  }, [phase]);

  function toggleAudio() {
    setAudioOn((v) => {
      const nv = !v;
      localStorage.setItem(AUDIO_KEY, nv ? "1" : "0");
      return nv;
    });
  }

  function replayBoot() {
    startedRef.current = false;
    localStorage.setItem(BOOT_SKIP_KEY, "0");
    setLinesShown([]);
    setPhase("booting");
  }

  return (
    <main className="crt crt-flicker min-h-screen text-[var(--crt-green)]">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="text-xs opacity-80">PORTFOLIO SYSTEM</div>

          <div className="flex items-center gap-3 text-[10px]">
            <button
              onClick={toggleAudio}
              className="rounded border border-[var(--crt-dim)] px-3 py-2 hover:opacity-90"
            >
              Audio: {audioOn ? "ON" : "OFF"}
            </button>

            <button
              onClick={replayBoot}
              className="rounded border border-[var(--crt-dim)] px-3 py-2 hover:opacity-90"
              title="Replay boot"
            >
              Replay
            </button>
          </div>
        </header>

        <section className="rounded border border-[var(--crt-dim)] p-5">
          <div className="space-y-2 text-[11px] leading-5">
            {linesShown.map((t, i) => (
              <div key={i} className="opacity-95">
                {t}
              </div>
            ))}

            {phase === "booting" && (
              <div className="mt-2 animate-pulse opacity-80">...</div>
            )}
          </div>
        </section>

        <footer className="mt-auto text-center">
          {phase === "ready" ? (
            <div className="space-y-3">
              <div className="text-xs opacity-90">
                PRESS ENTER / SPACE TO START
              </div>
              <button
                onClick={handleStart}
                className="rounded border border-[var(--crt-dim)] px-6 py-3 text-xs hover:opacity-90"
              >
                START
              </button>

              <div className="text-[10px] opacity-70">
                Tip: after the first run, boot will auto-skip.
              </div>
            </div>
          ) : (
            <div className="text-[10px] opacity-70">Booting...</div>
          )}
        </footer>
      </div>
    </main>
  );
}

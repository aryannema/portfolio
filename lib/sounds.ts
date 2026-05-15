let _ctx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try { _ctx = new AudioContext(); } catch { return null; }
  }
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

let muted = false;
export const setMuted = (v: boolean) => { muted = v; };
export const getMuted = () => muted;

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.25,
  delay = 0,
) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + delay);

  const t = ac.currentTime + delay;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.008);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function sweep(
  freqStart: number,
  freqEnd: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.2,
  delay = 0,
) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = type;
  const t = ac.currentTime + delay;
  osc.frequency.setValueAtTime(freqStart, t);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);

  gain.gain.setValueAtTime(volume, t);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.02);
}

// ── Public sounds ──────────────────────────────────────

export function playStartup() {
  // 4-note ascending chord arpeggio: C4 E4 G4 C5
  const notes = [261.63, 329.63, 392.0, 523.25];
  const step = 0.13;
  notes.forEach((f, i) => tone(f, 0.22, "sine", 0.22, i * step));
}

export function playWindowOpen() {
  tone(440, 0.07, "sine", 0.18);
  tone(660, 0.09, "sine", 0.14, 0.055);
}

export function playWindowClose() {
  tone(660, 0.07, "sine", 0.14);
  tone(440, 0.09, "sine", 0.12, 0.055);
}

export function playMinimize() {
  sweep(600, 200, 0.14, "sine", 0.18);
}

export function playRestore() {
  sweep(200, 600, 0.12, "sine", 0.18);
}

export function playClick() {
  tone(900, 0.022, "square", 0.12);
}

export function playError() {
  tone(320, 0.14, "square", 0.22);
  tone(240, 0.18, "square", 0.2, 0.16);
}

export function playSuccess() {
  tone(523.25, 0.1, "sine", 0.2);
  tone(659.25, 0.14, "sine", 0.18, 0.1);
}

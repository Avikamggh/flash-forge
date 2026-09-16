'use client';

let soundMuted = false;

export function isSoundMuted() {
  return soundMuted;
}

export function setSoundMuted(muted: boolean) {
  soundMuted = muted;
  return soundMuted;
}

export function toggleSound() {
  soundMuted = !soundMuted;
  return soundMuted;
}

/**
 * Flash sale sound effect using Web Audio API — no external files needed.
 * Generates a punchy alert sound programmatically.
 */
export function playFlashSaleSound() {
  if (soundMuted) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration * 0.3);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Rising chord — dramatic flash sale initiation sound
    playTone(220, now, 0.15, 'sawtooth', 0.15);
    playTone(330, now + 0.08, 0.15, 'sawtooth', 0.15);
    playTone(440, now + 0.16, 0.2, 'sawtooth', 0.18);
    playTone(660, now + 0.24, 0.3, 'square', 0.12);
    // Impact thump
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(80, now + 0.3);
    noise.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    noiseGain.gain.setValueAtTime(0.3, now + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    noise.start(now + 0.3);
    noise.stop(now + 0.5);
  } catch (_) {
    // Silently fail if Web Audio not available
  }
}

export function playInstanceSpawnSound() {
  if (soundMuted) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

export function playChaosSound() {
  if (soundMuted) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    // Descending alarm
    [800, 600, 400, 200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gainNode.gain.setValueAtTime(0.12, now + i * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.1);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.1);
    });
  } catch (_) {}
}

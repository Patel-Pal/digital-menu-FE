import { useCallback, useRef } from 'react';

export type SoundPreset = 'chime' | 'bell' | 'ding' | 'pop' | 'alert';

interface NotificationSoundOptions {
  volume?: number; // 0 to 1
  preset?: SoundPreset;
}

const audioCtxRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
    audioCtxRef.current = new AudioContext();
  }
  if (audioCtxRef.current.state === 'suspended') {
    audioCtxRef.current.resume();
  }
  return audioCtxRef.current;
}

function playChime(ctx: AudioContext, volume: number) {
  const g = ctx.createGain();
  g.connect(ctx.destination);
  g.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

  const o1 = ctx.createOscillator();
  o1.type = 'sine';
  o1.frequency.setValueAtTime(880, ctx.currentTime);
  o1.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
  o1.connect(g);
  o1.start(ctx.currentTime);
  o1.stop(ctx.currentTime + 0.8);
}

function playBell(ctx: AudioContext, volume: number) {
  const g = ctx.createGain();
  g.connect(ctx.destination);
  g.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(660, ctx.currentTime);
  o.connect(g);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 1.2);

  // Harmonic
  const g2 = ctx.createGain();
  g2.connect(ctx.destination);
  g2.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
  g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  const o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.setValueAtTime(1320, ctx.currentTime);
  o2.connect(g2);
  o2.start(ctx.currentTime);
  o2.stop(ctx.currentTime + 0.8);
}

function playDing(ctx: AudioContext, volume: number) {
  const g = ctx.createGain();
  g.connect(ctx.destination);
  g.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  const o = ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.setValueAtTime(1200, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
  o.connect(g);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.5);
}

function playPop(ctx: AudioContext, volume: number) {
  const g = ctx.createGain();
  g.connect(ctx.destination);
  g.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(600, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
  o.connect(g);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.2);
}

function playAlert(ctx: AudioContext, volume: number) {
  [0, 0.2, 0.4].forEach((delay) => {
    const g = ctx.createGain();
    g.connect(ctx.destination);
    g.gain.setValueAtTime(volume * 0.35, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);

    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(800, ctx.currentTime + delay);
    o.connect(g);
    o.start(ctx.currentTime + delay);
    o.stop(ctx.currentTime + delay + 0.18);
  });
}

const SOUND_MAP: Record<SoundPreset, (ctx: AudioContext, vol: number) => void> = {
  chime: playChime,
  bell: playBell,
  ding: playDing,
  pop: playPop,
  alert: playAlert,
};

export const SOUND_LABELS: Record<SoundPreset, string> = {
  chime: 'Chime',
  bell: 'Bell',
  ding: 'Ding',
  pop: 'Pop',
  alert: 'Alert',
};

export function playNotificationSound(preset: SoundPreset = 'chime', volume: number = 0.7) {
  try {
    const ctx = getAudioContext();
    SOUND_MAP[preset](ctx, Math.max(0, Math.min(1, volume)));
  } catch (e) {
    console.warn('Failed to play notification sound:', e);
  }
}

export function useNotificationSound(options?: NotificationSoundOptions) {
  const lastPlayedRef = useRef(0);

  const play = useCallback((overridePreset?: SoundPreset) => {
    // Debounce: don't play more than once per 500ms
    const now = Date.now();
    if (now - lastPlayedRef.current < 500) return;
    lastPlayedRef.current = now;

    const preset = overridePreset || options?.preset || 'chime';
    const volume = options?.volume ?? 0.7;
    playNotificationSound(preset, volume);
  }, [options?.preset, options?.volume]);

  return { play };
}

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { type SoundPreset, playNotificationSound } from '@/hooks/useNotificationSound';

interface NotificationSoundSettings {
  enabled: boolean;
  preset: SoundPreset;
  volume: number; // 0 to 1
}

interface NotificationSoundContextType {
  settings: NotificationSoundSettings;
  updateSettings: (partial: Partial<NotificationSoundSettings>) => void;
  playSound: (overridePreset?: SoundPreset) => void;
}

const STORAGE_KEY = 'notification_sound_settings';

const DEFAULT_SETTINGS: NotificationSoundSettings = {
  enabled: true,
  preset: 'chime',
  volume: 0.7,
};

function loadSettings(): NotificationSoundSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

const NotificationSoundContext = createContext<NotificationSoundContextType | null>(null);

export function NotificationSoundProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSoundSettings>(loadSettings);
  const lastPlayedRef = useRef(0);

  const updateSettings = useCallback((partial: Partial<NotificationSoundSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const playSound = useCallback((overridePreset?: SoundPreset) => {
    if (!settings.enabled) return;
    const now = Date.now();
    if (now - lastPlayedRef.current < 500) return;
    lastPlayedRef.current = now;
    playNotificationSound(overridePreset || settings.preset, settings.volume);
  }, [settings.enabled, settings.preset, settings.volume]);

  return (
    <NotificationSoundContext.Provider value={{ settings, updateSettings, playSound }}>
      {children}
    </NotificationSoundContext.Provider>
  );
}

export function useNotificationSoundSettings() {
  const ctx = useContext(NotificationSoundContext);
  if (!ctx) throw new Error('useNotificationSoundSettings must be used within NotificationSoundProvider');
  return ctx;
}

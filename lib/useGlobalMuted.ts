import { useSyncExternalStore } from "react";

// Status mute dibagi ke semua kartu video: sekali user menyalakan suara,
// video berikutnya otomatis bersuara (browser baru mengizinkan setelah interaksi).
let muted = true;
const listeners = new Set<() => void>();

export function setGlobalMuted(value: boolean) {
  muted = value;
  listeners.forEach((l) => l());
}

export function useGlobalMuted(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => muted,
    () => true
  );
}

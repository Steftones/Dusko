export interface SceneHandle {
  flash: (synthName: string, durationSec: number) => void;
  setTimeOfDay: (t: number) => void;
}

export const fadeMsForDuration = (durationSec: number): number => {
  const sec = Number.isFinite(durationSec) ? durationSec : 0.3;
  return Math.max(50, Math.min(sec * 1000, 2000));
};

export const parseFlashLine = (line: string): { name: string; duration: number } | null => {
  if (!line.startsWith("FLASH:")) return null;
  const [name, durStr] = line.slice("FLASH:".length).split(":");
  return { name, duration: parseFloat(durStr) };
};

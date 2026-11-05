import { useEffect, useState, type ChangeEvent, type RefObject } from "react";
import type { SceneHandle } from "../sc/flash";

interface PlaybackControlsDeps {
  sceneRef: RefObject<SceneHandle>;
  controlsReady: boolean;
  setTempo: (bpm: number) => void;
  setVolume: (amp: number) => void;
  setMusicMode: (t: number) => void;
}

export const usePlaybackControls = ({
  sceneRef,
  controlsReady,
  setTempo,
  setVolume,
  setMusicMode,
}: PlaybackControlsDeps) => {
  const [tempo, setTempoValue] = useState(190);
  const [volume, setVolumeValue] = useState(1);
  const [timeOfDay, setTimeOfDayValue] = useState(0);

  const handleTempoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const bpm = Number(e.target.value);
    setTempoValue(bpm);
    setTempo(bpm);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const amp = Number(e.target.value);
    setVolumeValue(amp);
    setVolume(amp);
  };

  const handleTimeOfDayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setTimeOfDayValue(t);
    sceneRef.current?.setTimeOfDay(t);
    if (controlsReady) setMusicMode(t);
  };

  useEffect(() => {
    if (controlsReady) setMusicMode(timeOfDay);
  }, [controlsReady]);

  return {
    tempo,
    volume,
    timeOfDay,
    handleTempoChange,
    handleVolumeChange,
    handleTimeOfDayChange,
  };
};

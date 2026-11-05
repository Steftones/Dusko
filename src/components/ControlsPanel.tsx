import type { ChangeEvent } from "react";
import SliderRow from "./SliderRow";

interface ControlsPanelProps {
  status: string;
  controlsReady: boolean;
  tempo: number;
  volume: number;
  timeOfDay: number;
  onTempoChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onVolumeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTimeOfDayChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ControlsPanel = ({
  status,
  controlsReady,
  tempo,
  volume,
  timeOfDay,
  onTempoChange,
  onVolumeChange,
  onTimeOfDayChange,
}: ControlsPanelProps) => (
  <>
    <div className="status">Status: {status}</div>
    <SliderRow
      id="tempo"
      label={`Tempo: ${tempo} bpm`}
      min={120}
      max={250}
      step={1}
      value={tempo}
      disabled={!controlsReady}
      onChange={onTempoChange}
    />
    <SliderRow
      id="volume"
      label={`Volume: ${Math.round(volume * 100)}%`}
      min={0}
      max={1.5}
      step={0.01}
      value={volume}
      disabled={!controlsReady}
      onChange={onVolumeChange}
    />
    <SliderRow
      id="time-of-day"
      label="Daylight"
      min={0}
      max={1}
      step={0.01}
      value={timeOfDay}
      onChange={onTimeOfDayChange}
    />
    <div className="hint">Click on the scene to show/hide this panel</div>
  </>
);

export default ControlsPanel;

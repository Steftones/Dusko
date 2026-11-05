import { useRef, useState } from "react";
import AboutPanel from "./components/AboutPanel";
import CityScene from "./components/CityScene";
import ControlsPanel from "./components/ControlsPanel";
import MobileWarning from "./components/MobileWarning";
import TabBar, { type Tab } from "./components/TabBar";
import { usePlaybackControls } from "./hooks/usePlaybackControls";
import { useSuperCollider } from "./sc/useSuperCollider";
import type { SceneHandle } from "./sc/flash";

const isMobileDevice = () =>
  window.matchMedia("(pointer: coarse)").matches &&
  window.matchMedia("(hover: none)").matches;

const App = () => {
  const cityRef = useRef<SceneHandle>(null);
  const {
    status,
    isPlaying,
    togglePlay,
    setTempo,
    setVolume,
    setMusicMode,
    controlsReady,
  } = useSuperCollider({
    scene: cityRef,
  });

  const {
    tempo,
    volume,
    timeOfDay,
    handleTempoChange,
    handleVolumeChange,
    handleTimeOfDayChange,
  } = usePlaybackControls({
    sceneRef: cityRef,
    controlsReady,
    setTempo,
    setVolume,
    setMusicMode,
  });

  const [controlsHidden, setControlsHidden] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(isMobileDevice);
  const [activeTab, setActiveTab] = useState<Tab>("controls");

  const handleSceneClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".controls")) return;
    setControlsHidden((hidden) => !hidden);
  };

  return (
    <div className="app-root" onClick={handleSceneClick}>
      <CityScene ref={cityRef} className="city-scene" />

      <div
        className={`controls${controlsHidden ? " controls-hidden" : ""}`}
        aria-hidden={controlsHidden}
      >
        <h1>Dusko</h1>
        <p className="subtitle">
          A procedurally generated music app using SuperCollider in the browser
        </p>

        {showMobileWarning ? (
          <MobileWarning onContinue={() => setShowMobileWarning(false)} />
        ) : (
          <>
            <TabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
            />

            <div className="tab-content" key={activeTab}>
              {activeTab === "controls" ? (
                <ControlsPanel
                  status={status}
                  controlsReady={controlsReady}
                  tempo={tempo}
                  volume={volume}
                  timeOfDay={timeOfDay}
                  onTempoChange={handleTempoChange}
                  onVolumeChange={handleVolumeChange}
                  onTimeOfDayChange={handleTimeOfDayChange}
                />
              ) : (
                <AboutPanel />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;

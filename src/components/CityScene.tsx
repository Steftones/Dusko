import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createCityScene, type CitySceneApi } from "../scene/createCityScene";
import type { SceneHandle } from "../sc/flash";

const CityScene = forwardRef<SceneHandle, { className?: string }>(({ className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneApiRef = useRef<CitySceneApi | null>(null);

  useImperativeHandle(ref, () => ({
    flash(synthName, durationSec) {
      sceneApiRef.current?.flash(synthName, durationSec);
    },
    setTimeOfDay(t) {
      sceneApiRef.current?.setTimeOfDay(t);
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const api = createCityScene(container);
    sceneApiRef.current = api;

    return () => {
      sceneApiRef.current = null;
      api.dispose();
    };
  }, []);

  return <div ref={containerRef} className={className} />;
});

CityScene.displayName = "CityScene";

export default CityScene;

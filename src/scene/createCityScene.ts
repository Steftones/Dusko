import * as THREE from "three";
import { fadeMsForDuration } from "../sc/flash";
import { createAtmosphere } from "./atmosphere";
import { createBuildings } from "./buildings";
import { makeGlowTexture } from "./glow";
import { ReactiveRegistry } from "./reactive";
import { observeResize, startRenderLoop } from "./renderLoop";
import { mulberry32 } from "./rng";
import { createBaseScene } from "./sceneSetup";
import { createTimeOfDayController } from "./timeOfDay";

export interface CitySceneApi {
  flash(synthName: string, durationSec: number): void;
  setTimeOfDay(t: number): void;
  dispose(): void;
}

export const createCityScene = (container: HTMLElement): CitySceneApi => {
  const rng = mulberry32(1337);
  const registry = new ReactiveRegistry();
  const spriteMaterials: THREE.SpriteMaterial[] = [];

  const { scene, camera, renderer, fog, hemi, horizonLight, cameraBasePos, cameraBaseLookAt } =
    createBaseScene(container);

  const glowTexture = makeGlowTexture();

  const { horizonGlow, sunGlow, baseState } = createAtmosphere(
    scene,
    registry,
    glowTexture,
    fog,
    hemi,
    horizonLight,
    spriteMaterials,
  );

  const { windowMaterial } = createBuildings(scene, rng, registry, glowTexture, spriteMaterials);

  const applyTimeOfDay = createTimeOfDayController({
    scene,
    fog,
    hemi,
    horizonLight,
    horizonGlow,
    sunGlow,
    windowMaterial,
    renderer,
    baseState,
  });
  applyTimeOfDay(0);

  const resizeObserver = observeResize(container, camera, renderer);
  const stopRenderLoop = startRenderLoop(renderer, scene, camera, cameraBasePos, cameraBaseLookAt, registry);

  return {
    flash(synthName, durationSec) {
      const decayMs = Math.max(80, fadeMsForDuration(durationSec));
      registry.pulse("main", decayMs);
      registry.pulse(synthName, decayMs);
    },
    setTimeOfDay(t) {
      applyTimeOfDay(t);
    },
    dispose() {
      stopRenderLoop();
      resizeObserver.disconnect();
      container.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((m) => m.dispose());
        }
      });
      spriteMaterials.forEach((m) => m.dispose());
      glowTexture.dispose();
      renderer.dispose();
    },
  };
};

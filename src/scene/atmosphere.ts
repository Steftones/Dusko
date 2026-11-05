import * as THREE from "three";
import { PALETTE } from "./palette";
import { ReactiveRegistry } from "./reactive";

export interface AtmosphereBaseState {
  fogDensity: number;
  hemiIntensity: number;
  horizonIntensity: number;
  glowOpacity: number;
}

export interface Atmosphere {
  horizonGlow: THREE.Sprite;
  sunGlow: THREE.Sprite;
  baseState: AtmosphereBaseState;
}

export const createAtmosphere = (
  scene: THREE.Scene,
  registry: ReactiveRegistry,
  glowTexture: THREE.Texture,
  fog: THREE.FogExp2,
  hemi: THREE.HemisphereLight,
  horizonLight: THREE.PointLight,
  spriteMaterials: THREE.SpriteMaterial[],
): Atmosphere => {
  const horizonGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: PALETTE.warmOrange,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  horizonGlow.position.set(0, 6, -28);
  horizonGlow.scale.set(26, 26, 1);
  scene.add(horizonGlow);
  spriteMaterials.push(horizonGlow.material as THREE.SpriteMaterial);
  const horizonGlowBaseScale = 26;

  const baseState: AtmosphereBaseState = {
    fogDensity: 0.045,
    hemiIntensity: 0.6,
    horizonIntensity: 4,
    glowOpacity: 0.55,
  };

  const sunGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: PALETTE.warmOrange,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    }),
  );
  sunGlow.position.set(0, 6, -28);
  scene.add(sunGlow);
  spriteMaterials.push(sunGlow.material as THREE.SpriteMaterial);

  registry.add("main", {
    pulse: 0,
    decayMs: 300,
    update: (p) => {
      const s = horizonGlowBaseScale * (1 + p * 0.35);
      horizonGlow.scale.set(s, s, 1);
      (horizonGlow.material as THREE.SpriteMaterial).opacity = baseState.glowOpacity + p * 0.35;
      horizonLight.intensity = baseState.horizonIntensity + p * 6;
    },
  });

  registry.add("breath", {
    pulse: 0,
    decayMs: 1500,
    update: (p) => {
      fog.density = baseState.fogDensity - p * 0.015;
      hemi.intensity = baseState.hemiIntensity + p * 0.5;
    },
  });

  return { horizonGlow, sunGlow, baseState };
};

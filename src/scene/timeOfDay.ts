import * as THREE from "three";
import { PALETTE } from "./palette";
import type { AtmosphereBaseState } from "./atmosphere";

export interface TimeOfDayDeps {
  scene: THREE.Scene;
  fog: THREE.FogExp2;
  hemi: THREE.HemisphereLight;
  horizonLight: THREE.PointLight;
  horizonGlow: THREE.Sprite;
  sunGlow: THREE.Sprite;
  windowMaterial: THREE.MeshBasicMaterial;
  renderer: THREE.WebGLRenderer;
  baseState: AtmosphereBaseState;
}

export const createTimeOfDayController = ({
  scene,
  fog,
  hemi,
  horizonLight,
  horizonGlow,
  sunGlow,
  windowMaterial,
  renderer,
  baseState,
}: TimeOfDayDeps) => {
  const nightSky = new THREE.Color(PALETTE.fog);
  const daySky = new THREE.Color(0x9fc9dc);
  const nightHemiSky = new THREE.Color(0x3a4420);
  const dayHemiSky = new THREE.Color(0xfff2d9);
  const nightHemiGround = new THREE.Color(0x05060a);
  const dayHemiGround = new THREE.Color(0x6b6354);
  const nightHorizonColor = new THREE.Color(PALETTE.warmOrange);
  const dayHorizonColor = new THREE.Color(0xfff0c2);
  const twilightColor = new THREE.Color(0xff2f8f);

  return (t: number) => {
    t = THREE.MathUtils.clamp(t, 0, 1);
    const twilight = Math.max(0, 1 - Math.abs(t - 0.3) / 0.3);

    const skyColor = nightSky.clone().lerp(daySky, t);
    scene.background = skyColor;
    fog.color = skyColor;

    hemi.color.copy(nightHemiSky).lerp(dayHemiSky, t);
    hemi.groundColor.copy(nightHemiGround).lerp(dayHemiGround, t);

    horizonLight.color.copy(nightHorizonColor).lerp(dayHorizonColor, t);
    (horizonGlow.material as THREE.SpriteMaterial).color.copy(nightHorizonColor).lerp(dayHorizonColor, t);

    baseState.fogDensity = THREE.MathUtils.lerp(0.045, 0.025, t);
    fog.density = baseState.fogDensity;
    baseState.hemiIntensity = THREE.MathUtils.lerp(0.6, 1.1, t);
    hemi.intensity = baseState.hemiIntensity;
    baseState.horizonIntensity = THREE.MathUtils.lerp(4, 2, t);
    horizonLight.intensity = baseState.horizonIntensity;
    const glowVisibility = THREE.MathUtils.smoothstep(t, 0.1, 0.2);
    baseState.glowOpacity = THREE.MathUtils.lerp(0.55, 0.12, t) * glowVisibility;
    (horizonGlow.material as THREE.SpriteMaterial).opacity = baseState.glowOpacity;

    const sunMaterial = sunGlow.material as THREE.SpriteMaterial;
    sunMaterial.opacity = (THREE.MathUtils.lerp(0.55, 0.12, t) + twilight * 0.4) * glowVisibility;
    sunMaterial.color.copy(nightHorizonColor).lerp(dayHorizonColor, t).lerp(twilightColor, twilight * 0.85);
    const sunScale = 26 * (1 + twilight * 0.6);
    sunGlow.scale.set(sunScale, sunScale, 1);

    windowMaterial.opacity = THREE.MathUtils.clamp(1 - t * 2, 0, 1);

    renderer.toneMappingExposure = THREE.MathUtils.lerp(1.15, 1.3, t);
  };
};

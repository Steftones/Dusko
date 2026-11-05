import * as THREE from "three";
import { PALETTE } from "./palette";

export interface BaseScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  fog: THREE.FogExp2;
  hemi: THREE.HemisphereLight;
  horizonLight: THREE.PointLight;
  cameraBasePos: THREE.Vector3;
  cameraBaseLookAt: THREE.Vector3;
}

export const createBaseScene = (container: HTMLElement): BaseScene => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.fog);
  const fog = new THREE.FogExp2(PALETTE.fog, 0.045);
  scene.fog = fog;

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
  const cameraBasePos = new THREE.Vector3(2, 8, 20);
  const cameraBaseLookAt = new THREE.Vector3(-1, 4, -18);
  camera.position.copy(cameraBasePos);
  camera.lookAt(cameraBaseLookAt);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0x3a4420, 0x05060a, 0.6);
  scene.add(hemi);
  const horizonLight = new THREE.PointLight(PALETTE.warmOrange, 4, 40, 2);
  horizonLight.position.set(0, 5, -26);
  scene.add(horizonLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x0a0b06, roughness: 0.9 }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  return { scene, camera, renderer, fog, hemi, horizonLight, cameraBasePos, cameraBaseLookAt };
};

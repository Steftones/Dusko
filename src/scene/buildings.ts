import * as THREE from "three";
import { PALETTE } from "./palette";
import { addBurst } from "./glow";
import { ReactiveRegistry, towerReaction } from "./reactive";

export interface BuildingDef {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  synth?: string;
  tint?: number;
  burst?: boolean;
}

export interface BuildingsResult {
  windowMaterial: THREE.MeshBasicMaterial;
}

export const createBuildings = (
  scene: THREE.Scene,
  rng: () => number,
  registry: ReactiveRegistry,
  glowTexture: THREE.Texture,
  spriteMaterials: THREE.SpriteMaterial[],
): BuildingsResult => {
  for (let i = 0; i < 104; i++) rng();

  const decorativeDefs: BuildingDef[] = [];
  for (let i = 0; i < 30; i++) {
    decorativeDefs.push({
      x: (rng() - 0.5) * 42,
      z: -9 - rng() * 34,
      width: 2 + rng() * 4,
      depth: 2 + rng() * 4,
      height: 5 + rng() * 16,
    });
  }

  const glitch2Building = decorativeDefs.reduce((tallest, def) => (def.height > tallest.height ? def : tallest));
  glitch2Building.synth = "glitch2";
  glitch2Building.tint = PALETTE.cyanTeal;

  const buildingDefs: BuildingDef[] = [
    ...decorativeDefs,

    { x: -4.4, z: -3, width: 2.6, depth: 2.6, height: 11, synth: "rim3", tint: PALETTE.cyanTeal },
    { x: 4.4, z: -3, width: 2.6, depth: 2.6, height: 11, synth: "kick", tint: PALETTE.warmOrange },
    { x: 0, z: -4.5, width: 2, depth: 2, height: 8.5, synth: "kick2", tint: PALETTE.emberRed, burst: true },
    { x: -3.8, z: -7, width: 2.2, depth: 2.2, height: 7.5, synth: "rim", tint: PALETTE.neonTeal },
    { x: 3.8, z: -7, width: 2.2, depth: 2.2, height: 7.5, synth: "rim", tint: PALETTE.neonTeal },
    { x: -5.4, z: -8, width: 2, depth: 2, height: 6, synth: "rim3", tint: PALETTE.cyanTeal },
    { x: -2.6, z: -0.6, width: 1.7, depth: 1.7, height: 5, synth: "rim2", tint: PALETTE.cream },
    { x: 0, z: 2, width: 2.6, depth: 2.6, height: 4, synth: "bass", tint: PALETTE.warmOrange, burst: true },
  ];

  const buildingMeshes: { mesh: THREE.Mesh; def: BuildingDef }[] = [];

  buildingDefs.forEach((def) => {
    const geometry = new THREE.BoxGeometry(def.width, def.height, def.depth);
    const material = new THREE.MeshStandardMaterial({
      color: PALETTE.buildingBase,
      roughness: 0.75,
      metalness: 0.1,
      emissive: def.tint ?? 0x000000,
      emissiveIntensity: 0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(def.x + (rng() - 0.5) * 0.6, def.height / 2, def.z + (rng() - 0.5) * 0.6);
    scene.add(mesh);
    buildingMeshes.push({ mesh, def });

    if (!def.synth) return;
    registry.add(def.synth, towerReaction(mesh, material, def.height));
    if (def.burst) {
      const applyBurst = addBurst(
        scene,
        glowTexture,
        spriteMaterials,
        new THREE.Vector3(mesh.position.x, def.height * 0.7, mesh.position.z),
        def.tint ?? 0xffffff,
        3.5,
      );
      registry.add(def.synth, { pulse: 0, decayMs: 300, update: applyBurst });
    }
  });

  registry.alias("snare2", "rim2");
  registry.alias("bass2", "bass");
  registry.aliasFirst("glitch", "rim3");

  const windowMaterial = new THREE.MeshBasicMaterial({ color: PALETTE.cream, transparent: true, opacity: 1 });
  const windowGeometry = new THREE.PlaneGeometry(0.22, 0.32);
  buildingMeshes.forEach(({ def }) => {
    if (def.height < 6) return;
    const count = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i++) {
      const window_ = new THREE.Mesh(windowGeometry, windowMaterial);
      const faceZ = def.z + def.depth / 2 + 0.02;
      window_.position.set(
        def.x + (rng() - 0.5) * (def.width - 0.6),
        (rng() * 0.7 + 0.15) * def.height,
        faceZ,
      );
      scene.add(window_);
    }
  });

  return { windowMaterial };
};

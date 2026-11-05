import * as THREE from "three";

export const makeGlowTexture = (): THREE.Texture => {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export const addBurst = (
  scene: THREE.Scene,
  glowTexture: THREE.Texture,
  spriteMaterials: THREE.SpriteMaterial[],
  position: THREE.Vector3,
  color: number,
  baseScale: number,
): ((p: number) => void) => {
  const material = new THREE.SpriteMaterial({
    map: glowTexture,
    color,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  spriteMaterials.push(material);
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(baseScale, baseScale, 1);
  scene.add(sprite);
  return (p: number) => {
    material.opacity = p * 0.85;
    const s = baseScale * (0.6 + p * 0.8);
    sprite.scale.set(s, s, 1);
  };
};

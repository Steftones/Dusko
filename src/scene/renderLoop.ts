import * as THREE from "three";
import type { ReactiveRegistry } from "./reactive";

export const observeResize = (
  container: HTMLElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
): ResizeObserver => {
  const resize = () => {
    const { clientWidth, clientHeight } = container;
    if (clientWidth === 0 || clientHeight === 0) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  return resizeObserver;
};

export const startRenderLoop = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  cameraBasePos: THREE.Vector3,
  cameraBaseLookAt: THREE.Vector3,
  registry: ReactiveRegistry,
): (() => void) => {
  let lastFrameTime = performance.now();
  let elapsedMs = 0;
  let frameId = 0;

  const animate = () => {
    frameId = requestAnimationFrame(animate);
    const now = performance.now();
    const dtMs = now - lastFrameTime;
    lastFrameTime = now;
    elapsedMs += dtMs;
    registry.tick(dtMs);

    const t = elapsedMs / 1000;
    camera.position.set(
      cameraBasePos.x + Math.sin(t * 0.05) * 3,
      cameraBasePos.y + Math.sin(t * 0.07 + 1.3) * 0.8,
      cameraBasePos.z + Math.cos(t * 0.04) * 2,
    );
    camera.lookAt(
      cameraBaseLookAt.x + Math.sin(t * 0.035) * 2,
      cameraBaseLookAt.y + Math.cos(t * 0.05) * 0.4,
      cameraBaseLookAt.z,
    );

    renderer.render(scene, camera);
  };
  animate();

  return () => cancelAnimationFrame(frameId);
};

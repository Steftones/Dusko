import * as THREE from "three";

export interface ReactiveElement {
  pulse: number;
  decayMs: number;
  update: (easedPulse: number) => void;
}

export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);

export const towerReaction = (
  mesh: THREE.Mesh,
  material: THREE.MeshStandardMaterial,
  height: number,
  amplitude = 0.22,
): ReactiveElement => ({
  pulse: 0,
  decayMs: 300,
  update: (p) => {
    const stretch = 1 + p * amplitude;
    mesh.scale.y = stretch;
    mesh.position.y = (height * stretch) / 2;
    material.emissiveIntensity = p * 1.6;
  },
});

export class ReactiveRegistry {
  private elements: ReactiveElement[] = [];
  private byTarget = new Map<string, ReactiveElement[]>();

  add(target: string, element: ReactiveElement): void {
    this.elements.push(element);
    const list = this.byTarget.get(target);
    if (list) list.push(element);
    else this.byTarget.set(target, [element]);
  }

  alias(target: string, source: string): void {
    const list = this.byTarget.get(source);
    if (list) this.byTarget.set(target, list);
  }

  aliasFirst(target: string, source: string): void {
    const first = this.byTarget.get(source)?.[0];
    if (first) this.byTarget.set(target, [first]);
  }

  pulse(target: string, decayMs: number): void {
    this.byTarget.get(target)?.forEach((el) => {
      el.pulse = 1;
      el.decayMs = decayMs;
    });
  }

  tick(dtMs: number): void {
    this.elements.forEach((el) => {
      if (el.pulse <= 0) return;
      el.pulse = Math.max(0, el.pulse - dtMs / el.decayMs);
      el.update(easeOutCubic(el.pulse));
    });
  }
}

import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { elasticity, G, gravity, GRAV_SOFTENING_PX } from './forces';

const v = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);
const EPS2 = GRAV_SOFTENING_PX * GRAV_SOFTENING_PX;
const plummer = (r: number, scale: number) => (scale * G * r) / Math.pow(r * r + EPS2, 1.5);

describe('gravity', () => {
  it('pulls the particle toward the mouse with Plummer-softened magnitude', () => {
    const force = gravity(v(400, 0), v(0, 0), 16, null);
    expect(force.x).toBeCloseTo(plummer(400, 16));
    expect(force.y).toBeCloseTo(0);
    expect(force.z).toBeCloseTo(0);
  });

  it('tapers to zero approaching the attractor', () => {
    const force = gravity(v(0.001, 0), v(0, 0), 4, null);
    expect(force.length()).toBeCloseTo(0);
  });

  it('peaks at r = ε/√2', () => {
    const rPeak = GRAV_SOFTENING_PX / Math.SQRT2;
    const peak = gravity(v(rPeak, 0), v(0, 0), 4, null).length();
    expect(peak).toBeCloseTo(plummer(rPeak, 4));
    expect(gravity(v(rPeak * 0.9, 0), v(0, 0), 4, null).length()).toBeLessThan(peak);
    expect(gravity(v(rPeak * 1.1, 0), v(0, 0), 4, null).length()).toBeLessThan(peak);
  });

  it('returns zero when the mouse is on the particle', () => {
    const force = gravity(v(10, 10), v(10, 10), 5, null);
    expect(force.length()).toBe(0);
  });

  it('returns zero outside the radius', () => {
    const force = gravity(v(300, 0), v(0, 0), 5, 250);
    expect(force.length()).toBe(0);
  });

  it('applies force at exactly the radius', () => {
    const force = gravity(v(250, 0), v(0, 0), 5, 250);
    expect(force.length()).toBeGreaterThan(0);
  });
});

describe('elasticity', () => {
  it('pulls back toward the anchor proportional to displacement', () => {
    const force = elasticity(v(0, 0), v(10, -5), v(0, 0), 2, 0);
    expect(force.x).toBeCloseTo(-20);
    expect(force.y).toBeCloseTo(10);
  });

  it('damps opposite to velocity', () => {
    const force = elasticity(v(0, 0), v(0, 0), v(3, 4), 2, 0.5);
    expect(force.x).toBeCloseTo(-1.5);
    expect(force.y).toBeCloseTo(-2);
  });

  it('does not mutate its inputs', () => {
    const position = v(10, 0);
    const velocity = v(1, 1);
    elasticity(v(0, 0), position, velocity, 2, 0.5);
    expect(position.toArray()).toEqual([10, 0, 0]);
    expect(velocity.toArray()).toEqual([1, 1, 0]);
  });
});

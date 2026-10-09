import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { elasticity, G, gravity, GRAV_SOFTENING_PX } from './forces';

const v = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);
const EPS2 = GRAV_SOFTENING_PX * GRAV_SOFTENING_PX;

describe('gravity', () => {
  it('pulls the particle toward the mouse with softened inverse-square magnitude', () => {
    const force = gravity(v(400, 0), v(0, 0), 16, null);
    expect(force.x).toBeCloseTo((G * 16) / (400 * 400 + EPS2));
    expect(force.y).toBeCloseTo(0);
    expect(force.z).toBeCloseTo(0);
  });

  it('stays finite near the attractor, peaking at scale * G / ε^2', () => {
    const force = gravity(v(0.001, 0), v(0, 0), 4, null);
    expect(force.length()).toBeCloseTo((G * 4) / EPS2);
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

  it('uses the default scale when undefined is passed', () => {
    const force = gravity(v(400, 0), v(0, 0), undefined, null);
    expect(force.x).toBeCloseTo((G * 5) / (400 * 400 + EPS2));
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

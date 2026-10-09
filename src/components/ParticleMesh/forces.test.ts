import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { elasticity, gravity } from './forces';

const v = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);

describe('gravity', () => {
  it('pulls the particle toward the mouse with inverse-square magnitude', () => {
    const force = gravity(v(400, 0), v(0, 0), 160000, null);
    expect(force.x).toBeCloseTo(1);
    expect(force.y).toBeCloseTo(0);
    expect(force.z).toBeCloseTo(0);
  });

  it('caps the magnitude inside the 200px min distance', () => {
    const atCap = gravity(v(200, 0), v(0, 0), 40000, null);
    const inside = gravity(v(50, 0), v(0, 0), 40000, null);
    expect(atCap.length()).toBeCloseTo(1);
    expect(inside.length()).toBeCloseTo(1);
  });

  it('returns zero when the mouse is on the particle', () => {
    const force = gravity(v(10, 10), v(10, 10), 50000, null);
    expect(force.length()).toBe(0);
  });

  it('returns zero outside the radius', () => {
    const force = gravity(v(300, 0), v(0, 0), 50000, 250);
    expect(force.length()).toBe(0);
  });

  it('applies force at exactly the radius', () => {
    const force = gravity(v(250, 0), v(0, 0), 50000, 250);
    expect(force.length()).toBeGreaterThan(0);
  });

  it('uses the default strength when undefined is passed', () => {
    const force = gravity(v(400, 0), v(0, 0), undefined, null);
    expect(force.x).toBeCloseTo(50000 / (400 * 400));
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

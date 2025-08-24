import { useEffect, useState } from 'react';
import * as THREE from 'three';

class Settings {
  // particles
  private _cols = 80
  private _count: number | null = null

  // canvas
  private _width = window.innerWidth // px
  private _height = window.innerHeight // px

  // environment
  mouseGravityStrength = 2.0
  mouseGravityRadiusPx = 150.0
  springConstant = 0.1
  dampingConstant = 0.1
  
  set cols(value: number) {
    this._cols = value;
    this._count = null;
  }
  
  private get _rows() {
    const aspect = this._width / this._height
    return Math.floor(this._cols / aspect)
  }

  get count() {
    if (this._count === null) {
      this._count = this._rows * this._cols;
    }
    return this._count;
  }

  get width() {
    return this._width
  }

  get height() {
    return this._height
  }

  findParticlePosition(index: number) {
    const column = Math.floor(index / this._rows); // x
    const row = index % this._rows; // y

    const padding = 0.9

    const offsetX = (this._width) / this._cols * padding
    const offsetY = (this._height) / this._rows * padding

    const gridMidpoint = new THREE.Vector3(
      (this._cols * offsetX) / 2,
      (this._rows * offsetY) / 2,
      0,
    );

    return new THREE.Vector3(
      (offsetX * column) - (gridMidpoint.x),
      (offsetY * row) - (gridMidpoint.y),
      0,
    )
  }
}

export type WithSettingsProps = {
  settings: Settings;
}

export function withSettings<P extends object>(
  WrappedComponent: React.ComponentType<P & WithSettingsProps>,
) {
  return function WithSettingsComponent(props: P) {
    const [settings, setSettings] = useState<Settings>()

    useEffect(() => {
      setSettings(new Settings())
    }, [])

    if (!settings) {
      return null;
    }
    
    return <WrappedComponent {...props} settings={settings} />;
  };
}
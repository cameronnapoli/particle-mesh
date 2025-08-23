import { useEffect, useState } from 'react';
import * as THREE from 'three';

class Settings {
  // particles
  private _rows = 40
  private _cols = 80
  private _gap = 0.25
  private _count: number | null = null

  // canvas
  width = window.innerWidth
  height = window.innerHeight
  cameraNormalY = 20 / 2 // proportional units to screen height
  cameraNormalX = this.cameraNormalY * (this.width / this.height)

  getRows() {
    return this._rows;
  }

  getCols() {
    return this._cols;
  }

  getGap() {
    return this._gap;
  }

  setRows(rows: number) {
    this._rows = rows;
    this._count = null;
  }
  
  setCols(cols: number) {
    this._cols = cols;
    this._count = null;
  }

  getCount() {
    if (this._count === null) {
      this._count = this._rows * this._cols;
    }
    return this._count;
  }

  getParticleGridPosition(index: number) {
    const column = Math.floor(index / this.getRows());
    const row = index % this.getRows();

    const x = (column * this.getGap()) - this._getGridMidpoint().x;
    const y = (row * this.getGap()) -  this._getGridMidpoint().y;

    return new THREE.Vector3(x, y, 0)
  }

  private _getGridMidpoint() {
    return new THREE.Vector3(
      (this._cols * this._gap) / 2,
      (this._rows * this._gap) / 2,
      0,
    );
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
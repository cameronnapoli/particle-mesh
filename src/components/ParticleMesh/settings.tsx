import { useState } from 'react';
import * as THREE from 'three';

export class Settings {
  // particles
  private _rows = 20
  private _cols = 40
  private _gap = 0.2
  private _particleCount: number | null = null;

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
    this._particleCount = null;
  }
  
  setCols(cols: number) {
    this._cols = cols;
    this._particleCount = null;
  }

  getParticleCount() {
    if (this._particleCount === null) {
      this._particleCount = this._rows * this._cols;
    }
    return this._particleCount;
  }

  getGridMidpoint() {
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

    useState(() => {
      setSettings(new Settings())
    })

    if (!settings) {
      return null;
    }
    
    return <WrappedComponent {...props} settings={settings} />;
  };
}
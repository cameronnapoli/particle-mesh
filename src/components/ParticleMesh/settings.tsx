import { useEffect, useState } from 'react';
import * as THREE from 'three';

class Settings {
  // particles
  private _rows = 20
  private _cols = 40
  private _gap = 0.2
  private _count: number | null = null

  // canvas
  width = window.innerWidth
  height = window.innerHeight
  normY = 10

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

  getParticleCount() {
    if (this._count === null) {
      this._count = this._rows * this._cols;
    }
    return this._count;
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

    useEffect(() => {
      setSettings(new Settings())
    }, [])

    if (!settings) {
      return null;
    }
    
    return <WrappedComponent {...props} settings={settings} />;
  };
}
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import styles from './styles.module.scss';

const containerId = 'particle-mesh-container';

interface Options {
  columns: number;
  mouseGravityStrength: number;
  mouseGravityRadiusPx: number;
  springConstant: number;
  dampingConstant: number;
  debug: boolean;
}

const DEFAULT_OPTIONS: Options = {
  columns: 80,
  mouseGravityStrength: 2.0,
  mouseGravityRadiusPx: 150.0,
  springConstant: 0.1,
  dampingConstant: 0.1,
  debug: false,
};

class Config {
  // particles
  private _cols: number;
  private _count: number | null = null;

  // canvas
  private _width: number; // px
  private _height: number; // px

  // environment
  mouseGravityStrength: number;
  mouseGravityRadiusPx: number;
  springConstant: number;
  dampingConstant: number;

  // misc
  debug: boolean;

  constructor(options: Options) {
    this._cols = options.columns;
    this.mouseGravityStrength = options.mouseGravityStrength;
    this.mouseGravityRadiusPx = options.mouseGravityRadiusPx;
    this.springConstant = options.springConstant;
    this.dampingConstant = options.dampingConstant;
    this.debug = options.debug;

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error('Cannot find container');
    }
    this._width = container.clientWidth;
    this._height = container.clientHeight;
  }

  set cols(value: number) {
    this._cols = value;
    this._count = null;
  }

  private get _rows() {
    const aspect = this._width / this._height;
    return Math.floor(this._cols / aspect);
  }

  get count() {
    if (this._count === null) {
      this._count = this._rows * this._cols;
    }
    return this._count;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  findParticlePosition(index: number) {
    const column = Math.floor(index / this._rows); // x
    const row = index % this._rows; // y

    const padding = 0.9;

    const offsetX = (this._width) / this._cols * padding;
    const offsetY = (this._height) / this._rows * padding;

    const gridMidpoint = new THREE.Vector3(
      (this._cols * offsetX) / 2,
      (this._rows * offsetY) / 2,
      0,
    );

    return new THREE.Vector3(
      (offsetX * column) - (gridMidpoint.x),
      (offsetY * row) - (gridMidpoint.y),
      0,
    );
  }
}

export type WithConfigProps = {
  config: Config;
}

export function withConfig<P extends object>(
  WrappedComponent: React.ComponentType<P & WithConfigProps>,
) {
  return function WithConfigComponent(props: P) {
    const options = useRef<Options>(DEFAULT_OPTIONS);
    const [config, setConfig] = useState<Config | null>(null);

    useEffect(() => {
      setConfig(new Config(options.current));
    }, []);

    const rerender = useCallback(() => {
      setConfig(null);
      let timeout: NodeJS.Timeout | null = null;
      timeout = setTimeout(() => setConfig(new Config(options.current)), 100);
      return () => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };
    }, []);

    // resize handler
    useEffect(() => {
      let timeout: NodeJS.Timeout | null = null;
      const handle = () => {
        setConfig(null);
        timeout = setTimeout(() => setConfig(new Config(options.current)), 100);
      };
      window.addEventListener('resize', handle);
      return () => {
        window.removeEventListener('resize', handle);
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };
    }, []);

    return (
      <div
        id={containerId}
        style={{ width: '50vw', minHeight: '50vh', overflow: 'hidden' }}
      >
        {config ? (
          <WrappedComponent {...props} config={config} />
        ) : null}
        <div className={styles.controls}>
          <div className={styles.checkbox}>
            <input
              type="checkbox"
              name="debug-checkbox"
              id="debug-checkbox"
              onChange={(event) => {
                if (options.current) {
                  options.current.debug = !!event.target.checked;
                  rerender();
                }
              }}
            />
            <label htmlFor="debug-checkbox">Debug</label>
          </div>
        </div>
      </div>
    );
  };
}
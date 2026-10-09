import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import Controls from './Controls/Controls';

interface ConfigOptions {
  columns: number;
  mouseGravityStrength: number;
  mouseGravityRadius: number | null;
  springConstant: number;
  dampingConstant: number;
  backgroundColor: THREE.ColorRepresentation;
  particleColor: (index: number) => THREE.ColorRepresentation;
}

const DEFAULT_OPTIONS: ConfigOptions = {
  columns: 80,
  mouseGravityStrength: 6,
  mouseGravityRadius: null,
  springConstant: 0.1,
  dampingConstant: 0.1,
  backgroundColor: '#f5f5f5',
  particleColor: () => new THREE.Color(0, 0, Math.random()),
};

class Config {
  // canvas
  private _width: number;
  private _height: number;

  // particles
  private _cols: number;
  private _rows: number;
  private _count: number;

  // environment
  mouseGravityStrength: number;
  mouseGravityRadius: number | null;
  springConstant: number;
  dampingConstant: number;
  backgroundColor: THREE.ColorRepresentation;
  particleColor: (index: number) => THREE.ColorRepresentation;

  constructor(container: HTMLElement, options: ConfigOptions) {
    this.mouseGravityStrength = options.mouseGravityStrength;
    this.mouseGravityRadius = options.mouseGravityRadius;
    this.springConstant = options.springConstant;
    this.dampingConstant = options.dampingConstant;
    this.backgroundColor = options.backgroundColor;
    this.particleColor = options.particleColor;
    this._width = container.clientWidth;
    this._height = container.clientHeight;
    this._cols = options.columns;
    this._rows = Math.floor(this._cols / (this._width / this._height));
    this._count = this._rows * this._cols
  }

  get count() {
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
      (this._cols - 1) * offsetX / 2,
      (this._rows - 1) * offsetY / 2,
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
    const options = useRef<ConfigOptions>(DEFAULT_OPTIONS);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<Config | null>(null);

    const dotCountToColumns = (value: 'few' | 'normal' | 'many') => {
      switch (value) {
      case 'few':
        return 20;
      case 'normal':
        return 80;
      case 'many':
        return 160;
      }
    };

    const gravityStrengthToValue = (value: 'weak' | 'normal' | 'strong') => {
      switch (value) {
      case 'weak':
        return 2;
      case 'normal':
        return 6;
      case 'strong':
        return 14;
      }
    };

    const containerStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      borderRadius: '12px',
      position: 'relative',
      backgroundColor: new THREE.Color(options.current.backgroundColor).getStyle(),
    };

    useEffect(() => {
      if (containerRef.current) {
        setConfig(new Config(containerRef.current, options.current));
      }
    }, []);

    const rerender = useCallback(() => {
      setConfig(null);
      let timeout: NodeJS.Timeout | null = null;
      timeout = setTimeout(() => {
        if (containerRef.current) {
          setConfig(new Config(containerRef.current, options.current));
        }
      }, 100);
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
        timeout = setTimeout(() => {
          if (containerRef.current) {
            setConfig(new Config(containerRef.current, options.current));
          }
        }, 100);
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
        ref={containerRef}
        style={containerStyle}
      >
        {config ? (
          <WrappedComponent {...props} config={config} />
        ) : null}
        <Controls
          onChangeDotCount={(value) => {
            if (options.current) {
              options.current.columns = dotCountToColumns(value);
              rerender();
            }
          }}
          onChangeMouseGravityRadius={(value) => {
            if (options.current) {
              options.current.mouseGravityRadius = value;
              rerender();
            }
          }}
          onChangeMouseGravityStrength={(value) => {
            if (options.current) {
              options.current.mouseGravityStrength = gravityStrengthToValue(value);
              rerender();
            }
          }}
        />
      </div>
    );
  };
}
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import Controls from './Controls/Controls';

export interface Config {
  particleColumnCount: number;
  mouseGravityStrength: number;
  mouseGravityRadius: number | null;
  anchorSpringConstant: number;
  anchorDampingConstant: number;
  backgroundColor: THREE.ColorRepresentation;
  particleColor: (index: number) => THREE.ColorRepresentation;
  debug: boolean;
}

const DEFAULT_CONFIG: Config = {
  particleColumnCount: 80,
  mouseGravityStrength: 6,
  mouseGravityRadius: null,
  anchorSpringConstant: 0.1,
  anchorDampingConstant: 0.1,
  backgroundColor: '#f0f0f0',
  particleColor: () => new THREE.Color(0, 0, Math.random()),
  debug: false,
};

export type HydratedConfig = Omit<Config, 'particleColumnCount'> & {
  width: number;
  height: number;
  cols: number;
  rows: number;
  count: number;
  /** Anchor position of particle `index` on a grid centered at the origin. */
  particlePosition: (index: number) => THREE.Vector3;
};

export function hydrateConfig(config: Config, width: number, height: number): HydratedConfig {
  const cols = config.particleColumnCount;
  const rows = Math.floor(cols / (width / height));

  const padding = 0.9;
  const offsetX = width / cols * padding;
  const offsetY = height / rows * padding;

  return {
    ...config,
    width,
    height,
    cols,
    rows,
    count: rows * cols,
    particlePosition: (index) => {
      const column = Math.floor(index / rows); // x
      const row = index % rows; // y

      return new THREE.Vector3(
        (offsetX * column) - ((cols - 1) * offsetX / 2),
        (offsetY * row) - ((rows - 1) * offsetY / 2),
        0,
      );
    },
  };
}

export function withConfig<P extends object>(
  WrappedComponent: React.ComponentType<P & HydratedConfig>,
) {
  return function WithConfigComponent(props: P) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
    const [size, setSize] = useState<{ width: number; height: number } | null>(null);

    // rebuild config on options change and window resize
    useEffect(() => {
      let timeout: NodeJS.Timeout | undefined;
      const rebuild = () => {
        setSize(null);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (containerRef.current) {
            const { clientWidth: width, clientHeight: height } = containerRef.current;
            setSize({ width, height });
          }
        }, 100);
      };
      rebuild();
      window.addEventListener('resize', rebuild);
      return () => {
        window.removeEventListener('resize', rebuild);
        clearTimeout(timeout);
      };
    }, [config]);

    return (
      <div
        ref={containerRef}
        style={{...containerStyle, backgroundColor: config.backgroundColor.toString()}}
      >
        {size ? (
          <WrappedComponent
            {...props}
            {...hydrateConfig(config, size.width, size.height)}
          />
        ) : null}
        <Controls
          defaultColumns={config.particleColumnCount}
          defaultMouseGravityRadius={config.mouseGravityRadius}
          defaultMouseGravityStrength={config.mouseGravityStrength}
          onChangeDotCount={(particleColumnCount) => setConfig((o) => ({ ...o, particleColumnCount }))}
          onChangeMouseGravityRadius={(mouseGravityRadius) => setConfig((o) => ({ ...o, mouseGravityRadius }))}
          onChangeMouseGravityStrength={(mouseGravityStrength) => setConfig((o) => ({ ...o, mouseGravityStrength }))}
        />
      </div>
    );
  };
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
};

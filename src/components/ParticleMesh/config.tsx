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
}

const DEFAULT_CONFIG: Config = {
  particleColumnCount: 80,
  mouseGravityStrength: 6,
  mouseGravityRadius: null,
  anchorSpringConstant: 0.1,
  anchorDampingConstant: 0.1,
  backgroundColor: '#f5f5f5',
  particleColor: () => new THREE.Color(0, 0, Math.random()),
};

/** Returns the anchor position of particle `index` on a grid centered at the origin. */
export function findParticlePosition(
  index: number,
  cols: number,
  rows: number,
  width: number,
  height: number,
): THREE.Vector3 {
  const column = Math.floor(index / rows); // x
  const row = index % rows; // y

  const padding = 0.9;

  const offsetX = width / cols * padding;
  const offsetY = height / rows * padding;

  return new THREE.Vector3(
    (offsetX * column) - ((cols - 1) * offsetX / 2),
    (offsetY * row) - ((rows - 1) * offsetY / 2),
    0,
  );
}

export type WithConfigProps = Config & {
  width: number;
  height: number;
}

export function withConfig<P extends object>(
  WrappedComponent: React.ComponentType<P & WithConfigProps>,
) {
  return function WithConfigComponent(props: P) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [options, setOptions] = useState<Config>(DEFAULT_CONFIG);
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
    }, [options]);

    return (
      <div
        ref={containerRef}
        style={containerStyle}
      >
        {size ? (
          <WrappedComponent
            {...props}
            {...options}
            width={size.width}
            height={size.height}
          />
        ) : null}
        <Controls
          defaultColumns={options.particleColumnCount}
          defaultMouseGravityRadius={options.mouseGravityRadius}
          defaultMouseGravityStrength={options.mouseGravityStrength}
          onChangeDotCount={(particleColumnCount) => setOptions((o) => ({ ...o, particleColumnCount }))}
          onChangeMouseGravityRadius={(mouseGravityRadius) => setOptions((o) => ({ ...o, mouseGravityRadius }))}
          onChangeMouseGravityStrength={(mouseGravityStrength) => setOptions((o) => ({ ...o, mouseGravityStrength }))}
        />
      </div>
    );
  };
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  borderRadius: '12px',
  position: 'relative',
};

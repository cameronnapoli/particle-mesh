import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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

export const DEFAULT_CONFIG: Config = {
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

export type ParticleMeshProps = Partial<Config>;

export function withConfig(WrappedComponent: React.ComponentType<HydratedConfig>) {
  return function WithConfigComponent(props: ParticleMeshProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const config: Config = { ...DEFAULT_CONFIG, ...props };
    const [size, setSize] = useState<{ width: number; height: number } | null>(null);

    // rebuild on options change and window resize
    useEffect(() => {
      let timeout: ReturnType<typeof setTimeout> | undefined;
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
    // particleColor excluded: an inline function would rebuild on every render
    }, [
      config.particleColumnCount,
      config.mouseGravityStrength,
      config.mouseGravityRadius,
      config.anchorSpringConstant,
      config.anchorDampingConstant,
      config.backgroundColor,
      config.debug,
    ]);

    return (
      <div
        ref={containerRef}
        style={{...containerStyle, backgroundColor: config.backgroundColor.toString()}}
      >
        {size ? (
          <WrappedComponent {...hydrateConfig(config, size.width, size.height)} />
        ) : null}
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

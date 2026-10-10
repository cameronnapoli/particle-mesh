import { type ComponentType, type CSSProperties, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/** Any CSS color string or hex number, e.g. `'#f0f0f0'` or `0xf0f0f0`. */
export type Color = string | number;

export interface Config {
  particleColumnCount: number;
  particleSize: number;
  mouseGravityStrength: number;
  mouseGravityRadius: number | null;
  anchorSpringConstant: number;
  anchorDampingConstant: number;
  backgroundColor: Color;
  particleColor: (index: number) => Color;
  interactive: boolean;
  debug: boolean;
}

export const DEFAULT_CONFIG: Config = {
  particleColumnCount: 80,
  particleSize: 5,
  mouseGravityStrength: 6,
  mouseGravityRadius: null,
  anchorSpringConstant: 0.1,
  anchorDampingConstant: 0.1,
  backgroundColor: '#f0f0f0',
  particleColor: () => new THREE.Color(0, 0, Math.random()).getHex(),
  interactive: true,
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

export type ParticleMeshProps = Partial<Config> & {
  className?: string;
  style?: CSSProperties;
};

function withDefaults(overrides: Partial<Config>): Config {
  const config = { ...DEFAULT_CONFIG };
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) Object.assign(config, { [key]: value });
  }
  return config;
}

export function withConfig(WrappedComponent: ComponentType<HydratedConfig>) {
  return function WithConfigComponent({ className, style, ...overrides }: ParticleMeshProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const config = withDefaults(overrides);
    const [size, setSize] = useState<{ width: number; height: number } | null>(null);

    // rebuild on structural option change and container resize; other options apply live
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let timeout: ReturnType<typeof setTimeout> | undefined;
      let measured: { width: number; height: number } | null = null;
      const rebuild = () => {
        setSize(null);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          measured = { width: container.clientWidth, height: container.clientHeight };
          setSize(measured);
        }, 100);
      };

      // ignore observer callbacks caused by our own remount unless the size really changed
      const observer = new ResizeObserver(() => {
        if (measured?.width !== container.clientWidth || measured?.height !== container.clientHeight) {
          rebuild();
        }
      });

      rebuild();
      observer.observe(container);
      return () => {
        observer.disconnect();
        clearTimeout(timeout);
      };
    }, [config.particleColumnCount, config.debug]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          ...containerStyle,
          backgroundColor: `#${new THREE.Color(config.backgroundColor).getHexString()}`,
          ...style,
        }}
      >
        {size ? (
          <WrappedComponent {...hydrateConfig(config, size.width, size.height)} />
        ) : null}
      </div>
    );
  };
}

const containerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
};

'use client';
import { useState } from 'react';
import { DEFAULT_CONFIG, ParticleMeshProps, ParticleMesh } from 'react-particle-mesh';

import Controls from '@/components/Controls/Controls';
import styles from './page.module.scss';

export default function Home() {
  const [config, setConfig] = useState<ParticleMeshProps>({});

  return (
    <main className={styles.main}>
      <div className={styles.stage}>
        <ParticleMesh {...config} />
        <Controls
          defaultColumns={DEFAULT_CONFIG.particleColumnCount}
          defaultMouseGravityRadius={DEFAULT_CONFIG.mouseGravityRadius}
          defaultMouseGravityStrength={DEFAULT_CONFIG.mouseGravityStrength}
          defaultAnchorSpringConstant={DEFAULT_CONFIG.anchorSpringConstant}
          onChangeDotCount={(particleColumnCount) => setConfig((o) => ({ ...o, particleColumnCount }))}
          onChangeMouseGravityRadius={(mouseGravityRadius) => setConfig((o) => ({ ...o, mouseGravityRadius }))}
          onChangeMouseGravityStrength={(mouseGravityStrength) => setConfig((o) => ({ ...o, mouseGravityStrength }))}
          onChangeAnchorSpringConstant={(anchorSpringConstant) => setConfig((o) => ({ ...o, anchorSpringConstant }))}
        />
      </div>
    </main>
  );
}

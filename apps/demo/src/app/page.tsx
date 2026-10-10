'use client';
import { useState } from 'react';
import { DEFAULT_CONFIG, ParticleMesh, ParticleMeshProps } from 'react-particle-mesh';

import Controls from '@/components/Controls/Controls';
import styles from './page.module.scss';

const Lines = ({ count }: { count: number }) => (
  <div className={styles.stack}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={i === count - 1 ? `${styles.line} ${styles.short}` : styles.line} />
    ))}
  </div>
);

export default function Home() {
  const [config, setConfig] = useState<ParticleMeshProps>({});

  return (
    <main className={styles.main}>
      <div className={styles.top}>
        <nav className={styles.nav}>
          <div className={styles.logo} />
          <div className={styles.navLinks}>
            <div className={styles.navLink} />
            <div className={styles.navLink} />
            <div className={styles.navLink} />
          </div>
        </nav>

        <section className={styles.hero}>
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
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.heading} />
        <div className={styles.grid}>
          <div className={styles.card} />
          <div className={styles.card} />
          <div className={styles.card} />
        </div>
      </section>

      <section className={styles.split}>
        <Lines count={6} />
        <div className={styles.image} />
      </section>

      <section className={styles.split}>
        <div className={styles.image} />
        <Lines count={5} />
      </section>

      <section className={styles.section}>
        <div className={styles.heading} />
        <div className={styles.grid}>
          <div className={styles.card} />
          <div className={styles.card} />
          <div className={styles.card} />
          <div className={styles.card} />
        </div>
      </section>

      <footer className={styles.footer} />
    </main>
  );
}

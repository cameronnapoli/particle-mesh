import { ParticleMeshWithConfig } from '@/components/ParticleMesh';
import styles from './page.module.scss';

export default function Home() {
  return (
    <main className={styles.main}>
      <ParticleMeshWithConfig />
    </main>
  );
}

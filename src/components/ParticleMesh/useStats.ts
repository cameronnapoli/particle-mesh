import { useEffect, useRef } from 'react';
import Stats from 'stats.js';

export const useStats = () => {
  const stats = useRef<Stats>(null);

  useEffect(() => {
    stats.current = new Stats();
    stats.current.showPanel(0);
    const element = stats.current.dom;
    document.body.appendChild(element);
    return () => {
      document.body.removeChild(element);
    };
  }, []);

  return stats;
};

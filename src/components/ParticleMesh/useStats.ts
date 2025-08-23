import { useEffect, useState } from 'react'
import Stats from 'stats.js'

export const useStats = () => {
  const [stats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!stats) {
      return;
    }
    stats.showPanel(0)
    document.body.appendChild(stats.dom)
    return () => {
      document.body.removeChild(stats.dom)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!stats])

  return stats;
}

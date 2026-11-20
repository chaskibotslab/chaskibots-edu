import type { Metadata } from 'next'
import TorneoJueces from '@/components/torneo/TorneoJueces'

export const metadata: Metadata = {
  title: 'Jueces - Chaski Bots 10',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <TorneoJueces />
}

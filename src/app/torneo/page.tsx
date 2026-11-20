import type { Metadata } from 'next'
import TorneoPublico from '@/components/torneo/TorneoPublico'

export const metadata: Metadata = {
  title: 'Chaski Bots 10 - Torneo Internacional de Robótica',
  description: 'Categorías, equipos y resultados del Torneo Internacional de Robótica Chaski Bots 10. El Chaco, Ecuador, 20 y 21 de noviembre de 2026.',
}

export default function Page() {
  return <TorneoPublico />
}

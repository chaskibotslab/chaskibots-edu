// Ruta del Laboratorio de Robótica. Todo el código vive en src/modules/laboratorio;
// este archivo solo verifica el flag y la sesión y monta el módulo.
import { notFound, redirect } from 'next/navigation'
import { laboratorioActivo, sesionLaboratorio } from '@/modules/laboratorio/server/acceso'
import LaboratorioCliente from '@/modules/laboratorio/ui/LaboratorioCliente'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Laboratorio de Robótica | ChaskiBots' }

export default async function LaboratorioPage() {
  if (!laboratorioActivo()) notFound()
  const sesion = await sesionLaboratorio()
  if (!sesion) redirect('/login?redirect=/laboratorio')
  return <LaboratorioCliente />
}

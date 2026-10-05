import { supabaseAdmin } from '@/lib/supabase'

// Arma la ficha completa (placa + materiales + cada proyecto con sus
// conexiones/esquema/codigo) de uno o varios kits a la vez, en lote (sin
// N+1 queries). La usan /api/admin/kits/[id] (un kit) y
// /api/kits/academia (todos los kits visibles de un nivel).
export async function buildKitFichas(kitRows: any[]) {
  if (kitRows.length === 0) return []

  const kitIds = kitRows.map(k => k.id)
  const placaIds = [...new Set(kitRows.map(k => k.placa_id).filter(Boolean))]
  const schoolIds = [...new Set(kitRows.map(k => k.school_id).filter(Boolean))]

  const [placasRes, schoolsRes, kitMatRes, proyectosRes] = await Promise.all([
    placaIds.length ? supabaseAdmin.from('placas').select('*').in('id', placaIds) : Promise.resolve({ data: [], error: null } as any),
    schoolIds.length ? supabaseAdmin.from('schools').select('id, name').in('id', schoolIds) : Promise.resolve({ data: [], error: null } as any),
    supabaseAdmin.from('kit_materiales').select('*').in('kit_id', kitIds),
    supabaseAdmin.from('kit_proyectos').select('*').in('kit_id', kitIds).order('orden'),
  ])
  if (placasRes.error) throw new Error(placasRes.error.message)
  if (schoolsRes.error) throw new Error(schoolsRes.error.message)
  if (kitMatRes.error) throw new Error(kitMatRes.error.message)
  if (proyectosRes.error) throw new Error(proyectosRes.error.message)

  const placasById = new Map((placasRes.data || []).map((p: any) => [p.id, p]))
  const schoolsById = new Map((schoolsRes.data || []).map((s: any) => [s.id, s]))

  const materialIds = [...new Set((kitMatRes.data || []).map((r: any) => r.material_id))]
  const { data: materialesData, error: materialesError } = materialIds.length
    ? await supabaseAdmin.from('materiales').select('*').in('id', materialIds)
    : { data: [], error: null }
  if (materialesError) throw new Error(materialesError.message)
  const materialesById = new Map((materialesData || []).map((m: any) => [m.id, m]))

  const proyectoIds = (proyectosRes.data || []).map((p: any) => p.id)
  const [conexionesRes, esquemasRes, codigosRes] = await Promise.all([
    proyectoIds.length ? supabaseAdmin.from('kit_conexiones').select('*').in('proyecto_id', proyectoIds).order('orden') : Promise.resolve({ data: [], error: null } as any),
    proyectoIds.length ? supabaseAdmin.from('kit_esquemas').select('*').in('proyecto_id', proyectoIds) : Promise.resolve({ data: [], error: null } as any),
    proyectoIds.length ? supabaseAdmin.from('kit_codigos').select('*').in('proyecto_id', proyectoIds) : Promise.resolve({ data: [], error: null } as any),
  ])
  if (conexionesRes.error) throw new Error(conexionesRes.error.message)
  if (esquemasRes.error) throw new Error(esquemasRes.error.message)
  if (codigosRes.error) throw new Error(codigosRes.error.message)

  const conexionesByProyecto = new Map<string, any[]>()
  for (const c of conexionesRes.data || []) {
    if (!conexionesByProyecto.has(c.proyecto_id)) conexionesByProyecto.set(c.proyecto_id, [])
    conexionesByProyecto.get(c.proyecto_id)!.push(c)
  }
  const esquemaByProyecto = new Map<string, any>()
  for (const e of esquemasRes.data || []) esquemaByProyecto.set(e.proyecto_id, e)
  const codigoByProyecto = new Map<string, any>()
  for (const c of codigosRes.data || []) codigoByProyecto.set(c.proyecto_id, c)

  const proyectosByKit = new Map<string, any[]>()
  for (const p of proyectosRes.data || []) {
    if (!proyectosByKit.has(p.kit_id)) proyectosByKit.set(p.kit_id, [])
    proyectosByKit.get(p.kit_id)!.push(p)
  }
  const materialesByKit = new Map<string, any[]>()
  for (const km of kitMatRes.data || []) {
    if (!materialesByKit.has(km.kit_id)) materialesByKit.set(km.kit_id, [])
    materialesByKit.get(km.kit_id)!.push(km)
  }

  return kitRows.map(kitRow => {
    const placaRow: any = kitRow.placa_id ? placasById.get(kitRow.placa_id) : null
    const schoolRow: any = kitRow.school_id ? schoolsById.get(kitRow.school_id) : null

    const materiales = (materialesByKit.get(kitRow.id) || []).map((km: any) => {
      const m: any = materialesById.get(km.material_id)
      return {
        id: km.material_id,
        nombre: m?.nombre || km.material_id,
        categoria: m?.categoria || null,
        especificacion: m?.especificacion || null,
        cantidad: km.cantidad,
        nota: km.nota,
        incluido: km.incluido !== false,
      }
    })

    const proyectos = (proyectosByKit.get(kitRow.id) || []).map((p: any) => ({
      id: p.id,
      titulo: p.titulo,
      slug: p.slug,
      tipo: p.tipo,
      descripcion: p.descripcion,
      objetivos: p.objetivos || [],
      orden: p.orden,
      conexiones: (conexionesByProyecto.get(p.id) || []).map((c: any) => ({
        componente: c.componente,
        pinComponente: c.pin_componente,
        pinPlaca: c.pin_placa,
        nota: c.nota,
      })),
      esquema: esquemaByProyecto.has(p.id)
        ? { tipo: esquemaByProyecto.get(p.id).tipo, contenido: esquemaByProyecto.get(p.id).contenido }
        : null,
      codigo: codigoByProyecto.has(p.id)
        ? { lenguaje: codigoByProyecto.get(p.id).lenguaje, contenido: codigoByProyecto.get(p.id).contenido }
        : null,
    }))

    return {
      id: kitRow.id,
      levelId: kitRow.level_id,
      schoolId: kitRow.school_id,
      schoolName: schoolRow?.name || null,
      name: kitRow.name,
      description: kitRow.description,
      price: kitRow.price,
      proyectoPrincipal: kitRow.proyecto_principal,
      alimentacion: kitRow.alimentacion,
      advertenciaSeguridad: kitRow.advertencia_seguridad,
      notas: kitRow.notas,
      activo: kitRow.activo !== false,
      placa: placaRow
        ? {
            nombre: placaRow.nombre,
            voltajeLogico: placaRow.voltaje_logico,
            conectorUsb: placaRow.conector_usb,
            notasTecnicas: placaRow.notas_tecnicas,
          }
        : null,
      materiales,
      proyectos,
    }
  })
}

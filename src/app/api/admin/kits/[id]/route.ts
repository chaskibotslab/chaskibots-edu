import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'

export const dynamic = 'force-dynamic'

// Ficha completa de un kit: datos generales + placa + materiales + cada
// proyecto (principal y adicionales) con sus conexiones, esquema y codigo.
// Se arma con varias consultas simples en vez de "embeds" anidados de
// PostgREST, para no depender de que Supabase detecte bien las relaciones
// entre tablas nuevas.
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const kitId = params.id

    const { data: kitRow, error: kitError } = await supabaseAdmin
      .from('kits')
      .select('*')
      .eq('id', kitId)
      .maybeSingle()

    if (kitError) return NextResponse.json({ success: false, error: kitError.message }, { status: 500 })
    if (!kitRow) return NextResponse.json({ success: false, error: 'Kit no encontrado' }, { status: 404 })

    const [placaRes, schoolRes, kitMatRes, proyectosRes] = await Promise.all([
      kitRow.placa_id
        ? supabaseAdmin.from('placas').select('*').eq('id', kitRow.placa_id).maybeSingle()
        : Promise.resolve({ data: null, error: null } as any),
      kitRow.school_id
        ? supabaseAdmin.from('schools').select('id, name').eq('id', kitRow.school_id).maybeSingle()
        : Promise.resolve({ data: null, error: null } as any),
      supabaseAdmin.from('kit_materiales').select('*').eq('kit_id', kitId),
      supabaseAdmin.from('kit_proyectos').select('*').eq('kit_id', kitId).order('orden'),
    ])

    if (kitMatRes.error) return NextResponse.json({ success: false, error: kitMatRes.error.message }, { status: 500 })
    if (proyectosRes.error) return NextResponse.json({ success: false, error: proyectosRes.error.message }, { status: 500 })

    const materialIds = (kitMatRes.data || []).map(r => r.material_id)
    const { data: materialesData, error: materialesError } = materialIds.length
      ? await supabaseAdmin.from('materiales').select('*').in('id', materialIds)
      : { data: [], error: null }
    if (materialesError) return NextResponse.json({ success: false, error: materialesError.message }, { status: 500 })
    const materialesById = new Map((materialesData || []).map(m => [m.id, m]))

    const materiales = (kitMatRes.data || []).map(km => {
      const m = materialesById.get(km.material_id)
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

    const proyectoIds = (proyectosRes.data || []).map(p => p.id)
    const [conexionesRes, esquemasRes, codigosRes] = await Promise.all([
      proyectoIds.length
        ? supabaseAdmin.from('kit_conexiones').select('*').in('proyecto_id', proyectoIds).order('orden')
        : Promise.resolve({ data: [], error: null } as any),
      proyectoIds.length
        ? supabaseAdmin.from('kit_esquemas').select('*').in('proyecto_id', proyectoIds)
        : Promise.resolve({ data: [], error: null } as any),
      proyectoIds.length
        ? supabaseAdmin.from('kit_codigos').select('*').in('proyecto_id', proyectoIds)
        : Promise.resolve({ data: [], error: null } as any),
    ])

    const conexionesByProyecto = new Map<string, any[]>()
    for (const c of conexionesRes.data || []) {
      if (!conexionesByProyecto.has(c.proyecto_id)) conexionesByProyecto.set(c.proyecto_id, [])
      conexionesByProyecto.get(c.proyecto_id)!.push(c)
    }
    const esquemaByProyecto = new Map<string, any>()
    for (const e of esquemasRes.data || []) esquemaByProyecto.set(e.proyecto_id, e)
    const codigoByProyecto = new Map<string, any>()
    for (const c of codigosRes.data || []) codigoByProyecto.set(c.proyecto_id, c)

    const proyectos = (proyectosRes.data || []).map(p => ({
      id: p.id,
      titulo: p.titulo,
      slug: p.slug,
      tipo: p.tipo,
      descripcion: p.descripcion,
      objetivos: p.objetivos || [],
      orden: p.orden,
      conexiones: (conexionesByProyecto.get(p.id) || []).map(c => ({
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

    const placa = placaRes.data
      ? {
          nombre: placaRes.data.nombre,
          voltajeLogico: placaRes.data.voltaje_logico,
          conectorUsb: placaRes.data.conector_usb,
          notasTecnicas: placaRes.data.notas_tecnicas,
        }
      : null

    return NextResponse.json({
      success: true,
      kit: {
        id: kitRow.id,
        levelId: kitRow.level_id,
        schoolId: kitRow.school_id,
        schoolName: schoolRes.data?.name || null,
        name: kitRow.name,
        description: kitRow.description,
        price: kitRow.price,
        proyectoPrincipal: kitRow.proyecto_principal,
        alimentacion: kitRow.alimentacion,
        advertenciaSeguridad: kitRow.advertencia_seguridad,
        notas: kitRow.notas,
        activo: kitRow.activo !== false,
        placa,
        materiales,
        proyectos,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Error interno' }, { status: 500 })
  }
}

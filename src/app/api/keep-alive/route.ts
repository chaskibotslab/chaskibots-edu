import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Simple query to keep the database active
    const { data, error } = await supabaseAdmin
      .from('levels')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Database is alive'
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 })
  }
}

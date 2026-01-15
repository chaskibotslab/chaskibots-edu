import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID || '')

export async function GET() {
  try {
    const records = await base('levels')
      .select({
        sort: [{ field: 'gradeNumber', direction: 'asc' }]
      })
      .all()

    const levels = records.map(record => ({
      id: record.fields.id as string,
      name: record.fields.name as string,
      fullName: record.fields.fullName as string,
      category: record.fields.category as string,
      ageRange: record.fields.ageRange as string,
      gradeNumber: record.fields.gradeNumber as number,
      color: record.fields.color as string || 'from-blue-500 to-cyan-600',
      neonColor: record.fields.neonColor as string || '#00d4ff',
      icon: record.fields.icon as string || '📚',
      kitPrice: record.fields.kitPrice as number || 50,
      hasHacking: record.fields.hasHacking as boolean || false,
      hasAdvancedIA: record.fields.hasAdvancedIA as boolean || false
    }))

    return NextResponse.json(levels)
  } catch (error) {
    console.error('Error fetching levels from Airtable:', error)
    // Fallback: devolver array vacío si falla
    return NextResponse.json([])
  }
}

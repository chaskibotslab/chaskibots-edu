import { NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''

// Debug endpoint para verificar datos de SOR
export async function GET() {
  try {
    // 1. Buscar usuario SOR en la tabla users
    const usersUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/users?filterByFormula=FIND("SOR",{name})>0`
    const usersRes = await fetch(usersUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    const usersData = await usersRes.json()
    
    // 2. Buscar asignaciones de SOR en teacher_courses
    const assignmentsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/teacher_courses?filterByFormula=FIND("SOR",{teacherName})>0`
    const assignmentsRes = await fetch(assignmentsUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    const assignmentsData = await assignmentsRes.json()
    
    // 3. Buscar TODAS las asignaciones para ver qué hay
    const allAssignmentsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/teacher_courses`
    const allAssignmentsRes = await fetch(allAssignmentsUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    const allAssignmentsData = await allAssignmentsRes.json()
    
    return NextResponse.json({
      success: true,
      sorUser: usersData.records?.map((r: any) => ({
        id: r.id,
        name: r.fields.name,
        accessCode: r.fields.accessCode,
        role: r.fields.role,
        email: r.fields.email
      })) || [],
      sorAssignments: assignmentsData.records?.map((r: any) => ({
        id: r.id,
        teacherId: r.fields.teacherId,
        teacherName: r.fields.teacherName,
        courseName: r.fields.courseName,
        levelId: r.fields.levelId
      })) || [],
      totalAssignments: allAssignmentsData.records?.length || 0,
      allTeacherNames: Array.from(new Set(allAssignmentsData.records?.map((r: any) => r.fields.teacherName) || []))
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

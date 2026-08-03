import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Temporary diagnostic endpoint — safe to expose (NEXT_PUBLIC var, no secrets).
// Remove after debugging the Academy lessons discrepancy.
export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    railwayProjectName: process.env.RAILWAY_PROJECT_NAME || null,
    railwayServiceName: process.env.RAILWAY_SERVICE_NAME || null,
    railwayEnvironment: process.env.RAILWAY_ENVIRONMENT_NAME || null,
  })
}

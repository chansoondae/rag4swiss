import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('travel_content')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection failed',
          error: error.message,
        },
        { status: 500 }
      )
    }

    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      openaiKey: !!process.env.OPENAI_API_KEY,
    }

    return NextResponse.json({
      status: 'ok',
      message: 'All systems operational',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        connected: true,
        recordCount: data?.length || 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
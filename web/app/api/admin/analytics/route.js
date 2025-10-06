import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET() {
  try {
    // Get daily analytics
    const { data: dailyStats, error: dailyError } = await supabase
      .from('chat_analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)

    if (dailyError) {
      return NextResponse.json({ error: dailyError.message }, { status: 500 })
    }

    // Get overall statistics
    const { data: overallStats, error: overallError } = await supabase
      .rpc('get_overall_stats')

    // If the function doesn't exist, fall back to manual query
    let overall
    if (overallError) {
      const { data, error } = await supabase
        .from('chat_logs')
        .select(`
          response_time_ms,
          embedding_time_ms,
          search_time_ms,
          llm_time_ms,
          search_results_count,
          error_occurred,
          created_at
        `)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Calculate statistics manually
      const total = data.length
      const successful = data.filter(log => !log.error_occurred).length
      const failed = total - successful
      
      const successfulLogs = data.filter(log => !log.error_occurred)
      const avgResponseTime = successfulLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / successfulLogs.length
      const avgEmbeddingTime = successfulLogs.reduce((sum, log) => sum + (log.embedding_time_ms || 0), 0) / successfulLogs.length
      const avgSearchTime = successfulLogs.reduce((sum, log) => sum + (log.search_time_ms || 0), 0) / successfulLogs.length
      const avgLlmTime = successfulLogs.reduce((sum, log) => sum + (log.llm_time_ms || 0), 0) / successfulLogs.length
      const avgSearchResults = successfulLogs.reduce((sum, log) => sum + (log.search_results_count || 0), 0) / successfulLogs.length

      overall = {
        total_interactions: total,
        successful_responses: successful,
        failed_responses: failed,
        success_rate: (successful / total * 100).toFixed(2),
        avg_response_time_ms: avgResponseTime.toFixed(0),
        avg_embedding_time_ms: avgEmbeddingTime.toFixed(0),
        avg_search_time_ms: avgSearchTime.toFixed(0),
        avg_llm_time_ms: avgLlmTime.toFixed(0),
        avg_search_results: avgSearchResults.toFixed(1)
      }
    } else {
      overall = overallStats[0]
    }

    // Get popular questions
    const { data: popularQuestions, error: popularError } = await supabase
      .from('chat_logs')
      .select('user_question')
      .eq('error_occurred', false)
      .order('created_at', { ascending: false })
      .limit(100)

    if (popularError) {
      return NextResponse.json({ error: popularError.message }, { status: 500 })
    }

    // Count question frequency (simplified)
    const questionCounts = {}
    popularQuestions.forEach(log => {
      const question = log.user_question.toLowerCase().slice(0, 50) // First 50 chars
      questionCounts[question] = (questionCounts[question] || 0) + 1
    })

    const topQuestions = Object.entries(questionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([question, count]) => ({ question, count }))

    return NextResponse.json({
      dailyStats,
      overall,
      topQuestions
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
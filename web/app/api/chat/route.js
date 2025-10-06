import { NextResponse } from 'next/server'
import openai from '../../../lib/openai'
import { supabase } from '../../../lib/supabase'

const SYSTEM_PROMPT = `당신은 스위스 여행 전문 AI 도우미입니다. 

다음 지침을 따라 답변해주세요:
1. 한국어로 친근하고 도움이 되는 톤으로 답변
2. 제공된 컨텍스트를 기반으로 정확한 정보 제공
3. 컨텍스트에 없는 정보는 추측하지 말고 "제공된 정보에서는 확인할 수 없습니다"라고 안내
4. 실용적이고 구체적인 조언 제공
5. 가격, 시간, 교통편 등 구체적인 정보가 있으면 명시
6. 답변 마지막에 출처를 명시하지 말 것 (별도로 처리됨)

사용자의 질문에 도움이 되는 답변을 제공하세요.`

export async function POST(request) {
  const startTime = Date.now()
  let embeddingTime = 0
  let searchTime = 0
  let llmTime = 0
  let errorOccurred = false
  let errorMessage = ''
  
  // Extract user info
  const userIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: '메시지를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Generate embedding for the user's question
    const embeddingStartTime = Date.now()
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: message.replace('\n', ' '),
    })
    embeddingTime = Date.now() - embeddingStartTime

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search for relevant content in Supabase using vector similarity
    const searchStartTime = Date.now()
    const { data: searchResults, error: searchError } = await supabase.rpc(
      'match_travel_content',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 3,
      }
    )
    searchTime = Date.now() - searchStartTime

    if (searchError) {
      console.error('Supabase search error:', searchError)
      return NextResponse.json(
        { error: '검색 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // Build context from search results
    let context = ''
    const sources = []

    if (searchResults && searchResults.length > 0) {
      context = searchResults
        .map((result, index) => {
          sources.push({
            title: result.title,
            file_name: result.file_name,
            section_title: result.section_title,
            similarity: result.similarity
          })

          return `[문서 ${index + 1}]
제목: ${result.title}
섹션: ${result.section_title || '메인'}
내용: ${result.content}

`
        })
        .join('')
    }

    // Generate response using OpenAI
    const llmStartTime = Date.now()
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `컨텍스트:
${context}

사용자 질문: ${message}

위 컨텍스트를 바탕으로 사용자의 질문에 답변해주세요.${
            !context
              ? ' (관련 정보를 찾을 수 없어 일반적인 스위스 여행 정보로 답변해주세요.)'
              : ''
          }`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })
    llmTime = Date.now() - llmStartTime

    const aiResponse = chatResponse.choices[0].message.content
    const totalResponseTime = Date.now() - startTime

    // Log the interaction
    const similarityScores = sources.map(s => s.similarity)
    await logChatInteraction({
      userQuestion: message,
      aiResponse,
      sources,
      similarityScores,
      searchResultsCount: searchResults?.length || 0,
      responseTimeMs: totalResponseTime,
      embeddingTimeMs: embeddingTime,
      searchTimeMs: searchTime,
      llmTimeMs: llmTime,
      userIp: userIP,
      userAgent,
      errorOccurred: false
    })

    return NextResponse.json({
      response: aiResponse,
      sources: sources,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    errorOccurred = true
    errorMessage = error.message

    // Log the error
    try {
      const totalResponseTime = Date.now() - startTime
      await logChatInteraction({
        userQuestion: message || 'Unknown',
        aiResponse: '',
        sources: [],
        similarityScores: [],
        searchResultsCount: 0,
        responseTimeMs: totalResponseTime,
        embeddingTimeMs: embeddingTime,
        searchTimeMs: searchTime,
        llmTimeMs: llmTime,
        userIp: userIP,
        userAgent,
        errorOccurred: true,
        errorMessage: errorMessage
      })
    } catch (logError) {
      console.error('Logging error:', logError)
    }

    return NextResponse.json(
      { error: '답변 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Logging function
async function logChatInteraction(data) {
  try {
    const { error } = await supabase
      .from('chat_logs')
      .insert({
        user_question: data.userQuestion,
        ai_response: data.aiResponse,
        sources: JSON.stringify(data.sources),
        similarity_scores: data.similarityScores,
        search_results_count: data.searchResultsCount,
        response_time_ms: data.responseTimeMs,
        embedding_time_ms: data.embeddingTimeMs,
        search_time_ms: data.searchTimeMs,
        llm_time_ms: data.llmTimeMs,
        user_ip: data.userIp,
        user_agent: data.userAgent,
        error_occurred: data.errorOccurred,
        error_message: data.errorMessage
      })

    if (error) {
      console.error('Failed to log chat interaction:', error)
    }
  } catch (err) {
    console.error('Logging function error:', err)
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Chat API is working',
    status: 'ok',
  })
}
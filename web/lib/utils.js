/**
 * Utility functions for the Swiss Travel RAG application
 */

export function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('ko-KR')
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return false
  }
  
  const trimmed = message.trim()
  return trimmed.length > 0 && trimmed.length <= 1000
}

export function formatSimilarityScore(score) {
  return (score * 100).toFixed(1) + '%'
}

export function extractFileNameFromPath(filePath) {
  return filePath.split('/').pop() || filePath
}

export function sanitizeHtml(text) {
  // Basic HTML sanitization - remove potentially dangerous tags
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}
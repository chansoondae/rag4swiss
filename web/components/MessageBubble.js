import SourceCard from './SourceCard'
import { formatTimestamp } from '../lib/utils'

export default function MessageBubble({ message }) {
  const { role, content, timestamp, sources, isError } = message

  return (
    <div className={`chat-message ${role}`}>
      <div className="max-w-xs lg:max-w-md">
        <div
          className={`message-bubble ${role} ${
            isError ? 'border-red-200 bg-red-50 text-red-800' : ''
          }`}
        >
          {role === 'assistant' && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🤖</span>
              <span className="text-xs text-gray-500">AI 도우미</span>
            </div>
          )}
          
          <div className="whitespace-pre-wrap">{content}</div>
          
          {/* Timestamp */}
          <div className="text-xs opacity-70 mt-2">
            {formatTimestamp(timestamp)}
          </div>
        </div>

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="mt-2 space-y-1">
            {sources.map((source, index) => (
              <SourceCard key={index} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
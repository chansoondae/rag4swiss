import { formatSimilarityScore, extractFileNameFromPath } from '../lib/utils'

export default function SourceCard({ source }) {
  const { title, file_name, section_title, similarity } = source

  return (
    <div className="source-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">📄</span>
            <span className="font-medium text-gray-800 truncate">
              {title || extractFileNameFromPath(file_name)}
            </span>
          </div>
          
          {section_title && (
            <div className="mt-1 text-gray-600">
              섹션: {section_title}
            </div>
          )}
          
          <div className="mt-1 text-gray-500 text-xs">
            출처: {extractFileNameFromPath(file_name)}
          </div>
        </div>
        
        {similarity && (
          <div className="ml-2 flex-shrink-0">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
              {formatSimilarityScore(similarity)} 일치
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
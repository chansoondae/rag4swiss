export default function LoadingIndicator() {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-gray-500">AI가 답변을 생각하고 있어요</span>
      <div className="loading-dots">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}
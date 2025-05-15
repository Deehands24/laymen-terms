export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-teal-500 animate-spin"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-r-2 border-l-2 border-transparent border-r-cyan-500 border-l-cyan-500 animate-pulse"></div>
      </div>
    </div>
  )
}

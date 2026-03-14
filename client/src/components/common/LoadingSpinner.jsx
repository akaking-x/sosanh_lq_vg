const LoadingSpinner = ({ size = 'md', message = 'Đang tải...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="w-full h-full border-4 border-game-card border-t-game-accent rounded-full"></div>
      </div>
      {message && <p className="text-game-text-secondary text-sm">{message}</p>}
    </div>
  )
}

export default LoadingSpinner

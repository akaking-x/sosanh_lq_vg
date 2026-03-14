const StatsBar = ({ label, value, max = 100, color = 'game-accent', showValue = true }) => {
  const percentage = Math.min((value / max) * 100, 100)

  const colorClasses = {
    'game-accent': 'bg-game-accent',
    'game-gold': 'bg-game-gold',
    'red': 'bg-red-500',
    'blue': 'bg-blue-500',
    'green': 'bg-green-500',
  }

  const barColor = colorClasses[color] || colorClasses['game-accent']

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-game-text-secondary">{label}</span>
        {showValue && (
          <span className="text-sm font-bold text-game-accent">{value}</span>
        )}
      </div>
      <div className="w-full h-2 bg-game-darker rounded-full overflow-hidden border border-game-accent border-opacity-20">
        <div
          className={`h-full ${barColor} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default StatsBar

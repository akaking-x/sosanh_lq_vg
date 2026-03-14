const StatCard = ({ icon, label, value, color = 'game-accent' }) => {
  return (
    <div className="bg-game-card border border-game-accent/20 rounded-lg p-6 hover:border-game-accent/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-game-text-secondary text-sm mb-2">{label}</p>
          <p className={`text-4xl font-bold text-${color}`}>{value || 0}</p>
        </div>
        <div className={`text-4xl opacity-50`}>{icon}</div>
      </div>
    </div>
  )
}

export default StatCard

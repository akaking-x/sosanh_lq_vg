const StatsComparison = ({ vgHero, lqHero }) => {
  const statLabels = {
    hp: { label: 'HP', icon: '❤️' },
    attackPower: { label: 'Tấn công', icon: '⚔️' },
    armor: { label: 'Phòng thủ', icon: '🛡️' },
    moveSpeed: { label: 'Tốc độ', icon: '👟' },
    magicResistance: { label: 'Kháng phép', icon: '🔮' },
    hpRegenPerSecond: { label: 'Hồi máu/giây', icon: '💚' },
  }

  const getMaxValue = (stat) => {
    const values = [
      vgHero?.stats?.[stat],
      lqHero?.stats?.[stat],
    ].filter(Boolean)
    return Math.max(...values) * 1.2 || 100
  }

  const StatBar = ({ label, vgValue, lqValue, maxValue }) => {
    const vgPercent = vgValue ? (vgValue / maxValue) * 100 : 0
    const lqPercent = lqValue ? (lqValue / maxValue) * 100 : 0

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-game-text-secondary">{label}</span>
        </div>

        {/* VG Bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-12 text-xs font-bold text-red-400 text-right">VG</span>
          <div className="flex-1 h-2 bg-game-darker rounded-full overflow-hidden border border-red-400 border-opacity-20">
            <div
              className="h-full bg-red-400 transition-all duration-300 rounded-full"
              style={{ width: `${vgPercent}%` }}
            />
          </div>
          <span className="w-12 text-xs font-bold text-red-400">{vgValue}</span>
        </div>

        {/* LQ Bar */}
        <div className="flex items-center gap-2">
          <span className="w-12 text-xs font-bold text-blue-400 text-right">LQ</span>
          <div className="flex-1 h-2 bg-game-darker rounded-full overflow-hidden border border-blue-400 border-opacity-20">
            <div
              className="h-full bg-blue-400 transition-all duration-300 rounded-full"
              style={{ width: `${lqPercent}%` }}
            />
          </div>
          <span className="w-12 text-xs font-bold text-blue-400">{lqValue}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-game-gold mb-8">So sánh chỉ số</h2>

      <div className="space-y-8">
        {Object.entries(statLabels).map(([statKey, { label, icon }]) => {
          const vgValue = vgHero?.stats?.[statKey]
          const lqValue = lqHero?.stats?.[statKey]

          if (!vgValue && !lqValue) return null

          return (
            <div key={statKey}>
              <h3 className="text-lg font-bold text-game-accent mb-4 flex items-center gap-2">
                <span>{icon}</span> {label}
              </h3>
              <StatBar
                label={label}
                vgValue={vgValue}
                lqValue={lqValue}
                maxValue={getMaxValue(statKey)}
              />
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 bg-game-darker rounded-lg border border-game-accent border-opacity-20">
        <p className="text-sm text-game-text-secondary">
          <span className="text-game-accent font-semibold">Ghi chú:</span> Chiều cao của thanh biểu thị chỉ số tương đối giữa hai tướng. Giá trị cao hơn không nhất thiết có nghĩa là mạnh hơn trong trò chơi.
        </p>
      </div>
    </div>
  )
}

export default StatsComparison

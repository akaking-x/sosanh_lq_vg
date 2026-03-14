const SkillComparison = ({ vgSkill, lqSkill, skillType = 'passive' }) => {
  const skillTypeLabels = {
    passive: 'Kỹ năng Bị động',
    skill1: 'Kỹ năng 1',
    skill2: 'Kỹ năng 2',
    skill3: 'Kỹ năng 3',
    ultimate: 'Kỹ năng Tối thượng',
  }

  const SkillDisplay = ({ skill, game }) => {
    if (!skill) {
      return (
        <div className="flex-1 p-4 bg-game-darker rounded-lg border border-game-accent border-opacity-20">
          <p className="text-game-text-secondary text-sm">Kỹ năng không có dữ liệu</p>
        </div>
      )
    }

    return (
      <div className="flex-1 p-4 bg-game-card rounded-lg border border-game-accent border-opacity-20 hover:border-opacity-40 transition-all">
        <div className="flex gap-3 mb-3">
          {skill.icon && (
            <img
              src={skill.icon}
              alt={skill.name}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <h4 className="font-bold text-game-gold text-sm">{skill.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded inline-block mt-1 ${
              game === 'vg'
                ? 'bg-red-400 bg-opacity-20 text-red-400'
                : 'bg-blue-400 bg-opacity-20 text-blue-400'
            }`}>
              {game === 'vg' ? 'VG' : 'LQ'}
            </span>
          </div>
        </div>

        {skill.description && (
          <p className="text-xs text-game-text-secondary mb-3 line-clamp-3">
            {skill.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-2 text-xs text-game-accent">
          {skill.cooldown && (
            <span className="bg-game-darker px-2 py-1 rounded">
              ⏱️ {skill.cooldown}s
            </span>
          )}
          {skill.manaCost && (
            <span className="bg-game-darker px-2 py-1 rounded">
              💎 {skill.manaCost}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-game-gold mb-4 flex items-center gap-2">
        <span>{skillTypeLabels[skillType]}</span>
      </h3>
      <div className="flex gap-4">
        <SkillDisplay skill={vgSkill} game="vg" />
        <div className="flex items-center justify-center">
          <div className="text-game-accent text-2xl">⚔️</div>
        </div>
        <SkillDisplay skill={lqSkill} game="lq" />
      </div>
    </div>
  )
}

export default SkillComparison

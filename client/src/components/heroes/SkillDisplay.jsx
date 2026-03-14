import useLanguage from '../../hooks/useLanguage'

const SkillDisplay = ({ skill, skillType = 'skill1' }) => {
  const { showChinese } = useLanguage()

  if (!skill) {
    return (
      <div className="card">
        <p className="text-game-text-secondary">Kỹ năng không có dữ liệu</p>
      </div>
    )
  }

  const skillTypeLabels = {
    passive: 'Kỹ năng Bị động',
    skill1: 'Kỹ năng 1',
    skill2: 'Kỹ năng 2',
    skill3: 'Kỹ năng 3',
    ultimate: 'Kỹ năng Tối thượng',
  }

  const getDisplayName = () => {
    if (showChinese && skill.chineseName) {
      return skill.chineseName
    }
    return skill.name
  }

  return (
    <div className="card">
      <div className="flex gap-4">
        {/* Skill Icon */}
        <div className="flex-shrink-0">
          {skill.icon ? (
            <img
              src={skill.icon}
              alt={skill.name}
              className="w-16 h-16 rounded-lg object-cover border border-game-accent border-opacity-30"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-game-darker border border-game-accent border-opacity-30 flex items-center justify-center text-game-text-secondary">
              ?
            </div>
          )}
        </div>

        {/* Skill Info */}
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-lg font-bold text-game-gold">{getDisplayName()}</h4>
              <p className="text-xs text-game-text-secondary">
                {skillTypeLabels[skillType]}
              </p>
            </div>
          </div>

          {/* Description */}
          {skill.description && (
            <p className="text-sm text-game-text-secondary mb-3">
              {skill.description}
            </p>
          )}

          {/* Cooldown & Mana */}
          <div className="flex gap-4 text-xs text-game-accent">
            {skill.cooldown && (
              <div>
                <span className="text-game-text-secondary">Thời gian chờ:</span> {skill.cooldown}s
              </div>
            )}
            {skill.manaCost && (
              <div>
                <span className="text-game-text-secondary">Năng lượng:</span> {skill.manaCost}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillDisplay

import useLanguage from '../../hooks/useLanguage'

const SkillDisplay = ({ skill, skillType = 'Kỹ năng', showChinese: showChineseProp }) => {
  const { showChinese: showChineseHook } = useLanguage()
  const showChinese = showChineseProp !== undefined ? showChineseProp : showChineseHook

  if (!skill) {
    return (
      <div className="card">
        <p className="text-game-text-secondary">Kỹ năng không có dữ liệu</p>
      </div>
    )
  }

  const skillTypeLabels = {
    Passive: 'Kỹ năng Bị động',
    Q: 'Kỹ năng 1 (Q)',
    W: 'Kỹ năng 2 (W)',
    E: 'Kỹ năng 3 (E)',
    R: 'Chiêu cuối (R)',
    Skill1: 'Kỹ năng 1',
    Skill2: 'Kỹ năng 2',
    Skill3: 'Kỹ năng 3',
    Skill4: 'Kỹ năng 4',
    passive: 'Kỹ năng Bị động',
    skill1: 'Kỹ năng 1',
    skill2: 'Kỹ năng 2',
    skill3: 'Kỹ năng 3',
    ultimate: 'Kỹ năng Tối thượng',
  }

  const getDisplayName = () => {
    if (showChinese && skill.name_cn) {
      return skill.name_cn
    }
    return skill.name_vi || skill.name || 'Kỹ năng'
  }

  const getDescription = () => {
    if (showChinese && skill.description_cn) {
      return skill.description_cn
    }
    return skill.description_vi || skill.description || ''
  }

  return (
    <div className="card">
      <div className="flex gap-4">
        {/* Skill Icon */}
        <div className="flex-shrink-0">
          {skill.icon_url ? (
            <img
              src={skill.icon_url}
              alt={skill.name_vi}
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
                {skillTypeLabels[skillType] || skillType}
              </p>
            </div>
          </div>

          {/* Description */}
          {getDescription() && (
            <p className="text-sm text-game-text-secondary mb-3">
              {getDescription()}
            </p>
          )}

          {/* Cooldown & Mana */}
          <div className="flex gap-4 text-xs text-game-accent">
            {skill.cooldown != null && (
              <div>
                <span className="text-game-text-secondary">Thời gian chờ:</span> {skill.cooldown}s
              </div>
            )}
            {skill.manaCost != null && (
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

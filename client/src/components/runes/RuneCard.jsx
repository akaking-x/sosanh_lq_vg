import { Link } from 'react-router-dom'
import useLanguage from '../../hooks/useLanguage'

const RuneCard = ({ rune }) => {
  const { showChinese } = useLanguage()

  const gameBadgeColors = {
    vg: 'bg-red-400 bg-opacity-20 text-red-400',
    lq: 'bg-blue-400 bg-opacity-20 text-blue-400',
  }

  const tierColors = {
    'S': 'text-red-400',
    'A': 'text-orange-400',
    'B': 'text-purple-400',
    'C': 'text-blue-400',
  }

  const getDisplayName = () => {
    if (rune.game === 'vg' && showChinese && rune.name_cn) {
      return rune.name_cn
    }
    return rune.name_vi
  }

  return (
    <Link
      to={`/runes/${rune.slug}`}
      className="card-hover group relative overflow-hidden"
    >
      {/* Game Badge */}
      <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-semibold badge-game ${gameBadgeColors[rune.game]}`}>
        {rune.game === 'vg' ? 'VG' : 'LQ'}
      </div>

      {/* Icon */}
      <div className="relative h-32 bg-game-darker rounded-lg overflow-hidden mb-4 group-hover:shadow-lg transition-all flex items-center justify-center">
        {rune.icon_url ? (
          <img
            src={rune.icon_url}
            alt={rune.name_vi}
            className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="text-game-text-secondary text-sm">No Image</div>
        )}
      </div>

      {/* Rune Info */}
      <h3 className="font-bold text-lg text-game-gold group-hover:text-game-accent transition-colors mb-1 truncate">
        {getDisplayName()}
      </h3>

      {rune.game === 'vg' && rune.name_cn && !showChinese && (
        <p className="text-xs text-game-text-secondary mb-2">({rune.name_cn})</p>
      )}

      {/* Tier */}
      {rune.tier && (
        <p className={`text-sm font-semibold mb-2 ${tierColors[rune.tier] || 'text-game-text-secondary'}`}>
          ⭐ Tầng {rune.tier}
        </p>
      )}

      {/* Category */}
      {rune.category && (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-game-accent bg-opacity-10 text-game-accent">
          {rune.category}
        </span>
      )}
    </Link>
  )
}

export default RuneCard

import { Link } from 'react-router-dom'
import useLanguage from '../../hooks/useLanguage'

const HeroCard = ({ hero }) => {
  const { showChinese } = useLanguage()

  const gameColors = {
    vg: 'text-red-400',
    lq: 'text-blue-400',
  }

  const gameBadgeColors = {
    vg: 'bg-red-400 bg-opacity-20 text-red-400',
    lq: 'bg-blue-400 bg-opacity-20 text-blue-400',
  }

  const getRoles = () => {
    if (!hero.roles) return []
    return Array.isArray(hero.roles) ? hero.roles : hero.roles.split(',')
  }

  const getDisplayName = () => {
    if (hero.game === 'vg' && showChinese && hero.chineseName) {
      return hero.chineseName
    }
    return hero.name
  }

  const roleIcons = {
    warrior: '⚔️',
    mage: '✨',
    tank: '🛡️',
    assassin: '🗡️',
    support: '❤️',
    marksman: '🏹',
  }

  return (
    <Link
      to={`/heroes/${hero.slug}`}
      className="card-hover group relative overflow-hidden"
    >
      {/* Game Badge */}
      <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-semibold badge-game ${gameBadgeColors[hero.game]}`}>
        {hero.game === 'vg' ? 'VG' : 'LQ'}
      </div>

      {/* Avatar */}
      <div className="relative h-40 bg-game-darker rounded-lg overflow-hidden mb-4 group-hover:shadow-lg transition-all">
        {hero.avatar ? (
          <img
            src={hero.avatar}
            alt={hero.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-game-text-secondary">
            No Image
          </div>
        )}
      </div>

      {/* Hero Info */}
      <h3 className="font-bold text-lg text-game-gold group-hover:text-game-accent transition-colors mb-1 truncate">
        {getDisplayName()}
      </h3>

      {hero.game === 'vg' && hero.chineseName && !showChinese && (
        <p className="text-xs text-game-text-secondary mb-3">({hero.chineseName})</p>
      )}

      {/* Title */}
      {hero.title && (
        <p className="text-sm text-game-text-secondary mb-3 line-clamp-2">
          {hero.title}
        </p>
      )}

      {/* Roles */}
      <div className="flex flex-wrap gap-1">
        {getRoles().map((role) => (
          <span
            key={role}
            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-game-accent bg-opacity-10 text-game-accent"
          >
            {roleIcons[role.toLowerCase()] || '•'} {role}
          </span>
        ))}
      </div>
    </Link>
  )
}

export default HeroCard

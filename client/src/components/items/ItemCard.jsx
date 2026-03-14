import { Link } from 'react-router-dom'
import useLanguage from '../../hooks/useLanguage'

const ItemCard = ({ item }) => {
  const { showChinese } = useLanguage()

  const gameBadgeColors = {
    vg: 'bg-red-400 bg-opacity-20 text-red-400',
    lq: 'bg-blue-400 bg-opacity-20 text-blue-400',
  }

  const categoryIcons = {
    'Tấn Công': '⚔️',
    'Phòng Thủ': '🛡️',
    'Phép Thuật': '✨',
    'Tốc Độ': '👟',
    'Rừng': '🌲',
  }

  const getDisplayName = () => {
    if (item.game === 'vg' && showChinese && item.name_cn) {
      return item.name_cn
    }
    return item.name_vi
  }

  return (
    <Link
      to={`/items/${item.slug}`}
      className="card-hover group relative overflow-hidden"
    >
      {/* Game Badge */}
      <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-semibold badge-game ${gameBadgeColors[item.game]}`}>
        {item.game === 'vg' ? 'VG' : 'LQ'}
      </div>

      {/* Icon */}
      <div className="relative h-32 bg-game-darker rounded-lg overflow-hidden mb-4 group-hover:shadow-lg transition-all flex items-center justify-center">
        {item.icon_url ? (
          <img
            src={item.icon_url}
            alt={item.name_vi}
            className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="text-game-text-secondary text-sm">No Image</div>
        )}
      </div>

      {/* Item Info */}
      <h3 className="font-bold text-lg text-game-gold group-hover:text-game-accent transition-colors mb-1 truncate">
        {getDisplayName()}
      </h3>

      {item.game === 'vg' && item.name_cn && !showChinese && (
        <p className="text-xs text-game-text-secondary mb-2">({item.name_cn})</p>
      )}

      {/* Price/Cost */}
      {item.price && (
        <p className="text-sm text-game-accent font-semibold mb-2">
          💰 {item.price}
        </p>
      )}

      {/* Category */}
      {item.category && (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-game-accent bg-opacity-10 text-game-accent">
          {categoryIcons[item.category.toLowerCase()] || '•'} {item.category}
        </span>
      )}
    </Link>
  )
}

export default ItemCard

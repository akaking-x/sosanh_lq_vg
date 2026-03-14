import { Link } from 'react-router-dom'

const ComparisonCard = ({ mapping }) => {
  const vgHero = mapping.vgHero
  const lqHero = mapping.lqHero
  const similarity = mapping.similarityScore || 0

  const getSimilarityColor = (score) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-game-accent'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSimilarityBg = (score) => {
    if (score >= 80) return 'bg-green-400 bg-opacity-20'
    if (score >= 60) return 'bg-game-accent bg-opacity-20'
    if (score >= 40) return 'bg-yellow-400 bg-opacity-20'
    return 'bg-red-400 bg-opacity-20'
  }

  return (
    <Link to={`/compare/${mapping._id || mapping.id}`} className="card-hover group">
      <div className="flex items-center gap-4">
        {/* VG Hero */}
        <div className="flex-1 text-center">
          <div className="relative h-24 w-24 mx-auto mb-2 rounded-lg overflow-hidden bg-game-darker">
            {vgHero.avatar ? (
              <img
                src={vgHero.avatar}
                alt={vgHero.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-game-text-secondary text-xs">
                No Image
              </div>
            )}
            <div className="absolute top-1 right-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-400 bg-opacity-20 text-red-400">
              VG
            </div>
          </div>
          <h4 className="font-bold text-game-gold text-sm group-hover:text-game-accent transition-colors truncate">
            {vgHero.name}
          </h4>
          <p className="text-xs text-game-text-secondary">{vgHero.title}</p>
        </div>

        {/* Middle - Similarity Score */}
        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getSimilarityBg(similarity)} ${getSimilarityColor(similarity)}`}>
            {similarity}%
          </div>
          <p className="text-xs text-game-text-secondary text-center">Độ tương tự</p>
        </div>

        {/* LQ Hero */}
        <div className="flex-1 text-center">
          <div className="relative h-24 w-24 mx-auto mb-2 rounded-lg overflow-hidden bg-game-darker">
            {lqHero.avatar ? (
              <img
                src={lqHero.avatar}
                alt={lqHero.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-game-text-secondary text-xs">
                No Image
              </div>
            )}
            <div className="absolute top-1 right-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-400 bg-opacity-20 text-blue-400">
              LQ
            </div>
          </div>
          <h4 className="font-bold text-game-gold text-sm group-hover:text-game-accent transition-colors truncate">
            {lqHero.name}
          </h4>
          <p className="text-xs text-game-text-secondary">{lqHero.title}</p>
        </div>
      </div>
    </Link>
  )
}

export default ComparisonCard

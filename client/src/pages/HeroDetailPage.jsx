import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import SkillDisplay from '../components/heroes/SkillDisplay'
import StatsBar from '../components/heroes/StatsBar'
import { heroApi, mappingApi } from '../services/api'
import useLanguage from '../hooks/useLanguage'
import { ChevronLeft } from 'lucide-react'

const HeroDetailPage = () => {
  const { slug } = useParams()
  const [hero, setHero] = useState(null)
  const [similarHero, setSimilarHero] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showChinese, toggleLanguage } = useLanguage()

  useEffect(() => {
    fetchHeroDetails()
  }, [slug])

  const fetchHeroDetails = async () => {
    try {
      setLoading(true)
      const response = await heroApi.getById(slug)
      const heroData = response.data
      setHero(heroData)

      // Fetch similar hero mapping
      if (heroData._id || heroData.id) {
        try {
          const mappingsResponse = await mappingApi.getAll({
            heroId: heroData._id || heroData.id,
          })
          if (mappingsResponse.data && mappingsResponse.data.length > 0) {
            const mapping = mappingsResponse.data[0]
            const similarHeroId = heroData.game === 'vg' ? mapping.lqHeroId : mapping.vgHeroId
            if (similarHeroId) {
              const similarResponse = await heroApi.getById(similarHeroId)
              setSimilarHero(similarResponse.data)
            }
          }
        } catch (error) {
          console.error('Failed to fetch similar hero:', error)
        }
      }
    } catch (error) {
      console.error('Failed to fetch hero details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (heroData = hero) => {
    if (!heroData) return ''
    if (heroData.game === 'vg' && showChinese && heroData.chineseName) {
      return heroData.chineseName
    }
    return heroData.name
  }

  const getRoles = (heroData = hero) => {
    if (!heroData || !heroData.roles) return []
    return Array.isArray(heroData.roles) ? heroData.roles : heroData.roles.split(',')
  }

  const roleIcons = {
    warrior: '⚔️',
    mage: '✨',
    tank: '🛡️',
    assassin: '🗡️',
    support: '❤️',
    marksman: '🏹',
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen py-12 px-4 flex items-center justify-center">
          <div className="text-game-text-secondary">Đang tải chi tiết tướng...</div>
        </div>
      </Layout>
    )
  }

  if (!hero) {
    return (
      <Layout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-game-gold mb-4">Không tìm thấy tướng</h1>
            <Link to="/heroes" className="btn-primary">
              Quay lại danh sách tướng
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-game-dark py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link to="/heroes" className="inline-flex items-center gap-2 text-game-accent hover:text-game-gold transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            Quay lại danh sách tướng
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Header */}
              <div className="card">
                <div className="flex gap-6 flex-col sm:flex-row">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {hero.avatar ? (
                      <img
                        src={hero.avatar}
                        alt={hero.name}
                        className="w-40 h-40 rounded-lg object-cover border border-game-accent border-opacity-30"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-lg bg-game-darker border border-game-accent border-opacity-30 flex items-center justify-center">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-game-gold mb-2">
                          {getDisplayName()}
                        </h1>
                        {hero.game === 'vg' && hero.chineseName && (
                          <p className="text-sm text-game-text-secondary mb-3">
                            ({hero.chineseName})
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        hero.game === 'vg'
                          ? 'bg-red-400 bg-opacity-20 text-red-400'
                          : 'bg-blue-400 bg-opacity-20 text-blue-400'
                      }`}>
                        {hero.game === 'vg' ? 'VG' : 'LQ'}
                      </span>
                    </div>

                    {/* Title */}
                    {hero.title && (
                      <p className="text-lg text-game-text-secondary mb-4">{hero.title}</p>
                    )}

                    {/* Roles */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getRoles().map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-game-accent bg-opacity-20 text-game-accent"
                        >
                          {roleIcons[role.toLowerCase()] || '•'} {role}
                        </span>
                      ))}
                    </div>

                    {/* Language Toggle for VG */}
                    {hero.game === 'vg' && (
                      <button
                        onClick={toggleLanguage}
                        className="btn-secondary text-sm"
                      >
                        {showChinese ? '中文' : 'Tiếng Việt'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <h2 className="text-2xl font-bold text-game-gold mb-4">Kỹ năng</h2>
                <div className="space-y-4">
                  {hero.skills && (
                    <>
                      {hero.skills.passive && (
                        <SkillDisplay skill={hero.skills.passive} skillType="passive" />
                      )}
                      {hero.skills.skill1 && (
                        <SkillDisplay skill={hero.skills.skill1} skillType="skill1" />
                      )}
                      {hero.skills.skill2 && (
                        <SkillDisplay skill={hero.skills.skill2} skillType="skill2" />
                      )}
                      {hero.skills.skill3 && (
                        <SkillDisplay skill={hero.skills.skill3} skillType="skill3" />
                      )}
                      {hero.skills.ultimate && (
                        <SkillDisplay skill={hero.skills.ultimate} skillType="ultimate" />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Stats Section */}
              {hero.stats && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-game-gold mb-6">Chỉ số cơ bản</h2>
                  <div className="space-y-4">
                    {hero.stats.hp && (
                      <StatsBar label="HP" value={hero.stats.hp} max={3000} color="red" />
                    )}
                    {hero.stats.attack && (
                      <StatsBar label="Tấn công" value={hero.stats.attack} max={100} color="game-gold" />
                    )}
                    {hero.stats.defense && (
                      <StatsBar label="Phòng thủ" value={hero.stats.defense} max={100} color="blue" />
                    )}
                    {hero.stats.speed && (
                      <StatsBar label="Tốc độ di chuyển" value={hero.stats.speed} max={400} color="green" />
                    )}
                    {hero.stats.magicDamage && (
                      <StatsBar label="Sát thương phép" value={hero.stats.magicDamage} max={100} color="game-accent" />
                    )}
                    {hero.stats.magicResistance && (
                      <StatsBar label="Kháng phép" value={hero.stats.magicResistance} max={100} color="blue" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Similar Hero Section */}
              {similarHero && (
                <div className="card">
                  <h3 className="text-lg font-bold text-game-gold mb-4">Tướng tương tự</h3>
                  <div className="text-center">
                    <p className="text-sm text-game-text-secondary mb-3">
                      {hero.game === 'vg' ? 'Tương ứng trong LQ' : 'Tương ứng trong VG'}
                    </p>
                    <Link
                      to={`/heroes/${similarHero.slug}`}
                      className="inline-block"
                    >
                      {similarHero.avatar && (
                        <img
                          src={similarHero.avatar}
                          alt={similarHero.name}
                          className="w-24 h-24 rounded-lg object-cover border border-game-accent border-opacity-30 hover:border-opacity-100 transition-all mx-auto mb-3"
                        />
                      )}
                      <p className="font-bold text-game-accent hover:text-game-gold transition-colors">
                        {similarHero.name}
                      </p>
                    </Link>
                  </div>
                </div>
              )}

              {/* Recommended Runes */}
              {hero.recommendedRunes && hero.recommendedRunes.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-bold text-game-gold mb-4">Ngọc khuyên dùng</h3>
                  <div className="space-y-2">
                    {hero.recommendedRunes.map((rune, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-game-darker rounded">
                        {rune.icon && (
                          <img
                            src={rune.icon}
                            alt={rune.name}
                            className="w-6 h-6 rounded"
                          />
                        )}
                        <span className="text-sm text-game-text-secondary">{rune.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skins Gallery */}
              {hero.skins && hero.skins.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-bold text-game-gold mb-4">Trang phục</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {hero.skins.map((skin, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border border-game-accent border-opacity-20">
                        {skin.image ? (
                          <img
                            src={skin.image}
                            alt={skin.name}
                            className="w-full h-24 object-cover"
                            title={skin.name}
                          />
                        ) : (
                          <div className="w-full h-24 bg-game-darker flex items-center justify-center">
                            <span className="text-xs text-game-text-secondary">{skin.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default HeroDetailPage

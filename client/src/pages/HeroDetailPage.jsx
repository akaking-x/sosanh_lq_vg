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
      const response = await heroApi.getBySlug(slug)
      const heroData = response.data.data || response.data
      setHero(heroData)

      // Fetch similar hero mapping using the hero/:slug endpoint
      if (heroData && heroData.slug) {
        try {
          const mappingsResponse = await mappingApi.getByHeroSlug(heroData.slug, heroData.game)
          const mappingData = mappingsResponse.data.data || mappingsResponse.data
          if (mappingData) {
            // The mapping has populated vg_hero and lq_hero
            const similar = heroData.game === 'vg' ? mappingData.lq_hero : mappingData.vg_hero
            if (similar) {
              setSimilarHero(similar)
            }
          }
        } catch (error) {
          // No mapping found, that's OK
          console.log('No similar hero mapping found')
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
    if (heroData.game === 'vg' && showChinese && heroData.name_cn) {
      return heroData.name_cn
    }
    return heroData.name_vi
  }

  const getRoles = (heroData = hero) => {
    if (!heroData || !heroData.roles) return []
    return Array.isArray(heroData.roles) ? heroData.roles : heroData.roles.split(',')
  }

  const roleIcons = {
    'Chiến Binh': '⚔️',
    'Pháp Sư': '✨',
    'Bộ Binh': '🛡️',
    'Sát Thủ': '🗡️',
    'Hỗ Trợ': '❤️',
    'Tấn Công': '🏹',
    // English fallbacks
    warrior: '⚔️',
    mage: '✨',
    tank: '🛡️',
    assassin: '🗡️',
    support: '❤️',
    marksman: '🏹',
  }

  const skillTypeLabels = ['Bị Động', 'Kỹ năng 1', 'Kỹ năng 2', 'Kỹ năng 3', 'Chiêu cuối']

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
                    {hero.avatar_url ? (
                      <img
                        src={hero.avatar_url}
                        alt={hero.name_vi}
                        className="w-40 h-40 rounded-lg object-cover border border-game-accent border-opacity-30"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-lg bg-game-darker border border-game-accent border-opacity-30 flex items-center justify-center text-game-text-secondary">
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
                        {hero.game === 'vg' && hero.name_cn && hero.name_cn !== hero.name_vi && (
                          <p className="text-sm text-game-text-secondary mb-3">
                            ({hero.name_cn})
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
                    {hero.title_vi && (
                      <p className="text-lg text-game-text-secondary mb-4">{showChinese && hero.title_cn ? hero.title_cn : hero.title_vi}</p>
                    )}

                    {/* Roles */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getRoles().map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-game-accent bg-opacity-20 text-game-accent"
                        >
                          {roleIcons[role] || roleIcons[role.toLowerCase()] || '•'} {role}
                        </span>
                      ))}
                    </div>

                    {/* Difficulty */}
                    {hero.difficulty && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-game-text-secondary">Độ khó:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} className={`w-3 h-3 rounded-full ${i <= hero.difficulty ? 'bg-game-gold' : 'bg-game-darker'}`} />
                          ))}
                        </div>
                      </div>
                    )}

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

              {/* Description */}
              {hero.description && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-game-gold mb-4">Mô tả</h2>
                  <p className="text-game-text-secondary leading-relaxed">{hero.description}</p>
                </div>
              )}

              {/* Skills Section - skills is an array */}
              {hero.skills && hero.skills.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-game-gold mb-4">Kỹ năng</h2>
                  <div className="space-y-4">
                    {hero.skills.map((skill, index) => (
                      <SkillDisplay
                        key={skill._id || index}
                        skill={skill}
                        skillType={skill.type || skillTypeLabels[index] || `Kỹ năng ${index + 1}`}
                        showChinese={showChinese}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Section */}
              {hero.stats && Object.keys(hero.stats).length > 0 && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-game-gold mb-6">Chỉ số cơ bản</h2>
                  <div className="space-y-4">
                    {hero.stats.hp != null && (
                      <StatsBar label="HP" value={hero.stats.hp} max={8000} color="red" />
                    )}
                    {hero.stats.attackPower != null && (
                      <StatsBar label="Tấn công" value={hero.stats.attackPower} max={500} color="game-gold" />
                    )}
                    {hero.stats.armor != null && (
                      <StatsBar label="Phòng thủ" value={hero.stats.armor} max={500} color="blue" />
                    )}
                    {hero.stats.moveSpeed != null && (
                      <StatsBar label="Tốc độ di chuyển" value={hero.stats.moveSpeed} max={500} color="green" />
                    )}
                    {hero.stats.magicResistance != null && (
                      <StatsBar label="Kháng phép" value={hero.stats.magicResistance} max={500} color="game-accent" />
                    )}
                    {hero.stats.hpRegenPerSecond != null && (
                      <StatsBar label="Hồi máu/giây" value={hero.stats.hpRegenPerSecond} max={100} color="green" />
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
                      {similarHero.avatar_url ? (
                        <img
                          src={similarHero.avatar_url}
                          alt={similarHero.name_vi}
                          className="w-24 h-24 rounded-lg object-cover border border-game-accent border-opacity-30 hover:border-opacity-100 transition-all mx-auto mb-3"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-game-darker border border-game-accent border-opacity-30 flex items-center justify-center mx-auto mb-3 text-game-text-secondary text-xs">
                          No Image
                        </div>
                      )}
                      <p className="font-bold text-game-accent hover:text-game-gold transition-colors">
                        {similarHero.name_vi}
                      </p>
                    </Link>
                  </div>
                </div>
              )}

              {/* Recommended Runes */}
              {hero.recommended_runes && hero.recommended_runes.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-bold text-game-gold mb-4">Ngọc khuyên dùng</h3>
                  <div className="space-y-2">
                    {hero.recommended_runes.map((rune, index) => (
                      <div key={rune._id || index} className="flex items-center gap-2 p-2 bg-game-darker rounded">
                        {rune.icon_url && (
                          <img
                            src={rune.icon_url}
                            alt={rune.name_vi || rune.name}
                            className="w-6 h-6 rounded"
                          />
                        )}
                        <span className="text-sm text-game-text-secondary">{rune.name_vi || rune.name || `Rune ${index + 1}`}</span>
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
                      <div key={skin._id || index} className="rounded-lg overflow-hidden border border-game-accent border-opacity-20">
                        {skin.icon_url ? (
                          <img
                            src={skin.icon_url}
                            alt={skin.name_vi || skin.name_cn}
                            className="w-full h-24 object-cover"
                            title={showChinese && skin.name_cn ? skin.name_cn : skin.name_vi}
                          />
                        ) : (
                          <div className="w-full h-24 bg-game-darker flex items-center justify-center">
                            <span className="text-xs text-game-text-secondary">{showChinese && skin.name_cn ? skin.name_cn : skin.name_vi}</span>
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

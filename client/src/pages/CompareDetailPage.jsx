import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import SkillComparison from '../components/comparison/SkillComparison'
import StatsComparison from '../components/comparison/StatsComparison'
import { mappingApi } from '../services/api'
import useLanguage from '../hooks/useLanguage'
import { ChevronLeft } from 'lucide-react'

const CompareDetailPage = () => {
  const { mappingId } = useParams()
  const [mapping, setMapping] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showChinese, toggleLanguage } = useLanguage()

  useEffect(() => {
    fetchMappingDetails()
  }, [mappingId])

  const fetchMappingDetails = async () => {
    try {
      setLoading(true)
      const response = await mappingApi.getById(mappingId)
      const data = response.data.data || response.data
      setMapping(data)
    } catch (error) {
      console.error('Failed to fetch mapping details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (hero) => {
    if (!hero) return ''
    if (hero.game === 'vg' && showChinese && hero.name_cn) {
      return hero.name_cn
    }
    return hero.name_vi
  }

  const getRoles = (hero) => {
    if (!hero || !hero.roles) return []
    return Array.isArray(hero.roles) ? hero.roles : hero.roles.split(',')
  }

  const roleIcons = {
    'Chiến Binh': '⚔️',
    'Pháp Sư': '✨',
    'Bộ Binh': '🛡️',
    'Sát Thủ': '🗡️',
    'Hỗ Trợ': '❤️',
    'Tấn Công': '🏹',
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
          <div className="text-game-text-secondary">Đang tải chi tiết so sánh...</div>
        </div>
      </Layout>
    )
  }

  if (!mapping) {
    return (
      <Layout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-game-gold mb-4">Không tìm thấy so sánh</h1>
            <Link to="/compare" className="btn-primary">
              Quay lại danh sách so sánh
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const vgHero = mapping.vg_hero
  const lqHero = mapping.lq_hero
  const similarity = mapping.similarity_score || 0

  // Skills are arrays, map them by index for comparison
  const getSkillByIndex = (hero, index) => {
    if (!hero || !hero.skills || !Array.isArray(hero.skills)) return null
    return hero.skills[index] || null
  }

  const skillLabels = ['Bị Động', 'Kỹ năng 1', 'Kỹ năng 2', 'Kỹ năng 3', 'Chiêu cuối']

  return (
    <Layout>
      <div className="min-h-screen bg-game-dark py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link to="/compare" className="inline-flex items-center gap-2 text-game-accent hover:text-game-gold transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            Quay lại danh sách so sánh
          </Link>

          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-game-gold mb-4">
              So sánh chi tiết Tướng
            </h1>

            {/* Similarity Score */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center flex-1">
                <p className="text-4xl font-bold text-red-400 mb-2">{getDisplayName(vgHero)}</p>
                <p className="text-red-400 font-semibold">Vương Giả Vinh Diệu</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-game-accent bg-opacity-20 flex items-center justify-center font-bold text-2xl text-game-accent mb-2">
                  {similarity}%
                </div>
                <p className="text-game-text-secondary text-sm">Độ tương tự</p>
              </div>

              <div className="text-center flex-1">
                <p className="text-4xl font-bold text-blue-400 mb-2">{getDisplayName(lqHero)}</p>
                <p className="text-blue-400 font-semibold">Liên Quân Mobile</p>
              </div>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="btn-secondary text-sm"
            >
              {showChinese ? '中文' : 'Tiếng Việt'}
            </button>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* VG Hero */}
            <div className="space-y-6">
              <div className="card">
                <div className="flex gap-4 mb-6">
                  {vgHero?.avatar_url ? (
                    <img
                      src={vgHero.avatar_url}
                      alt={vgHero.name_vi}
                      className="w-32 h-32 rounded-lg object-cover border border-red-400 border-opacity-30"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-game-darker border border-red-400 border-opacity-30 flex items-center justify-center text-game-text-secondary">
                      No Image
                    </div>
                  )}
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">
                      {getDisplayName(vgHero)}
                    </h2>
                    {vgHero?.title_vi && (
                      <p className="text-game-text-secondary mb-3">{showChinese && vgHero.title_cn ? vgHero.title_cn : vgHero.title_vi}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {getRoles(vgHero).map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-400 bg-opacity-10 text-red-400"
                        >
                          {roleIcons[role] || roleIcons[role.toLowerCase()] || '•'} {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LQ Hero */}
            <div className="space-y-6">
              <div className="card">
                <div className="flex gap-4 mb-6">
                  {lqHero?.avatar_url ? (
                    <img
                      src={lqHero.avatar_url}
                      alt={lqHero.name_vi}
                      className="w-32 h-32 rounded-lg object-cover border border-blue-400 border-opacity-30"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-game-darker border border-blue-400 border-opacity-30 flex items-center justify-center text-game-text-secondary">
                      No Image
                    </div>
                  )}
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-blue-400 mb-2">
                      {getDisplayName(lqHero)}
                    </h2>
                    {lqHero?.title_vi && (
                      <p className="text-game-text-secondary mb-3">{lqHero.title_vi}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {getRoles(lqHero).map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-400 bg-opacity-10 text-blue-400"
                        >
                          {roleIcons[role] || roleIcons[role.toLowerCase()] || '•'} {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Comparison - skills are arrays, compare by index */}
          {(vgHero?.skills?.length > 0 || lqHero?.skills?.length > 0) && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-game-gold mb-8">So sánh Kỹ năng</h2>
              {skillLabels.map((label, index) => (
                <SkillComparison
                  key={index}
                  vgSkill={getSkillByIndex(vgHero, index)}
                  lqSkill={getSkillByIndex(lqHero, index)}
                  skillType={label}
                />
              ))}
            </div>
          )}

          {/* Stats Comparison */}
          <StatsComparison vgHero={vgHero} lqHero={lqHero} />

          {/* Similarity Notes */}
          {mapping.notes && (
            <div className="mt-12 card">
              <h2 className="text-2xl font-bold text-game-gold mb-4">Ghi chú về sự tương tự</h2>
              <p className="text-game-text-secondary leading-relaxed">{mapping.notes}</p>
            </div>
          )}

          {/* Hero Links */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Link
              to={`/heroes/${vgHero?.slug}`}
              className="card-hover"
            >
              <div className="text-center">
                <p className="text-lg font-bold text-red-400 mb-2">Xem chi tiết</p>
                <p className="text-game-text-secondary">{vgHero?.name_vi}</p>
              </div>
            </Link>
            <Link
              to={`/heroes/${lqHero?.slug}`}
              className="card-hover"
            >
              <div className="text-center">
                <p className="text-lg font-bold text-blue-400 mb-2">Xem chi tiết</p>
                <p className="text-game-text-secondary">{lqHero?.name_vi}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default CompareDetailPage

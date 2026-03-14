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
      setMapping(response.data)
    } catch (error) {
      console.error('Failed to fetch mapping details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (hero) => {
    if (!hero) return ''
    if (hero.game === 'vg' && showChinese && hero.chineseName) {
      return hero.chineseName
    }
    return hero.name
  }

  const getRoles = (hero) => {
    if (!hero || !hero.roles) return []
    return Array.isArray(hero.roles) ? hero.roles : hero.roles.split(',')
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

  const vgHero = mapping.vgHero
  const lqHero = mapping.lqHero
  const similarity = mapping.similarityScore || 0

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
                <p className="text-4xl font-bold text-red-400 mb-2">{vgHero?.name}</p>
                <p className="text-red-400 font-semibold">Vương Giả Vinh Diệu</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-game-accent bg-opacity-20 flex items-center justify-center font-bold text-2xl text-game-accent mb-2">
                  {similarity}%
                </div>
                <p className="text-game-text-secondary text-sm">Độ tương tự</p>
              </div>

              <div className="text-center flex-1">
                <p className="text-4xl font-bold text-blue-400 mb-2">{lqHero?.name}</p>
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
                  {vgHero?.avatar && (
                    <img
                      src={vgHero.avatar}
                      alt={vgHero.name}
                      className="w-32 h-32 rounded-lg object-cover border border-red-400 border-opacity-30"
                    />
                  )}
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">
                      {getDisplayName(vgHero)}
                    </h2>
                    {vgHero?.title && (
                      <p className="text-game-text-secondary mb-3">{vgHero.title}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {getRoles(vgHero).map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-400 bg-opacity-10 text-red-400"
                        >
                          {roleIcons[role.toLowerCase()] || '•'} {role}
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
                  {lqHero?.avatar && (
                    <img
                      src={lqHero.avatar}
                      alt={lqHero.name}
                      className="w-32 h-32 rounded-lg object-cover border border-blue-400 border-opacity-30"
                    />
                  )}
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-blue-400 mb-2">
                      {getDisplayName(lqHero)}
                    </h2>
                    {lqHero?.title && (
                      <p className="text-game-text-secondary mb-3">{lqHero.title}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {getRoles(lqHero).map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-400 bg-opacity-10 text-blue-400"
                        >
                          {roleIcons[role.toLowerCase()] || '•'} {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Comparison */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-game-gold mb-8">So sánh Kỹ năng</h2>

            {/* Passive */}
            <SkillComparison
              vgSkill={vgHero?.skills?.passive}
              lqSkill={lqHero?.skills?.passive}
              skillType="passive"
            />

            {/* Skill 1 */}
            <SkillComparison
              vgSkill={vgHero?.skills?.skill1}
              lqSkill={lqHero?.skills?.skill1}
              skillType="skill1"
            />

            {/* Skill 2 */}
            <SkillComparison
              vgSkill={vgHero?.skills?.skill2}
              lqSkill={lqHero?.skills?.skill2}
              skillType="skill2"
            />

            {/* Skill 3 */}
            <SkillComparison
              vgSkill={vgHero?.skills?.skill3}
              lqSkill={lqHero?.skills?.skill3}
              skillType="skill3"
            />

            {/* Ultimate */}
            <SkillComparison
              vgSkill={vgHero?.skills?.ultimate}
              lqSkill={lqHero?.skills?.ultimate}
              skillType="ultimate"
            />
          </div>

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
                <p className="text-game-text-secondary">{vgHero?.name}</p>
              </div>
            </Link>
            <Link
              to={`/heroes/${lqHero?.slug}`}
              className="card-hover"
            >
              <div className="text-center">
                <p className="text-lg font-bold text-blue-400 mb-2">Xem chi tiết</p>
                <p className="text-game-text-secondary">{lqHero?.name}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default CompareDetailPage

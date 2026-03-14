import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import GameFilter from '../components/common/GameFilter'
import SearchBar from '../components/common/SearchBar'
import HeroCard from '../components/heroes/HeroCard'
import { heroApi } from '../services/api'
import useLanguage from '../hooks/useLanguage'

const HeroListPage = () => {
  const [heroes, setHeroes] = useState([])
  const [filteredHeroes, setFilteredHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [gameFilter, setGameFilter] = useState('both')
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { showChinese, toggleLanguage } = useLanguage()

  const roles = ['Chiến Binh', 'Pháp Sư', 'Đỡ Đòn', 'Sát Thủ', 'Hỗ Trợ', 'Xạ Thủ']
  const roleLabels = {
    'Chiến Binh': 'Chiến Binh',
    'Pháp Sư': 'Pháp Sư',
    'Đỡ Đòn': 'Đỡ Đòn',
    'Sát Thủ': 'Sát Thủ',
    'Hỗ Trợ': 'Hỗ Trợ',
    'Xạ Thủ': 'Xạ Thủ',
  }

  useEffect(() => {
    fetchHeroes()
  }, [])

  const fetchHeroes = async () => {
    try {
      setLoading(true)
      const response = await heroApi.getAll()
      setHeroes(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch heroes:', error)
      setHeroes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = heroes

    // Game filter
    if (gameFilter !== 'both') {
      filtered = filtered.filter((hero) => hero.game === gameFilter)
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((hero) => {
        const heroRoles = Array.isArray(hero.roles) ? hero.roles : (hero.roles ? hero.roles.split(',') : [])
        return heroRoles.some((role) => role.toLowerCase() === roleFilter.toLowerCase())
      })
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((hero) => {
        const nameMatch = (hero.name_vi || '').toLowerCase().includes(query)
        const chineseMatch = hero.name_cn && hero.name_cn.includes(query)
        return nameMatch || chineseMatch
      })
    }

    setFilteredHeroes(filtered)
  }, [heroes, gameFilter, roleFilter, searchQuery])

  return (
    <Layout>
      <div className="min-h-screen bg-game-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="section-title">Danh sách Tướng</h1>
            <div className="flex items-center justify-between gap-4 mt-6">
              <p className="text-game-text-secondary">
                Tổng cộng: <span className="text-game-accent font-bold">{filteredHeroes.length}</span> tướng
              </p>
              {/* Language Toggle for VG */}
              <button
                onClick={toggleLanguage}
                className="btn-secondary text-sm"
              >
                {showChinese ? '中文' : 'Tiếng Việt'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-6">
            {/* Game Filter */}
            <div>
              <h3 className="text-sm font-semibold text-game-gold mb-3">Lọc theo game</h3>
              <GameFilter onFilterChange={setGameFilter} />
            </div>

            {/* Role Filter */}
            <div>
              <h3 className="text-sm font-semibold text-game-gold mb-3">Lọc theo vai trò</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    roleFilter === 'all'
                      ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
                      : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
                  }`}
                >
                  Tất cả
                </button>
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      roleFilter === role
                        ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
                        : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
                    }`}
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold text-game-gold mb-3">Tìm kiếm</h3>
              <SearchBar
                placeholder="Tìm kiếm tướng theo tên..."
                onSearch={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>
          </div>

          {/* Heroes Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-game-text-secondary">Đang tải dữ liệu...</div>
            </div>
          ) : filteredHeroes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-game-text-secondary mb-2">Không tìm thấy tướng nào</p>
                <p className="text-sm text-game-text-secondary">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHeroes.map((hero) => (
                <HeroCard key={hero._id || hero.id} hero={hero} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default HeroListPage

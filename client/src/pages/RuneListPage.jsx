import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import GameFilter from '../components/common/GameFilter'
import SearchBar from '../components/common/SearchBar'
import RuneCard from '../components/runes/RuneCard'
import { runeApi } from '../services/api'
import useLanguage from '../hooks/useLanguage'

const RuneListPage = () => {
  const [runes, setRunes] = useState([])
  const [filteredRunes, setFilteredRunes] = useState([])
  const [loading, setLoading] = useState(true)
  const [gameFilter, setGameFilter] = useState('both')
  const [tierFilter, setTierFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const { showChinese, toggleLanguage } = useLanguage()

  const tiers = ['1', '2', '3', '4', '5']

  useEffect(() => {
    fetchRunes()
  }, [])

  const fetchRunes = async () => {
    try {
      setLoading(true)
      const response = await runeApi.getAll()
      const runesList = response.data
      setRunes(runesList)

      // Extract unique categories
      const uniqueCategories = [...new Set(runesList.map((r) => r.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Failed to fetch runes:', error)
      setRunes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = runes

    // Game filter
    if (gameFilter !== 'both') {
      filtered = filtered.filter((rune) => rune.game === gameFilter)
    }

    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter((rune) => rune.tier?.toString() === tierFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((rune) => rune.category?.toLowerCase() === categoryFilter.toLowerCase())
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((rune) => {
        const nameMatch = rune.name.toLowerCase().includes(query)
        const chineseMatch = rune.chineseName && rune.chineseName.includes(query)
        return nameMatch || chineseMatch
      })
    }

    setFilteredRunes(filtered)
  }, [runes, gameFilter, tierFilter, categoryFilter, searchQuery])

  return (
    <Layout>
      <div className="min-h-screen bg-game-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="section-title">Danh sách Ngọc & Phép bổ trợ</h1>
            <div className="flex items-center justify-between gap-4 mt-6">
              <p className="text-game-text-secondary">
                Tổng cộng: <span className="text-game-accent font-bold">{filteredRunes.length}</span> ngọc
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

            {/* Tier Filter */}
            <div>
              <h3 className="text-sm font-semibold text-game-gold mb-3">Lọc theo tầng</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTierFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    tierFilter === 'all'
                      ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
                      : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
                  }`}
                >
                  Tất cả
                </button>
                {tiers.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      tierFilter === tier
                        ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
                        : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
                    }`}
                  >
                    Tầng {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-game-gold mb-3">Lọc theo danh mục</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      categoryFilter === 'all'
                        ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
                        : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        categoryFilter === category
                          ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
                          : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold text-game-gold mb-3">Tìm kiếm</h3>
              <SearchBar
                placeholder="Tìm kiếm ngọc theo tên..."
                onSearch={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>
          </div>

          {/* Runes Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-game-text-secondary">Đang tải dữ liệu...</div>
            </div>
          ) : filteredRunes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-game-text-secondary mb-2">Không tìm thấy ngọc nào</p>
                <p className="text-sm text-game-text-secondary">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRunes.map((rune) => (
                <RuneCard key={rune._id || rune.id} rune={rune} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default RuneListPage

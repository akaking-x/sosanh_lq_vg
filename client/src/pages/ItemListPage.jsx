import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import GameFilter from '../components/common/GameFilter'
import SearchBar from '../components/common/SearchBar'
import ItemCard from '../components/items/ItemCard'
import { itemApi } from '../services/api'
import useLanguage from '../hooks/useLanguage'

const ItemListPage = () => {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [gameFilter, setGameFilter] = useState('both')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { showChinese, toggleLanguage } = useLanguage()

  const categories = ['Tấn Công', 'Phòng Thủ', 'Phép Thuật', 'Di Chuyển', 'Rừng']
  const categoryLabels = {
    'Tấn Công': 'Tấn Công',
    'Phòng Thủ': 'Phòng Thủ',
    'Phép Thuật': 'Phép Thuật',
    'Di Chuyển': 'Di Chuyển',
    'Rừng': 'Rừng',
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await itemApi.getAll()
      setItems(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch items:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = items

    // Game filter
    if (gameFilter !== 'both') {
      filtered = filtered.filter((item) => item.game === gameFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category?.toLowerCase() === categoryFilter.toLowerCase())
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((item) => {
        const nameMatch = (item.name_vi || '').toLowerCase().includes(query)
        const chineseMatch = item.name_cn && item.name_cn.includes(query)
        return nameMatch || chineseMatch
      })
    }

    setFilteredItems(filtered)
  }, [items, gameFilter, categoryFilter, searchQuery])

  return (
    <Layout>
      <div className="min-h-screen bg-game-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="section-title">Danh sách Trang bị</h1>
            <div className="flex items-center justify-between gap-4 mt-6">
              <p className="text-game-text-secondary">
                Tổng cộng: <span className="text-game-accent font-bold">{filteredItems.length}</span> trang bị
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

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-semibold text-game-gold mb-3">Lọc theo loại</h3>
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
                    {categoryLabels[category]}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold text-game-gold mb-3">Tìm kiếm</h3>
              <SearchBar
                placeholder="Tìm kiếm trang bị theo tên..."
                onSearch={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-game-text-secondary">Đang tải dữ liệu...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-game-text-secondary mb-2">Không tìm thấy trang bị nào</p>
                <p className="text-sm text-game-text-secondary">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item._id || item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default ItemListPage

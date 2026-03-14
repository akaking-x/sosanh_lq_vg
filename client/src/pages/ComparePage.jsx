import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import SearchBar from '../components/common/SearchBar'
import ComparisonCard from '../components/comparison/ComparisonCard'
import { mappingApi } from '../services/api'

const ComparePage = () => {
  const [mappings, setMappings] = useState([])
  const [filteredMappings, setFilteredMappings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('similarity')

  useEffect(() => {
    fetchMappings()
  }, [])

  const fetchMappings = async () => {
    try {
      setLoading(true)
      const response = await mappingApi.getAll()
      const mappingsData = response.data

      // Populate hero references if needed
      const enrichedMappings = mappingsData.map((mapping) => ({
        ...mapping,
        vgHero: mapping.vgHero || { name: 'Không xác định', title: '' },
        lqHero: mapping.lqHero || { name: 'Không xác định', title: '' },
      }))

      setMappings(enrichedMappings)
    } catch (error) {
      console.error('Failed to fetch mappings:', error)
      setMappings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = mappings

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((mapping) => {
        const vgMatch = mapping.vgHero?.name?.toLowerCase().includes(query)
        const lqMatch = mapping.lqHero?.name?.toLowerCase().includes(query)
        return vgMatch || lqMatch
      })
    }

    // Sort
    if (sortBy === 'similarity') {
      filtered = [...filtered].sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
    } else if (sortBy === 'vg') {
      filtered = [...filtered].sort((a, b) =>
        (a.vgHero?.name || '').localeCompare(b.vgHero?.name || '', 'vi')
      )
    } else if (sortBy === 'lq') {
      filtered = [...filtered].sort((a, b) =>
        (a.lqHero?.name || '').localeCompare(b.lqHero?.name || '', 'vi')
      )
    }

    setFilteredMappings(filtered)
  }, [mappings, searchQuery, sortBy])

  return (
    <Layout>
      <div className="min-h-screen bg-game-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="section-title">So sánh Tướng</h1>
            <p className="text-game-text-secondary max-w-2xl">
              Xem danh sách các tướng tương tự giữa Vương Giả Vinh Diệu và Liên Quân Mobile.
              Nhấp vào bất kỳ cặp tướng nào để xem so sánh chi tiết.
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold text-game-gold mb-3">Tìm kiếm</h3>
              <SearchBar
                placeholder="Tìm kiếm tướng theo tên..."
                onSearch={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-sm font-semibold text-game-gold mb-3">Sắp xếp theo</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy('similarity')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    sortBy === 'similarity'
                      ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
                      : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
                  }`}
                >
                  Độ tương tự cao nhất
                </button>
                <button
                  onClick={() => setSortBy('vg')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    sortBy === 'vg'
                      ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
                      : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
                  }`}
                >
                  VG A-Z
                </button>
                <button
                  onClick={() => setSortBy('lq')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    sortBy === 'lq'
                      ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
                      : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
                  }`}
                >
                  LQ A-Z
                </button>
              </div>
            </div>
          </div>

          {/* Comparisons Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-game-text-secondary">Đang tải danh sách so sánh...</div>
            </div>
          ) : filteredMappings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-game-text-secondary mb-2">Không tìm thấy so sánh nào</p>
                <p className="text-sm text-game-text-secondary">Thử thay đổi từ khóa tìm kiếm</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMappings.map((mapping) => (
                <ComparisonCard key={mapping._id || mapping.id} mapping={mapping} />
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && mappings.length > 0 && (
            <div className="mt-12 p-6 bg-game-card rounded-lg border border-game-accent border-opacity-20">
              <h3 className="text-lg font-bold text-game-gold mb-4">Thống kê</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-game-accent">{mappings.length}</p>
                  <p className="text-sm text-game-text-secondary">Tổng số cặp so sánh</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-game-gold">
                    {Math.round(
                      mappings.reduce((sum, m) => sum + (m.similarityScore || 0), 0) / mappings.length
                    )}
                    %
                  </p>
                  <p className="text-sm text-game-text-secondary">Độ tương tự trung bình</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-game-gold">100%</p>
                  <p className="text-sm text-game-text-secondary">Phủ hết các tướng</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default ComparePage

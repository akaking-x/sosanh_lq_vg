import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { itemApi } from '../services/api'
import useLanguage from '../hooks/useLanguage'
import { ChevronLeft } from 'lucide-react'

const ItemDetailPage = () => {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showChinese, toggleLanguage } = useLanguage()

  useEffect(() => {
    fetchItemDetails()
  }, [slug])

  const fetchItemDetails = async () => {
    try {
      setLoading(true)
      const response = await itemApi.getById(slug)
      setItem(response.data)
    } catch (error) {
      console.error('Failed to fetch item details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = () => {
    if (!item) return ''
    if (item.game === 'vg' && showChinese && item.chineseName) {
      return item.chineseName
    }
    return item.name
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen py-12 px-4 flex items-center justify-center">
          <div className="text-game-text-secondary">Đang tải chi tiết trang bị...</div>
        </div>
      </Layout>
    )
  }

  if (!item) {
    return (
      <Layout>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-game-gold mb-4">Không tìm thấy trang bị</h1>
            <Link to="/items" className="btn-primary">
              Quay lại danh sách trang bị
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
          <Link to="/items" className="inline-flex items-center gap-2 text-game-accent hover:text-game-gold transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            Quay lại danh sách trang bị
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Item Header */}
              <div className="card">
                <div className="flex gap-6 flex-col sm:flex-row">
                  {/* Icon */}
                  <div className="flex-shrink-0 flex items-center justify-center w-40 h-40 bg-game-darker rounded-lg border border-game-accent border-opacity-30">
                    {item.icon ? (
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="w-32 h-32 object-contain"
                      />
                    ) : (
                      <div className="text-game-text-secondary">No Image</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-game-gold mb-2">
                          {getDisplayName()}
                        </h1>
                        {item.game === 'vg' && item.chineseName && (
                          <p className="text-sm text-game-text-secondary mb-3">
                            ({item.chineseName})
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.game === 'vg'
                          ? 'bg-red-400 bg-opacity-20 text-red-400'
                          : 'bg-blue-400 bg-opacity-20 text-blue-400'
                      }`}>
                        {item.game === 'vg' ? 'VG' : 'LQ'}
                      </span>
                    </div>

                    {/* Category */}
                    {item.category && (
                      <p className="text-lg text-game-accent font-semibold mb-4">
                        📦 {item.category}
                      </p>
                    )}

                    {/* Price */}
                    {item.price && (
                      <p className="text-2xl text-game-gold font-bold mb-4">
                        💰 {item.price}
                      </p>
                    )}

                    {/* Language Toggle for VG */}
                    {item.game === 'vg' && (
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
              {item.description && (
                <div className="card">
                  <h2 className="text-xl font-bold text-game-gold mb-4">Mô tả</h2>
                  <p className="text-game-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Stats */}
              {item.stats && Object.keys(item.stats).length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold text-game-gold mb-4">Chỉ số trang bị</h2>
                  <div className="space-y-3">
                    {Object.entries(item.stats).map(([stat, value]) => (
                      <div key={stat} className="flex justify-between items-center p-2 bg-game-darker rounded">
                        <span className="text-game-text-secondary capitalize">{stat}</span>
                        <span className="text-game-accent font-bold">+{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passive Effect */}
              {item.passiveEffect && (
                <div className="card">
                  <h2 className="text-xl font-bold text-game-gold mb-4">Hiệu ứng thụ động</h2>
                  <div className="space-y-3">
                    {Array.isArray(item.passiveEffect) ? (
                      item.passiveEffect.map((effect, index) => (
                        <div key={index} className="p-3 bg-game-darker rounded border border-game-accent border-opacity-20">
                          <h4 className="font-semibold text-game-accent mb-1">{effect.name}</h4>
                          <p className="text-sm text-game-text-secondary">{effect.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-game-text-secondary">{item.passiveEffect}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Active Effect */}
              {item.activeEffect && (
                <div className="card">
                  <h2 className="text-xl font-bold text-game-gold mb-4">Hiệu ứng chủ động</h2>
                  <div className="space-y-3">
                    {Array.isArray(item.activeEffect) ? (
                      item.activeEffect.map((effect, index) => (
                        <div key={index} className="p-3 bg-game-darker rounded border border-game-accent border-opacity-20">
                          <h4 className="font-semibold text-game-accent mb-1">{effect.name}</h4>
                          <p className="text-sm text-game-text-secondary">{effect.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-game-text-secondary">{item.activeEffect}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Build Path */}
              {item.buildPath && item.buildPath.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-bold text-game-gold mb-4">Đường xây dựng</h3>
                  <div className="space-y-3">
                    {item.buildPath.map((pathItem, index) => (
                      <div
                        key={index}
                        className="p-2 bg-game-darker rounded border border-game-accent border-opacity-20"
                      >
                        <p className="text-sm text-game-text-secondary">{pathItem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Items */}
              {item.relatedItems && item.relatedItems.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-bold text-game-gold mb-4">Trang bị liên quan</h3>
                  <div className="space-y-2">
                    {item.relatedItems.map((relatedItem, index) => (
                      <Link
                        key={index}
                        to={`/items/${relatedItem.slug}`}
                        className="block p-2 rounded bg-game-darker hover:bg-game-card transition-colors"
                      >
                        <p className="text-sm text-game-accent hover:text-game-gold">
                          {relatedItem.name}
                        </p>
                      </Link>
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

export default ItemDetailPage

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import DataTable from '../../components/admin/DataTable'
import FormModal from '../../components/admin/FormModal'
import { mappingApi, heroApi } from '../../services/api'
import useAuth from '../../hooks/useAuth'

const AdminMappingsPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [mappings, setMappings] = useState([])
  const [heroes, setHeroes] = useState([])
  const [vgHeroes, setVgHeroes] = useState([])
  const [lqHeroes, setLqHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingMapping, setEditingMapping] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    vgHeroId: '',
    lqHeroId: '',
    similarityScore: 50,
    skillComparisons: [{ vgSkill: '', lqSkill: '', similarity: 50 }],
    notes: '',
    verified: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }
    fetchData()
  }, [isAuthenticated, navigate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [mappingsRes, heroesRes] = await Promise.all([
        mappingApi.getAll(),
        heroApi.getAll(),
      ])

      setMappings(mappingsRes.data.data || [])

      const allHeroes = heroesRes.data.data || []
      setHeroes(allHeroes)
      setVgHeroes(
        allHeroes.filter((h) => h.game === 'Vương Giả Vinh Diệu')
      )
      setLqHeroes(
        allHeroes.filter((h) => h.game === 'Liên Quân Mobile')
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu ánh xạ')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (mapping = null) => {
    if (mapping) {
      setEditingMapping(mapping)
      setFormData({
        vgHeroId: mapping.vgHeroId || '',
        lqHeroId: mapping.lqHeroId || '',
        similarityScore: mapping.similarityScore || 50,
        skillComparisons: mapping.skillComparisons || [
          { vgSkill: '', lqSkill: '', similarity: 50 },
        ],
        notes: mapping.notes || '',
        verified: mapping.verified || false,
      })
    } else {
      setEditingMapping(null)
      setFormData({
        vgHeroId: '',
        lqHeroId: '',
        similarityScore: 50,
        skillComparisons: [{ vgSkill: '', lqSkill: '', similarity: 50 }],
        notes: '',
        verified: false,
      })
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMapping(null)
    setFormData({
      vgHeroId: '',
      lqHeroId: '',
      similarityScore: 50,
      skillComparisons: [{ vgSkill: '', lqSkill: '', similarity: 50 }],
      notes: '',
      verified: false,
    })
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSkillComparisonChange = (index, field, value) => {
    const comparisons = [...formData.skillComparisons]
    comparisons[index] = { ...comparisons[index], [field]: value }
    setFormData({ ...formData, skillComparisons: comparisons })
  }

  const addSkillComparison = () => {
    setFormData({
      ...formData,
      skillComparisons: [
        ...formData.skillComparisons,
        { vgSkill: '', lqSkill: '', similarity: 50 },
      ],
    })
  }

  const removeSkillComparison = (index) => {
    setFormData({
      ...formData,
      skillComparisons: formData.skillComparisons.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const submitData = {
        vgHeroId: formData.vgHeroId,
        lqHeroId: formData.lqHeroId,
        similarityScore: parseInt(formData.similarityScore),
        skillComparisons: formData.skillComparisons.map((sc) => ({
          vgSkill: sc.vgSkill,
          lqSkill: sc.lqSkill,
          similarity: parseInt(sc.similarity),
        })),
        notes: formData.notes,
        verified: formData.verified,
      }

      if (editingMapping) {
        await mappingApi.update(editingMapping.id, submitData)
      } else {
        await mappingApi.create(submitData)
      }

      fetchData()
      handleCloseForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu ánh xạ')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (mapping) => {
    try {
      await mappingApi.delete(mapping.id)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa ánh xạ')
    }
  }

  const handleToggleVerified = async (mapping) => {
    try {
      await mappingApi.update(mapping.id, {
        ...mapping,
        verified: !mapping.verified,
      })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const getHeroName = (id) => {
    const hero = heroes.find((h) => h.id === id)
    return hero?.name || 'N/A'
  }

  const columns = [
    {
      key: 'vgHeroId',
      label: 'Tướng VG',
      render: (val) => (
        <span className="font-semibold text-game-accent">
          {getHeroName(val)}
        </span>
      ),
    },
    {
      key: 'lqHeroId',
      label: 'Tướng LQ',
      render: (val) => (
        <span className="font-semibold text-game-gold">
          {getHeroName(val)}
        </span>
      ),
    },
    {
      key: 'similarityScore',
      label: 'Độ Tương Tự',
      render: (val) => (
        <div className="flex items-center space-x-2">
          <div className="w-24 h-2 bg-game-darker rounded-full overflow-hidden">
            <div
              className="h-full bg-game-accent transition-all"
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{val}%</span>
        </div>
      ),
    },
    {
      key: 'verified',
      label: 'Xác Thực',
      render: (val) => (
        <span
          className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-sm ${
            val
              ? 'bg-green-500/20 text-green-400'
              : 'bg-game-text-secondary/10 text-game-text-secondary'
          }`}
        >
          {val && <Check size={16} />}
          <span>{val ? 'Đã' : 'Chưa'}</span>
        </span>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-game-accent">Quản Lý Ánh Xạ Tướng</h1>
            <p className="text-game-text-secondary mt-2">
              Tổng cộng: {mappings.length} ánh xạ
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center space-x-2 px-6 py-2 bg-game-accent hover:bg-game-accent-dark rounded-lg transition-colors text-game-darker font-bold"
          >
            <Plus size={20} />
            <span>Thêm Ánh Xạ</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-game-red/10 border border-game-red/20 rounded-lg">
            <p className="text-game-red">{error}</p>
          </div>
        )}

        {/* Table */}
        <DataTable
          columns={columns}
          data={mappings}
          loading={loading}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
        />
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingMapping ? 'Chỉnh Sửa Ánh Xạ' : 'Thêm Ánh Xạ Mới'}
        onSubmit={handleSubmit}
        isLoading={formLoading}
      >
        <div className="space-y-6">
          {/* VG Hero */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Tướng Vương Giả Vinh Diệu
            </label>
            <select
              value={formData.vgHeroId}
              onChange={(e) => handleFormChange('vgHeroId', e.target.value)}
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
              required
            >
              <option value="">Chọn tướng...</option>
              {vgHeroes.map((hero) => (
                <option key={hero.id} value={hero.id}>
                  {hero.name}
                </option>
              ))}
            </select>
          </div>

          {/* LQ Hero */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Tướng Liên Quân Mobile
            </label>
            <select
              value={formData.lqHeroId}
              onChange={(e) => handleFormChange('lqHeroId', e.target.value)}
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
              required
            >
              <option value="">Chọn tướng...</option>
              {lqHeroes.map((hero) => (
                <option key={hero.id} value={hero.id}>
                  {hero.name}
                </option>
              ))}
            </select>
          </div>

          {/* Similarity Score */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Độ Tương Tự: {formData.similarityScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.similarityScore}
              onChange={(e) =>
                handleFormChange('similarityScore', parseInt(e.target.value))
              }
              className="w-full h-2 bg-game-darker rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Skill Comparisons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-game-text font-medium">
                So Sánh Kỹ Năng
              </label>
              <button
                type="button"
                onClick={addSkillComparison}
                className="text-sm px-3 py-1 bg-game-accent/20 hover:bg-game-accent/30 text-game-accent rounded transition-colors"
              >
                + Thêm
              </button>
            </div>

            <div className="space-y-4">
              {formData.skillComparisons.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-game-darker border border-game-accent/20 rounded-lg space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={sc.vgSkill}
                      onChange={(e) =>
                        handleSkillComparisonChange(idx, 'vgSkill', e.target.value)
                      }
                      placeholder="Kỹ năng VG"
                      className="px-3 py-2 bg-game-card border border-game-accent/20 rounded text-game-text placeholder-game-text-secondary focus:outline-none focus:border-game-accent transition-colors"
                    />
                    <input
                      type="text"
                      value={sc.lqSkill}
                      onChange={(e) =>
                        handleSkillComparisonChange(idx, 'lqSkill', e.target.value)
                      }
                      placeholder="Kỹ năng LQ"
                      className="px-3 py-2 bg-game-card border border-game-accent/20 rounded text-game-text placeholder-game-text-secondary focus:outline-none focus:border-game-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-game-text-secondary text-sm mb-2">
                      Độ Tương Tự: {sc.similarity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sc.similarity}
                      onChange={(e) =>
                        handleSkillComparisonChange(
                          idx,
                          'similarity',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-game-card rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {formData.skillComparisons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkillComparison(idx)}
                      className="text-sm px-3 py-1 bg-game-red/20 hover:bg-game-red/30 text-game-red rounded transition-colors"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Ghi Chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              placeholder="Nhập ghi chú về ánh xạ này"
              rows={3}
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
            />
          </div>

          {/* Verified */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="verified"
              checked={formData.verified}
              onChange={(e) => handleFormChange('verified', e.target.checked)}
              className="rounded cursor-pointer"
            />
            <label htmlFor="verified" className="text-game-text cursor-pointer">
              Đã xác thực ánh xạ này
            </label>
          </div>
        </div>
      </FormModal>
    </AdminLayout>
  )
}

export default AdminMappingsPage

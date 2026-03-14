import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import DataTable from '../../components/admin/DataTable'
import FormModal from '../../components/admin/FormModal'
import ImageUpload from '../../components/admin/ImageUpload'
import { heroApi } from '../../services/api'
import useAuth from '../../hooks/useAuth'

const GAMES = ['Vương Giả Vinh Diệu', 'Liên Quân Mobile']

const AdminSkillsPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [heroes, setHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [editingHeroId, setEditingHeroId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cooldown: '',
    image: null,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }
    fetchHeroes()
  }, [isAuthenticated, navigate])

  const fetchHeroes = async () => {
    try {
      setLoading(true)
      const response = await heroApi.getAll()
      setHeroes(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (heroId, skill = null) => {
    setEditingHeroId(heroId)
    if (skill) {
      setEditingSkill(skill)
      setFormData({
        name: skill.name || '',
        description: skill.description || '',
        cooldown: skill.cooldown || '',
        image: skill.image || null,
      })
    } else {
      setEditingSkill(null)
      setFormData({
        name: '',
        description: '',
        cooldown: '',
        image: null,
      })
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingSkill(null)
    setEditingHeroId(null)
    setFormData({
      name: '',
      description: '',
      cooldown: '',
      image: null,
    })
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const hero = heroes.find((h) => h.id === editingHeroId)
      if (!hero) throw new Error('Hero not found')

      let updatedSkills = [...(hero.skills || [])]

      if (editingSkill) {
        const skillIndex = updatedSkills.findIndex(
          (s) => s.name === editingSkill.name
        )
        if (skillIndex >= 0) {
          updatedSkills[skillIndex] = formData
        }
      } else {
        updatedSkills.push(formData)
      }

      const submitData = new FormData()
      submitData.append('name', hero.name)
      submitData.append('game', hero.game)
      submitData.append('roles', JSON.stringify(hero.roles || []))
      submitData.append('description', hero.description || '')
      submitData.append('skills', JSON.stringify(updatedSkills))

      if (hero.image && !(hero.image instanceof File)) {
        submitData.append('existingImage', hero.image)
      }

      if (formData.image instanceof File) {
        submitData.append('image', formData.image)
      }

      await heroApi.update(editingHeroId, submitData)

      fetchHeroes()
      handleCloseForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu kỹ năng')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteSkill = async (heroId, skillName) => {
    try {
      const hero = heroes.find((h) => h.id === heroId)
      if (!hero) throw new Error('Hero not found')

      const updatedSkills = hero.skills.filter((s) => s.name !== skillName)

      const submitData = new FormData()
      submitData.append('name', hero.name)
      submitData.append('game', hero.game)
      submitData.append('roles', JSON.stringify(hero.roles || []))
      submitData.append('description', hero.description || '')
      submitData.append('skills', JSON.stringify(updatedSkills))

      if (hero.image && !(hero.image instanceof File)) {
        submitData.append('existingImage', hero.image)
      }

      await heroApi.update(heroId, submitData)
      fetchHeroes()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa kỹ năng')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-game-accent">Quản Lý Phép Bổ Trợ</h1>
          <p className="text-game-text-secondary mt-2">
            Quản lý kỹ năng của các tướng
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-game-red/10 border border-game-red/20 rounded-lg">
            <p className="text-game-red">{error}</p>
          </div>
        )}

        {/* Heroes Skills List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-game-accent mb-4" />
              <p className="text-game-text-secondary">Đang tải...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {heroes.map((hero) => (
              <div
                key={hero.id}
                className="bg-game-card border border-game-accent/20 rounded-lg p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-game-text">{hero.name}</h3>
                    <p className="text-sm text-game-text-secondary">{hero.game}</p>
                  </div>
                  <button
                    onClick={() => handleOpenForm(hero.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-game-accent/20 hover:bg-game-accent/30 text-game-accent rounded transition-colors"
                  >
                    <Plus size={16} />
                    <span>Thêm</span>
                  </button>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  {hero.skills && hero.skills.length > 0 ? (
                    hero.skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="bg-game-darker rounded-lg p-3 flex items-start justify-between group hover:bg-game-accent/10 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-game-text">
                              {skill.name}
                            </h4>
                            {skill.cooldown && (
                              <span className="text-xs bg-game-accent/20 text-game-accent px-2 py-0.5 rounded">
                                CD: {skill.cooldown}
                              </span>
                            )}
                          </div>
                          {skill.description && (
                            <p className="text-sm text-game-text-secondary mt-1 line-clamp-2">
                              {skill.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenForm(hero.id, skill)}
                            className="p-1 hover:bg-game-accent/20 rounded transition-colors text-game-accent"
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm('Xóa kỹ năng này?')
                              ) {
                                handleDeleteSkill(hero.id, skill.name)
                              }
                            }}
                            className="p-1 hover:bg-game-red/20 rounded transition-colors text-game-red"
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-game-text-secondary text-sm">
                      Chưa có kỹ năng nào
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingSkill ? 'Chỉnh Sửa Phép Bổ Trợ' : 'Thêm Phép Bổ Trợ Mới'}
        onSubmit={handleSubmit}
        isLoading={formLoading}
      >
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Tên Phép Bổ Trợ
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Nhập tên phép"
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
              required
            />
          </div>

          {/* Cooldown */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Cooldown
            </label>
            <input
              type="text"
              value={formData.cooldown}
              onChange={(e) => handleFormChange('cooldown', e.target.value)}
              placeholder="VD: 45s, 1m30s"
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Mô Tả Chi Tiết
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Nhập mô tả phép bổ trợ"
              rows={4}
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Hình Ảnh
            </label>
            <ImageUpload
              value={formData.image}
              onChange={(file) => handleFormChange('image', file)}
              label="Tải lên hình ảnh phép"
            />
          </div>
        </div>
      </FormModal>
    </AdminLayout>
  )
}

export default AdminSkillsPage

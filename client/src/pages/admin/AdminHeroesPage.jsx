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
const ROLES = ['Thần Thoại', 'Thần Quân', 'Quân Sư', 'Chiến Binh', 'Đỡ Đạn', 'Pháp Sư']

const AdminHeroesPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [heroes, setHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingHero, setEditingHero] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    game: GAMES[0],
    roles: [],
    description: '',
    image: null,
    skills: [{ name: '', description: '', cooldown: '' }],
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
      setHeroes(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu tướng')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (hero = null) => {
    if (hero) {
      setEditingHero(hero)
      setFormData({
        name: hero.name || '',
        game: hero.game || GAMES[0],
        roles: hero.roles || [],
        description: hero.description || '',
        image: hero.image || null,
        skills: hero.skills || [{ name: '', description: '', cooldown: '' }],
      })
    } else {
      setEditingHero(null)
      setFormData({
        name: '',
        game: GAMES[0],
        roles: [],
        description: '',
        image: null,
        skills: [{ name: '', description: '', cooldown: '' }],
      })
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingHero(null)
    setFormData({
      name: '',
      game: GAMES[0],
      roles: [],
      description: '',
      image: null,
      skills: [{ name: '', description: '', cooldown: '' }],
    })
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSkillChange = (index, field, value) => {
    const skills = [...formData.skills]
    skills[index] = { ...skills[index], [field]: value }
    setFormData({ ...formData, skills })
  }

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, { name: '', description: '', cooldown: '' }],
    })
  }

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('game', formData.game)
      submitData.append('roles', JSON.stringify(formData.roles))
      submitData.append('description', formData.description)
      submitData.append('skills', JSON.stringify(formData.skills))

      if (formData.image instanceof File) {
        submitData.append('image', formData.image)
      }

      if (editingHero) {
        await heroApi.update(editingHero.id, submitData)
      } else {
        await heroApi.create(submitData)
      }

      fetchHeroes()
      handleCloseForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu tướng')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (hero) => {
    try {
      await heroApi.delete(hero.id)
      fetchHeroes()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa tướng')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const columns = [
    { key: 'game', label: 'Game', render: (val) => <Badge text={val} /> },
    { key: 'name', label: 'Tên Tướng' },
    {
      key: 'roles',
      label: 'Vai Trò',
      render: (val) =>
        Array.isArray(val) ? (
          <div className="flex flex-wrap gap-1">
            {val.map((role) => (
              <span key={role} className="text-xs bg-game-accent/20 text-game-accent px-2 py-1 rounded">
                {role}
              </span>
            ))}
          </div>
        ) : null,
    },
    {
      key: 'image',
      label: 'Hình Ảnh',
      render: (val) =>
        val ? (
          <img src={val} alt="Hero" className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <span className="text-game-text-secondary">Không</span>
        ),
      sortable: false,
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-game-accent">Quản Lý Tướng</h1>
            <p className="text-game-text-secondary mt-2">
              Tổng cộng: {heroes.length} tướng
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center space-x-2 px-6 py-2 bg-game-accent hover:bg-game-accent-dark rounded-lg transition-colors text-game-darker font-bold"
          >
            <Plus size={20} />
            <span>Thêm Tướng</span>
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
          data={heroes}
          loading={loading}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
        />
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingHero ? 'Chỉnh Sửa Tướng' : 'Thêm Tướng Mới'}
        onSubmit={handleSubmit}
        isLoading={formLoading}
      >
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Tên Tướng
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Nhập tên tướng"
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
              required
            />
          </div>

          {/* Game */}
          <div>
            <label className="block text-game-text font-medium mb-2">Game</label>
            <select
              value={formData.game}
              onChange={(e) => handleFormChange('game', e.target.value)}
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
            >
              {GAMES.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
          </div>

          {/* Roles */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Vai Trò
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => (
                <label key={role} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFormChange('roles', [...formData.roles, role])
                      } else {
                        handleFormChange(
                          'roles',
                          formData.roles.filter((r) => r !== role)
                        )
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-game-text text-sm">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Mô Tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Nhập mô tả tướng"
              rows={3}
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
            />
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-game-text font-medium">Kỹ Năng</label>
              <button
                type="button"
                onClick={addSkill}
                className="text-sm px-3 py-1 bg-game-accent/20 hover:bg-game-accent/30 text-game-accent rounded transition-colors"
              >
                + Thêm Kỹ Năng
              </button>
            </div>

            <div className="space-y-4">
              {formData.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-game-darker border border-game-accent/20 rounded-lg space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                      placeholder="Tên kỹ năng"
                      className="px-3 py-2 bg-game-card border border-game-accent/20 rounded text-game-text placeholder-game-text-secondary focus:outline-none focus:border-game-accent transition-colors"
                    />
                    <input
                      type="text"
                      value={skill.cooldown}
                      onChange={(e) => handleSkillChange(idx, 'cooldown', e.target.value)}
                      placeholder="Cooldown"
                      className="px-3 py-2 bg-game-card border border-game-accent/20 rounded text-game-text placeholder-game-text-secondary focus:outline-none focus:border-game-accent transition-colors"
                    />
                  </div>
                  <textarea
                    value={skill.description}
                    onChange={(e) =>
                      handleSkillChange(idx, 'description', e.target.value)
                    }
                    placeholder="Mô tả kỹ năng"
                    rows={2}
                    className="w-full px-3 py-2 bg-game-card border border-game-accent/20 rounded text-game-text placeholder-game-text-secondary focus:outline-none focus:border-game-accent transition-colors"
                  />
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="text-sm px-3 py-1 bg-game-red/20 hover:bg-game-red/30 text-game-red rounded transition-colors"
                    >
                      Xóa Kỹ Năng
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormModal>
    </AdminLayout>
  )
}

const Badge = ({ text }) => {
  const isVG = text.includes('Vương')
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
        isVG
          ? 'bg-game-accent/20 text-game-accent'
          : 'bg-game-gold/20 text-game-gold'
      }`}
    >
      {text}
    </span>
  )
}

export default AdminHeroesPage

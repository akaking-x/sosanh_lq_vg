import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import DataTable from '../../components/admin/DataTable'
import FormModal from '../../components/admin/FormModal'
import ImageUpload from '../../components/admin/ImageUpload'
import { runeApi } from '../../services/api'
import useAuth from '../../hooks/useAuth'

const RUNE_TYPES = ['Sức Mạnh', 'Tốc Độ', 'Phòng Thủ', 'Tấn Công', 'Khác']
const GAMES = ['Vương Giả Vinh Diệu', 'Liên Quân Mobile']

const AdminRunesPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [runes, setRunes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRune, setEditingRune] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    game: GAMES[0],
    type: RUNE_TYPES[0],
    description: '',
    effect: '',
    image: null,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }
    fetchRunes()
  }, [isAuthenticated, navigate])

  const fetchRunes = async () => {
    try {
      setLoading(true)
      const response = await runeApi.getAll()
      setRunes(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu ngọc')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (rune = null) => {
    if (rune) {
      setEditingRune(rune)
      setFormData({
        name: rune.name || '',
        game: rune.game || GAMES[0],
        type: rune.type || RUNE_TYPES[0],
        description: rune.description || '',
        effect: rune.effect || '',
        image: rune.image || null,
      })
    } else {
      setEditingRune(null)
      setFormData({
        name: '',
        game: GAMES[0],
        type: RUNE_TYPES[0],
        description: '',
        effect: '',
        image: null,
      })
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingRune(null)
    setFormData({
      name: '',
      game: GAMES[0],
      type: RUNE_TYPES[0],
      description: '',
      effect: '',
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
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('game', formData.game)
      submitData.append('type', formData.type)
      submitData.append('description', formData.description)
      submitData.append('effect', formData.effect)

      if (formData.image instanceof File) {
        submitData.append('image', formData.image)
      }

      if (editingRune) {
        await runeApi.update(editingRune.id, submitData)
      } else {
        await runeApi.create(submitData)
      }

      fetchRunes()
      handleCloseForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu ngọc')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (rune) => {
    try {
      await runeApi.delete(rune.id)
      fetchRunes()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa ngọc')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const columns = [
    { key: 'game', label: 'Game', render: (val) => <Badge text={val} /> },
    { key: 'name', label: 'Tên Ngọc' },
    {
      key: 'type',
      label: 'Loại',
      render: (val) => (
        <span className="text-xs bg-game-accent/20 text-game-accent px-2 py-1 rounded">
          {val}
        </span>
      ),
    },
    {
      key: 'image',
      label: 'Hình Ảnh',
      render: (val) =>
        val ? (
          <img src={val} alt="Rune" className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <span className="text-game-text-secondary">Không</span>
        ),
      sortable: false,
    },
    {
      key: 'effect',
      label: 'Hiệu Ứng',
      render: (val) => (val ? val.substring(0, 50) + '...' : 'N/A'),
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-game-accent">Quản Lý Ngọc</h1>
            <p className="text-game-text-secondary mt-2">
              Tổng cộng: {runes.length} ngọc
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center space-x-2 px-6 py-2 bg-game-accent hover:bg-game-accent-dark rounded-lg transition-colors text-game-darker font-bold"
          >
            <Plus size={20} />
            <span>Thêm Ngọc</span>
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
          data={runes}
          loading={loading}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
        />
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingRune ? 'Chỉnh Sửa Ngọc' : 'Thêm Ngọc Mới'}
        onSubmit={handleSubmit}
        isLoading={formLoading}
      >
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Tên Ngọc
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Nhập tên ngọc"
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

          {/* Type */}
          <div>
            <label className="block text-game-text font-medium mb-2">Loại</label>
            <select
              value={formData.type}
              onChange={(e) => handleFormChange('type', e.target.value)}
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
            >
              {RUNE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Mô Tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Nhập mô tả ngọc"
              rows={3}
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
            />
          </div>

          {/* Effect */}
          <div>
            <label className="block text-game-text font-medium mb-2">Hiệu Ứng</label>
            <textarea
              value={formData.effect}
              onChange={(e) => handleFormChange('effect', e.target.value)}
              placeholder="Nhập hiệu ứng của ngọc"
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

export default AdminRunesPage

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import DataTable from '../../components/admin/DataTable'
import FormModal from '../../components/admin/FormModal'
import ImageUpload from '../../components/admin/ImageUpload'
import { itemApi } from '../../services/api'
import useAuth from '../../hooks/useAuth'

const ITEM_TYPES = ['Vũ Khí', 'Giáp', 'Phụ Kiện', 'Giày', 'Khác']
const GAMES = ['Vương Giả Vinh Diệu', 'Liên Quân Mobile']

const AdminItemsPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    game: GAMES[0],
    type: ITEM_TYPES[0],
    description: '',
    stats: '',
    price: '',
    image: null,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }
    fetchItems()
  }, [isAuthenticated, navigate])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await itemApi.getAll()
      setItems(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu trang bị')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name || '',
        game: item.game || GAMES[0],
        type: item.type || ITEM_TYPES[0],
        description: item.description || '',
        stats: item.stats || '',
        price: item.price || '',
        image: item.image || null,
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        game: GAMES[0],
        type: ITEM_TYPES[0],
        description: '',
        stats: '',
        price: '',
        image: null,
      })
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({
      name: '',
      game: GAMES[0],
      type: ITEM_TYPES[0],
      description: '',
      stats: '',
      price: '',
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
      submitData.append('stats', formData.stats)
      submitData.append('price', formData.price)

      if (formData.image instanceof File) {
        submitData.append('image', formData.image)
      }

      if (editingItem) {
        await itemApi.update(editingItem.id, submitData)
      } else {
        await itemApi.create(submitData)
      }

      fetchItems()
      handleCloseForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu trang bị')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (item) => {
    try {
      await itemApi.delete(item.id)
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa trang bị')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const columns = [
    { key: 'game', label: 'Game', render: (val) => <Badge text={val} /> },
    { key: 'name', label: 'Tên Trang Bị' },
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
          <img src={val} alt="Item" className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <span className="text-game-text-secondary">Không</span>
        ),
      sortable: false,
    },
    {
      key: 'price',
      label: 'Giá',
      render: (val) => val || 'N/A',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-game-accent">Quản Lý Trang Bị</h1>
            <p className="text-game-text-secondary mt-2">
              Tổng cộng: {items.length} trang bị
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center space-x-2 px-6 py-2 bg-game-accent hover:bg-game-accent-dark rounded-lg transition-colors text-game-darker font-bold"
          >
            <Plus size={20} />
            <span>Thêm Trang Bị</span>
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
          data={items}
          loading={loading}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
        />
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingItem ? 'Chỉnh Sửa Trang Bị' : 'Thêm Trang Bị Mới'}
        onSubmit={handleSubmit}
        isLoading={formLoading}
      >
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Tên Trang Bị
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Nhập tên trang bị"
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
              {ITEM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-game-text font-medium mb-2">Giá</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => handleFormChange('price', e.target.value)}
              placeholder="Nhập giá"
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-game-text font-medium mb-2">
              Mô Tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Nhập mô tả trang bị"
              rows={3}
              className="w-full px-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text focus:outline-none focus:border-game-accent transition-colors"
            />
          </div>

          {/* Stats */}
          <div>
            <label className="block text-game-text font-medium mb-2">Thuộc Tính</label>
            <textarea
              value={formData.stats}
              onChange={(e) => handleFormChange('stats', e.target.value)}
              placeholder="Nhập các thuộc tính (tách bằng dòng mới)"
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

export default AdminItemsPage

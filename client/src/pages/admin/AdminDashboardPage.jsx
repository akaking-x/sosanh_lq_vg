import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import StatCard from '../../components/admin/StatCard'
import { adminApi } from '../../services/api'
import useAuth from '../../hooks/useAuth'

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }

    fetchDashboard()
  }, [isAuthenticated, navigate])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getDashboard()
      setDashboard(response.data)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Không thể tải dữ liệu bảng điều khiển'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-game-accent mb-4" />
            <p className="text-game-text-secondary">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-game-accent mb-2">
            Bảng Điều Khiển
          </h1>
          <p className="text-game-text-secondary">
            Xin chào! Dưới đây là tổng quan về hệ thống
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-game-red/10 border border-game-red/20 rounded-lg">
            <p className="text-game-red">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* VG Heroes */}
            <StatCard
              icon="⚔️"
              label="Tướng Vương Giả Vinh Diệu"
              value={dashboard.vgHeroCount}
              color="game-accent"
            />

            {/* LQ Heroes */}
            <StatCard
              icon="🏹"
              label="Tướng Liên Quân Mobile"
              value={dashboard.lqHeroCount}
              color="game-gold"
            />

            {/* Mappings */}
            <StatCard
              icon="🔄"
              label="Ánh Xạ Tướng"
              value={dashboard.mappingCount}
              color="game-accent"
            />

            {/* Items */}
            <StatCard
              icon="🛡️"
              label="Trang Bị"
              value={dashboard.itemCount}
              color="game-gold"
            />

            {/* Runes */}
            <StatCard
              icon="💎"
              label="Ngọc"
              value={dashboard.runeCount}
              color="game-accent"
            />

            {/* Skills */}
            <StatCard
              icon="✨"
              label="Phép Bổ Trợ"
              value={dashboard.skillCount}
              color="game-gold"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionButton
            title="Thêm Tướng Mới"
            description="Tạo tướng mới trong hệ thống"
            icon="⚔️"
            onClick={() => navigate('/admin/heroes')}
          />
          <QuickActionButton
            title="Quản Lý Trang Bị"
            description="Thêm/Sửa/Xóa trang bị"
            icon="🛡️"
            onClick={() => navigate('/admin/items')}
          />
          <QuickActionButton
            title="Quản Lý Ngọc"
            description="Thêm/Sửa/Xóa ngọc"
            icon="💎"
            onClick={() => navigate('/admin/runes')}
          />
          <QuickActionButton
            title="Ánh Xạ Tướng"
            description="Liên kết tướng giữa hai game"
            icon="🔄"
            onClick={() => navigate('/admin/mappings')}
          />
          <QuickActionButton
            title="Quản Lý Phép"
            description="Thêm/Sửa/Xóa phép bổ trợ"
            icon="✨"
            onClick={() => navigate('/admin/skills')}
          />
          <QuickActionButton
            title="Cài Đặt"
            description="Cấu hình hệ thống"
            icon="⚙️"
            onClick={() => alert('Sắp có tính năng này')}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-game-card border border-game-accent/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-game-accent mb-4">
            Hoạt Động Gần Đây
          </h2>
          <div className="space-y-4">
            <p className="text-game-text-secondary">
              Chưa có hoạt động gần đây
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

const QuickActionButton = ({ title, description, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-left bg-game-card border border-game-accent/20 rounded-lg p-6 hover:border-game-accent hover:bg-game-accent/5 transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl group-hover:scale-110 transition-transform">
          {icon}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-game-accent mb-1">
        {title}
      </h3>
      <p className="text-game-text-secondary text-sm">{description}</p>
    </button>
  )
}

export default AdminDashboardPage

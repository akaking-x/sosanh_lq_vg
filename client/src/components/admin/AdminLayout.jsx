import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import useAuth from '../../hooks/useAuth'

const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, admin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const menuItems = [
    { label: 'Bảng điều khiển', path: '/admin/dashboard', icon: '📊' },
    { label: 'Tướng', path: '/admin/heroes', icon: '⚔️' },
    { label: 'Trang bị', path: '/admin/items', icon: '🛡️' },
    { label: 'Ngọc', path: '/admin/runes', icon: '💎' },
    { label: 'Phép bổ trợ', path: '/admin/skills', icon: '✨' },
    { label: 'Ánh xạ', path: '/admin/mappings', icon: '🔄' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-game-dark text-game-text">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-game-darker border-r border-game-accent/20 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-game-accent/20">
          <h1 className="text-2xl font-bold text-game-accent">Admin</h1>
          <p className="text-game-text-secondary text-sm">Quản lý dữ liệu</p>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-game-accent/20 text-game-accent border border-game-accent/40'
                  : 'text-game-text hover:bg-game-card hover:text-game-accent'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-game-accent/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-game-red hover:bg-game-red-dark rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-game-card border-b border-game-accent/20 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-game-accent/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-xl font-semibold">Quản lý Hệ thống</h2>
          </div>

          {admin && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="font-medium text-game-text">{admin.username}</p>
                <p className="text-xs text-game-text-secondary">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-game-accent/20 flex items-center justify-center">
                <span className="text-game-accent font-bold">
                  {admin.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-game-dark">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout

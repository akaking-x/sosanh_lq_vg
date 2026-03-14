import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User } from 'lucide-react'
import { adminApi } from '../../services/api'
import useAuth from '../../hooks/useAuth'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await adminApi.login(formData.username, formData.password)
      const { token, admin } = response.data

      login(token, admin)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-game-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-game-accent/10 rounded-lg mb-4">
            <Lock className="text-game-accent" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-game-accent">Admin Panel</h1>
          <p className="text-game-text-secondary mt-2">
            Quản lý dữ liệu game so sánh
          </p>
        </div>

        {/* Card */}
        <div className="bg-game-card border border-game-accent/20 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-game-text font-medium mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-game-accent/50"
                  size={20}
                />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full pl-10 pr-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text placeholder-game-text-secondary focus:outline-none focus:border-game-accent transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-game-text font-medium mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-game-accent/50"
                  size={20}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-4 py-2 bg-game-darker border border-game-accent/20 rounded-lg text-game-text placeholder-game-text-secondary focus:outline-none focus:border-game-accent transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-game-red/10 border border-game-red/20 rounded-lg">
                <p className="text-game-red text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-game-accent hover:bg-game-accent-dark transition-colors text-game-darker font-bold disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 p-4 bg-game-darker rounded-lg text-center">
            <p className="text-game-text-secondary text-sm">
              Chỉ dành cho quản trị viên
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage

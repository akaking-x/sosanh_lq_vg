import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { Sword, Shield, Zap, Users } from 'lucide-react'

const HomePage = () => {
  const stats = [
    { icon: Sword, label: 'Tướng', count: 'Hàng trăm', color: 'text-game-gold' },
    { icon: Shield, label: 'Trang bị', count: 'Đầy đủ', color: 'text-game-accent' },
    { icon: Zap, label: 'Phép bổ trợ', count: 'Chi tiết', color: 'text-blue-400' },
    { icon: Users, label: 'So sánh', count: '1:1', color: 'text-red-400' },
  ]

  const features = [
    {
      title: 'Danh sách Tướng',
      description: 'Khám phá chi tiết của tất cả tướng từ Vương Giả Vinh Diệu và Liên Quân Mobile',
      link: '/heroes',
      icon: '⚔️',
    },
    {
      title: 'Danh sách Trang bị',
      description: 'Xem tất cả trang bị và cách xây dựng tối ưu cho mỗi trò chơi',
      link: '/items',
      icon: '🛡️',
    },
    {
      title: 'Ngọc & Phép bổ trợ',
      description: 'So sánh hệ thống ngọc và phép bổ trợ giữa hai trò chơi',
      link: '/runes',
      icon: '✨',
    },
    {
      title: 'So sánh Tướng',
      description: 'So sánh chi tiết kỹ năng, chỉ số và tính năng của các tướng tương tự',
      link: '/compare',
      icon: '🎯',
    },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-game-dark">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-gaming">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              So Sánh LQ vs VG
            </h1>
            <p className="text-xl text-game-text-secondary mb-8 max-w-2xl mx-auto">
              Công cụ so sánh toàn diện giữa Liên Quân Mobile và Vương Giả Vinh Diệu.
              Khám phá sự khác biệt, tương đồng và tìm những tướng hoàn hảo cho bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/heroes" className="btn-primary">
                Khám phá Tướng
              </Link>
              <Link to="/compare" className="btn-secondary">
                So sánh Ngay
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="max-w-7xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="card text-center">
                  <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <p className="text-game-text-secondary text-sm">{stat.label}</p>
                  <p className="text-lg font-bold text-game-gold">{stat.count}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="section-title">Tính năng chính</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature) => (
                <Link
                  key={feature.link}
                  to={feature.link}
                  className="card-hover group"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-game-gold group-hover:text-game-accent transition-colors mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-game-text-secondary mb-4">{feature.description}</p>
                  <div className="inline-flex items-center text-game-accent font-semibold group-hover:translate-x-1 transition-transform">
                    Khám phá →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-game-card bg-opacity-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-game-gold mb-4">Liên Quân Mobile (LQ)</h3>
                <p className="text-game-text-secondary">
                  Trò chơi MOBA phổ biến của Garena với gameplay thú vị và sân chơi cân bằng
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-game-accent mb-4">So Sánh Chi Tiết</h3>
                <p className="text-game-text-secondary">
                  Công cụ toàn diện để so sánh tướng, trang bị, kỹ năng và chiến thuật giữa hai trò chơi
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-400 mb-4">Vương Giả Vinh Diệu (VG)</h3>
                <p className="text-game-text-secondary">
                  Game MOBA Trung Quốc nổi tiếng với tướng đa dạng và gameplay sâu sắc
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default HomePage

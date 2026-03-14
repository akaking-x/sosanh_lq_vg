import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-game-darker border-t border-game-accent border-opacity-20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-game-gold to-game-accent rounded-lg flex items-center justify-center">
                <span className="text-game-darker font-bold">⚔️</span>
              </div>
              <span className="font-bold text-game-gold">So Sánh LQ vs VG</span>
            </Link>
            <p className="text-game-text-secondary text-sm">
              Trang web so sánh chi tiết giữa Liên Quân Mobile và Vương Giả Vinh Diệu.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-game-accent font-semibold mb-4">Khám phá</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/heroes" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  Tướng
                </Link>
              </li>
              <li>
                <Link to="/items" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  Trang bị
                </Link>
              </li>
              <li>
                <Link to="/runes" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  Ngọc
                </Link>
              </li>
              <li>
                <Link to="/summoner-skills" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  Phép bổ trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-game-accent font-semibold mb-4">Tài nguyên</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/compare" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  So sánh
                </Link>
              </li>
              <li>
                <a href="#" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  Hướng dẫn
                </a>
              </li>
              <li>
                <a href="#" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  Cộng đồng
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-game-accent font-semibold mb-4">Pháp lý</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <a href="#" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  Chính sách riêng tư
                </a>
              </li>
              <li>
                <a href="#" className="text-game-text-secondary hover:text-game-accent transition-colors">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-game-accent border-opacity-20 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-game-text-secondary text-sm">
              © {currentYear} So Sánh LQ vs VG. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-game-text-secondary hover:text-game-accent transition-colors text-sm">
                Facebook
              </a>
              <a href="#" className="text-game-text-secondary hover:text-game-accent transition-colors text-sm">
                Discord
              </a>
              <a href="#" className="text-game-text-secondary hover:text-game-accent transition-colors text-sm">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

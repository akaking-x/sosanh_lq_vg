import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Tướng', path: '/heroes' },
    { label: 'Trang bị', path: '/items' },
    { label: 'Ngọc', path: '/runes' },
    { label: 'Phép bổ trợ', path: '/summoner-skills' },
    { label: 'So sánh', path: '/compare' },
  ]

  return (
    <header className="bg-game-darker border-b border-game-accent border-opacity-20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-game-gold to-game-accent rounded-lg flex items-center justify-center">
              <span className="text-game-darker font-bold text-lg">⚔️</span>
            </div>
            <span className="hidden sm:inline text-xl font-bold text-gradient">
              So Sánh LQ vs VG
            </span>
            <span className="sm:hidden text-lg font-bold text-game-gold">
              So Sánh
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-game-text-secondary hover:text-game-accent transition-colors duration-200 font-medium relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-game-accent group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-game-card transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-game-accent" />
            ) : (
              <Menu className="w-6 h-6 text-game-accent" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden py-4 space-y-2 border-t border-game-accent border-opacity-20">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-2 text-game-text-secondary hover:text-game-accent hover:bg-game-card rounded-lg transition-colors duration-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header

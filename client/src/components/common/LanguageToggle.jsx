import { useState } from 'react'
import { Globe } from 'lucide-react'

const LanguageToggle = ({ onLanguageChange }) => {
  const [language, setLanguage] = useState('vi')

  const handleToggle = () => {
    const newLanguage = language === 'vi' ? 'zh' : 'vi'
    setLanguage(newLanguage)
    onLanguageChange?.(newLanguage)
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-4 py-2 bg-game-card hover:bg-game-darker border border-game-accent border-opacity-30 hover:border-opacity-100 text-game-accent rounded-lg transition-all duration-200 font-medium"
      title="Chuyển đổi ngôn ngữ"
    >
      <Globe className="w-4 h-4" />
      <span>
        {language === 'vi' ? '中文' : 'Tiếng Việt'}
      </span>
    </button>
  )
}

export default LanguageToggle

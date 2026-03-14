import { useState } from 'react'
import { Search, X } from 'lucide-react'

const SearchBar = ({ placeholder = 'Tìm kiếm...', onSearch, onClear }) => {
  const [query, setQuery] = useState('')

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    onSearch?.(value)
  }

  const handleClear = () => {
    setQuery('')
    onClear?.()
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-game-text-secondary">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="input-base pl-10 pr-10"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-game-text-secondary hover:text-game-accent transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default SearchBar

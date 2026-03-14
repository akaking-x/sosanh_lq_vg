import { useState } from 'react'

const GameFilter = ({ onFilterChange }) => {
  const [filter, setFilter] = useState('both')

  const handleFilter = (value) => {
    setFilter(value)
    onFilterChange?.(value)
  }

  const filterOptions = [
    { value: 'lq', label: 'Liên Quân', color: 'text-blue-400' },
    { value: 'vg', label: 'Vương Giả', color: 'text-red-400' },
    { value: 'both', label: 'Cả hai', color: 'text-game-accent' },
  ]

  return (
    <div className="flex gap-2 mb-6">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleFilter(option.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === option.value
              ? 'bg-game-accent text-game-darker shadow-lg shadow-game-accent/50'
              : 'bg-game-card border border-game-accent border-opacity-30 text-game-text-secondary hover:border-opacity-100'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default GameFilter

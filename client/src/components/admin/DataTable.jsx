import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Edit2, Trash2 } from 'lucide-react'

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  loading = false,
  pageSize = 10,
}) => {
  const [sortConfig, setSortConfig] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((item) =>
      columns.some((col) => {
        const value = item[col.key]
        return value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, columns])

  // Sort data
  const sortedData = useMemo(() => {
    let sorted = [...filteredData]

    if (sortConfig) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return sorted
  }, [filteredData, sortConfig])

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key, direction: 'asc' }
    })
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-game-accent mb-4" />
          <p className="text-game-text-secondary">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-1 px-4 py-2 bg-game-card border border-game-accent/20 rounded-lg text-game-text placeholder-game-text-secondary focus:outline-none focus:border-game-accent transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-game-accent/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-game-card border-b border-game-accent/20">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-6 py-3 text-left font-semibold text-game-accent ${
                    col.sortable !== false ? 'cursor-pointer hover:bg-game-accent/10' : ''
                  } transition-colors`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    {col.sortable !== false && sortConfig?.key === col.key && (
                      <>
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left font-semibold text-game-accent">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center">
                  <p className="text-game-text-secondary">Không có dữ liệu</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="border-b border-game-card hover:bg-game-card/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-game-text">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 hover:bg-game-accent/20 rounded-lg transition-colors text-game-accent"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm('Bạn có chắc chắn muốn xóa?')
                          ) {
                            onDelete(item)
                          }
                        }}
                        className="p-2 hover:bg-game-red/20 rounded-lg transition-colors text-game-red"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-game-text-secondary">
            Hiển thị {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -
            {' '}
            {Math.min(currentPage * pageSize, sortedData.length)} của {sortedData.length}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-game-card hover:bg-game-accent/20 disabled:opacity-50 transition-colors"
            >
              Đầu tiên
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-game-card hover:bg-game-accent/20 disabled:opacity-50 transition-colors"
            >
              Trước
            </button>
            <span className="px-3 py-1 bg-game-card rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-game-card hover:bg-game-accent/20 disabled:opacity-50 transition-colors"
            >
              Tiếp
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-game-card hover:bg-game-accent/20 disabled:opacity-50 transition-colors"
            >
              Cuối cùng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable

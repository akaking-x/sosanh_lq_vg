import { useState } from 'react'
import { Upload, X } from 'lucide-react'

const ImageUpload = ({ value, onChange, label = 'Tải lên hình ảnh' }) => {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState(value || null)

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
        onChange(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs h-auto rounded-lg border border-game-accent/20"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-game-red hover:bg-game-red-dark rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'border-game-accent bg-game-accent/10'
              : 'border-game-accent/20 bg-game-card/50 hover:border-game-accent hover:bg-game-accent/5'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload size={32} className="text-game-accent" />
            <span className="text-game-text font-medium">{label}</span>
            <span className="text-game-text-secondary text-sm">
              hoặc kéo thả hình ảnh tại đây
            </span>
          </label>
        </div>
      )}
    </div>
  )
}

export default ImageUpload

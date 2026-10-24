import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  RiUploadCloud2Line,
  RiLinkM,
  RiDeleteBinLine,
  RiImageAddLine,
  RiCheckLine,
  RiRefreshLine,
} from 'react-icons/ri'

export default function AdminImageUpload({
  value,
  onChange,
  label = 'Product Image',
  placeholderUrl = '/images/product.jpg',
  helperText = 'PNG, JPG, WEBP up to 5MB',
}) {
  const [mode, setMode] = useState('upload') // 'upload' | 'url'
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const fileInputRef = useRef(null)

  const isDataUrl = typeof value === 'string' && value.startsWith('data:image/')
  const hasImage = Boolean(value && value.trim())

  const handleFile = (file) => {
    if (!file) return

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, or WEBP)')
      return
    }

    // Validate size (max 5MB)
    const maxBytes = 5 * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setFileName(file.name)
    setFileSize((file.size / 1024).toFixed(0) + ' KB')

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      onChange(dataUrl)
      toast.success(`Loaded "${file.name}"`)
    }
    reader.onerror = () => {
      toast.error('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onChange('')
    setFileName('')
    setFileSize('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.success('Image removed')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider">
          {label}
        </label>

        {/* Mode Switcher */}
        <div className="flex items-center bg-[#F5F3EE] p-0.5 rounded-sm border border-[#ede9e0]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
              mode === 'upload'
                ? 'bg-[#0A0A0A] text-[#D4AF37] shadow-sm'
                : 'text-[#6B6B88] hover:text-[#0A0A0A]'
            }`}
          >
            <RiUploadCloud2Line size={13} />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
              mode === 'url'
                ? 'bg-[#0A0A0A] text-[#D4AF37] shadow-sm'
                : 'text-[#6B6B88] hover:text-[#0A0A0A]'
            }`}
          >
            <RiLinkM size={13} />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Active Input Mode */}
      {mode === 'upload' ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-sm border-2 border-dashed p-6 transition-all duration-200 text-center ${
            isDragging
              ? 'border-[#D4AF37] bg-[#D4AF37]/5'
              : 'border-[#ede9e0] hover:border-[#D4AF37]/70 bg-[#FAFAF8] hover:bg-[#F5F3EE]'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                isDragging ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'bg-white border border-[#ede9e0] text-[#D4AF37]'
              }`}
            >
              <RiUploadCloud2Line size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0A0A0A]">
                <span className="text-[#D4AF37] hover:underline">Click to browse from folder</span> or drag and drop
              </p>
              <p className="text-[11px] text-[#6B6B88] mt-0.5">{helperText}</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B88]">
              <RiLinkM size={16} />
            </div>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholderUrl}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white"
            />
          </div>
          <p className="text-[11px] text-[#6B6B88] mt-1">
            Paste a public web image URL or relative path (e.g. /images/products/oud.jpg)
          </p>
        </div>
      )}

      {/* Live Image Preview Card */}
      <AnimatePresence>
        {hasImage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-4 p-3 bg-white rounded-sm border border-[#ede9e0] shadow-sm"
          >
            {/* Image Thumbnail */}
            <div className="w-16 h-16 rounded-sm bg-[#FAFAF8] border border-[#ede9e0] overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://placehold.co/100x100?text=Invalid+Image'
                }}
              />
            </div>

            {/* Image Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <RiCheckLine size={12} />
                  {isDataUrl ? 'Local File' : 'Image URL'}
                </span>
                {fileSize && (
                  <span className="text-[11px] text-[#6B6B88]">{fileSize}</span>
                )}
              </div>
              <p className="text-xs font-medium text-[#0A0A0A] truncate mt-1">
                {fileName || (value.length > 50 ? value.substring(0, 50) + '…' : value)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (mode === 'upload') {
                    fileInputRef.current?.click()
                  } else {
                    const inputEl = document.querySelector('input[placeholder="' + placeholderUrl + '"]')
                    inputEl?.focus()
                  }
                }}
                title="Change Image"
                className="p-1.5 text-xs text-[#6B6B88] hover:text-[#0A0A0A] hover:bg-[#F5F3EE] rounded transition-colors"
              >
                <RiRefreshLine size={16} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                title="Remove Image"
                className="p-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                <RiDeleteBinLine size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

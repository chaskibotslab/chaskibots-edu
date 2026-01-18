'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, Image, File, Loader2, CheckCircle } from 'lucide-react'

interface UploadedFile {
  name: string
  type: string
  size: number
  url: string
  base64?: string
}

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  maxSizeMB?: number
}

const FILE_ICONS: Record<string, typeof FileText> = {
  'application/pdf': FileText,
  'image/': Image,
  'default': File
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image
  if (type === 'application/pdf') return FileText
  return File
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FileUpload({ 
  onUpload, 
  maxFiles = 5, 
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  maxSizeMB = 10
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        reject(new Error(`El archivo ${file.name} excede ${maxSizeMB}MB`))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          url: base64, // Usamos base64 como URL temporal
          base64
        })
      }
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsDataURL(file)
    })
  }

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    
    const remainingSlots = maxFiles - files.length
    if (remainingSlots <= 0) {
      alert(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    setUploading(true)
    const filesToProcess = Array.from(fileList).slice(0, remainingSlots)
    
    try {
      const processedFiles = await Promise.all(
        filesToProcess.map(file => processFile(file))
      )
      
      const newFiles = [...files, ...processedFiles]
      setFiles(newFiles)
      onUpload(newFiles)
    } catch (error: any) {
      alert(error.message || 'Error al procesar archivos')
    }
    
    setUploading(false)
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onUpload(newFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver 
            ? 'border-neon-cyan bg-neon-cyan/10' 
            : 'border-dark-500 hover:border-dark-400 bg-dark-700/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
            <p className="text-gray-400">Procesando archivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-8 h-8 ${dragOver ? 'text-neon-cyan' : 'text-gray-500'}`} />
            <p className="text-gray-400">
              <span className="text-neon-cyan">Haz clic</span> o arrastra archivos aquí
            </p>
            <p className="text-xs text-gray-500">
              PDF, Imágenes, Word, Excel • Máx {maxSizeMB}MB por archivo • {maxFiles - files.length} restantes
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file.type)
            const isImage = file.type.startsWith('image/')
            
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-dark-700 border border-dark-600 rounded-lg"
              >
                {isImage ? (
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-dark-600 rounded flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                
                <CheckCircle className="w-4 h-4 text-green-400" />
                
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

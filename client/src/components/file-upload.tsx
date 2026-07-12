import { useState, useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { toast } from 'sonner'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  onUpload: (urls: string[]) => void
  className?: string
}

export function FileUpload({ accept = 'image/*', multiple = false, onUpload, className }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        })
        if (!res.ok) throw new Error(`Upload failed: ${file.name}`)
        const data = await res.json()
        urls.push(data.url)
      }
      onUpload(urls)
      toast.success(`${urls.length} file berhasil diupload`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors',
        isDragOver && 'border-primary bg-primary/5',
        className,
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground">
            {accept === 'image/*' ? 'JPG, PNG, GIF, WebP' : 'MP3, WAV, OGG'} — Max 10MB
          </p>
        </div>
      )}
    </div>
  )
}

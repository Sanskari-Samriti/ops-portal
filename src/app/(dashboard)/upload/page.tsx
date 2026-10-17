'use client'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { supabase, Deity } from '@/lib/supabase'

export default function UploadPage() {
  const [deities, setDeities] = useState<Deity[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [form, setForm] = useState({ title: '', description: '', deityId: '', tags: '' })
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('deities').select('*').order('display_order').then(({ data }) => {
      if (data) setDeities(data)
    })
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return
    setFile(f)
    setMediaType(f.type.startsWith('video') ? 'video' : 'image')
    setPreview(URL.createObjectURL(f))
    setSuccess(false)
    setError('')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxFiles: 1,
  })

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please select a file'); return }
    setUploading(true); setProgress(10); setError('')

    try {
      let uploadFile = file
      // Compress images before upload
      if (mediaType === 'image') {
        setProgress(20)
        uploadFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true })
      }

      setProgress(40)
      const bucket = mediaType === 'image' ? 'post-images' : 'post-videos'
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucket).upload(fileName, uploadFile, { cacheControl: '3600', upsert: false })

      if (storageError) throw storageError
      setProgress(70)

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)

      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

      const { error: dbError } = await supabase.from('posts').insert({
        deity_id: form.deityId || null,
        title: form.title || null,
        description: form.description || null,
        media_url: publicUrl,
        media_type: mediaType,
        tags: tags.length > 0 ? tags : null,
        is_published: true,
      })

      if (dbError) throw dbError

      setProgress(100)
      setSuccess(true)
      setFile(null); setPreview(null)
      setForm({ title: '', description: '', deityId: '', tags: '' })
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false); setProgress(0)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📤 Upload Media</h1>

      {success && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 mb-6">
          ✅ Media uploaded successfully! It is now live in the app feed.
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 mb-6">⚠️ {error}</div>
      )}

      <form onSubmit={handleUpload} className="space-y-6">
        {/* Dropzone */}
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
          ${isDragActive ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
          <input {...getInputProps()} />
          {preview ? (
            mediaType === 'image'
              ? <img src={preview} alt="preview" className="max-h-56 mx-auto rounded-lg object-contain" />
              : <video src={preview} className="max-h-56 mx-auto rounded-lg" controls />
          ) : (
            <>
              <div className="text-4xl mb-3">{isDragActive ? '📂' : '🖼️'}</div>
              <p className="text-gray-500 text-sm">Drop image or video here, or <span className="text-orange-500 font-medium">click to browse</span></p>
              <p className="text-gray-400 text-xs mt-1">Images auto-compressed · Max video 100MB</p>
            </>
          )}
        </div>

        {/* Form fields */}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deity / Category</label>
            <select value={form.deityId} onChange={e => setForm(f => ({ ...f, deityId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">— General / All Deities —</option>
              {deities.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Lord Ganesha Morning Blessing"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Add a devotional message or prayer..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="ganesh, morning, blessing, wallpaper"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <button type="submit" disabled={uploading || !file}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition">
          {uploading ? `Uploading... ${progress}%` : '🚀 Upload & Publish'}
        </button>
      </form>
    </div>
  )
}

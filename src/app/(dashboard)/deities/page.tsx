'use client'
import { useEffect, useState } from 'react'
import { supabase, Deity } from '@/lib/supabase'

export default function DeitiesPage() {
  const [deities, setDeities] = useState<Deity[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', slug: '', description: '', display_order: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchDeities() }, [])

  async function fetchDeities() {
    const { data } = await supabase.from('deities').select('*').order('display_order')
    if (data) setDeities(data)
    setLoading(false)
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const { error } = await supabase.from('deities').insert({
      name: form.name,
      slug: form.slug || autoSlug(form.name),
      description: form.description || null,
      display_order: parseInt(form.display_order) || deities.length + 1,
    })
    if (error) { setError(error.message); setSaving(false); return }
    setForm({ name: '', slug: '', description: '', display_order: '' })
    fetchDeities()
    setSaving(false)
  }

  async function deleteDeity(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Posts linked to this deity will become unlinked.`)) return
    await supabase.from('deities').delete().eq('id', id)
    setDeities(ds => ds.filter(d => d.id !== id))
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🙏 Manage Deities</h1>

      {/* Add form */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">Add New Deity</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
            <input required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
              placeholder="Lord Ganesha"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slug (auto-filled)</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="lord-ganesha"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Remover of obstacles..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
            <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
              placeholder={String(deities.length + 1)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="col-span-2">
            <button type="submit" disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg text-sm transition disabled:opacity-40">
              {saving ? 'Adding...' : '+ Add Deity'}
            </button>
          </div>
        </form>
      </div>

      {/* Deities list */}
      {loading ? <div className="text-gray-400">Loading...</div> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {deities.map((d, i) => (
            <div key={d.id} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0">
              <span className="w-7 h-7 rounded-full bg-orange-50 text-orange-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {d.display_order}
              </span>
              {d.thumbnail_url
                ? <img src={d.thumbnail_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                : <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-lg">🙏</div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800">{d.name}</p>
                <p className="text-xs text-gray-400">{d.slug} {d.description ? `· ${d.description}` : ''}</p>
              </div>
              <button onClick={() => deleteDeity(d.id, d.name)}
                className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition font-medium">
                🗑 Delete
              </button>
            </div>
          ))}
          {deities.length === 0 && <p className="p-8 text-center text-gray-400">No deities yet. Add your first one!</p>}
        </div>
      )}
    </div>
  )
}

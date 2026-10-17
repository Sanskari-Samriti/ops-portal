'use client'
import { useEffect, useState } from 'react'
import { supabase, Post } from '@/lib/supabase'

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts').select('*, deity:deities(name)')
      .order('created_at', { ascending: false })
    if (data) setPosts(data as any)
    setLoading(false)
  }

  async function togglePublish(post: Post) {
    const { error } = await supabase.from('posts').update({ is_published: !post.is_published }).eq('id', post.id)
    if (!error) setPosts(ps => ps.map(p => p.id === post.id ? { ...p, is_published: !p.is_published } : p))
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post permanently?')) return
    setDeleting(id)
    await supabase.from('posts').delete().eq('id', id)
    setPosts(ps => ps.filter(p => p.id !== id))
    setDeleting(null)
  }

  if (loading) return <div className="p-8 text-gray-400">Loading posts...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🖼️ Manage Posts</h1>
        <span className="text-sm text-gray-400">{posts.length} posts total</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {posts.length === 0 && <p className="p-8 text-center text-gray-400">No posts yet. Upload some media!</p>}
        {posts.map(post => (
          <div key={post.id} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
            <img
              src={post.media_type === 'image' ? post.media_url : (post.thumbnail_url || '')}
              alt="" className="w-14 h-14 object-cover rounded-lg bg-gray-100 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-800 truncate">{post.title || 'Untitled'}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(post as any).deity?.name || 'General'} · {post.media_type} ·
                ❤️ {post.likes_count} · 💬 {post.comments_count}
              </p>
              <p className="text-xs text-gray-300 mt-0.5">{new Date(post.created_at).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => togglePublish(post)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition
                  ${post.is_published ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {post.is_published ? '✅ Published' : '⏸ Draft'}
              </button>
              <button onClick={() => deletePost(post.id)} disabled={deleting === post.id}
                className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition font-medium">
                {deleting === post.id ? '...' : '🗑 Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

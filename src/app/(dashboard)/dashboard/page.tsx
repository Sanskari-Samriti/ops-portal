'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [stats, setStats] = useState({ posts: 0, deities: 0, likes: 0, comments: 0 })
  const [recentPosts, setRecentPosts] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const [p, d, l, c, recent] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('deities').select('id', { count: 'exact', head: true }),
        supabase.from('likes').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('*, deity:deities(name)').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({ posts: p.count||0, deities: d.count||0, likes: l.count||0, comments: c.count||0 })
      if (recent.data) setRecentPosts(recent.data)
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Posts', value: stats.posts, icon: '🖼️', bg: 'bg-orange-50', text: 'text-orange-600' },
    { label: 'Deities', value: stats.deities, icon: '🙏', bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Total Likes', value: stats.likes, icon: '❤️', bg: 'bg-red-50', text: 'text-red-500' },
    { label: 'Comments', value: stats.comments, icon: '💬', bg: 'bg-blue-50', text: 'text-blue-600' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`rounded-xl p-5 ${c.bg}`}>
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className={`text-2xl font-bold ${c.text}`}>{c.value}</div>
            <div className="text-sm text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Posts</h2>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {recentPosts.length === 0 && <p className="p-6 text-gray-400 text-sm">No posts yet.</p>}
        {recentPosts.map(post => (
          <div key={post.id} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0">
            <img src={post.media_type==='image' ? post.media_url : post.thumbnail_url} alt=""
              className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-800 truncate">{post.title || 'Untitled'}</p>
              <p className="text-xs text-gray-400">{post.deity?.name} · {post.media_type}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${post.is_published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
              {post.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

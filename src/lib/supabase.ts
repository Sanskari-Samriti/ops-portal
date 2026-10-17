import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Deity = {
  id: string; name: string; slug: string
  description: string | null; thumbnail_url: string | null; display_order: number
}

export type Post = {
  id: string; deity_id: string | null; title: string | null
  description: string | null; media_url: string; media_type: 'image' | 'video'
  thumbnail_url: string | null; tags: string[] | null
  is_published: boolean; likes_count: number; comments_count: number
  created_at: string; deity?: Deity
}

'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard', label: '📊 Dashboard', exact: true },
  { href: '/upload', label: '📤 Upload Media' },
  { href: '/posts', label: '🖼️ Manage Posts' },
  { href: '/deities', label: '🙏 Manage Deities' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="text-2xl mb-1">🙏</div>
          <h1 className="font-bold text-orange-600 text-sm leading-tight">Sanskari Samriti</h1>
          <p className="text-xs text-gray-400">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${active ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout}
            className="w-full text-left text-sm text-gray-400 hover:text-red-500 px-3 py-2 rounded-lg transition">
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

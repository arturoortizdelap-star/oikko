import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'OIKKO — Control',
  description: 'Sistema de control para boutique OIKKO',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OIKKO',
  },
  icons: {
    apple: '/apple-touch-icon.png',
    icon: '/icon-192.png',
  }
}

const nav = [
  { href: '/', label: '📊 Dashboard' },
  { href: '/inventario', label: '📦 Inventario' },
  { href: '/scanner', label: '📷 Scanner' },
  { href: '/ventas', label: '💳 Ventas' },
  { href: '/pedidos', label: '🚢 En camino' },
  { href: '/finanzas', label: '💰 Finanzas' },
  { href: '/configuracion', label: '⚙️ Config' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={cormorant.className}>

        {/* ── Mobile top bar ───────────────────────────── */}
        <header className="oikko-topbar md:hidden">
          <img src="/logo.png" className="h-10 mx-auto rounded-full" alt="OIKKO" />
        </header>

        {/* ── Mobile bottom nav ────────────────────────── */}
        <nav className="oikko-bottomnav glass md:hidden" style={{ background: 'rgba(0,180,160,0.92)' }}>
          {nav.map(n => (
            <Link key={n.href} href={n.href} className="oikko-bottomnav-item">
              <span className="text-2xl">{n.label.split(' ')[0]}</span>
              <span className="text-[11px] font-bold">{n.label.split(' ').slice(1).join(' ')}</span>
            </Link>
          ))}
        </nav>

        {/* ── Desktop layout ────────────────────────────── */}
        <div className="hidden md:flex min-h-screen">
          <aside className="oikko-sidebar" style={{ background: 'linear-gradient(180deg, #C8420A 0%, #E8341A 100%)' }}>
            <img src="/logo.png" className="w-20 h-20 mx-auto mb-4 rounded-full" alt="OIKKO logo" />
            {nav.map(n => (
              <Link key={n.href} href={n.href} className="oikko-nav-link glass rounded-xl px-4 py-3">
                {n.label}
              </Link>
            ))}
          </aside>
          <main className="ml-56 flex-1 p-8">{children}</main>
        </div>

        {/* ── Mobile content ────────────────────────────── */}
        <main className="md:hidden p-4 pb-24">{children}</main>

      </body>
    </html>
  )
}

import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

interface SidebarProps {
  currentView: string
  setCurrentView: (view: any) => void
}

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'campaigns', label: 'Campagnes', icon: '🎯' },
    { id: 'shopify-seo', label: 'Shopify SEO', icon: '🛍️' },
    { id: 'seo', label: 'SEO Analyzer', icon: '🕷️' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'pages', label: 'Pages', icon: '📄' },
    { id: 'collections', label: 'Collections', icon: '📁' },
    { id: 'blog', label: 'Blog', icon: '✍️' },
    { id: 'pagespeed', label: 'PageSpeed', icon: '🚀' },
    { id: 'compressor', label: 'Compresseur', icon: '🗜️' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Déconnexion réussie')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>🎯 Google Ads Pro</h1>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  )
}

interface SidebarProps {
  currentView: string
  setCurrentView: (view: string) => void
}

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">G</div>
        <div className="logo-text">Google Ads <span>Pro</span></div>
      </div>
      
      <div className="nav-section">
        <div className="nav-title">Google Ads</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>📊 Dashboard</button>
          <button className={`nav-item ${currentView === 'campaigns' ? 'active' : ''}`} onClick={() => setCurrentView('campaigns')}>📈 Campagnes</button>
        </nav>
      </div>

      <div className="nav-section">
        <div className="nav-title">Shopify</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${currentView === 'images' ? 'active' : ''}`} onClick={() => setCurrentView('images')}>📸 Images</button>
          <button className={`nav-item ${currentView === 'pages' ? 'active' : ''}`} onClick={() => setCurrentView('pages')}>📄 Pages</button>
          <button className={`nav-item ${currentView === 'collections' ? 'active' : ''}`} onClick={() => setCurrentView('collections')}>🗂️ Collections</button>
          <button className={`nav-item ${currentView === 'blog' ? 'active' : ''}`} onClick={() => setCurrentView('blog')}>✍️ Blog</button>
        </nav>
      </div>
    </aside>
  )
}

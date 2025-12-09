import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import './App.css'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Campaigns from './components/Campaigns'
import SEO from './components/SEO'
import Images from './components/Images'
import Pages from './components/Pages'
import Collections from './components/Collections'
import Blog from './components/Blog'
import Sidebar from './components/Sidebar'

type View = 'dashboard' | 'campaigns' | 'seo' | 'images' | 'pages' | 'collections' | 'blog'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth onLogin={() => {}} />
      </>
    )
  }

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{
        success: { duration: 3000, style: { background: '#10b981', color: '#fff' } },
        error: { duration: 4000, style: { background: '#ef4444', color: '#fff' } },
      }} />
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'campaigns' && <Campaigns />}
        {currentView === 'seo' && <SEO />}
        {currentView === 'images' && <Images />}
        {currentView === 'pages' && <Pages />}
        {currentView === 'collections' && <Collections />}
        {currentView === 'blog' && <Blog />}
      </main>
    </div>
  )
}

export default App

import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import Campaigns from './components/Campaigns'
import Sidebar from './components/Sidebar'
import Images from './components/Images'
import Pages from './components/Pages'
import Collections from './components/Collections'
import Blog from './components/Blog'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  return (
    <div className="app">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'campaigns' && <Campaigns />}
        {currentView === 'images' && <Images />}
        {currentView === 'pages' && <Pages />}
        {currentView === 'collections' && <Collections />}
        {currentView === 'blog' && <Blog />}
      </main>
    </div>
  )
}

export default App

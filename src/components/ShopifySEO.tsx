import { useState } from 'react'
import toast from 'react-hot-toast'

interface SEOItem {
  id: string
  image: string
  title: string
  focusKeyword: string
  score: number
  status: 'published' | 'draft' | 'archived'
  metaTitle: string
  metaDescription: string
  type: string
}

const mockProducts: SEOItem[] = [
  { id: '1', image: '🚲', title: 'Faltbares Mini E-Bike. Starke Leistung im ultrakompakten Design.', focusKeyword: 'Faltbares Mini E-Bike', score: 100, status: 'published', metaTitle: 'Faltbares Mini E-Bike kaufen | Bike Innov', metaDescription: 'Entdecken Sie unser faltbares Mini E-Bike mit starker Leistung. ✓ Premium Qualität ✓ Schnelle Lieferung ✓ Top Kundenservice. Jetzt bestellen!', type: 'product' },
  { id: '2', image: '🚲', title: 'Lastenrad E-Bike mit 2 Rädern kaufen | 150kg Zuladung', focusKeyword: 'Lastenrad E-Bike', score: 100, status: 'published', metaTitle: 'Lastenrad E-Bike kaufen | Bike Innov', metaDescription: 'Lastenrad E-Bike mit 150kg Zuladung. ✓ Premium Qualität ✓ Schnelle Lieferung ✓ 2 Jahre Garantie. Jetzt online bestellen!', type: 'product' },
  { id: '3', image: '🚲', title: 'Carbon Mountain E-Bike Premium', focusKeyword: '', score: 45, status: 'published', metaTitle: '', metaDescription: '', type: 'product' },
  { id: '4', image: '🚲', title: 'Urban City E-Bike Comfort', focusKeyword: 'Urban E-Bike', score: 78, status: 'draft', metaTitle: 'Urban City E-Bike', metaDescription: 'Perfekt für die Stadt.', type: 'product' },
  { id: '5', image: '🚲', title: 'E-Bike Batterie 48V 20Ah', focusKeyword: '', score: 32, status: 'published', metaTitle: '', metaDescription: '', type: 'product' },
]

const mockCollections: SEOItem[] = [
  { id: '1', image: '📁', title: 'Elektrofahrräder', focusKeyword: 'Elektrofahrräder', score: 95, status: 'published', metaTitle: 'Elektrofahrräder | Bike Innov', metaDescription: 'Unsere Elektrofahrräder Kollektion. ✓ Große Auswahl ✓ Beste Preise ✓ Schnelle Lieferung.', type: 'collection' },
  { id: '2', image: '📁', title: 'Zubehör', focusKeyword: '', score: 40, status: 'published', metaTitle: '', metaDescription: '', type: 'collection' },
  { id: '3', image: '📁', title: 'Ersatzteile', focusKeyword: 'E-Bike Ersatzteile', score: 88, status: 'published', metaTitle: 'E-Bike Ersatzteile | Bike Innov', metaDescription: 'Alle Ersatzteile für Ihr E-Bike. Schneller Versand und Top-Qualität.', type: 'collection' },
]

const mockPages: SEOItem[] = [
  { id: '1', image: '📄', title: 'Über uns', focusKeyword: 'Bike Innov Geschichte', score: 85, status: 'published', metaTitle: 'Über uns | Bike Innov', metaDescription: 'Erfahren Sie mehr über Bike Innov und unsere Geschichte.', type: 'page' },
  { id: '2', image: '📄', title: 'Kontakt', focusKeyword: '', score: 50, status: 'published', metaTitle: '', metaDescription: '', type: 'page' },
  { id: '3', image: '📄', title: 'FAQ', focusKeyword: 'E-Bike häufige Fragen', score: 95, status: 'published', metaTitle: 'FAQ E-Bike | Bike Innov', metaDescription: 'Antworten auf Ihre häufigsten Fragen rund um E-Bikes und unseren Service.', type: 'page' },
]

const mockBlogs: SEOItem[] = [
  { id: '1', image: '✍️', title: 'Kompletter E-Bike Ratgeber 2024', focusKeyword: 'E-Bike Ratgeber', score: 92, status: 'published', metaTitle: 'E-Bike Ratgeber 2024 | Bike Innov', metaDescription: 'Alles was Sie über E-Bikes wissen müssen. Tipps, Tricks und Expertenwissen.', type: 'blog' },
  { id: '2', image: '✍️', title: 'Batteriepflege Tipps', focusKeyword: 'E-Bike Batterie Pflege', score: 88, status: 'published', metaTitle: 'E-Bike Batterie Pflege | Bike Innov', metaDescription: 'So pflegen Sie Ihre E-Bike Batterie richtig. Praktische Tipps für längere Lebensdauer.', type: 'blog' },
  { id: '3', image: '✍️', title: 'Die besten Radwege Deutschlands', focusKeyword: '', score: 35, status: 'draft', metaTitle: '', metaDescription: '', type: 'blog' },
]

// SEO Optimization Rules Engine
const SEOOptimizer = {
  extractKeywords: (title: string): string => {
    const stopWords = ['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'eines', 'und', 'oder', 'für', 'mit', 'bei', 'von', 'zu', 'im', 'am', 'auf', 'aus', 'nach', 'über', 'unter', 'vor', 'zwischen', 'durch', 'gegen', 'ohne', 'um', 'bis', 'seit', 'während', 'wegen', 'trotz', 'ist', 'sind', 'war', 'waren', 'sein', 'haben', 'hat', 'hatte', 'werden', 'wird', 'wurde', 'kaufen', 'bestellen', 'jetzt', 'hier', 'mehr', 'alle', 'viele', 'neue', 'neuer', 'neues']
    
    const cleanTitle = title
      .replace(/[|.!?,:;()[\]{}'"]/g, ' ')
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word.toLowerCase()))
      .slice(0, 4)
      .join(' ')
    
    return cleanTitle
  },

  generateMetaTitle: (title: string, keyword: string, type: string): string => {
    const brand = 'Bike Innov'
    const mainKeyword = keyword || SEOOptimizer.extractKeywords(title)
    
    let metaTitle = ''
    switch(type) {
      case 'product':
        metaTitle = `${mainKeyword} kaufen | ${brand}`
        break
      case 'collection':
        metaTitle = `${mainKeyword} Kollektion | ${brand}`
        break
      case 'blog':
        metaTitle = `${mainKeyword} | ${brand} Blog`
        break
      case 'page':
        metaTitle = `${mainKeyword} | ${brand}`
        break
      default:
        metaTitle = `${mainKeyword} | ${brand}`
    }
    
    if (metaTitle.length > 60) {
      metaTitle = metaTitle.substring(0, 57) + '...'
    }
    
    return metaTitle
  },

  generateMetaDescription: (title: string, keyword: string, type: string): string => {
    const mainKeyword = keyword || SEOOptimizer.extractKeywords(title)
    
    const templates = {
      product: [
        `${mainKeyword} bei Bike Innov entdecken. ✓ Premium Qualität ✓ Schnelle Lieferung ✓ Top Kundenservice ✓ 2 Jahre Garantie. Jetzt bestellen!`,
        `Kaufen Sie ${mainKeyword} bei Bike Innov. Hochwertige E-Bikes, beste Preise und schneller Versand. Jetzt online entdecken!`
      ],
      collection: [
        `${mainKeyword} Kollektion bei Bike Innov. ✓ Große Auswahl ✓ Faire Preise ✓ Kompetente Beratung ✓ Schneller Versand. Jetzt entdecken!`,
        `Entdecken Sie unsere ${mainKeyword} bei Bike Innov. Premium E-Bikes für jeden Bedarf. Jetzt Kollektion ansehen!`
      ],
      blog: [
        `${mainKeyword} - Erfahren Sie alles Wichtige in unserem Ratgeber. Tipps, Tricks und Expertenwissen von Bike Innov.`,
        `Lesen Sie unseren Guide über ${mainKeyword}. Praktische Tipps und Empfehlungen von den E-Bike Experten bei Bike Innov.`
      ],
      page: [
        `${mainKeyword} - Erfahren Sie mehr über Bike Innov. Ihr Partner für hochwertige E-Bikes und erstklassigen Service.`,
        `${mainKeyword} bei Bike Innov. Wir beraten Sie gerne zu allen Fragen rund um E-Bikes. Kontaktieren Sie uns!`
      ]
    }
    
    const typeTemplates = templates[type as keyof typeof templates] || templates.product
    const description = typeTemplates[Math.floor(Math.random() * typeTemplates.length)]
    
    if (description.length > 160) {
      return description.substring(0, 157) + '...'
    }
    
    return description
  },

  calculateScore: (item: SEOItem): number => {
    let score = 0
    
    // Focus Keyword (30 points)
    if (item.focusKeyword && item.focusKeyword.length >= 3) {
      score += 30
    }
    
    // Meta Title (35 points)
    if (item.metaTitle && item.metaTitle.length >= 20) {
      score += 20
      if (item.metaTitle.length >= 30 && item.metaTitle.length <= 60) {
        score += 10
      }
      if (item.focusKeyword && item.metaTitle.toLowerCase().includes(item.focusKeyword.toLowerCase().split(' ')[0])) {
        score += 5
      }
    }
    
    // Meta Description (35 points)
    if (item.metaDescription && item.metaDescription.length >= 50) {
      score += 20
      if (item.metaDescription.length >= 120 && item.metaDescription.length <= 160) {
        score += 10
      }
      if (item.focusKeyword && item.metaDescription.toLowerCase().includes(item.focusKeyword.toLowerCase().split(' ')[0])) {
        score += 5
      }
    }
    
    return Math.min(100, score)
  },

  getSuggestions: (item: SEOItem): string[] => {
    const suggestions: string[] = []
    
    if (!item.focusKeyword) {
      suggestions.push('🎯 Focus-Keyword hinzufügen')
    }
    if (!item.metaTitle) {
      suggestions.push('📝 SEO-Titel hinzufügen')
    } else if (item.metaTitle.length < 30) {
      suggestions.push('📝 SEO-Titel zu kurz (min. 30 Zeichen)')
    } else if (item.metaTitle.length > 60) {
      suggestions.push('📝 SEO-Titel zu lang (max. 60 Zeichen)')
    }
    if (!item.metaDescription) {
      suggestions.push('📄 Meta-Beschreibung hinzufügen')
    } else if (item.metaDescription.length < 120) {
      suggestions.push('📄 Meta-Beschreibung zu kurz (min. 120 Zeichen)')
    } else if (item.metaDescription.length > 160) {
      suggestions.push('📄 Meta-Beschreibung zu lang (max. 160 Zeichen)')
    }
    if (item.focusKeyword && item.metaTitle && !item.metaTitle.toLowerCase().includes(item.focusKeyword.toLowerCase().split(' ')[0])) {
      suggestions.push('🔗 Keyword im SEO-Titel einbinden')
    }
    
    return suggestions
  }
}

export default function ShopifySEO() {
  const [activeTab, setActiveTab] = useState<'products' | 'collections' | 'pages' | 'blogs'>('products')
  const [filter, setFilter] = useState<'all' | 'optimized' | 'to-optimize'>('all')
  const [editingItem, setEditingItem] = useState<SEOItem | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [items, setItems] = useState(() => { const savedProducts = localStorage.getItem('seo_products'); const savedCollections = localStorage.getItem('seo_collections'); const savedPages = localStorage.getItem('seo_pages'); const savedBlogs = localStorage.getItem('seo_blogs'); return {
    products: savedProducts ? JSON.parse(savedProducts) : mockProducts,
    collections: savedCollections ? JSON.parse(savedCollections) : mockCollections,
    pages: savedPages ? JSON.parse(savedPages) : mockPages,
    blogs: savedBlogs ? JSON.parse(savedBlogs) : mockBlogs
  }})

  const getCurrentItems = () => {
    let data = items[activeTab]
    if (filter === 'optimized') data = data.filter(i => i.score >= 80)
    if (filter === 'to-optimize') data = data.filter(i => i.score < 80)
    return data
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
      products: 'Produkte',
      collections: 'Sammlungen',
      pages: 'Seiten',
      blogs: 'Artikel'
    }
    return labels[tab]
  }

  const getStats = () => {
    const all = items[activeTab]
    return {
      total: all.length,
      optimized: all.filter(i => i.score >= 80).length,
      toOptimize: all.filter(i => i.score < 80).length,
      avgScore: Math.round(all.reduce((a, b) => a + b.score, 0) / all.length)
    }
  }

  const handleOptimize = (item: SEOItem) => {
    setEditingItem(item)
  }

  const handleSave = () => {
    if (!editingItem) return
    
    const newScore = SEOOptimizer.calculateScore(editingItem)
    const updatedItem = { ...editingItem, score: newScore }
    
    setItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(i => i.id === updatedItem.id ? updatedItem : i)
    }))
    
    localStorage.setItem(`seo_${activeTab}`, JSON.stringify(items[activeTab].map(i => i.id === updatedItem.id ? updatedItem : i)))
    
    toast.success(`✅ "${updatedItem.title.slice(0, 30)}..." optimiert! Score: ${newScore}/100`)
    setEditingItem(null)
  }

  const handleAutoOptimize = async () => {
    if (!editingItem) return
    
    setIsOptimizing(true)
    await new Promise(r => setTimeout(r, 1500))
    
    const keyword = SEOOptimizer.extractKeywords(editingItem.title)
    const metaTitle = SEOOptimizer.generateMetaTitle(editingItem.title, keyword, editingItem.type)
    const metaDescription = SEOOptimizer.generateMetaDescription(editingItem.title, keyword, editingItem.type)
    
    const autoOptimized = {
      ...editingItem,
      focusKeyword: keyword,
      metaTitle,
      metaDescription
    }
    
    autoOptimized.score = SEOOptimizer.calculateScore(autoOptimized)
    
    setEditingItem(autoOptimized)
    setIsOptimizing(false)
    toast.success('🤖 KI-Optimierung angewendet!')
  }

  const handleOptimizeAll = async () => {
    const toOptimize = items[activeTab].filter(i => i.score < 80)
    if (toOptimize.length === 0) {
      toast.success('✅ Alle Elemente sind bereits optimiert!')
      return
    }
    
    setIsOptimizing(true)
    toast.loading(`${toOptimize.length} Elemente werden optimiert...`)
    
    await new Promise(r => setTimeout(r, 2000))
    
    const optimizedItems = items[activeTab].map(item => {
      if (item.score >= 80) return item
      
      const keyword = SEOOptimizer.extractKeywords(item.title)
      const metaTitle = SEOOptimizer.generateMetaTitle(item.title, keyword, item.type)
      const metaDescription = SEOOptimizer.generateMetaDescription(item.title, keyword, item.type)
      
      const optimized = {
        ...item,
        focusKeyword: keyword,
        metaTitle,
        metaDescription
      }
      optimized.score = SEOOptimizer.calculateScore(optimized)
      return optimized
    })
    
    setItems(prev => ({
      ...prev,
      [activeTab]: optimizedItems
    }))
    
    localStorage.setItem(`seo_${activeTab}`, JSON.stringify(optimizedItems))
    
    setIsOptimizing(false)
    toast.dismiss()
    toast.success(`🎉 ${toOptimize.length} Elemente optimiert!`)
  }

  const stats = getStats()
  const suggestions = editingItem ? SEOOptimizer.getSuggestions(editingItem) : []

  return (
    <div className="shopify-seo">
      <div className="shopify-seo-header">
        <div>
          <h1>🛍️ Shopify SEO Optimizer</h1>
          <p className="subtitle">Optimieren Sie das SEO Ihrer Boutique mit KI</p>
        </div>
        <button 
          className="optimize-all-btn"
          onClick={handleOptimizeAll}
          disabled={isOptimizing || stats.toOptimize === 0}
        >
          {isOptimizing ? '⏳ Optimierung...' : `🚀 Alle optimieren (${stats.toOptimize})`}
        </button>
      </div>

      <div className="seo-optimizer-stats">
        <div className="optimizer-stat">
          <div className="optimizer-stat-value">{stats.total}</div>
          <div className="optimizer-stat-label">Gesamt {getTabLabel(activeTab)}</div>
        </div>
        <div className="optimizer-stat good">
          <div className="optimizer-stat-value">{stats.optimized}</div>
          <div className="optimizer-stat-label">Optimiert (80+)</div>
        </div>
        <div className="optimizer-stat warning">
          <div className="optimizer-stat-value">{stats.toOptimize}</div>
          <div className="optimizer-stat-label">Zu optimieren</div>
        </div>
        <div className="optimizer-stat">
          <div className="optimizer-stat-value">{stats.avgScore}%</div>
          <div className="optimizer-stat-label">Durchschnitt</div>
        </div>
      </div>

      <div className="optimizer-tabs">
        {(['products', 'collections', 'pages', 'blogs'] as const).map(tab => (
          <button
            key={tab}
            className={`optimizer-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'products' && '📦'}
            {tab === 'collections' && '📁'}
            {tab === 'pages' && '📄'}
            {tab === 'blogs' && '✍️'}
            {' '}{getTabLabel(tab)}
          </button>
        ))}
      </div>

      <div className="optimizer-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Alle
        </button>
        <button 
          className={`filter-btn ${filter === 'optimized' ? 'active' : ''}`}
          onClick={() => setFilter('optimized')}
        >
          ✅ Optimiert
        </button>
        <button 
          className={`filter-btn ${filter === 'to-optimize' ? 'active' : ''}`}
          onClick={() => setFilter('to-optimize')}
        >
          ⚠️ Zu optimieren
        </button>
      </div>

      <div className="optimizer-table">
        <table>
          <thead>
            <tr>
              <th style={{width: '50px'}}>Bild</th>
              <th>Titel</th>
              <th>Focus Keyword</th>
              <th style={{width: '100px'}}>Aktionen</th>
              <th style={{width: '80px'}}>Score</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentItems().map(item => (
              <tr key={item.id}>
                <td className="item-image">{item.image}</td>
                <td className="item-title">{item.title}</td>
                <td className="item-keyword">
                  {item.focusKeyword || <span className="no-keyword">Nicht definiert</span>}
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleOptimize(item)}>
                    ✏️ Bearbeiten
                  </button>
                </td>
                <td>
                  <div 
                    className="score-circle"
                    style={{ 
                      backgroundColor: getScoreColor(item.score),
                      color: '#fff'
                    }}
                  >
                    {item.score}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <div className="seo-modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="seo-modal" onClick={e => e.stopPropagation()}>
            <div className="seo-modal-header">
              <h2>✏️ SEO Optimieren</h2>
              <button className="close-btn" onClick={() => setEditingItem(null)}>✕</button>
            </div>
            
            <div className="seo-modal-content">
              <div className="modal-item-preview">
                <span className="preview-image">{editingItem.image}</span>
                <span className="preview-title">{editingItem.title}</span>
                <span 
                  className="preview-score"
                  style={{ backgroundColor: getScoreColor(editingItem.score) }}
                >
                  {editingItem.score}/100
                </span>
              </div>

              {suggestions.length > 0 && (
                <div className="seo-suggestions">
                  <h4>💡 Verbesserungsvorschläge</h4>
                  <ul>
                    {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              <div className="seo-form">
                <div className="form-group">
                  <label>Focus Keyword</label>
                  <input
                    type="text"
                    value={editingItem.focusKeyword}
                    onChange={e => setEditingItem({...editingItem, focusKeyword: e.target.value})}
                    placeholder="Haupt-Keyword..."
                  />
                </div>

                <div className="form-group">
                  <label>
                    SEO-Titel 
                    <span className={`char-count ${editingItem.metaTitle.length > 60 ? 'error' : editingItem.metaTitle.length >= 30 ? 'good' : ''}`}>
                      {editingItem.metaTitle.length}/60
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.metaTitle}
                    onChange={e => setEditingItem({...editingItem, metaTitle: e.target.value})}
                    placeholder="SEO-Titel..."
                    maxLength={70}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Meta-Beschreibung 
                    <span className={`char-count ${editingItem.metaDescription.length > 160 ? 'error' : editingItem.metaDescription.length >= 120 ? 'good' : ''}`}>
                      {editingItem.metaDescription.length}/160
                    </span>
                  </label>
                  <textarea
                    value={editingItem.metaDescription}
                    onChange={e => setEditingItem({...editingItem, metaDescription: e.target.value})}
                    placeholder="Meta-Beschreibung..."
                    maxLength={170}
                    rows={3}
                  />
                </div>

                <div className="seo-preview">
                  <div className="preview-label">🔍 Google Vorschau</div>
                  <div className="google-preview">
                    <div className="google-title">{editingItem.metaTitle || editingItem.title}</div>
                    <div className="google-url">https://bike-innov.com/{editingItem.type}/{editingItem.id}</div>
                    <div className="google-desc">{editingItem.metaDescription || 'Keine Beschreibung definiert...'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="seo-modal-footer">
              <button 
                className="auto-btn" 
                onClick={handleAutoOptimize}
                disabled={isOptimizing}
              >
                {isOptimizing ? '⏳ Analyse...' : '🤖 KI Auto-Optimierung'}
              </button>
              <button className="save-btn" onClick={handleSave}>
                💾 Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

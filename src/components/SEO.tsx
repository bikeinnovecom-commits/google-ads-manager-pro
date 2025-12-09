import { useState } from 'react'
import toast from 'react-hot-toast'

interface CrawlResult {
  url: string
  title: string
  description: string
  h1: string[]
  h2: string[]
  wordCount: number
  imageCount: number
  linkCount: number
  score: number
  issues: string[]
  crawledAt: string
}

interface Keyword {
  term: string
  volume: number
  difficulty: number
  cpc: number
  trend: number[]
}

export default function SEO() {
  const [activeTab, setActiveTab] = useState<'crawler' | 'keywords' | 'backlinks' | 'audit'>('crawler')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CrawlResult[]>(() => {
    const saved = localStorage.getItem('seo_crawls')
    return saved ? JSON.parse(saved) : []
  })
  const [keywords, setKeywords] = useState<Keyword[]>(() => {
    const saved = localStorage.getItem('seo_keywords')
    return saved ? JSON.parse(saved) : []
  })
  const [keywordInput, setKeywordInput] = useState('')

  const crawlUrl = async () => {
    if (!url) return
    setLoading(true)
    
    try {
      // Simulation du crawl (dans une vraie app, ça serait un backend)
      await new Promise(r => setTimeout(r, 2000))
      
      const mockResult: CrawlResult = {
        url,
        title: `Page - ${new URL(url).hostname}`,
        description: 'Meta description de la page analysée',
        h1: ['Titre principal de la page'],
        h2: ['Sous-titre 1', 'Sous-titre 2', 'Sous-titre 3'],
        wordCount: Math.floor(Math.random() * 2000) + 500,
        imageCount: Math.floor(Math.random() * 20) + 5,
        linkCount: Math.floor(Math.random() * 50) + 10,
        score: Math.floor(Math.random() * 30) + 70,
        issues: generateIssues(),
        crawledAt: new Date().toISOString()
      }
      
      const newResults = [mockResult, ...results].slice(0, 20)
      setResults(newResults)
      localStorage.setItem('seo_crawls', JSON.stringify(newResults))
      toast.success('Analyse terminée !')
      setUrl('')
    } catch (error) {
      toast.error('Erreur lors de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  const generateIssues = () => {
    const allIssues = [
      'Meta description trop courte',
      'Balise H1 manquante',
      'Images sans attribut alt',
      'Temps de chargement élevé',
      'Pas de sitemap.xml',
      'Robots.txt manquant',
      'Liens cassés détectés',
      'Contenu dupliqué possible',
      'HTTPS non configuré',
      'Mobile non optimisé'
    ]
    return allIssues.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1)
  }

  const analyzeKeyword = () => {
    if (!keywordInput) return
    
    const newKeyword: Keyword = {
      term: keywordInput,
      volume: Math.floor(Math.random() * 50000) + 1000,
      difficulty: Math.floor(Math.random() * 100),
      cpc: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
      trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
    }
    
    const newKeywords = [newKeyword, ...keywords].slice(0, 50)
    setKeywords(newKeywords)
    localStorage.setItem('seo_keywords', JSON.stringify(newKeywords))
    toast.success(`Mot-clé "${keywordInput}" analysé !`)
    setKeywordInput('')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getDifficultyLabel = (diff: number) => {
    if (diff < 30) return { label: 'Facile', color: '#10b981' }
    if (diff < 60) return { label: 'Moyen', color: '#f59e0b' }
    return { label: 'Difficile', color: '#ef4444' }
  }

  return (
    <div className="seo-module">
      <h1>🕷️ SEO Analyzer</h1>
      <p className="subtitle">Analysez et optimisez votre référencement</p>

      {/* Stats Overview */}
      <div className="seo-stats">
        <div className="seo-stat-card">
          <span className="seo-stat-icon">🔍</span>
          <div>
            <div className="seo-stat-value">{results.length}</div>
            <div className="seo-stat-label">Pages analysées</div>
          </div>
        </div>
        <div className="seo-stat-card">
          <span className="seo-stat-icon">🎯</span>
          <div>
            <div className="seo-stat-value">{keywords.length}</div>
            <div className="seo-stat-label">Mots-clés suivis</div>
          </div>
        </div>
        <div className="seo-stat-card">
          <span className="seo-stat-icon">📊</span>
          <div>
            <div className="seo-stat-value">
              {results.length > 0 ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length) : 0}
            </div>
            <div className="seo-stat-label">Score moyen</div>
          </div>
        </div>
        <div className="seo-stat-card">
          <span className="seo-stat-icon">⚠️</span>
          <div>
            <div className="seo-stat-value">
              {results.reduce((a, b) => a + b.issues.length, 0)}
            </div>
            <div className="seo-stat-label">Problèmes détectés</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="seo-tabs">
        <button 
          className={`seo-tab ${activeTab === 'crawler' ? 'active' : ''}`}
          onClick={() => setActiveTab('crawler')}
        >
          🕷️ Crawler
        </button>
        <button 
          className={`seo-tab ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
        >
          🎯 Mots-clés
        </button>
        <button 
          className={`seo-tab ${activeTab === 'backlinks' ? 'active' : ''}`}
          onClick={() => setActiveTab('backlinks')}
        >
          🔗 Backlinks
        </button>
        <button 
          className={`seo-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📋 Audit
        </button>
      </div>

      {/* Crawler Tab */}
      {activeTab === 'crawler' && (
        <div className="seo-content">
          <div className="crawler-input">
            <input
              type="url"
              placeholder="https://exemple.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && crawlUrl()}
            />
            <button onClick={crawlUrl} disabled={loading || !url}>
              {loading ? '⏳ Analyse...' : '🔍 Analyser'}
            </button>
          </div>

          <div className="crawl-results">
            {results.map((result, i) => (
              <div key={i} className="crawl-card">
                <div className="crawl-header">
                  <div className="crawl-url">{result.url}</div>
                  <div 
                    className="crawl-score"
                    style={{ backgroundColor: getScoreColor(result.score) }}
                  >
                    {result.score}/100
                  </div>
                </div>
                <div className="crawl-meta">
                  <div><strong>Title:</strong> {result.title}</div>
                  <div><strong>Description:</strong> {result.description}</div>
                </div>
                <div className="crawl-stats">
                  <span>📝 {result.wordCount} mots</span>
                  <span>🖼️ {result.imageCount} images</span>
                  <span>🔗 {result.linkCount} liens</span>
                  <span>📑 {result.h1.length} H1, {result.h2.length} H2</span>
                </div>
                {result.issues.length > 0 && (
                  <div className="crawl-issues">
                    <strong>⚠️ Problèmes:</strong>
                    <ul>
                      {result.issues.map((issue, j) => (
                        <li key={j}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="crawl-date">
                  Analysé le {new Date(result.crawledAt).toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <div className="empty-state">
                <span>🕷️</span>
                <p>Aucune page analysée. Entrez une URL pour commencer.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="seo-content">
          <div className="crawler-input">
            <input
              type="text"
              placeholder="Entrez un mot-clé..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeKeyword()}
            />
            <button onClick={analyzeKeyword} disabled={!keywordInput}>
              🎯 Analyser
            </button>
          </div>

          <div className="keywords-table">
            <table>
              <thead>
                <tr>
                  <th>Mot-clé</th>
                  <th>Volume</th>
                  <th>Difficulté</th>
                  <th>CPC</th>
                  <th>Tendance</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw, i) => {
                  const diff = getDifficultyLabel(kw.difficulty)
                  return (
                    <tr key={i}>
                      <td className="kw-term">{kw.term}</td>
                      <td>{kw.volume.toLocaleString()}</td>
                      <td>
                        <span className="difficulty-badge" style={{ backgroundColor: diff.color }}>
                          {kw.difficulty}% - {diff.label}
                        </span>
                      </td>
                      <td>{kw.cpc.toFixed(2)} €</td>
                      <td>
                        <div className="mini-trend">
                          {kw.trend.map((v, j) => (
                            <div 
                              key={j} 
                              className="trend-bar" 
                              style={{ height: `${v}%` }}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {keywords.length === 0 && (
              <div className="empty-state">
                <span>🎯</span>
                <p>Aucun mot-clé analysé. Commencez votre recherche.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backlinks Tab */}
      {activeTab === 'backlinks' && (
        <div className="seo-content">
          <div className="backlinks-overview">
            <div className="backlink-stat">
              <div className="backlink-value">247</div>
              <div className="backlink-label">Total Backlinks</div>
            </div>
            <div className="backlink-stat">
              <div className="backlink-value">45</div>
              <div className="backlink-label">Domaines référents</div>
            </div>
            <div className="backlink-stat">
              <div className="backlink-value">68</div>
              <div className="backlink-label">Domain Authority</div>
            </div>
            <div className="backlink-stat">
              <div className="backlink-value">12</div>
              <div className="backlink-label">Liens cassés</div>
            </div>
          </div>

          <div className="backlinks-list">
            <h3>🔗 Backlinks récents</h3>
            {[
              { source: 'blog-velo.fr', target: '/guide-velo-electrique', da: 45, type: 'DoFollow' },
              { source: 'cyclisme-magazine.com', target: '/comparatif-batteries', da: 62, type: 'DoFollow' },
              { source: 'forum-ebike.net', target: '/', da: 28, type: 'NoFollow' },
              { source: 'annuaire-velo.com', target: '/', da: 15, type: 'DoFollow' },
              { source: 'wikipedia.org', target: '/histoire-velo', da: 95, type: 'NoFollow' },
            ].map((bl, i) => (
              <div key={i} className="backlink-item">
                <div className="backlink-source">
                  <span className="backlink-domain">{bl.source}</span>
                  <span className="backlink-da">DA: {bl.da}</span>
                </div>
                <div className="backlink-target">→ {bl.target}</div>
                <span className={`backlink-type ${bl.type.toLowerCase()}`}>{bl.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="seo-content">
          <div className="audit-score">
            <div className="audit-circle" style={{ '--score': 73 } as React.CSSProperties}>
              <span>73</span>
            </div>
            <div className="audit-label">Score SEO Global</div>
          </div>

          <div className="audit-categories">
            <div className="audit-category">
              <div className="audit-cat-header">
                <span>📱 Mobile</span>
                <span className="audit-cat-score good">92/100</span>
              </div>
              <div className="audit-bar">
                <div className="audit-progress" style={{ width: '92%', backgroundColor: '#10b981' }}></div>
              </div>
            </div>
            <div className="audit-category">
              <div className="audit-cat-header">
                <span>⚡ Performance</span>
                <span className="audit-cat-score medium">67/100</span>
              </div>
              <div className="audit-bar">
                <div className="audit-progress" style={{ width: '67%', backgroundColor: '#f59e0b' }}></div>
              </div>
            </div>
            <div className="audit-category">
              <div className="audit-cat-header">
                <span>🔒 Sécurité</span>
                <span className="audit-cat-score good">100/100</span>
              </div>
              <div className="audit-bar">
                <div className="audit-progress" style={{ width: '100%', backgroundColor: '#10b981' }}></div>
              </div>
            </div>
            <div className="audit-category">
              <div className="audit-cat-header">
                <span>📝 Contenu</span>
                <span className="audit-cat-score medium">58/100</span>
              </div>
              <div className="audit-bar">
                <div className="audit-progress" style={{ width: '58%', backgroundColor: '#f59e0b' }}></div>
              </div>
            </div>
          </div>

          <div className="audit-recommendations">
            <h3>📋 Recommandations prioritaires</h3>
            <div className="recommendation high">
              <span className="rec-priority">Haute</span>
              <span className="rec-text">Optimiser les images (compression WebP)</span>
            </div>
            <div className="recommendation high">
              <span className="rec-priority">Haute</span>
              <span className="rec-text">Ajouter des meta descriptions uniques</span>
            </div>
            <div className="recommendation medium">
              <span className="rec-priority">Moyenne</span>
              <span className="rec-text">Améliorer le maillage interne</span>
            </div>
            <div className="recommendation low">
              <span className="rec-priority">Basse</span>
              <span className="rec-text">Ajouter un fil d'Ariane</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

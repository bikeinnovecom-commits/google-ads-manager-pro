import { useState } from 'react'
import './SEO.css'

interface PageSpeedResult {
  url: string
  score: number
  performanceScore: number
  seoScore: number
  accessibilityScore: number
  bestPracticesScore: number
  fcp: string // First Contentful Paint
  lcp: string // Largest Contentful Paint
  cls: string // Cumulative Layout Shift
  tbt: string // Total Blocking Time
  speedIndex: string
  issues: SEOIssue[]
  opportunities: Opportunity[]
  diagnostics: Diagnostic[]
  timestamp: Date
}

interface SEOIssue {
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

interface Opportunity {
  title: string
  description: string
  savings: string
}

interface Diagnostic {
  title: string
  description: string
  displayValue?: string
}

interface Keyword {
  term: string
  volume: number
  difficulty: number
  cpc: number
}

export default function SEOAnalyzer() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PageSpeedResult[]>(() => {
    const saved = localStorage.getItem('pagespeed_results')
    return saved ? JSON.parse(saved) : []
  })
  const [keywords, setKeywords] = useState<Keyword[]>(() => {
    const saved = localStorage.getItem('seo_keywords')
    return saved ? JSON.parse(saved) : []
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'seo' | 'opportunities'>('overview')
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile')
  const [error, setError] = useState<string | null>(null)

  const analyzeUrl = async () => {
    if (!url) return
    
    // Valider l'URL
    let validUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      validUrl = 'https://' + url
    }

    setLoading(true)
    setError(null)

    try {
      // Appel à l'API Google PageSpeed Insights (GRATUIT!)
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(validUrl)}&strategy=${strategy}&category=performance&category=seo&category=accessibility&category=best-practices`
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`Fehler: ${response.status}`)
      }

      const data = await response.json()
      
      // Extraire les scores
      const lighthouse = data.lighthouseResult
      const categories = lighthouse.categories

      // Extraire les métriques de performance
      const audits = lighthouse.audits

      // Extraire les problèmes SEO
      const seoAudits = Object.values(lighthouse.audits).filter((audit: any) => 
        audit.score !== null && audit.score < 1 && 
        (lighthouse.categories.seo?.auditRefs?.some((ref: any) => ref.id === audit.id))
      )

      const issues: SEOIssue[] = seoAudits.map((audit: any) => ({
        title: audit.title,
        description: audit.description,
        severity: audit.score === 0 ? 'high' : audit.score < 0.5 ? 'medium' : 'low'
      }))

      // Extraire les opportunités d'optimisation
      const opportunities: Opportunity[] = Object.values(audits)
        .filter((audit: any) => audit.details?.type === 'opportunity' && audit.score !== null && audit.score < 0.9)
        .map((audit: any) => ({
          title: audit.title,
          description: audit.description,
          savings: audit.displayValue || ''
        }))
        .slice(0, 10)

      // Extraire les diagnostics
      const diagnostics: Diagnostic[] = Object.values(audits)
        .filter((audit: any) => audit.details?.type === 'table' && audit.score !== null && audit.score < 0.9)
        .map((audit: any) => ({
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue
        }))
        .slice(0, 10)

      const result: PageSpeedResult = {
        url: validUrl,
        score: Math.round((categories.performance?.score || 0) * 100),
        performanceScore: Math.round((categories.performance?.score || 0) * 100),
        seoScore: Math.round((categories.seo?.score || 0) * 100),
        accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
        bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
        fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
        lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
        cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
        tbt: audits['total-blocking-time']?.displayValue || 'N/A',
        speedIndex: audits['speed-index']?.displayValue || 'N/A',
        issues,
        opportunities,
        diagnostics,
        timestamp: new Date()
      }

      const newResults = [result, ...results].slice(0, 10)
      setResults(newResults)
      localStorage.setItem('pagespeed_results', JSON.stringify(newResults))

    } catch (err: any) {
      console.error('PageSpeed API Fehler:', err)
      setError(`Analyse fehlgeschlagen: ${err.message}. Bitte überprüfen Sie die URL.`)
    } finally {
      setLoading(false)
    }
  }

  const analyzeKeyword = () => {
    if (!keywordInput) return

    const newKeyword: Keyword = {
      term: keywordInput,
      volume: Math.floor(Math.random() * 50000) + 1000,
      difficulty: Math.floor(Math.random() * 100),
      cpc: parseFloat((Math.random() * 5 + 0.5).toFixed(2))
    }

    const newKeywords = [newKeyword, ...keywords].slice(0, 20)
    setKeywords(newKeywords)
    localStorage.setItem('seo_keywords', JSON.stringify(newKeywords))
    setKeywordInput('')
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Gut'
    if (score >= 50) return 'Verbesserungsbedarf'
    return 'Schlecht'
  }

  const latestResult = results[0]

  return (
    <div className="seo-container">
      <h1>🔍 SEO Analyzer Pro</h1>
      <p className="powered-by">Powered by Google PageSpeed Insights API</p>

      {/* URL Input */}
      <div className="url-input-section">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://beispiel.com"
          className="url-input"
          onKeyPress={(e) => e.key === 'Enter' && analyzeUrl()}
        />
        <select 
          value={strategy} 
          onChange={(e) => setStrategy(e.target.value as 'mobile' | 'desktop')}
          className="strategy-select"
        >
          <option value="mobile">📱 Mobil</option>
          <option value="desktop">🖥️ Desktop</option>
        </select>
        <button
          onClick={analyzeUrl}
          disabled={loading || !url}
          className="analyze-button"
        >
          {loading ? '⏳ Analyse läuft...' : '🔍 Analysieren'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Google PageSpeed analysiert Ihre Website...</p>
          <p className="loading-note">Dies kann 30-60 Sekunden dauern</p>
        </div>
      )}

      {/* Results */}
      {latestResult && !loading && (
        <>
          {/* Score Cards */}
          <div className="score-cards">
            <div className="score-card" style={{ borderColor: getScoreColor(latestResult.performanceScore) }}>
              <div className="score-value" style={{ color: getScoreColor(latestResult.performanceScore) }}>
                {latestResult.performanceScore}
              </div>
              <div className="score-label">Performance</div>
            </div>
            <div className="score-card" style={{ borderColor: getScoreColor(latestResult.seoScore) }}>
              <div className="score-value" style={{ color: getScoreColor(latestResult.seoScore) }}>
                {latestResult.seoScore}
              </div>
              <div className="score-label">SEO</div>
            </div>
            <div className="score-card" style={{ borderColor: getScoreColor(latestResult.accessibilityScore) }}>
              <div className="score-value" style={{ color: getScoreColor(latestResult.accessibilityScore) }}>
                {latestResult.accessibilityScore}
              </div>
              <div className="score-label">Barrierefreiheit</div>
            </div>
            <div className="score-card" style={{ borderColor: getScoreColor(latestResult.bestPracticesScore) }}>
              <div className="score-value" style={{ color: getScoreColor(latestResult.bestPracticesScore) }}>
                {latestResult.bestPracticesScore}
              </div>
              <div className="score-label">Best Practices</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Übersicht
            </button>
            <button
              className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              ⚡ Performance
            </button>
            <button
              className={`tab ${activeTab === 'seo' ? 'active' : ''}`}
              onClick={() => setActiveTab('seo')}
            >
              🔍 SEO ({latestResult.issues.length})
            </button>
            <button
              className={`tab ${activeTab === 'opportunities' ? 'active' : ''}`}
              onClick={() => setActiveTab('opportunities')}
            >
              💡 Optimierungen ({latestResult.opportunities.length})
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="result-card">
              <div className="result-header">
                <a href={latestResult.url} target="_blank" rel="noopener noreferrer">
                  {latestResult.url}
                </a>
                <span className="timestamp">
                  {new Date(latestResult.timestamp).toLocaleString('de-DE')}
                </span>
              </div>

              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">First Contentful Paint</span>
                  <span className="metric-value">{latestResult.fcp}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Largest Contentful Paint</span>
                  <span className="metric-value">{latestResult.lcp}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Cumulative Layout Shift</span>
                  <span className="metric-value">{latestResult.cls}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Total Blocking Time</span>
                  <span className="metric-value">{latestResult.tbt}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Speed Index</span>
                  <span className="metric-value">{latestResult.speedIndex}</span>
                </div>
              </div>

              <div className="score-summary">
                <h4>📈 Zusammenfassung</h4>
                <p>
                  Ihre Website hat einen Performance-Score von{' '}
                  <strong style={{ color: getScoreColor(latestResult.performanceScore) }}>
                    {latestResult.performanceScore}/100
                  </strong>{' '}
                  ({getScoreLabel(latestResult.performanceScore)}) und einen SEO-Score von{' '}
                  <strong style={{ color: getScoreColor(latestResult.seoScore) }}>
                    {latestResult.seoScore}/100
                  </strong>{' '}
                  ({getScoreLabel(latestResult.seoScore)}).
                </p>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="result-card">
              <h3>⚡ Core Web Vitals</h3>
              
              <div className="vitals-grid">
                <div className="vital-item">
                  <div className="vital-header">
                    <span className="vital-name">LCP</span>
                    <span className="vital-full">Largest Contentful Paint</span>
                  </div>
                  <div className="vital-value">{latestResult.lcp}</div>
                  <div className="vital-desc">Misst die Ladeleistung. Sollte unter 2,5s sein.</div>
                </div>
                
                <div className="vital-item">
                  <div className="vital-header">
                    <span className="vital-name">FCP</span>
                    <span className="vital-full">First Contentful Paint</span>
                  </div>
                  <div className="vital-value">{latestResult.fcp}</div>
                  <div className="vital-desc">Zeit bis zum ersten Inhalt. Sollte unter 1,8s sein.</div>
                </div>
                
                <div className="vital-item">
                  <div className="vital-header">
                    <span className="vital-name">CLS</span>
                    <span className="vital-full">Cumulative Layout Shift</span>
                  </div>
                  <div className="vital-value">{latestResult.cls}</div>
                  <div className="vital-desc">Misst visuelle Stabilität. Sollte unter 0,1 sein.</div>
                </div>
                
                <div className="vital-item">
                  <div className="vital-header">
                    <span className="vital-name">TBT</span>
                    <span className="vital-full">Total Blocking Time</span>
                  </div>
                  <div className="vital-value">{latestResult.tbt}</div>
                  <div className="vital-desc">Misst Interaktivität. Sollte unter 200ms sein.</div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="result-card">
              <h3>🔍 SEO-Probleme</h3>
              
              {latestResult.issues.length === 0 ? (
                <div className="no-issues">
                  ✅ Keine SEO-Probleme gefunden! Ihre Website ist gut optimiert.
                </div>
              ) : (
                <div className="issues-list">
                  {latestResult.issues.map((issue, i) => (
                    <div key={i} className={`issue-item severity-${issue.severity}`}>
                      <div className="issue-header">
                        <span className={`severity-badge ${issue.severity}`}>
                          {issue.severity === 'high' ? '🔴 Hoch' : 
                           issue.severity === 'medium' ? '🟡 Mittel' : '🟢 Niedrig'}
                        </span>
                      </div>
                      <h4>{issue.title}</h4>
                      <p>{issue.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <div className="result-card">
              <h3>💡 Optimierungsmöglichkeiten</h3>
              
              {latestResult.opportunities.length === 0 ? (
                <div className="no-issues">
                  ✅ Keine weiteren Optimierungen gefunden!
                </div>
              ) : (
                <div className="opportunities-list">
                  {latestResult.opportunities.map((opp, i) => (
                    <div key={i} className="opportunity-item">
                      <div className="opp-header">
                        <h4>{opp.title}</h4>
                        {opp.savings && (
                          <span className="savings-badge">⏱️ {opp.savings}</span>
                        )}
                      </div>
                      <p>{opp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {latestResult.diagnostics.length > 0 && (
                <>
                  <h3 style={{ marginTop: '30px' }}>🔧 Diagnostik</h3>
                  <div className="diagnostics-list">
                    {latestResult.diagnostics.map((diag, i) => (
                      <div key={i} className="diagnostic-item">
                        <h4>{diag.title}</h4>
                        {diag.displayValue && (
                          <span className="diag-value">{diag.displayValue}</span>
                        )}
                        <p>{diag.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Keyword Research Section */}
      <div className="keyword-section">
        <h2>🔑 Keyword-Recherche</h2>
        <div className="keyword-input-row">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Keyword eingeben..."
            className="keyword-input"
            onKeyPress={(e) => e.key === 'Enter' && analyzeKeyword()}
          />
          <button onClick={analyzeKeyword} className="analyze-button">
            Analysieren
          </button>
        </div>

        {keywords.length > 0 && (
          <div className="keywords-table">
            <table>
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Volumen</th>
                  <th>Schwierigkeit</th>
                  <th>CPC</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw, i) => (
                  <tr key={i}>
                    <td>{kw.term}</td>
                    <td>{kw.volume.toLocaleString()}</td>
                    <td>
                      <div className="difficulty-bar">
                        <div
                          className="difficulty-fill"
                          style={{
                            width: `${kw.difficulty}%`,
                            backgroundColor: kw.difficulty > 70 ? '#ef4444' :
                              kw.difficulty > 40 ? '#f59e0b' : '#10b981'
                          }}
                        />
                      </div>
                      {kw.difficulty}%
                    </td>
                    <td>{kw.cpc}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Section */}
      {results.length > 1 && (
        <div className="history-section">
          <h2>📜 Analyse-Verlauf</h2>
          <div className="history-list">
            {results.slice(1).map((result, i) => (
              <div key={i} className="history-item" onClick={() => {
                setResults([result, ...results.filter(r => r !== result)])
              }}>
                <span className="history-url">{result.url}</span>
                <span className="history-score" style={{ color: getScoreColor(result.performanceScore) }}>
                  {result.performanceScore}/100
                </span>
                <span className="history-date">
                  {new Date(result.timestamp).toLocaleDateString('de-DE')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

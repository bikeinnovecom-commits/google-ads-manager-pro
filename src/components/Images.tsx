import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import './Images.css'
import PerformanceOptimizer from './PerformanceOptimizer'

interface ShopifyProduct {
  id: number
  title: string
  handle: string
  vendor: string
  product_type: string
  images: ShopifyImage[]
}

interface ShopifyImage {
  id: number
  product_id: number
  src: string
  alt: string | null
  width: number
  height: number
  position: number
}

interface OptimizationResult {
  imageId: number
  productTitle: string
  originalAlt: string | null
  newAlt: string
  status: 'pending' | 'success' | 'error'
}

interface CompressionResult {
  imageId: number
  productTitle: string
  originalSize: number
  compressedSize: number
  savings: number
  savingsPercent: number
  status: 'pending' | 'success' | 'error' | 'skipped'
}

export default function Images() {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'alt-text' | 'compression' | 'settings' | 'performance'>('overview')
  const [altResults, setAltResults] = useState<OptimizationResult[]>([])
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([])
  const [stats, setStats] = useState({
    totalImages: 0,
    missingAlt: 0,
    optimizedImages: 0,
    totalSavings: 0
  })

  // Shopify API Configuration
  const SHOPIFY_STORE = import.meta.env.VITE_SHOPIFY_STORE || '';
  const ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN || '';

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/shopify-products")

      if (!response.ok) throw new Error('Fehler beim Laden der Produkte')

      const data = await response.json()
      setProducts(data.products)

      // Calculate stats
      let totalImages = 0
      let missingAlt = 0

      data.products.forEach((product: ShopifyProduct) => {
        totalImages += product.images.length
        product.images.forEach((img: ShopifyImage) => {
          if (!img.alt || img.alt.trim() === '') {
            missingAlt++
          }
        })
      })

      // Load saved stats
      const savedStats = localStorage.getItem('image_optimizer_stats')
      const parsedStats = savedStats ? JSON.parse(savedStats) : { optimizedImages: 0, totalSavings: 0 }

      setStats({
        totalImages,
        missingAlt,
        optimizedImages: parsedStats.optimizedImages,
        totalSavings: parsedStats.totalSavings
      })

    } catch (error) {
      console.error('Fehler:', error)
      toast.error('Fehler beim Laden der Produkte')
    } finally {
      setLoading(false)
    }
  }

  // Generate SEO-friendly alt text
  const generateAltText = (product: ShopifyProduct, image: ShopifyImage, position: number): string => {
    const brand = product.vendor || 'Bike Innov'
    const type = product.product_type || 'E-Bike'
    const title = product.title

    // Different patterns based on image position
    const patterns = [
      `${title} - ${brand} ${type}`, // Main image
      `${title} Seitenansicht - ${brand}`,
      `${title} Detailansicht - ${brand}`,
      `${title} in Aktion - ${brand}`,
      `${brand} ${title} Produktbild`,
    ]

    const patternIndex = Math.min(position - 1, patterns.length - 1)
    let altText = patterns[patternIndex]

    // Ensure alt text is not too long (max 125 characters recommended)
    if (altText.length > 125) {
      altText = altText.substring(0, 122) + '...'
    }

    return altText
  }

  // Optimize all alt texts
  const optimizeAllAltTexts = async () => {
    setOptimizing(true)
    const results: OptimizationResult[] = []

    try {
      for (const product of products) {
        for (const image of product.images) {
          if (!image.alt || image.alt.trim() === '') {
            const newAlt = generateAltText(product, image, image.position)

            results.push({
              imageId: image.id,
              productTitle: product.title,
              originalAlt: image.alt,
              newAlt,
              status: 'pending'
            })

            // Update via Shopify API
            try {
              const response = await fetch(
                `https://${SHOPIFY_STORE}/admin/api/2024-01/products/${product.id}/images/${image.id}.json`,
                {
                  method: 'PUT',
                  headers: {
                    'X-Shopify-Access-Token': ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    image: {
                      id: image.id,
                      alt: newAlt
                    }
                  })
                }
              )

              if (response.ok) {
                results[results.length - 1].status = 'success'
              } else {
                results[results.length - 1].status = 'error'
              }
            } catch (error) {
              results[results.length - 1].status = 'error'
            }

            // Rate limiting - wait 500ms between requests
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
      }

      setAltResults(results)
      const successCount = results.filter(r => r.status === 'success').length
      toast.success(`${successCount} Alt-Texte erfolgreich optimiert!`)

      // Update stats
      const newStats = {
        ...stats,
        missingAlt: stats.missingAlt - successCount,
        optimizedImages: stats.optimizedImages + successCount
      }
      setStats(newStats)
      localStorage.setItem('image_optimizer_stats', JSON.stringify(newStats))

      // Reload products to get updated data
      await loadProducts()

    } catch (error) {
      console.error('Fehler bei der Optimierung:', error)
      toast.error('Fehler bei der Alt-Text-Optimierung')
    } finally {
      setOptimizing(false)
    }
  }

  // Preview alt texts before applying
  const previewAltTexts = (): OptimizationResult[] => {
    const previews: OptimizationResult[] = []

    products.forEach(product => {
      product.images.forEach(image => {
        if (!image.alt || image.alt.trim() === '') {
          previews.push({
            imageId: image.id,
            productTitle: product.title,
            originalAlt: image.alt,
            newAlt: generateAltText(product, image, image.position),
            status: 'pending'
          })
        }
      })
    })

    return previews
  }

  // Compress image using Canvas API (client-side)
  const compressImage = async (imageUrl: string, quality: number = 0.8): Promise<{ blob: Blob; savings: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Calculate new dimensions (max 2048px)
        let width = img.width
        let height = img.height
        const maxSize = 2048

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Estimate original size from dimensions
              const originalSize = img.width * img.height * 3 // Rough estimate
              const savings = originalSize - blob.size
              resolve({ blob, savings: Math.max(0, savings) })
            } else {
              reject(new Error('Komprimierung fehlgeschlagen'))
            }
          },
          'image/webp',
          quality
        )
      }

      img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'))
      img.src = imageUrl
    })
  }

  // Analyze images for compression potential
  const analyzeCompression = async () => {
    setOptimizing(true)
    const results: CompressionResult[] = []

    try {
      for (const product of products) {
        for (const image of product.images) {
          // Estimate file size from dimensions
          const estimatedSize = image.width * image.height * 3 // RGB bytes

          // Check if image is already optimized (WebP or small)
          const isWebP = image.src.toLowerCase().includes('.webp')
          const isSmall = estimatedSize < 100000 // Less than 100KB

          if (isWebP || isSmall) {
            results.push({
              imageId: image.id,
              productTitle: product.title,
              originalSize: estimatedSize,
              compressedSize: estimatedSize,
              savings: 0,
              savingsPercent: 0,
              status: 'skipped'
            })
          } else {
            // Estimate 40-60% compression for non-WebP images
            const estimatedSavings = estimatedSize * 0.5
            results.push({
              imageId: image.id,
              productTitle: product.title,
              originalSize: estimatedSize,
              compressedSize: estimatedSize - estimatedSavings,
              savings: estimatedSavings,
              savingsPercent: 50,
              status: 'pending'
            })
          }
        }
      }

      setCompressionResults(results)

      const totalSavings = results.reduce((sum, r) => sum + r.savings, 0)
      toast.success(`Analyse abgeschlossen! Mögliche Einsparung: ${formatBytes(totalSavings)}`)

    } catch (error) {
      console.error('Fehler bei der Analyse:', error)
      toast.error('Fehler bei der Bildanalyse')
    } finally {
      setOptimizing(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getScoreColor = (percent: number): string => {
    if (percent >= 80) return '#10b981'
    if (percent >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const optimizedPercent = stats.totalImages > 0
    ? Math.round(((stats.totalImages - stats.missingAlt) / stats.totalImages) * 100)
    : 100

  return (
    <div className="image-optimizer-container">
      <h1>🖼️ Bild-Optimierung</h1>
      <p className="subtitle">Komprimierung & Alt-Text-Optimierung für besseres SEO</p>

      {/* Stats Overview */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.totalImages}</div>
          <div className="stat-label">Gesamte Bilder</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{stats.missingAlt}</div>
          <div className="stat-label">Fehlende Alt-Texte</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{stats.optimizedImages}</div>
          <div className="stat-label">Optimiert</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatBytes(stats.totalSavings)}</div>
          <div className="stat-label">Gespart</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="optimization-progress">
        <div className="progress-header">
          <span>Optimierungsfortschritt</span>
          <span style={{ color: getScoreColor(optimizedPercent) }}>{optimizedPercent}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${optimizedPercent}%`,
              backgroundColor: getScoreColor(optimizedPercent)
            }}
          />
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
          className={`tab ${activeTab === 'alt-text' ? 'active' : ''}`}
          onClick={() => setActiveTab('alt-text')}
        >
          ✏️ Alt-Texte ({stats.missingAlt})
        </button>
        <button
          className={`tab ${activeTab === 'compression' ? 'active' : ''}`}
          onClick={() => setActiveTab('compression')}
        >
          📦 Komprimierung
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Einstellungen
            </button>            <button
              className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              ⚡ Performance
            </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Lade Produkte aus Shopify...</p>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && !loading && (
        <div className="tab-content">
          <div className="overview-grid">
            <div className="overview-card">
              <h3>🎯 Alt-Text-Status</h3>
              <div className="donut-chart">
                <svg viewBox="0 0 36 36" className="donut">
                  <path
                    className="donut-ring"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#333"
                    strokeWidth="3"
                  />
                  <path
                    className="donut-segment"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${optimizedPercent}, 100`}
                  />
                </svg>
                <div className="donut-text">{optimizedPercent}%</div>
              </div>
              <p>{stats.totalImages - stats.missingAlt} von {stats.totalImages} Bildern haben Alt-Texte</p>
            </div>

            <div className="overview-card">
              <h3>⚡ Schnellaktionen</h3>
              <button
                className="action-button primary"
                onClick={optimizeAllAltTexts}
                disabled={optimizing || stats.missingAlt === 0}
              >
                {optimizing ? '⏳ Optimiere...' : `✨ Alle ${stats.missingAlt} Alt-Texte optimieren`}
              </button>
              <button
                className="action-button secondary"
                onClick={analyzeCompression}
                disabled={optimizing}
              >
                📊 Komprimierungspotenzial analysieren
              </button>
              <button
                className="action-button secondary"
                onClick={loadProducts}
                disabled={loading}
              >
                🔄 Produkte neu laden
              </button>
            </div>

            <div className="overview-card full-width">
              <h3>📋 Produkte ohne Alt-Texte</h3>
              <div className="products-list">
                {products
                  .filter(p => p.images.some(img => !img.alt || img.alt.trim() === ''))
                  .slice(0, 5)
                  .map(product => (
                    <div key={product.id} className="product-item">
                      <img
                        src={product.images[0]?.src || ''}
                        alt={product.title}
                        className="product-thumb"
                      />
                      <div className="product-info">
                        <span className="product-title">{product.title}</span>
                        <span className="product-missing">
                          {product.images.filter(img => !img.alt || img.alt.trim() === '').length} Bilder ohne Alt-Text
                        </span>
                      </div>
                    </div>
                  ))}
                {products.filter(p => p.images.some(img => !img.alt || img.alt.trim() === '')).length === 0 && (
                  <div className="no-issues">✅ Alle Bilder haben Alt-Texte!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alt-Text Tab */}
      {activeTab === 'alt-text' && !loading && (
        <div className="tab-content">
          <div className="alt-text-section">
            <div className="section-header">
              <h3>✏️ Alt-Text-Optimierung</h3>
              <button
                className="action-button primary"
                onClick={optimizeAllAltTexts}
                disabled={optimizing || stats.missingAlt === 0}
              >
                {optimizing ? '⏳ Optimiere...' : `✨ Alle optimieren (${stats.missingAlt})`}
              </button>
            </div>

            {/* Preview of changes */}
            <div className="preview-section">
              <h4>Vorschau der Änderungen</h4>
              <div className="preview-list">
                {previewAltTexts().slice(0, 10).map((preview, i) => (
                  <div key={i} className="preview-item">
                    <div className="preview-product">{preview.productTitle}</div>
                    <div className="preview-change">
                      <span className="old-value">{preview.originalAlt || '(leer)'}</span>
                      <span className="arrow">→</span>
                      <span className="new-value">{preview.newAlt}</span>
                    </div>
                  </div>
                ))}
                {previewAltTexts().length > 10 && (
                  <div className="more-items">
                    ... und {previewAltTexts().length - 10} weitere
                  </div>
                )}
                {previewAltTexts().length === 0 && (
                  <div className="no-issues">✅ Alle Bilder haben bereits Alt-Texte!</div>
                )}
              </div>
            </div>

            {/* Results */}
            {altResults.length > 0 && (
              <div className="results-section">
                <h4>Ergebnisse</h4>
                <div className="results-summary">
                  <span className="success-count">
                    ✅ {altResults.filter(r => r.status === 'success').length} erfolgreich
                  </span>
                  <span className="error-count">
                    ❌ {altResults.filter(r => r.status === 'error').length} fehlgeschlagen
                  </span>
                </div>
                <div className="results-list">
                  {altResults.map((result, i) => (
                    <div key={i} className={`result-item ${result.status}`}>
                      <span className="status-icon">
                        {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳'}
                      </span>
                      <span className="product-name">{result.productTitle}</span>
                      <span className="new-alt">{result.newAlt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compression Tab */}
      {activeTab === 'compression' && !loading && (
        <div className="tab-content">
          <div className="compression-section">
            <div className="section-header">
              <h3>📦 Bildkomprimierung</h3>
              <button
                className="action-button primary"
                onClick={analyzeCompression}
                disabled={optimizing}
              >
                {optimizing ? '⏳ Analysiere...' : '🔍 Analysieren'}
              </button>
            </div>

            <div className="compression-info">
              <div className="info-card">
                <h4>ℹ️ Hinweis zur Komprimierung</h4>
                <p>
                  Die Bildkomprimierung in Shopify erfordert das erneute Hochladen der Bilder.
                  Für eine automatische Komprimierung empfehlen wir:
                </p>
                <ul>
                  <li>Bilder vor dem Upload mit <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer">TinyPNG</a> komprimieren (kostenlos)</li>
                  <li>WebP-Format verwenden für beste Ergebnisse</li>
                  <li>Maximale Größe: 2048x2048 Pixel</li>
                </ul>
              </div>
            </div>

            {compressionResults.length > 0 && (
              <div className="compression-results">
                <h4>Analyse-Ergebnisse</h4>
                <div className="compression-summary">
                  <div className="summary-item">
                    <span className="summary-label">Gesamte Bilder</span>
                    <span className="summary-value">{compressionResults.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Optimierbar</span>
                    <span className="summary-value">
                      {compressionResults.filter(r => r.status === 'pending').length}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Mögliche Einsparung</span>
                    <span className="summary-value highlight">
                      {formatBytes(compressionResults.reduce((sum, r) => sum + r.savings, 0))}
                    </span>
                  </div>
                </div>

                <div className="compression-list">
                  {compressionResults
                    .filter(r => r.status === 'pending')
                    .slice(0, 10)
                    .map((result, i) => (
                      <div key={i} className="compression-item">
                        <span className="product-name">{result.productTitle}</span>
                        <div className="compression-details">
                          <span className="original-size">{formatBytes(result.originalSize)}</span>
                          <span className="arrow">→</span>
                          <span className="compressed-size">{formatBytes(result.compressedSize)}</span>
                          <span className="savings-badge">-{result.savingsPercent}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && !loading && (
        <div className="tab-content">
          <div className="settings-section">
            <h3>⚙️ Einstellungen</h3>
            </button>
            <div className="settings-card">
              <h4>Alt-Text-Muster</h4>
              <p>Die Alt-Texte werden automatisch nach folgendem Muster generiert:</p>
              <div className="pattern-examples">
                <div className="pattern-item">
                  <span className="pattern-label">Hauptbild:</span>
                  <code>[Produktname] - [Marke] [Typ]</code>
                </div>
                <div className="pattern-item">
                  <span className="pattern-label">Bild 2:</span>
                  <code>[Produktname] Seitenansicht - [Marke]</code>
                </div>
                <div className="pattern-item">
                  <span className="pattern-label">Bild 3:</span>
                  <code>[Produktname] Detailansicht - [Marke]</code>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h4>Shopify-Verbindung</h4>
              <div className="connection-status connected">
                <span className="status-dot"></span>
                <span>Verbunden mit {SHOPIFY_STORE}</span>
              </div>
              <p className="connection-info">
                {products.length} Produkte geladen, {stats.totalImages} Bilder gefunden
              </p>
            </div>

            <div className="settings-card">
              <h4>Daten zurücksetzen</h4>
              <button
                className="action-button danger"
                onClick={() => {
                  localStorage.removeItem('image_optimizer_stats')
                  setStats(prev => ({ ...prev, optimizedImages: 0, totalSavings: 0 }))
                  setAltResults([])
                  setCompressionResults([])
                  toast.success('Statistiken zurückgesetzt')
                }}
              >
                🗑️ Statistiken zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

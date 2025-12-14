import React, { useState, useEffect } from 'react';
import { scanPageSpeed } from './pageSpeedAPI';
import { optimizeImages, getOptimizationStats } from './imageOptimizer';
import './PerformanceOptimizer.css';

interface PageSpeedResult {
  url: string;
  scoreOriginal: number;
  scoreOptimized: number;
  timestamp: string;
  improvements: {
    imagesOptimized: number;
    lazyLoadingAdded: number;
    altTextsGenerated: number;
    webpConverted: number;
  };
}

export default function PerformanceOptimizer() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanning, setScanning] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [results, setResults] = useState<PageSpeedResult | null>(null);
  const [storeUrl, setStoreUrl] = useState('bike-innov.com');
  const [history, setHistory] = useState<PageSpeedResult[]>([]);

  // Charger l'historique au montage
  useEffect(() => {
    const saved = localStorage.getItem('pageSpeedHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder l'historique
  const saveToHistory = (result: PageSpeedResult) => {
    const updated = [result, ...history].slice(0, 10); // Garder les 10 derniers
    setHistory(updated);
    localStorage.setItem('pageSpeedHistory', JSON.stringify(updated));
  };

  // SCANNER PageSpeed Insights
  const handleScan = async () => {
    setScanning(true);
    try {
      const url = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
      const pageSpeedScore = await scanPageSpeed(url);
      
      const result: PageSpeedResult = {
        url: url,
        scoreOriginal: pageSpeedScore,
        scoreOptimized: 0, // Sera mis à jour après optimisation
        timestamp: new Date().toISOString(),
        improvements: {
          imagesOptimized: 0,
          lazyLoadingAdded: 0,
          altTextsGenerated: 0,
          webpConverted: 0
        }
      };

      setResults(result);
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      alert('Erreur: Impossible de scanner PageSpeed Insights');
    } finally {
      setScanning(false);
    }
  };

  // OPTIMISER les images
  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const stats = await optimizeImages(storeUrl);
      
      // Faire un 2e scan pour voir l'amélioration
      const url = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
      const newScore = await scanPageSpeed(url);

      if (results) {
        const updatedResult: PageSpeedResult = {
          ...results,
          scoreOptimized: newScore,
          improvements: stats
        };
        setResults(updatedResult);
        saveToHistory(updatedResult);
      }
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      alert('Erreur: Impossible d\'optimiser les images');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="performance-optimizer">
      <div className="optimizer-header">
        <h1>⚡ Performance Optimizer</h1>
        <p>Optimisez vos performances PageSpeed Insights sans modifier Shopify</p>
      </div>

      {/* TABS */}
      <div className="optimizer-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'optimize' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimize')}
        >
          🔧 Optimiser
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📈 Historique
        </button>
      </div>

      {/* TAB: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="tab-content dashboard-tab">
          <div className="scan-section">
            <h2>🔍 Scanner PageSpeed Insights</h2>
            <div className="input-group">
              <input
                type="text"
                placeholder="Entrez votre domaine (ex: bike-innov.com)"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
              />
              <button 
                onClick={handleScan} 
                disabled={scanning}
                className="btn-primary"
              >
                {scanning ? '⏳ Scan en cours...' : '🔍 Scanner'}
              </button>
            </div>
          </div>

          {results && (
            <div className="results-section">
              <div className="score-card original">
                <h3>Score Original</h3>
                <div className="score-display">{results.scoreOriginal}</div>
                <p>/100</p>
              </div>

              {results.scoreOptimized > 0 ? (
                <>
                  <div className="arrow">→</div>
                  <div className="score-card optimized">
                    <h3>Score Optimisé</h3>
                    <div className="score-display">{results.scoreOptimized}</div>
                    <p>/100</p>
                    <div className="gain">
                      +{results.scoreOptimized - results.scoreOriginal} points
                    </div>
                  </div>
                </>
              ) : (
                <div className="optimize-prompt">
                  <p>Cliquez sur "Optimiser" pour améliorer les performances</p>
                  <button 
                    onClick={handleOptimize} 
                    disabled={optimizing}
                    className="btn-large"
                  >
                    {optimizing ? '⏳ Optimisation en cours...' : '✨ Optimiser'}
                  </button>
                </div>
              )}
            </div>
          )}

          {results && results.scoreOptimized > 0 && (
            <div className="improvements-section">
              <h3>🎯 Améliorations Appliquées</h3>
              <div className="improvements-grid">
                <div className="improvement-card">
                  <span className="icon">🖼️</span>
                  <p>{results.improvements.imagesOptimized}</p>
                  <p>Images compressées</p>
                </div>
                <div className="improvement-card">
                  <span className="icon">⚡</span>
                  <p>{results.improvements.lazyLoadingAdded}</p>
                  <p>Lazy loading ajouté</p>
                </div>
                <div className="improvement-card">
                  <span className="icon">📝</span>
                  <p>{results.improvements.altTextsGenerated}</p>
                  <p>Alt text générés</p>
                </div>
                <div className="improvement-card">
                  <span className="icon">🎨</span>
                  <p>{results.improvements.webpConverted}</p>
                  <p>WebP convertis</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: OPTIMIZE */}
      {activeTab === 'optimize' && (
        <div className="tab-content optimize-tab">
          <h2>🔧 Optimiser les Images</h2>
          <div className="optimize-info">
            <p>Cette section optimisera automatiquement :</p>
            <ul>
              <li>✅ Compression des images via TinyPNG</li>
              <li>✅ Conversion en format WebP</li>
              <li>✅ Ajout du lazy loading</li>
              <li>✅ Génération des alt text manquants</li>
            </ul>
          </div>
          <button 
            onClick={handleOptimize} 
            disabled={optimizing || !results}
            className="btn-large"
          >
            {optimizing ? '⏳ Optimisation en cours...' : '✨ Démarrer l\'optimisation'}
          </button>
        </div>
      )}

      {/* TAB: HISTORY */}
      {activeTab === 'history' && (
        <div className="tab-content history-tab">
          <h2>📈 Historique des Optimisations</h2>
          {history.length === 0 ? (
            <p className="no-history">Aucune optimisation effectuée pour le moment</p>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-url">{item.url}</div>
                  <div className="history-scores">
                    <span className="original">📊 {item.scoreOriginal}</span>
                    <span className="arrow">→</span>
                    <span className="optimized">✨ {item.scoreOptimized}</span>
                    <span className="gain">+{item.scoreOptimized - item.scoreOriginal}</span>
                  </div>
                  <div className="history-date">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

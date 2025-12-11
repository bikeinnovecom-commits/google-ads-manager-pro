import { useState } from 'react';
import './PageSpeedAnalyzer.css';

interface LighthouseResult {
  categories: {
    performance?: { score: number };
    accessibility?: { score: number };
    'best-practices'?: { score: number };
    seo?: { score: number };
  };
  audits: {
    [key: string]: {
      score: number | null;
      title: string;
      displayValue?: string;
      numericValue?: number;
    };
  };
  finalUrl?: string;
}

interface AnalysisResults {
  mobile: { lighthouseResult: LighthouseResult };
  desktop: { lighthouseResult: LighthouseResult };
}

const PageSpeedAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');

  const API_KEY = 'AIzaSyCfE3K-7GwBDKA_8DMcFKjO_CCZbBRCYDE';

  const analyzeUrl = async () => {
    if (!url) {
      setError('Veuillez entrer une URL');
      return;
    }
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const mobileResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(formattedUrl)}&key=${API_KEY}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`
      );
      const mobileData = await mobileResponse.json();
      const desktopResponse = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(formattedUrl)}&key=${API_KEY}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo`
      );
      const desktopData = await desktopResponse.json();
      if (mobileData.error) {
        throw new Error(mobileData.error.message);
      }
      setResults({ mobile: mobileData, desktop: desktopData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#0cce6b';
    if (score >= 50) return '#ffa400';
    return '#ff4e42';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 50) return 'À améliorer';
    return 'Faible';
  };

  const ScoreCircle = ({ score, label }: { score: number; label: string }) => {
    const percentage = score * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const color = getScoreColor(percentage);
    return (
      <div className="score-circle-container">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1a2e" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} transform="rotate(-90 50 50)" style={{ filter: `drop-shadow(0 0 8px ${color}50)` }} className="score-circle-progress" />
          <text x="50" y="50" textAnchor="middle" dy="0.3em" className="score-text" style={{ fill: color }}>{Math.round(percentage)}</text>
        </svg>
        <div className="score-label">{label}</div>
        <div className="score-status" style={{ color }}>{getScoreLabel(percentage)}</div>
      </div>
    );
  };

  const MetricCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-description">{description}</div>
    </div>
  );

  const formatTime = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms)}ms`;
  };

  const currentData = results ? results[activeTab] : null;
  const lighthouse = currentData?.lighthouseResult;

  return (
    <div className="pagespeed-analyzer">
      <div className="pagespeed-header">
        <div className="pagespeed-title-row">
          <div className="pagespeed-icon">🚀</div>
          <h1>PageSpeed Analyzer</h1>
        </div>
        <p>Analysez les performances et le SEO de n'importe quel site web</p>
      </div>
      <div className="search-box">
        <div className="search-input-row">
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && analyzeUrl()} placeholder="Entrez l'URL du site (ex: bike-innov.com)" className="url-input" />
          <button onClick={analyzeUrl} disabled={loading} className="analyze-btn">
            {loading ? (<><div className="spinner" />Analyse...</>) : (<><span>🔍</span>Analyser</>)}
          </button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
      </div>
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Analyse en cours... Cela peut prendre 30-60 secondes</p>
        </div>
      )}
      {results && lighthouse && (
        <div className="results-container">
          <div className="url-info">
            <div className="url-label">Site analysé</div>
            <div className="url-value">{lighthouse.finalUrl || url}</div>
          </div>
          <div className="device-tabs">
            <button onClick={() => setActiveTab('mobile')} className={`device-tab ${activeTab === 'mobile' ? 'active' : ''}`}>📱 Mobile</button>
            <button onClick={() => setActiveTab('desktop')} className={`device-tab ${activeTab === 'desktop' ? 'active' : ''}`}>💻 Desktop</button>
          </div>
          <div className="scores-grid">
            <ScoreCircle score={lighthouse.categories?.performance?.score || 0} label="Performance" />
            <ScoreCircle score={lighthouse.categories?.accessibility?.score || 0} label="Accessibilité" />
            <ScoreCircle score={lighthouse.categories?.['best-practices']?.score || 0} label="Bonnes Pratiques" />
            <ScoreCircle score={lighthouse.categories?.seo?.score || 0} label="SEO" />
          </div>
          <h2 className="section-title">📊 Core Web Vitals</h2>
          <div className="metrics-grid">
            <MetricCard title="First Contentful Paint" value={formatTime(lighthouse.audits?.['first-contentful-paint']?.numericValue || 0)} description="Premier affichage" />
            <MetricCard title="Largest Contentful Paint" value={formatTime(lighthouse.audits?.['largest-contentful-paint']?.numericValue || 0)} description="Plus grand élément" />
            <MetricCard title="Total Blocking Time" value={formatTime(lighthouse.audits?.['total-blocking-time']?.numericValue || 0)} description="Temps de blocage" />
            <MetricCard title="Cumulative Layout Shift" value={(lighthouse.audits?.['cumulative-layout-shift']?.numericValue || 0).toFixed(3)} description="Décalage layout" />
            <MetricCard title="Speed Index" value={formatTime(lighthouse.audits?.['speed-index']?.numericValue || 0)} description="Indice vitesse" />
            <MetricCard title="Time to Interactive" value={formatTime(lighthouse.audits?.['interactive']?.numericValue || 0)} description="Interactivité" />
          </div>
          <h2 className="section-title">💡 Opportunités d'amélioration</h2>
          <div className="opportunities-list">
            {Object.entries(lighthouse.audits).filter(([key, audit]) => audit.score !== null && audit.score < 0.9 && audit.title && !['screenshot-thumbnails', 'final-screenshot', 'script-treemap-data'].includes(key)).slice(0, 10).map(([key, audit], index) => (
              <div key={key} className={`opportunity-item ${index < 9 ? 'with-border' : ''}`}>
                <div className="opportunity-dot" style={{ background: getScoreColor((audit.score || 0) * 100) }} />
                <div className="opportunity-content">
                  <div className="opportunity-title">{audit.title}</div>
                  {audit.displayValue && <div className="opportunity-value">{audit.displayValue}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageSpeedAnalyzer;

import { useState, useEffect } from 'react';
import './ImageOptimizer.css';

interface ProductImage {
  id: string;
  productTitle: string;
  imageUrl: string;
  originalSize: number;
  optimizedSize: number | null;
  status: 'pending' | 'optimizing' | 'optimized' | 'error';
  savings: number;
}

// Données de démonstration basées sur vos produits Bike Innov
const demoProducts: ProductImage[] = [
  {
    id: '1',
    productTitle: 'Faltbares Mini E-Bike. Starke Leistung im ultrakompakten Design.',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0xxx/xxxx/products/fatbares-mini.jpg',
    originalSize: 524288,
    optimizedSize: null,
    status: 'pending',
    savings: 0
  },
  {
    id: '2',
    productTitle: 'Carbon Mountain E-Bike',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0xxx/xxxx/products/carbon-mountain.jpg',
    originalSize: 412000,
    optimizedSize: 383160,
    status: 'optimized',
    savings: 7
  },
  {
    id: '3',
    productTitle: 'Cargo E-Bike Orange',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0xxx/xxxx/products/cargo-orange.jpg',
    originalSize: 389000,
    optimizedSize: 354010,
    status: 'optimized',
    savings: 9
  },
  {
    id: '4',
    productTitle: 'LED Display E-Bike',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0xxx/xxxx/products/led-display.jpg',
    originalSize: 456000,
    optimizedSize: 419520,
    status: 'optimized',
    savings: 8
  },
  {
    id: '5',
    productTitle: 'Mountain E-Bike Grau',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0xxx/xxxx/products/mountain-grau.jpg',
    originalSize: 512000,
    optimizedSize: 435200,
    status: 'optimized',
    savings: 15
  },
  {
    id: '6',
    productTitle: 'Lastenrad E-Bike mit 2 Rädern kaufen | 150kg Zuladung',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0xxx/xxxx/products/lastenrad.jpg',
    originalSize: 478000,
    optimizedSize: 391960,
    status: 'optimized',
    savings: 18
  }
];

const ImageOptimizer = () => {
  const [products, setProducts] = useState<ProductImage[]>(demoProducts);
  const [filter, setFilter] = useState<'all' | 'optimized' | 'pending'>('all');
  const [totalCredits] = useState(50);
  const [usedCredits, setUsedCredits] = useState(5);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'optimized') return p.status === 'optimized';
    if (filter === 'pending') return p.status === 'pending';
    return true;
  });

  const optimizeImage = async (id: string) => {
    if (usedCredits >= totalCredits) {
      alert('Keine Bildkontingent mehr verfügbar!');
      return;
    }

    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'optimizing' as const } : p
    ));

    // Simulation d'optimisation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const savings = Math.floor(Math.random() * 20) + 5;
    
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const optimizedSize = Math.floor(p.originalSize * (1 - savings / 100));
        return {
          ...p,
          status: 'optimized' as const,
          optimizedSize,
          savings
        };
      }
      return p;
    }));

    setUsedCredits(prev => prev + 1);
  };

  const optimizeAll = async () => {
    const pendingImages = products.filter(p => p.status === 'pending');
    
    if (pendingImages.length === 0) {
      alert('Alle Bilder sind bereits optimiert!');
      return;
    }

    if (usedCredits + pendingImages.length > totalCredits) {
      alert('Nicht genügend Bildkontingent!');
      return;
    }

    setIsOptimizing(true);

    for (const image of pendingImages) {
      await optimizeImage(image.id);
    }

    setIsOptimizing(false);
  };

  const restoreImage = (id: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'pending' as const, optimizedSize: null, savings: 0 } : p
    ));
  };

  const totalSavings = products
    .filter(p => p.status === 'optimized')
    .reduce((acc, p) => acc + (p.originalSize - (p.optimizedSize || p.originalSize)), 0);

  const optimizedCount = products.filter(p => p.status === 'optimized').length;
  const pendingCount = products.filter(p => p.status === 'pending').length;

  return (
    <div className="image-optimizer">
      <div className="optimizer-header">
        <h1>🖼️ Bildoptimierung</h1>
        <p>Optimieren Sie Ihre Produktbilder für bessere Ladezeiten und SEO</p>
      </div>

      <div className="optimizer-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{products.length}</span>
            <span className="stat-label">Produkte</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{optimizedCount}</span>
            <span className="stat-label">Optimiert</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">Ausstehend</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-info">
            <span className="stat-value">{formatBytes(totalSavings)}</span>
            <span className="stat-label">Gespeichert</span>
          </div>
        </div>
      </div>

      <div className="optimizer-credits">
        <div className="credits-info">
          <span>ℹ️ Bildkontingent – <strong>{totalCredits - usedCredits}</strong> Bilder verfügbar</span>
        </div>
        <div className="credits-info">
          <span>↻ Wiederherstellungszeitraum – <strong>30</strong> Tage nach der Optimierung</span>
        </div>
      </div>

      <div className="optimizer-actions">
        <div className="filter-tabs">
          <button 
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Alle
          </button>
          <button 
            className={`tab ${filter === 'optimized' ? 'active' : ''}`}
            onClick={() => setFilter('optimized')}
          >
            Optimiert
          </button>
          <button 
            className={`tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Ausstehend
          </button>
        </div>
        <button 
          className="btn-optimize-all"
          onClick={optimizeAll}
          disabled={isOptimizing || pendingCount === 0}
        >
          {isOptimizing ? '⏳ Optimierung läuft...' : '🚀 Alle optimieren'}
        </button>
      </div>

      <div className="products-list">
        <div className="list-header">
          <span>{filteredProducts.length} Produkte werden angezeigt</span>
        </div>

        {filteredProducts.map(product => (
          <div key={product.id} className="product-row">
            <div className="product-info">
              <div className="product-image">
                <div className="image-placeholder">🚲</div>
              </div>
              <div className="product-details">
                <h3>{product.productTitle}</h3>
                <div className="size-info">
                  <span>Original: {formatBytes(product.originalSize)}</span>
                  {product.optimizedSize && (
                    <span> → Optimiert: {formatBytes(product.optimizedSize)}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="product-status">
              {product.status === 'optimized' && (
                <>
                  <span className="badge badge-success">Vollständig</span>
                  <span className="savings-text">Gespeichert: {product.savings}%</span>
                </>
              )}
              {product.status === 'pending' && (
                <span className="badge badge-pending">Nicht optimiert</span>
              )}
              {product.status === 'optimizing' && (
                <span className="badge badge-optimizing">⏳ Optimierung...</span>
              )}
            </div>
            <div className="product-actions">
              {product.status === 'pending' && (
                <button 
                  className="btn-action btn-optimize"
                  onClick={() => optimizeImage(product.id)}
                >
                  Optimieren
                </button>
              )}
              {product.status === 'optimized' && (
                <button 
                  className="btn-action btn-restore"
                  onClick={() => restoreImage(product.id)}
                >
                  Wiederherstellen
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageOptimizer;

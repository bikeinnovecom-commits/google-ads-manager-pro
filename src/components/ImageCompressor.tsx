import { useState, useCallback } from 'react';
import './ImageCompressor.css';

interface CompressedImage {
  id: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  originalUrl: string;
  compressedUrl: string;
  savings: number;
}

const ImageCompressor = () => {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(80);

  const compressImage = useCallback((file: File): Promise<CompressedImage> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large (max 1200px)
          const maxSize = 1200;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedUrl = URL.createObjectURL(blob);
                const savings = Math.round((1 - blob.size / file.size) * 100);
                
                resolve({
                  id: Math.random().toString(36).substr(2, 9),
                  originalName: file.name,
                  originalSize: file.size,
                  compressedSize: blob.size,
                  originalUrl: e.target?.result as string,
                  compressedUrl,
                  savings: Math.max(0, savings)
                });
              }
            },
            'image/webp',
            quality / 100
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, [quality]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    const compressed = await Promise.all(files.map(compressImage));
    
    setImages(prev => [...prev, ...compressed]);
    setLoading(false);
  }, [compressImage]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLoading(true);
    
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    const compressed = await Promise.all(files.map(compressImage));
    
    setImages(prev => [...prev, ...compressed]);
    setLoading(false);
  }, [compressImage]);

  const downloadImage = (image: CompressedImage) => {
    const link = document.createElement('a');
    link.href = image.compressedUrl;
    link.download = image.originalName.replace(/\.[^.]+$/, '.webp');
    link.click();
  };

  const downloadAll = () => {
    images.forEach(img => downloadImage(img));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setImages([]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const totalOriginal = images.reduce((acc, img) => acc + img.originalSize, 0);
  const totalCompressed = images.reduce((acc, img) => acc + img.compressedSize, 0);
  const totalSavings = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

  return (
    <div className="image-compressor">
      <div className="compressor-header">
        <div className="compressor-title-row">
          <div className="compressor-icon">🗜️</div>
          <h1>Image Compressor</h1>
        </div>
        <p>Compressez vos images en WebP pour améliorer les performances</p>
      </div>

      <div className="quality-control">
        <label>Qualité: {quality}%</label>
        <input
          type="range"
          min="10"
          max="100"
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
        />
        <span className="quality-hint">
          {quality >= 80 ? '🟢 Haute qualité' : quality >= 50 ? '🟡 Équilibré' : '🔴 Compression max'}
        </span>
      </div>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="drop-content">
          <span className="drop-icon">📁</span>
          <p>Glissez-déposez vos images ici</p>
          <span className="drop-or">ou</span>
          <label className="file-select-btn">
            Sélectionner des fichiers
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              hidden
            />
          </label>
        </div>
      </div>

      {loading && (
        <div className="loading-bar">
          <div className="loading-spinner"></div>
          <span>Compression en cours...</span>
        </div>
      )}

      {images.length > 0 && (
        <>
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-label">Images</span>
              <span className="stat-value">{images.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Original</span>
              <span className="stat-value">{formatSize(totalOriginal)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Compressé</span>
              <span className="stat-value">{formatSize(totalCompressed)}</span>
            </div>
            <div className="stat highlight">
              <span className="stat-label">Économie</span>
              <span className="stat-value">{totalSavings}%</span>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={downloadAll} className="btn-primary">
              ⬇️ Télécharger tout ({images.length})
            </button>
            <button onClick={clearAll} className="btn-secondary">
              🗑️ Tout effacer
            </button>
          </div>

          <div className="images-grid">
            {images.map((image) => (
              <div key={image.id} className="image-card">
                <div className="image-preview">
                  <img src={image.compressedUrl} alt={image.originalName} />
                </div>
                <div className="image-info">
                  <span className="image-name">{image.originalName}</span>
                  <div className="image-sizes">
                    <span className="size-original">{formatSize(image.originalSize)}</span>
                    <span className="size-arrow">→</span>
                    <span className="size-compressed">{formatSize(image.compressedSize)}</span>
                  </div>
                  <div className="image-savings">
                    <span className={`savings-badge ${image.savings > 50 ? 'high' : image.savings > 20 ? 'medium' : 'low'}`}>
                      -{image.savings}%
                    </span>
                  </div>
                </div>
                <div className="image-actions">
                  <button onClick={() => downloadImage(image)} className="btn-download">⬇️</button>
                  <button onClick={() => removeImage(image.id)} className="btn-remove">✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCompressor;

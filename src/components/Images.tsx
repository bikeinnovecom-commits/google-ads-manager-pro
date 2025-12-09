import { useState } from 'react'

export default function Images() {
  const [images, setImages] = useState([
    { name: 'hero-banner.jpg', size: '2.4 MB', status: 'warning', suggestion: 'Compresser' },
    { name: 'product-1.png', size: '890 KB', status: 'warning', suggestion: 'Convertir en WebP' },
    { name: 'product-2.webp', size: '120 KB', status: 'good', suggestion: 'Optimise' },
    { name: 'collection-bg.jpg', size: '3.1 MB', status: 'bad', suggestion: 'Trop lourd' },
    { name: 'logo.svg', size: '12 KB', status: 'good', suggestion: 'Optimise' },
  ])

  const handleFix = (index: number) => {
    const updated = [...images]
    updated[index] = { ...updated[index], status: 'good', suggestion: 'Corrige!', size: '150 KB' }
    setImages(updated)
  }

  return (
    <div className="page">
      <h1>Images</h1>
      <p className="subtitle">Analysez et optimisez les images</p>
      <div className="stats-row">
        <div className="stat-box">5 images</div>
        <div className="stat-box">8.2 MB total</div>
        <div className="stat-box warning">{images.filter(i => i.status !== 'good').length} a optimiser</div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Image</th><th>Taille</th><th>Statut</th><th>Suggestion</th><th>Action</th></tr>
          </thead>
          <tbody>
            {images.map((img, i) => (
              <tr key={i}>
                <td>{img.name}</td>
                <td>{img.size}</td>
                <td className={img.status === 'good' ? 'text-good' : 'text-warning'}>{img.status}</td>
                <td>{img.suggestion}</td>
                <td>
                  {img.status !== 'good' && (
                    <button className="btn-fix" onClick={() => handleFix(i)}>Corriger</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

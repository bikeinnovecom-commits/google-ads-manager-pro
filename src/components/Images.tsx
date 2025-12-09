import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Images() {
  const [images, setImages] = useState([
    { name: 'hero-banner.jpg', size: '2.4 MB', status: 'warning', suggestion: 'Compresser' },
    { name: 'product-1.png', size: '890 KB', status: 'warning', suggestion: 'Convertir en WebP' },
    { name: 'product-2.webp', size: '120 KB', status: 'good', suggestion: 'Optimisé' },
    { name: 'collection-bg.jpg', size: '3.1 MB', status: 'bad', suggestion: 'Trop lourd' },
    { name: 'logo.svg', size: '12 KB', status: 'good', suggestion: 'Optimisé' },
  ])

  // Charger les corrections depuis Supabase au démarrage
  useEffect(() => {
    loadCorrections()
  }, [])

  const loadCorrections = async () => {
    const { data } = await supabase
      .from('shopify_corrections')
      .select('*')
      .eq('item_type', 'image')
    
    if (data && data.length > 0) {
      setImages(prev => prev.map(img => {
        const correction = data.find(c => c.item_name === img.name)
        if (correction) {
          return { ...img, status: 'good', suggestion: 'Corrigé' }
        }
        return img
      }))
    }
  }

  const handleFix = async (index: number) => {
    const img = images[index]
    
    // Sauvegarder dans Supabase
    await supabase.from('shopify_corrections').insert({
      item_type: 'image',
      item_id: String(index),
      item_name: img.name,
      field: 'optimization',
      original_value: img.status,
      corrected_value: 'good',
      status: 'corrected'
    })

    // Mettre à jour le state local
    const updated = [...images]
    updated[index] = { ...updated[index], status: 'good', suggestion: 'Corrigé' }
    setImages(updated)
  }

  return (
    <div className="page">
      <h1>Images</h1>
      <p className="subtitle">Analysez et optimisez les images</p>
      <div className="stats-row">
        <div className="stat-box">5 images</div>
        <div className="stat-box">8.2 MB total</div>
        <div className="stat-box warning">{images.filter(i => i.status !== 'good').length} à optimiser</div>
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

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Collections() {
  const [collections, setCollections] = useState([
    { name: 'Vélos électriques', products: 12, seo: 'good', desc: 'OK', image: 'OK' },
    { name: 'Accessoires', products: 45, seo: 'warning', desc: 'Trop courte', image: 'OK' },
    { name: 'Pièces détachées', products: 89, seo: 'good', desc: 'OK', image: 'Manquante' },
    { name: 'Promotions', products: 8, seo: 'bad', desc: 'Manquante', image: 'OK' },
  ])

  useEffect(() => {
    loadCorrections()
  }, [])

  const loadCorrections = async () => {
    const { data } = await supabase
      .from('shopify_corrections')
      .select('*')
      .eq('item_type', 'collection')
    
    if (data && data.length > 0) {
      setCollections(prev => prev.map(col => {
        const correction = data.find(c => c.item_name === col.name)
        if (correction) {
          return { ...col, seo: 'good', desc: 'OK', image: 'OK' }
        }
        return col
      }))
    }
  }

  const handleFix = async (index: number) => {
    const col = collections[index]
    
    try {
      await supabase.from('shopify_corrections').insert({
        item_type: 'collection',
        item_id: String(index),
        item_name: col.name,
        field: 'seo',
        original_value: col.seo,
        corrected_value: 'good',
        status: 'corrected'
      })

      const updated = [...collections]
      updated[index] = { ...updated[index], seo: 'good', desc: 'OK', image: 'OK' }
      setCollections(updated)
      
      toast.success(`✅ Collection "${col.name}" optimisée !`)
    } catch (error) {
      toast.error('Erreur lors de la correction')
    }
  }

  return (
    <div className="page">
      <h1>Collections</h1>
      <p className="subtitle">Gérez vos collections Shopify</p>
      <div className="stats-row">
        <div className="stat-box">4 collections</div>
        <div className="stat-box">154 produits</div>
        <div className="stat-box warning">{collections.filter(c => c.seo !== 'good').length} à optimiser</div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Collection</th><th>Produits</th><th>SEO</th><th>Description</th><th>Image</th><th>Action</th></tr>
          </thead>
          <tbody>
            {collections.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{c.products}</td>
                <td className={c.seo === 'good' ? 'text-good' : 'text-warning'}>{c.seo}</td>
                <td className={c.desc === 'OK' ? 'text-good' : 'text-warning'}>{c.desc}</td>
                <td className={c.image === 'OK' ? 'text-good' : 'text-warning'}>{c.image}</td>
                <td>
                  {c.seo !== 'good' && (
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

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Pages() {
  const [pages, setPages] = useState([
    { name: 'À propos', url: '/about', seo: 'warning', desc: 'Manque meta description' },
    { name: 'Contact', url: '/contact', seo: 'good', desc: 'OK' },
    { name: 'FAQ', url: '/faq', seo: 'bad', desc: 'Titre trop long' },
    { name: 'Livraison', url: '/shipping', seo: 'good', desc: 'OK' },
  ])

  useEffect(() => {
    loadCorrections()
  }, [])

  const loadCorrections = async () => {
    const { data } = await supabase
      .from('shopify_corrections')
      .select('*')
      .eq('item_type', 'page')
    
    if (data && data.length > 0) {
      setPages(prev => prev.map(page => {
        const correction = data.find(c => c.item_name === page.name)
        if (correction) {
          return { ...page, seo: 'good', desc: 'Corrigé' }
        }
        return page
      }))
    }
  }

  const handleFix = async (index: number) => {
    const page = pages[index]
    
    await supabase.from('shopify_corrections').insert({
      item_type: 'page',
      item_id: String(index),
      item_name: page.name,
      field: 'seo',
      original_value: page.seo,
      corrected_value: 'good',
      status: 'corrected'
    })

    const updated = [...pages]
    updated[index] = { ...updated[index], seo: 'good', desc: 'Corrigé' }
    setPages(updated)
  }

  return (
    <div className="page">
      <h1>Pages</h1>
      <p className="subtitle">Optimisez le SEO de vos pages</p>
      <div className="stats-row">
        <div className="stat-box">4 pages</div>
        <div className="stat-box warning">{pages.filter(p => p.seo !== 'good').length} à optimiser</div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Page</th><th>URL</th><th>SEO</th><th>Description</th><th>Action</th></tr>
          </thead>
          <tbody>
            {pages.map((page, i) => (
              <tr key={i}>
                <td>{page.name}</td>
                <td>{page.url}</td>
                <td className={page.seo === 'good' ? 'text-good' : 'text-warning'}>{page.seo}</td>
                <td>{page.desc}</td>
                <td>
                  {page.seo !== 'good' && (
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

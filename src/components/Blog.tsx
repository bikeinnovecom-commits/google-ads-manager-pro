import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Blog() {
  const [articles, setArticles] = useState([
    { title: 'Guide vélo électrique 2024', date: '2024-01-15', seo: 'good', status: 'Publié' },
    { title: 'Entretien batterie', date: '2024-02-20', seo: 'warning', status: 'Publié' },
    { title: 'Comparatif moteurs', date: '2024-03-10', seo: 'bad', status: 'Brouillon' },
    { title: 'Sécurité à vélo', date: '2024-03-25', seo: 'good', status: 'Publié' },
  ])

  useEffect(() => {
    loadCorrections()
  }, [])

  const loadCorrections = async () => {
    const { data } = await supabase
      .from('shopify_corrections')
      .select('*')
      .eq('item_type', 'blog')
    
    if (data && data.length > 0) {
      setArticles(prev => prev.map(article => {
        const correction = data.find(c => c.item_name === article.title)
        if (correction) {
          return { ...article, seo: 'good' }
        }
        return article
      }))
    }
  }

  const handleFix = async (index: number) => {
    const article = articles[index]
    
    try {
      await supabase.from('shopify_corrections').insert({
        item_type: 'blog',
        item_id: String(index),
        item_name: article.title,
        field: 'seo',
        original_value: article.seo,
        corrected_value: 'good',
        status: 'corrected'
      })

      const updated = [...articles]
      updated[index] = { ...updated[index], seo: 'good' }
      setArticles(updated)
      
      toast.success('Article "' + article.title + '" optimisé !')
    } catch (error) {
      toast.error('Erreur lors de la correction')
    }
  }

  return (
    <div className="page">
      <h1>Blog</h1>
      <p className="subtitle">Gérez vos articles de blog</p>
      <div className="stats-row">
        <div className="stat-box">4 articles</div>
        <div className="stat-box warning">{articles.filter(a => a.seo !== 'good').length} à optimiser</div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Titre</th><th>Date</th><th>SEO</th><th>Statut</th><th>Action</th></tr>
          </thead>
          <tbody>
            {articles.map((article, i) => (
              <tr key={i}>
                <td>{article.title}</td>
                <td>{article.date}</td>
                <td className={article.seo === 'good' ? 'text-good' : 'text-warning'}>{article.seo}</td>
                <td>{article.status}</td>
                <td>
                  {article.seo !== 'good' && (
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

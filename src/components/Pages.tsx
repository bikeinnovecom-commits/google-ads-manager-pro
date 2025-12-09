import { useState } from 'react'

export default function Pages() {
  const [pages, setPages] = useState([
    { name: 'Accueil', seo: 85, title: 'OK', desc: 'OK', speed: 'Rapide' },
    { name: 'A propos', seo: 45, title: 'Manquant', desc: 'Trop court', speed: 'Moyen' },
    { name: 'Contact', seo: 70, title: 'OK', desc: 'OK', speed: 'Lent' },
    { name: 'FAQ', seo: 90, title: 'OK', desc: 'OK', speed: 'Rapide' },
  ])

  const handleFix = (index: number) => {
    const updated = [...pages]
    updated[index] = { ...updated[index], seo: 95, title: 'OK', desc: 'OK', speed: 'Rapide' }
    setPages(updated)
  }

  const avgSeo = Math.round(pages.reduce((a, b) => a + b.seo, 0) / pages.length)

  return (
    <div className="page">
      <h1>Pages</h1>
      <p className="subtitle">Optimisez le SEO</p>
      <div className="stats-row">
        <div className="stat-box">4 pages</div>
        <div className="stat-box">SEO: {avgSeo}%</div>
        <div className="stat-box warning">{pages.filter(p => p.seo < 80).length} a ameliorer</div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Page</th><th>SEO</th><th>Titre</th><th>Desc</th><th>Vitesse</th><th>Action</th></tr>
          </thead>
          <tbody>
            {pages.map((p, i) => (
              <tr key={i}>
                <td>{p.name}</td>
                <td className={p.seo >= 80 ? 'text-good' : 'text-warning'}>{p.seo}%</td>
                <td>{p.title}</td>
                <td>{p.desc}</td>
                <td>{p.speed}</td>
                <td>{p.seo < 80 && <button className="btn-fix" onClick={() => handleFix(i)}>Corriger</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

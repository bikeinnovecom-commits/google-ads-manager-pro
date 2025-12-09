import { useState } from 'react'

export default function Blog() {
  const [posts, setPosts] = useState([
    { title: 'Guide skincare', date: '2024-01-15', views: 1250, seo: 92 },
    { title: 'Tendances mode', date: '2024-01-10', views: 890, seo: 78 },
    { title: 'Choisir sa taille', date: '2024-01-05', views: 2100, seo: 65 },
    { title: 'Engagements eco', date: '2023-12-20', views: 450, seo: 88 },
  ])

  const handleFix = (index: number) => {
    const updated = [...posts]
    updated[index] = { ...updated[index], seo: 95 }
    setPosts(updated)
  }

  const totalViews = posts.reduce((a, b) => a + b.views, 0)
  const avgSeo = Math.round(posts.reduce((a, b) => a + b.seo, 0) / posts.length)

  return (
    <div className="page">
      <h1>Blog</h1>
      <p className="subtitle">Gerez vos articles</p>
      <div className="stats-row">
        <div className="stat-box">4 articles</div>
        <div className="stat-box">{totalViews} vues</div>
        <div className="stat-box">SEO: {avgSeo}%</div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Article</th><th>Date</th><th>Vues</th><th>SEO</th><th>Action</th></tr>
          </thead>
          <tbody>
            {posts.map((p, i) => (
              <tr key={i}>
                <td>{p.title}</td>
                <td>{p.date}</td>
                <td>{p.views}</td>
                <td className={p.seo >= 80 ? 'text-good' : 'text-warning'}>{p.seo}%</td>
                <td>{p.seo < 80 && <button className="btn-fix" onClick={() => handleFix(i)}>Corriger</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

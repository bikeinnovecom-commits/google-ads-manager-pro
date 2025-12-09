import { useState } from 'react'

export default function Collections() {
  const [collections, setCollections] = useState([
    { name: 'Nouveautes', products: 24, desc: 'OK', image: 'OK' },
    { name: 'Meilleures ventes', products: 18, desc: 'Manquante', image: 'OK' },
    { name: 'Soldes', products: 32, desc: 'Trop courte', image: 'Manquante' },
    { name: 'Accessoires', products: 15, desc: 'OK', image: 'OK' },
  ])

  const handleFix = (index: number) => {
    const updated = [...collections]
    updated[index] = { ...updated[index], desc: 'OK', image: 'OK' }
    setCollections(updated)
  }

  const needsFix = (c: typeof collections[0]) => c.desc !== 'OK' || c.image !== 'OK'

  return (
    <div className="page">
      <h1>Collections</h1>
      <p className="subtitle">Gerez vos collections de produits</p>
      <div className="stats-row">
        <div className="stat-box">4 collections</div>
        <div className="stat-box">89 produits</div>
        <div className="stat-box warning">{collections.filter(needsFix).length} incompletes</div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Collection</th><th>Produits</th><th>Description</th><th>Image</th><th>Action</th></tr>
          </thead>
          <tbody>
            {collections.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{c.products}</td>
                <td className={c.desc === 'OK' ? 'text-good' : 'text-warning'}>{c.desc}</td>
                <td className={c.image === 'OK' ? 'text-good' : 'text-warning'}>{c.image}</td>
                <td>
                  {needsFix(c) && (
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

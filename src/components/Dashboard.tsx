import { useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null)

  const lineData = [
    { jour: 'Lun', clics: 1200, conversions: 42 },
    { jour: 'Mar', clics: 1400, conversions: 51 },
    { jour: 'Mer', clics: 1100, conversions: 38 },
    { jour: 'Jeu', clics: 1600, conversions: 55 },
    { jour: 'Ven', clics: 1800, conversions: 62 },
    { jour: 'Sam', clics: 900, conversions: 28 },
    { jour: 'Dim', clics: 560, conversions: 19 },
  ]

  const pieData = [
    { name: 'Mobile', value: 58 },
    { name: 'Desktop', value: 32 },
    { name: 'Tablet', value: 10 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b']

  const exportPDF = async () => {
    const jsPDF = (await import('jspdf')).default
    const html2canvas = (await import('html2canvas')).default
    if (!dashboardRef.current) return
    const canvas = await html2canvas(dashboardRef.current, { backgroundColor: '#0a0a0f' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4')
    pdf.addImage(imgData, 'PNG', 10, 10, 277, 150)
    pdf.save('rapport-google-ads.pdf')
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <button className="btn-export" onClick={exportPDF}>Exporter PDF</button>
      </div>
      <div ref={dashboardRef}>
        <div className="kpi-grid">
          <div className="kpi-card blue"><div className="kpi-label">Clics</div><div className="kpi-value">8,560</div></div>
          <div className="kpi-card green"><div className="kpi-label">Conversions</div><div className="kpi-value">295</div></div>
          <div className="kpi-card yellow"><div className="kpi-label">Cout</div><div className="kpi-value">1,091 EUR</div></div>
          <div className="kpi-card purple"><div className="kpi-label">CTR</div><div className="kpi-value">2.45%</div></div>
        </div>
        <div className="charts-row">
          <div className="chart-container">
            <h3>Performance 7 jours</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="jour" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: '#1a1a24', border: 'none' }} />
                <Line type="monotone" dataKey="clics" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-container">
            <h3>Appareils</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                  {pieData.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a24', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

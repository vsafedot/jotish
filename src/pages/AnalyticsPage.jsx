import { useState, useEffect } from 'react'
import SalaryChart from '../components/SalaryChart.jsx'
import CityMap from '../components/CityMap.jsx'

export default function AnalyticsPage() {
  const [mergedImage, setMergedImage] = useState(null)
  const [employee,    setEmployee]    = useState(null)
  const [employees,   setEmployees]   = useState([])

  useEffect(() => {
    try {
      const img = sessionStorage.getItem('jotish_merged_image')
      if (img) setMergedImage(img)

      const emp = sessionStorage.getItem('jotish_current_employee')
      if (emp) setEmployee(JSON.parse(emp))

      const allEmp = sessionStorage.getItem('jotish_employees')
      if (allEmp) setEmployees(JSON.parse(allEmp))
    } catch (_) {}
  }, [])

  // Stats
  const avgSalary = employees.length
    ? Math.round(employees.reduce((s, e) => s + (Number(e.salary) || 0), 0) / employees.length)
    : 0

  const uniqueCities = new Set(employees.map(e => e.city).filter(Boolean)).size
  const deptCounts   = employees.reduce((acc, e) => {
    if (e.department) acc[e.department] = (acc[e.department] || 0) + 1
    return acc
  }, {})
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="page animate-fadeIn">
      <h1 className="page-title">Analytics & Insights</h1>
      <p className="page-subtitle">Company-wide employee intelligence dashboard</p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="👥" label="Total Employees" value={employees.length} />
        <StatCard icon="💎"  label="Avg Salary"      value={avgSalary ? `₹${avgSalary.toLocaleString('en-IN')}` : '—'} />
        <StatCard icon="📍" label="Cities"          value={uniqueCities} />
        <StatCard icon="🏢" label="Largest Dept"    value={topDept ? topDept[0] : '—'} />
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }}>

        {/* Audit Image */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>🪪 Audit Image</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 16 }}>
            Merged photo + signature — identity verified
          </p>
          {mergedImage ? (
            <div>
              <div className="audit-image-wrap" style={{ display: 'block' }}>
                <img src={mergedImage} alt="Merged Audit" id="audit-image" style={{ width: '100%' }} />
                <span className="audit-stamp">✓ Verified</span>
              </div>
              {employee && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span><strong style={{ color: 'var(--text-primary)' }}>{employee.name}</strong></span>
                  <span>{employee.department}</span>
                  <span>{employee.city}</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>₹{Number(employee.salary || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <a
                href={mergedImage}
                download="audit-image.png"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 12 }}
                id="download-analytics-audit"
              >
                ⬇ Download Audit Image
              </a>
            </div>
          ) : (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📷</div>
              No audit image yet.<br/>
              Complete identity verification on the Details page first.
            </div>
          )}
        </div>

        {/* Salary Chart */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>📊 Salary by City</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 16 }}>
            Average salary distribution — top 12 cities (raw SVG)
          </p>
          <SalaryChart data={employees} />
        </div>
      </div>

      {/* Map */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 2 }}>🗺️ Geospatial Distribution</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              City markers sized by avg salary · Powered by Leaflet + OpenStreetMap
            </p>
          </div>
          <span className="badge badge-cyan">{uniqueCities} cities</span>
        </div>
        {employees.length > 0 ? (
          <CityMap data={employees} />
        ) : (
          <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Load employee data from the Grid page first
          </div>
        )}
        <p style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          City coordinates sourced from a hardcoded lookup table of 50 Indian cities in <code>src/utils/cityCoords.js</code>. Markers are matched case-insensitively.
        </p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ fontSize: 28, background: 'var(--bg-surface)', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value || '—'}</div>
      </div>
    </div>
  )
}

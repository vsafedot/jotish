import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVirtualScroll } from '../hooks/useVirtualScroll.js'

const API_URL = 'https://backend.jotish.in/backend_dev/gettabledata.php'
const ITEM_HEIGHT = 56

const COLUMNS = [
  { key: 'avatar',     label: '',           width: '56px'  },
  { key: 'id',         label: 'ID',         width: '60px'  },
  { key: 'name',       label: 'Employee',   width: '200px' },
  { key: 'email',      label: 'Email',      width: '220px' },
  { key: 'city',       label: 'Location',   width: '140px' },
  { key: 'salary',     label: 'Salary',     width: '120px' },
  { key: 'department', label: 'Dept',       width: '140px' },
  { key: 'action',     label: '',           width: '90px'  },
]

function formatSalary(s) {
  const n = Number(s)
  if (isNaN(n)) return s
  return '₹' + n.toLocaleString('en-IN')
}

function getDeptBadge(dept) {
  const map = {
    Engineering: 'badge-brand',
    Sales:       'badge-cyan',
    HR:          'badge-green',
    Finance:     'badge-rose',
    Marketing:   'badge-cyan',
    Operations:  'badge-green',
  }
  return map[dept] || 'badge-brand'
}

export default function ListPage() {
  const navigate                   = useNavigate()
  const [allData,    setAllData]   = useState([])
  const [filtered,   setFiltered]  = useState([])
  const [search,     setSearch]    = useState('')
  const [loading,    setLoading]   = useState(true)
  const [error,      setError]     = useState('')
  const [sortConfig, setSortConfig]= useState({ key: null, dir: 'asc' })

  // Store employees in sessionStorage for use on Details page
  const storeData = useCallback((data) => {
    try {
      sessionStorage.setItem('jotish_employees', JSON.stringify(data))
    } catch (_) {}
  }, [])

  // Fetch from API
  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test', password: '123456' }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const rows = Array.isArray(json) ? json : (json.data ?? json.employees ?? [])
        setAllData(rows)
        setFiltered(rows)
        storeData(rows)
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError(e.message || 'Failed to load employee data.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => controller.abort()
  }, [storeData])

  // Client-side search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(allData)
      return
    }
    const q = search.toLowerCase()
    setFiltered(
      allData.filter(row =>
        Object.values(row).some(v =>
          String(v).toLowerCase().includes(q)
        )
      )
    )
  }, [search, allData])

  // Sort
  const handleSort = (key) => {
    if (key === 'avatar' || key === 'action') return
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const sortedData = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0
    const av = a[sortConfig.key] ?? ''
    const bv = b[sortConfig.key] ?? ''
    const n  = isNaN(av) || isNaN(bv)
    const cmp = n
      ? String(av).localeCompare(String(bv))
      : Number(av) - Number(bv)
    return sortConfig.dir === 'asc' ? cmp : -cmp
  })

  const {
    containerRef, startIndex, endIndex,
    totalHeight,  offsetY,    itemHeight,
  } = useVirtualScroll(sortedData.length)

  const visibleRows = sortedData.slice(startIndex, endIndex)

  if (loading) return <LoadingSkeleton />
  if (error) return (
    <div className="page">
      <div className="alert alert-error" style={{ maxWidth: 480, margin: '80px auto' }}>
        ⚠️ {error} — Check the API endpoint or your network connection.
      </div>
    </div>
  )

  return (
    <div className="page animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Directory</h1>
          <p className="page-subtitle">
            Showing <strong style={{ color: 'var(--brand)' }}>{filtered.length}</strong> of{' '}
            <strong style={{ color: 'var(--brand)' }}>{allData.length}</strong> employees
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              id="employee-search"
              className="input"
              style={{ paddingLeft: 36, width: 260 }}
              placeholder="Search directory…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        {/* Sticky header */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ tableLayout: 'fixed', minWidth: 920 }}>
            <colgroup>
              {COLUMNS.map(c => <col key={c.key} style={{ width: c.width }} />)}
            </colgroup>
            <thead>
              <tr>
                {COLUMNS.map(col => col.key === 'action' || col.key === 'avatar' ? (
                  <th key={col.key} />
                ) : (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title={`Sort by ${col.label}`}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {col.label}
                      {sortConfig.key === col.key && (
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.7rem' }}>
                          {sortConfig.dir === 'asc' ? '↓' : '↑'}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        {/* Virtual scroll body */}
        <div style={{ overflowX: 'auto' }}>
          <div
            ref={containerRef}
            className="virtual-scroll-container"
            id="employee-list-container"
            style={{ height: 'min(70vh, 600px)' }}
          >
            <table className="data-table" style={{ tableLayout: 'fixed', minWidth: 920 }}>
              <colgroup>
                {COLUMNS.map(c => <col key={c.key} style={{ width: c.width }} />)}
              </colgroup>
              <tbody>
                {/* Spacer row above visible items */}
                {startIndex > 0 && (
                  <tr style={{ height: startIndex * itemHeight }} aria-hidden="true">
                    <td colSpan={COLUMNS.length} style={{ padding: 0, border: 0 }} />
                  </tr>
                )}
                {visibleRows.map((row, i) => (
                  <EmployeeRow
                    key={row.id ?? (startIndex + i)}
                    row={row}
                    onView={() => navigate(`/details/${row.id ?? (startIndex + i)}`)}
                  />
                ))}
                {/* Spacer row below visible items */}
                {endIndex < sortedData.length && (
                  <tr style={{ height: (sortedData.length - endIndex) * itemHeight }} aria-hidden="true">
                    <td colSpan={COLUMNS.length} style={{ padding: 0, border: 0 }} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {sortedData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
            No employees match your search.
          </div>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Viewing items {startIndex}–{endIndex} natively
      </p>
    </div>
  )
}

function EmployeeRow({ row, onView }) {
  // Generate a deterministic minimal avatar using Unavatar + ui-avatars fallback
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || 'User')}&background=f4f4f5&color=18181b&rounded=true&bold=true`

  return (
    <tr
      className="virtual-row"
      onClick={onView}
      style={{ height: ITEM_HEIGHT, cursor: 'pointer' }}
    >
      <td style={{ paddingRight: 0 }}>
        <img 
          src={avatarUrl} 
          alt={row.name} 
          style={{ width: 32, height: 32, borderRadius: '50%', display: 'block', border: '1px solid var(--border)' }} 
        />
      </td>
      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {String(row.id).padStart(4, '0')}
      </td>
      <td>
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.name}</span>
      </td>
      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.email}</td>
      <td style={{ color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          📍 {row.city}
        </span>
      </td>
      <td style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
        {formatSalary(row.salary)}
      </td>
      <td>
        <span className={`badge ${getDeptBadge(row.department)}`}>{row.department}</span>
      </td>
      <td style={{ textAlign: 'right', paddingRight: 24 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={e => { e.stopPropagation(); onView() }}
          id={`view-btn-${row.id}`}
        >
          View
        </button>
      </td>
    </tr>
  )
}

function LoadingSkeleton() {
  return (
    <div className="page animate-fadeIn">
      <div className="skeleton" style={{ height: 32, width: 220, marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, width: 140, marginBottom: 32 }} />
      <div className="card" style={{ padding: 0 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 24px', borderBottom: '1px solid var(--border)' }}>
            <div className="skeleton" style={{ height: 14, width: 40 }} />
            <div className="skeleton" style={{ height: 14, flex: 1 }} />
            <div className="skeleton" style={{ height: 14, flex: 2 }} />
            <div className="skeleton" style={{ height: 14, flex: 1 }} />
            <div className="skeleton" style={{ height: 14, width: 80 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

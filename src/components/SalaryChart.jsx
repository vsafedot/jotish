/**
 * SalaryChart — Pure SVG bar chart
 *
 * Renders salary distribution by city using only raw SVG elements:
 * <rect> for bars, <text> for labels, <line> for axes, <circle> for dots.
 * No D3, no Chart.js.
 */
export default function SalaryChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', padding: 24 }}>No salary data available.</div>
  }

  // Aggregate: avg salary per city
  const cityMap = {}
  data.forEach(row => {
    const city   = row.city || 'Unknown'
    const salary = Number(row.salary) || 0
    if (!cityMap[city]) cityMap[city] = { total: 0, count: 0 }
    cityMap[city].total += salary
    cityMap[city].count += 1
  })

  const cities = Object.entries(cityMap)
    .map(([city, { total, count }]) => ({ city, avg: Math.round(total / count) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 12) // show top 12 cities

  const maxSalary = Math.max(...cities.map(c => c.avg))

  // Chart dimensions
  const BAR_W     = 48
  const BAR_GAP   = 24
  const CHART_H   = 240
  const PADDING_L = 72
  const PADDING_B = 64
  const PADDING_T = 20
  const totalW    = PADDING_L + cities.length * (BAR_W + BAR_GAP) + 24

  const toY = (val) => PADDING_T + CHART_H - (val / maxSalary) * CHART_H

  // Y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    val: Math.round(maxSalary * f),
    y:   PADDING_T + CHART_H - f * CHART_H,
  }))

  const formatK = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`

  const COLORS = [
    '#6366f1','#22d3ee','#34d399','#f472b6','#f59e0b',
    '#818cf8','#06b6d4','#10b981','#ec4899','#fbbf24',
    '#a78bfa','#2dd4bf',
  ]

  return (
    <div className="chart-wrap">
      <svg
        width={totalW}
        height={PADDING_T + CHART_H + PADDING_B}
        style={{ display: 'block', minWidth: totalW }}
        aria-label="Salary Distribution by City"
        role="img"
      >
        {/* Grid lines + Y-axis labels */}
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PADDING_L} y1={tick.y}
              x2={totalW - 12} y2={tick.y}
              stroke="rgba(42,47,82,0.8)" strokeWidth="1"
              strokeDasharray={i === 0 ? '0' : '4 4'}
            />
            <text
              x={PADDING_L - 8} y={tick.y + 4}
              textAnchor="end"
              fontSize="10" fill="var(--text-muted)"
              fontFamily="Inter, sans-serif"
            >
              {formatK(tick.val)}
            </text>
          </g>
        ))}

        {/* X axis */}
        <line
          x1={PADDING_L} y1={PADDING_T + CHART_H}
          x2={totalW - 12} y2={PADDING_T + CHART_H}
          stroke="var(--border)" strokeWidth="1.5"
        />

        {/* Y axis */}
        <line
          x1={PADDING_L} y1={PADDING_T}
          x2={PADDING_L} y2={PADDING_T + CHART_H}
          stroke="var(--border)" strokeWidth="1.5"
        />

        {/* Bars */}
        {cities.map((c, i) => {
          const x      = PADDING_L + i * (BAR_W + BAR_GAP) + BAR_GAP / 2
          const barH   = (c.avg / maxSalary) * CHART_H
          const y      = PADDING_T + CHART_H - barH
          const color  = COLORS[i % COLORS.length]

          return (
            <g key={c.city}>
              {/* Bar shadow */}
              <rect
                x={x + 3} y={y + 4}
                width={BAR_W} height={barH}
                fill="rgba(0,0,0,0.3)"
                rx="4"
              />
              {/* Main bar with gradient */}
              <defs>
                <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity="1" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <rect
                x={x} y={y}
                width={BAR_W} height={barH}
                fill={`url(#grad-${i})`}
                rx="4"
              />
              {/* Top dot */}
              <circle cx={x + BAR_W / 2} cy={y} r="4" fill={color} />

              {/* Value label */}
              <text
                x={x + BAR_W / 2} y={y - 10}
                textAnchor="middle"
                fontSize="9" fill={color}
                fontWeight="700"
                fontFamily="Inter, sans-serif"
              >
                {formatK(c.avg)}
              </text>

              {/* City label — rotated */}
              <text
                x={x + BAR_W / 2}
                y={PADDING_T + CHART_H + 14}
                textAnchor="end"
                fontSize="10" fill="var(--text-secondary)"
                fontFamily="Inter, sans-serif"
                transform={`rotate(-40, ${x + BAR_W / 2}, ${PADDING_T + CHART_H + 14})`}
              >
                {c.city}
              </text>
            </g>
          )
        })}

        {/* Chart title */}
        <text
          x={PADDING_L} y={14}
          fontSize="11" fill="var(--text-muted)"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
          letterSpacing="0.04em"
        >
          AVG SALARY (₹) BY CITY
        </text>
      </svg>
    </div>
  )
}

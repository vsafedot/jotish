import { useEffect, useRef } from 'react'
import { getCityCoords } from '../utils/cityCoords.js'

export default function CityMap({ data }) {
  const mapRef       = useRef(null)
  const leafletRef   = useRef(null)

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then(L => {
      if (leafletRef.current) return // already initialized

      // Aggregate city salary data
      const cityMap = {}
      ;(data || []).forEach(row => {
        const city   = row.city || 'Unknown'
        const salary = Number(row.salary) || 0
        if (!cityMap[city]) cityMap[city] = { total: 0, count: 0 }
        cityMap[city].total += salary
        cityMap[city].count += 1
      })

      const cityStats = Object.entries(cityMap).map(([city, { total, count }]) => ({
        city,
        avg: Math.round(total / count),
        count,
        coords: getCityCoords(city),
      })).filter(c => c.coords)

      // Init Leaflet map
      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // India center
        zoom: 5,
        zoomControl: true,
        attributionControl: true,
      })
      leafletRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      // Custom circular marker icon using divIcon
      cityStats.forEach(({ city, avg, count, coords }) => {
        const size = Math.max(24, Math.min(56, Math.round((avg / 200000) * 60)))
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:linear-gradient(135deg,#6366f1,#22d3ee);
            border:2px solid rgba(255,255,255,0.4);
            display:flex;align-items:center;justify-content:center;
            color:#fff;font-size:${Math.max(8, size * 0.26)}px;font-weight:700;
            box-shadow:0 4px 12px rgba(99,102,241,0.5);
            cursor:pointer;
            font-family:Inter,sans-serif;
            white-space:nowrap;
          ">${count}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        const formatK = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`

        L.marker([coords.lat, coords.lng], { icon })
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:140px">
              <strong style="font-size:14px">${city}</strong><br/>
              <span style="color:#6366f1;font-weight:700">${formatK(avg)}</span>
              <span style="color:#888;font-size:11px"> avg salary</span><br/>
              <span style="color:#888;font-size:11px">${count} employees</span>
            </div>
          `)
          .addTo(map)
      })
    })

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }
    }
  }, [data])

  return (
    <div
      ref={mapRef}
      className="map-container"
      id="city-map"
      style={{ height: 420 }}
    />
  )
}

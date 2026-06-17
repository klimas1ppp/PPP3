'use client'

import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import { REPORTS } from '@/lib/reports'

const CATEGORY_TONE: Record<string, string> = {
  'Water Systems': 'oklch(0.78 0.12 175)',
  'Farming & Livestock': 'oklch(0.79 0.13 88)',
  Education: 'oklch(0.72 0.12 66)',
}

// Bounds framing the whole Palawan province.
const PALAWAN_BOUNDS: LatLngBoundsExpression = [
  [7.6, 116.8],
  [12.4, 120.6],
]

function scrollToReport(slug: string) {
  const el = document.getElementById(`report-${slug}`)
  if (!el) return
  // Update the hash so the :target highlight fires, then smooth-scroll.
  history.replaceState(null, '', `#report-${slug}`)
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export default function PalawanMap() {
  const points = useMemo(
    () =>
      REPORTS.map((r) => ({
        slug: r.slug,
        title: r.title,
        category: r.category,
        lat: r.location.lat,
        lng: r.location.lng,
        tone: CATEGORY_TONE[r.category] ?? 'oklch(0.79 0.13 88)',
      })),
    [],
  )

  return (
    <MapContainer
      bounds={PALAWAN_BOUNDS}
      scrollWheelZoom={false}
      className="h-full w-full bg-transparent"
      style={{ background: 'transparent' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={p.slug}
          center={[p.lat, p.lng]}
          radius={9}
          pathOptions={{
            color: p.tone,
            fillColor: p.tone,
            fillOpacity: 0.85,
            weight: 3,
          }}
          eventHandlers={{
            click: () => scrollToReport(p.slug),
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
            <span style={{ fontWeight: 600 }}>{p.category}</span>
            <br />
            {p.title}
            <br />
            <span style={{ opacity: 0.7 }}>Click to read the report ↓</span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

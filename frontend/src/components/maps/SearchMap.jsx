import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const SearchMap = ({ 
  data = [], 
  center = [40.7128, -74.0060], 
  zoom = 13, 
  height = "400px",
  onMarkerClick
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  // ✅ Get category-specific icon and colors (matching your SearchResults)
  const getCategoryIcon = (category, type) => {
    const categoryLower = (category || type || '').toLowerCase()
    
    const iconMap = {
      'restaurant': { icon: '🍽️', gradient: 'linear-gradient(135deg, #ef4444, #ec4899)', size: 14 },
      'cafe': { icon: '☕', gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', size: 14 },
      'coffee': { icon: '☕', gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', size: 14 },
      'bar': { icon: '🍷', gradient: 'linear-gradient(135deg, #8b5cf6, #4f46e5)', size: 14 },
      'food': { icon: '🍽️', gradient: 'linear-gradient(135deg, #ef4444, #ec4899)', size: 14 },
      'shop': { icon: '🛍️', gradient: 'linear-gradient(135deg, #3b82f6, #4f46e5)', size: 14 },
      'shopping': { icon: '🛍️', gradient: 'linear-gradient(135deg, #3b82f6, #4f46e5)', size: 14 },
      'store': { icon: '🏪', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)', size: 14 },
      'mall': { icon: '🏬', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', size: 14 },
      'museum': { icon: '🏛️', gradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)', size: 14 },
      'park': { icon: '🌳', gradient: 'linear-gradient(135deg, #10b981, #059669)', size: 14 },
      'cinema': { icon: '🎬', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)', size: 14 },
      'theater': { icon: '🎭', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)', size: 14 },
      'hospital': { icon: '🏥', gradient: 'linear-gradient(135deg, #dc2626, #ec4899)', size: 14 },
      'hotel': { icon: '🏨', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', size: 14 },
      'bank': { icon: '🏦', gradient: 'linear-gradient(135deg, #475569, #64748b)', size: 14 },
      'office': { icon: '🏢', gradient: 'linear-gradient(135deg, #64748b, #475569)', size: 14 },
      'station': { icon: '🚉', gradient: 'linear-gradient(135deg, #ea580c, #dc2626)', size: 14 },
      'airport': { icon: '✈️', gradient: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', size: 14 },
      'parking': { icon: '🅿️', gradient: 'linear-gradient(135deg, #6b7280, #475569)', size: 14 },
    }

    for (const [key, config] of Object.entries(iconMap)) {
      if (categoryLower.includes(key)) {
        return config
      }
    }

    return { 
      icon: '📍', 
      gradient: 'linear-gradient(135deg, #f97316, #dc2626)', 
      size: 16 
    }
  }

  // ✅ Create enhanced custom marker with category-specific styling
  const createCustomIcon = (location, isHovered = false) => {
    const iconConfig = getCategoryIcon(location.category, location.type)
    const size = isHovered ? 36 : 32
    const shadowSize = isHovered ? 16 : 12
    
    return L.divIcon({
      className: 'custom-search-marker',
      html: `
        <div style="
          background: ${iconConfig.gradient};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 ${shadowSize/3}px ${shadowSize}px rgba(0,0,0,${isHovered ? 0.4 : 0.25});
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${iconConfig.size}px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          z-index: ${isHovered ? 1000 : 100};
        ">
          ${iconConfig.icon}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size],
    })
  }

  // ✅ Create beautiful hover tooltip
  const createHoverTooltip = (location) => {
    const category = location.category || location.type || 'Location'
    const rating = location.rating || location.properties?.businessRating || (Math.random() * 2 + 3).toFixed(1)
    
    return `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        border: 1px solid rgba(0,0,0,0.05);
        min-width: 200px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      ">
        <div style="
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
          font-size: 15px;
        ">${location.name}</div>
        
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="color: #fbbf24;">⭐</span>
            <span style="font-weight: 500; color: #1f2937;">${rating}</span>
          </div>
          
          <span style="
            background: #f3f4f6;
            color: #374151;
            padding: 2px 8px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 11px;
          ">${category}</span>
        </div>
      </div>
    `
  }

  // ✅ Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      tap: true,
      touchZoom: true
    }).setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // ✅ Update markers with hover effects
  useEffect(() => {
    if (!mapInstanceRef.current || !Array.isArray(data)) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers with enhanced interactions
    data.forEach((location, index) => {
      if (!location.lat || !location.lng) return

      const marker = L.marker([location.lat, location.lng], {
        icon: createCustomIcon(location, false)
      })

      // ✅ Add hover tooltip
      const tooltip = L.tooltip({
        permanent: false,
        direction: 'top',
        offset: [0, -20],
        className: 'custom-search-tooltip',
        opacity: 1
      }).setContent(createHoverTooltip(location))

      marker.bindTooltip(tooltip)

      // ✅ Enhanced hover effects
      marker.on('mouseover', function() {
        this.setIcon(createCustomIcon(location, true))
        this.openTooltip()
      })

      marker.on('mouseout', function() {
        this.setIcon(createCustomIcon(location, false))
        this.closeTooltip()
      })

      // ✅ Click handler
      marker.on('click', () => {
        console.log('Map marker clicked - showing details for:', location.name)
        if (onMarkerClick) {
          onMarkerClick(location)
        }
      })

      marker.addTo(mapInstanceRef.current)
      markersRef.current.push(marker)
    })

    // ✅ Fit bounds if multiple locations
    if (data.length > 1) {
      const group = new L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }

  }, [data, onMarkerClick])

  // ✅ Update map center
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden'
      }} 
    />
  )
}

export default SearchMap

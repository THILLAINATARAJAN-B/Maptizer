import L from 'leaflet'

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export const mapConfig = {
  defaultCenter: [11.016845, 76.955833], // Coimbatore
  defaultZoom: 13,
  minZoom: 3,
  maxZoom: 18,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}

export const createCustomIcon = (type, color = '#3b82f6') => {
  const iconHtml = getIconHtml(type, color)
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  })
}

const getIconHtml = (type, color) => {
  const icons = {
    coffee: '☕',
    restaurant: '🍽️',
    place: '📍',
    popularity: '⭐',
    demographics: '👥',
    heatmap: '🔥'
  }
  
  return `
    <div style="
      background-color: ${color};
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      ${icons[type] || icons.place}
    </div>
  `
}

export const getMarkerColor = (type) => {
  const colors = {
    popularity: '#f59e0b',    // Amber
    userLocation: '#10b981',  // Emerald
    demographics: '#ef4444',  // Red
    coffee: '#8b5cf6',        // Purple
    restaurant: '#06b6d4',    // Cyan
    default: '#3b82f6'        // Blue
  }
  return colors[type] || colors.default
}

export const formatPopupContent = (item) => {
  return `
    <div class="popup-content">
      <h3 class="font-semibold text-lg mb-2">${item.name || 'Location'}</h3>
      ${item.address ? `<p class="text-sm text-gray-600 mb-2">${item.address}</p>` : ''}
      ${item.popularity ? `<p class="text-sm"><strong>Popularity:</strong> ${(item.popularity * 100).toFixed(1)}%</p>` : ''}
      ${item.category ? `<p class="text-sm"><strong>Category:</strong> ${item.category}</p>` : ''}
      ${item.type ? `<p class="text-sm"><strong>Type:</strong> ${item.type}</p>` : ''}
      ${item.value ? `<p class="text-sm"><strong>Value:</strong> ${item.value}</p>` : ''}
    </div>
  `
}

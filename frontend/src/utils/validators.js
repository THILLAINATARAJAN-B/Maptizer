export const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return { valid: false, message: 'Query is required' }
  }
  
  if (query.trim().length < 2) {
    return { valid: false, message: 'Query must be at least 2 characters' }
  }
  
  if (query.length > 100) {
    return { valid: false, message: 'Query is too long' }
  }
  
  return { valid: true }
}

export const validateLocation = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, message: 'Coordinates must be numbers' }
  }
  
  if (lat < -90 || lat > 90) {
    return { valid: false, message: 'Latitude must be between -90 and 90' }
  }
  
  if (lng < -180 || lng > 180) {
    return { valid: false, message: 'Longitude must be between -180 and 180' }
  }
  
  return { valid: true }
}

export const validateRadius = (radius) => {
  if (typeof radius !== 'number') {
    return { valid: false, message: 'Radius must be a number' }
  }
  
  if (radius < 1 || radius > 100) {
    return { valid: false, message: 'Radius must be between 1 and 100 km' }
  }
  
  return { valid: true }
}

export const validateEntityId = (entityId) => {
  if (!entityId || typeof entityId !== 'string') {
    return { valid: false, message: 'Entity ID is required' }
  }
  
  // Basic UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(entityId)) {
    return { valid: false, message: 'Invalid entity ID format' }
  }
  
  return { valid: true }
}

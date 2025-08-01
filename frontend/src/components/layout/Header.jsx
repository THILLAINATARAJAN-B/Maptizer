import React, { useState } from 'react'
import { 
  Search, 
  Menu, 
  MapPin, 
  Navigation, 
  Crosshair
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import LocationPicker from '../common/LocationPicker'

const Header = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { selectedLocation, setSelectedLocation } = useApp()
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false)

  const handleLocationConfirm = (newLocation) => {
    setSelectedLocation(newLocation)
    console.log('Location updated:', newLocation)
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              {
                headers: {
                  'User-Agent': 'LocationIQ/1.0'
                }
              }
            )
            const data = await response.json()
            
            const locationName = data.name || 
                              data.address?.city || 
                              data.address?.town || 
                              data.address?.village || 
                              data.address?.state || 
                              'Current Location'
            
            const newLocation = {
              lat: parseFloat(latitude.toFixed(6)),
              lng: parseFloat(longitude.toFixed(6)),
              name: locationName,
              displayName: locationName,
              searchName: locationName
            }
            
            setSelectedLocation(newLocation)
            console.log('Current location set:', newLocation)
          } catch (error) {
            console.error('Reverse geocoding failed:', error)
            const newLocation = {
              lat: parseFloat(latitude.toFixed(6)),
              lng: parseFloat(longitude.toFixed(6)),
              name: 'Current Location',
              displayName: 'Current Location',
              searchName: 'Current Location'
            }
            setSelectedLocation(newLocation)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to get your current location. Please use the location picker instead.')
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left Side - Logo and Toggle */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LIQ</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">LocationIQ</h1>
                <p className="text-xs text-gray-600 -mt-1">Analytics Platform</p>
              </div>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search locations, analytics..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Side - Location Controls */}
          <div className="flex items-center space-x-4">
            {/* Current Location Display */}
            <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div className="text-sm">
                <div className="font-medium text-gray-900 max-w-32 truncate">
                  {selectedLocation?.displayName || selectedLocation?.name || 'No Location'}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedLocation?.lat?.toFixed(4)}, {selectedLocation?.lng?.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Location Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUseCurrentLocation}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 rounded-lg transition-colors"
                title="Use Current Location"
              >
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">Current</span>
              </button>
              
              <button
                onClick={() => setIsLocationPickerOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors shadow-md"
              >
                <Crosshair className="w-4 h-4" />
                <span>Select Location</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onLocationConfirm={handleLocationConfirm}
      />
    </>
  )
}

export default Header

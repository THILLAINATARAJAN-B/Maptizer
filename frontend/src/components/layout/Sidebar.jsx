import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  Search, 
  GitCompare, 
  Map, 
  Settings, 
  HelpCircle,
  Home,
  TrendingUp,
  Database,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const Sidebar = ({ activeTab, onTabChange, collapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/', badge: null },
    { id: 'search', label: 'Search', icon: Search, path: '/search', badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', badge: 'New' },
    { id: 'compare', label: 'Compare', icon: GitCompare, path: '/compare', badge: null },
    { id: 'insights', label: 'Insights', icon: TrendingUp, path: '/insights', badge: null },
    { id: 'files', label: 'Files', icon: Database, path: '/files', badge: null } // ✅ Added files/gallery section
  ]

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help' },
  ]

  // ✅ Determine active tab based on current path
  const getCurrentActiveTab = () => {
    const path = location.pathname
    const item = navigationItems.find(item => item.path === path)
    return item ? item.id : 'dashboard'
  }

  const NavItem = ({ item, isBottom = false }) => {
    const Icon = item.icon
    const isActive = getCurrentActiveTab() === item.id
    
    const handleClick = () => {
      if (item.path) {
        navigate(item.path)
        onTabChange(item.id)
      }
    }
    
    return (
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative
          ${isActive 
            ? 'bg-orange-100 text-orange-700 shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
          ${collapsed ? 'justify-center px-2' : ''}
        `}
        title={collapsed ? item.label : undefined}
      >
        {/* Active Indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full" />
        )}
        
        {/* Icon */}
        <Icon className={`
          w-5 h-5 flex-shrink-0
          ${!collapsed ? 'mr-3' : ''}
          ${isActive ? 'text-orange-600' : 'text-gray-600 group-hover:text-gray-900'}
        `} />
        
        {/* Label */}
        {!collapsed && (
          <span className="flex-1 text-left">
            {item.label}
          </span>
        )}
        
        {/* Badge */}
        {!collapsed && item.badge && (
          <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className={`
      fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40 shadow-lg
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigationItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Bottom Items */}
        <div className="px-3 py-4 border-t border-gray-200 space-y-1">
          {bottomItems.map((item) => (
            <NavItem key={item.id} item={item} isBottom />
          ))}
        </div>

        {/* Collapse Toggle */}
        <div className="px-3 py-2 border-t border-gray-200">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

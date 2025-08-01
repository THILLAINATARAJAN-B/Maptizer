import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Home from './pages/Home'
import Search from './pages/Search'
import Analytics from './pages/Analytics'
import Compare from './pages/Compare'
import Insights from './pages/Insights'
import Files from './pages/Files'
import { AppProvider } from './context/AppContext'
import './styles/globals.css'

// ✅ Import session cleanup hook
import useSessionCleanup from './hooks/useSessionCleanup'

// ✅ Component to handle route-based state management
const AppContent = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ✅ Initialize session cleanup
  const { cleanSession, getSessionStats } = useSessionCleanup()

  // ✅ Update active tab based on current route
  useEffect(() => {
    const path = location.pathname
    if (path === '/' || path === '/dashboard') {
      setActiveTab('dashboard')
    } else if (path === '/search') {
      setActiveTab('search')
    } else if (path === '/analytics') {
      setActiveTab('analytics')
    } else if (path === '/compare') {
      setActiveTab('compare')
    } else if (path === '/insights') {
      setActiveTab('insights')
    } else if (path === '/files') {
      setActiveTab('files')
    }
  }, [location.pathname])

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onToggleSidebar={handleToggleCollapse}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      } mt-16 p-8`}>
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/files" element={<Files />} />
          </Routes>
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  )
}

export default App

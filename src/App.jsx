import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ThemeProvider, useTheme } from './hooks/useTheme.jsx'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineIndicator from './components/OfflineIndicator'
import PWAInstaller from './components/PWAInstaller'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'
import ProductDetail from './pages/ProductDetail'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import Auth from './pages/Auth'
import ProtectedRoute from './components/ProtectedRoute'

import { initializeDatabase } from './utils/databaseInitializer'
import './App.css'

function AppContent() {
  const { theme } = useTheme();
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error('Error inicializando la aplicación:', error);
      }
    };
    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-x-hidden" data-theme={theme}>
          <ErrorBoundary>
            <Navbar />
            <main className="container mx-auto px-4 py-8 overflow-x-hidden">
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } 
              />
              </Routes>
            </main>
            <OfflineIndicator />
            <PWAInstaller />
          </ErrorBoundary>
        </div>
      </Router>
    </AuthProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App

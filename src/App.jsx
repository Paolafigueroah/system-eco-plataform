import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ThemeProvider, useTheme } from './hooks/useTheme.jsx'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineIndicator from './components/OfflineIndicator'
import PWAInstaller from './components/PWAInstaller'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy loading de páginas para mejorar rendimiento inicial
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Profile = lazy(() => import('./pages/Profile'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Auth = lazy(() => import('./pages/Auth'))

import { initializeDatabase } from './utils/databaseInitializer'

function AppContent() {
  const { theme } = useTheme();
  const location = useLocation();
  
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-x-hidden" data-theme={theme}>
        <ErrorBoundary>
          <Navbar />
          <main className="container mx-auto px-4 py-8 overflow-x-hidden">
            <Suspense fallback={<LoadingSpinner />}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Home />
                    </motion.div>
                  } />
                  <Route path="/about" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <About />
                    </motion.div>
                  } />
                  <Route path="/contact" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Contact />
                    </motion.div>
                  } />
                  <Route path="/auth" element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Auth />
                    </motion.div>
                  } />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Dashboard />
                        </motion.div>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChatPage />
                        </motion.div>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Profile />
                        </motion.div>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/favorites" 
                    element={
                      <ProtectedRoute>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Favorites />
                        </motion.div>
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </main>
          <OfflineIndicator />
          <PWAInstaller />
        </ErrorBoundary>
      </div>
    </AuthProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App

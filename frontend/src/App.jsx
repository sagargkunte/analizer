import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Add Outlet here
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import DailyEntry from './pages/DailyEntry';
import Analysis from './pages/Analysis';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
// import LoadingScreen from './components/LoadingScreen';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // return <LoadingScreen message="Loading your dashboard..." />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // return <LoadingScreen message="Loading..." />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            icon: '🎉',
            style: {
              background: '#10b981',
            },
          },
          error: {
            icon: '❌',
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Private Routes - Layout with Sidebar and Navbar */}
        <Route path="/" element={
          <PrivateRoute>
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
                    <Outlet /> {/* This renders the child routes */}
                  </div>
                </main>
              </div>
            </div>
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="daily-entry" element={<DailyEntry />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
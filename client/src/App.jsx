import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import MyBorrowings from './pages/MyBorrowings';
import AdminEquipment from './pages/AdminEquipment';
import AdminBorrowings from './pages/AdminBorrowings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public & Student Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/equipment"
                element={
                  <ProtectedRoute>
                    <EquipmentList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/equipment/:id"
                element={
                  <ProtectedRoute>
                    <EquipmentDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-borrowings"
                element={
                  <ProtectedRoute>
                    <MyBorrowings />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/equipment"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminEquipment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/borrowings"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminBorrowings />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
            Campus AV Equipment Lending & Inventory Management System &copy; 2026
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

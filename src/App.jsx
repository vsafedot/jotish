import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import List from './pages/List';
import Details from './pages/Details';
import Analytics from './pages/Analytics';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Employee Insights Dashboard</h1>
      </header>
      <main className="flex-1 overflow-hidden relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/list" element={
            <ProtectedRoute>
              <List />
            </ProtectedRoute>
          } />
          
          <Route path="/details/:id" element={
            <ProtectedRoute>
              <Details />
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/list" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

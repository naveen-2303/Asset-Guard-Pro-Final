import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Professional notifications
import Login from './Login';
import Dashboard from './Dashboard';
import Register from './Register';
import './App.css';

function App() {
  return (
    <Router>
      {/* 1. Toaster: This allows notifications to pop up on any page */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          },
        }} 
      />
      
      {/* 2. Main Wrapper: Ensures the background animation is global */}
      <div className="App">
        <Routes>
          {/* Default Page: Login */}
          <Route path="/" element={<Login />} />
          
          {/* Registration Page */}
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard (Protected Area) */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
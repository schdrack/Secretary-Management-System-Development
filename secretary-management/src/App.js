import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Users from './components/Users'; // import at top

import 'jspdf-autotable';
import Reports from './components/Reports';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Clients from './components/Clients';
import Navbar from './components/Navbar'; // import styled navbar

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/api/user')
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  return (
    <Router>
      {user && <Navbar />} {/* Show navbar only when logged in */}

      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
          
            <Route path="/" element={<Home setUser={setUser} />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/users" element={<Users />} /> 
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;

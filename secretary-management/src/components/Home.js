import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (

    

    <div className="home-container">
      <h2>Welcome {user?.username || 'User'}!</h2>
      <p>Select an action:</p>

      <div className="home-buttons">
        <Link to="/clients">Manage Clients</Link>
        <Link to="/users">Manage Users</Link>
        <Link to="/reports">Generate Reports</Link>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Home;

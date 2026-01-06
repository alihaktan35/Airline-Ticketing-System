import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/home');
    };

    return (
        <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/home">Home</Link>
                <Link to="/search">Search Flights</Link>
            </div>
            <div>
                {isAuthenticated && user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>Welcome, {user.username} (Points: {user.milesPoints || 0})</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <Link to="/login">
                        <button>Login</button>
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;

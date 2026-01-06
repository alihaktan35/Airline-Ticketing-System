import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3002/login', {
                username,
                password,
            });

            const { token } = response.data;
            const decoded: { role: string } = jwtDecode(token);

            if (decoded.role !== 'admin') {
                setError('Access denied. You are not an admin.');
                setLoading(false);
                return;
            }
            
            localStorage.setItem('admin_token', token);
            // In a real app, you would redirect to the dashboard.
            // For now, we'll just log success.
            console.log('Admin login successful, token stored.');
            alert('Admin login successful!');
            // Example of redirect: window.location.href = '/add-flight';

        } catch (err: any) {
            setError(err.response?.data || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Get token from iam-service
            const loginResponse = await axios.post('http://localhost:3002/login', {
                username,
                password,
            });
            const { token } = loginResponse.data;
            const decoded: { id: number; role: string } = jwtDecode(token);

            // 2. Get user profile from iam-service
            const userProfileResponse = await axios.get(`http://localhost:3002/users/${decoded.id}`);
            
            // 3. Update auth context
            login(token, userProfileResponse.data);

            // 4. Redirect to home page
            navigate('/home');

        } catch (err: any) {
            setError(err.response?.data || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>User Login</h2>
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

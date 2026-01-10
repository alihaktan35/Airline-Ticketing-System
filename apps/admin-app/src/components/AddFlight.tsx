import React, { useState } from 'react';
import axios from 'axios';

const AddFlight = () => {
    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [flightDate, setFlightDate] = useState('');
    const [flightCode, setFlightCode] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [capacity, setCapacity] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [predicting, setPredicting] = useState(false);

    const handlePredictPrice = async () => {
        setPredicting(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:3000/api/v1/flights/flights/predict-price');
            setPrice(response.data.predictedPrice.toString());
        } catch (err) {
            setError('Failed to predict price. Please try again.');
        } finally {
            setPredicting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('admin_token');
        if (!token) {
            setError('You must be logged in to add a flight.');
            setLoading(false);
            return;
        }

        const flightData = { 
            fromCity, 
            toCity, 
            flightDate, 
            flightCode, 
            price: parseFloat(price), 
            duration: parseInt(duration), 
            capacity: parseInt(capacity) 
        };

        try {
            await axios.post('http://localhost:3000/api/v1/flights/flights', flightData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccess('Flight added successfully!');
            // Clear form
            setFromCity('');
            setToCity('');
            setFlightDate('');
            setFlightCode('');
            setPrice('');
            setDuration('');
            setCapacity('');
        } catch (err: any) {
            setError(err.response?.data || 'Failed to add flight. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Add New Flight</h2>
            <form onSubmit={handleSubmit}>
                {/* Form fields... (keeping them as they are) */}
                <div>
                    <label>From City:</label>
                    <input type="text" value={fromCity} onChange={(e) => setFromCity(e.target.value)} required />
                </div>
                <div>
                    <label>To City:</label>
                    <input type="text" value={toCity} onChange={(e) => setToCity(e.target.value)} required />
                </div>
                <div>
                    <label>Flight Date:</label>
                    <input type="date" value={flightDate} onChange={(e) => setFlightDate(e.target.value)} required />
                </div>
                <div>
                    <label>Flight Code:</label>
                    <input type="text" value={flightCode} onChange={(e) => setFlightCode(e.target.value)} required />
                </div>
                <div>
                    <label>Price:</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    <button type="button" onClick={handlePredictPrice} disabled={predicting}>
                        {predicting ? 'Predicting...' : 'Predict Price'}
                    </button>
                </div>
                <div>
                    <label>Duration (in minutes):</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                </div>
                <div>
                    <label>Capacity:</label>
                    <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Flight'}
                </button>
            </form>
        </div>
    );
};

export default AddFlight;

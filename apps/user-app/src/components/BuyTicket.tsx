import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Define the Flight interface based on the entity
interface Flight {
  id: number;
  fromCity: string;
  toCity: string;
  flightDate: string;
  flightCode: string;
  price: number;
  duration: number;
  capacity: number;
}

const POINTS_PER_DOLLAR = 10;

const BuyTicket = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth(); // Get user from auth context
    const [flight, setFlight] = useState<Flight | null>(null);
    const [numberOfPassengers, setNumberOfPassengers] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingStatus, setBookingStatus] = useState('');

    useEffect(() => {
        const fetchFlight = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/flights/${id}`);
                setFlight(response.data);
            } catch (err) {
                setError('Failed to fetch flight details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchFlight();
        }
    }, [id]);

    const handleBooking = async (withPoints = false) => {
        setLoading(true);
        setError('');
        setBookingStatus('');

        const url = withPoints
            ? `http://localhost:3001/flights/${id}/book-with-points`
            : `http://localhost:3001/flights/${id}/book`;
        
        const payload = { 
            userId: user?.id, 
            numberOfPassengers 
        };

        // A user must be logged in to book any ticket
        if (!user) {
            setError('Please log in to book a ticket.');
            setLoading(false);
            return;
        }

        try {
            await axios.post(url, payload);
            setBookingStatus('Booking successful!');
            // Re-fetch flight to show updated capacity
            const response = await axios.get(`http://localhost:3001/flights/${id}`);
            setFlight(response.data);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Booking failed.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !bookingStatus) return <p>Loading flight details...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!flight) return <p>No flight details found.</p>;

    const totalPrice = flight.price * numberOfPassengers;
    const totalPointsCost = totalPrice * POINTS_PER_DOLLAR;
    const userHasEnoughPoints = user && user.milesPoints && user.milesPoints >= totalPointsCost;

    return (
        <div>
            <h2>Buy Ticket</h2>
            <h3>{flight.flightCode}: {flight.fromCity} to {flight.toCity}</h3>
            <p>Date: {new Date(flight.flightDate).toLocaleDateString()}</p>
            <p>Price per ticket: ${flight.price}</p>
            <p>Remaining Capacity: {flight.capacity}</p>
            <hr />
            <div>
                <label>Number of Passengers:</label>
                <input 
                    type="number" 
                    value={numberOfPassengers} 
                    onChange={(e) => setNumberOfPassengers(parseInt(e.target.value, 10))}
                    min="1"
                    max={flight.capacity}
                />
            </div>
            <p>Total Price: ${totalPrice}</p>
            <button onClick={() => handleBooking(false)} disabled={loading || !user}>
                {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
            {!user && <small style={{ color: 'red', marginLeft: '1rem' }}>Please log in to book.</small>}
            
            {user && (
                <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
                    <h4>Miles&Smiles Booking</h4>
                    <p>Your Points: {user.milesPoints || 0}</p>
                    <p>Cost in Points: {totalPointsCost}</p>
                    <button onClick={() => handleBooking(true)} disabled={!userHasEnoughPoints || loading}>
                        {loading ? 'Confirming...' : 'Buy with Points'}
                    </button>
                    {!userHasEnoughPoints && <small style={{ color: 'red' }}>Not enough points.</small>}
                </div>
            )}

            {bookingStatus && <p style={{ color: 'green' }}>{bookingStatus}</p>}
        </div>
    );
};

export default BuyTicket;

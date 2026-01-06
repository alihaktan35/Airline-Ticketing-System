import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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

const BuyTicket = () => {
    const { id } = useParams<{ id: string }>();
    const [flight, setFlight] = useState<Flight | null>(null);
    const [numberOfPassengers, setNumberOfPassengers] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingStatus, setBookingStatus] = useState('');

    useEffect(() => {
        const fetchFlight = async () => {
            try {
                // This endpoint doesn't exist yet, I will add it.
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

    const handleBooking = async () => {
        setLoading(true);
        setError('');
        setBookingStatus('');
        try {
            const response = await axios.post(`http://localhost:3001/flights/${id}/book`, {
                numberOfPassengers,
            });
            setBookingStatus('Booking successful!');
            // Optionally, re-fetch flight to show updated capacity
        } catch (err: any) {
            setError(err.response?.data?.message || 'Booking failed.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading flight details...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!flight) return <p>No flight details found.</p>;

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
                    max={flight.capacity} // Prevent selecting more than available
                />
            </div>
            <p>Total Price: ${flight.price * numberOfPassengers}</p>
            <button onClick={handleBooking} disabled={loading}>
                {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
            {bookingStatus && <p style={{ color: 'green' }}>{bookingStatus}</p>}
        </div>
    );
};

export default BuyTicket;

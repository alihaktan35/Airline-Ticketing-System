import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Define the Flight interface based on the entity
interface Flight {
  id: number;
  fromCity: string;
  toCity: string;
  flightDate: string; // Keep as string for simplicity in display
  flightCode: string;
  price: number;
  duration: number; // in minutes
  capacity: number;
}

const SearchFlights = () => {
    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [flightDate, setFlightDate] = useState('');
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFlights([]);

        if (!fromCity || !toCity || !flightDate) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:3001/flights', {
                params: { fromCity, toCity, flightDate }
            });
            setFlights(response.data);
            if (response.data.length === 0) {
                setError('No flights found for the selected criteria.');
            }
        } catch (err) {
            setError('Failed to fetch flights. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Search for Flights</h2>
            <form onSubmit={handleSearch}>
                <div>
                    <label>From:</label>
                    <input type="text" value={fromCity} onChange={(e) => setFromCity(e.target.value)} required />
                </div>
                <div>
                    <label>To:</label>
                    <input type="text" value={toCity} onChange={(e) => setToCity(e.target.value)} required />
                </div>
                <div>
                    <label>Date:</label>
                    <input type="date" value={flightDate} onChange={(e) => setFlightDate(e.target.value)} required />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                <h3>Results</h3>
                {flights.length > 0 ? (
                    <ul>
                        {flights.map((flight) => (
                            <li key={flight.id}>
                                {flight.flightCode}: {flight.fromCity} to {flight.toCity} on {new Date(flight.flightDate).toLocaleDateString()} for ${flight.price}
                                <Link to={`/buy-ticket/${flight.id}`}>
                                    <button>Book</button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !loading && !error && <p>Please search for flights.</p>
                )}
            </div>
        </div>
    );
};

export default SearchFlights;
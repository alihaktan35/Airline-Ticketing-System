import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SearchFlights from '../components/SearchFlights';

import BuyTicket from '../components/BuyTicket';

const Home = () => <h2>User Home</h2>;

const UserRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<SearchFlights />} />
        <Route path="/buy-ticket/:id" element={<BuyTicket />} />
        <Route path="/" element={<Home />} /> {/* Default route */}
      </Routes>
    </Router>
  );
};

export default UserRoutes;

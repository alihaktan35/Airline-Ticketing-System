import React from 'react';
import UserRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import './App.css'; // Assuming you still want some global styling

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main style={{ padding: '1rem' }}>
          <UserRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;

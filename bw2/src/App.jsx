import { useState } from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginComponent from './components/LoginComponent';
import ProtectedRoute from './components/ProtectedRoute';
import HomeComponent from './components/HomeComponent';
import NavbarComponent from './components/NavbarComponent';
import RegisterComponent from './components/RegisterComponent';
import ProfileComponent from './components/ProfileComponent';
import AggiungiIndirizzoComponent from './components/AggiungiIndirizzoComponent';
import IndirizziListComponent from './components/IndirizziListComponent';

function App() {
  const [authToken, setAuthToken] = useState(
    localStorage.getItem('authToken') || null
  );

  const handleLogin = (token) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
  };

  return (
    <>

      {/* Se il token esiste mostriamo la navbar e gli passiamo la funzione di logout */}
      {authToken && <NavbarComponent onLogout={handleLogout} />}
      <Routes>

        {/* Route Pubbliche */}
        <Route path="/register" element={<RegisterComponent />} />

        {/* Pagina di Login */}
        <Route
          path="/login"
          element={
            authToken ? (
              // Se l'utente è GIÀ loggato, lo reindirizzo ad una pagina
              <Navigate to="/" replace />
            ) : (
              // Altrimenti mostro il componente di login
              <LoginComponent onLoginSuccess={handleLogin} />
            )
          }
        />

        {/* --- Route Protette --- */}
        <Route path="/" element={
          <ProtectedRoute token={authToken}>
            <HomeComponent />
          </ProtectedRoute>
        } />

        <Route path="/profilo" element={
          <ProtectedRoute token={authToken}>
            <ProfileComponent />
          </ProtectedRoute>
        } />

        <Route path="/indirizzi" element={
          <ProtectedRoute token={authToken}>
            <IndirizziListComponent />
          </ProtectedRoute>
        } />

        <Route path="/indirizzi/nuovo" element={
          <ProtectedRoute token={authToken}>
             <AggiungiIndirizzoComponent/>
            
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App

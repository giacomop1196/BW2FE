import { Navigate } from 'react-router-dom';

function ProtectedRoute({ token, children }) {
    if (!token) {
        // Se non c'è il token, reindirizza alla pagina di login
        return <Navigate to="/login" replace />;
    }

    // Se il token esiste, renderizza il componente figlio richiesto
    return children;
}

export default ProtectedRoute;
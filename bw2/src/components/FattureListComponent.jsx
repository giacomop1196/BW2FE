import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, ListGroup, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

function FattureListComponent() {
    const [fattureData, setFattureData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0); 
    const navigate = useNavigate();

    const fetchFatture = useCallback((pagina = 0) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Accesso non autorizzato. Per favore, fai il login.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        // Aggiunge i parametri di paginazione all'URL
        const API_URL = `${API_BASE_URL}/fatture?page=${pagina}&size=10&sort=data,desc`;
        setLoading(true);
        setError(null);

        fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                throw new Error('Sessione scaduta. Effettua nuovamente il login.');
            }
            if (!response.ok) throw new Error('Impossibile caricare le fatture.');
            return response.json();
        })
        .then(data => {
            setFattureData(data); // Salva l'intera risposta 'Page'
            setPage(data.number); // Aggiorna la pagina corrente
        })
        .catch(err => {
            setError(err.message);
            if (err.message.includes('Sessione scaduta')) {
                setTimeout(() => navigate('/login'), 2000);
            }
        })
        .finally(() => {
            setLoading(false);
        });
    }, [navigate]);

    useEffect(() => {
        fetchFatture(page);
    }, [fetchFatture, page]); // Ricarica quando 'page' cambia

    const handleDelete = (id) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Sessione scaduta.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        if (!window.confirm('Sei sicuro di voler eliminare questa fattura?')) return;

        fetch(`${API_BASE_URL}/fatture/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) throw new Error('Sessione scaduta.');
            if (response.status === 204) {
                fetchFatture(page); // Ricarica la lista
            } else {
                throw new Error('Errore durante l\'eliminazione.');
            }
        })
        .catch(err => setError(err.message));
    };

    // Formattatore per valuta
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    if (loading && !fattureData) { // Mostra solo il loading iniziale
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Caricamento fatture...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    const fatture = fattureData ? fattureData.content : [];

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={10}>
                    <Card className=' rounded-5'>
                        <Card.Header as="h3">Tutte le Fatture</Card.Header>
                        <Card.Body>
                            {loading && <Spinner animation="border" size="sm" />}
                            
                            {fatture && fatture.length > 0 ? (
                                <ListGroup variant="flush">
                                    {fatture.map(fattura => (
                                        <ListGroup.Item key={fattura.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{fattura.cliente?.ragioneSociale || 'Cliente non disp.'}</strong>
                                                <br />
                                                <small>
                                                    Nr: {fattura.numero} | Data: {fattura.data} | Importo: {formatCurrency(fattura.importo)}
                                                    <br/>
                                                    Stato: <span style={{ color: fattura.stato?.nome === 'PAGATA' ? 'green' : 'red' }}>
                                                        {fattura.stato?.nome || 'N/D'}
                                                    </span>
                                                </small>
                                            </div>
                                            <div>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(fattura.id)}>
                                                    Elimina
                                                </Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="info">Nessuna fattura trovata.</Alert>
                            )}

                            {/* Paginazione */}
                            {fattureData && fattureData.totalPages > 1 && (
                                <Pagination className="mt-3 justify-content-center">
                                    <Pagination.Prev 
                                        onClick={() => setPage(page - 1)} 
                                        disabled={fattureData.first} 
                                    />
                                    <Pagination.Item active>{page + 1} di {fattureData.totalPages}</Pagination.Item>
                                    <Pagination.Next 
                                        onClick={() => setPage(page + 1)} 
                                        disabled={fattureData.last} 
                                    />
                                </Pagination>
                            )}

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default FattureListComponent;
import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; 

function ClientiListComponent() {
    const [clientiData, setClientiData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchClienti = useCallback(() => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError('Accesso non autorizzato. Per favore, fai il login.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const API_URL = `${API_BASE_URL}/clienti`; 
        setLoading(true);
        setError(null);

        fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                throw new Error('Sessione scaduta. Effettua nuovamente il login.');
            }
            if (!response.ok) {
                throw new Error('Impossibile caricare i clienti.');
            }
            return response.json();
        })
        .then(data => {
            setClientiData(data); 
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
        fetchClienti();
    }, [fetchClienti]);

    const handleDelete = (id) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Sessione scaduta.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (!window.confirm('Sei sicuro di voler eliminare questo cliente?')) {
            return;
        }

        const API_URL_DELETE = `${API_BASE_URL}/clienti/${id}`;
        
        fetch(API_URL_DELETE, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                throw new Error('Sessione scaduta.');
            }
            if (response.status === 204) {
                fetchClienti(); 
            } else {
                 throw new Error('Errore during l\'eliminazione.');
            }
        })
        .catch(err => {
            setError(err.message);
        });
    };


    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Caricamento clienti...</p>
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

    const clienti = clientiData ? clientiData.content : [];

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={10}>
                    <Card>
                        <Card.Header as="h3">I tuoi Clienti</Card.Header>
                        <Card.Body>
                            <Button 
                                variant="primary" 
                                className="mb-3"
                                onClick={() => navigate('/clienti/nuovo')}
                            >
                                Aggiungi nuovo cliente
                            </Button>
                            
                            {clienti && clienti.length > 0 ? (
                                <ListGroup variant="flush">
                                    {clienti.map(cliente => (
                                        <ListGroup.Item key={cliente.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{cliente.ragioneSociale}</strong> 
                                                <small className="text-muted ms-2">({cliente.tipoCliente || 'N/D'})</small>
                                                <br />
                                                <small>
                                                    P.IVA: {cliente.partitaIva || 'N/D'} | 
                                                    Email: {cliente.email || 'N/D'}
                                                </small>
                                            </div>
                                            <div>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(cliente.id)}>
                                                    Elimina
                                                </Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="info">Non hai ancora aggiunto nessun cliente.</Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ClientiListComponent;
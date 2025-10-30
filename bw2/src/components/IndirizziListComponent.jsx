import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; 

function IndirizziListComponent() {
    const [indirizziData, setIndirizziData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchIndirizzi = useCallback(() => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError('Accesso non autorizzato. Per favore, fai il login.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const API_URL = `${API_BASE_URL}/api/indirizzi`;
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
                throw new Error('Impossibile caricare gli indirizzi.');
            }
            return response.json();
        })
        .then(data => {
            setIndirizziData(data);
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
        fetchIndirizzi();
    }, [fetchIndirizzi]);

    const handleDelete = (id) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Sessione scaduta.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (!window.confirm('Sei sicuro di voler eliminare questo indirizzo?')) {
            return;
        }

        const API_URL_DELETE = `${API_BASE_URL}/api/indirizzi/${id}`;
        
        fetch(API_URL_DELETE, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                throw new Error('Sessione scaduta.');
            }
            if (!response.ok) {
                throw new Error('Errore durante l\'eliminazione.');
            }
            // Ricarica la lista dopo l'eliminazione
            fetchIndirizzi(); 
        })
        .catch(err => {
            setError(err.message);
        });
    };


    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Caricamento indirizzi...</p>
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

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={10}>
                    <Card className='rounded-5'>
                        <Card.Header as="h3"><i class="bi bi-map-fill me-2"></i>Gestisci Indirizzi</Card.Header>
                        <Card.Body>
                            <Button 
                                variant="primary" 
                                className="mb-3 rounded-5"
                                onClick={() => navigate('/indirizzi/nuovo')}
                            >
                                <i className="bi bi-plus-circle"></i> Aggiungi nuovo indirizzo
                            </Button>
                            
                            {indirizziData && indirizziData.content && indirizziData.content.length > 0 ? (
                                <ListGroup variant="flush">
                                    {indirizziData.content.map(indirizzo => (
                                        <ListGroup.Item key={indirizzo.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{indirizzo.via}, {indirizzo.civico}</strong><br />
                                                <small>
                                                    {indirizzo.cap} {indirizzo.localita ? indirizzo.localita : ''} 
                                                    ({indirizzo.comune})
                                                </small>
                                            </div>
                                            <div>
                                                <Button variant="outline-danger" className='rounded-4' size="sm" onClick={() => handleDelete(indirizzo.id)}>
                                                  <i className="bi bi-trash3"></i>  Elimina
                                                </Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                 </ListGroup>
                            ) : (
                                <Alert variant="info">Non hai ancora aggiunto nessun indirizzo.</Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default IndirizziListComponent;
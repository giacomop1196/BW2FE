import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; 

function ProfileComponent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Funzione per caricare i dati del profilo
        const fetchProfileData = () => {
           
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError('Accesso non autorizzato. Per favore, fai il login.');
                setLoading(false);
               
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

           
            const API_PROFILE_URL = `${API_BASE_URL}/utenti/me`;

            setLoading(true);
            setError(null);

            
            fetch(API_PROFILE_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    // Token scaduto o non valido
                    localStorage.removeItem('authToken');
                  
                    throw new Error('Sessione scaduta. Effettua nuovamente il login.');
                }
                if (!response.ok) {
                    throw new Error('Impossibile caricare i dati del profilo.');
                }
                return response.json();
            })
            .then(data => {
                setUser(data);
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
        };

        fetchProfileData();
    }, [navigate]); 


    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </Spinner>
                <p>Caricamento del tuo profilo...</p>
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

    if (user) {
        return (
            <Container className="mt-5">
                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card className='rounded-5'>
                            <Card.Header as="h3"><i className="bi bi-person-circle me-2"></i>Il tuo Profilo</Card.Header>
                            <Card.Body>
                                <Card.Title>{user.nome} {user.cognome}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">@{user.username}</Card.Subtitle>
                                <hr />
                                <Card.Text>
                                    <strong>Email:</strong> {user.email}
                                </Card.Text>
                               
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return null;
}

export default ProfileComponent;
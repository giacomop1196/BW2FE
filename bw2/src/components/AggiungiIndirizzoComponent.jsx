import { useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

function AggiungiIndirizzoComponent() {

    const [formData, setFormData] = useState({
        via: '',
        civico: '',
        localita: '',
        cap: '',
        comune: ''
    });
    
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

  
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

   
    const handleSubmit = (e) => {
        e.preventDefault();

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Accesso non autorizzato. Fai il login.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        
        const payload = {
            via: formData.via,
            civico: formData.civico,
            localita: formData.localita,
            cap: parseInt(formData.cap, 10), 
            comune: formData.comune 
        };
        
        const API_URL_CREATE = `${API_BASE_URL}/api/indirizzi`;

        fetch(API_URL_CREATE, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload) 
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                throw new Error('Sessione scaduta. Effettua il login.');
            }
            if (response.status === 400) {
                 return response.json().then(errData => {
                     const msg = errData.message || 'Dati non validi. Controlla i campi.';
                     throw new Error(msg);
                 });
            }
            if (!response.ok) {
                throw new Error('Errore durante la creazione dell\'indirizzo.');
            }
            return response.json(); 
        })
        .then(data => {
            setSuccess('Indirizzo aggiunto con successo! Sarai reindirizzato...');
            console.log(data)
            // Resetta il form
            setFormData({ via: '', civico: '', localita: '', cap: '', comune: '' });
            setTimeout(() => navigate('/indirizzi'), 2000);
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

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <Card>
                        <Card.Header as="h3">Aggiungi Nuovo Indirizzo</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                {/* Messaggi di stato */}
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}
                                
                                <Form.Group className="mb-3" controlId="formVia">
                                    <Form.Label>Via</Form.Label>
                                    <Form.Control type="text" name="via" value={formData.via} onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formCivico">
                                    <Form.Label>Numero Civico</Form.Label>
                                    <Form.Control type="text" name="civico" value={formData.civico} onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formLocalita">
                                    <Form.Label>Località (opzionale)</Form.Label>
                                    <Form.Control type="text" name="localita" value={formData.localita} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formCap">
                                    <Form.Label>CAP</Form.Label>
                                    <Form.Control
                                        type="number" 
                                        name="cap"
                                        value={formData.cap}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formComune">
                                    <Form.Label>Comune</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="comune"
                                        value={formData.comune}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <hr />

                                <Button variant="secondary" onClick={() => navigate('/indirizzi')} className="me-2" disabled={loading}>
                                    Annulla
                                </Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? 'Salvataggio...' : 'Salva Indirizzo'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default AggiungiIndirizzoComponent;
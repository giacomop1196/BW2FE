import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

function AggiungiFatturaComponent() {
    const { clienteId } = useParams(); // Ottiene l'ID del cliente dall'URL
    const [formData, setFormData] = useState({
        numero: '',
        data: '',
        importo: '',
        statoId: '' // Salveremo solo l'ID dello stato
    });

    const [statiFattura, setStatiFattura] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingStati, setLoadingStati] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    // Carica gli stati fattura per il menu <select>
    const fetchStatiFattura = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Accesso non autorizzato.');
            setLoadingStati(false);
            return;
        }

        const API_URL_STATI = `${API_BASE_URL}/api/statifattura`;

        fetch(API_URL_STATI, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                setStatiFattura(data.content || data);
            })
            .catch(err => setError('Impossibile caricare gli stati fattura.', err))
            .finally(() => setLoadingStati(false));
    }, []);

    useEffect(() => {
        fetchStatiFattura();
    }, [fetchStatiFattura]);

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
            setError('Sessione scaduta.');
            return;
        }

        if (!formData.statoId) {
            setError('Devi selezionare uno stato per la fattura.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        // Prepariamo il payload come richiesto dal @RequestBody Fattura
        const payload = {
            numero: formData.numero,
            data: formData.data,
            importo: parseFloat(formData.importo),
            // L'entità Fattura si aspetta un oggetto StatoFattura
            stato: {
                id: formData.statoId
            }
        };

        // L'endpoint di creazione usa l'ID cliente dall'URL
        const API_URL_CREATE = `${API_BASE_URL}/fatture/cliente/${clienteId}`;

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
                if (!response.ok) {
                    return response.json().then(errData => {
                        const msg = errData.message || 'Errore durante la creazione della fattura.';
                        throw new Error(msg);
                    });
                }
                return response.json();
            })
            .then(data => {
                setSuccess(`Fattura ${data.numero} creata con successo!`);
                setFormData({ numero: '', data: '', importo: '', statoId: '' });
                setTimeout(() => navigate('/fatture'), 2000); // Ritorna alla lista fatture
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <Card className='rounded-5'>
                        <Card.Header as="h3"><i className="bi bi-plus-circle"></i> Aggiungi Fattura per Cliente</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}

                                <Form.Group className="mb-3" controlId="formNumero">
                                    <Form.Label>Numero Fattura</Form.Label>
                                    <Form.Control className='rounded-5' type="text" name="numero" value={formData.numero} onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formData">
                                    <Form.Label>Data Fattura</Form.Label>
                                    <Form.Control className='rounded-5' type="date" name="data" value={formData.data} onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formImporto">
                                    <Form.Label>Importo (€)</Form.Label>
                                    <Form.Control className='rounded-5' type="number" step="0.01" name="importo" value={formData.importo} onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formStato">
                                    <Form.Label>Stato Fattura</Form.Label>
                                    {loadingStati ? <Spinner size="sm" /> : (
                                        <Form.Select className='rounded-5' name="statoId" value={formData.statoId} onChange={handleChange} required>
                                            <option value="">Seleziona uno stato...</option>
                                            {statiFattura.map(stato => (
                                                <option key={stato.id} value={stato.id}>
                                                    {stato.code}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    )}
                                </Form.Group>

                                <hr />
                                <Button variant="secondary" onClick={() => navigate('/clienti')} className="me-2 rounded-5" disabled={loading}>
                                    Annulla
                                </Button>
                                <Button variant="primary" className='rounded-5' type="submit" disabled={loading || loadingStati}>
                                  <i className="bi bi-floppy"></i>  {loading ? 'Salvataggio...' : 'Salva Fattura'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default AggiungiFatturaComponent;
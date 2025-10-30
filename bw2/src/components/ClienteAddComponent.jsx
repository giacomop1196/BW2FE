import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; 

function ClienteAddComponent() {
    const [formData, setFormData] = useState({
        ragioneSociale: '',
        partitaIva: '',
        email: '',
        pec: '',
        telefono: '',
        fatturatoAnnuale: '',
        logoAziendale: '',
        tipoCliente: '', 
        emailContatto: '',
        nomeContatto: '',
        cognomeContatto: '',
        telefonoContatto: '',
        indirizzoSedeLegaleId: '', 
        indirizzoSedeOperativaId: ''
    });
    
    const [indirizzi, setIndirizzi] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingIndirizzi, setLoadingIndirizzi] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    // Carica indirizzi per i select
    const fetchIndirizzi = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Accesso non autorizzato.');
            setLoadingIndirizzi(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const API_URL = `${API_BASE_URL}/api/indirizzi`;
        setLoadingIndirizzi(true);

        fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                throw new Error('Sessione scaduta.');
            }
            if (!response.ok) throw new Error('Impossibile caricare gli indirizzi.');
            return response.json();
        })
        .then(data => {
            setIndirizzi(data.content || []); 
        })
        .catch(err => {
            setError(err.message);
        })
        .finally(() => {
            setLoadingIndirizzi(false);
        });
    }, [navigate]);

    useEffect(() => {
        fetchIndirizzi();
    }, [fetchIndirizzi]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Sessione scaduta. Effettua il login.');
            setLoading(false);
            return;
        }

        if (!formData.ragioneSociale || !formData.partitaIva || !formData.email || 
            !formData.tipoCliente || !formData.indirizzoSedeLegaleId) {
            setError('Ragione Sociale, P.IVA, Email, Tipo Cliente e Sede Legale sono obbligatori.');
            setLoading(false);
            return;
        }
        
        const payload = {
            ragioneSociale: formData.ragioneSociale,
            partitaIva: formData.partitaIva,
            email: formData.email,
            pec: formData.pec || null,
            telefono: formData.telefono || null,
            fatturatoAnnuale: formData.fatturatoAnnuale ? parseFloat(formData.fatturatoAnnuale) : null,
            logoAziendale: formData.logoAziendale || null,
            tipoCliente: formData.tipoCliente, 

            emailContatto: formData.emailContatto || null,
            nomeContatto: formData.nomeContatto || null,
            cognomeContatto: formData.cognomeContatto || null,
            telefonoContatto: formData.telefonoContatto || null,

            indirizzoSedeLegale: formData.indirizzoSedeLegaleId ? { id: formData.indirizzoSedeLegaleId } : null,
            indirizzoSedeOperativa: formData.indirizzoSedeOperativaId ? { id: formData.indirizzoSedeOperativaId } : null
            
        };

        fetch(`${API_BASE_URL}/clienti`, {
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
                throw new Error('Sessione scaduta.');
            }
            if (response.status === 201) { 
                return response.json();
            }
             return response.json().then(errData => {
                 throw new Error(errData.message || 'Errore nella creazione del cliente.');
             });
        })
        .then(data => {
            setSuccess(`Cliente "${data.ragioneSociale}" creato con successo!`);
            // Reset completo del form
            setFormData({
                ragioneSociale: '', partitaIva: '', email: '', pec: '', telefono: '',
                fatturatoAnnuale: '', logoAziendale: '', tipoCliente: '',
                emailContatto: '', nomeContatto: '', cognomeContatto: '', telefonoContatto: '',
                indirizzoSedeLegaleId: '', indirizzoSedeOperativaId: ''
            });
            setTimeout(() => navigate('/clienti'), 2000);
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
                <Col md={9}>
                    <Card>
                        <Card.Header as="h3">Aggiungi Nuovo Cliente</Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                
                                <h5 className="mt-2">Dati Aziendali</h5>
                                <hr/>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="ragioneSociale">
                                            <Form.Label>Ragione Sociale <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" name="ragioneSociale" value={formData.ragioneSociale} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="partitaIva">
                                            <Form.Label>Partita IVA <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" name="partitaIva" value={formData.partitaIva} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="email">
                                            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="pec">
                                            <Form.Label>PEC</Form.Label>
                                            <Form.Control type="email" name="pec" value={formData.pec} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="telefono">
                                            <Form.Label>Telefono</Form.Label>
                                            <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="fatturatoAnnuale">
                                            <Form.Label>Fatturato Annuale</Form.Label>
                                            <Form.Control type="number" step="0.01" name="fatturatoAnnuale" value={formData.fatturatoAnnuale} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                 <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="tipoCliente">
                                            <Form.Label>Tipo Cliente <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="tipoCliente" value={formData.tipoCliente} onChange={handleChange} required>
                                                <option value="">Seleziona un tipo...</option>
                                                <option value="PA">PA</option>
                                                <option value="SAS">SAS</option>
                                                <option value="SPA">SPA</option>
                                                <option value="SRL">SRL</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="logoAziendale">
                                            <Form.Label>Logo Aziendale (URL)</Form.Label>
                                            <Form.Control type="text" name="logoAziendale" value={formData.logoAziendale} onChange={handleChange} placeholder="http://..." />
                                        </Form.Group>
                                    </Col>
                                </Row>


                                <h5 className="mt-4">Dati Contatto</h5>
                                <hr/>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="nomeContatto">
                                            <Form.Label>Nome Contatto</Form.Label>
                                            <Form.Control type="text" name="nomeContatto" value={formData.nomeContatto} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="cognomeContatto">
                                            <Form.Label>Cognome Contatto</Form.Label>
                                            <Form.Control type="text" name="cognomeContatto" value={formData.cognomeContatto} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="emailContatto">
                                            <Form.Label>Email Contatto</Form.Label>
                                            <Form.Control type="email" name="emailContatto" value={formData.emailContatto} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="telefonoContatto">
                                            <Form.Label>Telefono Contatto</Form.Label>
                                            <Form.Control type="tel" name="telefonoContatto" value={formData.telefonoContatto} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h5 className="mt-4">Indirizzi</h5>
                                <hr />
                                
                                {loadingIndirizzi ? (
                                    <div className="text-center">
                                        <Spinner animation="border" size="sm" /> 
                                        <p>Caricamento indirizzi...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Form.Group className="mb-3" controlId="indirizzoSedeLegaleId">
                                            <Form.Label>Sede Legale <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="indirizzoSedeLegaleId" value={formData.indirizzoSedeLegaleId} onChange={handleChange} required>
                                                <option value="">Seleziona un indirizzo...</option>
                                                {indirizzi.map(ind => (
                                                    <option key={ind.id} value={ind.id}>
                                                        {ind.via}, {ind.civico} - {ind.cap} {ind.comune}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="indirizzoSedeOperativaId">
                                            <Form.Label>Sede Operativa (se diversa)</Form.Label>
                                            <Form.Select name="indirizzoSedeOperativaId" value={formData.indirizzoSedeOperativaId} onChange={handleChange}>
                                                <option value="">Seleziona un indirizzo (o lascia vuoto)...</option>
                                                {indirizzi.map(ind => (
                                                    <option key={ind.id} value={ind.id}>
                                                        {ind.via}, {ind.civico} - {ind.cap} {ind.comune}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </>
                                )}

                                <div className="mt-4 d-flex justify-content-between">
                                    <Button variant="secondary" onClick={() => navigate('/clienti')}>
                                        Annulla
                                    </Button>
                                    <Button variant="primary" type="submit" disabled={loading || loadingIndirizzi}>
                                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Salva Cliente'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ClienteAddComponent;
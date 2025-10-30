import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const API_REGISTER_URL = 'http://localhost:5000/auth/register';

function RegisterComponent() {
    const [nome, setNome] = useState('');
    const [cognome, setCognome] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const registerPayload = {
            nome: nome,
            cognome: cognome,
            username: username,
            email: email,
            password: password,
            ruolo: "ROLE_USER"
        };

        fetch(API_REGISTER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerPayload),
        })
            .then((response) => {
                return response.json().then((data) => ({
                    ok: response.ok,
                    data: data,
                    status: response.status
                })).catch(err => {

                    console.error("Errore parsing JSON:", err);
                    return { ok: false, data: { message: "Errore del server." } };
                });
            })
            .then((result) => {
                if (!result.ok) {
                    let errorMsg = (result.data && result.data.message)
                        ? result.data.message
                        : 'Errore durante la registrazione.';

                    if (result.status === 400 && result.data.errors) {
                        errorMsg = Object.values(result.data.errors).join(' ');
                    }

                    throw new Error(errorMsg);
                }

                setSuccess('Registrazione avvenuta con successo! Sarai reindirizzato al login fra 3 secondi.');

                setNome('');
                setCognome('');
                setUsername('');
                setEmail('');
                setPassword('');

                // Reindirizzo al login dopo 3 secondi
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);

            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Container>
            <Row className="justify-content-md-center mt-5">
                <Col xs={12} md={6}>
                    <h2 className="text-center mb-4">Registrati</h2>
                    <Form onSubmit={handleSubmit}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        <Form.Group className="mb-3" controlId="formRegisterNome">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Il tuo nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formRegisterCognome">
                            <Form.Label>Cognome</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Il tuo cognome"
                                value={cognome}
                                onChange={(e) => setCognome(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formRegisterUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Scegli un username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formRegisterEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Inserisci email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formRegisterPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading}
                            className="w-100"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    <span className="ms-2">Registrazione...</span>
                                </>
                            ) : (
                                'Registrati'
                            )}
                        </Button>

                        <div className="text-center mt-3">
                            <p>
                                Hai già un account?{' '}
                                <Link to="/login">Accedi</Link>
                            </p>
                        </div>

                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default RegisterComponent;

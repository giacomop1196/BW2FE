import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const API_LOGIN_URL = 'http://localhost:5000/auth/login';

function LoginComponent({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const loginPayload = {
            email: email,
            password: password,
        };

        fetch(API_LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload),
        })
            .then((response) => {
                return response.json().then((data) => ({
                    ok: response.ok,
                    data: data,
                })).catch(err => {
                    console.error("Errore parsing JSON:", err);
                    return { ok: false, data: { message: "Errore del server o credenziali non valide." } };
                });
            })
            .then((result) => {
                if (!result.ok) {
                    let errorMsg = (result.data && result.data.message)
                        ? result.data.message
                        : 'Credenziali non valide.';
                    throw new Error(errorMsg);
                }

                if (!result.data.token) {
                    console.error("La risposta del login non contiene 'token'", result.data);
                    throw new Error("Errore di login: dati incompleti dal server.");
                }

                localStorage.setItem('authToken', result.data.token);

                if (onLoginSuccess) {
                    onLoginSuccess(result.data.token);
                }

                navigate('/', { replace: true });
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
                    <h2 className="text-center mb-4">Login</h2>
                    <Form onSubmit={handleSubmit}>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form.Group className="mb-3" controlId="formLoginEmail">
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

                        <Form.Group className="mb-3" controlId="formLoginPassword">
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
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Caricamento...</span>
                                </>
                            ) : (
                                'Accedi'
                            )}
                        </Button>
                        <div className="text-center mt-3">
                            <p>
                                Non hai un account?{' '}
                                <Link to="/register">Registrati</Link>
                            </p>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginComponent;
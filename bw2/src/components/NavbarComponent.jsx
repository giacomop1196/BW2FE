import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function NavbarComponent({ onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/login', { replace: true });
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
            <Container>
                <Navbar.Brand as={Link} to="/">
                    Gestione Clienti
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/clienti">
                            Clienti
                        </Nav.Link>
                        <Nav.Link as={Link} to="/indirizzi">
                            Indirizzi
                        </Nav.Link>
                        <Nav.Link as={Link} to="/fatture">
                            Fatture
                        </Nav.Link>
                    </Nav>
                    
                    <Nav>
                        <NavDropdown 
                            title="Profilo" 
                            id="basic-nav-dropdown" 
                            align="end" 
                        >
                            <NavDropdown.Item as={Link} to="/profilo">
                                Visualizza profilo
                            </NavDropdown.Item>  
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleLogout}>
                                Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;
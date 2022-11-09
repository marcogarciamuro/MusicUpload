import Navigation from './Navigation'
import About from './components/About'
import Home from './components/Home'
import Signup from './components/Signup'
import Login from './components/Login'
import Music from './components/Music'
import Models from './components/Models'
import { AuthProvider } from './contexts/AuthContext'
import { 
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { Container } from 'react-bootstrap'



function App() {
  return (
    <>
      <Router>
        <AuthProvider>
        <Navigation />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route 
              path="/signup" 
              element={
                <Container className="d-flex align-items-center justify-content-center">
                  <Signup />
                </Container>
              } />
            <Route path="/login" element={<Login />} />
            <Route path="/music" element={<Music />} />
            <Route path="/models" element={<Models />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
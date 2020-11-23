import logo from './logo.svg';
import Sidebar from './components/Sidebar';
import RecordBar from './components/RecordBar';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import './scss/_base.scss';

function App() {
  return (
    <div className="App">
      <Container fluid className="App-wrap">
        <Row>
          <Sidebar show />
          <Col>
            <RecordBar />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;

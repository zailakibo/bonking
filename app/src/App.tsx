import './App.css';
import { Wallet } from './components/Wallet';
import { Bonking } from './views/Bonking';
import {
  Routes,
  Route,
  Link,
  HashRouter as Router,
} from "react-router-dom";
import { Bonk } from './views/Bonk';
import { Home } from './views/Home';

function App() {
  return (
    <div className="App">
      <Router>
        <Wallet>
          <Link to="/">Home</Link>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Bonking />} />
            <Route path="/bonk/:slug" element={<Bonk />} />
            <Route path="/bonking/:bonkingAddress" element={<Bonk />} />
          </Routes>
        </Wallet>
      </Router>
    </div>
  );
}

export default App;

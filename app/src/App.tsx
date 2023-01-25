import './App.css';
import { Wallet } from './components/Wallet';
import { Bonking } from './views/Bonking';

function App() {
  return (
    <div className="App">
      <Wallet>
        <Bonking/>
      </Wallet>
    </div>
  );
}

export default App;

import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Wallet } from './components/Wallet';
import { SendSOLToRandomAddress } from './components/SendSol';

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <Wallet>
        <SendSOLToRandomAddress></SendSOLToRandomAddress>
      </Wallet>
    </div>
  );
}

export default App;

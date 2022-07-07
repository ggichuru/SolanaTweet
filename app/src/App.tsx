import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Connect2Phantom from "./components/connect2Phantom";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1> Solana Tweet</h1>
        <hr className="fullWidth" />

        <p>Hello There</p>
        <Connect2Phantom />
      </header>
    </div>
  );
}

export default App;

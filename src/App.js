import React, { useState } from 'react';
import './App.css';
import FrontOfficeTab from './components/FrontOfficeTab';
import BackOfficeTab from './components/BackOfficeTab';

function App() {
  const [activeTab, setActiveTab] = useState('front-office');
  const [frontOfficeGPUs, setFrontOfficeGPUs] = useState(null);
  const [frontOfficeHours, setFrontOfficeHours] = useState({ start: 9, end: 17 });

  return (
    <div className="App">
      <header className="app-header">
        <h1>BPS AI Transformation Deal Calculator</h1>
        <p className="subtitle">H200 GPU Benchmarks for LLAMA 3.3 70B NIM</p>
      </header>
      
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'front-office' ? 'active' : ''}`}
          onClick={() => setActiveTab('front-office')}
        >
          Front Office Transformation
        </button>
        <button
          className={`tab-button ${activeTab === 'back-office' ? 'active' : ''}`}
          onClick={() => setActiveTab('back-office')}
        >
          Back Office Transformation
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'front-office' && (
          <FrontOfficeTab 
            onGPUsCalculated={setFrontOfficeGPUs}
            onHoursChange={setFrontOfficeHours}
          />
        )}
        {activeTab === 'back-office' && (
          <BackOfficeTab 
            frontOfficeGPUs={frontOfficeGPUs}
            frontOfficeHours={frontOfficeHours}
          />
        )}
      </div>
    </div>
  );
}

export default App;


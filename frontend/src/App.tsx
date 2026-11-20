import { useState } from 'react';

function App() {
  const [urgency, setUrgency] = useState<string | null>(null);

  const simulateTriage = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodType: 'O+',
          symptoms: ['dizziness'],
          geoRegion: 'Texas'
        })
      });
      const data = await response.json();
      setUrgency(data.urgency);
    } catch (error) {
      console.error('Failed to connect to backend', error);
      setUrgency('ERROR: Backend Offline');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Snake Triage System</h1>
      <p>A secure portal for identifying and triaging snake bites.</p>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>Test API Connection</h3>
        <button onClick={simulateTriage} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          Run Mock Triage Request
        </button>
        {urgency && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>Triage Result: {urgency}</p>}
      </div>
    </div>
  );
}

export default App;
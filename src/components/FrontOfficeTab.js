import React, { useState } from 'react';

function FrontOfficeTab({ onGPUsCalculated, onHoursChange }) {
  const [formData, setFormData] = useState({
    // Business Inputs
    callsPerDay: '',
    avgCallDurationMinutes: '',
    turnsPerCall: '',
    inputTokensPerTurn: '',
    outputTokensPerTurn: '',
    startHour: 9,
    endHour: 17,
    // Benchmark Parameters
    ttft: '296',
    itl: '53',
    h200Rate: 35
  });

  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'startHour' || name === 'endHour') {
      onHoursChange({
        start: parseInt(name === 'startHour' ? value : formData.startHour),
        end: parseInt(name === 'endHour' ? value : formData.endHour)
      });
    }
  };

  const calculateGPUs = () => {
    const {
      callsPerDay,
      avgCallDurationMinutes,
      turnsPerCall,
      inputTokensPerTurn,
      outputTokensPerTurn,
      startHour,
      endHour,
      ttft,
      itl,
      h200Rate
    } = formData;

    // Validate business inputs
    if (!callsPerDay || !avgCallDurationMinutes || !turnsPerCall || 
        !inputTokensPerTurn || !outputTokensPerTurn) {
      alert('Please fill in all required business inputs');
      return;
    }

    // Parse values
    const calls = parseFloat(callsPerDay);
    const callDuration = parseFloat(avgCallDurationMinutes);
    const turns = parseFloat(turnsPerCall);
    const inputTokens = parseFloat(inputTokensPerTurn);
    const outputTokens = parseFloat(outputTokensPerTurn);
    const start = parseInt(startHour);
    const end = parseInt(endHour);
    const ttftMs = parseFloat(ttft);
    const itlMs = parseFloat(itl);
    const rate = parseFloat(h200Rate);

    // Operating hours
    const hoursPerDay = end - start;
    const daysPerMonth = 30;

    // Calculate total tokens
    const totalTurnsPerDay = calls * turns;
    const totalOutputTokensPerDay = totalTurnsPerDay * outputTokens;
    const totalInputTokensPerDay = totalTurnsPerDay * inputTokens;
    const totalMonthlyOutputTokens = totalOutputTokensPerDay * daysPerMonth;
    const totalMonthlyInputTokens = totalInputTokensPerDay * daysPerMonth;

    // Calculate concurrency (peak simultaneous calls)
    // Calls per hour = callsPerDay / hoursPerDay
    // If a call lasts avgCallDurationMinutes, concurrent calls = (callsPerHour * avgCallDuration) / 60
    const callsPerHour = calls / hoursPerDay;
    const concurrentCalls = Math.ceil((callsPerHour * callDuration) / 60);
    
    // Each concurrent call has multiple turns, but we process one turn at a time per call
    // Concurrency for GPU = number of concurrent calls (each processing a turn)
    const concurrency = Math.max(1, concurrentCalls);

    // Benchmark calculations
    const ttftSec = ttftMs / 1000;
    const itlSec = itlMs / 1000;
    
    // E2E latency for generating output tokens for one turn
    const e2eLatency = ttftSec + (itlSec * outputTokens);

    // Throughput per GPU (output tokens per hour)
    const outputTokensPerSecondPerGPU = (outputTokens * concurrency) / e2eLatency;
    const tokensPerHourPerGPU = outputTokensPerSecondPerGPU * 3600;

    // Total hours per month for front office
    const totalHoursPerMonth = hoursPerDay * daysPerMonth;

    // GPUs needed to handle the load
    const totalTokensPerMonthPerGPU = tokensPerHourPerGPU * totalHoursPerMonth;
    const calculatedGPUs = Math.ceil(totalMonthlyOutputTokens / totalTokensPerMonthPerGPU);
    const gpusNeeded = Math.max(4, calculatedGPUs); // Minimum 4 GPUs

    // Time to generate all tokens (in hours)
    const numberOfBatches = totalMonthlyOutputTokens / (outputTokens * concurrency);
    const timeTakenSeconds = numberOfBatches * e2eLatency;
    const timeTakenHours = timeTakenSeconds / 3600;

    // Throughput in million tokens per hour per GPU
    const throughput = (outputTokens * concurrency * 3600) / (e2eLatency * 1000000);

    // Total cost
    const totalCost = gpusNeeded * timeTakenHours * rate;

    // Response time per turn (for user experience)
    const responseTimeMs = e2eLatency * 1000;

    const calculationResults = {
      gpusNeeded,
      timeTakenHours,
      totalCost,
      e2eLatency,
      hoursPerDay,
      throughput,
      totalMonthlyOutputTokens,
      totalMonthlyInputTokens,
      totalTurnsPerDay,
      concurrentCalls,
      concurrency,
      responseTimeMs,
      callsPerHour
    };

    setResults(calculationResults);
    onGPUsCalculated(gpusNeeded);
  };

  return (
    <div>
      <div className="info-banner">
        <h2>Front Office: Real-Time Customer Service</h2>
        <div className="highlight-box" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            ⚠️ <strong>IMPORTANT:</strong> This calculator uses <strong>H200 GPU benchmarks for LLAMA 3.3 70B NIM</strong>.
          </p>
        </div>
        <p style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '1rem' }}>
          <strong>Optimize GPU resources for real-time AI-powered customer interactions</strong>
        </p>
        <h3 style={{ color: '#76b900', marginTop: '1.5rem', marginBottom: '1rem' }}>What is Front Office Transformation?</h3>
        <p>
          Front office transformation uses AI to handle real-time customer interactions like call centers, 
          live chat support, and virtual assistants. These operations require immediate responses during 
          business hours, making GPU allocation critical for maintaining service quality.
        </p>
      </div>

      <div className="example-section">
        <h3>Case Study: Enterprise Call Center</h3>
        <p>
          <strong>Scenario:</strong> A financial services company operates an AI-powered call center 
          during business hours (9 AM - 5 PM)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Calls per Day:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>1,000 calls</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Avg Call Duration:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>5 minutes</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Turns per Call:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>10 turns</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Input Tokens/Turn:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>100 tokens</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Output Tokens/Turn:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>150 tokens</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Operating Hours:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>9:00 - 17:00 (8 hours)</div>
          </div>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', fontWeight: '600' }}>
          <strong>Result:</strong> Calculate the exact number of GPUs needed to handle all calls with low latency
        </p>
      </div>

      <div className="calculation-form">
        <h3 style={{ color: '#76b900', marginBottom: '1.5rem' }}>Call Center Inputs</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Number of Calls per Day *</label>
            <input
              type="number"
              name="callsPerDay"
              value={formData.callsPerDay}
              onChange={handleInputChange}
              placeholder="e.g., 1000"
            />
            <small style={{ color: '#a0a0a0', display: 'block', marginTop: '0.5rem' }}>
              Total calls your call center handles daily
            </small>
          </div>

          <div className="form-group">
            <label>Average Call Duration (minutes) *</label>
            <input
              type="number"
              name="avgCallDurationMinutes"
              value={formData.avgCallDurationMinutes}
              onChange={handleInputChange}
              placeholder="e.g., 5"
              step="0.5"
            />
            <small style={{ color: '#a0a0a0', display: 'block', marginTop: '0.5rem' }}>
              Average length of each call
            </small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Turns per Call *</label>
            <input
              type="number"
              name="turnsPerCall"
              value={formData.turnsPerCall}
              onChange={handleInputChange}
              placeholder="e.g., 10"
            />
            <small style={{ color: '#a0a0a0', display: 'block', marginTop: '0.5rem' }}>
              Number of back-and-forth exchanges per call
            </small>
          </div>

          <div className="form-group">
            <label>Operating Hours</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                name="startHour"
                value={formData.startHour}
                onChange={handleInputChange}
                min="0"
                max="23"
                style={{ width: '80px' }}
              />
              <span style={{ color: '#a0a0a0' }}>to</span>
              <input
                type="number"
                name="endHour"
                value={formData.endHour}
                onChange={handleInputChange}
                min="0"
                max="23"
                style={{ width: '80px' }}
              />
              <span style={{ color: '#a0a0a0' }}>(24-hour format)</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Input Tokens per Turn *</label>
            <input
              type="number"
              name="inputTokensPerTurn"
              value={formData.inputTokensPerTurn}
              onChange={handleInputChange}
              placeholder="e.g., 100"
            />
            <small style={{ color: '#a0a0a0', display: 'block', marginTop: '0.5rem' }}>
              Avg tokens from customer query per turn
            </small>
          </div>

          <div className="form-group">
            <label>Output Tokens per Turn *</label>
            <input
              type="number"
              name="outputTokensPerTurn"
              value={formData.outputTokensPerTurn}
              onChange={handleInputChange}
              placeholder="e.g., 150"
            />
            <small style={{ color: '#a0a0a0', display: 'block', marginTop: '0.5rem' }}>
              Avg tokens in AI response per turn
            </small>
          </div>
        </div>

        <div className="benchmark-section">
          <h4>Model & Benchmark Parameters (LLAMA 3.3 70B NIM on H200)</h4>
          <p style={{ color: '#a0a0a0', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Pre-filled with NVIDIA H200 benchmarks. Adjust only if you have updated benchmark data.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label>TTFT (Time to First Token) in ms</label>
              <input
                type="number"
                name="ttft"
                value={formData.ttft}
                onChange={handleInputChange}
                placeholder="e.g., 296"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>ITL (Inter-Token Latency) in ms</label>
              <input
                type="number"
                name="itl"
                value={formData.itl}
                onChange={handleInputChange}
                placeholder="e.g., 53"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>H200 Rate ($ per hour)</label>
            <input
              type="number"
              name="h200Rate"
              value={formData.h200Rate}
              onChange={handleInputChange}
              placeholder="e.g., 35"
              step="0.01"
            />
          </div>
        </div>

        <button className="calculate-button" onClick={calculateGPUs}>
          Calculate GPU Requirements
        </button>
      </div>

      {results && (
        <div className="results-section">
          <h3>Calculation Results</h3>
          
          <div className="key-metrics-grid">
            <div className="key-metric-card">
              <h4>GPUs Needed</h4>
              <div className="key-value">{results.gpusNeeded}</div>
              <div className="unit">GPUs</div>
            </div>

            <div className="key-metric-card">
              <h4>Total Cost</h4>
              <div className="key-value">${results.totalCost.toFixed(2)}</div>
              <div className="unit">Monthly</div>
            </div>
          </div>

          <div className="highlight-box" style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
            <p><strong>Peak Concurrent Calls:</strong> {results.concurrentCalls} simultaneous calls</p>
            <p><strong>Response Time per Turn:</strong> {results.responseTimeMs.toFixed(0)} ms ({results.e2eLatency.toFixed(2)} seconds)</p>
            <p><strong>Calls per Hour:</strong> {results.callsPerHour.toFixed(0)} calls/hour</p>
          </div>

          <div className="result-grid">
            <div className="result-card">
              <h4>Total Turns per Day</h4>
              <div className="value">{results.totalTurnsPerDay.toLocaleString()}</div>
              <div className="unit">turns</div>
            </div>

            <div className="result-card">
              <h4>Monthly Output Tokens</h4>
              <div className="value">{(results.totalMonthlyOutputTokens / 1000000).toFixed(2)}M</div>
              <div className="unit">tokens</div>
            </div>

            <div className="result-card">
              <h4>Monthly Input Tokens</h4>
              <div className="value">{(results.totalMonthlyInputTokens / 1000000).toFixed(2)}M</div>
              <div className="unit">tokens</div>
            </div>

            <div className="result-card">
              <h4>Operating Hours</h4>
              <div className="value">{results.hoursPerDay}</div>
              <div className="unit">Hours per Day</div>
            </div>

            <div className="result-card">
              <h4>Throughput</h4>
              <div className="value">{results.throughput.toFixed(2)}</div>
              <div className="unit">Million Tokens/Hour/GPU</div>
            </div>

            <div className="result-card">
              <h4>GPU Concurrency</h4>
              <div className="value">{results.concurrency}</div>
              <div className="unit">Requests/GPU</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FrontOfficeTab;

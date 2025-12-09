import React, { useState } from 'react';

function FrontOfficeTab({ onGPUsCalculated, onHoursChange }) {
  const [formData, setFormData] = useState({
    totalMonthlyOutputTokens: '',
    concurrency: '200',
    ttft: '296',
    itl: '53',
    outputSeqLength: '30',
    startHour: 9,
    endHour: 17,
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
      totalMonthlyOutputTokens,
      concurrency,
      ttft,
      itl,
      outputSeqLength,
      startHour,
      endHour,
      h200Rate
    } = formData;

    if (!totalMonthlyOutputTokens || !concurrency || !ttft || !itl || !outputSeqLength) {
      alert('Please fill in all required fields');
      return;
    }

    const totalMonthly = parseFloat(totalMonthlyOutputTokens);
    const conc = parseFloat(concurrency);
    const ttftMs = parseFloat(ttft);
    const itlMs = parseFloat(itl);
    const outputSeq = parseFloat(outputSeqLength);
    const start = parseInt(startHour);
    const end = parseInt(endHour);
    const rate = parseFloat(h200Rate);

    const ttftSec = ttftMs / 1000;
    const itlSec = itlMs / 1000;
    const e2eLatency = ttftSec + (itlSec * outputSeq);
    const outputTokensPerSecond = (outputSeq * conc) / e2eLatency;
    const tokensPerHourPerGPU = outputTokensPerSecond * 3600;

    const hoursPerDay = end - start;
    const daysPerMonth = 30;
    const totalHoursPerMonth = hoursPerDay * daysPerMonth;

    const totalTokensPerMonthPerGPU = tokensPerHourPerGPU * totalHoursPerMonth;
    const calculatedGPUs = Math.ceil(totalMonthly / totalTokensPerMonthPerGPU);
    const gpusNeeded = Math.max(4, calculatedGPUs);

    const numberOfBatches = totalMonthly / (outputSeq * conc);
    const timeTakenSeconds = numberOfBatches * e2eLatency;
    const timeTakenHours = timeTakenSeconds / 3600;

    const throughput = (outputSeq * conc * 3600) / (e2eLatency * 1000000);
    const totalCost = gpusNeeded * timeTakenHours * rate;

    const calculationResults = {
      gpusNeeded,
      timeTakenHours,
      totalCost,
      e2eLatency,
      hoursPerDay,
      throughput
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
          <strong>Scenario:</strong> A financial services company handles 100 concurrent customer calls 
          during business hours (9 AM - 5 PM)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Concurrent Users:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>100 simultaneous calls</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Output Tokens:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>1000 (avg per conversation)</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Sequence Length:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>512 tokens</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Operating Hours:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>9:00 - 17:00 (8 hours)</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>TTFT:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>100ms (response speed)</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>ITL:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>20ms (streaming speed)</div>
          </div>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', fontWeight: '600' }}>
          <strong>Result:</strong> Calculate the exact number of GPUs needed to handle peak load without delays
        </p>
      </div>

      <div className="calculation-form">
        <h3 style={{ color: '#76b900', marginBottom: '1.5rem' }}>Business Input</h3>
        
        <div className="form-group">
          <label>Total Monthly Output Tokens *</label>
          <input
            type="number"
            name="totalMonthlyOutputTokens"
            value={formData.totalMonthlyOutputTokens}
            onChange={handleInputChange}
            placeholder="e.g., 2000000000"
          />
          <small style={{ color: '#a0a0a0', display: 'block', marginTop: '0.5rem' }}>
            Total tokens your application needs to generate per month
          </small>
        </div>

        <div className="benchmark-section">
          <h4>Model & Benchmark Parameters (LLAMA 3.3 70B NIM on H200)</h4>
          <p style={{ color: '#a0a0a0', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Pre-filled with NVIDIA H200 benchmarks. Adjust only if you have updated benchmark data.
          </p>

          <div className="form-group">
            <label>Concurrency</label>
            <input
              type="number"
              name="concurrency"
              value={formData.concurrency}
              onChange={handleInputChange}
              placeholder="e.g., 200"
            />
            <small style={{ color: '#a0a0a0', display: 'block', marginTop: '0.5rem' }}>
              Number of simultaneous requests per GPU
            </small>
          </div>

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

          <div className="form-row">
            <div className="form-group">
              <label>Output Sequence Length</label>
              <input
                type="number"
                name="outputSeqLength"
                value={formData.outputSeqLength}
                onChange={handleInputChange}
                placeholder="e.g., 30"
              />
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

          <div className="form-row">
            <div className="form-group">
              <label>Start Hour (24-hour format)</label>
              <input
                type="number"
                name="startHour"
                value={formData.startHour}
                onChange={handleInputChange}
                min="0"
                max="23"
              />
            </div>

            <div className="form-group">
              <label>End Hour (24-hour format)</label>
              <input
                type="number"
                name="endHour"
                value={formData.endHour}
                onChange={handleInputChange}
                min="0"
                max="23"
              />
            </div>
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
            <p><strong>E2E Latency:</strong> {(results.e2eLatency * 1000).toFixed(2)} ms ({results.e2eLatency.toFixed(4)} seconds)</p>
          </div>

          <div className="result-grid">
            <div className="result-card">
              <h4>Time to Generate Tokens</h4>
              <div className="value">{results.timeTakenHours.toFixed(2)}</div>
              <div className="unit">Hours</div>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default FrontOfficeTab;

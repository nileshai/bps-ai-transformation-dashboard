import React, { useState } from 'react';

function BackOfficeTab({ frontOfficeGPUs, frontOfficeHours }) {
  const [formData, setFormData] = useState({
    totalMonthlyOutputTokens: '',
    concurrency: '200',
    ttft: '296',
    itl: '53',
    outputSeqLength: '30',
    h200Rate: 35,
    useFrontOfficeGPUs: true
  });

  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateGPUs = () => {
    const {
      totalMonthlyOutputTokens,
      concurrency,
      ttft,
      itl,
      outputSeqLength,
      h200Rate,
      useFrontOfficeGPUs
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
    const rate = parseFloat(h200Rate);

    const ttftSec = ttftMs / 1000;
    const itlSec = itlMs / 1000;
    const e2eLatency = ttftSec + (itlSec * outputSeq);
    const outputTokensPerSecond = (outputSeq * conc) / e2eLatency;
    const tokensPerHourPerGPU = outputTokensPerSecond * 3600;

    let availableHoursPerDay = 24;
    let availableHoursPerMonth = 24 * 30;
    
    if (useFrontOfficeGPUs && frontOfficeGPUs && frontOfficeHours) {
      const frontOfficeHoursPerDay = frontOfficeHours.end - frontOfficeHours.start;
      availableHoursPerDay = 24 - frontOfficeHoursPerDay;
      availableHoursPerMonth = availableHoursPerDay * 30;
    }

    let gpusNeeded;
    if (useFrontOfficeGPUs && frontOfficeGPUs) {
      gpusNeeded = Math.max(4, frontOfficeGPUs);
    } else {
      const totalTokensPerMonthPerGPU = tokensPerHourPerGPU * availableHoursPerMonth;
      const calculatedGPUs = Math.ceil(totalMonthly / totalTokensPerMonthPerGPU);
      gpusNeeded = Math.max(4, calculatedGPUs);
    }

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
      availableHoursPerDay,
      throughput,
      usingFrontOfficeGPUs: useFrontOfficeGPUs && frontOfficeGPUs
    };

    setResults(calculationResults);
  };

  return (
    <div>
      <div className="info-banner">
        <h2>Back Office: Batch Processing & Automation</h2>
        <div className="highlight-box" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            ⚠️ <strong>IMPORTANT:</strong> This calculator uses <strong>H200 GPU benchmarks for LLAMA 3.3 70B NIM</strong>.
          </p>
        </div>
        <p style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '1rem' }}>
          <strong>Maximize GPU utilization during off-peak hours for high-volume batch operations</strong>
        </p>
        <h3 style={{ color: '#76b900', marginTop: '1.5rem', marginBottom: '1rem' }}>What is Back Office Transformation?</h3>
        <p>
          Back office transformation leverages the same GPU infrastructure during off-peak hours to process 
          batch workloads like document digitization, audio transcription, data processing, and task automation. 
          This maximizes ROI by utilizing idle resources outside business hours.
        </p>
      </div>

      <div className="example-section">
        <h3>Case Study: Document Processing Pipeline</h3>
        <p>
          <strong>Scenario:</strong> A legal firm needs to digitize and extract insights from 10,000 contracts 
          using GPUs idle after business hours
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Documents:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>10,000 contracts</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Avg Tokens/Doc:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>2,048 tokens</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Output Length:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>512 tokens (summaries)</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>Available Hours:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>16 hours (off-peak)</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>TTFT:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>296ms (batch processing)</div>
          </div>
          <div style={{ background: 'rgba(118, 185, 0, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(118, 185, 0, 0.3)' }}>
            <strong style={{ color: '#76b900' }}>ITL:</strong>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>53ms</div>
          </div>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', fontWeight: '600' }}>
          <strong>Result:</strong> Calculate how many documents can be processed overnight using front office GPUs
        </p>
        <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
          <strong>Other Use Cases:</strong> Audio transcription, video processing, data enrichment, OCR for scanned documents, automated report generation
        </p>
      </div>

      {frontOfficeGPUs && (
        <div className="highlight-box" style={{ marginBottom: '1.5rem' }}>
          <p><strong>Front Office GPUs Available:</strong> {frontOfficeGPUs} GPUs</p>
          <p><strong>Front Office Hours:</strong> {frontOfficeHours?.start || 9} AM - {frontOfficeHours?.end || 17} PM</p>
          <p>You can reuse these GPUs for back office operations during off-hours to maximize throughput.</p>
        </div>
      )}

      <div className="calculation-form">
        <h3 style={{ color: '#76b900', marginBottom: '1.5rem' }}>Business Input</h3>
        
        {frontOfficeGPUs && (
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="useFrontOfficeGPUs"
                checked={formData.useFrontOfficeGPUs}
                onChange={handleInputChange}
              />
              Use Front Office GPUs during off-hours ({frontOfficeGPUs} GPUs available)
            </label>
          </div>
        )}

        <div className="form-group">
          <label>Total Monthly Output Tokens *</label>
          <input
            type="number"
            name="totalMonthlyOutputTokens"
            value={formData.totalMonthlyOutputTokens}
            onChange={handleInputChange}
            placeholder="e.g., 5000000000"
          />
          <small style={{ color: '#a0a0a0', display: 'block', marginTop: '0.5rem' }}>
            Total tokens your batch processing needs to generate per month
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
            {results.usingFrontOfficeGPUs && (
              <p style={{ marginTop: '0.5rem' }}><strong>Note:</strong> Using front office GPUs during off-hours for maximum efficiency.</p>
            )}
          </div>

          <div className="result-grid">
            <div className="result-card">
              <h4>Time to Generate Tokens</h4>
              <div className="value">{results.timeTakenHours.toFixed(2)}</div>
              <div className="unit">Hours</div>
            </div>

            <div className="result-card">
              <h4>Available Hours</h4>
              <div className="value">{results.availableHoursPerDay}</div>
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

export default BackOfficeTab;

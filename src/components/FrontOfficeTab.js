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
    h200Rate: 35,
    // Hyperscaler comparison
    hyperscalerRatePerMin: 0.20
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
      h200Rate,
      hyperscalerRatePerMin
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
    const hyperscalerRate = parseFloat(hyperscalerRatePerMin);

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
    const callsPerHour = calls / hoursPerDay;
    const concurrentCalls = Math.ceil((callsPerHour * callDuration) / 60);
    const concurrency = Math.max(1, concurrentCalls);

    // Benchmark calculations
    const ttftSec = ttftMs / 1000;
    const itlSec = itlMs / 1000;
    const e2eLatency = ttftSec + (itlSec * outputTokens);

    // Throughput per GPU
    const outputTokensPerSecondPerGPU = (outputTokens * concurrency) / e2eLatency;
    const tokensPerHourPerGPU = outputTokensPerSecondPerGPU * 3600;

    // Total hours per month
    const totalHoursPerMonth = hoursPerDay * daysPerMonth;

    // GPUs needed
    const totalTokensPerMonthPerGPU = tokensPerHourPerGPU * totalHoursPerMonth;
    const calculatedGPUs = Math.ceil(totalMonthlyOutputTokens / totalTokensPerMonthPerGPU);
    const gpusNeeded = Math.max(4, calculatedGPUs);

    // Time to generate all tokens
    const numberOfBatches = totalMonthlyOutputTokens / (outputTokens * concurrency);
    const timeTakenSeconds = numberOfBatches * e2eLatency;
    const timeTakenHours = timeTakenSeconds / 3600;

    // Throughput
    const throughput = (outputTokens * concurrency * 3600) / (e2eLatency * 1000000);

    // NVIDIA H200 Cost
    const nvidiaMonthly = gpusNeeded * timeTakenHours * rate;
    const nvidiaYearly = nvidiaMonthly * 12;
    const nvidia3Year = nvidiaYearly * 3;
    const nvidia5Year = nvidiaYearly * 5;

    // Hyperscaler Cost (Voice Bot + Agent Assist + Insights @ $0.20/min)
    const totalMinutesPerDay = calls * callDuration;
    const totalMinutesPerMonth = totalMinutesPerDay * daysPerMonth;
    const hyperscalerMonthly = totalMinutesPerMonth * hyperscalerRate;
    const hyperscalerYearly = hyperscalerMonthly * 12;
    const hyperscaler3Year = hyperscalerYearly * 3;
    const hyperscaler5Year = hyperscalerYearly * 5;

    // Savings
    const savingsMonthly = hyperscalerMonthly - nvidiaMonthly;
    const savingsYearly = hyperscalerYearly - nvidiaYearly;
    const savings3Year = hyperscaler3Year - nvidia3Year;
    const savings5Year = hyperscaler5Year - nvidia5Year;
    const savingsPercentage = ((hyperscalerMonthly - nvidiaMonthly) / hyperscalerMonthly) * 100;

    // Response time
    const responseTimeMs = e2eLatency * 1000;

    const calculationResults = {
      gpusNeeded,
      timeTakenHours,
      totalCost: nvidiaMonthly,
      e2eLatency,
      hoursPerDay,
      throughput,
      totalMonthlyOutputTokens,
      totalMonthlyInputTokens,
      totalTurnsPerDay,
      concurrentCalls,
      concurrency,
      responseTimeMs,
      callsPerHour,
      totalMinutesPerMonth,
      // Cost comparison
      nvidiaMonthly,
      nvidiaYearly,
      nvidia3Year,
      nvidia5Year,
      hyperscalerMonthly,
      hyperscalerYearly,
      hyperscaler3Year,
      hyperscaler5Year,
      savingsMonthly,
      savingsYearly,
      savings3Year,
      savings5Year,
      savingsPercentage
    };

    setResults(calculationResults);
    onGPUsCalculated(gpusNeeded);
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
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

          <div className="form-row">
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

            <div className="form-group">
              <label>Hyperscaler Rate ($ per minute)</label>
              <input
                type="number"
                name="hyperscalerRatePerMin"
                value={formData.hyperscalerRatePerMin}
                onChange={handleInputChange}
                placeholder="e.g., 0.20"
                step="0.01"
              />
              <small style={{ color: '#a0a0a0', display: 'block', marginTop: '0.5rem' }}>
                Voice Bot + Agent Assist + Insights
              </small>
            </div>
          </div>
        </div>

        <button className="calculate-button" onClick={calculateGPUs}>
          Calculate GPU Requirements
        </button>
      </div>

      {results && (
        <>
          <div className="results-section">
            <h3>Calculation Results</h3>
            
            <div className="key-metrics-grid">
              <div className="key-metric-card">
                <h4>GPUs Needed</h4>
                <div className="key-value">{results.gpusNeeded}</div>
                <div className="unit">GPUs</div>
              </div>

              <div className="key-metric-card">
                <h4>NVIDIA Monthly Cost</h4>
                <div className="key-value">{formatCurrency(results.nvidiaMonthly)}</div>
                <div className="unit">per month</div>
              </div>
            </div>

            <div className="highlight-box" style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
              <p><strong>Peak Concurrent Calls:</strong> {results.concurrentCalls} simultaneous calls</p>
              <p><strong>Response Time per Turn:</strong> {results.responseTimeMs.toFixed(0)} ms ({results.e2eLatency.toFixed(2)} seconds)</p>
              <p><strong>Total Minutes per Month:</strong> {results.totalMinutesPerMonth.toLocaleString()} minutes</p>
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

          {/* Cost Comparison Section */}
          <div className="results-section" style={{ marginTop: '2rem' }}>
            <h3>💰 Cost Comparison: NVIDIA vs Hyperscalers</h3>
            
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(118, 185, 0, 0.2) 0%, rgba(118, 185, 0, 0.05) 100%)',
              border: '2px solid #76b900',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '1.2rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>
                Total Savings with NVIDIA H200
              </p>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#76b900', textShadow: '0 0 30px rgba(118, 185, 0, 0.5)' }}>
                {results.savingsPercentage.toFixed(0)}%
              </div>
              <p style={{ fontSize: '1.1rem', color: '#e0e0e0' }}>
                Lower cost compared to Hyperscaler solutions
              </p>
            </div>

            <p style={{ color: '#a0a0a0', marginBottom: '1.5rem', textAlign: 'center' }}>
              <strong>Hyperscaler pricing:</strong> Voice Bot + Agent Assist + Insights @ ${formData.hyperscalerRatePerMin}/minute
            </p>

            {/* Comparison Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ background: 'rgba(118, 185, 0, 0.2)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#76b900', borderBottom: '2px solid #333' }}>Time Period</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#ff6b6b', borderBottom: '2px solid #333' }}>Hyperscaler Cost</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#76b900', borderBottom: '2px solid #333' }}>NVIDIA H200 Cost</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#4ecdc4', borderBottom: '2px solid #333' }}>Your Savings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '1rem', color: '#e0e0e0' }}>Monthly</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#ff6b6b', fontWeight: 'bold' }}>{formatCurrency(results.hyperscalerMonthly)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#76b900', fontWeight: 'bold' }}>{formatCurrency(results.nvidiaMonthly)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#4ecdc4', fontWeight: 'bold' }}>{formatCurrency(results.savingsMonthly)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '1rem', color: '#e0e0e0' }}>Year 1</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#ff6b6b', fontWeight: 'bold' }}>{formatCurrency(results.hyperscalerYearly)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#76b900', fontWeight: 'bold' }}>{formatCurrency(results.nvidiaYearly)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#4ecdc4', fontWeight: 'bold' }}>{formatCurrency(results.savingsYearly)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #333', background: 'rgba(118, 185, 0, 0.05)' }}>
                    <td style={{ padding: '1rem', color: '#e0e0e0', fontWeight: 'bold' }}>3 Years</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#ff6b6b', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(results.hyperscaler3Year)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#76b900', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(results.nvidia3Year)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#4ecdc4', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(results.savings3Year)}</td>
                  </tr>
                  <tr style={{ background: 'rgba(118, 185, 0, 0.1)' }}>
                    <td style={{ padding: '1rem', color: '#76b900', fontWeight: 'bold', fontSize: '1.1rem' }}>5 Years</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#ff6b6b', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(results.hyperscaler5Year)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#76b900', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(results.nvidia5Year)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#4ecdc4', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(results.savings5Year)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Visual Bar Comparison */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#76b900', marginBottom: '1rem' }}>5-Year Cost Visualization</h4>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#ff6b6b' }}>Hyperscaler</span>
                  <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>{formatCurrency(results.hyperscaler5Year)}</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '30px', 
                  background: 'rgba(255, 107, 107, 0.3)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#76b900' }}>NVIDIA H200</span>
                  <span style={{ color: '#76b900', fontWeight: 'bold' }}>{formatCurrency(results.nvidia5Year)}</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '30px', 
                  background: 'rgba(118, 185, 0, 0.2)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${(results.nvidia5Year / results.hyperscaler5Year) * 100}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #76b900 0%, #9ed63a 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(78, 205, 196, 0.05) 100%)',
                border: '2px solid #4ecdc4',
                borderRadius: '8px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#4ecdc4', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  🎉 Total 5-Year Savings
                </p>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4ecdc4' }}>
                  {formatCurrency(results.savings5Year)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FrontOfficeTab;

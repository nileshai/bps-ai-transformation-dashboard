# BPS AI Transformation Dashboard

A dark-themed dashboard for calculating AI transformation deals for Business Process Services (BPS), specifically designed for H200 GPU benchmarks with LLAMA 3.3 70B NIM.

## Features

- **Front Office Transformation**: Calculate GPU requirements for customer-facing applications (call centers, customer service)
- **Back Office Transformation**: Calculate GPU requirements for backend batch processing (digitization, transcription, automation)
- **H200 GPU Benchmarks**: All calculations based on NVIDIA H200 performance metrics with LLAMA 3.3 70B NIM
- **Cost Optimization**: Reuse front office GPUs during off-hours for back office operations

## Default Benchmark Parameters

- **Concurrency**: 200
- **TTFT (Time to First Token)**: 296 ms
- **ITL (Inter-Token Latency)**: 53 ms
- **Output Sequence Length**: 30
- **H200 Rate**: $35/hour

## Deployment

### Deploy to Netlify (Recommended)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   cd community/bps-ai-transformation-dashboard
   npm run build
   netlify deploy --prod --dir=build
   ```

### Local Development

```bash
npm install
npm start
```

## Calculation Formulas

- **E2E Latency** = TTFT + (ITL × Output Sequence Length)
- **Time to Generate Tokens** = (Total Monthly Output Tokens) / (Output Sequence Length × Concurrency) × E2E Latency / 3600
- **Total Cost** = GPUs Needed × Time to Generate Tokens × H200 Rate
- **Throughput** = (Output Sequence Length × Concurrency × 3600) / (E2E Latency × 1,000,000)


# Quick Start Guide

## Installation & Setup (30 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Build for production (compiles TS to JS)
npm run build

# 3. Start the proxy server in production mode
npm run start
```

The proxy server will start on **http://localhost:8080**

## Verify It's Working

### Option 1: Quick Test with cURL
```bash
curl -x http://localhost:8080 http://example.com
```

### Option 2: Run Tests
```bash
npm test
```

## Production Deployment

If you want the server to run in the background and restart on failure, use **PM2**:

```bash
# Install PM2 globally if you haven't
npm install -g pm2

# Build the project
npm run build

# Start the server
pm2 start dist/proxy.js --name "proxy-server"
```

## Available Scripts

- `npm run build`: Compile TypeScript to JavaScript.
- `npm run start`: Start the production server (requires build).
- `npm run start:dev`: Start the development server (uses `ts-node`).
- `npm test`: Run all tests.

## Documentation

- **README.md** - Full documentation
- **CA_SETUP.md** - Certificate configuration guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **deploy.md** (in .agent/workflows) - Deployment steps

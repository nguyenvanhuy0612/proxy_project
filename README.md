# Proxy Server Project

A robust HTTP/HTTPS proxy server built with Node.js and TypeScript for internal use.

## Features

- ✅ **HTTP Proxying**: Forward HTTP requests through the proxy
- ✅ **HTTPS Tunneling**: Support for HTTPS via CONNECT method
- ✅ **Certificate Validation Disabled**: Ignores certificate errors (suitable for internal networks)
- ✅ **Large Response Handling**: Efficiently handles large payloads
- ✅ **Header Preservation**: Maintains request headers
- ✅ **POST/PUT Support**: Handles requests with body data
- ✅ **Redirect Support**: Follows HTTP redirects
- ✅ **Concurrent Requests**: Handles multiple simultaneous connections

## Installation

```bash
npm install
```

## Build for Production

```bash
npm run build
```

The compiled JavaScript files will be in the `dist/` directory.

## Available Scripts

- `npm run build`: Compile TypeScript to JavaScript (stored in `dist/` folder).
- `npm run start`: Start the server in production mode using the compiled JavaScript.
- `npm run start:dev`: Start the server for development (uses `ts-node`).
- `npm test`: Run all test suites.
- `npm run examples`: Run usage examples.

## Production Deployment

For continuous operation on a server, it is recommended to use a process manager like **PM2**:

```bash
# Build the project
npm run build

# Start with PM2
npx pm2 start dist/proxy.js --name "proxy-server"
```

The proxy server will start on port **8080** by default.

## Testing

This will run all test suites including:
- Basic HTTP proxying tests
- HTTPS tunneling tests
- Edge case tests (large responses, slow responses, POST requests, etc.)

```bash
npm test
```

## Configuration

### Port Configuration

To change the default port, modify the `PORT` constant in `proxy.ts`:

```typescript
const PORT = 8080; // Change to your desired port
```

### Certificate Validation

Certificate validation is disabled by default for internal use:

```typescript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
```

**⚠️ Warning**: This setting makes the proxy accept any SSL certificate, including self-signed and expired certificates. Only use this in trusted internal networks.

## Using the Proxy

### With cURL

```bash
# HTTP request
curl -x http://localhost:8080 http://example.com

# HTTPS request
curl -x http://localhost:8080 https://example.com
```

### With Node.js/Axios

```javascript
const axios = require('axios');

axios.get('https://example.com', {
    proxy: {
        protocol: 'http',
        host: 'localhost',
        port: 8080
    }
}).then(response => {
    console.log(response.data);
});
```

### With Browser

Configure your browser to use `localhost:8080` as the HTTP proxy:

1. **Chrome/Edge**: Settings → System → Open proxy settings
2. **Firefox**: Settings → Network Settings → Manual proxy configuration
   - HTTP Proxy: `localhost`
   - Port: `8080`
   - Check "Also use this proxy for HTTPS"

## API

The proxy server handles:

- **HTTP Requests**: Standard GET, POST, PUT, DELETE, etc.
- **CONNECT Method**: For HTTPS tunneling
- **Direct Access**: Accessing `http://localhost:8080/` directly shows a status message

## Project Structure

```
proxy_project/
├── proxy.ts                    # Main proxy server implementation
├── dist/                       # Compiled JavaScript (after build)
├── tests/
│   ├── proxy.test.ts          # Basic HTTP proxy tests
│   ├── proxy-https.test.ts    # HTTPS tunneling tests
│   └── proxy-edge-cases.test.ts # Edge case tests
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Security Considerations

⚠️ **Important Security Notes**:

1. **Internal Use Only**: This proxy is designed for internal networks and development environments
2. **No Authentication**: The proxy does not implement authentication
3. **Certificate Validation Disabled**: All SSL certificates are accepted
4. **No Access Control**: Anyone with network access can use the proxy

**Do not expose this proxy to the public internet without implementing proper security measures.**

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, change the `PORT` constant in `proxy.ts` or kill the process using the port:

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

## License

ISC

import * as http from 'http';
import * as net from 'net';
import * as url from 'url';

// 1. Ignore certificate errors (global setting)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PORT = parseInt(process.env.PORT || '8080', 10);

const server = http.createServer((req, res) => {
    // Check if this is a proxy request (absolute URI) or a direct request
    // For a forward proxy, browsers send the full URL: http://example.com/foo
    const parsedUrl = url.parse(req.url!);

    if (!parsedUrl.hostname) {
        // Direct request to the proxy server itself
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Proxy is running. Use this address as your proxy server.');
        return;
    }

    const options: http.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 80,
        path: parsedUrl.path,
        method: req.method,
        headers: req.headers,
    };

    // Forward the request
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy Request Error:', err);
        if (!res.headersSent) {
            res.writeHead(500);
            res.end('Proxy Error');
        }
    });

    req.pipe(proxyReq, { end: true });
});

// Handle HTTPS tunneling (CONNECT method)
server.on('connect', (req, clientSocket, head) => {
    const { port, hostname } = url.parse(`//${req.url}`, false, true);

    if (!hostname || !port) {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        return;
    }

    // Connect to the destination server
    const serverSocket = net.connect(Number(port), hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
            'Proxy-agent: Node.js-Proxy\r\n' +
            '\r\n');
        serverSocket.write(head);

        // Pipe the data
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', (err) => {
        console.error('Socket Error:', err);
        clientSocket.end();
    });

    clientSocket.on('error', (err) => {
        console.error('Client Socket Error:', err);
        serverSocket.end();
    });
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Proxy server running on port ${PORT}`);
        console.log(`Certificate validation is disabled.`);
    });
}

export default server;

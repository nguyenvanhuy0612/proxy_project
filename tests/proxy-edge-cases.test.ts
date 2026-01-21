import http from 'http';
import server from '../proxy';
import axios from 'axios';
import { AddressInfo } from 'net';

describe('Proxy Server - Edge Cases', () => {
    let proxyServer: http.Server;
    let targetServer: http.Server;
    let proxyPort: number;
    let targetPort: number;
    let targetUrl: string;

    beforeAll((done) => {
        // Start Target Server with various edge cases
        targetServer = http.createServer((req, res) => {
            if (req.url === '/large') {
                // Large response
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                const largeData = 'x'.repeat(1024 * 1024); // 1MB
                res.end(largeData);
            } else if (req.url === '/slow') {
                // Slow response
                setTimeout(() => {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('Slow Response');
                }, 2000);
            } else if (req.url === '/headers') {
                // Echo headers back
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(req.headers));
            } else if (req.url === '/post' && req.method === 'POST') {
                // Handle POST with body
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ received: body }));
                });
            } else if (req.url === '/redirect') {
                // Redirect
                res.writeHead(302, { 'Location': '/test' });
                res.end();
            } else if (req.url === '/test') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('After Redirect');
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });

        targetServer.listen(0, () => {
            targetPort = (targetServer.address() as AddressInfo).port;
            targetUrl = `http://127.0.0.1:${targetPort}`;

            proxyServer = server.listen(0, () => {
                proxyPort = (proxyServer.address() as AddressInfo).port;
                done();
            });
        });
    });

    afterAll((done) => {
        proxyServer.close(() => {
            targetServer.close(done);
        });
    });

    test('should handle large responses', async () => {
        const response = await axios.get(`${targetUrl}/large`, {
            proxy: {
                protocol: 'http',
                host: '127.0.0.1',
                port: proxyPort
            },
            maxContentLength: 2 * 1024 * 1024 // 2MB
        });

        expect(response.status).toBe(200);
        expect(response.data.length).toBe(1024 * 1024);
    });

    test('should handle slow responses', async () => {
        const response = await axios.get(`${targetUrl}/slow`, {
            proxy: {
                protocol: 'http',
                host: '127.0.0.1',
                port: proxyPort
            },
            timeout: 5000
        });

        expect(response.status).toBe(200);
        expect(response.data).toBe('Slow Response');
    });

    test('should preserve request headers', async () => {
        const response = await axios.get(`${targetUrl}/headers`, {
            proxy: {
                protocol: 'http',
                host: '127.0.0.1',
                port: proxyPort
            },
            headers: {
                'X-Custom-Header': 'test-value',
                'User-Agent': 'Custom-Agent'
            }
        });

        expect(response.status).toBe(200);
        expect(response.data['x-custom-header']).toBe('test-value');
        expect(response.data['user-agent']).toBe('Custom-Agent');
    });

    test('should handle POST requests with body', async () => {
        const postData = { message: 'Hello Proxy' };
        const response = await axios.post(`${targetUrl}/post`, postData, {
            proxy: {
                protocol: 'http',
                host: '127.0.0.1',
                port: proxyPort
            }
        });

        expect(response.status).toBe(200);
        expect(response.data.received).toContain('Hello Proxy');
    });

    test('should handle redirects', async () => {
        const response = await axios.get(`${targetUrl}/redirect`, {
            proxy: {
                protocol: 'http',
                host: '127.0.0.1',
                port: proxyPort
            },
            maxRedirects: 5
        });

        expect(response.status).toBe(200);
        expect(response.data).toBe('After Redirect');
    });

    test('should handle direct request to proxy server', async () => {
        const response = await axios.get(`http://127.0.0.1:${proxyPort}/`);

        expect(response.status).toBe(200);
        expect(response.data).toContain('Proxy is running');
    });
});

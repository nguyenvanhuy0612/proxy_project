/**
 * Example usage of the proxy server
 * 
 * This file demonstrates how to use the proxy server with various HTTP clients
 */

import axios from 'axios';
import * as http from 'http';

const PROXY_HOST = 'localhost';
const PROXY_PORT = 8080;

/**
 * Example 1: Simple HTTP GET request through proxy using axios
 */
async function exampleHttpGet() {
    console.log('\n=== Example 1: HTTP GET Request ===');
    try {
        const response = await axios.get('http://example.com', {
            proxy: {
                protocol: 'http',
                host: PROXY_HOST,
                port: PROXY_PORT
            }
        });
        console.log('Status:', response.status);
        console.log('Data length:', response.data.length);
        console.log('Success!');
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

/**
 * Example 2: HTTPS GET request through proxy using axios
 */
async function exampleHttpsGet() {
    console.log('\n=== Example 2: HTTPS GET Request ===');
    try {
        const response = await axios.get('https://www.example.com', {
            proxy: {
                protocol: 'http',
                host: PROXY_HOST,
                port: PROXY_PORT
            },
            timeout: 10000
        });
        console.log('Status:', response.status);
        console.log('Data length:', response.data.length);
        console.log('Success!');
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

/**
 * Example 3: POST request with JSON body through proxy
 */
async function examplePost() {
    console.log('\n=== Example 3: POST Request with JSON ===');
    try {
        const response = await axios.post(
            'https://httpbin.org/post',
            {
                message: 'Hello from proxy!',
                timestamp: new Date().toISOString()
            },
            {
                proxy: {
                    protocol: 'http',
                    host: PROXY_HOST,
                    port: PROXY_PORT
                },
                timeout: 10000
            }
        );
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        console.log('Success!');
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

/**
 * Example 4: Request with custom headers through proxy
 */
async function exampleCustomHeaders() {
    console.log('\n=== Example 4: Request with Custom Headers ===');
    try {
        const response = await axios.get('https://httpbin.org/headers', {
            proxy: {
                protocol: 'http',
                host: PROXY_HOST,
                port: PROXY_PORT
            },
            headers: {
                'X-Custom-Header': 'MyValue',
                'User-Agent': 'CustomAgent/1.0'
            },
            timeout: 10000
        });
        console.log('Status:', response.status);
        console.log('Headers received by server:', response.data.headers);
        console.log('Success!');
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

/**
 * Example 5: Using native http module with proxy
 */
async function exampleNativeHttp() {
    console.log('\n=== Example 5: Native HTTP Module ===');

    return new Promise((resolve, reject) => {
        const options = {
            hostname: PROXY_HOST,
            port: PROXY_PORT,
            path: 'http://example.com/',
            method: 'GET',
            headers: {
                'Host': 'example.com'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('Status:', res.statusCode);
                console.log('Data length:', data.length);
                console.log('Success!');
                resolve(data);
            });
        });

        req.on('error', (error) => {
            console.error('Error:', error.message);
            reject(error);
        });

        req.end();
    });
}

/**
 * Example 6: Multiple concurrent requests
 */
async function exampleConcurrent() {
    console.log('\n=== Example 6: Concurrent Requests ===');

    const urls = [
        'https://www.example.com',
        'https://www.example.org',
        'https://www.example.net'
    ];

    try {
        const promises = urls.map(url =>
            axios.get(url, {
                proxy: {
                    protocol: 'http',
                    host: PROXY_HOST,
                    port: PROXY_PORT
                },
                timeout: 10000
            })
        );

        const results = await Promise.all(promises);

        results.forEach((response, index) => {
            console.log(`Request ${index + 1}: Status ${response.status}, Length ${response.data.length}`);
        });
        console.log('All requests completed successfully!');
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

/**
 * Main function to run all examples
 */
async function main() {
    console.log('='.repeat(60));
    console.log('Proxy Server Usage Examples');
    console.log('='.repeat(60));
    console.log(`\nMake sure the proxy server is running on ${PROXY_HOST}:${PROXY_PORT}`);
    console.log('Start it with: npm start\n');

    // Wait a bit to ensure user sees the message
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run examples
    await exampleHttpGet();
    await exampleHttpsGet();
    await examplePost();
    await exampleCustomHeaders();
    await exampleNativeHttp();
    await exampleConcurrent();

    console.log('\n' + '='.repeat(60));
    console.log('All examples completed!');
    console.log('='.repeat(60));
}

// Run examples if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

export {
    exampleHttpGet,
    exampleHttpsGet,
    examplePost,
    exampleCustomHeaders,
    exampleNativeHttp,
    exampleConcurrent
};

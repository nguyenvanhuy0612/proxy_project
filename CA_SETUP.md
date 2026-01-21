# Certificate Authority (CA) Configuration

## Overview

This proxy server is configured to ignore SSL/TLS certificate validation errors, making it suitable for internal networks where self-signed certificates or custom Certificate Authorities are used.

## Current Configuration

The proxy currently uses:
```typescript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
```

This setting **disables all certificate validation**, which means:
- ✅ Self-signed certificates are accepted
- ✅ Expired certificates are accepted
- ✅ Certificates with wrong hostnames are accepted
- ⚠️ Invalid or malicious certificates are also accepted

## Using Custom Root CA Certificates

If you want to use a custom Root CA instead of disabling all validation, follow these steps:

### Option 1: Using NODE_EXTRA_CA_CERTS (Recommended)

1. **Obtain your Root CA certificate** (usually a `.crt` or `.pem` file)

2. **Set the environment variable** before starting the proxy:

```bash
# Windows (PowerShell)
$env:NODE_EXTRA_CA_CERTS="C:\path\to\your\root-ca.crt"
npm start

# Windows (CMD)
set NODE_EXTRA_CA_CERTS=C:\path\to\your\root-ca.crt
npm start

# Linux/Mac
export NODE_EXTRA_CA_CERTS=/path/to/your/root-ca.crt
npm start
```

3. **Remove or comment out** the `NODE_TLS_REJECT_UNAUTHORIZED = "0"` line in `proxy.ts`

### Option 2: Programmatically Adding CA Certificates

Modify `proxy.ts` to include your CA certificate:

```typescript
import * as https from 'https';
import * as fs from 'fs';

// Read your CA certificate
const customCA = fs.readFileSync('./path/to/root-ca.crt');

// Add it to the default CA list
https.globalAgent.options.ca = [
    ...(https.globalAgent.options.ca || []),
    customCA
];

// Remove this line:
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
```

### Option 3: Using Multiple CA Certificates

If you have multiple CA certificates:

```typescript
import * as https from 'https';
import * as fs from 'fs';

const ca1 = fs.readFileSync('./ca1.crt');
const ca2 = fs.readFileSync('./ca2.crt');
const ca3 = fs.readFileSync('./ca3.crt');

https.globalAgent.options.ca = [
    ...(https.globalAgent.options.ca || []),
    ca1,
    ca2,
    ca3
];
```

## Converting Certificate Formats

If your CA certificate is in a different format:

### DER to PEM
```bash
openssl x509 -inform der -in certificate.cer -out certificate.pem
```

### P7B to PEM
```bash
openssl pkcs7 -print_certs -in certificate.p7b -out certificate.pem
```

### PFX to PEM
```bash
openssl pkcs12 -in certificate.pfx -out certificate.pem -nodes
```

## Testing Certificate Configuration

After configuring your CA certificates, test with:

```bash
# Start the proxy
npm start

# In another terminal, test with a site using your custom CA
curl -x http://localhost:8080 https://your-internal-site.com
```

## Security Best Practices

1. **Use Custom CA Instead of Disabling Validation**: When possible, use `NODE_EXTRA_CA_CERTS` instead of `NODE_TLS_REJECT_UNAUTHORIZED = "0"`

2. **Keep CA Certificates Updated**: Regularly update your CA certificates

3. **Limit Proxy Access**: Use firewall rules to restrict who can access the proxy

4. **Monitor Usage**: Log and monitor proxy usage for suspicious activity

5. **Use Authentication**: Consider adding authentication to the proxy (not currently implemented)

## Troubleshooting

### "UNABLE_TO_VERIFY_LEAF_SIGNATURE" Error

This means Node.js cannot verify the certificate chain. Solutions:
- Add the Root CA certificate using one of the methods above
- Verify the certificate file is in PEM format
- Check that the certificate file is readable

### "CERT_HAS_EXPIRED" Error

The certificate has expired. Solutions:
- Obtain a new certificate from your CA
- If testing, temporarily use `NODE_TLS_REJECT_UNAUTHORIZED = "0"`

### "DEPTH_ZERO_SELF_SIGNED_CERT" Error

The certificate is self-signed. Solutions:
- Add the self-signed certificate as a trusted CA
- Use `NODE_TLS_REJECT_UNAUTHORIZED = "0"` (current configuration)

## Example: Complete Setup with Custom CA

1. Create a `certs` directory:
```bash
mkdir certs
```

2. Place your `root-ca.crt` in the `certs` directory

3. Modify `proxy.ts`:
```typescript
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// Load custom CA
const caPath = path.join(__dirname, 'certs', 'root-ca.crt');
if (fs.existsSync(caPath)) {
    const customCA = fs.readFileSync(caPath);
    https.globalAgent.options.ca = [
        ...(https.globalAgent.options.ca || []),
        customCA
    ];
    console.log('Custom CA certificate loaded');
} else {
    console.warn('No custom CA found, disabling certificate validation');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
```

4. Start the proxy:
```bash
npm start
```

This approach provides a fallback: if a custom CA is available, it uses it; otherwise, it disables validation.

## References

- [Node.js TLS Documentation](https://nodejs.org/api/tls.html)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Certificate Formats Explained](https://www.ssl.com/guide/pem-der-crt-and-cer-x-509-encodings-and-conversions/)

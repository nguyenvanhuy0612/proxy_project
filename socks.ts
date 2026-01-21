import * as net from 'net';
import { logger } from './logger';

export const handleSocksConnection = (socket: net.Socket) => {
    socket.once('data', (data) => {
        // SOCKS5 Handshake
        // Client sends: [0x05, nMethods, methods...]
        if (data[0] !== 0x05) {
            logger.debug('Not SOCKS5, closing connection');
            socket.end();
            return;
        }

        // We only support NO AUTH (0x00) for now.
        // Server response: [0x05, method]
        const response = Buffer.from([0x05, 0x00]);
        socket.write(response);

        socket.once('data', (request) => {
            // Client Request: [0x05, CMD, RSV, ATYP, DST.ADDR, DST.PORT]
            if (request.length < 7 || request[0] !== 0x05 || request[2] !== 0x00) {
                logger.warn('Invalid SOCKS5 request');
                socket.end();
                return;
            }

            const cmd = request[1];
            if (cmd !== 0x01) { // 0x01 = CONNECT
                logger.warn(`SOCKS5 unsupported command: ${cmd}`);
                // Reply Command not supported
                const reply = Buffer.from([0x05, 0x07, 0x00, 0x01, 0, 0, 0, 0, 0, 0]);
                socket.end(reply);
                return;
            }

            let addr: string;
            let port: number;
            let addrLen = 0;

            try {
                const atyp = request[3];
                if (atyp === 0x01) { // IPv4
                    addr = request.slice(4, 8).join('.');
                    addrLen = 4;
                } else if (atyp === 0x03) { // Domain name
                    const len = request[4];
                    addr = request.slice(5, 5 + len).toString();
                    addrLen = len + 1; // len byte + chars
                } else if (atyp === 0x04) { // IPv6
                    // Basic IPv6 parsing (simplified)
                    logger.warn('SOCKS5 IPv6 not fully implemented yet');
                    const reply = Buffer.from([0x05, 0x08, 0x00, 0x01, 0, 0, 0, 0, 0, 0]);
                    socket.end(reply);
                    return;
                } else {
                    logger.warn(`SOCKS5 unknown address type: ${atyp}`);
                    socket.end();
                    return;
                }

                port = request.readUInt16BE(4 + addrLen);

                logger.info(`SOCKS5 Connect Request to ${addr}:${port}`);

                const target = net.createConnection(port, addr, () => {
                    // Success reply: [0x05, 0x00, 0x00, 0x01, ip, ip, ip, ip, port, port]
                    // We can just send 0.0.0.0:0 as usually clients don't verify BND.ADDR
                    const reply = Buffer.from([0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0]);
                    socket.write(reply);

                    socket.pipe(target);
                    target.pipe(socket);
                });

                target.on('error', (err: any) => {
                    logger.warn(`SOCKS5 Target Connection Error (${addr}:${port}): ${err.message}`);
                    // Reply Host Unreachable or valid code
                    if (socket.writable) {
                        const reply = Buffer.from([0x05, 0x04, 0x00, 0x01, 0, 0, 0, 0, 0, 0]);
                        socket.end(reply);
                    }
                });

                socket.on('error', (err) => {
                    logger.debug('SOCKS5 Client Socket Error', err.message);
                    target.destroy();
                });

            } catch (err: any) {
                logger.error('SOCKS5 parsing error', err);
                socket.end();
            }
        });
    });
};

import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import http from 'http';
import { Socket } from 'net';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// Do NOT use express.json() here - it conflicts with the proxy's body streaming.
// The downstream services are responsible for parsing their own request bodies.

// Service URLs from environment variables or defaults
const IAM_SERVICE_URL = process.env.IAM_SERVICE_URL || 'http://localhost:3002';
const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3001';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';

// --- Proxy Middleware ---

// IAM Service Routes (v1)
app.use('/api/v1/iam', createProxyMiddleware({
    target: IAM_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/iam': '/',
    },
    on: {
        proxyReq: (proxyReq: http.ClientRequest, req: http.IncomingMessage, res: http.ServerResponse) => {
            console.log(`[API Gateway] Forwarding request to IAM service: ${(req.method as string)} ${(req.url as string)}`);
        },
        error: (err: Error, req: http.IncomingMessage, res: http.ServerResponse | Socket) => {
            console.error('[API Gateway] IAM Proxy Error:', err);
            if (res instanceof http.ServerResponse && !res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'IAM Service Unavailable', error: err.message }));
            }
        }
    }
}));

// Flight Service Routes (v1)
app.use('/api/v1/flights', createProxyMiddleware({
    target: FLIGHT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/flights': '/',
    },
    on: {
        proxyReq: (proxyReq: http.ClientRequest, req: http.IncomingMessage, res: http.ServerResponse) => {
            console.log(`[API Gateway] Forwarding request to Flight service: ${(req.method as string)} ${(req.url as string)}`);
        },
        error: (err: Error, req: http.IncomingMessage, res: http.ServerResponse | Socket) => {
            console.error('[API Gateway] Flight Proxy Error:', err);
            if (res instanceof http.ServerResponse && !res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Flight Service Unavailable', error: err.message }));
            }
        }
    }
}));

// Notification Service Routes (v1)
app.use('/api/v1/notifications', createProxyMiddleware({
    target: NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/notifications': '/',
    },
    on: {
        proxyReq: (proxyReq: http.ClientRequest, req: http.IncomingMessage, res: http.ServerResponse) => {
            console.log(`[API Gateway] Forwarding request to Notification service: ${(req.method as string)} ${(req.url as string)}`);
        },
        error: (err: Error, req: http.IncomingMessage, res: http.ServerResponse | Socket) => {
            console.error('[API Gateway] Notification Proxy Error:', err);
            if (res instanceof http.ServerResponse && !res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Notification Service Unavailable', error: err.message }));
            }
        }
    }
}));

app.get('/', (req, res) => {
    res.send('API Gateway is running!');
});

app.listen(port, () => {
    console.log(`API Gateway is running at http://localhost:${port}`);
});

import { Hono } from 'hono';

// Placeholder routes - will be implemented later
const createPlaceholderRouter = (name) => {
    const app = new Hono();
    app.all('*', (c) => c.json({ message: `${name} endpoint - Coming soon` }, 501));
    return app;
};

export const organizations = createPlaceholderRouter('Organizations');
export const numbers = createPlaceholderRouter('Numbers');
export const calls = createPlaceholderRouter('Calls');
export const sms = createPlaceholderRouter('SMS');
export const billing = createPlaceholderRouter('Billing');
export const keys = createPlaceholderRouter('API Keys');

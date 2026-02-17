import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { configureApi } from '@node2flow/dashboard-core';
import './index.css';
import App from './App';

// Configure API URLs before any React rendering
configureApi({
  platformUrl: import.meta.env.VITE_PLATFORM_URL || 'http://localhost:8787',
  gatewayUrl: import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8788',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

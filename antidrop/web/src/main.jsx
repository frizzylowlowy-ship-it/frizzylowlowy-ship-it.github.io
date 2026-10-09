import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { DEMO } from './lib/demo.js';
import { MotionConfig } from 'framer-motion';
import App from './App.jsx';
import { AuthProvider } from './lib/auth.jsx';
import { ToastProvider } from './components/ui.jsx';
import './styles/global.css';

// В демо-версии без сервера адресная строка не меняется — переходы внутри страницы
const Router = DEMO ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </MotionConfig>
    </Router>
  </StrictMode>,
);

import React from 'react';

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import {PlatformProvider} from './context/PlatformContext';
import {NotificationsProvider} from './context/NotificationsContext';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PlatformProvider><NotificationsProvider><App /></NotificationsProvider></PlatformProvider>
    </BrowserRouter>
  </React.StrictMode>
)

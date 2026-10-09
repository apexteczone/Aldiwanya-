import React from 'react';

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import {PlatformProvider} from './context/PlatformContext';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PlatformProvider><App /></PlatformProvider>
    </BrowserRouter>
  </React.StrictMode>
)

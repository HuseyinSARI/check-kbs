import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

import { DataProvider } from './context/DataContext'; // DataProvider'ı import et

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DataProvider> {/* App bileşenini DataProvider ile sar */}
      <App />
    </DataProvider>
  </React.StrictMode>
);

reportWebVitals();
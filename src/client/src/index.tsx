import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AppStateProvider } from './AppState';

render(
  <React.StrictMode>
    <AppStateProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppStateProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

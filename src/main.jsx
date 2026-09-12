import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import store from './store/store';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

// Global styles (order matters: variables must load before global rules)
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/utilities.css';
import './styles/responsive.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

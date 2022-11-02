import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { ReactQueryProvider } from './lib/react-query'
import { AuthProvider } from './lib/auth';
import { BrowserRouter as Router } from 'react-router-dom';
ReactDOM.render(
  <ReactQueryProvider>
    <AuthProvider>
      <React.StrictMode>
        <Router>
          <App />
        </Router>
      </React.StrictMode>
    </AuthProvider>
  </ReactQueryProvider>,
  document.getElementById('root')
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ОСЬ ЦЕЙ РЯДОК ВКЛЮЧИТЬ КРАСУ НА ВСІХ СТОРІНКАХ:
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
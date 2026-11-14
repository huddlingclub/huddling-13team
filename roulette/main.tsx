import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { OrderQrProvider } from './components/OrderQr'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OrderQrProvider>
      <App />
    </OrderQrProvider>
  </React.StrictMode>,
)



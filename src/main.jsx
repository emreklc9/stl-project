import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import appIcon from './assets/image/3d-icon.png'
import './index.scss'
import App from './App.jsx'

const favicon =
  document.querySelector('link[rel="icon"]') ?? document.createElement('link')
favicon.rel = 'icon'
favicon.type = 'image/png'
favicon.href = appIcon
if (!favicon.parentNode) document.head.appendChild(favicon)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

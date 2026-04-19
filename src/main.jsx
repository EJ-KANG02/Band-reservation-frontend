import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const APP_VERSION = '1.3'

const storedVersion = localStorage.getItem('appVersion')
if (storedVersion !== APP_VERSION) {
  const keys = ['accessToken','userNickname','userTeamName','userName','userStudentId','userRole','userBatch','userPosition','appSettings']
  keys.forEach(k => localStorage.removeItem(k))
  localStorage.setItem('appVersion', APP_VERSION)
  if (storedVersion !== null) {
    window.location.replace('/login')
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

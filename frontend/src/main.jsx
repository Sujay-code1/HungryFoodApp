
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./index.css";
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import { store } from './redux/store.js';
import axios from 'axios'

// Initialize Authorization header from stored token (if present)
const savedToken = localStorage.getItem('token')
if (savedToken) axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`

createRoot(document.getElementById('root')).render(
  
  <BrowserRouter>
    <Provider store={store} >
        <App />
    </Provider>
          
  </BrowserRouter>
 

)

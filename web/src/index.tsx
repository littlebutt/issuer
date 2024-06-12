import React from 'react'

import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import './lib/utils'
import AppRoutes from './routes'
import { BrowserRouter } from 'react-router-dom'

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <BrowserRouter>
        <AppRoutes />
    </BrowserRouter>
);
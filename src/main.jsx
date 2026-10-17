import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from "react-router/dom";
import { router } from './Route/Route.jsx';
import AuthProvider from './Context/AuthProvider.jsx';
import AppToaster from './Components/Notifications/AppToaster';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
   <RouterProvider router={router} />
   <AppToaster />
    </AuthProvider>
   
  </StrictMode>,
)

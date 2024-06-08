import React, { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Login } from './pages/login';
import { HomePage } from './pages/home';
import { MoviePage } from './pages/movie';
import { createRoot } from 'react-dom/client';


// Este es un componente de ruta privada
function PrivateRoute({ children }: { children: ReactNode }) {
  const isLoggedIn = localStorage.getItem('token');

  return isLoggedIn ? children : <Navigate to="/login" />;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/movie/:id" element={<PrivateRoute><MoviePage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
);




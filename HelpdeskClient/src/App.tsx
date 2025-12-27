import { BrowserRouter, Navigate, Outlet, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom'
import  Header  from './components/Header'
import Login from './components/login'
import {Register}   from './components/Register'
import Users from './components/Users'
import { AuthGuard, AuthProvider } from './context/AuthContext'
import {Tickets} from './components/Tickets'
import Statuses from './components/Statuses'

function App() {
  return <> 
  <AuthProvider>
   <Header />
   <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route
        path="/"
        element={<Navigate to="/login" />}
      />
      <Route
      path='/dashboard'
      element={<div>ברוכים הבאים</div>}
      />
      <Route path="/users" element={<Users />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/statuses" element={<Statuses />} />
   </Routes>
  </AuthProvider>
  </>
}
export default App

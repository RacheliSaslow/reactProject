import { BrowserRouter, Navigate, Outlet, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom'
import  Header  from './components/Header'
import Login from './components/login'
import {Register}   from './components/Register'
import Users from './components/Users'
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import {Tickets} from './components/Tickets'
import Statuses from './components/Statuses'
import TicketById from './components/TicketById'
import Dashboard from './components/Dashboard'
import NewTicket from './components/NewTicket'
import Footer from './components/Footer';

function App() {
  return <>
  <AuthProvider>
   <Header />
   <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/" element={<Navigate to="/login" />}/>
      
      <Route path='/dashboard'  element={<AuthGuard><Dashboard /></AuthGuard>}/>
      <Route path="/users" element={<AuthGuard allowedRoles={['admin']}><Users /></AuthGuard>} />
      <Route path="/tickets" element={<AuthGuard><Tickets /></AuthGuard>} />
      <Route path="/tickets/new" element={<AuthGuard allowedRoles={['customer']}><NewTicket /></AuthGuard>} />
      <Route path="/tickets/:id" element={<AuthGuard><TicketById /></AuthGuard>} />
      <Route path="/statuses" element={<AuthGuard allowedRoles={['admin']}><Statuses /></AuthGuard>} />
      <Route path="*" element={<div>404 - דף לא נמצא</div>} />
   </Routes>
   <Footer/>
  </AuthProvider>
  </>
}
export default App

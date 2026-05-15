import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Shipments from './pages/Shipments';
import Carriers from './pages/Carriers';

function PrivateRoute({ children }: { children: any }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
            <PrivateRoute>
                <Dashboard />
            </PrivateRoute>
        } />
        <Route path="/customers" element={
            <PrivateRoute>
                <Customers />
            </PrivateRoute>
        } />
        <Route path="/shipments" element={
            <PrivateRoute>
                <Shipments />
            </PrivateRoute>
        } />
        <Route path="/carriers" element={
            <PrivateRoute>
                <Carriers />
            </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App

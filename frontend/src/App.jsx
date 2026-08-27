import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import StoresList from './pages/admin/StoresList';
import NormalStoresList from './pages/normal/StoresList';
import OwnerDashboard from './pages/owner/OwnerDashboard';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersList />} />
          <Route path="/admin/stores" element={<StoresList />} />
          
          {/* Normal User Routes */}
          <Route path="/user/stores" element={<NormalStoresList />} />
          
          {/* Store Owner Routes */}
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

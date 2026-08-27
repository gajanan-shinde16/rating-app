import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Key, Menu, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'STORE_OWNER') return '/owner/dashboard';
    return '/user/stores';
  };

  const onChangePassword = async (data) => {
    try {
      await api.put('/auth/update-password', { newPassword: data.password });
      toast.success('Password updated successfully!');
      setShowPwdModal(false);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.error?.[0]?.message || 'Failed to update password');
    }
  };

  return (
    <>
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-6">
          <Link to={getDashboardRoute()} className="font-bold text-2xl text-blue-600 tracking-tight hover:opacity-80">
            StoreRatings
          </Link>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-4 items-center border-l pl-6 border-gray-200">
            {role === 'ADMIN' && (
              <>
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
                <Link to="/admin/users" className="text-gray-600 hover:text-blue-600 font-medium">Users</Link>
                <Link to="/admin/stores" className="text-gray-600 hover:text-blue-600 font-medium">Stores</Link>
              </>
            )}
            {role === 'NORMAL' && (
              <Link to="/user/stores" className="text-gray-600 hover:text-blue-600 font-medium">All Stores</Link>
            )}
            {role === 'STORE_OWNER' && (
              <Link to="/owner/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
            )}
          </div>
        </div>

        <div className="hidden md:flex gap-4 items-center">
          <span className="text-gray-600 font-medium hidden lg:inline">Hello, {name}</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold tracking-wider uppercase">{role}</span>
          
          <button onClick={() => setShowPwdModal(true)} className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 p-2 rounded transition-colors cursor-pointer" title="Change Password">
            <Key size={18} />
          </button>
          
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 p-2 rounded transition-colors cursor-pointer font-medium" title="Logout">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full left-0 z-20 flex flex-col p-4">
          <span className="text-gray-500 text-sm mb-4">Logged in as: {name}</span>
          
          {role === 'ADMIN' && (
            <>
              <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="py-2 border-b text-gray-700">Dashboard</Link>
              <Link to="/admin/users" onClick={() => setMenuOpen(false)} className="py-2 border-b text-gray-700">Manage Users</Link>
              <Link to="/admin/stores" onClick={() => setMenuOpen(false)} className="py-2 border-b text-gray-700">Manage Stores</Link>
            </>
          )}
          
          <button onClick={() => { setShowPwdModal(true); setMenuOpen(false); }} className="py-2 border-b text-gray-700 text-left flex gap-2"><Key size={18}/> Change Password</button>
          <button onClick={handleLogout} className="py-2 text-red-500 text-left flex gap-2 mt-2"><LogOut size={18}/> Logout</button>
        </div>
      )}

      {/* Change Password Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input 
                  type="password" 
                  {...register('password', { required: true })} 
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Min 8 chars, 1 uppercase, 1 special"
                />
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <button type="button" onClick={() => setShowPwdModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer transition-colors shadow-sm">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

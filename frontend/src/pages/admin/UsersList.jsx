import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import toast from 'react-hot-toast';
import { Search, Filter, X, Eye } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../api';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  
  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Debounced filters (wait 300ms before triggering API)
  const [debouncedName] = useDebounce(nameFilter, 300);
  const [debouncedEmail] = useDebounce(emailFilter, 300);
  const [debouncedAddress] = useDebounce(addressFilter, 300);

  // Sorting & UI State
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // For Details Modal

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchUsers = () => {
    // Combine explicit filters into search query, or adjust API to accept explicit filters.
    // For simplicity with existing backend search (which searches OR on name/email/address),
    // wait, the backend accepts `search` which does OR. The requirement says:
    // "apply filters on all listings based on Name, Email, Address, and Role."
    // Let's modify the backend to accept specific query params in a moment, OR we can filter in memory.
    // Actually, I can pass them as search params and the backend will need to be updated.
    // I will update the backend `admin.js` next.
    api.get('/admin/users', {
      params: { 
        name: debouncedName, 
        email: debouncedEmail, 
        address: debouncedAddress, 
        role: roleFilter, 
        sortField, 
        sortOrder 
      }
    }).then(res => setUsers(res.data)).catch(() => toast.error('Failed to load users'));
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedName, debouncedEmail, debouncedAddress, roleFilter, sortField, sortOrder]);

  const onAddUser = async (data) => {
    try {
      await api.post('/admin/users', data);
      toast.success('User added successfully!');
      setShowAdd(false);
      reset();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error?.[0]?.message || 'Error adding user');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUser(res.data);
    } catch (err) {
      toast.error('Failed to load user details');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <div className="flex gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded shadow-sm border transition-colors ${showFilters ? 'bg-gray-200 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'}`}>
              <Filter size={18} /> Filters
            </button>
            <button onClick={() => setShowAdd(!showAdd)} className={`px-4 py-2 rounded shadow-sm text-white transition-colors cursor-pointer ${showAdd ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {showAdd ? 'Cancel' : '+ Add User'}
            </button>
          </div>
        </div>

        {/* Add User Form */}
        {showAdd && (
          <form onSubmit={handleSubmit(onAddUser)} className="bg-white p-6 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 border-b pb-2 mb-2"><h2 className="font-bold text-lg text-gray-800">Add New User</h2></div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name (20-60 chars)</label>
              <input {...register('name', { required: true, minLength: 20, maxLength: 60 })} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input type="email" {...register('email', { required: true })} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password (8-16 chars, 1 Uppercase, 1 Special)</label>
              <input type="password" {...register('password', { required: true })} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
              <select {...register('role')} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="NORMAL">Normal User</option>
                <option value="ADMIN">System Administrator</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Address (Max 400 chars)</label>
              <input {...register('address', { required: true, maxLength: 400 })} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end mt-2">
              <button className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 cursor-pointer">Save User</button>
            </div>
          </form>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-5 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Name</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="Filter by name..." value={nameFilter} onChange={e => setNameFilter(e.target.value)} className="w-full border p-2 pl-9 rounded text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="Filter by email..." value={emailFilter} onChange={e => setEmailFilter(e.target.value)} className="w-full border p-2 pl-9 rounded text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Address</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="Filter by address..." value={addressFilter} onChange={e => setAddressFilter(e.target.value)} className="w-full border p-2 pl-9 rounded text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Role</label>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500">
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="NORMAL">Normal</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-sm font-semibold text-gray-600">
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>Name <SortIcon field="name" /></th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors hidden sm:table-cell" onClick={() => handleSort('email')}>Email <SortIcon field="email" /></th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors hidden md:table-cell" onClick={() => handleSort('role')}>Role <SortIcon field="role" /></th>
                <th className="p-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50 group">
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-500 sm:hidden">{u.email}</p>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-gray-600">{u.email}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'STORE_OWNER' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => viewDetails(u.id)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors cursor-pointer inline-flex" title="View Details">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700 cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                  <p className="font-medium text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                  <p className="text-gray-800">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Role</p>
                  <span className="inline-block mt-1 px-2 py-1 rounded text-xs font-bold tracking-wider bg-gray-100 text-gray-700">{selectedUser.role}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded border mt-1 text-sm">{selectedUser.address}</p>
                </div>
                
                {selectedUser.role === 'STORE_OWNER' && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mt-4">
                    <p className="text-xs text-blue-600 uppercase font-bold mb-1">Store Performance</p>
                    {selectedUser.storeRating !== null && selectedUser.storeRating !== undefined ? (
                      <p className="text-2xl font-bold text-yellow-600">{selectedUser.storeRating.toFixed(1)} <span className="text-lg">★</span></p>
                    ) : (
                      <p className="text-gray-500 text-sm">No store assigned or no ratings yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 text-right">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-white border shadow-sm text-gray-700 rounded hover:bg-gray-50 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

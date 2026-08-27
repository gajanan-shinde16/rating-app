import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../api';

export default function StoresList() {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Explicit filters
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  
  // Debounced explicit filters
  const [debouncedName] = useDebounce(nameFilter, 300);
  const [debouncedAddress] = useDebounce(addressFilter, 300);

  // Sorting & UI state
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchStores = () => {
    api.get('/stores', { 
      params: { 
        name: debouncedName, 
        address: debouncedAddress, 
        sortField, 
        sortOrder 
      } 
    }).then(res => setStores(res.data)).catch(() => toast.error('Failed to load stores'));
  };

  useEffect(() => {
    fetchStores();
  }, [debouncedName, debouncedAddress, sortField, sortOrder]);

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'STORE_OWNER' } }).then(res => setUsers(res.data));
  }, []);

  const onAddStore = async (data) => {
    try {
      if (!data.ownerId) delete data.ownerId;
      await api.post('/stores', data);
      toast.success('Store added successfully!');
      setShowAdd(false);
      reset();
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.error?.[0]?.message || 'Error adding store');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortOrder('asc');
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
          <h1 className="text-3xl font-bold text-gray-800">Store Management</h1>
          <div className="flex gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded shadow-sm border transition-colors cursor-pointer ${showFilters ? 'bg-gray-200 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <Filter size={18} /> Filters
            </button>
            <button onClick={() => setShowAdd(!showAdd)} className={`px-4 py-2 rounded shadow-sm text-white transition-colors cursor-pointer ${showAdd ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}>
              {showAdd ? 'Cancel' : '+ Add Store'}
            </button>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={handleSubmit(onAddStore)} className="bg-white p-6 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 border-b pb-2 mb-2"><h2 className="font-bold text-lg text-gray-800">Add New Store</h2></div>
            <div><label className="block text-sm font-medium mb-1 text-gray-700">Name</label><input {...register('name', { required: true })} className="w-full border p-2 rounded outline-none focus:border-green-500" /></div>
            <div><label className="block text-sm font-medium mb-1 text-gray-700">Email</label><input type="email" {...register('email', { required: true })} className="w-full border p-2 rounded outline-none focus:border-green-500" /></div>
            <div className="col-span-1 md:col-span-2"><label className="block text-sm font-medium mb-1 text-gray-700">Address (Max 400 chars)</label><input {...register('address', { required: true })} className="w-full border p-2 rounded outline-none focus:border-green-500" /></div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Assign Owner (Optional)</label>
              <select {...register('ownerId')} className="w-full border p-2 rounded outline-none focus:border-green-500">
                <option value="">-- No Owner Assigned --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end mt-2">
              <button className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 cursor-pointer">Save Store</button>
            </div>
          </form>
        )}

        {showFilters && (
          <div className="bg-white p-5 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Store Name</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="Filter by name..." value={nameFilter} onChange={e => setNameFilter(e.target.value)} className="w-full border p-2 pl-9 rounded text-sm outline-none focus:border-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Address</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="Filter by address..." value={addressFilter} onChange={e => setAddressFilter(e.target.value)} className="w-full border p-2 pl-9 rounded text-sm outline-none focus:border-green-500" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-sm font-semibold text-gray-600">
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>Name <SortIcon field="name" /></th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors hidden md:table-cell" onClick={() => handleSort('email')}>Email <SortIcon field="email" /></th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors hidden sm:table-cell" onClick={() => handleSort('address')}>Address <SortIcon field="address" /></th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors text-right" onClick={() => handleSort('rating')}>Rating <SortIcon field="rating" /></th>
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{s.name}</td>
                  <td className="p-4 hidden md:table-cell text-gray-600">{s.email}</td>
                  <td className="p-4 hidden sm:table-cell text-gray-600 truncate max-w-xs">{s.address}</td>
                  <td className="p-4 text-right font-bold text-yellow-600">{s.averageRating > 0 ? s.averageRating.toFixed(1) + ' ★' : <span className="text-gray-400 font-normal text-sm">No Ratings</span>}</td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No stores found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

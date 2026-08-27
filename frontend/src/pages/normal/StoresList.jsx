import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../api';

export default function NormalStoresList() {
  const [stores, setStores] = useState([]);
  
  // Explicit filters
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  
  // Debounced filters
  const [debouncedName] = useDebounce(nameFilter, 300);
  const [debouncedAddress] = useDebounce(addressFilter, 300);

  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchStores = () => {
    api.get('/stores', { 
      params: { name: debouncedName, address: debouncedAddress, sortField, sortOrder } 
    }).then(res => setStores(res.data)).catch(() => toast.error('Failed to load stores'));
  };

  useEffect(() => {
    fetchStores();
  }, [debouncedName, debouncedAddress, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const submitRating = async (storeId, score) => {
    try {
      await api.post('/ratings', { storeId, score });
      toast.success('Rating submitted successfully!');
      fetchStores();
    } catch (err) {
      toast.error('Error submitting rating');
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
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Browse Stores</h1>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Search by Name</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Store name..." value={nameFilter} onChange={e => setNameFilter(e.target.value)} className="w-full border p-2 pl-9 rounded text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Search by Address</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="City, street..." value={addressFilter} onChange={e => setAddressFilter(e.target.value)} className="w-full border p-2 pl-9 rounded text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-sm font-semibold text-gray-600">
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>Store Name <SortIcon field="name" /></th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors hidden sm:table-cell" onClick={() => handleSort('address')}>Address <SortIcon field="address" /></th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors text-center" onClick={() => handleSort('rating')}>Overall Rating <SortIcon field="rating" /></th>
                <th className="p-4 text-center hidden md:table-cell">My Rating</th>
                <th className="p-4 text-center">Rate</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800">{s.name}</td>
                  <td className="p-4 hidden sm:table-cell text-gray-600 truncate max-w-xs">{s.address}</td>
                  <td className="p-4 text-center font-bold text-yellow-500">
                    {s.averageRating > 0 ? s.averageRating.toFixed(1) + ' ★' : <span className="text-gray-400 font-normal text-sm">N/A</span>}
                  </td>
                  <td className="p-4 text-center hidden md:table-cell font-medium text-gray-700">
                    {s.userRating ? s.userRating + ' ★' : <span className="text-gray-400 text-sm">Not rated</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => submitRating(s.id, star)}
                          className={`text-2xl cursor-pointer transition-colors ${s.userRating >= star ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
                          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No stores found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

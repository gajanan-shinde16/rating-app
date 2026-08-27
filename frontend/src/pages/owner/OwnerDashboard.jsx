import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function OwnerDashboard() {
  const [storeData, setStoreData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stores/dashboard')
      .then(res => setStoreData(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load dashboard'));
  }, []);

  // Process rating distribution
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (storeData?.ratings) {
    storeData.ratings.forEach(r => {
      ratingCounts[r.score] = (ratingCounts[r.score] || 0) + 1;
    });
  }
  
  const chartData = [
    { name: '1 Star', value: ratingCounts[1] },
    { name: '2 Stars', value: ratingCounts[2] },
    { name: '3 Stars', value: ratingCounts[3] },
    { name: '4 Stars', value: ratingCounts[4] },
    { name: '5 Stars', value: ratingCounts[5] },
  ];
  
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Store Dashboard</h1>
        
        {error ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">{error}</div>
        ) : storeData ? (
          <>
            <div className="bg-white p-8 rounded-lg shadow-sm border-t-4 border-blue-500 mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{storeData.storeName}</h2>
                <p className="text-gray-500 font-medium">Overall Performance</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-yellow-500">{storeData.averageRating.toFixed(1)} <span className="text-3xl">★</span></p>
                <p className="text-gray-500 font-medium mt-1">Based on {storeData.ratings.length} reviews</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Rating Distribution</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{fill: '#666'}} tickLine={false} axisLine={false} width={70} />
                      <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Recent Reviews</h3>
                </div>
                <div className="overflow-y-auto max-h-64 flex-1">
                  {storeData.ratings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No ratings yet.</div>
                  ) : (
                    <table className="w-full text-left">
                      <tbody>
                        {storeData.ratings.slice().reverse().map((r, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <p className="font-semibold text-gray-800 text-sm truncate max-w-[150px]" title={r.userName}>{r.userName}</p>
                              <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td className="p-4 text-right">
                              <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded font-bold text-sm">
                                {r.score} ★
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}

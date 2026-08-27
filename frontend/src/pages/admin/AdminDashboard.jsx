import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setStats(res.data));
  }, []);

  const chartData = [
    { name: 'Users', value: stats.totalUsers, fill: '#3b82f6' },
    { name: 'Stores', value: stats.totalStores, fill: '#22c55e' },
    { name: 'Ratings', value: stats.totalRatings, fill: '#eab308' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider text-sm">Total Users</h3>
            <p className="text-4xl font-bold text-gray-800">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider text-sm">Total Stores</h3>
            <p className="text-4xl font-bold text-gray-800">{stats.totalStores}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-yellow-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 font-semibold mb-1 uppercase tracking-wider text-sm">Total Ratings</h3>
            <p className="text-4xl font-bold text-gray-800">{stats.totalRatings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Platform Overview</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{fill: '#666'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fill: '#666'}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

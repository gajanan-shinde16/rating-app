import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const schema = z.object({
  name: z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name must be max 60 characters'),
  email: z.string().email('Invalid email'),
  address: z.string().max(400, 'Address must be max 400 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must be max 16 characters')
    .regex(/[A-Z]/, 'Must contain one uppercase')
    .regex(/[^a-zA-Z0-9]/, 'Must contain one special character'),
});

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data);
      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
        {serverError && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">{serverError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input {...register('name')} className="w-full border p-2 rounded" />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full border p-2 rounded" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block mb-1">Address</label>
            <input {...register('address')} className="w-full border p-2 rounded" />
            {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input type="password" {...register('password')} className="w-full border p-2 rounded" />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>
          <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 cursor-pointer">Register</button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

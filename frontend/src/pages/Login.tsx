import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const res = await api.post('/api/v1/auth/login', data);

            // Save tokens for the axios interceptor
            localStorage.setItem("accessToken", res.data.data.accessToken);
            localStorage.setItem("refreshToken", res.data.data.refreshToken);

            dispatch(setCredentials({ user: res.data.data.user, accessToken: res.data.data.accessToken }));
            toast.success('Signed in successfully');
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50">

            {/* Visual / Brand Side */}
            <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 text-white p-12">
                <div className="max-w-md">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                        <span className="text-4xl font-extrabold text-blue-600">N</span>
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">Reliable EMR management.</h1>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        Securely manage patient queues, doctor schedules, and facility data in one centralized platform optimized for healthcare professionals.
                    </p>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex justify-center items-center p-8 relative">
                <div className="w-full max-w-sm fade-in">
                    <div className="md:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl leading-none">N</div>
                        <h1 className="text-2xl font-extrabold text-slate-900">NEXA EMR</h1>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                    <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-slate-700 mb-1.5"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                {...register('email')}
                                type="text"
                                className={`input-field ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                                placeholder="doctor@clinic.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between"
                            >
                                <span>Password</span>
                                <a href="#" className="text-blue-600 hover:underline font-medium">Forgot password?</a>
                            </label>
                            <input
                                id="password"
                                {...register('password')}
                                type="password"
                                className={`input-field ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary flex justify-center items-center py-3 text-base mt-6"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <p className="text-center text-sm text-slate-500 mt-6 pt-6 border-t border-slate-200">
                            Don't have an account?{' '}
                            <a href="#" className="font-semibold text-blue-600 hover:underline">
                                Sign up
                            </a>
                        </p>
                    </form>
                </div>
            </div>

        </div>
    );
};

export default Login;

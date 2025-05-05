import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Check for admin credentials first
      if (formData.email === 'admin@sam1.com' && formData.password === 'admin123') {
        const adminUser = {
          email: formData.email,
          fullname: 'Admin',
          isAdmin: true
        };
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
        return;
      }

      const userData = await api.signin(formData);
      
      // Store minimal user data in localStorage for session management
      const sessionUser = {
        _id: userData._id,
        email: userData.email,
        fullname: userData.fullname,
        isAdmin: userData.isAdmin
      };
      localStorage.setItem('currentUser', JSON.stringify(sessionUser));
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#BAE6F2] to-white flex items-center justify-center px-4">
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center transform animate-[slideIn_0.5s_ease-out]">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Login Successfully!</h3>
            <p className="text-gray-600">Successfully logged in. Redirecting...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex">
          <div className="hidden md:block w-1/2 bg-[#7CC5E3] p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7CC5E3]/80 to-[#7CC5E3]"></div>
            <div className="relative z-10">
              <Brain className="w-12 h-12 text-white mb-8" />
              <h1 className="text-4xl font-bold text-white mb-6">Welcome to SAM1</h1>
              <p className="text-white/90 text-lg mb-8">
                Your personal mental wellness companion, here to support your journey to better mental health.
              </p>
              <div className="mt-12 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-semibold">AI-Powered Support</h3>
                    <p className="text-sm opacity-80">24/7 emotional support and guidance</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-semibold">Secure & Private</h3>
                    <p className="text-sm opacity-80">Your data is always protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12">
            <div className="max-w-sm mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600 mb-8">Please sign in to your account</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent transition-all duration-200 ${
                          error ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent transition-all duration-200 ${
                          error ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7CC5E3] text-white py-2 rounded-xl hover:bg-[#6BB4D2] transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>

                <div className="text-center space-y-4">
                  <Link to="/forgot-password" className="text-sm text-[#7CC5E3] hover:underline block">
                    Forgot your password?
                  </Link>
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-[#7CC5E3] hover:underline font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
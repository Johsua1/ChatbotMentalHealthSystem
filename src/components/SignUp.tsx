import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, User, Mail, Lock, Calendar, Users, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    gender: 'Male',
    birthdate: '',
    password: '',
    confirmPassword: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 11;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!validateAge(formData.birthdate)) {
      setError('You must be at least 11 years old to register');
      setIsLoading(false);
      return;
    }

    try {
      await api.signup({
        fullname: formData.fullname,
        email: formData.email,
        gender: formData.gender,
        birthdate: formData.birthdate,
        password: formData.password
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h3>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex">
          <div className="hidden md:block w-1/2 bg-[#7CC5E3] p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7CC5E3]/80 to-[#7CC5E3]"></div>
            <div className="relative z-10">
              <Brain className="w-12 h-12 text-white mb-8" />
              <h1 className="text-4xl font-bold text-white mb-6">Join SAM1 Today</h1>
              <p className="text-white/90 text-lg mb-8">
                Start your journey to better mental health with personalized AI support.
              </p>
              
              <div className="mt-12">
                <div className="flex items-center mb-8">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">1</span>
                  </div>
                  <div className="flex-1 h-1 bg-white/20 rounded">
                    <div className={`h-full bg-white rounded transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step === 1 ? 'bg-white' : 'bg-white/20'}`}>
                      <User className={`w-6 h-6 ${step === 1 ? 'text-[#7CC5E3]' : 'text-white'}`} />
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold">Personal Information</h3>
                      <p className="text-sm opacity-80">Tell us about yourself</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step === 2 ? 'bg-white' : 'bg-white/20'}`}>
                      <Lock className={`w-6 h-6 ${step === 2 ? 'text-[#7CC5E3]' : 'text-white'}`} />
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold">Security Setup</h3>
                      <p className="text-sm opacity-80">Create your secure account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12">
            <div className="max-w-sm mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 1 ? 'Create Account' : 'Security Details'}
              </h2>
              <p className="text-gray-600 mb-8">
                {step === 1 ? 'Fill in your personal details' : 'Set up your account security'}
              </p>

              <form onSubmit={step === 1 ? nextStep : handleSubmit} className="space-y-6">
                {step === 1 ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

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
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <div className="relative">
                            <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              required
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent appearance-none bg-white"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Birthdate
                          </label>
                          <div className="relative">
                            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="date"
                              name="birthdate"
                              value={formData.birthdate}
                              onChange={handleChange}
                              required
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#7CC5E3] text-white py-2 rounded-xl hover:bg-[#6BB4D2] transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      Continue
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
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
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                            placeholder="Create a password"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                            placeholder="Confirm your password"
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

                    <div className="text-xs text-gray-600 space-y-2">
                      <p>By signing up, you agree that:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>This is not a substitute for professional mental health treatment</li>
                        <li>In case of emergency, please contact a healthcare provider</li>
                        <li>Your data will be stored securely in our database</li>
                      </ul>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition-all duration-200"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-2/3 bg-[#7CC5E3] text-white py-2 rounded-xl hover:bg-[#6BB4D2] transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <span>Create Account</span>
                        )}
                      </button>
                    </div>
                  </>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/signin" className="text-[#7CC5E3] hover:underline font-medium">
                      Sign in
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

export default SignUp;
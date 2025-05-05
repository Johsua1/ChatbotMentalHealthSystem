import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Key, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { api } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'otp' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      // Check if user exists
      const response = await fetch(`http://localhost:5000/api/users/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Email not found');
      }

      const otp = generateOTP();
      setGeneratedOtp(otp);

      // Send email using EmailJS
      await emailjs.send(
        'service_s0pi4ef',
        'template_wn5jl19',
        {
          to_email: email,
          message: `Your OTP code is: ${otp}`,
          from_name: 'SAM1 Support',
          subject: 'Password Reset OTP'
        },
        'WsUC-vkvxviRcpIW-'
      );

      setStatus('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send OTP');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTPAndResetPassword = async () => {
    if (otp !== generatedOtp) {
      setErrorMessage('Invalid OTP code');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      await api.resetPassword(email, newPassword);
      setStatus('success');
    } catch (error) {
      console.error('Error resetting password:', error);
      setErrorMessage('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#BAE6F2] to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="mb-8">
            <Link to="/signin" className="text-gray-500 hover:text-gray-700 flex items-center">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Sign In
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
          
          {status === 'idle' && (
            <>
              <p className="text-gray-600 mb-8">
                Enter your email address and we'll send you a one-time password to reset your account.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); sendOTP(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7CC5E3] text-white py-2 rounded-xl hover:bg-[#6BB4D2] transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send OTP</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {status === 'otp' && (
            <>
              <p className="text-gray-600 mb-8">
                We've sent a one-time password to your email. Enter it below along with your new password.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); verifyOTPAndResetPassword(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    One-Time Password
                  </label>
                  <div className="relative">
                    <Key className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                      placeholder="Enter OTP"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7CC5E3] text-white py-2 rounded-xl hover:bg-[#6BB4D2] transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </form>
            </>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Password Reset Successful</h3>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link
                to="/signin"
                className="inline-block bg-[#7CC5E3] text-white px-6 py-2 rounded-xl hover:bg-[#6BB4D2] transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
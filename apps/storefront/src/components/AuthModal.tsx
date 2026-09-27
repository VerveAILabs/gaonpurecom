'use client';

import { useState, useRef } from 'react';
import { X, Mail, Lock, User, Camera, ArrowRight, AlertCircle, CheckCircle2, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'signup' | 'verification' | 'forgot-password' | 'reset-success';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Please wait...');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { loginWithGoogle, loginWithEmail, signUpWithEmail, resetPassword } = useAuthStore();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    setLoadingMessage('Signing in with Google Account...');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: unknown) {
      const msg = getFirebaseErrorMessage(err);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingMessage('Authenticating your account...');
    try {
      const result = await loginWithEmail(email, password);
      if (result.unverified) {
        setView('verification');
      } else {
        onClose();
      }
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Creating your account...');
    try {
      // Step 1: Create Account & Send Verification Email
      setLoadingMessage('Creating your profile and sending verification email...');
      await signUpWithEmail(email, password, name, photoFile || undefined);
      
      // Step 2: Show successful transition
      setLoadingMessage('Account created! Preparing verification...');
      await new Promise((resolve) => setTimeout(resolve, 600));
      setView('verification');
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingMessage('Sending password reset instructions...');
    try {
      await resetPassword(email);
      setView('reset-success');
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const renderContent = () => {
    if (view === 'verification') {
      return (
        <div className="text-center py-2 animate-in fade-in duration-300">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-emerald-50 rounded-full shadow-inner ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">Verify Your Email</h2>
          <p className="text-stone-600 text-sm mb-2 leading-relaxed">
            We have sent a verification link to:
          </p>
          <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl font-mono text-xs font-bold text-emerald-800 mb-6">
            {email}
          </div>
          <p className="text-stone-500 text-xs mb-8">
            Please click the link in your inbox to activate your Gaon Pure account before logging in.
          </p>
          <button
            onClick={() => {
              setView('login');
              setError('');
            }}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (view === 'reset-success') {
      return (
        <div className="text-center py-2 animate-in fade-in duration-300">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-emerald-50 rounded-full shadow-inner ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">Check Your Email</h2>
          <p className="text-stone-600 text-sm mb-6 leading-relaxed">
            We sent password reset instructions to <span className="font-semibold text-stone-800">{email}</span>.
          </p>
          <button
            onClick={() => setView('login')}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Back to Sign In
          </button>
        </div>
      );
    }

    if (view === 'forgot-password') {
      return (
        <>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => { setView('login'); setError(''); }}
              className="p-2 -ml-2 text-stone-400 hover:text-stone-600 transition-colors rounded-full hover:bg-stone-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-serif font-bold text-stone-800">Reset Password</h2>
          </div>

          <p className="text-stone-600 text-sm mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-px" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending reset link...</span>
                </div>
              ) : (
                <>
                  <span>Get Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              {view === 'login' ? 'Welcome Back' : 'Join Gaon Pure'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {view === 'login' 
                ? 'Sign in to access your orders and farm fresh harvest' 
                : 'Create an account for 100% natural, unadulterated village harvest'}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1.5 rounded-full hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-4">
          {view === 'signup' && (
            <>
              <div className="flex justify-center mb-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group"
                  title="Upload profile picture (optional)"
                >
                  <div className="w-20 h-20 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-600 shadow-inner">
                    {photoFile ? (
                      <img
                        src={URL.createObjectURL(photoFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-7 h-7 text-stone-400 group-hover:text-emerald-700 transition-colors" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-800 rounded-full text-white shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </button>
              </div>

              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-xs text-stone-800"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-xs text-stone-800"
            />
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-xs text-stone-800"
              />
            </div>
            {view === 'login' && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot-password');
                    setError('');
                  }}
                  className="text-[11px] font-bold text-emerald-800 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {view === 'signup' && (
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-xs text-stone-800"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-xs uppercase tracking-wider"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span>{view === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-stone-400 text-xs">
          <div className="h-px bg-stone-200 flex-1" />
          <span>or continue with</span>
          <div className="h-px bg-stone-200 flex-1" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60 text-xs"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          <span>Continue with Google</span>
        </button>

        <p className="mt-6 text-center text-xs text-stone-500">
          {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setView(view === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="ml-1.5 text-emerald-800 font-bold hover:underline"
          >
            {view === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 relative">
          
          {/* Full-Screen / Modal-Wide Progress Loader Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center ring-8 ring-emerald-50/60">
                  <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-amber-400 rounded-full shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-stone-900" />
                </div>
              </div>

              <h3 className="text-base font-bold text-stone-900 mb-1 tracking-tight">
                {view === 'signup' ? 'Setting Up Your Account' : 'Please Wait'}
              </h3>
              
              <p className="text-xs text-stone-600 max-w-xs leading-relaxed">
                {loadingMessage}
              </p>

              <div className="w-48 h-1.5 bg-stone-100 rounded-full overflow-hidden mt-5">
                <div className="w-full h-full bg-emerald-600 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          <div className="p-8 md:p-9">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

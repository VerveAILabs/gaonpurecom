'use client';

import { useState, useRef } from 'react';
import { X, Mail, Lock, User, Camera, ArrowRight, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
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
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: unknown) {
      const msg = getFirebaseErrorMessage(err);
      if (msg) setError(msg); // silently ignore cancelled-popup-request
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
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

    setLoading(true);
    try {
      await signUpWithEmail(email, password, name, photoFile || undefined);
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
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-green-50 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-4">Verify your email</h2>
          <p className="text-stone-600 mb-8 leading-relaxed">
            We have sent you a verification email to <span className="font-semibold text-stone-800">{email}</span>. Verify it and log in.
          </p>
          <button
            onClick={() => setView('login')}
            className="w-full bg-brand-secondary text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Go to Login
          </button>
        </div>
      );
    }

    if (view === 'reset-success') {
      return (
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-green-50 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-4">Check your email</h2>
          <p className="text-stone-600 mb-8 leading-relaxed">
            We sent you a password change link to <span className="font-semibold text-stone-800">{email}</span>.
          </p>
          <button
            onClick={() => setView('login')}
            className="w-full bg-brand-secondary text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Sign In
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

          <p className="text-stone-600 mb-6">
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
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-secondary text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Get Reset Link
                  <ArrowRight className="w-5 h-5" />
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
          <h2 className="text-2xl font-serif font-bold text-stone-800">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-full hover:bg-stone-50">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-4">
          {view === 'signup' && (
            <>
              <div className="flex justify-center mb-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group"
                >
                  <div className="w-24 h-24 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-secondary">
                    {photoFile ? (
                      <img
                        src={URL.createObjectURL(photoFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-stone-400 group-hover:text-brand-secondary" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-1.5 bg-brand-secondary rounded-full text-white shadow-lg">
                    <Camera className="w-4 h-4" />
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
                <User className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
            />
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
              />
            </div>
            {view === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot-password');
                    setError('');
                  }}
                  className="text-xs font-bold text-brand-secondary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {view === 'signup' && (
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
              <input
                type="password"
                placeholder="Repeat Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-secondary text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {view === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4 text-stone-400 text-sm">
          <div className="h-px bg-stone-200 flex-1" />
          <span>or continue with</span>
          <div className="h-px bg-stone-200 flex-1" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-70"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Google Account
        </button>

        <p className="mt-8 text-center text-sm text-stone-500">
          {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setView(view === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="ml-2 text-brand-secondary font-bold hover:underline"
          >
            {view === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-8 md:p-10">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}


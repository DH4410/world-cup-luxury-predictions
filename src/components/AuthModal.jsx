import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    let ok;
    if (mode === 'signin') {
      ok = await signIn(email, password);
    } else {
      ok = await signUp(email, password, username);
    }
    setLoading(false);
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md relative">
        {/* header strip */}
        <div className="bg-ink-900 px-6 py-4 flex items-center justify-between">
          <span className="heading-display text-2xl text-white">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </span>
          <button onClick={onClose} className="text-ink-400 hover:text-white transition-colors">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="label-caps text-ink-600 block mb-1.5">Username</label>
              <input
                type="text" required value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="YourName"
                className="w-full border-2 border-ink-800 bg-surface-100 px-4 py-2.5 font-sans text-sm outline-none focus:border-lime-500 transition-colors"
              />
            </div>
          )}
          <div>
            <label className="label-caps text-ink-600 block mb-1.5">Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border-2 border-ink-800 bg-surface-100 px-4 py-2.5 font-sans text-sm outline-none focus:border-lime-500 transition-colors"
            />
          </div>
          <div>
            <label className="label-caps text-ink-600 block mb-1.5">Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-2 border-ink-800 bg-surface-100 px-4 py-2.5 font-sans text-sm outline-none focus:border-lime-500 transition-colors"
            />
          </div>

          {mode === 'signup' && (
            <p className="font-sans text-xs text-ink-400 leading-relaxed">
              After signing up, check your email to confirm your account before signing in.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full justify-center text-sm mt-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="divider-light my-2" />

          <p className="font-sans text-sm text-center text-ink-600">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-bold text-ink-900 underline hover:text-lime-600 transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

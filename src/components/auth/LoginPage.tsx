import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthShell, AuthInput, AuthButton, GoogleButton, Divider, AuthError } from './AuthShell';

export default function LoginPage() {
  const { session, signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signInWithEmail(email, password);
    setLoading(false);
    if (err) setError(err);
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to access your dashboard and conversion history."
      footer={
        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
          New to DocBit?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-black uppercase tracking-widest">
            Create Account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <AuthInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[10px] font-black uppercase text-blue-600 hover:underline tracking-widest">
            Forgot Password?
          </Link>
        </div>
        <AuthError message={error} />
        <AuthButton type="submit" loading={loading}>Sign In</AuthButton>
      </form>

      <Divider />

      <GoogleButton onClick={handleGoogle} loading={googleLoading} />
    </AuthShell>
  );
}

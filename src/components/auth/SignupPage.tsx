import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthShell, AuthInput, AuthButton, GoogleButton, Divider, AuthError } from './AuthShell';

export default function SignupPage() {
  const { session, signUpWithEmail, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: err } = await signUpWithEmail(email, password, fullName);
    setLoading(false);
    if (err) setError(err);
    else setSuccess(true);
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  if (success) {
    return (
      <AuthShell title="Check Your Email" subtitle="We sent you a confirmation link.">
        <div className="space-y-6 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Click the link in your email to activate your account, then sign in.
          </p>
          <Link to="/login" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all">
            Go to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join DocBit to save your conversion history and favorite tools."
      footer={
        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-black uppercase tracking-widest">
            Sign In
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput label="Full Name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
        <AuthInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <AuthInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
        <AuthError message={error} />
        <AuthButton type="submit" loading={loading}>Create Account</AuthButton>
      </form>

      <Divider />

      <GoogleButton onClick={handleGoogle} loading={googleLoading} />
    </AuthShell>
  );
}

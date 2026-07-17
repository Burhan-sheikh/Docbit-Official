import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthShell, AuthInput, AuthButton, AuthError } from './AuthShell';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await resetPassword(email);
    setLoading(false);
    if (err) setError(err);
    else setSent(true);
  };

  if (sent) {
    return (
      <AuthShell title="Reset Link Sent" subtitle="Check your inbox for password reset instructions.">
        <div className="space-y-6 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            We sent a reset link to <span className="font-black text-neutral-900 dark:text-white">{email}</span>. Follow the link to set a new password.
          </p>
          <Link to="/login" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all">
            Back to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
          Remembered it?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-black uppercase tracking-widest">
            Sign In
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <AuthError message={error} />
        <AuthButton type="submit" loading={loading}>Send Reset Link</AuthButton>
      </form>
    </AuthShell>
  );
}

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthShell, AuthInput, AuthButton, AuthError } from './AuthShell';

export default function ResetPasswordPage() {
  const { session, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!session) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: err } = await updatePassword(password);
    setLoading(false);
    if (err) setError(err);
    else setDone(true);
  };

  if (done) {
    return (
      <AuthShell title="Password Updated" subtitle="Your password has been changed successfully.">
        <div className="space-y-6 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            You can now sign in with your new password.
          </p>
          <Link to="/dashboard" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all">
            Go to Dashboard
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set New Password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput label="New Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
        <AuthInput label="Confirm Password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        <AuthError message={error} />
        <AuthButton type="submit" loading={loading}>Update Password</AuthButton>
      </form>
    </AuthShell>
  );
}

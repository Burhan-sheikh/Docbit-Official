import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User as UserIcon, History, Heart, Clock, Settings, LogOut, Trash2, Zap, CircleCheck as CheckCircle2, Circle as XCircle, ShieldCheck, Calendar, Crown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabase/client';
import { SEO } from '../SEO';
import { cn } from '../../lib/utils';
import { TOOL_MAP, getToolBySlug } from '../../tools/registry';
import {
  getConversionHistory,
  getFavorites,
  getRecentTools,
  getUsageStats,
  getProfile,
  getSubscription,
  getSettings,
  updateSettings,
  updateProfile,
  deleteAccount,
} from '../../services/userDataService';
import type { ConversionHistory, Favorite, RecentTool, Subscription, Settings as SettingsRow, Profile } from '../../supabase/database.types';
import { APP_DOMAIN } from '../../seo/seoConfig';
import { getBreadcrumbSchema } from '../../seo/structuredData';

type Tab = 'overview' | 'history' | 'favorites' | 'settings';

export default function DashboardPage() {
  const { session, user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [recents, setRecents] = useState<RecentTool[]>([]);
  const [stats, setStats] = useState({ total: 0, successCount: 0, failCount: 0 });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setDataLoading(true);
      const [h, f, r, s, p, sub, set] = await Promise.all([
        getConversionHistory(),
        getFavorites(),
        getRecentTools(),
        getUsageStats(),
        getProfile(),
        getSubscription(),
        getSettings(),
      ]);
      setHistory(h);
      setFavorites(f);
      setRecents(r);
      setStats(s);
      setProfile(p);
      setSubscription(sub);
      setSettings(set);
      setDataLoading(false);
    })();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 pb-40">
      <SEO
        title="Dashboard | DocBit"
        description="Your DocBit dashboard — view conversion history, favorite tools, and account settings."
        canonical={`${APP_DOMAIN}/dashboard`}
        noindex
        schema={getBreadcrumbSchema([
          { name: 'Home', item: APP_DOMAIN },
          { name: 'Dashboard', item: `${APP_DOMAIN}/dashboard` },
        ])}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black uppercase overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.email?.[0] || 'U'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight dark:text-white uppercase italic">
              {profile?.full_name || 'Welcome'}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{user?.email}</p>
            {profile?.created_at && (
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-600 dark:text-neutral-300 font-black rounded-2xl transition-all text-xs uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap',
              tab === t.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-100 dark:border-neutral-800'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<Zap className="w-5 h-5" />} label="Total Conversions" value={stats.total} color="blue" />
            <StatCard icon={<Heart className="w-5 h-5" />} label="Favorite Tools" value={favorites.length} color="pink" />
            <StatCard icon={<Clock className="w-5 h-5" />} label="Recent Tools" value={recents.length} color="amber" />
          </div>

          {recents.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Recently Used</h3>
              <div className="flex flex-wrap gap-3">
                {recents.map((r) => {
                  const tool = Object.values(TOOL_MAP).find((t) => t.id === r.tool_id);
                  if (!tool) return null;
                  return (
                    <Link
                      key={r.id}
                      to={`/tools/${tool.slug}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <tool.icon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-black uppercase tracking-tight">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {tab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {dataLoading ? (
            <LoadingState />
          ) : history.length === 0 ? (
            <EmptyState icon={<History className="w-10 h-10" />} title="No History Yet" message="Your conversions will appear here once you start using tools." />
          ) : (
            history.map((h) => {
              const tool = Object.values(TOOL_MAP).find((t) => t.id === h.tool_id);
              return (
                <div key={h.id} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', h.success ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600')}>
                    {h.success ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate text-neutral-900 dark:text-white">{h.filename || h.tool_name || h.tool_id}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      {tool?.name || h.tool_id} • {new Date(h.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {tool && (
                    <Link to={`/tools/${tool.slug}`} className="text-[10px] font-black uppercase text-blue-600 hover:underline tracking-widest">
                      Again
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </motion.div>
      )}

      {tab === 'favorites' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {dataLoading ? (
            <LoadingState />
          ) : favorites.length === 0 ? (
            <EmptyState icon={<Heart className="w-10 h-10" />} title="No Favorites" message="Tap the heart on any tool to bookmark it here." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((f) => {
                const tool = Object.values(TOOL_MAP).find((t) => t.id === f.tool_id);
                if (!tool) return null;
                return (
                  <Link
                    key={f.id}
                    to={`/tools/${tool.slug}`}
                    className="group p-6 rounded-[32px] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-blue-500 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase italic">{tool.name}</h4>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase">{tool.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {tab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Account</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                <div>
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Email</p>
                  <p className="text-sm font-black text-neutral-900 dark:text-white">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Plan</p>
                    <p className="text-sm font-black text-blue-600 uppercase">{subscription?.plan || 'Free'}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {subscription?.status || 'Active'}
                </span>
              </div>
              {subscription?.current_period_end && (
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Renews</p>
                    <p className="text-sm font-black text-neutral-900 dark:text-white">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <SettingsCard settings={settings} onUpdate={setSettings} />
          <ProfileEditor profile={profile} onSaved={setProfile} />

          <div className="bg-white dark:bg-neutral-900 border border-red-100 dark:border-red-900/30 rounded-[32px] p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Danger Zone</h3>
            <DeleteAccountButton />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
  };
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-8 space-y-4">
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', colorMap[color])}>{icon}</div>
      <div>
        <p className="text-3xl font-black tracking-tighter dark:text-white">{value}</p>
        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-12 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">{icon}</div>
      <h3 className="text-lg font-black uppercase italic dark:text-white">{title}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-sm mx-auto">{message}</p>
    </div>
  );
}

function SettingsCard({ settings, onUpdate }: { settings: SettingsRow | null; onUpdate: (s: SettingsRow) => void }) {
  const [saving, setSaving] = useState(false);

  const toggle = async (key: 'email_notifications' | 'privacy_consent') => {
    if (!settings) return;
    const updated = { ...settings, [key]: !settings[key] };
    onUpdate(updated);
    setSaving(true);
    const result = await updateSettings({ [key]: !settings[key] });
    if (result) onUpdate(result);
    setSaving(false);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Privacy & Notifications</h3>
        {saving && <span className="text-[10px] font-black uppercase text-blue-600">Saving...</span>}
      </div>
      <div className="space-y-4">
        <button
          onClick={() => toggle('email_notifications')}
          className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl"
        >
          <div className="text-left">
            <p className="text-sm font-black text-neutral-900 dark:text-white">Email Notifications</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Product updates and alerts</p>
          </div>
          <span className={cn('w-12 h-6 rounded-full transition-colors relative', settings?.email_notifications ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600')}>
            <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', settings?.email_notifications ? 'translate-x-6' : 'translate-x-0.5')} />
          </span>
        </button>
        <button
          onClick={() => toggle('privacy_consent')}
          className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl"
        >
          <div className="text-left">
            <p className="text-sm font-black text-neutral-900 dark:text-white">Privacy Consent</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Allow anonymous usage analytics</p>
          </div>
          <span className={cn('w-12 h-6 rounded-full transition-colors relative', settings?.privacy_consent ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600')}>
            <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', settings?.privacy_consent ? 'translate-x-6' : 'translate-x-0.5')} />
          </span>
        </button>
      </div>
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
        <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
          Your files are never uploaded. All processing happens locally in your browser.
        </p>
      </div>
    </div>
  );
}

function ProfileEditor({ profile, onSaved }: { profile: Profile | null; onSaved: (p: Profile) => void }) {
  const [name, setName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.full_name || '');
  }, [profile]);

  const save = async () => {
    setSaving(true);
    const updated = await updateProfile({ full_name: name });
    if (updated) onSaved(updated);
    setSaving(false);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-8 space-y-6">
      <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Edit Profile</h3>
      <div className="space-y-3">
        <label className="block">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Full Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-sm font-bold text-neutral-900 dark:text-white outline-none focus:ring-2 ring-blue-500"
          />
        </label>
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await deleteAccount();
    if (ok) window.location.href = '/';
    setDeleting(false);
  };

  if (confirming) {
    return (
      <div className="space-y-4">
        <p className="text-xs font-bold text-red-600">This will permanently delete your account and all associated data. This cannot be undone.</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setConfirming(false)} className="py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-black rounded-xl text-xs uppercase tracking-widest">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className="py-3 bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-widest disabled:opacity-50">
            {deleting ? 'Deleting...' : 'Delete Forever'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
    >
      <Trash2 className="w-4 h-4" />
      Delete Account
    </button>
  );
}

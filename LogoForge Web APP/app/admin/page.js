"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { 
  Trash2, Edit, ExternalLink, Users, Image as ImageIcon, 
  Settings, Save, ToggleLeft, ToggleRight, Menu, X, 
  MoreVertical, Shield, ChevronRight 
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview'); 
  const [stats, setStats] = useState({ logos: 0, users: 0 });
  const [logos, setLogos] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Settings State
  const [settings, setSettings] = useState({
    maintenance_mode: 'false',
    popup_enabled: 'true',
    telegram_link: '',
    youtube_link: '',
    shortlink_url: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/');
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (data?.role !== 'admin') return router.push('/');
    
    fetchLogos();
    fetchUsers();
    fetchSettings();
    setLoading(false);
  }

  async function fetchLogos() {
    const { data, count } = await supabase.from('logos').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    setLogos(data || []);
    setStats(prev => ({ ...prev, logos: count }));
  }

  async function fetchUsers() {
    const { data, count } = await supabase.from('profiles').select('*', { count: 'exact' }).order('id', { ascending: true });
    setUsers(data || []);
    setStats(prev => ({ ...prev, users: count }));
  }

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const formatted = {};
      data.forEach(item => formatted[item.key] = item.value);
      setSettings(prev => ({ ...prev, ...formatted }));
    }
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    const updates = Object.keys(settings).map(key => ({ key, value: settings[key] }));
    const { error } = await supabase.from('settings').upsert(updates);
    
    if (error) alert("Error saving: " + error.message);
    else alert("Settings Saved!");
    setSavingSettings(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this logo?")) return;
    await supabase.from('logos').delete().eq('id', id);
    fetchLogos();
  }

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to ${newRole.toUpperCase()}?`)) return;
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    fetchUsers();
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-10">
        
        {/* HEADER: Stacked on Mobile, Row on Desktop */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Admin Panel</h1>
            <p className="text-slate-500 text-sm">Manage your assets and users</p>
          </div>
          <button 
            onClick={() => router.push('/upload')} 
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition flex justify-center items-center gap-2"
          >
            <ImageIcon size={20} /> Upload New Logo
          </button>
        </div>

        {/* SCROLLABLE TABS */}
        <div className="sticky top-0 z-10 bg-slate-50 pt-2 pb-4 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-2 md:gap-4">
            {['overview', 'logos', 'users', 'settings'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`px-5 py-2.5 rounded-full font-bold text-sm transition capitalize ${
                  activeTab === tab 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* --- TABS CONTENT --- */}
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-slide-up">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
               <div>
                 <p className="text-slate-500 font-medium text-sm">Total Assets</p>
                 <h3 className="text-3xl font-bold text-blue-600">{stats.logos}</h3>
               </div>
               <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ImageIcon size={24} /></div>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
               <div>
                 <p className="text-slate-500 font-medium text-sm">Total Users</p>
                 <h3 className="text-3xl font-bold text-purple-600">{stats.users}</h3>
               </div>
               <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users size={24} /></div>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
               <div>
                 <p className="text-slate-500 font-medium text-sm">System Status</p>
                 <h3 className="text-xl font-bold text-emerald-600">Online</h3>
               </div>
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Settings size={24} /></div>
             </div>
          </div>
        )}

        {/* TAB 2: LOGOS (Responsive: Cards on Mobile, Table on Desktop) */}
        {activeTab === 'logos' && (
          <div className="animate-slide-up">
            {/* DESKTOP TABLE (Hidden on Mobile) */}
            <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr><th className="p-4">Asset</th><th className="p-4">Info</th><th className="p-4 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {logos.map(l => (
                    <tr key={l.id} className="border-b hover:bg-slate-50">
                      <td className="p-4"><img src={l.url_png} className="h-12 w-12 object-cover rounded bg-slate-100" /></td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{l.title}</p>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{l.category}</span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => window.open(`/view?id=${l.id}`, '_blank')} className="p-2 bg-slate-100 rounded hover:text-blue-600"><ExternalLink size={18}/></button>
                        <button onClick={() => router.push(`/admin/edit?id=${l.id}`)} className="p-2 bg-slate-100 rounded hover:text-orange-500"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(l.id)} className="p-2 bg-slate-100 rounded hover:text-red-500"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS (Visible only on Mobile) */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {logos.map(l => (
                <div key={l.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                  <img src={l.url_png} className="h-20 w-20 object-cover rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{l.title}</h4>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase font-bold">{l.category}</span>
                    
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => router.push(`/admin/edit?id=${l.id}`)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-xs font-bold flex justify-center"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(l.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold flex justify-center"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: USERS (Responsive List) */}
        {activeTab === 'users' && (
           <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-100 animate-slide-up">
             {users.map(u => (
               <div key={u.id} className="p-4 border-b last:border-0 flex items-center justify-between hover:bg-slate-50">
                 <div className="min-w-0 pr-4">
                   <p className="font-bold text-slate-800 truncate">{u.email}</p>
                   <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                     {u.role}
                   </span>
                 </div>
                 <button 
                   onClick={() => toggleRole(u.id, u.role)} 
                   className="shrink-0 text-xs bg-slate-100 px-3 py-2 rounded-lg font-bold hover:bg-slate-200"
                 >
                   {u.role === 'admin' ? 'Demote' : 'Promote'}
                 </button>
               </div>
             ))}
           </div>
        )}

        {/* TAB 4: SETTINGS (Full width inputs) */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto animate-slide-up">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="text-blue-600"/> Site Configuration</h2>
            
            <div className="space-y-6">
              {/* Toggles */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-800">Maintenance</h3>
                    <p className="text-xs text-slate-500">Close site for users</p>
                  </div>
                  <button onClick={() => setSettings({...settings, maintenance_mode: settings.maintenance_mode === 'true' ? 'false' : 'true'})}>
                    {settings.maintenance_mode === 'true' ? <ToggleRight size={40} className="text-red-500"/> : <ToggleLeft size={40} className="text-slate-300"/>}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-800">Social Popup</h3>
                    <p className="text-xs text-slate-500">Show join links</p>
                  </div>
                  <button onClick={() => setSettings({...settings, popup_enabled: settings.popup_enabled === 'true' ? 'false' : 'true'})}>
                    {settings.popup_enabled === 'true' ? <ToggleRight size={40} className="text-green-500"/> : <ToggleLeft size={40} className="text-slate-300"/>}
                  </button>
                </div>
              </div>

              {/* Shortlink Section */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">💰 Shortlink Monetization</h3>
                <p className="text-xs text-yellow-700 mb-3">
                  Paste the shortened version of: <code className="bg-white px-1 rounded">/verify</code>
                </p>
                <input 
                  className="w-full border p-3 rounded-lg bg-white text-sm" 
                  value={settings.shortlink_url || ''}
                  onChange={e => setSettings({...settings, shortlink_url: e.target.value})}
                  placeholder="https://ad-link.com/..."
                />
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Link</label>
                  <input className="w-full border p-3 rounded-lg text-sm" value={settings.telegram_link} onChange={e => setSettings({...settings, telegram_link: e.target.value})} placeholder="https://t.me/..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Link</label>
                  <input className="w-full border p-3 rounded-lg text-sm" value={settings.youtube_link} onChange={e => setSettings({...settings, youtube_link: e.target.value})} placeholder="https://youtube.com/..." />
                </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 flex justify-center items-center gap-2"
              >
                <Save size={18} /> {savingSettings ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

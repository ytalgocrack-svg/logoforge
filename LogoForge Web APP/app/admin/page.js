"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, ExternalLink, Users, Image as ImageIcon, BarChart3, Shield, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'logos', 'users'
  const [stats, setStats] = useState({ logos: 0, users: 0 });
  const [logos, setLogos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/');
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (data?.role !== 'admin') return router.push('/');
    
    // Fetch all data
    fetchLogos();
    fetchUsers();
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

  async function handleDelete(id) {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await supabase.from('logos').delete().eq('id', id);
    fetchLogos();
  }

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change this user's role to ${newRole.toUpperCase()}?`)) return;
    
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) alert(error.message);
    else fetchUsers();
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Admin Control Panel</h1>
          <button onClick={() => router.push('/upload')} className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition">
            + Upload New Logo
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 pb-1">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`pb-3 px-2 font-medium transition ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('logos')} 
            className={`pb-3 px-2 font-medium transition ${activeTab === 'logos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Manage Logos
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`pb-3 px-2 font-medium transition ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Manage Users
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                <ImageIcon size={32} />
              </div>
              <div>
                <p className="text-slate-500 font-medium">Total Logos</p>
                <h3 className="text-3xl font-bold text-slate-800">{stats.logos}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-purple-100 text-purple-600 rounded-xl">
                <Users size={32} />
              </div>
              <div>
                <p className="text-slate-500 font-medium">Registered Users</p>
                <h3 className="text-3xl font-bold text-slate-800">{stats.users}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl">
                <BarChart3 size={32} />
              </div>
              <div>
                <p className="text-slate-500 font-medium">System Status</p>
                <h3 className="text-xl font-bold text-emerald-600">Active</h3>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOGOS */}
        {activeTab === 'logos' && (
          <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-slate-600 text-sm font-semibold">Preview</th>
                  <th className="p-4 text-slate-600 text-sm font-semibold">Details</th>
                  <th className="p-4 text-slate-600 text-sm font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logos.map((logo) => (
                  <tr key={logo.id} className="border-b hover:bg-slate-50 transition">
                    <td className="p-4 w-20">
                      <img src={logo.url_png} className="h-14 w-14 object-cover rounded-lg bg-slate-200" />
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{logo.title}</p>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{logo.category}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => window.open(`/view?id=${logo.id}`, '_blank')} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-100 rounded-lg">
                          <ExternalLink size={18} />
                        </button>
                        <button onClick={() => router.push(`/admin/edit?id=${logo.id}`)} className="p-2 text-slate-400 hover:text-orange-500 bg-slate-100 rounded-lg">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(logo.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-100 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: USERS */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-100">
             <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-slate-600 text-sm font-semibold">Email</th>
                  <th className="p-4 text-slate-600 text-sm font-semibold">Current Role</th>
                  <th className="p-4 text-slate-600 text-sm font-semibold text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-slate-700">{u.email}</td>
                    <td className="p-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                          <Shield size={12} /> Admin
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">User</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleRole(u.id, u.role)}
                        className={`text-xs font-bold px-3 py-2 rounded-lg transition ${u.role === 'admin' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

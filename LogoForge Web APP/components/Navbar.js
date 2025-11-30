"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Menu, X, Sparkles, Megaphone, UploadCloud, LayoutDashboard, Trophy, MessageSquarePlus, Palette } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [settings, setSettings] = useState({
    site_name: 'EditorsAdda',
    announcement_text: '',
    announcement_enabled: 'false'
  });
  
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchSettings();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { checkUser(); });
    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setIsAdmin(data?.role === 'admin');
    }
  }

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*');
    const config = {};
    if(data) data.forEach(item => config[item.key] = item.value);
    setSettings(prev => ({ ...prev, ...config }));
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="sticky top-0 z-50 font-sans">
      {settings.announcement_enabled === 'true' && (
        <div className="bg-primary text-white text-xs font-bold py-1 px-4 text-center">
          <span className="flex items-center justify-center gap-2"><Megaphone size={14} /> {settings.announcement_text}</span>
        </div>
      )}

      <nav className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-lg text-white shadow-lg"><Sparkles size={20} /></div>
              <span className="text-xl font-extrabold text-white">{settings.site_name}</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/leaderboard" className="text-sm font-bold text-slate-400 hover:text-yellow-400 flex items-center gap-1 transition"><Trophy size={16}/> Top Creators</Link>
              <Link href="/requests" className="text-sm font-bold text-slate-400 hover:text-green-400 flex items-center gap-1 transition"><MessageSquarePlus size={16}/> Requests</Link>
              <Link href="/tools" className="text-sm font-bold text-slate-400 hover:text-purple-400 flex items-center gap-1 transition"><Palette size={16}/> Tools</Link>

              {user && <NotificationBell userId={user.id} />}

              {!user ? (
                <Link href="/auth" className="bg-white text-slate-900 px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-200">Login</Link>
              ) : (
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px]">
                    <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} className="w-full h-full rounded-full border-2 border-[#0f172a] object-cover"/>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                        {isAdmin && <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5"><Shield size={16}/> Admin</Link>}
                        <Link href="/user/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"><LayoutDashboard size={16}/> Dashboard</Link>
                        <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"><User size={16}/> Account</Link>
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:bg-white/5"><LogOut size={16}/> Sign Out</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="md:hidden flex gap-4 items-center">
               {user && <NotificationBell userId={user.id} />}
               <button onClick={() => setMenuOpen(!menuOpen)} className="text-white"><Menu size={24} /></button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0f172a] border-b border-white/10 absolute w-full p-4 space-y-4 shadow-xl">
             <Link href="/leaderboard" className="flex items-center gap-3 text-slate-300 font-bold"><Trophy size={18} className="text-yellow-500"/> Leaderboard</Link>
             <Link href="/requests" className="flex items-center gap-3 text-slate-300 font-bold"><MessageSquarePlus size={18} className="text-green-500"/> Request Zone</Link>
             <Link href="/tools" className="flex items-center gap-3 text-slate-300 font-bold"><Palette size={18} className="text-purple-500"/> Editor Tools</Link>
             {user && <Link href="/user/dashboard" className="flex items-center gap-3 text-slate-300 font-bold"><LayoutDashboard size={18} className="text-blue-500"/> My Dashboard</Link>}
             <button onClick={handleLogout} className="text-red-400 font-bold w-full text-left">Logout</button>
          </div>
        )}
      </nav>
    </div>
  );
}

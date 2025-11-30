"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LogOut, Shield, Menu, X, Sparkles, Megaphone, 
  UploadCloud, LayoutDashboard, User, Settings, Tv 
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Dynamic Settings
  const [settings, setSettings] = useState({
    site_name: 'EditorsAdda',
    announcement_text: '',
    announcement_enabled: 'false'
  });
  
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchSettings();
    
    // Close dropdown on outside click
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    if(data) {
      const config = {};
      data.forEach(item => config[item.key] = item.value);
      setSettings(prev => ({ ...prev, ...config }));
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setDropdownOpen(false);
    window.location.href = '/'; // Force refresh to clear state
  };

  return (
    <div className="sticky top-0 z-50 font-sans">
      
      {/* 1. ANNOUNCEMENT BAR */}
      {settings.announcement_enabled === 'true' && (
        <div className="bg-primary text-white text-xs md:text-sm font-bold py-2 px-4 text-center shadow-lg relative z-50">
          <span className="flex items-center justify-center gap-2 animate-pulse">
            <Megaphone size={16} /> {settings.announcement_text}
          </span>
        </div>
      )}

      {/* 2. MAIN NAVBAR */}
      <nav className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* BRAND */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-lg text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-primary transition-colors">
                {settings.site_name}
              </span>
            </Link>
            
            {/* DESKTOP RIGHT SIDE */}
            <div className="hidden md:flex items-center gap-4">
            <Link href="/community" className="text-sm font-bold text-slate-300 hover:text-primary flex items-center gap-1 transition">
  <Users size={16} /> Community
</Link>
              {!user ? (
                <Link href="/auth" className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-slate-200 transition shadow-lg">
                  Login
                </Link>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  {/* AVATAR TRIGGER */}
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none transition-transform active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px]">
                      <img 
                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                        className="w-full h-full rounded-full object-cover border-2 border-[#0f172a]"
                        alt="Profile"
                      />
                    </div>
                  </button>

                  {/* DROPDOWN MENU */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl py-2 animate-fade-in overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm text-white font-bold truncate">{profile?.display_name || "User"}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="py-2">
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 font-bold">
                            <Shield size={16}/> Admin Panel
                          </Link>
                        )}
                        {/* FIXED LINK: Uses ?id= instead of dynamic route */}
                        <Link href={`/channel?id=${user.id}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                           <Tv size={16}/> My Channel
                        </Link>
                        <Link href="/user/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                           <LayoutDashboard size={16}/> Studio (Stats)
                        </Link>
                        <Link href="/account" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                           <Settings size={16}/> Account Settings
                        </Link>
                      </div>

                      <div className="border-t border-white/5 pt-2">
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
                           <LogOut size={16}/> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-2">
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {menuOpen && (
          <div className="md:hidden bg-[#0f172a] border-b border-white/10 p-4 space-y-4 shadow-xl">
             {!user ? (
               <Link href="/auth" onClick={() => setMenuOpen(false)} className="block w-full bg-primary text-white py-3 rounded-xl font-bold text-center">Login / Sign Up</Link>
             ) : (
               <>
                 <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} className="w-10 h-10 rounded-full"/>
                    <div>
                      <p className="text-white font-bold">{profile?.display_name || "User"}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                 </div>
                 {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="block text-red-400 font-bold">Admin Panel</Link>}
                 <Link href="/community" onClick={() => setMenuOpen(false)} className="block p-3 bg-white/5 rounded-xl font-bold text-slate-200 hover:bg-white/10 transition border border-white/5">
  <div className="flex items-center gap-3">
    <Users size={18} className="text-green-400"/> Community Chat
  </div>
</Link>
                   <Link href={`/channel?id=${user.id}`} onClick={() => setMenuOpen(false)} className="block text-slate-300">My Channel</Link>
                 <Link href="/user/dashboard" onClick={() => setMenuOpen(false)} className="block text-slate-300">Creator Studio</Link>
                 <Link href="/account" onClick={() => setMenuOpen(false)} className="block text-slate-300">Settings</Link>
                 <button onClick={handleLogout} className="block w-full text-left text-slate-400">Logout</button>
               </>
             )}
          </div>
        )}
      </nav>
    </div>
  );
}

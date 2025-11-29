"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LogOut, Shield, Menu, X, Sparkles, Megaphone, 
  UploadCloud, LayoutDashboard, User 
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Default settings to prevent layout shift before load
  const [settings, setSettings] = useState({
    site_name: 'LogoForge',
    announcement_text: '',
    announcement_enabled: 'false'
  });
  
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchSettings();
    
    // Listen for login/logout events automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
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
    setUser(null);
    setIsAdmin(false);
    setMenuOpen(false);
    router.push('/'); 
  };

  return (
    <div className="sticky top-0 z-50 font-sans">
      
      {/* 1. DYNAMIC ANNOUNCEMENT BAR */}
      {settings.announcement_enabled === 'true' && (
        <div className="bg-primary text-white text-xs md:text-sm font-bold py-2 px-4 text-center shadow-lg shadow-primary/20 relative z-50">
          <span className="flex items-center justify-center gap-2 animate-pulse">
            <Megaphone size={16} /> 
            {settings.announcement_text}
          </span>
        </div>
      )}

      {/* 2. DARK GLASS NAVBAR */}
      <nav className="bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* LOGO & BRAND */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-lg text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-primary transition-colors">
                {settings.site_name}
              </span>
            </Link>
            
            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* --- USER LINKS (If Logged In & NOT Admin) --- */}
              {user && !isAdmin && (
                <>
                  <Link href="/user/dashboard" className="text-sm font-bold text-slate-300 hover:text-primary flex items-center gap-1 transition">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/user/upload" className="text-sm font-bold text-slate-300 hover:text-white flex items-center gap-1 transition">
                    <UploadCloud size={16} /> Submit Logo
                  </Link>
                </>
              )}

              {/* --- ADMIN LINKS --- */}
              {isAdmin && (
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                  <Link href="/upload" className="px-4 py-1.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition">
                    Upload
                  </Link>
                  <Link href="/admin" className="px-4 py-1.5 text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 rounded-full flex items-center gap-1 transition hover:brightness-110">
                    <Shield size={14}/> Admin Panel
                  </Link>
                </div>
              )}

              {/* --- AUTH BUTTONS --- */}
              {user ? (
                <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/10">
                   {/* Avatar Placeholder */}
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/10">
                      {user.email[0].toUpperCase()}
                   </div>
                   <button 
                    onClick={handleLogout} 
                    className="text-slate-400 hover:text-red-400 font-medium text-sm flex items-center gap-1 transition"
                    title="Logout"
                   >
                    <LogOut size={18} />
                   </button>
                </div>
              ) : (
                <Link href="/auth" className="bg-white text-slate-900 px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-200 transition shadow-lg">
                  Login
                </Link>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-300 hover:text-white p-2">
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        {menuOpen && (
          <div className="md:hidden bg-[#0f172a] border-b border-white/10 shadow-2xl absolute w-full animate-slide-up z-40">
             <div className="p-4 space-y-3">
               
               {/* User Info Header */}
               {user && (
                 <div className="pb-3 border-b border-white/10 mb-3 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                      {user.email[0].toUpperCase()}
                   </div>
                   <div className="overflow-hidden">
                     <p className="text-xs text-slate-500 font-bold uppercase">Signed in as</p>
                     <p className="text-sm text-white truncate w-full">{user.email}</p>
                   </div>
                 </div>
               )}

               {/* Admin Links */}
               {isAdmin && (
                 <div className="grid grid-cols-2 gap-3">
                    <Link href="/upload" onClick={() => setMenuOpen(false)} className="p-3 bg-white/5 rounded-xl font-bold text-center text-slate-200 border border-white/5">
                       Upload
                    </Link>
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                       <Shield size={16}/> Admin
                    </Link>
                 </div>
               )}

               {/* User Links */}
               {user && !isAdmin && (
                 <>
                   <Link href="/user/dashboard" onClick={() => setMenuOpen(false)} className="block p-3 bg-white/5 rounded-xl font-bold text-slate-200 hover:bg-white/10 transition border border-white/5">
                     <div className="flex items-center gap-3">
                       <LayoutDashboard size={18} className="text-blue-400"/> Creator Dashboard
                     </div>
                   </Link>
                   <Link href="/user/upload" onClick={() => setMenuOpen(false)} className="block p-3 bg-white/5 rounded-xl font-bold text-slate-200 hover:bg-white/10 transition border border-white/5">
                     <div className="flex items-center gap-3">
                       <UploadCloud size={18} className="text-primary"/> Submit a Logo
                     </div>
                   </Link>
                 </>
               )}

               {/* Auth Actions */}
               {user ? (
                 <button onClick={handleLogout} className="w-full text-left p-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition flex items-center gap-2 mt-2">
                   <LogOut size={18}/> Logout
                 </button>
               ) : (
                 <Link href="/auth" onClick={() => setMenuOpen(false)} className="block p-3 bg-primary text-white rounded-xl font-bold text-center shadow-lg shadow-primary/20">
                   Login / Sign Up
                 </Link>
               )}
             </div>
          </div>
        )}
      </nav>
    </div>
  );
}

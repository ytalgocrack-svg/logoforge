"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Search, Download, Star, ArrowRight, Zap, Play } from 'lucide-react';
import SocialPopup from '@/components/SocialPopup';
import Maintenance from '@/components/Maintenance';
import Auth from '@/app/auth/page'; 
import AdBanner from '@/components/AdBanner';
import ThemeSwitcher from '@/components/ThemeSwitcher'; // New Theme Switcher

export default function Home() {
  const [user, setUser] = useState(null);
  const [logos, setLogos] = useState([]);
  const [search, setSearch] = useState('');
  
  // Settings with defaults
  const [settings, setSettings] = useState({
    hero_title: 'Design Your Brand.',
    hero_subtitle: 'Premium assets for creators.',
    site_name: 'LogoForge',
    ad_banner_html: '',
    maintenance_mode: 'false'
  });
  
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    // 1. Check User
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    // 2. Fetch Settings
    const { data: settingsData } = await supabase.from('settings').select('*');
    const config = {};
    if (settingsData) settingsData.forEach(item => config[item.key] = item.value);
    setSettings(prev => ({ ...prev, ...config }));

    // 3. Check Admin Role for Maintenance Bypass
    let isAdmin = false;
    if (user) {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (data?.role === 'admin') isAdmin = true;
    }

    // 4. Handle Maintenance
    if (config.maintenance_mode === 'true' && !isAdmin) {
      setMaintenance(true);
      setLoading(false);
      return; 
    }

    // 5. Fetch Content (Only if logged in)
    if (user) {
      fetchLogos();
    } else {
      setLoading(false);
    }
  }

  async function fetchLogos() {
    let query = supabase.from('logos').select('*').eq('status', 'approved').order('created_at', { ascending: false });
    const { data } = await query;
    if (data) setLogos(data);
    setLoading(false);
  }

  async function handleSearch() {
    let query = supabase.from('logos').select('*').eq('status', 'approved').order('created_at', { ascending: false });
    if (search) query = query.ilike('title', `%${search}%`);
    const { data } = await query;
    if (data) setLogos(data);
  }

  // -- LOADING STATE --
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // -- MAINTENANCE SCREEN --
  if (maintenance) return <Maintenance />;

  // -- AUTH GATE (Login Required) --
  if (!user) {
    return <Auth />;
  }

  // -- MAIN DASHBOARD --
  return (
    <main className="min-h-screen bg-[#0f172a] text-white selection:bg-primary selection:text-white">
      <Navbar />
      <ThemeSwitcher /> {/* Floating Color Picker */}
      {settings && <SocialPopup settings={settings} />}
      
      {/* Dynamic Ad Banner */}
      <AdBanner code={settings.ad_banner_html} />

      {/* HERO SECTION */}
      <div className="relative pt-10 pb-20 px-4 overflow-hidden">
        {/* Background Glows (Fixed colors for aesthetics) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg pointer-events-none opacity-40">
           <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
           <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wide mb-6">
            <Zap size={14} className="fill-primary"/> #1 Source for Designers
          </div>

          {/* Dynamic Hero Title */}
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-white drop-shadow-lg">
            {settings.hero_title}
          </h1>
          
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            {settings.hero_subtitle}
          </p>
          
          {/* Glass Search Bar */}
          <div className="max-w-md mx-auto relative group">
            <div className="absolute inset-0 bg-primary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative flex items-center bg-white/5 backdrop-blur-xl rounded-full border border-white/10 p-1.5">
              <input 
                type="text" 
                placeholder="Search assets (e.g. Gaming)..." 
                className="w-full p-3 bg-transparent outline-none text-white placeholder:text-slate-500 pl-4 font-medium"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch} 
                className="bg-primary text-white p-3 rounded-full hover:brightness-110 transition shadow-lg shadow-primary/20"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ASSETS GRID */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20 relative z-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" size={20}/> Latest Assets
          </h2>
          <Link 
            href="/user/upload" 
            className="text-sm font-bold text-primary hover:text-white flex items-center gap-1 transition-colors"
          >
            Submit Your Logo <ArrowRight size={14}/>
          </Link>
        </div>

        {logos.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No logos found. Be the first to upload!</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {logos.map((logo) => (
              <Link key={logo.id} href={`/view?id=${logo.id}`}>
                <div className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 cursor-pointer">
                  
                  {/* Image Area */}
                  <div className="aspect-square bg-black/20 flex items-center justify-center p-6 relative overflow-hidden">
                     {/* Background Grid Pattern */}
                     <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:14px_14px]"></div>
                     
                     <img 
                       src={logo.url_png} 
                       alt={logo.title} 
                       className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500 relative z-10" 
                     />
                  </div>

                  {/* Details Area */}
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-slate-200 mb-2 truncate group-hover:text-primary transition-colors">{logo.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-400 uppercase tracking-wide">
                        {logo.category}
                      </span>
                      <Download size={14} className="text-slate-500 group-hover:text-primary transition" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

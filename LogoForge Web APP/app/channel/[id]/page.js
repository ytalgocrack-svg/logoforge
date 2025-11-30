"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Share2, MapPin, Calendar, LayoutGrid } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ChannelPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannel();
  }, [id]);

  async function fetchChannel() {
    // 1. Get Profile
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).single();
    setProfile(profileData);

    // 2. Get User's Approved Logos
    const { data: logoData } = await supabase.from('logos').select('*').eq('uploader_id', id).eq('status', 'approved').order('created_at', { ascending: false });
    setLogos(logoData || []);
    setLoading(false);
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Channel link copied to clipboard!");
  }

  if(loading) return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading Channel...</div>;
  if(!profile) return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Channel Not Found</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      {/* 1. CHANNEL BANNER */}
      <div className="w-full h-48 md:h-64 bg-slate-800 relative">
        {profile.banner_url && <img src={profile.banner_url} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-80"></div>
      </div>

      {/* 2. CHANNEL HEADER */}
      <div className="max-w-7xl mx-auto px-6 relative -mt-16 mb-10">
        <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
          
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-[#0f172a] overflow-hidden bg-slate-700 shadow-2xl">
             <img src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.email}`} className="w-full h-full object-cover"/>
          </div>

          {/* Info */}
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-bold">{profile.display_name || "Unnamed Channel"}</h1>
            <p className="text-slate-400 max-w-2xl mt-1 text-sm">{profile.bio || "No bio yet."}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-4">
             <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition">
               <Share2 size={16}/> Share Channel
             </button>
          </div>
        </div>
      </div>

      {/* 3. UPLOADS GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
           <LayoutGrid size={20} className="text-primary"/>
           <h2 className="font-bold text-lg">Uploads ({logos.length})</h2>
        </div>

        {logos.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
             <p className="text-slate-500">This user hasn't uploaded any public assets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {logos.map((logo) => (
              <Link key={logo.id} href={`/view?id=${logo.id}`}>
                <div className="group bg-white/5 rounded-xl border border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-300">
                  <div className="aspect-square p-4 flex items-center justify-center bg-black/20">
                    <img src={logo.url_png} className="w-full h-full object-contain group-hover:scale-110 transition"/>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm truncate">{logo.title}</h3>
                    <p className="text-xs text-slate-500">{new Date(logo.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

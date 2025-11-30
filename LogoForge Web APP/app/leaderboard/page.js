"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Trophy, Download, Eye, Crown } from 'lucide-react';
import Link from 'next/link';

export default function Leaderboard() {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    supabase.from('leaderboard').select('*').limit(20).then(({data}) => setCreators(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-extrabold mb-2 text-yellow-400 flex justify-center items-center gap-3"><Crown size={40}/> Top Creators</h1>
           <p className="text-slate-400">Ranking based on downloads & views.</p>
        </div>

        <div className="space-y-4">
           {creators.map((c, index) => (
             <div key={c.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition group">
                <div className="flex items-center gap-6">
                   <div className={`text-2xl font-black w-8 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-600'}`}>#{index + 1}</div>
                   <img src={c.avatar_url || `https://ui-avatars.com/api/?name=${c.display_name}`} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
                   <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {c.display_name} 
                        {c.is_verified && <CheckCircle className="text-blue-500 w-4 h-4"/>}
                      </h3>
                      <p className="text-slate-400 text-xs">{c.uploads} Uploads</p>
                   </div>
                </div>
                <div className="flex gap-6 text-sm text-slate-300">
                   <div className="text-center"><p className="font-bold text-white">{c.total_downloads}</p><p className="text-[10px] uppercase">Downloads</p></div>
                   <div className="text-center"><p className="font-bold text-white">{c.total_views}</p><p className="text-[10px] uppercase">Views</p></div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

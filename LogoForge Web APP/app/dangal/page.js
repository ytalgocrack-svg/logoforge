"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Trophy, UploadCloud, Heart, Clock } from 'lucide-react';

export default function DesignDangal() {
  const [contest, setContest] = useState({ title: '', tag: '', banner: '' });
  const [entries, setEntries] = useState([]);
  
  useEffect(() => {
    fetchContest();
  }, []);

  async function fetchContest() {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const config = {};
      data.forEach(item => config[item.key] = item.value);
      setContest({
        title: config.active_contest_title,
        tag: config.active_contest_tag,
        banner: config.active_contest_banner
      });
      
      // Fetch Entries for this tag
      if (config.active_contest_tag) {
        // We filter logs where category or description contains the tag
        const { data: entryData } = await supabase.from('logos')
          .select('*, profiles(display_name, avatar_url)')
          .ilike('category', `%${config.active_contest_tag}%`) // Using category to store contest tag
          .order('downloads', { ascending: false }); // Most downloads = Winner
        setEntries(entryData || []);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />
      
      {/* BANNER */}
      <div className="relative w-full h-64 bg-gradient-to-r from-red-900 to-purple-900 flex items-center justify-center overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
         <div className="relative z-10 text-center p-4">
            <div className="inline-flex items-center gap-2 bg-yellow-500 text-black font-black px-4 py-1 rounded-full text-sm uppercase mb-4 animate-bounce">
               <Trophy size={16}/> Live Contest
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">{contest.title}</h1>
            <p className="text-red-200 mt-2 font-bold">Upload with category: "{contest.tag}" to win!</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
         <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Clock size={24} className="text-red-500"/> Top Entries</h2>
            <Link href="/user/upload" className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 flex gap-2">
               <UploadCloud/> Join Dangal
            </Link>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {entries.map((logo, index) => (
               <Link key={logo.id} href={`/view?id=${logo.id}`}>
                  <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/50 transition">
                     {index === 0 && <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-black font-bold px-2 py-1 rounded text-xs">👑 #1 Rank</div>}
                     <div className="aspect-square bg-black/30 p-4 flex items-center justify-center">
                        <img src={logo.url_png} className="w-full h-full object-contain group-hover:scale-110 transition duration-500"/>
                     </div>
                     <div className="p-4 bg-white/5">
                        <h3 className="font-bold truncate">{logo.title}</h3>
                        <p className="text-xs text-slate-400">by {logo.profiles?.display_name}</p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-red-400 font-bold">
                           <Heart size={12} className="fill-red-400"/> {logo.downloads} Votes (Downloads)
                        </div>
                     </div>
                  </div>
               </Link>
            ))}
         </div>
      </div>
    </div>
  );
}

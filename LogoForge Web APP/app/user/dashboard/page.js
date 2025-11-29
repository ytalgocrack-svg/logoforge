"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Eye, Download, UploadCloud, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_views: 0,
    total_downloads_received: 0,
    upload_count: 0
  });
  const [myLogos, setMyLogos] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/');
    setUser(user);

    // Fetch My Uploads
    const { data } = await supabase.from('logos').select('*').eq('uploader_id', user.id).order('created_at', { ascending: false });
    
    if (data) {
      setMyLogos(data);
      // Calculate Stats
      const views = data.reduce((acc, curr) => acc + (curr.views || 0), 0);
      const downloads = data.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
      setStats({
        total_views: views,
        total_downloads_received: downloads,
        upload_count: data.length
      });
    }
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading Stats...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
                <p className="text-slate-400">Track the performance of your assets.</p>
            </div>
            <button onClick={() => router.push('/user/upload')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                <UploadCloud size={20}/> Upload New Asset
            </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-blue-400">
                    <TrendingUp size={24}/>
                    <span className="font-bold uppercase text-xs tracking-wider">Total Views</span>
                </div>
                <h2 className="text-4xl font-extrabold">{stats.total_views}</h2>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-green-400">
                    <Download size={24}/>
                    <span className="font-bold uppercase text-xs tracking-wider">Downloads Received</span>
                </div>
                <h2 className="text-4xl font-extrabold">{stats.total_downloads_received}</h2>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-purple-400">
                    <UploadCloud size={24}/>
                    <span className="font-bold uppercase text-xs tracking-wider">Total Uploads</span>
                </div>
                <h2 className="text-4xl font-extrabold">{stats.upload_count}</h2>
            </div>
        </div>

        {/* My Logos List */}
        <h3 className="text-xl font-bold mb-4">My Uploads History</h3>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-4 text-sm font-bold text-slate-400">Asset</th>
                            <th className="p-4 text-sm font-bold text-slate-400">Status</th>
                            <th className="p-4 text-sm font-bold text-slate-400">Views</th>
                            <th className="p-4 text-sm font-bold text-slate-400">Downloads</th>
                            <th className="p-4 text-sm font-bold text-slate-400 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {myLogos.map((logo) => (
                            <tr key={logo.id} className="hover:bg-white/5 transition">
                                <td className="p-4 flex items-center gap-3">
                                    <img src={logo.url_png} className="w-10 h-10 rounded bg-black/20 object-cover" />
                                    <span className="font-bold text-sm truncate max-w-[150px]">{logo.title}</span>
                                </td>
                                <td className="p-4">
                                    {logo.status === 'approved' && <span className="flex items-center gap-1 text-xs text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded"><CheckCircle size={12}/> Live</span>}
                                    {logo.status === 'pending' && <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded"><Clock size={12}/> Review</span>}
                                    {logo.status === 'rejected' && <span className="flex items-center gap-1 text-xs text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded"><XCircle size={12}/> Rejected</span>}
                                </td>
                                <td className="p-4 font-mono text-slate-300">{logo.views}</td>
                                <td className="p-4 font-mono text-slate-300">{logo.downloads}</td>
                                <td className="p-4 text-right text-xs text-slate-500">{new Date(logo.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}


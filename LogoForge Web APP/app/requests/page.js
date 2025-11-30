"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { MessageSquarePlus, CheckCircle, Clock } from 'lucide-react';

export default function RequestZone() {
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({ title: '', description: '' });
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({data}) => setUser(data.user));
    fetchRequests();
  }, []);

  async function fetchRequests() {
    const { data } = await supabase.from('requests').select('*, profiles(display_name, avatar_url)').order('created_at', { ascending: false });
    setRequests(data || []);
  }

  async function submitRequest() {
    if(!newRequest.title) return alert("Title required");
    await supabase.from('requests').insert({ ...newRequest, requester_id: user.id });
    setShowModal(false);
    fetchRequests();
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Request Zone</h1>
            <p className="text-slate-400">Can't find a logo? Ask the community.</p>
          </div>
          <button onClick={() => user ? setShowModal(true) : alert("Login to post")} className="bg-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition shadow-lg">
            + New Request
          </button>
        </div>

        <div className="grid gap-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-white/20 transition flex justify-between items-center">
               <div className="flex items-start gap-4">
                  <img src={req.profiles?.avatar_url || 'https://ui-avatars.com/api/?background=random'} className="w-12 h-12 rounded-full border-2 border-white/10" />
                  <div>
                     <h3 className="font-bold text-lg">{req.title}</h3>
                     <p className="text-slate-400 text-sm">{req.description}</p>
                     <p className="text-xs text-slate-500 mt-2">Requested by {req.profiles?.display_name}</p>
                  </div>
               </div>
               <div className="text-right">
                  {req.status === 'open' ? (
                    <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14}/> Open</span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle size={14}/> Solved</span>
                  )}
               </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
             <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md border border-white/20">
                <h2 className="text-xl font-bold mb-4">Post a Request</h2>
                <input className="w-full bg-black/30 border border-white/10 p-3 rounded-lg mb-3 text-white" placeholder="Title (e.g. PUBG Banner)" onChange={e => setNewRequest({...newRequest, title: e.target.value})} />
                <textarea className="w-full bg-black/30 border border-white/10 p-3 rounded-lg mb-4 text-white h-24" placeholder="Describe what you need..." onChange={e => setNewRequest({...newRequest, description: e.target.value})} />
                <button onClick={submitRequest} className="w-full bg-primary py-3 rounded-lg font-bold">Post Request</button>
                <button onClick={() => setShowModal(false)} className="w-full mt-2 text-slate-400 text-sm">Cancel</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

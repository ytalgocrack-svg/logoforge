"use client";
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

function EditLogoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '' });

  useEffect(() => {
    checkAdmin();
  }, [id]);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/');
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (data?.role !== 'admin') return router.push('/');
    
    fetchLogo();
  }

  async function fetchLogo() {
    const { data, error } = await supabase.from('logos').select('*').eq('id', id).single();
    if (error) {
      alert('Logo not found');
      router.push('/admin');
    } else {
      setForm({ title: data.title, category: data.category, description: data.description });
      setLoading(false);
    }
  }

  async function handleUpdate() {
    setSaving(true);
    const { error } = await supabase.from('logos').update({
      title: form.title,
      description: form.description,
      category: form.category
    }).eq('id', id);

    if (error) alert(error.message);
    else {
      alert('Logo updated successfully!');
      router.push('/admin');
    }
    setSaving(false);
  }

  if (loading) return <div className="p-10 text-center">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-8 my-10 bg-white rounded-3xl shadow-xl">
        <button onClick={() => router.push('/admin')} className="flex items-center text-slate-500 mb-6 hover:text-blue-600">
          <ArrowLeft size={20} className="mr-2"/> Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-8 text-slate-800">Edit Logo Details</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block font-semibold mb-2 text-slate-700">Logo Title</label>
            <input 
              className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 outline-none" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
            />
          </div>

          <div>
             <label className="block font-semibold mb-2 text-slate-700">Description</label>
             <textarea 
               className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 outline-none h-32" 
               value={form.description || ''} 
               onChange={e => setForm({...form, description: e.target.value})} 
             />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-slate-700">Category</label>
            <select 
              className="w-full border-2 border-slate-200 p-3 rounded-xl bg-white" 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
            >
              <option>Abstract</option>
              <option>Technology</option>
              <option>Food</option>
              <option>Sports</option>
              <option>Gaming</option>
              <option>Education</option>
            </select>
          </div>

          <button 
            onClick={handleUpdate} 
            disabled={saving}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl hover:bg-emerald-700 font-bold text-lg flex items-center justify-center gap-2 transition"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditLogo() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditLogoContent />
    </Suspense>
  )
}

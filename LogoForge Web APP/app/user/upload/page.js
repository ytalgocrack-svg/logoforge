"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon, Youtube, Sparkles, Box } from 'lucide-react';

export default function UserUpload() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({ 
    title: '', 
    category: '', 
    description: '', 
    xml_link: '',
    youtube_url: '',
    ai_prompt: '' 
  });
  
  const [files, setFiles] = useState({ image: null, plp: null, xml: null });

  useEffect(() => {
    supabase.auth.getUser().then(({data}) => {
      if(!data.user) router.push('/auth');
      setUser(data.user);
    });
  }, []);

  const handleUpload = async () => {
    if (!files.image) return alert("Main Image is required!");
    if (!form.title || !form.category) return alert("Title and Category are required!");
    
    setUploading(true);
    const timestamp = Date.now();

    const uploadFile = async (file) => {
      if (!file) return null;
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
      const path = `uploads/${user.id}/${timestamp}_${cleanName}`;
      const { error } = await supabase.storage.from('assets').upload(path, file);
      if (error) { console.error(error); return null; }
      const { data } = supabase.storage.from('assets').getPublicUrl(path);
      return data.publicUrl;
    };

    try {
      const imageUrl = await uploadFile(files.image);
      const plpUrl = await uploadFile(files.plp);
      let xmlUrl = await uploadFile(files.xml);
      if (!xmlUrl && form.xml_link) xmlUrl = form.xml_link;

      const { error } = await supabase.from('logos').insert({
        title: form.title,
        description: form.description,
        category: form.category,
        url_png: imageUrl,
        url_plp: plpUrl,
        url_xml: xmlUrl,
        youtube_url: form.youtube_url,
        ai_prompt: form.ai_prompt,
        uploader_id: user.id,
        status: 'pending'
      });

      if (error) throw error;
      alert('Success! Your upload is pending approval.');
      router.push('/');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 md:p-10 my-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
           <UploadCloud className="text-blue-500"/> Submit Asset
        </h1>
        <p className="text-slate-400 mb-8 text-sm">Share Logos, AI Prompts, or Asset Packs.</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Title</label>
            <input className="w-full bg-black/20 border border-white/10 p-3 rounded-xl focus:border-blue-500 outline-none text-white" placeholder="e.g. Neon Gaming Banner" onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Category</label>
            <input 
              list="categories" 
              className="w-full bg-black/20 border border-white/10 p-3 rounded-xl focus:border-blue-500 outline-none text-white" 
              placeholder="Select or type..." 
              onChange={e => setForm({...form, category: e.target.value})} 
            />
            <datalist id="categories">
              <option value="Gaming" />
              <option value="Abstract" />
              <option value="Typography" />
              <option value="AI-Art" />
              <option value="Asset-Pack" />
            </datalist>
          </div>

          {/* Conditional Input for AI Art */}
          {form.category === 'AI-Art' && (
            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/30">
                <label className="block text-sm font-bold text-purple-300 mb-2 flex items-center gap-2"><Sparkles size={16}/> AI Text Prompt</label>
                <textarea 
                className="w-full bg-black/20 border border-white/10 p-3 rounded-xl focus:border-purple-500 outline-none text-white h-24 font-mono text-sm" 
                placeholder="e.g. Cyberpunk samurai, neon lights, 8k render..." 
                onChange={e => setForm({...form, ai_prompt: e.target.value})} 
                />
            </div>
          )}

          <div>
             <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
             <textarea className="w-full bg-black/20 border border-white/10 p-3 rounded-xl focus:border-blue-500 outline-none h-24 text-white" placeholder="Optional details..." onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          {/* YouTube Link */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">YouTube Tutorial (Optional)</label>
            <div className="flex items-center gap-3 bg-black/20 border border-white/10 p-3 rounded-xl">
                <Youtube size={20} className="text-red-500"/>
                <input 
                className="bg-transparent outline-none w-full text-white" 
                placeholder="https://youtube.com/watch?v=..." 
                onChange={e => setForm({...form, youtube_url: e.target.value})} 
                />
            </div>
          </div>

          <div className="grid gap-4">
            {/* Image */}
            <label className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition ${files.image ? 'border-green-500 bg-green-500/10' : 'border-white/20 hover:border-white/40'}`}>
              <span className="block font-bold text-sm mb-1">Main Image (JPG/PNG) *</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setFiles({...files, image: e.target.files[0]})} />
              <span className="text-xs text-slate-400">{files.image ? files.image.name : "Tap to upload"}</span>
            </label>

            {/* PLP */}
            <label className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition ${files.plp ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-white/40'}`}>
              <span className="block font-bold text-sm mb-1">PixelLab File (.PLP)</span>
              <input type="file" className="hidden" onChange={e => setFiles({...files, plp: e.target.files[0]})} />
              <span className="text-xs text-slate-400">{files.plp ? files.plp.name : "Optional"}</span>
            </label>

            {/* XML/Link */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/20">
              <span className="block font-bold text-sm mb-2 text-purple-400">XML / Asset Link</span>
              <input className="w-full bg-black/20 border border-white/10 p-2 rounded-lg text-sm text-white mb-2" placeholder="Google Drive / MediaFire Link" onChange={e => setForm({...form, xml_link: e.target.value})} />
              <div className="text-center text-xs text-slate-500 my-1">- OR -</div>
              <label className="block text-center cursor-pointer text-xs text-blue-400 hover:underline">
                 <input type="file" className="hidden" onChange={e => setFiles({...files, xml: e.target.files[0]})} />
                 {files.xml ? "File Selected: " + files.xml.name : "Upload XML File"}
              </label>
            </div>
          </div>

          <button onClick={handleUpload} disabled={uploading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition">
            {uploading ? 'Uploading...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

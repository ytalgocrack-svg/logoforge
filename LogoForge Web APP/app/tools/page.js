"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Palette, Type } from 'lucide-react';

export default function Tools() {
  const [activeTool, setActiveTool] = useState('font');
  const [previewText, setPreviewText] = useState('EditorsAdda');
  const [color, setColor] = useState('#2563eb');

  const fonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Designer Tools</h1>
        
        <div className="flex gap-4 mb-8">
           <button onClick={() => setActiveTool('font')} className={`px-6 py-3 rounded-xl font-bold flex gap-2 ${activeTool === 'font' ? 'bg-primary' : 'bg-white/5'}`}><Type/> Font Tester</button>
           <button onClick={() => setActiveTool('color')} className={`px-6 py-3 rounded-xl font-bold flex gap-2 ${activeTool === 'color' ? 'bg-primary' : 'bg-white/5'}`}><Palette/> Color Picker</button>
        </div>

        {activeTool === 'font' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                 <label className="block text-sm font-bold mb-2">Type your text</label>
                 <input className="w-full bg-black/30 border border-white/10 p-3 rounded-xl text-white outline-none" value={previewText} onChange={e => setPreviewText(e.target.value)} />
              </div>
              <div className="space-y-4">
                 {fonts.map(font => (
                    <div key={font} className="bg-white p-4 rounded-xl text-slate-900 text-2xl border border-slate-200" style={{ fontFamily: font }}>
                       {previewText}
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTool === 'color' && (
           <div className="flex flex-col items-center bg-white/5 p-10 rounded-3xl border border-white/10">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-32 h-32 rounded-full cursor-pointer border-4 border-white/20 mb-6 bg-transparent" />
              <h2 className="text-4xl font-mono font-bold">{color}</h2>
              <p className="text-slate-400 mt-2">Click circle to pick a color</p>
           </div>
        )}
      </div>
    </div>
  );
}

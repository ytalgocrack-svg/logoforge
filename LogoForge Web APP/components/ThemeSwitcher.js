"use client";
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Palette, X } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    { name: 'blue', hex: '#2563eb', label: 'Classic Blue' },
    { name: 'purple', hex: '#9333ea', label: 'Royal Purple' },
    { name: 'emerald', hex: '#10b981', label: 'Fresh Green' },
    { name: 'rose', hex: '#e11d48', label: 'Rose Red' },
    { name: 'orange', hex: '#f97316', label: 'Sunset Orange' },
    { name: 'cyan', hex: '#06b6d4', label: 'Cyber Cyan' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* The Palette Menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 w-64 animate-bounce-in mb-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-slate-800 font-bold text-sm">Site Theme</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => changeTheme(c.name)}
                className={`w-full h-10 rounded-lg border-2 transition transform active:scale-95 ${
                  theme === c.name ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
        </div>
      )}

      {/* The Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white p-4 rounded-full shadow-lg hover:brightness-110 transition-all duration-300 hover:rotate-12"
      >
        <Palette size={24} />
      </button>
    </div>
  );
}

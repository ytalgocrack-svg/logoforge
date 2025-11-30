"use client";
import { useEffect, useState } from 'react';
import { X, Send, Youtube, ExternalLink } from 'lucide-react';

export default function SocialPopup({ settings }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Safety check: if settings is missing, don't run
    if (!settings) return;

    const sessionClosed = sessionStorage.getItem('popup_closed');
    if (settings.popup_enabled === 'true' && !sessionClosed) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('popup_closed', 'true');
  };

  if (!isOpen || !settings) return null;

  // Helper: Collect all valid telegram channels
  // We use a safe check to ensure settings exist before accessing properties
  const telegramChannels = [1, 2, 3, 4, 5].map(num => ({
    label: settings[`telegram_label_${num}`] || `Channel ${num}`,
    link: settings[`telegram_link_${num}`]
  })).filter(channel => channel.link && channel.link.trim().length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative animate-bounce-in flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Join Our Community!</h2>
          <p className="text-sm text-slate-500">
            Don't miss out on exclusive assets, daily updates, and premium giveaways.
          </p>
        </div>
        
        {/* Scrollable Area for Buttons */}
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Telegram Channels Loop */}
          {telegramChannels.map((channel, index) => (
            <a 
              key={index}
              href={channel.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition group border border-blue-100"
            >
              <span className="flex items-center gap-3">
                <Send size={20} className="group-hover:-translate-y-1 transition-transform"/> 
                {channel.label}
              </span>
              <ExternalLink size={16} className="opacity-50 group-hover:opacity-100"/>
            </a>
          ))}

          {/* YouTube (Existing) */}
          {settings.youtube_link && settings.youtube_link.length > 0 && (
            <a 
              href={settings.youtube_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition group border border-red-100"
            >
              <span className="flex items-center gap-3">
                <Youtube size={20} className="group-hover:-translate-y-1 transition-transform"/> 
                Subscribe YouTube
              </span>
              <ExternalLink size={16} className="opacity-50 group-hover:opacity-100"/>
            </a>
          )}
        </div>

        <div className="mt-4 text-center">
            <button onClick={handleClose} className="text-xs text-slate-400 hover:text-slate-600 underline">
                No thanks, I'll join later
            </button>
        </div>

      </div>
    </div>
  );
}
